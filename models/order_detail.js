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
  // OrderDetail.associate = function (models) {
  //   // associations can be defined here
  //   OrderDetail.belongsTo(models.Product);
  // };

  return OrderDetail;
};
