const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const {
  getAllProducts,
  getProductById,
  addProduct,
  editProduct,
  deleteProduct,
} = require("../controllers/productController");
const { protect, isAdmin } = require("../middlewares/authMiddleware");
const { upload } = require("../config/cloudinary");

// ✅ Admin all products
router.get("/admin/all", protect, isAdmin, async (req, res) => {
  try {
    const products = await Product.find({})
      .populate("category", "name")
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, products });
  } catch (error) {
    console.error("ADMIN ALL PRODUCTS ERROR:", error.message); 
    res.status(500).json({ success: false, message: error.message });
  }
});

// Public
router.get("/", getAllProducts);
router.get("/:id", getProductById);

// Admin 
router.post("/", protect, isAdmin, upload.array("images", 50), addProduct);
router.put("/:id", protect, isAdmin, upload.array("images", 50), editProduct);
router.delete("/:id", protect, isAdmin, deleteProduct);

module.exports = router;