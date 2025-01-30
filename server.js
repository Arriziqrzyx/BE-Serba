const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const moment = require("moment-timezone"); // Tambahkan moment-timezone
require("dotenv").config();

// Set default timezone ke Asia/Jakarta
moment.tz.setDefault("Asia/Jakarta");

// Mengimpor middleware dari folder middleware
const checkApiKey = require("./middleware/apiKey");
const validateToken = require("./middleware/tokenValidation");

// Routes
const categoryRoutes = require("./routes/categoryRoutes");
const productRoutes = require("./routes/productRoutes");
const branchRoutes = require("./routes/branchRoutes");
const soldProductRoutes = require("./routes/soldProductRoutes");
const incomeRoutes = require("./routes/incomeRoutes");
const unexpectedExpenseRoute = require("./routes/unexpectedExpenseRoute");
const dailyReportRoutes = require("./routes/dailyReportRoutes");
const OperationalExpenseRoutes = require("./routes/operationalExpenseRoutes");
const assetRoutes = require("./routes/assetsRoutes");
const materialRoutes = require("./routes/materialRoutes");
const authRoutes = require("./routes/authRoutes");

// const { calculateNetIncomeForAll } = require("./controllers/incomeController");
const scheduleDailyReport = require("./cron/dailyReportCron");
const scheduleAssetsCheck = require("./cron/monthlyAssetsCron");
const autoLogout = require("./cron/autoLogoutCron");

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use("/uploads", express.static("uploads")); // Folder untuk menyimpan gambar yang diupload

// Database Connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(async () => {
    console.log("MongoDB Connected");

    // Call the function to calculate net income for all
    // await calculateNetIncomeForAll();
  })
  .catch((err) => console.error("MongoDB connection error:", err));

// Routes
app.use("/api/categories", checkApiKey, validateToken, categoryRoutes);
app.use("/api/products", checkApiKey, validateToken, productRoutes);
app.use("/api/branches", checkApiKey, validateToken, branchRoutes);
app.use("/api/sold-products", checkApiKey, validateToken, soldProductRoutes);
app.use("/api/income", checkApiKey, validateToken, incomeRoutes);
app.use("/api/daily-report", checkApiKey, validateToken, dailyReportRoutes);
app.use("/api/assets", checkApiKey, validateToken, assetRoutes);
app.use("/api/materials", checkApiKey, validateToken, materialRoutes);
app.use("/api/auth", checkApiKey, authRoutes);
app.use(
  "/api/unexpected-expenses",
  checkApiKey,
  validateToken,
  unexpectedExpenseRoute
);
app.use(
  "/api/operational-expenses",
  checkApiKey,
  validateToken,
  OperationalExpenseRoutes
);

// app.use((req, res, next) => {
//   console.log(`[Request] ${req.method} ${req.url} - Headers:`, req.headers);
//   next();
// });

// Jalankan cron job
scheduleDailyReport();
scheduleAssetsCheck();
autoLogout();

// Server
const PORT = process.env.PORT;
app.listen(PORT, "0.0.0.0", () =>
  console.log(`Server running on port ${PORT}`)
);
