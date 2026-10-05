const express = require("express");
const router = express.Router();

const {
  getHomepageSections,
  getActiveHomepageSections,
  createHomepageSection,
  updateHomepageSection,
  deleteHomepageSection,
} = require("../controllers/homepageSectionController");

router.get("/", getHomepageSections);

router.get("/active", getActiveHomepageSections);

router.post("/", createHomepageSection);

router.put("/:id", updateHomepageSection);

router.delete("/:id", deleteHomepageSection);

module.exports = router;