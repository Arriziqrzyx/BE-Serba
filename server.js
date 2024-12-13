const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const cron = require("node-cron");
const DailySales = require("./models/DailySales"); // Import model DailySales
const Category = require("./models/Category");
const Product = require("./models/Product");
const categoryRoutes = require("./routes/categoryRoutes");
const productRoutes = require("./routes/productRoutes");
const dailySalesRoutes = require("./routes/dailySalesRoutes");
const path = require("path");

dotenv.config(); // Load variabel lingkungan dari .env

const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // Parsing JSON dari request body

// Coba koneksi MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error(err));

// Rute dasar untuk tes
app.get("/", (req, res) => {
  res.send("Backend is running!");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Gunakan route
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/daily-sales", dailySalesRoutes);

// Fungsi untuk menyimpan data harian
const saveDailyData = async () => {
  try {
    const today = new Date().toISOString().slice(0, 10); // Format: YYYY-MM-DD
    const categories = await Category.find().populate("products");

    for (const category of categories) {
      let totalRevenue = 0;
      const details = []; // Menyimpan detail produk

      for (const productId of category.products) {
        const product = await Product.findById(productId);

        // Cari semua penjualan hari ini tanpa menghapus data di iterasi sebelumnya
        const todaySales = product.sales.filter(
          (sale) => new Date(sale.date).toISOString().slice(0, 10) === today
        );

        if (todaySales.length > 0) {
          // Hitung omzet berdasarkan semua penjualan hari ini
          todaySales.forEach((sale) => {
            const productRevenue = sale.amountSold * product.price;
            totalRevenue += productRevenue;

            // Tambahkan detail produk
            details.push({
              productName: product.name,
              amountSold: sale.amountSold,
              revenue: productRevenue,
            });
          });

          // Hapus data penjualan hari ini dari produk
          product.sales = product.sales.filter(
            (sale) => new Date(sale.date).toISOString().slice(0, 10) !== today
          );

          // Reset jumlah terjual
          product.sold = 0;
          await product.save();
        }
      }

      // Simpan data omzet harian ke koleksi DailySales
      if (totalRevenue >= 0) {
        const dailySale = new DailySales({
          date: today,
          category: category.name,
          totalRevenue,
          details,
        });
        await dailySale.save();

        console.log(
          `Omzet ${category.name} pada ${today}: ${totalRevenue}, disimpan ke DailySales`
        );
      }
    }

    console.log(`Data penjualan untuk tanggal ${today} telah disimpan.`);
  } catch (error) {
    console.error("Error saat menyimpan data harian:", error);
  }
};

// Middleware untuk menyajikan file di folder 'uploads'
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Jadwalkan tugas setiap jam 23:00
cron.schedule("59 59 23 * * *", saveDailyData);

// saveDailyData(); //Test Reset harian manual
