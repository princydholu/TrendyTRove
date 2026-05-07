const crypto   = require("crypto");
const Order    = require("../models/Order");
const Cart     = require("../models/Cart");
const Razorpay = require("razorpay");

const razorpay = new Razorpay({
  key_id:     process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ── Create Razorpay Order ──
exports.createRazorpayOrder = async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount) {
      return res.status(400).json({ success: false, message: "Amount is required" });
    }

    const order = await razorpay.orders.create({
      amount:   Math.round(amount * 100),
      currency: "INR",
      receipt:  `receipt_${Date.now()}`,
    });

    res.status(200).json({
      success: true,
      order,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    console.error("CREATE RAZORPAY ORDER ERROR:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Place Order After Payment Verify ──
exports.placeOrder = async (req, res) => {  
  try {
    console.log("BODY:", JSON.stringify(req.body, null, 2));
    const {
      items, address, amount,
      razorpayOrderId, razorpayPaymentId,
      razorpaySignature, type,
    } = req.body;

    // Validate required fields
    if (!items || !address || !amount || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return res.status(400).json({ success: false, message: "Missing required order fields" });
    }

    // Verify Razorpay signature
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest("hex");

    if (expectedSignature !== razorpaySignature) {
      return res.status(400).json({ success: false, message: "Invalid payment signature" });
    }

    // Save order
    const order = await Order.create({
      customer:          req.user._id,
      items,
      address,
      amount,
      paymentMethod:     "Razorpay",
      paymentStatus:     "Paid",
      razorpayOrderId,
      razorpayPaymentId,
      orderStatus:       "Processing",
    });

    if (type === "cart") {
      await Cart.findOneAndUpdate(
        { userId: req.user._id },
        { items: [], totalPrice: 0 }
      );
    }

    res.status(201).json({ success: true, order });
  } catch (error) {
    console.error("PLACE ORDER ERROR STACK:", error.stack); 
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── My Orders (User) ──
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ customer: req.user._id })
      .populate("items.product", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, orders });
  } catch (err) {
    console.error("GET MY ORDERS ERROR:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── All Orders (Admin) ──
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate("customer", "name email")
      .populate("items.product", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, orders });
  } catch (err) {
    console.error("GET ALL ORDERS ERROR:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Update Order Status (Admin) ──
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ success: false, message: "Status is required" });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { orderStatus: status },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    res.status(200).json({ success: true, order });
  } catch (err) {
    console.error("UPDATE ORDER STATUS ERROR:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Delete Order (Admin) ──
exports.deleteOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    res.status(200).json({ success: true, message: "Order deleted" });
  } catch (err) {
    console.error("DELETE ORDER ERROR:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};