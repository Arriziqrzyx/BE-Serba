const cron = require("node-cron");
const moment = require("moment-timezone");
const { createDailyReport } = require("../controllers/dailyReportController");

// Jadwalkan cron job
const scheduleDailyReport = () => {
  cron.schedule(
    "59 23 * * *", // Setiap pukul 23:59:59
    async () => {
      try {
        console.log(
          `[INFO] Memulai generateDailyReport pada ${moment()
            .tz("Asia/Jakarta")
            .format("YYYY-MM-DD HH:mm:ss")}`
        );

        // Panggil fungsi createDailyReport
        await createDailyReport({});
        console.log(`[SUCCESS] Laporan harian selesai dibuat.`);
      } catch (error) {
        console.error(
          `[ERROR] Gagal menjalankan generateDailyReport: ${error.message}`
        );
      }
    },
    {
      timezone: "Asia/Jakarta", // Zona waktu yang diatur ke Jakarta
    }
  );
};

module.exports = scheduleDailyReport;
