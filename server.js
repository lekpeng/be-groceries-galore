require("dotenv").config();

const express = require("express");
const cors = require("cors");
const userRouter = require("./routers/user_routes");
const db = require("./models");

// App config
const app = express();

// Middleware
app.use(express.json());
app.use(cors({ origin: "*" }));

app.use("/api/v1/users", userRouter);

/// Connect to database by using sequelize
const PORT = process.env.PORT || 8000;

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
