require("dotenv").config();

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const userRouter = require("./routers/user_routes");
const orderRouter = require("./routers/order_routes");
const db = require("./models");
const credentials = require("./middleware/credentials");
const corsOptions = require("./config/corsOptions");

// App config
const app = express();

// Middleware
app.use(express.json());
app.use(credentials);
app.use(cookieParser());

app.use(cors(corsOptions));

// Routes

app.use("/api/v1/users", userRouter);
app.use("/api/v1/orders", orderRouter);

/// Connect to database by using sequelize
const PORT = process.env.PORT || 8000;

async function assertDatabaseConnectionOk() {
  console.log("Checking database connection...");
  try {
    await db.sequelize.authenticate();
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
