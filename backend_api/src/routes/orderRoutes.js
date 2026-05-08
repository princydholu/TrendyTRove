const express = require("express");
const router  = express.Router();
const { protect, isAdmin } = require("../middlewares/authMiddleware");
const {
  createRazorpayOrder,
  placeOrder,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
   deleteOrder,
} = require("../controllers/orderController");


router.get("/shipping-charge", protect, (req, res) => {
  const amount = Number(req.query.amount) || 0;
  const shippingCharge = amount >= 1000 ? 0 : 50;
  res.json({ success: true, shippingCharge, isFreeShipping: amount >= 1000 });
});

router.post("/create-razorpay-order", protect, createRazorpayOrder);
router.post("/place",                 protect, placeOrder);
router.get("/my-orders",              protect, getMyOrders);

// Admin 

router.get("/admin/all",              protect, isAdmin, getAllOrders);
router.put("/admin/:id/status",       protect, isAdmin, updateOrderStatus);
router.delete("/admin/:id",           protect, isAdmin, deleteOrder);

// Razorpay Key
router.get("/key", protect, (req, res) => {
  res.json({ success: true, key: process.env.RAZORPAY_KEY_ID });
});

module.exports = router;