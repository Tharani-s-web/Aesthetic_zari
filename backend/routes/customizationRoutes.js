const express = require("express");

const {
  getCustomizationFields,
  addCustomizationField,
  deleteCustomizationField,
} = require("../controllers/customizationController");

const router = express.Router();


// GET customization fields for a product

router.get("/:productId", getCustomizationFields);


// ADD customization field

router.post("/:productId", addCustomizationField);


// DELETE customization field

router.delete(
  "/field/:fieldId",
  deleteCustomizationField
);


module.exports = router;