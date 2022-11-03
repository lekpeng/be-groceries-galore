"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("Orders", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      isPaid: {
        allowNull: false,
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },

      deliveryAddress: {
        allowNull: false,
        type: Sequelize.STRING,
      },

      status: {
        allowNull: false,
        type: Sequelize.STRING,
        defaultValue: "cart",
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("Orders");
  },
};
