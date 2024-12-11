const express = require("express");
const upload = require("../middleware/upload"); // Import middleware multer
const {
  createProduct,
  getProductsByCategory,
  updateProductSold,
  calculateDailyRevenue,
} = require("../controllers/productController");

const router = express.Router();

// Endpoint untuk produk
router.post("/:categoryId", upload.single("photo"), createProduct); // "photo" adalah nama field untuk gambar
router.get("/:categoryId", getProductsByCategory); // Mendapatkan semua produk dalam kategori
// Endpoint untuk memperbarui jumlah terjual
router.put("/sold/:productId", updateProductSold);
// Endpoint untuk menghitung omzet harian
router.get("/revenue/:categoryId", calculateDailyRevenue);

module.exports = router;
