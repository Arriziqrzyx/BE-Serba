const express = require("express");
const router = express.Router();
const {
  createDailyReport,
  getDailyReportsByCategoryOrBranch,
  getDailyReportDetail,
  updateProductAmountSold,
  addUnexpectedExpense,
  deleteUnexpectedExpense,
  updateUnexpectedExpense,
  getDailyReportDetailByDateAndBranch,
  getNetIncomeByCategory,
  getMonthlyIncomePerBranch,
} = require("../controllers/dailyReportController");

router.post("/generateDailyReport", createDailyReport);
router.get("/monthly-income-per-branch", getMonthlyIncomePerBranch);
router.get("/netIncome", getNetIncomeByCategory);
router.get("/detail-by-date", getDailyReportDetailByDateAndBranch);
router.get("/", getDailyReportsByCategoryOrBranch);
router.get("/:reportId", getDailyReportDetail);
router.put("/:dailyReportId/products/:productId", updateProductAmountSold);
router.post("/:dailyReportId/unexpected-expenses", addUnexpectedExpense);
router.put(
  "/:dailyReportId/unexpected-expenses/:expenseId",
  updateUnexpectedExpense
);
router.delete(
  "/:dailyReportId/unexpected-expenses/:expenseId",
  deleteUnexpectedExpense
);

module.exports = router;
