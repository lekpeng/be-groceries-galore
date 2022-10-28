const models = require("../../models");

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
              ],
            },
          ],
        });
      } else if ("/cart" === req.url) {
        user = await models[userType].findOne({
          where: {
            email,
          },
          include: [
            {
              model: models.Order,
              where: {
                isPaid: false,
              },
              include: [
                {
                  model: models.OrderDetail,
                  include: [{ model: models.Product }],
                },
              ],
            },
          ],
        });
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
              ],
            },
          ],
        });
      }

      if (!user) {
        console.log("ERROR 404");
        return res.status(404).json({ error: `${userType} with email ${email} not found` });
      }

      console.log("USER ORDERS FR BE", user.Orders);
      return res.status(200).json({ orders: user.Orders });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ error: err });
    }
  },

  create: async (req, res) => {
    const { order } = req.body;
    try {
      models.Order.create(order);
      return res.status(201).json({});
    } catch (err) {
      return res.status(500).json({ error: err });
    }
  },
};

module.exports = controller;
