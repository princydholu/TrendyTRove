const Category = require("../models/Category");

//  GET ALL CATEGORIES
exports.getAllCategories = async (req, res) => {
  try {
    const page  = parseInt(req.query.page)  || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip  = (page - 1) * limit;

    const total      = await Category.countDocuments();
    const categories = await Category.find()
      .sort({ createdAt: -1 })        
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      categories,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error("Get All Category Error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

//  GET MAIN CATEGORIES (level 1)
exports.getMainCategories = async (req, res) => {
  try {
    const categories = await Category.find({ 
      level: 1,  
      isActive: true 
    });
    res.status(200).json({ success: true, categories });
  } catch (error) {
    console.error("Main Category Error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

//  GET CHILDREN OF A CATEGORY
exports.getChildCategories = async (req, res) => {
  try {
    const children = await Category.find({
      parentId: req.params.id,
      isActive: true,
    });
    res.status(200).json({ success: true, children });
  } catch (error) {
    console.error("Get Children Error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

//  ADD CATEGORY (Admin)
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
    console.error("Add category Error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

//  EDIT CATEGORY (Admin)
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
    console.error("Edit Category Error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

//  DELETE CATEGORY (Admin)
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
    console.error("Delete Category Error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};