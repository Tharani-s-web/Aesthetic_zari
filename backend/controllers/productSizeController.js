const ProductSize = require("../models/ProductSize");
const Product = require("../models/Product");

// ==========================================
// GET SIZES FOR A PRODUCT
// ==========================================

const getProductSizes = async (req, res) => {
  try {
    const productId = Number(req.params.productId);

    if (Number.isNaN(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const sizes = await ProductSize.find({
      productId,
      isAvailable: true,
    })
      .sort({ price: 1 })
      .lean();

    const formattedSizes = sizes.map((size) => ({
      id: size.mysqlId,
      product_id: size.productId,
      size_name: size.sizeName,
      price: size.price,
      is_available: size.isAvailable,
      created_at: size.createdAt,
      updated_at: size.updatedAt,
    }));

    return res.status(200).json({
      success: true,
      sizes: formattedSizes,
    });
  } catch (error) {
    console.error("GET PRODUCT SIZES ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch product sizes",
      error: error.message,
    });
  }
};


// ==========================================
// ADD SIZE TO PRODUCT
// ==========================================

const addProductSize = async (req, res) => {
  try {
    const productId = Number(req.params.productId);

    const { size_name, price } = req.body;

    // Validate product ID
    if (Number.isNaN(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    // Validate required fields
    if (!size_name || price === undefined) {
      return res.status(400).json({
        success: false,
        message: "Size name and price are required",
      });
    }

    // Check that product exists
    const product = await Product.findOne({
      mysqlId: productId,
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Generate next legacy MySQL ID
    const lastSize = await ProductSize.findOne()
      .sort({ mysqlId: -1 })
      .lean();

    const newMysqlId = lastSize
      ? Number(lastSize.mysqlId) + 1
      : 1;

    // Create product size
    const productSize = await ProductSize.create({
      mysqlId: newMysqlId,
      productId,
      sizeName: size_name.trim(),
      price: Number(price),
      isAvailable: true,
    });

    return res.status(201).json({
      success: true,
      message: "Product size added successfully",
      sizeId: productSize.mysqlId,
    });
  } catch (error) {
    console.error("ADD PRODUCT SIZE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to add product size",
      error: error.message,
    });
  }
};


module.exports = {
  getProductSizes,
  addProductSize,
};