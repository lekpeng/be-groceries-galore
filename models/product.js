const { DataTypes } = require("sequelize");
// We export a function that defines the model.
// This function will automatically receive as parameter the Sequelize connection object.
module.exports = (sequelize) => {
  const Product = sequelize.define("Product", {
    isInView: {
      allowNull: false,
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    name: {
      allowNull: false,
      type: DataTypes.STRING,
    },

    description: {
      type: DataTypes.STRING,
      defaultValue: "",
      allowNull: false,
    },

    price: {
      allowNull: false,
      type: DataTypes.DECIMAL,
    },

    quantity: {
      allowNull: false,
      type: DataTypes.INTEGER,
    },
    imageUrl: {
      allowNull: false,
      type: DataTypes.STRING,
    },
  });

  return Product;
};
