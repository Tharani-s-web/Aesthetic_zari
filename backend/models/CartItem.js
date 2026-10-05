const mongoose = require("mongoose");

const cartItemSchema = new mongoose.Schema(
  {
    mysqlId: {
      type: Number,
      required: true,
      unique: true,
    },

    cartId: {
      type: Number,
      required: true,
    },

    productId: {
      type: Number,
      required: true,
    },

    sizeId: {
      type: Number,
      default: null,
    },

    quantity: {
      type: Number,
      required: true,
      default: 1,
    },

    customizationData: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },

    price: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const CartItem = mongoose.model("CartItem", cartItemSchema);

module.exports = CartItem;