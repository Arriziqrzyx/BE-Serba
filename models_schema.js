// Category Schema
const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true }, // Nama kategori
  icon: { type: String, required: true }, // URL atau path icon kategori
});

const Category = mongoose.model("Category", categorySchema);

// Product Schema
const productSchema = new mongoose.Schema({
  name: { type: String, required: true }, // Nama produk
  price: { type: Number, required: true }, // Harga produk
  photo: { type: String, required: true }, // Foto produk
  categoryOrBranchId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: "categoryOrBranchModel", // Referensi ke kategori atau cabang
  },
  categoryOrBranchModel: {
    type: String,
    required: true,
    enum: ["Category", "Branch"], // "Category" untuk kategori, "Branch" untuk cabang
  },
});

const Product = mongoose.model("Product", productSchema);

// Branch Schema
const branchSchema = new mongoose.Schema({
  name: { type: String, required: true }, // Nama cabang
  category: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Category",
  }, // Referensi ke kategori
});

const Branch = mongoose.model("Branch", branchSchema);

// Sold Product Schema
const soldProductSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Product",
  }, // Referensi ke produk
  date: { type: Date, required: true }, // Tanggal penjualan
  amountSold: { type: Number, required: true, default: 0 }, // Jumlah produk terjual
});

const SoldProduct = mongoose.model("SoldProduct", soldProductSchema);

const unexpectedExpenseSchema = new mongoose.Schema({
  categoryOrBranchId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: "categoryOrBranchModel",
  },
  categoryOrBranchModel: {
    type: String,
    required: true,
    enum: ["Category", "Branch"],
  },
  date: { type: Date, required: true }, // Tanggal kejadian
  amount: { type: Number, required: true }, // Jumlah biaya tak terduga
  description: { type: String, required: true }, // Deskripsi (contoh: "Minuman tumpah")
});

const UnexpectedExpense = mongoose.model(
  "UnexpectedExpense",
  unexpectedExpenseSchema
);

//net income
const netIncomeSchema = new mongoose.Schema({
  categoryOrBranchId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: "categoryOrBranchModel",
  },
  categoryOrBranchModel: {
    type: String,
    required: true,
    enum: ["Category", "Branch"],
  },
  date: { type: Date, required: true }, // Tanggal laporan
  totalIncome: { type: Number, required: true }, // Pendapatan bersih
  totalExpenses: { type: Number, required: true }, // Biaya tak terduga
});

const NetIncome = mongoose.model("NetIncome", netIncomeSchema);

// // Daily Report Schema
// const dailyReportSchema = new mongoose.Schema({
//   date: { type: String, required: true }, // Format: YYYY-MM-DD
//   categoryOrBranchId: {
//     type: mongoose.Schema.Types.ObjectId,
//     required: true,
//     refPath: "categoryOrBranchModel",
//   },
//   categoryOrBranchModel: {
//     type: String,
//     required: true,
//     enum: ["Category", "Branch"],
//   },
//   totalRevenue: { type: Number, required: true }, // Total omzet harian
//   details: [
//     {
//       productName: { type: String, required: true },
//       amountSold: { type: Number, required: true },
//       revenue: { type: Number, required: true },
//     },
//   ],
// });

// const DailyReport = mongoose.model("DailyReport", dailyReportSchema);

module.exports = {
  Category,
  Product,
  Branch,
  SoldProduct,
  UnexpectedExpense,
  NetIncome,
};
