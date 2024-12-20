// routes/productRoutes.js
const express = require("express");
const {
  createProduct,
  getProductsByCategoryOrBranch,
  deleteProduct,
} = require("../controllers/productController");
const { uploadProductPhoto } = require("../middleware/upload");

const router = express.Router();

// Endpoint untuk tambah produk baru
router.post("/", uploadProductPhoto.single("photo"), createProduct);

// Endpoint untuk ambil produk berdasarkan kategori/cabang
router.get("/:id/:model", getProductsByCategoryOrBranch);

// Endpoint untuk hapus produk
router.delete("/:id", deleteProduct);

module.exports = router;
