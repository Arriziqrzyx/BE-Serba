const express = require("express");
const multer = require("multer");
const path = require("path");
const {
  createCategory,
  getCategories,
  getCategoryById,
} = require("../controllers/categoryController");

const router = express.Router();

// Set up Multer storage untuk menyimpan file gambar di folder 'uploads/icons'
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/icons/"); // Tentukan folder tempat gambar disimpan
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Buat nama file unik
  },
});

const upload = multer({ storage: storage });

// Endpoint untuk kategori
router.post("/", upload.single("icon"), createCategory); // Menambahkan kategori
router.get("/", getCategories); // Mendapatkan semua kategori
router.get("/:categoryId", getCategoryById); // Mendapatkan kategori berdasarkan categoryId

module.exports = router;
