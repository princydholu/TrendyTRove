const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },

    // Category reference
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    subCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },

    // ✅ Multiple images
    images: [
      {
        type: String,
      }
    ],

    // ✅ Multiple sizes
    sizes: [
      {
        type: String,
      }
    ],

    // ✅ Multiple colors
    colors: [
      {
        type: String,
      }
    ],

    price: {
      type: Number,
      required: [true, "Price is required"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);