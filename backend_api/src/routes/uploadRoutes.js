const express = require("express");
const router = express.Router();
const { upload } = require("../config/cloudinary");
const { protect, isAdmin } = require("../middlewares/authMiddleware");

router.post(
  "/products",
  protect,
  isAdmin,
  (req, res, next) => {
    upload.any()(req, res, (err) => {
      if (err) {
        console.error("MULTER/CLOUDINARY ERROR:", err.message, err.stack);
        return res.status(500).json({ success: false, message: err.message });
      }
      next();
    });
  },
  (req, res) => {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: "No images uploaded" });
    }
    const urls = req.files.map((file) => file.path);
    res.status(200).json({ success: true, urls });
  }
);

module.exports = router;