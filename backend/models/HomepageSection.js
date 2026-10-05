const mongoose = require("mongoose");

const homepageSectionSchema = new mongoose.Schema(
  {
    sectionType: {
      type: String,
      required: true,
      enum: [
        "hero",
        "featured_categories",
        "brand_story",
        "featured_products",
        "customization_process",
        "why_choose_us",
      ],
    },

    title: {
      type: String,
      default: "",
    },

    subtitle: {
      type: String,
      default: "",
    },

    description: {
      type: String,
      default: "",
    },

    images: [
      {
        type: String,
      },
    ],

    selectedProducts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],

    settings: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    position: {
      type: Number,
      required: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "HomepageSection",
  homepageSectionSchema
);