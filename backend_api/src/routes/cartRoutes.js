const express = require("express");
const router = express.Router();
const {
  addToCart,
  getCart,
  updateQuantity,
  removeItem,
  clearCart,
} = require("../controllers/cartController");

const { protect } = require("../middlewares/authMiddleware");

// ✅ Saare cart routes protected hain — login zaroori hai
router.post("/", protect, addToCart);
router.get("/", protect, getCart);
router.put("/:itemId", protect, updateQuantity);
router.delete("/clear", protect, clearCart);
router.delete("/:itemId", protect, removeItem);

module.exports = router;