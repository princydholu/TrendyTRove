const express = require("express");
const router = express.Router();
const {
  getAllCategories,
  getMainCategories,
  getChildCategories,
  addCategory,
  editCategory,
  deleteCategory,
} = require("../controllers/categoryController");

const { protect, isAdmin } = require("../middlewares/authMiddleware");

// Public
router.get("/", getAllCategories);
router.get("/main", getMainCategories);
router.get("/:id/children", getChildCategories);

// Admin
router.post("/", protect, isAdmin, addCategory);
router.put("/:id", protect, isAdmin, editCategory);
router.delete("/:id", protect, isAdmin, deleteCategory);

module.exports = router;