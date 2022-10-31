const { Sequelize } = require("sequelize");
const env = process.env.NODE_ENV || "development";
console.log("ENV", env);

const db = {};
const { applyAssociations } = require("./associations");

let sequelize;
if (process.env.DATABASE_URL) {
  sequelize = new Sequelize(process.env.DATABASE_URL);
} else {
  const config = require(__dirname + "/../config/config")[env];
  console.log("CONFIG", config);
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

const modelDefiners = [
  {
    name: "Customer",
    model: require("./customer"),
  },
  {
    name: "Merchant",
    model: require("./merchant"),
  },
  {
    name: "Order",
    model: require("./order"),
  },
  {
    name: "OrderDetail",
    model: require("./order_detail"),
  },
  {
    name: "Product",
    model: require("./product"),
  },
  {
    name: "ProductCategory",
    model: require("./product_category"),
  },
];

// We define all models according to their files.
for (const modelDefiner of modelDefiners) {
  db[modelDefiner.name] = modelDefiner.model(sequelize);
}

applyAssociations(db);

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
