require("dotenv").config();

module.exports = {
  development: {
    database: "groceries-galore",
    host: "127.0.0.1",
    dialect: "postgres",
    port: 5432,
    username: "lekpeng",
    logging: false,
  },
  test: {
    username: process.env.PG_USERNAME,
    password: process.env.PG_PASSWORD,
    database: process.env.PG_DATABASE,
    host: process.env.PG_HOST,
    dialect: "postgres",
    logging: false,
    pool: {
      max: 2,
    },
  },
  test: {
    username: process.env.PG_USERNAME,
    password: process.env.PG_PASSWORD,
    database: process.env.PG_DATABASE,
    host: process.env.PG_HOST,
    dialect: "postgres",
  },
};
