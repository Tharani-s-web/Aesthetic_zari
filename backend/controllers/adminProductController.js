const Product = require("../models/Product");
const ProductSize = require("../models/ProductSize");
const ProductImage = require("../models/ProductImage");
const Category = require("../models/Category");

// ==========================================
// ADD PRODUCT (ADMIN ONLY)
// ==========================================

const addProduct = async (req, res) => {
  try {
    const {
      category_id,
      name,
      slug,
      description,
      base_price,
      is_customizable,
      stock_status,
      sizes,
    } = req.body;

    // Basic validation
    if (
      !category_id ||
      !name ||
      !slug ||
      base_price === undefined
    ) {
      return res.status(400).json({
        success: false,
        message:
          "category_id, name, slug and base_price are required",
      });
    }

    const categoryId = Number(category_id);

    // Check category
    const category = await Category.findOne({
      mysqlId: categoryId,
      isActive: true,
    }).lean();

    if (!category) {
      return res.status(400).json({
        success: false,
        message: "Invalid or inactive category",
      });
    }

    // Check duplicate slug
    const existingProduct = await Product.findOne({
      slug: slug.trim(),
    }).lean();

    if (existingProduct) {
      return res.status(400).json({
        success: false,
        message: "Product slug already exists",
      });
    }

    // Generate next numeric ID
    const lastProduct = await Product.findOne()
      .sort({ mysqlId: -1 })
      .lean();

    const productId = lastProduct
      ? Number(lastProduct.mysqlId) + 1
      : 1;

    // Create product
    await Product.create({
      mysqlId: productId,
      categoryId,
      name: name.trim(),
      slug: slug.trim(),
      description: description || "",
      basePrice: Number(base_price),
      isCustomizable:
        is_customizable !== undefined
          ? Boolean(is_customizable)
          : true,
      stockStatus: stock_status || "available",
      isActive: true,
    });

    // If no sizes are provided
    if (!sizes || sizes.length === 0) {
      return res.status(201).json({
        success: true,
        message: "Product created successfully",
        product_id: productId,
      });
    }

    // Get next ProductSize ID
    const lastSize = await ProductSize.findOne()
      .sort({ mysqlId: -1 })
      .lean();

    let nextSizeId = lastSize
      ? Number(lastSize.mysqlId) + 1
      : 1;

    const sizeDocuments = sizes.map((size) => ({
      mysqlId: nextSizeId++,
      productId,
      sizeName: size.size_name,
      price: Number(size.price),
      isAvailable:
        size.is_available !== undefined
          ? Boolean(size.is_available)
          : true,
    }));

    try {
      await ProductSize.insertMany(sizeDocuments);
    } catch (sizeError) {
      return res.status(500).json({
        success: false,
        message:
          "Product created but failed to add sizes",
        error: sizeError.message,
        product_id: productId,
      });
    }

    return res.status(201).json({
      success: true,
      message:
        "Product and sizes created successfully",
      product_id: productId,
      total_sizes: sizes.length,
    });
  } catch (error) {
    console.error("ADMIN ADD PRODUCT ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create product",
      error: error.message,
    });
  }
};


// ==========================================
// UPDATE PRODUCT (ADMIN ONLY)
// ==========================================

const updateProduct = async (req, res) => {
  try {
    const productId = Number(req.params.productId);

    const {
      category_id,
      name,
      slug,
      description,
      base_price,
      is_customizable,
      stock_status,
      is_active,
    } = req.body;

    // Check product
    const product = await Product.findOne({
      mysqlId: productId,
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Validate category if provided
    if (category_id !== undefined) {
      const categoryId = Number(category_id);

      const category = await Category.findOne({
        mysqlId: categoryId,
        isActive: true,
      }).lean();

      if (!category) {
        return res.status(400).json({
          success: false,
          message: "Invalid or inactive category",
        });
      }

      product.categoryId = categoryId;
    }

    // Check duplicate slug if slug is changed
    if (
      slug !== undefined &&
      slug.trim() !== product.slug
    ) {
      const existingProduct = await Product.findOne({
        slug: slug.trim(),
        mysqlId: { $ne: productId },
      }).lean();

      if (existingProduct) {
        return res.status(400).json({
          success: false,
          message: "Product slug already exists",
        });
      }

      product.slug = slug.trim();
    }

    // Update only supplied fields
    if (name !== undefined) {
      product.name = name.trim();
    }

    if (description !== undefined) {
      product.description = description;
    }

    if (base_price !== undefined) {
      product.basePrice = Number(base_price);
    }

    if (is_customizable !== undefined) {
      product.isCustomizable = Boolean(is_customizable);
    }

    if (stock_status !== undefined) {
      product.stockStatus = stock_status;
    }

    if (is_active !== undefined) {
      product.isActive = Boolean(is_active);
    }

    await product.save();

    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product_id: productId,
    });
  } catch (error) {
    console.error("ADMIN UPDATE PRODUCT ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update product",
      error: error.message,
    });
  }
};


