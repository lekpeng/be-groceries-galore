const productController = require("../controllers/product/product_controller");
const router = require("express").Router();

router.get("/", productController.index);
router.get("/store/:merchantId", productController.indexByMerchant);
router.get("/:productId", productController.show);

module.exports = router;
