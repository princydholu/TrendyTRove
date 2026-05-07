const mongoose = require("mongoose");

// New: size with pricing per size
const sizeSchema = new mongoose.Schema({
  size:          { type: String, required: true },
  sellingPrice:  { type: Number, required: true },
  originalPrice: { type: Number },
  discount:      { type: Number },
});

// New: variant = one color with its own sizes+prices+images
const variantSchema = new mongoose.Schema({
  color:    { type: String, required: true },
  colorHex: { type: String, default: "#000000" },
  images:   [{ type: String }],
  sizes:    [sizeSchema],
});

const productSchema = new mongoose.Schema(
  {
    name:        { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    category:    { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
    variants:    [variantSchema],
    isActive:    { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);