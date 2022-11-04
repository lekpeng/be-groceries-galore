require("dotenv").config();

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const credentials = require("./middleware/credentials");
const corsOptions = require("./config/corsOptions");
const db = require("./models");

const userRouter = require("./routers/user_routes");
const orderRouter = require("./routers/order_routes");
const productCategoryRouter = require("./routers/product_category_routes");
const productRouter = require("./routers/product_routes");

const seeding = require("./seeds/seeding");

// App config
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(credentials);
app.use(cookieParser());

app.use(cors(corsOptions));

// Routers
app.use("/api/v1/users", userRouter);
app.use("/api/v1/orders", orderRouter);
app.use("/api/v1/product-categories", productCategoryRouter);
app.use("/api/v1/products", productRouter);

// Seeding route
app.get("/api/v1/seed", seeding.seed);
app.get("/api/v1/truncate", seeding.truncate);

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
