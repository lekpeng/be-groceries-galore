"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("Products", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      isInView: {
        allowNull: false,
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      name: {
        allowNull: false,
        type: Sequelize.STRING,
      },

      description: {
        allowNull: false,
        type: Sequelize.STRING,
      },

      price: {
        allowNull: false,
        type: Sequelize.DECIMAL,
      },

      quantity: {
        allowNull: false,
        type: Sequelize.INTEGER,
      },
      imageUrl: {
        allowNull: false,
        type: Sequelize.STRING,
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("Products");
  },
};
