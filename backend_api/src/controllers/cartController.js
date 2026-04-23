const Cart = require("../models/Cart");
const Product = require("../models/Product");

// ✅ ADD TO CART
// Logic: 
// 1. Product exist karta hai?
// 2. User ka cart hai?
//    - Hai to same product same size same color already hai?
//      - Hai to quantity badha do
//      - Nahi to naya item add karo
//    - Nahi to naya cart banao
exports.addToCart = async (req, res) => {
  try {
    const { productId, quantity, size, color } = req.body;
    const userId = req.user._id;

    // Product exist karta hai?
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Stock check karo
    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: "Insufficient stock",
      });
    }

    // User ka cart dhundo
    let cart = await Cart.findOne({ userId });

    if (cart) {
      // Cart hai — same product same size same color check karo
      const existingItem = cart.items.find(
        (item) =>
          item.productId.toString() === productId &&
          item.size === size &&
          item.color === color
      );

      if (existingItem) {
        // ✅ Already hai — quantity badha do
        existingItem.quantity += quantity || 1;
      } else {
        // ✅ Naya item add karo
        cart.items.push({
          productId,
          quantity: quantity || 1,
          size,
          color,
          price: product.price,
        });
      }
    } else {
      // ✅ Naya cart banao
      cart = new Cart({
        userId,
        items: [
          {
            productId,
            quantity: quantity || 1,
            size,
            color,
            price: product.price,
          },
        ],
      });
    }

    // Total calculate karo
    cart.calculateTotal();
    await cart.save();

    // Cart populate karke bhejo
    await cart.populate("items.productId", "name images price");

    res.status(200).json({
      success: true,
      message: "Item added to cart",
      cart,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ GET CART
// Logic: User ka cart dhundo aur products ki details ke sath bhejo
exports.getCart = async (req, res) => {
  try {
    const userId = req.user._id;

    const cart = await Cart.findOne({ userId }).populate(
      "items.productId",
      "name images price stock"
    );

    if (!cart) {
      return res.status(200).json({
        success: true,
        message: "Cart is empty",
        cart: {
          items: [],
          totalPrice: 0,
        },
      });
    }

    res.status(200).json({ success: true, cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ UPDATE QUANTITY
// Logic: Item dhundo aur quantity update karo
exports.updateQuantity = async (req, res) => {
  try {
    const { quantity } = req.body;
    const userId = req.user._id;
    const itemId = req.params.itemId;

    if (quantity < 1) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be at least 1",
      });
    }

    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    // Item dhundo
    const item = cart.items.id(itemId);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found in cart",
      });
    }


    // Quantity update karo
    item.quantity = quantity;

    // Total recalculate karo
    cart.calculateTotal();
    await cart.save();

    await cart.populate("items.productId", "name images price");

    res.status(200).json({
      success: true,
      message: "Quantity updated",
      cart,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ REMOVE ITEM FROM CART
// Logic: Item dhundo aur remove karo
exports.removeItem = async (req, res) => {
  try {
    const userId = req.user._id;
    const itemId = req.params.itemId;

    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    // Item remove karo
    cart.items = cart.items.filter(
      (item) => item._id.toString() !== itemId
    );

    // Total recalculate karo
    cart.calculateTotal();
    await cart.save();

    await cart.populate("items.productId", "name images price");

    res.status(200).json({
      success: true,
      message: "Item removed from cart",
      cart,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ CLEAR CART
// Logic: Poora cart empty karo
exports.clearCart = async (req, res) => {
  try {
    const userId = req.user._id;

    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    cart.items = [];
    cart.totalPrice = 0;
    await cart.save();

    res.status(200).json({
      success: true,
      message: "Cart cleared",
      cart,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};