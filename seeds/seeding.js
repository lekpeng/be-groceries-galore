const sequelize = require("sequelize");
const bcrypt = require("bcrypt");
const models = require("../models");

const userData = require("./seed_data/user_seed_data");
const productCategoryData = require("./seed_data/product_category_seed_data");
const productData = require("./seed_data/product_seed_data");

const modelNames = ["Customer", "Merchant", "ProductCategory", "Product", "Order", "OrderDetail"];

const tableNames = [
  "Customers",
  "Merchants",
  "ProductCategories",
  "Products",
  "Orders",
  "OrderDetails",
];

const seedUsers = async () => {
  const replacePasswordWithHash = async (user) => {
    const passwordHash = await bcrypt.hash(user.password, 10);
    delete user.password;
    user.passwordHash = passwordHash;
    return user;
  };

  const customerDataWithHash = await Promise.all(userData.customers.map(replacePasswordWithHash));

  const merchantDataWithHash = await Promise.all(userData.merchants.map(replacePasswordWithHash));

  await models.Customer.bulkCreate(customerDataWithHash);
  await models.Merchant.bulkCreate(merchantDataWithHash);
  console.log("seeded users");
};

const seedProductCategories = async () => {
  await models.ProductCategory.bulkCreate(productCategoryData);
  console.log("seeded product categories");
};

const seedProducts = async () => {
  await models.Product.bulkCreate(productData);
  console.log("seeded products");
};

const seed = async (req, res) => {
  //   if (<no seeding done yet>){
  await seedUsers();
  await seedProductCategories();
  await seedProducts();
  res.send("seeded!");
  //   }
  //   res.send("already seeded previously!");
};

const truncate = async (req, res) => {
  modelNames.map((modelName) => {
    models[modelName].destroy({ truncate: true, cascade: true, restartIdentity: true });
  });
  res.send("truncated");
};

module.exports = { seed, truncate };
