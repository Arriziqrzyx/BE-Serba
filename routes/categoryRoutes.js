// routes/categoryRoutes.js

const express = require("express");
const {
  getAllCategories,
  addCategory,
  getCategoryById,
} = require("../controllers/categoryController");
const { uploadIcon } = require("../middleware/upload");

const router = express.Router();

// Route untuk mendapatkan semua kategori
router.get("/", getAllCategories);

// Route untuk mendapatkan kategori by id
router.get("/:categoryId", getCategoryById);

// Route untuk menambahkan kategori baru dengan upload icon
router.post("/", uploadIcon.single("icon"), addCategory);

module.exports = router;
