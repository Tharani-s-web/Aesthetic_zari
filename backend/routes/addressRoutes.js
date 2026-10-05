const express = require("express");

const { addAddress,
        getAddresses,
        updateAddress,
        deleteAddress,
        setDefaultAddress,
 } = require("../controllers/addressController");

const authenticateToken = require("../middleware/authMiddleware");

const router = express.Router();
//get
router.get("/",authenticateToken, getAddresses)
// Add address
router.post("/", authenticateToken, addAddress);
//update
router.put("/:addressId", authenticateToken,updateAddress);
//delete
router.delete("/:addressId",authenticateToken,deleteAddress);
//set default
router.put(
    "/:addressId/default",
    authenticateToken,
    setDefaultAddress
)

module.exports = router;