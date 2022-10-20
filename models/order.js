const { DataTypes } = require("sequelize");
const order_details = require("./order_detail");
// We export a function that defines the model.
// This function will automatically receive as parameter the Sequelize connection object.
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
    },
  });

  // Order.associate = function (models) {
  //   // associations can be defined here
  //   Order.belongsTo(models.Customer);
  //   Order.belongsTo(models.Merchant);
  //   Order.hasMany(models.OrderDetail, { onDelete: "CASCADE" });
  // };
  return Order;
};
