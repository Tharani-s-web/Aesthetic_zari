const Address = require("../models/Address");

// ==========================================
// ADD NEW ADDRESS
// ==========================================

const addAddress = async (req, res) => {
  try {
    const userId = Number(req.user.id);

    const {
      full_name,
      phone,
      address_line1,
      address_line2,
      city,
      state,
      pincode,
      landmark,
      is_default,
    } = req.body;

    // Validate required fields
    if (
      !full_name ||
      !phone ||
      !address_line1 ||
      !city ||
      !state ||
      !pincode
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required address fields",
      });
    }

    // If this address should be default,
    // remove default status from existing addresses
    if (is_default) {
      await Address.updateMany(
        { userId },
        { $set: { isDefault: false } }
      );
    }

    // Generate next legacy MySQL ID
    const lastAddress = await Address.findOne()
      .sort({ mysqlId: -1 })
      .lean();

    const newMysqlId = lastAddress
      ? Number(lastAddress.mysqlId) + 1
      : 1;

    // Create address
    const address = await Address.create({
      mysqlId: newMysqlId,
      userId,
      fullName: full_name.trim(),
      phone: phone.trim(),
      addressLine1: address_line1.trim(),
      addressLine2: address_line2
        ? address_line2.trim()
        : "",
      city: city.trim(),
      state: state.trim(),
      pincode: pincode.trim(),
      landmark: landmark
        ? landmark.trim()
        : "",
      isDefault: Boolean(is_default),
    });

    return res.status(201).json({
      success: true,
      message: "Address added successfully",
      addressId: address.mysqlId,
    });
  } catch (error) {
    console.error("ADD ADDRESS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to add address",
      error: error.message,
    });
  }
};


// ==========================================
// GET LOGGED-IN USER'S ADDRESSES
// ==========================================

const getAddresses = async (req, res) => {
  try {
    const userId = Number(req.user.id);

    const addresses = await Address.find({
      userId,
    })
      .sort({
        isDefault: -1,
        createdAt: -1,
      })
      .lean();

    const formattedAddresses = addresses.map(
      (address) => ({
        id: address.mysqlId,
        full_name: address.fullName,
        phone: address.phone,
        address_line1: address.addressLine1,
        address_line2: address.addressLine2,
        city: address.city,
        state: address.state,
        pincode: address.pincode,
        landmark: address.landmark,
        is_default: address.isDefault,
        created_at: address.createdAt,
        updated_at: address.updatedAt,
      })
    );

    return res.status(200).json({
      success: true,
      total_addresses: formattedAddresses.length,
      addresses: formattedAddresses,
    });
  } catch (error) {
    console.error("GET ADDRESSES ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch addresses",
      error: error.message,
    });
  }
};


// ==========================================
// UPDATE ADDRESS
// ==========================================

const updateAddress = async (req, res) => {
  try {
    const userId = Number(req.user.id);
    const addressId = Number(req.params.addressId);

    const {
      full_name,
      phone,
      address_line1,
      address_line2,
      city,
      state,
      pincode,
      landmark,
    } = req.body;

    // Validate required fields
    if (
      !full_name ||
      !phone ||
      !address_line1 ||
      !city ||
      !state ||
      !pincode
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required address fields",
      });
    }

    // Find address belonging to logged-in user
    const address = await Address.findOne({
      mysqlId: addressId,
      userId,
    });

    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found or access denied",
      });
    }

    // Update fields
    address.fullName = full_name.trim();
    address.phone = phone.trim();
    address.addressLine1 = address_line1.trim();
    address.addressLine2 = address_line2
      ? address_line2.trim()
      : "";
    address.city = city.trim();
    address.state = state.trim();
    address.pincode = pincode.trim();
    address.landmark = landmark
      ? landmark.trim()
      : "";

    await address.save();

    return res.status(200).json({
      success: true,
      message: "Address updated successfully",
    });
  } catch (error) {
    console.error("UPDATE ADDRESS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update address",
      error: error.message,
    });
  }
};


// ==========================================
// DELETE ADDRESS
// ==========================================

const deleteAddress = async (req, res) => {
  try {
    const userId = Number(req.user.id);
    const addressId = Number(req.params.addressId);

    // Delete only if address belongs to logged-in user
    const deletedAddress =
      await Address.findOneAndDelete({
        mysqlId: addressId,
        userId,
      });

    if (!deletedAddress) {
      return res.status(404).json({
        success: false,
        message: "Address not found or access denied",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Address deleted successfully",
    });
  } catch (error) {
    console.error("DELETE ADDRESS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete address",
      error: error.message,
    });
  }
};


// ==========================================
// SET DEFAULT ADDRESS
// ==========================================

const setDefaultAddress = async (req, res) => {
  try {
    const userId = Number(req.user.id);
    const addressId = Number(req.params.addressId);

    // Verify that the address belongs to
    // the logged-in user
    const address = await Address.findOne({
      mysqlId: addressId,
      userId,
    });

    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found or access denied",
      });
    }

    // Remove default status from all user's addresses
    await Address.updateMany(
      { userId },
      { $set: { isDefault: false } }
    );

    // Set selected address as default
    address.isDefault = true;

    await address.save();

    return res.status(200).json({
      success: true,
      message: "Default address updated successfully",
    });
  } catch (error) {
    console.error("SET DEFAULT ADDRESS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to set default address",
      error: error.message,
    });
  }
};


module.exports = {
  addAddress,
  getAddresses,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
};