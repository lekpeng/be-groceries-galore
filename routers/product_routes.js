const productController = require("../controllers/product/product_controller");
const verifyAuthJwt = require("../middleware/verify_auth_jwt");
const verifyUserType = require("../middleware/verify_user_type");
const router = require("express").Router();
const imageUploadingFunctions = require("../middleware/image_uploading");

// const multer = require("multer");
// const cloudinary = require("cloudinary").v2;
// const streamifier = require("streamifier");

// cloudinary.config({
//   cloud_name: `${process.env.CLOUDINARY_CLOUD_NAME}`,
//   api_key: `${process.env.CLOUDINARY_API_KEY}`,
//   api_secret: `${process.env.CLOUDINARY_API_SECRET}`,
// });

// const upload = multer();

// const uploadToCloudinary = async (req, res) => {
//   const file = req.file;
//   console.log("FILE", file);

//   const cld_upload_stream = cloudinary.uploader.upload_stream(
//     { folder: "products", filename_override: req.file.originalname, use_filename: true },
//     (err, res) => {
//       console.log(res, err);
//     }
//   );

//   streamifier.createReadStream(req.file.buffer).pipe(cld_upload_stream);
// };
router.get("/", productController.index);
router.get("/store/:merchantId", productController.indexByMerchant);
router.get("/:productId", productController.show);
router.post(
  "/new",
  imageUploadingFunctions.upload.single("imageFile"),
  verifyAuthJwt,
  verifyUserType("Merchant"),
  productController.create,
  imageUploadingFunctions.uploadToCloudinary
);

module.exports = router;
