const express = require("express");
const cors = require("cors");
const app = express();

// CORS
app.use(cors({
  origin: function(origin, callback) {
    callback(null, true); 
  },
  credentials: true,
}));

// Middleware
app.use(express.json());

// Routes
app.use("/api/auth",       require("./routes/authRoutes"));
app.use("/api/users",      require("./routes/userRoutes"));
app.use("/api/categories", require("./routes/categoryRoutes"));
app.use("/api/products",   require("./routes/productRoutes"));
app.use("/api/upload",     require("./routes/uploadRoutes"));
app.use("/api/cart",       require("./routes/cartRoutes"));
app.use("/api/orders",     require("./routes/orderRoutes"));
app.use("/api/wishlist",   require("./routes/wishlistRoutes"));

// Health Check
app.get("/", (req, res) => {
  res.json({ message: "Home Decor API is running!" });
});

module.exports = app;