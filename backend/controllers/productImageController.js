const Product = require("../models/Product");
const ProductImage = require("../models/ProductImage");

// ==========================================
// UPLOAD PRODUCT IMAGE
// ==========================================

const uploadProductImage = async (req, res) => {
  try {
    const productId = Number(req.params.productId);

    if (Number.isNaN(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No image uploaded",
      });
    }

    const imageUrl = `/uploads/products/${req.file.filename}`;

    // Check if product exists
    const product = await Product.findOne({
      mysqlId: productId,
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Check whether this is the first image
    const imageCount = await ProductImage.countDocuments({
      productId,
    });

    const isPrimary = imageCount === 0;

    // Generate next legacy MySQL ID
    const lastImage = await ProductImage.findOne()
      .sort({ mysqlId: -1 })
      .lean();

    const newMysqlId = lastImage
      ? Number(lastImage.mysqlId) + 1
      : 1;

    // Save image in MongoDB
    const image = await ProductImage.create({
      mysqlId: newMysqlId,
      productId,
      imageUrl,
      isPrimary,
    });

    return res.status(201).json({
      success: true,
      message: "Product image uploaded successfully",
      image: {
        id: image.mysqlId,
        product_id: image.productId,
        image_url: image.imageUrl,
        is_primary: image.isPrimary,
      },
    });
  } catch (error) {
    console.error("UPLOAD PRODUCT IMAGE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to save product image",
      error: error.message,
    });
  }
};


// ==========================================
// GET PRODUCT IMAGES
// ==========================================

const getProductImages = async (req, res) => {
  try {
    const productId = Number(req.params.productId);

    if (Number.isNaN(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const images = await ProductImage.find({
      productId,
    })
      .sort({
        isPrimary: -1,
        mysqlId: 1,
      })
      .lean();

    const formattedImages = images.map((image) => ({
      id: image.mysqlId,
      product_id: image.productId,
      image_url: image.imageUrl,
      is_primary: image.isPrimary,
      created_at: image.createdAt,
    }));

    return res.status(200).json({
      success: true,
      images: formattedImages,
    });
  } catch (error) {
    console.error("GET PRODUCT IMAGES ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch product images",
      error: error.message,
    });
  }
};


// ==========================================
// DELETE PRODUCT IMAGE
// ==========================================

const deleteProductImage = async (req, res) => {
  try {
    const imageId = Number(req.params.imageId);

    if (Number.isNaN(imageId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid image ID",
      });
    }

    // Find image
    const image = await ProductImage.findOne({
      mysqlId: imageId,
    });

    if (!image) {
      return res.status(404).json({
        success: false,
        message: "Image not found",
      });
    }

    // Delete image document
    await ProductImage.deleteOne({
      mysqlId: imageId,
    });

    return res.status(200).json({
      success: true,
      message: "Product image deleted successfully",
    });
  } catch (error) {
    console.error("DELETE PRODUCT IMAGE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete image",
      error: error.message,
    });
  }
};


module.exports = {
  uploadProductImage,
  getProductImages,
  deleteProductImage,
};