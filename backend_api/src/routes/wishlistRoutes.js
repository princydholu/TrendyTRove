const express = require("express");
const router = express.Router();
const {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
} = require("../controllers/wishlistController");
const { protect } = require("../middlewares/authMiddleware");

router.get("/",              protect, getWishlist);
router.post("/",             protect, addToWishlist);
router.delete("/clear",      protect, clearWishlist);      
router.delete("/:productId", protect, removeFromWishlist);  

module.exports = router;