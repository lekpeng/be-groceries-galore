"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn(
      "Customers", // name of Source model
      "refreshToken", // name of the key we're adding
      {
        type: Sequelize.STRING,
      }
    );

    await queryInterface.addColumn(
      "Merchants", // name of Source model
      "refreshToken", // name of the key we're adding
      {
        type: Sequelize.STRING,
      }
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn(
      "Customers", // name of Source model
      "refreshToken" // name of the key we're adding
    );

    await queryInterface.removeColumn(
      "Merchants", // name of Source model
      "refreshToken" // name of the key we're adding
    );
  },
};
