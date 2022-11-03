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

const getStripeCustomerPaymentMethods = async (stripeId) => {
  const paymentMethods = await stripe.customers.listPaymentMethods(stripeId, { type: "card" });

  return paymentMethods.data;
};

const createStripeCustomer = async ({ name, email }) => {
  const stripeCustomer = await stripe.customers.create({
    email,
    name,
  });
  // also save in DB
  await models.Customer.update(
    {
      stripeId: stripeCustomer.id,
    },
    {
      where: { email },
    }
  );

  return stripeCustomer.id;
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
                  model: models.Customer,
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

  show: async (req, res) => {
    const { email } = req.user;
    const orderId = req.params.orderId;

    console.log("ORDERID", orderId);

    try {
      const order = await models.Order.findOne({
        where: { id: orderId },
        include: [
          {
            model: models.OrderDetail,
            include: [{ model: models.Product }],
          },
          {
            model: models.Customer,
            attributes: ["name", "email"],
          },
          {
            model: models.Merchant,
            attributes: ["name", "email"],
          },
        ],
      });
      console.log("ORDER", order);
      if (!order || (order.Customer.email !== email && order.Merchant.email !== email)) {
        return res.status(404).json({ error: "Order not found!" });
      }

      return res.status(200).json({ order });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },

  updateStatus: async (req, res) => {
    const orderId = req.params.orderId;
    console.log("ORDER ID BACKEND", orderId);
    try {
      await models.Order.update(
        {
          status: req.body.status,
        },
        {
          where: { id: orderId },
        }
      );
      return res.status(200).json({});
    } catch (err) {
      return res.status(500).json({ error: `Failed to update order status. ${err.message}` });
    }
  },

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
            error: `Error adding item - existing product with merchant in cart. ${err.message}`,
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
            error: `Error removing item - no further product with merchant. ${err.message}`,
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
            error: `Error removing item - existing other product with merchant in cart. ${err.message}`,
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
      return res.status(500).json({ error: `Failed to update order details based on stock. ${err.message}` });
    }

    try {
      const updatedCart = await getCustomerCart(req.user.email);
      return res.status(200).json({ updatedCart, removedProducts });
    } catch (err) {
      return res.status(500).json({ error: `Failed to get updated cart. ${err.message}` });
    }
  },

  createStripePaymentIntent: async (req, res) => {
    const { total, orderIds } = req.body;
    const customer = await models.Customer.findOne({
      where: { email: req.user.email },
    });

    let customerStripeId = customer.stripeId;
    if (customer.stripeId === "") {
      customerStripeId = await createStripeCustomer(req.user);
    }
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        customer: customerStripeId,
        amount: total,
        currency: "sgd",
        metadata: { orderIds: orderIds.toString() },
        setup_future_usage: "on_session",
        automatic_payment_methods: {
          enabled: true,
        },
      });
      const paymentMethods = await getStripeCustomerPaymentMethods(customerStripeId);
      return res.status(201).json({
        clientSecret: paymentIntent.client_secret,
        paymentMethods: paymentMethods,
      });
    } catch (err) {
      return res.status(502).json({
        error: `Error creating stripe payment intent. ${err.message}`,
      });
    }
  },

  updatePaymentStatus: async (req, res) => {
    // get user cart
    const cart = await getCustomerCart(req.user.email);
    const changesNeededToProducts = getChangesNeededToProducts(cart);

    try {
      await Promise.all(
        cart.map(async (order) => {
          await order.update({ isPaid: true, status: "preparing" });
        })
      );
    } catch (err) {
      return res.status(500).json({
        error: `Error updating payment status. ${err.message}`,
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
        error: `Error updating product stock. ${err.message}`,
      });
    }
    return res.status(200).json({});
  },
};

module.exports = controller;
