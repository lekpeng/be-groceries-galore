"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn(
      "Order", // name of Source model
      "CustomerId", // name of the key we're adding
      {
        type: Sequelize.INTEGER,
        references: {
          model: "Customer", // name of Target model
          key: "id", // key in Target model that we're referencing
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      }
    );
    await queryInterface.addColumn(
      "Product", // name of Source model
      "MerchantId", // name of the key we're adding
      {
        type: Sequelize.INTEGER,
        references: {
          model: "Merchant", // name of Target model
          key: "id", // key in Target model that we're referencing
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      }
    );
    await queryInterface.addColumn(
      "Order", // name of Source model
      "MerchantId", // name of the key we're adding
      {
        type: Sequelize.INTEGER,
        references: {
          model: "Merchant", // name of Target model
          key: "id", // key in Target model that we're referencing
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      }
    );
    await queryInterface.addColumn(
      "OrderDetail", // name of Source model
      "OrderId", // name of the key we're adding
      {
        type: Sequelize.INTEGER,
        references: {
          model: "Order", // name of Target model
          key: "id", // key in Target model that we're referencing
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      }
    );
    await queryInterface.addColumn(
      "OrderDetail", // name of Source model
      "ProductId", // name of the key we're adding
      {
        type: Sequelize.INTEGER,
        references: {
          model: "Product", // name of Target model
          key: "id", // key in Target model that we're referencing
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      }
    );
    await queryInterface.addColumn(
      "Product", // name of Source model
      "ProductCategoryId", // name of the key we're adding
      {
        type: Sequelize.INTEGER,
        references: {
          model: "ProductCategory", // name of Target model
          key: "id", // key in Target model that we're referencing
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      }
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn(
      "Order", // name of Source model
      "CustomerId" // name of the key we're adding
    );
    await queryInterface.removeColumn(
      "Product", // name of Source model
      "MerchantId" // name of the key we're adding
    );
    await queryInterface.removeColumn(
      "Order", // name of Source model
      "MerchantId" // name of the key we're adding
    );
    await queryInterface.removeColumn(
      "OrderDetail", // name of Source model
      "OrderId" // name of the key we're adding
    );
    await queryInterface.removeColumn(
      "OrderDetail", // name of Source model
      "ProductId" // name of the key we're adding
    );
    await queryInterface.removeColumn(
      "Product", // name of Source model
      "ProductCategoryId" // name of the key we're adding
    );
  },
};
