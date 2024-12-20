// cronJobs.js
const cron = require("node-cron");
const { saveDailyReports } = require("./controllers/cronController");

// Jalankan job setiap hari pada jam 23:59:59
cron.schedule("59 23 * * *", async () => {
  console.log("[Cron Job]: Starting daily report job...");
  await saveDailyReports();
  console.log("[Cron Job]: Daily report job completed.");
});
