const cron = require("node-cron");
const { processDepreciationCheck } = require("../controllers/assetsController");

const scheduleAssetsCheck = () => {
  // Jalankan setiap hari pada pukul 0000
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
