// routes/soldProductRoutes.js
const express = require("express");
const { addSoldProduct } = require("../controllers/soldProductController");

const router = express.Router();

// Endpoint untuk menambah jumlah produk terjual
router.post("/", addSoldProduct);

module.exports = router;
