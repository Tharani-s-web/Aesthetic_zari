const Product = require("../models/Product");
const Category = require("../models/Category");
const ProductImage = require("../models/ProductImage");
const ProductSize = require("../models/ProductSize");
const CustomizationField = require("../models/CustomizationField");

// ==========================================
// HELPER — FORMAT PRODUCT FOR FRONTEND
// ==========================================

const formatProduct = async (product) => {
  const category = await Category.findOne({
    mysqlId: product.categoryId,
  }).lean();

  const primaryImage = await ProductImage.findOne({
    productId: product.mysqlId,
  })
    .sort({ isPrimary: -1, createdAt: 1 })
    .lean();

  return {
    id: product.mysqlId,
    category_id: product.categoryId,
    name: product.name,
    slug: product.slug,
    description: product.description,
    base_price: product.basePrice,
    is_customizable: product.isCustomizable,
    stock_status: product.stockStatus,
    is_active: product.isActive,
    created_at: product.createdAt,

    category_name: category?.name || null,
    category_slug: category?.slug || null,

    primary_image: primaryImage?.imageUrl || null,
  };
};

// ==========================================
// GET ALL PRODUCTS FOR USERS
// SEARCH + SORT SUPPORT
// ONLY AVAILABLE PRODUCTS
// ==========================================

const getProducts = async (req, res) => {
  try {
    const { search = "", sort = "newest" } = req.query;

    let products = await Product.find({
      isActive: true,
      stockStatus: "available",
    }).lean();

    // ==========================================
    // GET ACTIVE CATEGORIES
    // ==========================================

    const activeCategories = await Category.find({
      isActive: true,
    }).lean();

    const activeCategoryIds = new Set(
      activeCategories.map((category) => category.mysqlId)
    );

    products = products.filter((product) =>
      activeCategoryIds.has(product.categoryId)
    );

    // ==========================================
    // SEARCH
    // ==========================================

    const searchTerm = search.trim().toLowerCase();

    if (searchTerm) {
      products = products.filter((product) => {
        const category = activeCategories.find(
          (item) => item.mysqlId === product.categoryId
        );

        return (
          product.name?.toLowerCase().includes(searchTerm) ||
          product.description?.toLowerCase().includes(searchTerm) ||
          category?.name?.toLowerCase().includes(searchTerm)
        );
      });
    }

    // ==========================================
    // SORT
    // ==========================================

    switch (sort) {
      case "price_low":
        products.sort(
          (a, b) => Number(a.basePrice) - Number(b.basePrice)
        );
        break;

      case "price_high":
        products.sort(
          (a, b) => Number(b.basePrice) - Number(a.basePrice)
        );
        break;

      case "name_asc":
        products.sort((a, b) =>
          a.name.localeCompare(b.name)
        );
        break;

      case "name_desc":
        products.sort((a, b) =>
          b.name.localeCompare(a.name)
        );
        break;

      case "oldest":
        products.sort(
          (a, b) =>
            new Date(a.createdAt) -
            new Date(b.createdAt)
        );
        break;

      case "newest":
      default:
        products.sort(
          (a, b) =>
            new Date(b.createdAt) -
            new Date(a.createdAt)
        );
        break;
    }

    // ==========================================
    // FORMAT PRODUCTS
    // ==========================================

    const formattedProducts = await Promise.all(
      products.map(formatProduct)
    );

    return res.status(200).json({
      success: true,
      count: formattedProducts.length,
      search: search || null,
      sort,
      products: formattedProducts,
    });
  } catch (error) {
    console.error("GET PRODUCTS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch products",
      error: error.message,
    });
  }
};

// ==========================================
// GET ALL PRODUCTS FOR ADMIN
// INCLUDES AVAILABLE + UNAVAILABLE
// ==========================================

const getAllProductsAdmin = async (req, res) => {
  try {
    const products = await Product.find({})
      .sort({ createdAt: -1 })
      .lean();

    const formattedProducts = await Promise.all(
      products.map(formatProduct)
    );

    return res.status(200).json({
      success: true,
      count: formattedProducts.length,
      products: formattedProducts,
    });
  } catch (error) {
    console.error(
      "GET ALL ADMIN PRODUCTS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch products",
      error: error.message,
    });
  }
};

// ==========================================
// GET SINGLE PRODUCT BY ID
// ==========================================

