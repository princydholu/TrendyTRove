const Product = require("../models/Product");
const { cloudinary } = require("../config/cloudinary");

// getAllProducts
exports.getAllProducts = async (req, res) => {
  try {
    const page  = parseInt(req.query.page)  || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip  = (page - 1) * limit;

  
    const filter = {};
    if (req.query.category) {
      filter.category = req.query.category;
    }

 
    if (req.query.search) {
      filter.name = { $regex: req.query.search, $options: "i" };
    }

    const total    = await Product.countDocuments(filter);
    const products = await Product.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("category", "name");

    res.status(200).json({
      success: true,
      products,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error("Get All Product Error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

//  GET SINGLE PRODUCT
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("category", "name");

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    res.status(200).json({ success: true, product });
  } catch (error) {
    console.error("GET PRODUCT ERROR:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

//  ADD PRODUCT
exports.addProduct = async (req, res) => {
  try {
    const { name, description, category, variants, isActive } = req.body;

    if (!name || !category) {
      return res.status(400).json({ success: false, message: "Name and category are required" });
    }

    const parsedVariants = typeof variants === "string"
      ? JSON.parse(variants)
      : variants || [];

    const product = await Product.create({
      name,
      description,
      category,
      variants:  parsedVariants,
      isActive:  isActive !== undefined ? isActive : true,
    });

    res.status(201).json({ success: true, message: "Product created successfully", product });
  } catch (error) {
    console.error("ADD PRODUCT ERROR:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

//  EDIT PRODUCT
exports.editProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    const { name, description, category, variants, isActive } = req.body;

    if (name)        product.name        = name;
    if (description) product.description = description;
    if (category)    product.category    = category;
    if (isActive !== undefined) product.isActive = isActive;

    if (variants) {
      product.variants = typeof variants === "string"
        ? JSON.parse(variants)
        : variants;
    }

    await product.save();
    res.status(200).json({ success: true, message: "Product updated", product });
  } catch (error) {
    console.error("EDIT PRODUCT ERROR:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

//  DELETE PRODUCT
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    for (const variant of product.variants || []) {
      for (const img of variant.images || []) {
        try {
          const publicId = img.split("/").pop().split(".")[0];
          await cloudinary.uploader.destroy(`home-decor-products/${publicId}`);
        } catch {}
      }
    }

    await Product.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    console.error("DELETE PRODUCT ERROR:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};