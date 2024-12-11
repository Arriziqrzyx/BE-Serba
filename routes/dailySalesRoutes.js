const express = require("express");
const DailySales = require("../models/DailySales"); // Import model
const router = express.Router();

// Endpoint untuk mendapatkan data omzet berdasarkan tanggal
router.get("/", async (req, res) => {
  const { date, month } = req.query; // Format tanggal: YYYY-MM-DD, bulan: YYYY-MM

  try {
    if (date) {
      // Cari omzet berdasarkan tanggal tertentu
      const dailySales = await DailySales.find({ date });
      return res.json(dailySales);
    } else if (month) {
      // Cari omzet berdasarkan bulan tertentu
      const monthlySales = await DailySales.find({
        date: { $regex: `^${month}` }, // Contoh regex: "^2024-12"
      });
      return res.json(monthlySales);
    } else {
      // Jika tidak ada filter, kirim semua data
      const allSales = await DailySales.find();
      return res.json(allSales);
    }
  } catch (err) {
    console.error("Error fetching daily sales:", err);
    res.status(500).json({ message: "Error fetching sales data", error: err });
  }
});

module.exports = router;
