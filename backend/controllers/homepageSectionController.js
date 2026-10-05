const HomepageSection = require("../models/HomepageSection");

// ==========================================
// GET ALL HOMEPAGE SECTIONS
// ==========================================

const getHomepageSections = async (req, res) => {
  try {
    const sections = await HomepageSection.find()
      .sort({ position: 1 });

    return res.status(200).json({
      success: true,
      sections,
      debug: sections.map((section) => ({
        id: section._id,
        sectionType: section.sectionType,
        settings: section.settings,
        selectedCategories:
          section.settings?.selectedCategories || [],
      })),
    });
  } catch (error) {
    console.error(
      "Get homepage sections error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch homepage sections",
      error: error.message,
    });
  }
};

// ==========================================
// GET ACTIVE HOMEPAGE SECTIONS
// ==========================================

const getActiveHomepageSections = async (
  req,
  res
) => {
  try {
    const sections = await HomepageSection.find({
      isActive: true,
    }).sort({ position: 1 });

    return res.status(200).json({
      success: true,
      sections,
    });
  } catch (error) {
    console.error(
      "Get active homepage sections error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch active homepage sections",
      error: error.message,
    });
  }
};

// ==========================================
// CREATE HOMEPAGE SECTION
// ==========================================

const createHomepageSection = async (
  req,
  res
) => {
  try {
    const {
      sectionType,
      title,
      subtitle,
      description,
      images,
      selectedProducts,
      settings,
      position,
      isActive,
    } = req.body;

    if (!sectionType) {
      return res.status(400).json({
        success: false,
        message: "Section type is required",
      });
    }

    if (
      position === undefined ||
      position === null
    ) {
      return res.status(400).json({
        success: false,
        message: "Position is required",
      });
    }

    const section =
      await HomepageSection.create({
        sectionType,
        title: title || "",
        subtitle: subtitle || "",
        description: description || "",
        images: images || [],
        selectedProducts:
          selectedProducts || [],
        settings: settings || {},
        position,
        isActive:
          isActive !== undefined
            ? isActive
            : true,
      });

    return res.status(201).json({
      success: true,
      message:
        "Homepage section created successfully",
      section,
    });
  } catch (error) {
    console.error(
      "Create homepage section error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to create homepage section",
      error: error.message,
    });
  }
};

// ==========================================
// UPDATE HOMEPAGE SECTION
// ==========================================

const updateHomepageSection = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    const {
      sectionType,
      title,
      subtitle,
      description,
      images,
      selectedProducts,
      settings,
      position,
      isActive,
    } = req.body;

    const section =
      await HomepageSection.findById(id);

    if (!section) {
      return res.status(404).json({
        success: false,
        message: "Homepage section not found",
      });
    }

    if (sectionType !== undefined) {
      section.sectionType = sectionType;
    }

    if (title !== undefined) {
      section.title = title;
    }

    if (subtitle !== undefined) {
      section.subtitle = subtitle;
    }

    if (description !== undefined) {
      section.description = description;
    }

    if (images !== undefined) {
      section.images = images;
    }

    if (selectedProducts !== undefined) {
      section.selectedProducts =
        selectedProducts;
    }

    if (settings !== undefined) {
      section.settings = settings;
    }

    if (position !== undefined) {
      section.position = position;
    }

    if (isActive !== undefined) {
      section.isActive = isActive;
    }

    await section.save();

    return res.status(200).json({
      success: true,
      message:
        "Homepage section updated successfully",
      section,
    });
  } catch (error) {
    console.error(
      "Update homepage section error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to update homepage section",
      error: error.message,
    });
  }
};

// ==========================================
// DELETE HOMEPAGE SECTION
// ==========================================

const deleteHomepageSection = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    const section =
      await HomepageSection.findByIdAndDelete(id);

    if (!section) {
      return res.status(404).json({
        success: false,
        message: "Homepage section not found",
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "Homepage section deleted successfully",
    });
  } catch (error) {
    console.error(
      "Delete homepage section error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to delete homepage section",
      error: error.message,
    });
  }
};

module.exports = {
  getHomepageSections,
  getActiveHomepageSections,
  createHomepageSection,
  updateHomepageSection,
  deleteHomepageSection,
};