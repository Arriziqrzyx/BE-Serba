const express = require("express");
const {
  createCategory,
  getCategories,
} = require("../controllers/categoryController");

const router = express.Router();

// Endpoint untuk kategori
router.post("/", createCategory); // Menambahkan kategori
router.get("/", getCategories); // Mendapatkan semua kategori

module.exports = router;
