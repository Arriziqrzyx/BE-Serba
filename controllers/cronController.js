// controllers/cronController.js
const { SoldProduct, Product, DailyReport } = require("../models_schema");
const moment = require("moment");

const saveDailyReports = async () => {
  try {
    const today = moment().format("YYYY-MM-DD");

    // Ambil semua penjualan produk yang terjadi hari ini
    const soldProducts = await SoldProduct.find({
      date: {
        $gte: new Date(today + "T00:00:00"),
        $lte: new Date(today + "T23:59:59"),
      },
    }).populate("productId");

    if (!soldProducts || soldProducts.length === 0) {
      console.log(`[Cron Job]: No sales data found for ${today}`);
      return;
    }

    // Kelompokkan data berdasarkan kategori/cabang
    const reportsMap = {};

    soldProducts.forEach((soldProduct) => {
      const { productId, amountSold } = soldProduct;
      const { categoryOrBranchId, categoryOrBranchModel, price, name } =
        productId;

      const key = `${categoryOrBranchId}_${categoryOrBranchModel}`;

      if (!reportsMap[key]) {
        reportsMap[key] = {
          date: today,
          categoryOrBranchId,
          categoryOrBranchModel,
          totalRevenue: 0,
          details: [],
        };
      }

      const revenue = amountSold * price;

      reportsMap[key].details.push({
        productName: name,
        amountSold,
        revenue,
      });

      reportsMap[key].totalRevenue += revenue;
    });

    // Simpan laporan harian ke dalam database
    for (const key in reportsMap) {
      const report = new DailyReport(reportsMap[key]);
      await report.save();
    }

    console.log(`[Cron Job]: Daily reports saved successfully for ${today}`);
  } catch (error) {
    console.error(
      `[Cron Job Error]: Failed to save daily reports`,
      error.message
    );
  }
};

module.exports = { saveDailyReports };
