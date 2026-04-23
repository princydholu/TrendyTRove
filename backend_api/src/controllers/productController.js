const Product = require("../models/Product");
const { cloudinary } = require("../config/cloudinary");

// ✅ GET ALL PRODUCTS (Filter + Sort)
exports.getAllProducts = async (req, res) => {
  try {
    const { category, subCategory, size, color, sort } = req.query;

    let filter = { isActive: true };

    if (category)    filter.category    = category;
    if (subCategory) filter.subCategory = subCategory;
    if (size)        filter.sizes       = size;
    if (color)       filter.colors      = color;

    let sortOption = {};
    if (sort === "low")  sortOption.price = 1;
    if (sort === "high") sortOption.price = -1;

    const products = await Product.find(filter)
      .populate("category", "name")
      .populate("subCategory", "name")
      .sort(sortOption);

    res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ GET SINGLE PRODUCT
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("category", "name")
      .populate("subCategory", "name");

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ ADD PRODUCT WITH IMAGE
exports.addProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      category,
      subCategory,
      sizes,
      colors,
      price,
    } = req.body;

    if (!name || !category || !price) {
      return res.status(400).json({
        success: false,
        message: "Name, category and price are required",
      });
    }

    // ✅ Cloudinary images
    let images = [];
    if (req.files && req.files.length > 0) {
      images = req.files.map((file) => file.path);
    }

    const product = await Product.create({
      name,
      description,
      category,
      subCategory,
      images,
      sizes: sizes ? JSON.parse(sizes) : [],
      colors: colors ? JSON.parse(colors) : [],
      price,
    });

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ EDIT PRODUCT WITH IMAGE
exports.editProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const {
      name,
      description,
      category,
      subCategory,
      sizes,
      colors,
      price,
      isActive,
    } = req.body;

    // ✅ New images upload hui hain?
    if (req.files && req.files.length > 0) {
      // Purani images Cloudinary se delete karo
      for (let img of product.images) {
        const publicId = img.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(
          `home-decor-products/${publicId}`
        );
      }
      product.images = req.files.map((file) => file.path);
    }

    if (name)        product.name        = name;
    if (description) product.description = description;
    if (category)    product.category    = category;
    if (subCategory) product.subCategory = subCategory;
    if (sizes)       product.sizes       = JSON.parse(sizes);
    if (colors)      product.colors      = JSON.parse(colors);
    if (price)       product.price       = price;
    if (stock)       product.stock       = stock;
    if (isActive !== undefined) product.isActive = isActive;

    await product.save();

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ DELETE PRODUCT
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // ✅ Cloudinary se images delete karo
    for (let img of product.images) {
      const publicId = img.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(
        `home-decor-products/${publicId}`
      );
    }

    await Product.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};