const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  product:  { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  name:     { type: String, required: true },
  quantity: { type: Number, required: true },
  price:    { type: Number, required: true },
  image:    { type: String, default: "" },
  size:     { type: String, default: "" },
  color:    { type: String, default: "" },
});

const orderSchema = new mongoose.Schema({
  orderId:  { type: String, unique: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  items:    [orderItemSchema],
  amount:   { type: Number, required: true },
  address: {
    fullName: String,
    phone:    String,
    street:   String,
    city:     String,
    state:    String,
    pincode:  String,
  },
  paymentMethod:     { type: String, default: "Razorpay" },
  paymentStatus:     { type: String, enum: ["Paid", "Pending", "Failed"], default: "Pending" },
  razorpayOrderId:   { type: String },
  razorpayPaymentId: { type: String },
  orderStatus: {
    type: String,
    enum: ["Processing", "Shipped", "Delivered", "Cancelled"],
    default: "Processing",
  },
  shippingCharge: { type: Number, default: 50 },
}, { timestamps: true });

orderSchema.pre("save", async function () {
  if (!this.orderId) {
    const count = await mongoose.model("Order").countDocuments();
    this.orderId = `ORD-${String(count + 1).padStart(3, "0")}`;
  }
});

module.exports = mongoose.model("Order", orderSchema);