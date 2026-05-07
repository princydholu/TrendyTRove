const Cart    = require("../models/Cart");
const Product = require("../models/Product");

//  ADD TO CART
exports.addToCart = async (req, res) => {
  try {
    const { productId, quantity, size, color } = req.body;
    const userId = req.user._id;

    const normalizedColor = (color || "").toLowerCase().trim();
    const normalizedSize  = (size  || "").toLowerCase().trim();

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    const variant =
      product.variants.find(
        (v) => v.color.toLowerCase().trim() === normalizedColor
      ) || product.variants[0];

    const sizeObj =
      variant?.sizes.find(
        (s) => s.size.toLowerCase().trim() === normalizedSize
      ) || variant?.sizes[0];

    const price = sizeObj?.sellingPrice || 0;

    let cart = await Cart.findOne({ userId });

    if (cart) {
      const existingItem = cart.items.find(
        (item) =>
          item.productId.toString() === productId.toString() &&
          item.size.toLowerCase().trim()  === normalizedSize  &&
          item.color.toLowerCase().trim() === normalizedColor   
      );

      if (existingItem) {
        //  SET quantity, don't increment — frontend sends exact qty
        existingItem.quantity = quantity || existingItem.quantity;
      } else {
        cart.items.push({
          productId,
          quantity: quantity || 1,
          size:  variant?.sizes.find(
            (s) => s.size.toLowerCase().trim() === normalizedSize
          )?.size || variant?.sizes[0]?.size || size, 
          color: variant?.color || color,              
          price,
        });
      }
    } else {
      cart = new Cart({
        userId,
        items: [{
          productId,
          quantity: quantity || 1,
          size:  sizeObj?.size  || size,
          color: variant?.color || color,
          price,
        }],
      });
    }

    cart.calculateTotal();
    await cart.save();
    await cart.populate("items.productId", "name variants");

    res.status(200).json({ success: true, message: "Item added to cart", cart });
  } catch (error) {
    console.error("ADD TO CART ERROR:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

//  GET CART
exports.getCart = async (req, res) => {
  try {
    const userId = req.user._id;

    const cart = await Cart.findOne({ userId }).populate(
      "items.productId",
      "name variants"
    );

    if (!cart) {
      return res.status(200).json({
        success: true,
        cart: { items: [], totalPrice: 0 },
      });
    }

    res.status(200).json({ success: true, cart });
  } catch (error) {
    console.error("GET CART ERROR:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

//  UPDATE QUANTITY
exports.updateQuantity = async (req, res) => {
  try {
    const { quantity } = req.body;
    const userId  = req.user._id;
    const itemId  = req.params.itemId;

    if (quantity < 1) {
      return res.status(400).json({ success: false, message: "Quantity must be at least 1" });
    }

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ success: false, message: "Cart not found" });
    }

    const item = cart.items.id(itemId);
    if (!item) {
      return res.status(404).json({ success: false, message: "Item not found in cart" });
    }

    item.quantity = quantity;
    cart.calculateTotal();
    await cart.save();
    await cart.populate("items.productId", "name variants");

    res.status(200).json({ success: true, message: "Quantity updated", cart });
  } catch (error) {
    console.error("UPDATE QUANTITY ERROR:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

//  REMOVE ITEM
exports.removeItem = async (req, res) => {
  try {
    const userId = req.user._id;
    const itemId = req.params.itemId;

    const cart = await Cart.findOneAndUpdate (
      { userId },
      { $pull: { items: { _id: itemId } } },
      { returnDocument: "after" }  
    ).populate("items.productId", "name variants");

    if (!cart) {
      return res.status(404).json({ success: false, message: "Cart not found" });
    }

    cart.calculateTotal();
    await cart.save();

    res.status(200).json({ success: true, message: "Item removed", cart });
  } catch (error) {
    console.error("REMOVE ITEM ERROR:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

//  CLEAR CART
exports.clearCart = async (req, res) => {
  try {
    const userId = req.user._id;

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ success: false, message: "Cart not found" });
    }

    cart.items     = [];
    cart.totalPrice = 0;
    await cart.save();

    res.status(200).json({ success: true, message: "Cart cleared", cart });
  } catch (error) {
    console.error("CLEAR CART ERROR:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};