"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn(
      "Orders", // name of Source model
      "CustomerId", // name of the key we're adding
      {
        type: Sequelize.INTEGER,
        references: {
          model: "Customers", // name of Target model
          key: "id", // key in Target model that we're referencing
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      }
    );
    await queryInterface.addColumn(
      "Products", // name of Source model
      "MerchantId", // name of the key we're adding
      {
        type: Sequelize.INTEGER,
        references: {
          model: "Merchants", // name of Target model
          key: "id", // key in Target model that we're referencing
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      }
    );
    await queryInterface.addColumn(
      "Orders", // name of Source model
      "MerchantId", // name of the key we're adding
      {
        type: Sequelize.INTEGER,
        references: {
          model: "Merchants", // name of Target model
          key: "id", // key in Target model that we're referencing
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      }
    );
    await queryInterface.addColumn(
      "OrderDetails", // name of Source model
      "OrderId", // name of the key we're adding
      {
        type: Sequelize.INTEGER,
        references: {
          model: "Orders", // name of Target model
          key: "id", // key in Target model that we're referencing
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      }
    );
    await queryInterface.addColumn(
      "OrderDetails", // name of Source model
      "ProductId", // name of the key we're adding
      {
        type: Sequelize.INTEGER,
        references: {
          model: "Products", // name of Target model
          key: "id", // key in Target model that we're referencing
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      }
    );
    await queryInterface.addColumn(
      "Products", // name of Source model
      "ProductCategoryId", // name of the key we're adding
      {
        type: Sequelize.INTEGER,
        references: {
          model: "ProductCategories", // name of Target model
          key: "id", // key in Target model that we're referencing
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      }
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn(
      "Orders", // name of Source model
      "CustomerId" // name of the key we're adding
    );
    await queryInterface.removeColumn(
      "Products", // name of Source model
      "MerchantId" // name of the key we're adding
    );
    await queryInterface.removeColumn(
      "Orders", // name of Source model
      "MerchantId" // name of the key we're adding
    );
    await queryInterface.removeColumn(
      "OrderDetails", // name of Source model
      "OrderId" // name of the key we're adding
    );
    await queryInterface.removeColumn(
      "OrderDetails", // name of Source model
      "ProductId" // name of the key we're adding
    );
    await queryInterface.removeColumn(
      "Products", // name of Source model
      "ProductCategoryId" // name of the key we're adding
    );
  },
};
