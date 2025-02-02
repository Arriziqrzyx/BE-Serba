const express = require("express");
const {
  getSummary,
  getSalesSummary,
  getOperationalSummary,
  getAssetsSummary,
  getMaterialsSummary,
} = require("../controllers/monthlyReportsController");

const router = express.Router();

router.get("/summary", getSummary);
router.get("/sales/:monthlyReportId", getSalesSummary);
router.get("/operational/:monthlyReportId", getOperationalSummary);
router.get("/assets/:monthlyReportId", getAssetsSummary);
router.get("/materials/:monthlyReportId", getMaterialsSummary);

module.exports = router;
