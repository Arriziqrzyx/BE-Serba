const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();

// Routes
const categoryRoutes = require("./routes/categoryRoutes");
const productRoutes = require("./routes/productRoutes");
const branchRoutes = require("./routes/branchRoutes");
const soldProductRoutes = require("./routes/soldProductRoutes");
const reportRoutes = require("./routes/reportRoutes");
const incomeRoutes = require("./routes/incomeRoutes");
const unexpectedExpenseRoute = require("./routes/unexpectedExpenseRoute");

// const cronJobs = require("./cronJobs");

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
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Routes
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/branches", branchRoutes);
app.use("/api/sold-products", soldProductRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/income", incomeRoutes);
app.use("/api/unexpected-expenses", unexpectedExpenseRoute);

// Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
