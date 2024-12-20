const express = require("express");
const router = express.Router();
const unexpectedExpenseController = require("../controllers/unexpectedExpenseController");

// Endpoint untuk menambahkan biaya tidak terduga
router.post("/", unexpectedExpenseController.addUnexpectedExpense);

// Endpoint untuk mengambil biaya tidak terduga berdasarkan kategori/cabang
router.get("/:id/:model", unexpectedExpenseController.getUnexpectedExpenses);

module.exports = router;