const getProductById = async (req, res) => {
  try {
    const productId = Number(req.params.id);

    const product = await Product.findOne({
      mysqlId: productId,
    }).lean();

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const formattedProduct = await formatProduct(product);

    return res.status(200).json({
      success: true,
      product: formattedProduct,
    });
  } catch (error) {
    console.error("GET PRODUCT ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch product",
      error: error.message,
    });
  }
};

// ==========================================
// GET SINGLE PRODUCT BY SLUG
// ==========================================

const getProductBySlug = async (req, res) => {
  try {
    const productSlug = req.params.slug;

    console.log("=================================");
    console.log("SLUG RECEIVED FROM URL:", productSlug);
    console.log("=================================");

    const product = await Product.findOne({
      slug: productSlug,
    }).lean();

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
        searchedSlug: productSlug,
      });
    }

    return res.status(200).json({
      success: true,
      product: {
        id: product.mysqlId,
        name: product.name,
        slug: product.slug,
        category_id: product.categoryId,
      },
    });
  } catch (error) {
    console.error(
      "GET PRODUCT BY SLUG ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Database error",
      error: error.message,
    });
  }
};

// ==========================================
// GET PRODUCTS BY CATEGORY
// ==========================================

const getProductsByCategory = async (req, res) => {
  try {
    const categoryId = Number(req.params.id);

    const products = await Product.find({
      categoryId: categoryId,
      isActive: true,
      stockStatus: "available",
    })
      .sort({ createdAt: -1 })
      .lean();

    const category = await Category.findOne({
      mysqlId: categoryId,
      isActive: true,
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    const formattedProducts = await Promise.all(
      products.map(formatProduct)
    );

    return res.status(200).json({
      success: true,
      products: formattedProducts,
    });
  } catch (error) {
    console.error(
      "GET PRODUCTS BY CATEGORY ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch category products",
      error: error.message,
    });
  }
};

// ==========================================
// CREATE PRODUCT
// ==========================================

const createProduct = async (req, res) => {
  try {
    const {
      category_id,
      name,
      slug,
      description,
      base_price,
      is_customizable,
      stock_status,
    } = req.body;

    if (!category_id || !name || !slug) {
      return res.status(400).json({
        success: false,
        message:
          "Category, product name and slug are required",
      });
    }

    // Check category
    const category = await Category.findOne({
      mysqlId: Number(category_id),
      isActive: true,
    });

    if (!category) {
      return res.status(400).json({
        success: false,
        message: "Invalid category",
      });
    }

    // Check duplicate slug
    const existingProduct = await Product.findOne({
      slug: slug.trim(),
    });

    if (existingProduct) {
      return res.status(409).json({
        success: false,
        message: "Product slug already exists",
      });
    }

    // Generate legacy numeric ID
    const lastProduct = await Product.findOne()
      .sort({ mysqlId: -1 })
      .lean();

    const newMysqlId = lastProduct
      ? Number(lastProduct.mysqlId) + 1
      : 1;

    const product = await Product.create({
      mysqlId: newMysqlId,
      categoryId: Number(category_id),
      name: name.trim(),
      slug: slug.trim(),
      description: description || "",
      basePrice: Number(base_price) || 0,
      isCustomizable: is_customizable ?? true,
      stockStatus: stock_status || "available",
      isActive: true,
    });

    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      productId: product.mysqlId,
    });
  } catch (error) {
    console.error("CREATE PRODUCT ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create product",
      error: error.message,
    });
  }
};

// ==========================================
// GET COMPLETE PRODUCT DETAILS
// ==========================================

