const Review  = require("../models/Review");
const Order   = require("../models/Order");

// ── Add Review ──
exports.addReview = async (req, res) => {
  try {
    const { productId, rating, comment } = req.body;

    // Check — user એ order કર્યો છે?
    // const hasBought = await Order.findOne({
    //   customer:    req.user._id,
    //   orderStatus: "Delivered",
    //   "items.product": productId,
    // });

    // if (!hasBought) {
    //   return res.status(403).json({ success: false, message: "Only buyers can review" });
    // }

    // Already reviewed?
    const existing = await Review.findOne({ product: productId, user: req.user._id });
    if (existing) {
      return res.status(400).json({ success: false, message: "Already reviewed" });
    }

    const review = await Review.create({
      product: productId,
      user:    req.user._id,
      rating,
      comment,
    });

    await review.populate("user", "name");
    res.status(201).json({ success: true, review });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Get Reviews by Product ──
exports.getProductReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.productId })
      .populate("user", "name")
      .sort({ createdAt: -1 });

    const avgRating = reviews.length
      ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
      : 0;

    res.json({ success: true, reviews, avgRating, total: reviews.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Delete Review (Admin) ──
exports.deleteReview = async (req, res) => {
  try {
    await Review.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Review deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Get All Reviews (Admin) ──
exports.getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find({})
      .populate("user",    "name email")
      .populate("product", "name")
      .sort({ createdAt: -1 });
    res.json({ success: true, reviews });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};