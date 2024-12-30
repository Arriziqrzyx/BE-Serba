const express = require("express");
const router = express.Router();
const {
  createDailyReport,
  getDailyReportsByCategoryOrBranch,
} = require("../controllers/dailyReportController");

router.post("/generateDailyReport", createDailyReport);
router.get("/", getDailyReportsByCategoryOrBranch);

module.exports = router;
