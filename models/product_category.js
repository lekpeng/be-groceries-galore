const { DataTypes } = require("sequelize");
// We export a function that defines the model.
// This function will automatically receive as parameter the Sequelize connection object.
module.exports = (sequelize) => {
  const ProductCategory = sequelize.define("Category", {
    name: {
      allowNull: false,
      type: DataTypes.STRING,
    },
  });

  // ProductCategory.associate = function (models) {
  //   // associations can be defined here
  //   ProductCategory.hasMany(models.Product);
  // };

  return ProductCategory;
};
