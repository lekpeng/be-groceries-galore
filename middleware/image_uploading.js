const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");
const multer = require("multer");

cloudinary.config({
  cloud_name: `${process.env.CLOUDINARY_CLOUD_NAME}`,
  api_key: `${process.env.CLOUDINARY_API_KEY}`,
  api_secret: `${process.env.CLOUDINARY_API_SECRET}`,
});

const imageUploader = {
  upload: multer(),
  uploadToCloudinary: (req, res, next) => {
    const file = req.file;

    const cld_upload_stream = cloudinary.uploader.upload_stream(
      { folder: "products", filename_override: req.file.originalname, use_filename: true },
      (err, res) => {
        req.productImageUrl = res.secure_url;
        next();
      }
    );

    streamifier.createReadStream(req.file.buffer).pipe(cld_upload_stream);
  },
};

module.exports = imageUploader;
