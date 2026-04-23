const Category = require("../models/Category");

// ✅ GET ALL CATEGORIES
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true });
    res.status(200).json({ success: true, categories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ GET MAIN CATEGORIES (level 1)
exports.getMainCategories = async (req, res) => {
  try {
    const categories = await Category.find({ 
      level: 1,  
      isActive: true 
    });
    res.status(200).json({ success: true, categories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ GET CHILDREN OF A CATEGORY
exports.getChildCategories = async (req, res) => {
  try {
    const children = await Category.find({
      parentId: req.params.id,
      isActive: true,
    });
    res.status(200).json({ success: true, children });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ ADD CATEGORY (Admin)
exports.addCategory = async (req, res) => {
  try {
    const { name, parentId, level, image } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Category name is required",
      });
    }

    const category = await Category.create({
      name,
      parentId: parentId || null,
      level: level || 1,
      image,
    });

    res.status(201).json({
      success: true,
      message: "Category created successfully",
      category,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ EDIT CATEGORY (Admin)
exports.editCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    const { name, image, isActive } = req.body;

    if (name)   category.name   = name;
    if (image)  category.image  = image;
    if (isActive !== undefined) category.isActive = isActive;

    await category.save();

    res.status(200).json({
      success: true,
      message: "Category updated successfully",
      category,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ DELETE CATEGORY (Admin)
exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    await Category.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};