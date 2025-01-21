const express = require("express");
const {
  createExpense,
  getExpenses,
  deleteExpense,
  updateExpense,
  getExpenseSummary,
} = require("../controllers/operationalExpenseController");

const router = express.Router();

// Tambah data
router.post("/", createExpense);

// Ambil data (filter bulan opsional)
router.get("/", getExpenses);

// Endpoint untuk mendapatkan total per kategori dan keseluruhan
router.get("/summary", getExpenseSummary);

// Hapus data
router.delete("/:id", deleteExpense);

// Update data
router.put("/:id", updateExpense);

module.exports = router;