// ==========================================
// DEACTIVATE PRODUCT (ADMIN ONLY)
// ==========================================

const deactivateProduct = async (req, res) => {
  try {
    const productId = Number(req.params.productId);

    const product = await Product.findOne({
      mysqlId: productId,
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    product.isActive = false;

    await product.save();

    return res.status(200).json({
      success: true,
      message: "Product deactivated successfully",
      product_id: productId,
    });
  } catch (error) {
    console.error(
      "ADMIN DEACTIVATE PRODUCT ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to deactivate product",
      error: error.message,
    });
  }
};


// ==========================================
// ACTIVATE PRODUCT (ADMIN ONLY)
// ==========================================

const activateProduct = async (req, res) => {
  try {
    const productId = Number(req.params.productId);

    const product = await Product.findOne({
      mysqlId: productId,
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    product.isActive = true;

    await product.save();

    return res.status(200).json({
      success: true,
      message: "Product activated successfully",
      product_id: productId,
    });
  } catch (error) {
    console.error(
      "ADMIN ACTIVATE PRODUCT ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to activate product",
      error: error.message,
    });
  }
};


// ==========================================
// ADD PRODUCT SIZE (ADMIN ONLY)
// ==========================================

const addProductSize = async (req, res) => {
  try {
    const productId = Number(req.params.productId);

    const {
      size_name,
      price,
      is_available,
    } = req.body;

    // Validate required fields
    if (!size_name || price === undefined) {
      return res.status(400).json({
        success: false,
        message: "size_name and price are required",
      });
    }

    // Check product
    const product = await Product.findOne({
      mysqlId: productId,
    }).lean();

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Check duplicate size
    const existingSize = await ProductSize.findOne({
      productId,
      sizeName: size_name,
    }).lean();

    if (existingSize) {
      return res.status(400).json({
        success: false,
        message:
          "This size already exists for the product",
      });
    }

    // Generate next ID
    const lastSize = await ProductSize.findOne()
      .sort({ mysqlId: -1 })
      .lean();

    const sizeId = lastSize
      ? Number(lastSize.mysqlId) + 1
      : 1;

    await ProductSize.create({
      mysqlId: sizeId,
      productId,
      sizeName: size_name,
      price: Number(price),
      isAvailable:
        is_available !== undefined
          ? Boolean(is_available)
          : true,
    });

    return res.status(201).json({
      success: true,
      message: "Product size added successfully",
      size_id: sizeId,
      product_id: productId,
    });
  } catch (error) {
    console.error(
      "ADMIN ADD PRODUCT SIZE ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to add product size",
      error: error.message,
    });
  }
};


// ==========================================
// UPDATE PRODUCT SIZE (ADMIN ONLY)
// ==========================================

const updateProductSize = async (req, res) => {
  try {
    const productId = Number(req.params.productId);
    const sizeId = Number(req.params.sizeId);

    const {
      size_name,
      price,
      is_available,
    } = req.body;

    // Check size belongs to product
    const size = await ProductSize.findOne({
      mysqlId: sizeId,
      productId,
    });

    if (!size) {
      return res.status(404).json({
        success: false,
        message: "Product size not found",
      });
    }

    // Check duplicate size name
    if (
      size_name !== undefined &&
      size_name !== size.sizeName
    ) {
      const duplicateSize =
        await ProductSize.findOne({
          productId,
          sizeName: size_name,
          mysqlId: { $ne: sizeId },
        }).lean();

      if (duplicateSize) {
        return res.status(400).json({
          success: false,
          message:
            "This size already exists for the product",
        });
      }

      size.sizeName = size_name;
    }

    if (price !== undefined) {
      size.price = Number(price);
    }

    if (is_available !== undefined) {
      size.isAvailable = Boolean(is_available);
    }

    await size.save();

    return res.status(200).json({
      success: true,
      message: "Product size updated successfully",
      size_id: sizeId,
      product_id: productId,
    });
  } catch (error) {
    console.error(
      "ADMIN UPDATE PRODUCT SIZE ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to update product size",
      error: error.message,
    });
  }
};


