const productCategoryController = require("../controllers/product_category/product_category_controller");
const router = require("express").Router();

router.get("/", productCategoryController.index);

module.exports = router;
