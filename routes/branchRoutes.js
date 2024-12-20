// routes/branchRoutes.js
const express = require("express");
const {
  createBranch,
  getBranchesByCategory,
  deleteBranch,
} = require("../controllers/branchController");

const router = express.Router();

// Endpoint untuk tambah cabang baru
router.post("/", createBranch);

// Endpoint untuk ambil semua cabang berdasarkan kategori
router.get("/:categoryId", getBranchesByCategory);

// Endpoint untuk hapus cabang
router.delete("/:id", deleteBranch);

module.exports = router;
