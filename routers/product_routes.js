const productController = require("../controllers/product/product_controller");
const verifyAuthJwt = require("../middleware/verify_auth_jwt");
const verifyUserType = require("../middleware/verify_user_type");
const router = require("express").Router();
const imageUploader = require("../middleware/image_uploading");

router.get("/", productController.index);
router.get("/store/:merchantId", productController.indexByMerchant);
router.get("/category/:categoryName", productController.indexByCategory);
router.get("/:productId", productController.show);
router.post(
  "/new",
  imageUploader.upload.single("imageFile"),
  verifyAuthJwt,
  verifyUserType("Merchant"),
  imageUploader.uploadToCloudinary,
  productController.create
);
router.delete("/:productId", verifyAuthJwt, verifyUserType("Merchant"), productController.delete);
router.patch("/:productId", verifyAuthJwt, verifyUserType("Merchant"), productController.update);

module.exports = router;
