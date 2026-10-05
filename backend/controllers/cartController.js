const Cart = require("../models/Cart");
const CartItem = require("../models/CartItem");
const Product = require("../models/Product");
const ProductSize = require("../models/ProductSize");
const ProductImage = require("../models/ProductImage");

// ==========================================
// ADD ITEM TO CART
// ==========================================

const addToCart = async (req, res) => {
  try {
    const userId = req.user.id;

    const {
      product_id,
      size_id,
      quantity,
      customization_data,
      price,
    } = req.body;

    // Validate required fields
    if (!product_id || !price) {
      return res.status(400).json({
        success: false,
        message: "Product ID and price are required",
      });
    }

    const itemQuantity = quantity || 1;

    // Check whether product exists
    const product = await Product.findOne({
      mysqlId: Number(product_id),
    }).lean();

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Check whether user already has a cart
    let cart = await Cart.findOne({
      userId: Number(userId),
    });

    // Create cart if it doesn't exist
    if (!cart) {
      const lastCart = await Cart.findOne()
        .sort({ mysqlId: -1 })
        .lean();

      const newCartMysqlId = lastCart
        ? Number(lastCart.mysqlId) + 1
        : 1;

      cart = await Cart.create({
        mysqlId: newCartMysqlId,
        userId: Number(userId),
      });
    }

    // Generate next CartItem legacy ID
    const lastCartItem = await CartItem.findOne()
      .sort({ mysqlId: -1 })
      .lean();

    const newCartItemMysqlId = lastCartItem
      ? Number(lastCartItem.mysqlId) + 1
      : 1;

    // Add item
    const cartItem = await CartItem.create({
      mysqlId: newCartItemMysqlId,
      cartId: cart.mysqlId,
      productId: Number(product_id),
      sizeId: size_id ? Number(size_id) : null,
      quantity: Number(itemQuantity),
      customizationData: customization_data || null,
      price: Number(price),
    });

    return res.status(201).json({
      success: true,
      message: "Item added to cart successfully",
      cartItemId: cartItem.mysqlId,
    });
  } catch (error) {
    console.error("ADD TO CART ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to add item to cart",
      error: error.message,
    });
  }
};


// ==========================================
// GET LOGGED-IN USER'S CART
// ==========================================

const getCart = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find user's cart
    const cart = await Cart.findOne({
      userId: Number(userId),
    }).lean();

    // User doesn't have a cart yet
    if (!cart) {
      return res.status(200).json({
        success: true,
        cart: {
          items: [],
          total_items: 0,
          total_amount: 0,
        },
      });
    }

    // Get cart items
    const cartItems = await CartItem.find({
      cartId: cart.mysqlId,
    })
      .sort({ createdAt: -1 })
      .lean();

    // Format each cart item
    const formattedItems = await Promise.all(
      cartItems.map(async (item) => {
        // Product
        const product = await Product.findOne({
          mysqlId: item.productId,
        }).lean();

        // Size
        let size = null;

        if (item.sizeId) {
          size = await ProductSize.findOne({
            mysqlId: item.sizeId,
          }).lean();
        }

        // Primary product image
        const productImage = await ProductImage.findOne({
          productId: item.productId,
        })
          .sort({
            isPrimary: -1,
            createdAt: 1,
          })
          .lean();

        // If product no longer exists,
        // behave similar to SQL JOIN and skip it.
        if (!product) {
          return null;
        }

        return {
          cart_item_id: item.mysqlId,
          product_id: item.productId,
          size_id: item.sizeId,
          quantity: item.quantity,
          customization_data: item.customizationData,
          price: item.price,

          product_name: product.name,
          product_description: product.description,

          size_name: size?.sizeName || null,

          product_image: productImage?.imageUrl || null,

          created_at: item.createdAt,
        };
      })
    );

    // Remove missing products
    const items = formattedItems.filter(
      (item) => item !== null
    );

    // Calculate totals
    const totalItems = items.reduce(
      (sum, item) => sum + Number(item.quantity),
      0
    );

    const totalAmount = items.reduce(
      (sum, item) =>
        sum + Number(item.price) * Number(item.quantity),
      0
    );

    return res.status(200).json({
      success: true,
      cart: {
        cart_id: cart.mysqlId,
        items,
        total_items: totalItems,
        total_amount: totalAmount,
      },
    });
  } catch (error) {
    console.error("GET CART ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch cart",
      error: error.message,
    });
  }
};


// ==========================================
// UPDATE CART ITEM QUANTITY
// ==========================================

const updateCartItemQuantity = async (req, res) => {
  try {
    const userId = req.user.id;
    const cartItemId = Number(req.params.cartItemId);
    const { quantity } = req.body;

    // Validate quantity
    if (!quantity || Number(quantity) < 1) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be at least 1",
      });
    }

    // Find user's cart
    const cart = await Cart.findOne({
      userId: Number(userId),
    }).lean();

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    // Find item only if it belongs to user's cart
    const cartItem = await CartItem.findOne({
      mysqlId: cartItemId,
      cartId: cart.mysqlId,
    });

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: "Cart item not found",
      });
    }

    cartItem.quantity = Number(quantity);

    await cartItem.save();

    return res.status(200).json({
      success: true,
      message: "Cart quantity updated successfully",
    });
  } catch (error) {
    console.error("UPDATE CART ITEM ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update cart item",
      error: error.message,
    });
  }
};


// ==========================================
// REMOVE ITEM FROM CART
// ==========================================

const removeCartItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const cartItemId = Number(req.params.cartItemId);

    // Find user's cart
    const cart = await Cart.findOne({
      userId: Number(userId),
    }).lean();

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    // Delete only if item belongs to user's cart
    const deletedItem = await CartItem.findOneAndDelete({
      mysqlId: cartItemId,
      cartId: cart.mysqlId,
    });

    if (!deletedItem) {
      return res.status(404).json({
        success: false,
        message: "Cart item not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Item removed from cart successfully",
    });
  } catch (error) {
    console.error("REMOVE CART ITEM ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to remove cart item",
      error: error.message,
    });
  }
};


module.exports = {
  addToCart,
  getCart,
  updateCartItemQuantity,
  removeCartItem,
};