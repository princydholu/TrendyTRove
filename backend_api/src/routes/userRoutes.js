const express = require("express");
const router = express.Router();
const {
  getAllUsers,
  addUser,
  getUserById,
  editUser,
  deleteUser,
  getProfile,   
  updateProfile, 
} = require("../controllers/userController");

const { protect, isAdmin } = require("../middlewares/authMiddleware");

// Public
router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);

// Admin
router.get("/", protect, isAdmin, getAllUsers);
router.post("/", protect, isAdmin, addUser);
router.get("/:id", protect, isAdmin, getUserById);
router.put("/:id", protect, isAdmin, editUser);
router.delete("/:id", protect, isAdmin, deleteUser);

module.exports = router;
