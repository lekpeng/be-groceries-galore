const { Sequelize } = require("sequelize");

const orders = [
  {
    isPaid: true,
    deliveryAddress: "4 Privet Drive, Little Whinging",
    status: "packing",
    CustomerId: 1,
    MerchantId: 1,
    paidAt: Sequelize.fn("now"),
  },
  {
    isPaid: true,
    deliveryAddress: "4 Privet Drive, Little Whinging",
    status: "shipping",
    CustomerId: 1,
    MerchantId: 2,
    paidAt: Sequelize.fn("now"),
  },
  {
    deliveryAddress: "4 Privet Drive, Little Whinging",
    CustomerId: 1,
    MerchantId: 3,
  },

  {
    deliveryAddress: "4 Privet Drive, Little Whinging",
    CustomerId: 1,
    MerchantId: 2,
  },
];

module.exports = orders;
