const cron = require("node-cron");
const moment = require("moment-timezone");
const {
  generateMonthlyReport,
} = require("../controllers/monthlyReportsController");

const generateRecaps = () => {
  cron.schedule(
    "59 23 * * *",
    async () => {
      try {
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(now.getDate() + 1);

        if (tomorrow.getDate() === 1) {
          console.log(
            `[INFO] Memulai generateRecaps pada ${moment()
              .tz("Asia/Jakarta")
              .format("YYYY-MM-DD HH:mm:ss")}`
          );
          await generateMonthlyReport();
        }
      } catch (error) {
        console.error(
          `[ERROR] Gagal menjalankan generateRecaps: ${error.message}`
        );
        console.error(error);
      }
    },
    {
      timezone: "Asia/Jakarta",
    }
  );
};

module.exports = generateRecaps;
