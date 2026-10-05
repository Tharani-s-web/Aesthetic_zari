const mongoose = require("mongoose");

const customizationFieldSchema = new mongoose.Schema(
  {
    mysqlId: {
      type: Number,
      required: true,
      unique: true,
    },

    productId: {
      type: Number,
      required: true,
    },

    fieldName: {
      type: String,
      required: true,
      trim: true,
    },

    fieldLabel: {
      type: String,
      required: true,
      trim: true,
    },

    fieldType: {
      type: String,
      enum: [
        "text",
        "textarea",
        "number",
        "date",
        "select",
        "image",
      ],
      required: true,
    },

    placeholder: {
      type: String,
      default: "",
    },

    options: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },

    isRequired: {
      type: Boolean,
      default: false,
    },

    displayOrder: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: {
      createdAt: "createdAt",
      updatedAt: false,
    },
  }
);

const CustomizationField = mongoose.model(
  "CustomizationField",
  customizationFieldSchema
);

module.exports = CustomizationField;