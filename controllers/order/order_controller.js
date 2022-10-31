const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const models = require("../../models");

const getCustomerWithCartInfo = async (email) => {
  const customer = await models.Customer.findOne({
    where: {
      email,
    },
    include: [
      {
        model: models.Order,
        where: {
          isPaid: false,
        },
        separate: true,
        order: ["createdAt"],
        include: [
          {
            model: models.OrderDetail,
            include: [{ model: models.Product }],
            separate: true,
            order: ["createdAt"],
          },
          {
            model: models.Merchant,
            attributes: ["name"],
          },
        ],
      },
    ],
  });
  return customer;
};

const getCustomerCart = async (email) => {
  const customerWithCartInfo = await getCustomerWithCartInfo(email);
  return customerWithCartInfo.Orders;
};

const getChangesNeededToProducts = (cart) => {
  const changes = {};
  for (const order of cart) {
    for (const orderDetail of order.OrderDetails) {
      changes[orderDetail.ProductId] = orderDetail.productQuantity;
    }
  }
  return changes;
};

const updateOrderDetailsBasedOnStock = async (cart) => {
  const productsRemoved = [];
  for (const order of cart) {
    for (const orderDetail of order.OrderDetails) {
      if (orderDetail.Product.quantity === 0) {
        productsRemoved.push(orderDetail.Product);
        await orderDetail.destroy();
      }
    }
    const updatedOrder = await models.Order.findOne({
      where: { id: order.id },
      include: { model: models.OrderDetail },
    });
    if (updatedOrder.OrderDetails.length === 0) {
      await updatedOrder.destroy();
    }
  }
  return productsRemoved;
};

