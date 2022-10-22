const { DataTypes } = require("sequelize");
// We export a function that defines the model.
// This function will automatically receive as parameter the Sequelize connection object.
module.exports = (sequelize) => {
  const ProductCategory = sequelize.define("ProductCategory", {
    name: {
      allowNull: false,
      type: DataTypes.STRING,
    },
  });


  return ProductCategory;
};
