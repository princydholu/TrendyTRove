const express = require("express");
const router  = express.Router();
const { protect, isAdmin } = require("../middlewares/authMiddleware");
const {
  addReview,
  getProductReviews,
  deleteReview,
  getAllReviews,
} = require("../controllers/reviewController");

router.post("/",                    protect,          addReview);
router.get("/:productId",                             getProductReviews);
router.delete("/:id",               protect, isAdmin, deleteReview);
router.get("/admin/all",            protect, isAdmin, getAllReviews);

module.exports = router;