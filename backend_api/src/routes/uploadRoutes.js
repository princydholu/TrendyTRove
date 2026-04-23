const express = require("express");
const router = express.Router();
const { upload } = require("../config/cloudinary");
const { protect, isAdmin } = require("../middlewares/authMiddleware");

// POST /api/upload/products
router.post(
  "/products",
  protect,
  isAdmin,
  upload.array("images", 6),
  (req, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ 
          success: false, 
          message: "No images uploaded" 
        });
      }
      const urls = req.files.map((file) => file.path);
      res.status(200).json({ success: true, urls });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

module.exports = router;