const buildCompleteProduct = async (product) => {
  const category = await Category.findOne({
    mysqlId: product.categoryId,
  }).lean();

  const images = await ProductImage.find({
    productId: product.mysqlId,
  })
    .sort({ isPrimary: -1, createdAt: 1 })
    .lean();

  const sizes = await ProductSize.find({
    productId: product.mysqlId,
    isAvailable: true,
  })
    .sort({ price: 1 })
    .lean();

  const customizationFields =
    await CustomizationField.find({
      productId: product.mysqlId,
    })
      .sort({ displayOrder: 1 })
      .lean();

  return {
    id: product.mysqlId,
    category_id: product.categoryId,
    name: product.name,
    slug: product.slug,
    description: product.description,
    base_price: product.basePrice,
    is_customizable: product.isCustomizable,
    stock_status: product.stockStatus,
    is_active: product.isActive,
    created_at: product.createdAt,

    category_name: category?.name || null,
    category_slug: category?.slug || null,

    images: images.map((image) => ({
      id: image.mysqlId,
      product_id: image.productId,
      image_url: image.imageUrl,
      is_primary: image.isPrimary,
      created_at: image.createdAt,
    })),

    sizes: sizes.map((size) => ({
      id: size.mysqlId,
      product_id: size.productId,
      size_name: size.sizeName,
      price: size.price,
      is_available: size.isAvailable,
      created_at: size.createdAt,
    })),

    customization_fields: customizationFields.map(
      (field) => ({
        id: field.mysqlId,
        product_id: field.productId,
        field_name: field.fieldName,
        field_label: field.fieldLabel,
        field_type: field.fieldType,
        placeholder: field.placeholder,
        options: field.options,
        is_required: field.isRequired,
        display_order: field.displayOrder,
        created_at: field.createdAt,
      })
    ),
  };
};

const getCompleteProductDetails = async (
  req,
  res
) => {
  try {
    const productId = Number(req.params.id);

    const product = await Product.findOne({
      mysqlId: productId,
      isActive: true,
    }).lean();

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const completeProduct =
      await buildCompleteProduct(product);

    return res.status(200).json({
      success: true,
      product: completeProduct,
    });
  } catch (error) {
    console.error(
      "GET COMPLETE PRODUCT ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch product",
      error: error.message,
    });
  }
};

// ==========================================
// GET COMPLETE PRODUCT DETAILS BY SLUG
// ==========================================

const getCompleteProductDetailsBySlug = async (
  req,
  res
) => {
  try {
    const productSlug = req.params.slug;

    const product = await Product.findOne({
      slug: productSlug,
      isActive: true,
    }).lean();

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const completeProduct =
      await buildCompleteProduct(product);

    return res.status(200).json({
      success: true,
      product: completeProduct,
    });
  } catch (error) {
    console.error(
      "GET COMPLETE PRODUCT BY SLUG ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch product",
      error: error.message,
    });
  }
};

// ==========================================
// UPDATE PRODUCT
// ==========================================

const updateProduct = async (req, res) => {
  try {
    const productId = Number(req.params.id);

    const {
      category_id,
      name,
      slug,
      description,
      base_price,
      is_customizable,
      stock_status,
    } = req.body;

    if (!category_id || !name || !slug) {
      return res.status(400).json({
        success: false,
        message:
          "Category, product name and slug are required",
      });
    }

    const product = await Product.findOne({
      mysqlId: productId,
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const category = await Category.findOne({
      mysqlId: Number(category_id),
    });

    if (!category) {
      return res.status(400).json({
        success: false,
        message: "Invalid category",
      });
    }

    const duplicateSlug = await Product.findOne({
      slug: slug.trim(),
      mysqlId: { $ne: productId },
    });

    if (duplicateSlug) {
      return res.status(409).json({
        success: false,
        message: "Product slug already exists",
      });
    }

    product.categoryId = Number(category_id);
    product.name = name.trim();
    product.slug = slug.trim();
    product.description = description || "";
    product.basePrice = Number(base_price) || 0;
    product.isCustomizable =
      is_customizable ?? true;
    product.stockStatus =
      stock_status || "available";

    await product.save();

    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
    });
  } catch (error) {
    console.error("UPDATE PRODUCT ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update product",
      error: error.message,
    });
  }
};

// ==========================================
// TOGGLE PRODUCT AVAILABILITY
// ==========================================

const toggleProductAvailability = async (
  req,
  res
) => {
  try {
    const productId = Number(req.params.id);

    const product = await Product.findOne({
      mysqlId: productId,
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    product.isActive = !product.isActive;

    await product.save();

    return res.status(200).json({
      success: true,
      message:
        "Product availability updated successfully",
      is_active: product.isActive,
    });
  } catch (error) {
    console.error(
      "TOGGLE PRODUCT AVAILABILITY ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to update product availability",
      error: error.message,
    });
  }
};

// ==========================================
// EXPORT CONTROLLERS
// ==========================================

module.exports = {
  getProducts,
  getAllProductsAdmin,
  getProductById,
  getProductBySlug,
  getProductsByCategory,
  getCompleteProductDetails,
  getCompleteProductDetailsBySlug,
  createProduct,
  updateProduct,
  toggleProductAvailability,
};