require("dotenv").config();

const express = require("express");
const cors = require("cors");
const app = express();

// Middleware
app.use(express.json());
app.use(cors({ origin: "*" }));

const db = require("./models");
const PORT = process.env.PORT || 8000;

/// Connect to database by using sequelize
async function assertDatabaseConnectionOk() {
  console.log("Checking database connection...");
  try {
    await db.sequelize.sync();
    console.log("Database connection OK!");
  } catch (error) {
    console.log("Unable to connect to the database:");
    console.log(error.message);
    process.exit(1);
  }
}

async function init() {
  await assertDatabaseConnectionOk();

  app.listen(PORT, () => console.log(`Server started at port ${PORT}`));
}

init();
