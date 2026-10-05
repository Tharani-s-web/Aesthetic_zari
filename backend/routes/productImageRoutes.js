const express = require("express");

const upload = require("../middleware/upload");

const {
  uploadProductImage,
  getProductImages,
  deleteProductImage,
} = require("../controllers/productImageController");

const router = express.Router();


// GET PRODUCT IMAGES
router.get(
  "/:productId",
  getProductImages
);


// UPLOAD PRODUCT IMAGE
router.post(
  "/:productId",
  upload.single("image"),
  uploadProductImage
);


// DELETE PRODUCT IMAGE
router.delete(
  "/image/:imageId",
  deleteProductImage
);


module.exports = router;