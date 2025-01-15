const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const moment = require("moment-timezone"); // Tambahkan moment-timezone
require("dotenv").config();

// Set default timezone ke Asia/Jakarta
moment.tz.setDefault("Asia/Jakarta");

// Routes
const categoryRoutes = require("./routes/categoryRoutes");
const productRoutes = require("./routes/productRoutes");
const branchRoutes = require("./routes/branchRoutes");
const soldProductRoutes = require("./routes/soldProductRoutes");
const incomeRoutes = require("./routes/incomeRoutes");
const unexpectedExpenseRoute = require("./routes/unexpectedExpenseRoute");
const dailyReportRoutes = require("./routes/dailyReportRoutes");

// const { calculateNetIncomeForAll } = require("./controllers/incomeController");
const scheduleDailyReport = require("./cron/dailyReportCron");

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
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/branches", branchRoutes);
app.use("/api/sold-products", soldProductRoutes);
app.use("/api/income", incomeRoutes);
app.use("/api/unexpected-expenses", unexpectedExpenseRoute);
app.use("/api/daily-report", dailyReportRoutes);

app.use((req, res, next) => {
  console.log(`[Request] ${req.method} ${req.url} - Headers:`, req.headers);
  next();
});

// Jalankan cron job
scheduleDailyReport();

// Server
const PORT = process.env.PORT;
app.listen(PORT, "0.0.0.0", () =>
  console.log(`Server running on port ${PORT}`)
);
