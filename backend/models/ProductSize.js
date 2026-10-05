const mongoose = require("mongoose");

const productSizeSchema = new mongoose.Schema(
  {
    // Original MySQL product_sizes.id
    mysqlId: {
      type: Number,
      required: true,
      unique: true,
    },

    // Original MySQL products.id
    productId: {
      type: Number,
      required: true,
    },

    sizeName: {
      type: String,
      required: true,
      trim: true,
    },

    price: {
      type: Number,
      required: true,
    },

    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const ProductSize = mongoose.model(
  "ProductSize",
  productSizeSchema
);

module.exports = ProductSize;