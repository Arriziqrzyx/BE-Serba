const express = require("express");
const router = express.Router();

const {
  getIncomeByCategoryOrBranch,
  getTotalIncomeByCategory,
  getTotalIncomeAllCategories,
  calculateNetIncomeForAll,
} = require("../controllers/incomeController");

// Total pendapatan semua branch dalam kategori
router.get("/category/:id", getTotalIncomeByCategory);

// Total pendapatan semua kategori
router.get("/all", getTotalIncomeAllCategories);

// Total pendapatan per kategori atau branch
router.get("/detail/:id/:model", getIncomeByCategoryOrBranch);

router.get("/init", calculateNetIncomeForAll);

module.exports = router;
