const cron = require("node-cron");
const { processDepreciationCheck } = require("../controllers/assetsController");

const scheduleAssetsCheck = () => {
  // Jalankan setiap awal bulan (tanggal 1 pukul 00:00)
  cron.schedule("0 0 * * *", async () => {
    console.log("Running depreciation check...");

    try {
      // Langsung panggil fungsi dari controller
      await processDepreciationCheck();
      console.log("Depreciation check completed.");
    } catch (error) {
      console.error("Error running depreciation check:", error);
    }
  });
};

module.exports = scheduleAssetsCheck;
