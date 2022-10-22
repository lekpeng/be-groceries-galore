const { DataTypes } = require("sequelize");
// We export a function that defines the model.
// This function will automatically receive as parameter the Sequelize connection object.
module.exports = (sequelize) => {
  const OrderDetail = sequelize.define("OrderDetail", {
    productPrice: {
      allowNull: false,
      type: DataTypes.DECIMAL,
    },

    productQuantity: {
      allowNull: false,
      type: DataTypes.INTEGER,
    },
  });

  return OrderDetail;
};
