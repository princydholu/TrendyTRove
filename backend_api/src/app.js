const express = require("express");
const cors = require("cors");
const app = express();

// CORS
app.use(cors({
  origin: [
    "http://localhost:3000",  // Frontend
    "http://localhost:3001",  // Admin Panel
  ],
  credentials: true,
}));

// Middleware
app.use(express.json());

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/categories", require("./routes/categoryRoutes"));
app.use("/api/products", require("./routes/productRoutes"));
app.use("/api/upload", require("./routes/uploadRoutes"));
app.use("/api/cart", require("./routes/cartRoutes"));

// Health Check
app.get("/", (req, res) => {
  res.json({ message: " Home Decor API is running!" });
});

module.exports = app;