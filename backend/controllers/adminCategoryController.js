const Category = require("../models/Category");

// ==========================================
// GET ALL CATEGORIES (ADMIN ONLY)
// ==========================================

const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find({})
      .sort({ createdAt: -1 })
      .lean();

    const formattedCategories = categories.map(
      (category) => ({
        id: category.mysqlId,
        name: category.name,
        slug: category.slug,
        description: category.description,
        image_url: category.imageUrl,
        is_active: category.isActive,
        created_at: category.createdAt,
      })
    );

    return res.status(200).json({
      success: true,
      count: formattedCategories.length,
      categories: formattedCategories,
    });
  } catch (error) {
    console.error(
      "ADMIN GET ALL CATEGORIES ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch categories",
      error: error.message,
    });
  }
};


// ==========================================
// ADD CATEGORY (ADMIN ONLY)
// ==========================================

const addCategory = async (req, res) => {
  try {
    const {
      name,
      slug,
      description,
      image_url,
    } = req.body;

    // Validate required fields
    if (!name || !slug) {
      return res.status(400).json({
        success: false,
        message: "Name and slug are required",
      });
    }

    const trimmedName = name.trim();
    const trimmedSlug = slug.trim();

    // Check duplicate name or slug
    const existingCategory = await Category.findOne({
      $or: [
        { name: trimmedName },
        { slug: trimmedSlug },
      ],
    }).lean();

    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message:
          "Category with this name or slug already exists",
      });
    }

    // Generate next numeric ID
    const lastCategory = await Category.findOne()
      .sort({ mysqlId: -1 })
      .lean();

    const categoryId = lastCategory
      ? Number(lastCategory.mysqlId) + 1
      : 1;

    // Create category
    await Category.create({
      mysqlId: categoryId,
      name: trimmedName,
      slug: trimmedSlug,
      description: description || "",
      imageUrl: image_url || "",
      isActive: true,
    });

    return res.status(201).json({
      success: true,
      message: "Category added successfully",
      category_id: categoryId,
    });
  } catch (error) {
    console.error(
      "ADMIN ADD CATEGORY ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to add category",
      error: error.message,
    });
  }
};


// ==========================================
// UPDATE CATEGORY (ADMIN ONLY)
// ==========================================

const updateCategory = async (req, res) => {
  try {
    const categoryId = Number(
      req.params.categoryId
    );

    const {
      name,
      slug,
      description,
      image_url,
    } = req.body;

    // Check category
    const category = await Category.findOne({
      mysqlId: categoryId,
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    // Check duplicate name if changed
    if (
      name !== undefined &&
      name.trim() !== category.name
    ) {
      const duplicateName =
        await Category.findOne({
          name: name.trim(),
          mysqlId: { $ne: categoryId },
        }).lean();

      if (duplicateName) {
        return res.status(400).json({
          success: false,
          message:
            "Category with this name or slug already exists",
        });
      }

      category.name = name.trim();
    }

    // Check duplicate slug if changed
    if (
      slug !== undefined &&
      slug.trim() !== category.slug
    ) {
      const duplicateSlug =
        await Category.findOne({
          slug: slug.trim(),
          mysqlId: { $ne: categoryId },
        }).lean();

      if (duplicateSlug) {
        return res.status(400).json({
          success: false,
          message:
            "Category with this name or slug already exists",
        });
      }

      category.slug = slug.trim();
    }

    // Update supplied fields
    if (description !== undefined) {
      category.description = description;
    }

    if (image_url !== undefined) {
      category.imageUrl = image_url;
    }

    await category.save();

    return res.status(200).json({
      success: true,
      message: "Category updated successfully",
      category_id: categoryId,
    });
  } catch (error) {
    console.error(
      "ADMIN UPDATE CATEGORY ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to update category",
      error: error.message,
    });
  }
};


module.exports = {
  getAllCategories,
  addCategory,
  updateCategory,
};