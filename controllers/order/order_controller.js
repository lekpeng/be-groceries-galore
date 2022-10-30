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
        console.log("ERROR 404");
        return res.status(404).json({ error: `${userType} with email ${email} not found` });
      }

      return res.status(200).json({ orders: user.Orders });
    } catch (err) {
      return res.status(500).json({ error: err });
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
    const cart = customerWithCartInfo.Orders;
    const { product, customerProductQuantity } = req.body;

    // check if there is an existing order with product's merchant
    const existingOrderWithMerchant = cart?.find((order) => order.MerchantId === product.MerchantId);
    if (!existingOrderWithMerchant) {
      console.log("NO EXISTING ORDER");
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
        return res.status(500).json({ error: `Error adding item - no existing order with merchant in cart: ${err}` });
      }
    } else {
      // check if the product exists in the user's cart
      const getExistingOrderDetailInOrder = (order) =>
        order?.OrderDetails.find((orderDetail) => orderDetail.ProductId === product.id);

      const existingOrderDetailInOrder = getExistingOrderDetailInOrder(existingOrderWithMerchant);

      if (!existingOrderDetailInOrder) {
        console.log("EXISTING ORDER BUT NOT EXISTING PRODUCT");

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
            error: `Error adding item - no existing product but existing order with merchant in cart: ${err}`,
          });
        }
      } else {
        console.log("EXISTING PRODUCT");
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
            error: `Error adding item - existing product with merchant in cart: ${err}`,
          });
        }
      }
    }
    const customerWithUpdatedCartInfo = await getCustomerWithCartInfo(req.user.email);
    return res.status(200).json({ orders: customerWithUpdatedCartInfo.Orders });
  },

  removeItem: async (req, res) => {
    const { product, customerProductQuantity } = req.body;
    const customerWithCartInfo = await getCustomerWithCartInfo(req.user.email);
    const cart = customerWithCartInfo.Orders;

    // check if new quantity is 0
    if (customerProductQuantity > 0) {
      console.log("DECREMENT QUANTITY");
      // update order detail
      try {
        await models.OrderDetail.update(
          {
            productQuantity: customerProductQuantity,
          },
          {
            where: { ProductId: product.id },
          }
        );
      } catch (err) {
        return res.status(500).json({ error: `Error removing item - decrement quantity to non-zero: ${err}` });
      }
    } else {
      // check if customer has other items from same merchant in the cart

      const existingOrderWithMerchant = cart?.find((order) => order.MerchantId === product.MerchantId);

      if (!existingOrderWithMerchant) {
        return res.status(200).json({ orders: customerWithCartInfo.Orders });
      }

      if (
        existingOrderWithMerchant.OrderDetails.length === 1 &&
        existingOrderWithMerchant.OrderDetails[0].ProductId === product.id
      ) {
        console.log("DELETE ORDER AND ORDER DETAIL");

        // delete order which cascades delete order detail
        try {
          await models.Order.destroy({
            where: {
              id: existingOrderWithMerchant.id,
            },
          });
        } catch (err) {
          return res.status(500).json({
            error: `Error removing item - no further product with merchant: ${err}`,
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
            error: `Error removing item - existing other product with merchant in cart: ${err}`,
          });
        }
      }
    }
    const customerWithUpdatedCartInfo = await getCustomerWithCartInfo(req.user.email);
    return res.status(200).json({ orders: customerWithUpdatedCartInfo.Orders });
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
        error: `Error creating stripe payment intent. ${err}`,
      });
    }

    return res.status(201).json({
      clientSecret: paymentIntent.client_secret,
    });
  },

  updatePaymentStatus: async (req, res) => {},
};

module.exports = controller;
