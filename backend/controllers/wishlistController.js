const Wishlist = require("../models/Wishlist");
const Product = require("../models/Product");
const Category = require("../models/Category");
const ProductImage = require("../models/ProductImage");

// ==========================================
// ADD PRODUCT TO WISHLIST
// ==========================================

const addToWishlist = async (req, res) => {
  try {
    const userId = Number(req.user.id);
    const { product_id } = req.body;

    // Validate product ID
    if (!product_id) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required",
      });
    }

    const productId = Number(product_id);

    // Check whether product exists
    const product = await Product.findOne({
      mysqlId: productId,
    }).lean();

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Check whether product already exists in wishlist
    const existingWishlistItem = await Wishlist.findOne({
      userId,
      productId,
    }).lean();

    // Prevent duplicate wishlist items
    if (existingWishlistItem) {
      return res.status(400).json({
        success: false,
        message: "Product already exists in wishlist",
      });
    }

    // Generate next legacy MySQL ID
    const lastWishlistItem = await Wishlist.findOne()
      .sort({ mysqlId: -1 })
      .lean();

    const newMysqlId = lastWishlistItem
      ? Number(lastWishlistItem.mysqlId) + 1
      : 1;

    // Add product to wishlist
    const wishlistItem = await Wishlist.create({
      mysqlId: newMysqlId,
      userId,
      productId,
    });

    return res.status(201).json({
      success: true,
      message: "Product added to wishlist successfully",
      wishlistItemId: wishlistItem.mysqlId,
    });
  } catch (error) {
    console.error("ADD TO WISHLIST ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to add product to wishlist",
      error: error.message,
    });
  }
};


// ==========================================
// GET LOGGED-IN USER'S WISHLIST
// ==========================================

const getWishlist = async (req, res) => {
  try {
    const userId = Number(req.user.id);

    // Get user's wishlist
    const wishlistItems = await Wishlist.find({
      userId,
    })
      .sort({ createdAt: -1 })
      .lean();

    // Build product details
    const formattedWishlist = await Promise.all(
      wishlistItems.map(async (wishlistItem) => {
        // Product
        const product = await Product.findOne({
          mysqlId: wishlistItem.productId,
        }).lean();

        // If product no longer exists, skip it
        if (!product) {
          return null;
        }

        // Category
        const category = await Category.findOne({
          mysqlId: product.categoryId,
        }).lean();

        // Primary product image
        const productImage = await ProductImage.findOne({
          productId: wishlistItem.productId,
        })
          .sort({
            isPrimary: -1,
            createdAt: 1,
          })
          .lean();

        return {
          wishlist_item_id: wishlistItem.mysqlId,
          product_id: wishlistItem.productId,
          created_at: wishlistItem.createdAt,

          product_name: product.name,
          product_description: product.description,
          product_price:product.basePrice,
          category_name: category?.name || null,

          product_image: productImage?.imageUrl || null,
        };
      })
    );

    // Remove missing products
    const wishlist = formattedWishlist.filter(
      (item) => item !== null
    );

    return res.status(200).json({
      success: true,
      total_items: wishlist.length,
      wishlist,
    });
  } catch (error) {
    console.error("GET WISHLIST ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch wishlist",
      error: error.message,
    });
  }
};


// ==========================================
// REMOVE PRODUCT FROM WISHLIST
// ==========================================

const removeFromWishlist = async (req, res) => {
  try {
    const userId = Number(req.user.id);
    const wishlistItemId = Number(
      req.params.wishlistItemId
    );

    // Delete only if the item belongs to this user
    const deletedItem = await Wishlist.findOneAndDelete({
      mysqlId: wishlistItemId,
      userId,
    });

    if (!deletedItem) {
      return res.status(404).json({
        success: false,
        message: "Wishlist item not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Product removed from wishlist successfully",
    });
  } catch (error) {
    console.error("REMOVE FROM WISHLIST ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to remove product from wishlist",
      error: error.message,
    });
  }
};


module.exports = {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
};