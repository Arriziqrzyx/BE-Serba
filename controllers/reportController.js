// controllers/reportController.js
const { DailyReport } = require("../models_schema");

// Laporan Harian
const getDailyReport = async (req, res) => {
  try {
    const { date, categoryOrBranchId } = req.query;

    // Validasi input
    if (!date || !categoryOrBranchId) {
      return res
        .status(400)
        .json({ message: "Date and categoryOrBranchId are required" });
    }

    // Cari laporan harian berdasarkan kategori/cabang dan tanggal
    const report = await DailyReport.findOne({ date, categoryOrBranchId });

    if (!report) {
      return res.status(404).json({ message: "Daily report not found" });
    }

    res
      .status(200)
      .json({ message: "Daily report fetched successfully", report });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching daily report", error: error.message });
  }
};

// Laporan Mingguan/Bulanan
const getPeriodicReport = async (req, res) => {
  try {
    const { startDate, endDate, categoryOrBranchId } = req.query;

    // Validasi input
    if (!startDate || !endDate || !categoryOrBranchId) {
      return res
        .status(400)
        .json({
          message: "Start date, end date, and categoryOrBranchId are required",
        });
    }

    // Cari laporan dalam rentang tanggal untuk kategori/cabang tertentu
    const reports = await DailyReport.find({
      categoryOrBranchId,
      date: { $gte: startDate, $lte: endDate },
    }).sort({ date: 1 });

    if (!reports || reports.length === 0) {
      return res
        .status(404)
        .json({ message: "No reports found in the specified period" });
    }

    res
      .status(200)
      .json({ message: "Periodic report fetched successfully", reports });
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Error fetching periodic report",
        error: error.message,
      });
  }
};

module.exports = { getDailyReport, getPeriodicReport };
