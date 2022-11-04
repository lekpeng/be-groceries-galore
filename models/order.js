const { DataTypes } = require("sequelize");
const order_details = require("./order_detail");
// We export a function that defines the model.
// This function will automatically receive as parameter the Sequelize connection object.

// status: "", "preparing", "shipping", "out on delivery", "delivered"
module.exports = (sequelize) => {
  const Order = sequelize.define("Order", {
    isPaid: {
      allowNull: false,
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },

    deliveryAddress: {
      allowNull: false,
      type: DataTypes.STRING,
    },

    status: {
      allowNull: false,
      type: DataTypes.STRING,
      defaultValue: "cart",
    },

    paidAt: {
      type: DataTypes.DATE,
    },
  });

  return Order;
};
