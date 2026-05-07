const Wishlist = require("../models/Wishlist");

// getWishlist 
exports.getWishlist = async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ userId: req.user._id })
      .populate({
        path: "products",
        select: "name description category variants isActive",
        populate: {
          path: "category",
          select: "name",
        },
      });

    res.status(200).json({
      success: true,
      products: wishlist?.products || [],
    });
  } catch (err) {
    console.error("WISHLIST ERROR:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Add to Wishlist 
exports.addToWishlist = async (req, res) => {
  try {
    const { productId } = req.body;

    let wishlist = await Wishlist.findOne({ userId: req.user._id });

    if (!wishlist) {
      wishlist = await Wishlist.create({
        userId: req.user._id,
        products: [productId],
      });
    } else {
      // Already exists check
      if (wishlist.products.includes(productId)) {
        return res.status(400).json({
          success: false,
          message: "Product already in wishlist",
        });
      }
      wishlist.products.push(productId);
      await wishlist.save();
    }

    res.status(200).json({ success: true, message: "Added to wishlist" });
  } catch (err) {
    console.error("Add to Whishlist ERROR:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Remove from Wishlist 
exports.removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    const wishlist = await Wishlist.findOne({ userId: req.user._id });

    if (!wishlist) {
      return res.status(404).json({ success: false, message: "Wishlist not found" });
    }

    wishlist.products = wishlist.products.filter(
      (id) => id.toString() !== productId
    );

    await wishlist.save();

    res.status(200).json({ success: true, message: "Removed from wishlist" });
  } catch (err) {
    console.error("Remove Wishlist ERROR:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Clear Wishlist 
exports.clearWishlist = async (req, res) => {
  try {
    await Wishlist.findOneAndUpdate(
      { userId: req.user._id },
      { products: [] }
    );

    res.status(200).json({ success: true, message: "Wishlist cleared" });
  } catch (err) {
    console.error("Clear Wishlist ERROR:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};