const controller = {
  index: async (req, res) => {
    const { userType, email } = req.user;
    let user = null;

    try {
      if (userType === "Merchant") {
        user = await models[userType].findOne({
          where: {
            email,
          },
          include: [
            {
              model: models.Order,
              require: false,
              include: [
                {
                  model: models.OrderDetail,
                  include: [{ model: models.Product }],
                },
                {
                  model: models.Merchant,
                  attributes: ["name"],
                },
              ],
            },
          ],
        });
      } else if ("/cart" === req.url) {
        user = await getCustomerWithCartInfo(email);
      } else {
        user = await models[userType].findOne({
          where: {
            email,
          },
          include: [
            {
              model: models.Order,
              where: {
                isPaid: true,
              },
              required: false,
              include: [
                {
                  model: models.OrderDetail,
                  include: [{ model: models.Product }],
                },
                {
                  model: models.Merchant,
                  attributes: ["name"],
                },
              ],
            },
          ],
        });
      }

      if (!user) {
        return res.status(404).json({ error: `${userType} with email ${email} not found` });
      }

      return res.status(200).json({ orders: user.Orders });
    } catch (err) {
      return res.status(500).json({ error: "Failed to get orders." });
    }
  },

  // create: async (req, res) => {
  //   const { order } = req.body;
  //   try {
  //     models.Order.create(order);
  //     return res.status(201).json({});
  //   } catch (err) {
  //     return res.status(500).json({ error: err });
  //   }
  // },
  addItem: async (req, res) => {
    const customerWithCartInfo = await getCustomerWithCartInfo(req.user.email);
    const cart = await getCustomerCart(req.user.email);
    const { product, customerProductQuantity } = req.body;

    // check if there is an existing order with product's merchant
    const existingOrderWithMerchant = cart?.find((order) => order.MerchantId === product.MerchantId);
    if (!existingOrderWithMerchant) {
      // create order and order detail
      try {
        const newOrder = await models.Order.create({
          deliveryAddress: customerWithCartInfo.address,
          status: "",
          CustomerId: customerWithCartInfo.id,
          MerchantId: product.MerchantId,
        });

        await models.OrderDetail.create({
          productPrice: product.price,
          productQuantity: customerProductQuantity,
          OrderId: newOrder.id,
          ProductId: product.id,
        });
      } catch (err) {
        return res.status(500).json({ error: `Error adding item - no existing order with merchant in cart.` });
      }
    } else {
      // check if the product exists in the user's cart
      const getExistingOrderDetailInOrder = (order) =>
        order?.OrderDetails.find((orderDetail) => orderDetail.ProductId === product.id);

      const existingOrderDetailInOrder = getExistingOrderDetailInOrder(existingOrderWithMerchant);

      if (!existingOrderDetailInOrder) {
        // create order detail
        try {
          await models.OrderDetail.create({
            productPrice: product.price,
            productQuantity: customerProductQuantity,
            OrderId: existingOrderWithMerchant.id,
            ProductId: product.id,
          });
        } catch (err) {
          return res.status(500).json({
            error: `Error adding item - no existing product but existing order with merchant in cart.`,
          });
        }
      } else {
        // update order detail
        try {
          await models.OrderDetail.update(
            {
              productQuantity: customerProductQuantity,
            },
            {
              where: { id: existingOrderDetailInOrder.id },
            }
          );
        } catch (err) {
          return res.status(500).json({
            error: `Error adding item - existing product with merchant in cart.`,
          });
        }
      }
    }
    const customerWithUpdatedCartInfo = await getCustomerWithCartInfo(req.user.email);
    return res.status(200).json({ orders: customerWithUpdatedCartInfo.Orders });
  },

  removeItem: async (req, res) => {
    const { product, customerProductQuantity } = req.body;
    const cart = await getCustomerCart(req.user.email);
    const existingOrderWithMerchant = cart?.find((order) => order.MerchantId === product.MerchantId);

    if (!existingOrderWithMerchant) {
      return res.status(200).json({ orders: cart });
    }

    const existingOrderDetail = existingOrderWithMerchant.OrderDetails.find(
      (orderDetail) => orderDetail.ProductId === product.id
    );

    // check if new quantity is 0
    if (customerProductQuantity > 0) {
      // update order detail
      try {
        await models.OrderDetail.update(
          {
            productQuantity: customerProductQuantity,
          },
          {
            where: { id: existingOrderDetail.id },
          }
        );
      } catch (err) {
        return res.status(500).json({ error: `Error removing item - decrement quantity to non-zero.` });
      }
    } else {
      // check if customer has other items from same merchant in the cart

      if (
        existingOrderWithMerchant.OrderDetails.length === 1 &&
        existingOrderWithMerchant.OrderDetails[0].ProductId === product.id
      ) {
        // delete order which cascades delete order detail
        try {
          await models.Order.destroy({
            where: {
              id: existingOrderWithMerchant.id,
            },
          });
        } catch (err) {
          return res.status(500).json({
            error: `Error removing item - no further product with merchant.`,
          });
        }
      } else {
        // delete order detail

        try {
          await models.OrderDetail.destroy({
            where: { ProductId: product.id },
          });
        } catch (err) {
          return res.status(500).json({
            error: `Error removing item - existing other product with merchant in cart.`,
          });
        }
      }
    }
    const customerWithUpdatedCartInfo = await getCustomerWithCartInfo(req.user.email);
    return res.status(200).json({ orders: customerWithUpdatedCartInfo.Orders });
  },

  checkCart: async (req, res) => {
    const cart = await getCustomerCart(req.user.email);
    let removedProducts = [];

    try {
      removedProducts = await updateOrderDetailsBasedOnStock(cart);
      if (!removedProducts.length) {
        return res.status(200).json({ updatedCart: cart, removedProducts });
      }
    } catch (err) {
      return res.status(500).json({ error: `Failed to update order details based on stock.` });
    }

    try {
      console.log("-----IN SECOND TRY BLOCK------");

      const updatedCart = await getCustomerCart(req.user.email);
      return res.status(200).json({ updatedCart, removedProducts });
    } catch (err) {
      return res.status(500).json({ error: `Failed to get updated cart.` });
    }
  },

  createStripePaymentIntent: async (req, res) => {
    const total = req.body.total;
    let paymentIntent;

    try {
      paymentIntent = await stripe.paymentIntents.create({
        amount: total,
        currency: "sgd",
      });
    } catch (err) {
      return res.status(502).json({
        error: `Error creating stripe payment intent.`,
      });
    }

    return res.status(201).json({
      clientSecret: paymentIntent.client_secret,
    });
  },

  updatePaymentStatus: async (req, res) => {
    // get user cart
    const cart = await getCustomerCart(req.user.email);
    const changesNeededToProducts = getChangesNeededToProducts(cart);

    try {
      await Promise.all(
        cart.map(async (order) => {
          await order.update({ isPaid: true });
        })
      );
    } catch (err) {
      return res.status(500).json({
        error: `Error updating payment status.`,
      });
    }

    // reduce product quantity for items in cart
    try {
      const productIds = Object.keys(changesNeededToProducts);
      await Promise.all(
        productIds.map(async (productId) => {
          const product = await models.Product.findOne({
            where: { id: productId },
          });
          await product.decrement({
            quantity: changesNeededToProducts[productId],
          });
        })
      );
    } catch (err) {
      return res.status(500).json({
        error: `Error updating product stock.`,
      });
    }
    return res.status(200).json({});
  },
};

module.exports = controller;
