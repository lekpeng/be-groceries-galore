const productController = require("../controllers/product/product_controller");
const router = require("express").Router();

router.get("/", productController.index);
router.get("/:productId", productController.show);

module.exports = router;
