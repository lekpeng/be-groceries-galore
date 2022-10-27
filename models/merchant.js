const { DataTypes } = require("sequelize");
// We export a function that defines the model.
// This function will automatically receive as parameter the Sequelize connection object.
module.exports = (sequelize) => {
  const Merchant = sequelize.define("Merchant", {
    isConfirmed: {
      allowNull: false,
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },

    name: {
      allowNull: false,
      type: DataTypes.STRING,
    },
    email: {
      allowNull: false,
      type: DataTypes.STRING,
      unique: true,
      validate: {
        is: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i,
      },
    },
    passwordHash: {
      allowNull: false,
      type: DataTypes.STRING,
    },
    address: {
      allowNull: false,
      type: DataTypes.STRING,
    },
    phoneNumber: {
      allowNull: false,
      type: DataTypes.STRING,
    },
    refreshToken: {
      allowNull: false,
      type: DataTypes.STRING,
    },
  });

  return Merchant;
};
