const CustomizationField = require("../models/CustomizationField");
const Product = require("../models/Product");

// ==========================================
// GET CUSTOMIZATION FIELDS FOR A PRODUCT
// ==========================================

const getCustomizationFields = async (req, res) => {
  try {
    const productId = Number(req.params.productId);

    if (Number.isNaN(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const fields = await CustomizationField.find({
      productId,
    })
      .sort({
        displayOrder: 1,
        mysqlId: 1,
      })
      .lean();

    const formattedFields = fields.map((field) => ({
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
    }));

    return res.status(200).json({
      success: true,
      fields: formattedFields,
    });
  } catch (error) {
    console.error("GET CUSTOMIZATION FIELDS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch customization fields",
      error: error.message,
    });
  }
};


// ==========================================
// ADD CUSTOMIZATION FIELD
// ==========================================

const addCustomizationField = async (req, res) => {
  try {
    const productId = Number(req.params.productId);

    const {
      field_name,
      field_label,
      field_type,
      placeholder,
      options,
      is_required,
      display_order,
    } = req.body;

    // Validate product ID
    if (Number.isNaN(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    // Validate required fields
    if (!field_name || !field_label || !field_type) {
      return res.status(400).json({
        success: false,
        message: "Field name, label and type are required",
      });
    }

    // Check whether product exists
    const product = await Product.findOne({
      mysqlId: productId,
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Validate field type against MongoDB model
    const allowedFieldTypes = [
      "text",
      "textarea",
      "number",
      "date",
      "select",
      "image",
    ];

    if (!allowedFieldTypes.includes(field_type)) {
      return res.status(400).json({
        success: false,
        message: "Invalid customization field type",
      });
    }

    // Generate next legacy MySQL ID
    const lastField = await CustomizationField.findOne()
      .sort({ mysqlId: -1 })
      .lean();

    const newMysqlId = lastField
      ? Number(lastField.mysqlId) + 1
      : 1;

    // Create customization field
    const field = await CustomizationField.create({
      mysqlId: newMysqlId,
      productId,
      fieldName: field_name.trim(),
      fieldLabel: field_label.trim(),
      fieldType: field_type,
      placeholder: placeholder
        ? placeholder.trim()
        : "",
      options: options ?? null,
      isRequired: Boolean(is_required),
      displayOrder:
        display_order !== undefined
          ? Number(display_order)
          : 0,
    });

    return res.status(201).json({
      success: true,
      message: "Customization field added successfully",
      fieldId: field.mysqlId,
    });
  } catch (error) {
    console.error("ADD CUSTOMIZATION FIELD ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to add customization field",
      error: error.message,
    });
  }
};


// ==========================================
// DELETE CUSTOMIZATION FIELD
// ==========================================

const deleteCustomizationField = async (req, res) => {
  try {
    const fieldId = Number(req.params.fieldId);

    if (Number.isNaN(fieldId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid field ID",
      });
    }

    const deletedField =
      await CustomizationField.findOneAndDelete({
        mysqlId: fieldId,
      });

    if (!deletedField) {
      return res.status(404).json({
        success: false,
        message: "Customization field not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Customization field deleted successfully",
    });
  } catch (error) {
    console.error("DELETE CUSTOMIZATION FIELD ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete customization field",
      error: error.message,
    });
  }
};


module.exports = {
  getCustomizationFields,
  addCustomizationField,
  deleteCustomizationField,
};