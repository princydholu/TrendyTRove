const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  user:    { type: mongoose.Schema.Types.ObjectId, ref: "User",    required: true },
  rating:  { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true, trim: true },
}, { timestamps: true });

// એક user એક product પર એક જ review
reviewSchema.index({ product: true, user: true }, { unique: true });

module.exports = mongoose.model("Review", reviewSchema);