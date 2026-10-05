const Category = require("../models/Category");

// ==========================================
// GET ALL CATEGORIES
// ==========================================

const getCategories = async (req, res) => {
  try {
    const categories = await Category.find({
      isActive: true,
    })
      .sort({ createdAt: -1 })
      .lean();

    const formattedCategories = categories.map((category) => ({
      id: category.mysqlId,
      name: category.name,
      slug: category.slug,
      description: category.description,
      image_url: category.imageUrl,
      is_active: category.isActive,
      created_at: category.createdAt,
    }));

    return res.status(200).json({
      success: true,
      categories: formattedCategories,
    });
  } catch (error) {
    console.error("GET CATEGORIES ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch categories",
      error: error.message,
    });
  }
};


// ==========================================
// CREATE CATEGORY
// ==========================================

const createCategory = async (req, res) => {
  try {
    const {
      name,
      slug,
      description,
      image_url,
    } = req.body;

    // Validation
    if (!name || !slug) {
      return res.status(400).json({
        success: false,
        message: "Name and slug are required",
      });
    }

    const cleanName = name.trim();
    const cleanSlug = slug.trim();

    // Check duplicate name or slug
    const existingCategory = await Category.findOne({
      $or: [
        { name: cleanName },
        { slug: cleanSlug },
      ],
    }).lean();

    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message:
          "A category with this name or slug already exists",
      });
    }

    // Generate next legacy MySQL ID
    // This keeps compatibility with the existing frontend/backend IDs.
    const lastCategory = await Category.findOne()
      .sort({ mysqlId: -1 })
      .lean();

    const newMysqlId = lastCategory
      ? Number(lastCategory.mysqlId) + 1
      : 1;

    const category = await Category.create({
      mysqlId: newMysqlId,
      name: cleanName,
      slug: cleanSlug,
      description: description || "",
      imageUrl: image_url || "",
      isActive: true,
    });

    return res.status(201).json({
      success: true,
      message: "Category created successfully",
      categoryId: category.mysqlId,
    });
  } catch (error) {
    console.error("CREATE CATEGORY ERROR:", error);

    // MongoDB duplicate key handling
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message:
          "A category with this name or slug already exists",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to create category",
      error: error.message,
    });
  }
};


// ==========================================
// UPDATE CATEGORY
// ==========================================

const updateCategory = async (req, res) => {
  try {
    const categoryId = Number(req.params.id);

    const {
      name,
      slug,
      description,
      image_url,
    } = req.body;

    // Validation
    if (!name || !slug) {
      return res.status(400).json({
        success: false,
        message: "Category name and slug are required",
      });
    }

    const cleanName = name.trim();
    const cleanSlug = slug.trim();

    // Find category using the preserved MySQL ID
    const category = await Category.findOne({
      mysqlId: categoryId,
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    // Check whether another category already uses
    // the same name or slug
    const duplicateCategory = await Category.findOne({
      mysqlId: { $ne: categoryId },
      $or: [
        { name: cleanName },
        { slug: cleanSlug },
      ],
    }).lean();

    if (duplicateCategory) {
      return res.status(400).json({
        success: false,
        message:
          "Another category already uses this name or slug",
      });
    }

    // Update category
    category.name = cleanName;
    category.slug = cleanSlug;
    category.description = description || "";
    category.imageUrl = image_url || "";

    await category.save();

    return res.status(200).json({
      success: true,
      message: "Category updated successfully",
    });
  } catch (error) {
    console.error("UPDATE CATEGORY ERROR:", error);

    // MongoDB duplicate key handling
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message:
          "Another category already uses this name or slug",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to update category",
      error: error.message,
    });
  }
};


module.exports = {
  getCategories,
  createCategory,
  updateCategory,
};