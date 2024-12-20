// routes/reportRoutes.js
const express = require("express");
const {
  getDailyReport,
  getPeriodicReport,
} = require("../controllers/reportController");

const router = express.Router();

// Endpoint untuk laporan harian
router.get("/daily", getDailyReport);

// Endpoint untuk laporan mingguan/bulanan
router.get("/periodic", getPeriodicReport);

module.exports = router;