// ==========================================
// TOGGLE PRODUCT SIZE AVAILABILITY (ADMIN ONLY)
// ==========================================

const toggleProductSizeAvailability = async (
  req,
  res
) => {
  try {
    const productId = Number(req.params.productId);
    const sizeId = Number(req.params.sizeId);

    const size = await ProductSize.findOne({
      mysqlId: sizeId,
      productId,
    });

    if (!size) {
      return res.status(404).json({
        success: false,
        message: "Product size not found",
      });
    }

    size.isAvailable = !size.isAvailable;

    await size.save();

    return res.status(200).json({
      success: true,
      message: `Product size ${
        size.isAvailable ? "enabled" : "disabled"
      } successfully`,
      size_id: sizeId,
      product_id: productId,
      is_available: size.isAvailable,
    });
  } catch (error) {
    console.error(
      "ADMIN TOGGLE PRODUCT SIZE ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to update size availability",
      error: error.message,
    });
  }
};


// ==========================================
// DELETE PRODUCT SIZE (ADMIN ONLY)
// ==========================================

const deleteProductSize = async (req, res) => {
  try {
    const productId = Number(req.params.productId);
    const sizeId = Number(req.params.sizeId);

    const size = await ProductSize.findOne({
      mysqlId: sizeId,
      productId,
    }).lean();

    if (!size) {
      return res.status(404).json({
        success: false,
        message: "Product size not found",
      });
    }

    await ProductSize.deleteOne({
      mysqlId: sizeId,
      productId,
    });

    return res.status(200).json({
      success: true,
      message: "Product size deleted successfully",
      deleted_size: size.sizeName,
      size_id: sizeId,
      product_id: productId,
    });
  } catch (error) {
    console.error(
      "ADMIN DELETE PRODUCT SIZE ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to delete product size",
      error: error.message,
    });
  }
};


// ==========================================
// UPLOAD PRODUCT IMAGES (ADMIN ONLY)
// ==========================================

const uploadProductImages = async (req, res) => {
  try {
    const productId = Number(req.params.productId);

    // Check product
    const product = await Product.findOne({
      mysqlId: productId,
    }).lean();

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Check files
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No images uploaded",
      });
    }

    // Check existing images
    const existingImageCount =
      await ProductImage.countDocuments({
        productId,
      });

    // Generate next image ID
    const lastImage = await ProductImage.findOne()
      .sort({ mysqlId: -1 })
      .lean();

    let nextImageId = lastImage
      ? Number(lastImage.mysqlId) + 1
      : 1;

    const imageDocuments = req.files.map(
      (file, index) => ({
        mysqlId: nextImageId++,
        productId,
        imageUrl: `/uploads/products/${file.filename}`,
        isPrimary:
          existingImageCount === 0 && index === 0,
      })
    );

    await ProductImage.insertMany(imageDocuments);

    return res.status(201).json({
      success: true,
      message:
        "Product images uploaded successfully",
      product_id: productId,
      uploaded_images: imageDocuments.map(
        (image) => ({
          image_id: image.mysqlId,
          image_url: image.imageUrl,
          is_primary: image.isPrimary,
        })
      ),
    });
  } catch (error) {
    console.error(
      "ADMIN UPLOAD PRODUCT IMAGES ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to save product images",
      error: error.message,
    });
  }
};


// ==========================================
// GET PRODUCT IMAGES (ADMIN ONLY)
// ==========================================

const getProductImages = async (req, res) => {
  try {
    const productId = Number(req.params.productId);

    const images = await ProductImage.find({
      productId,
    })
      .sort({
        isPrimary: -1,
        createdAt: 1,
        mysqlId: 1,
      })
      .lean();

    const formattedImages = images.map(
      (image) => ({
        id: image.mysqlId,
        product_id: image.productId,
        image_url: image.imageUrl,
        is_primary: image.isPrimary,
        created_at: image.createdAt,
      })
    );

    return res.status(200).json({
      success: true,
      product_id: productId,
      count: formattedImages.length,
      images: formattedImages,
    });
  } catch (error) {
    console.error(
      "ADMIN GET PRODUCT IMAGES ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch product images",
      error: error.message,
    });
  }
};


module.exports = {
  addProduct,
  updateProduct,
  deactivateProduct,
  activateProduct,
  addProductSize,
  updateProductSize,
  toggleProductSizeAvailability,
  deleteProductSize,
  uploadProductImages,
  getProductImages,
};