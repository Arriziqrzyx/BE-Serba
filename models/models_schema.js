const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  icon: { type: String, required: true },
});

const Category = mongoose.model("Category", categorySchema);

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  photo: { type: String, required: true },
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
});

const Product = mongoose.model("Product", productSchema);

const branchSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Category",
  },
});

const Branch = mongoose.model("Branch", branchSchema);

const soldProductSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Product",
  },
  date: { type: Date, required: true },
  amountSold: { type: Number, required: true, default: 0 },
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
  date: { type: Date, required: true },
  amount: { type: Number, required: true },
  description: { type: String, required: true },
});

const UnexpectedExpense = mongoose.model(
  "UnexpectedExpense",
  unexpectedExpenseSchema
);

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
  date: { type: Date, required: true },
  income: { type: Number, required: true },
  totalExpenses: { type: Number, required: true },
  totalIncome: { type: Number, required: true },
});

const NetIncome = mongoose.model("NetIncome", netIncomeSchema);

const dailyReportSchema = new mongoose.Schema({
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
  date: { type: String, required: true }, // Ubah tipe data menjadi String
  products: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      name: { type: String },
      price: { type: Number },
      photo: { type: String },
      amountSold: { type: Number },
    },
  ],
  unexpectedExpenses: [
    {
      amount: { type: Number, required: true },
      description: { type: String, required: true },
    },
  ],
  income: { type: Number, required: true },
  totalUnexpectedExpenses: { type: Number, required: true },
  netIncome: { type: Number, required: true },
});

const DailyReport = mongoose.model("DailyReport", dailyReportSchema);

const netIncomeMonthlySchema = new mongoose.Schema({
  categoryId: {
    type: mongoose.Types.ObjectId,
    ref: "Category",
    required: true,
    unique: true,
  },
  netIncome: {
    type: Number,
    default: 0,
  },
});

const NetIncomeMonthly = mongoose.model(
  "NetIncomeMonthly",
  netIncomeMonthlySchema
);

const operationalExpenseSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
    enum: ["Gaji Karyawan", "Tagihan", "Perbaikan", "Lainnya"],
  },
  description: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  date: {
    type: String, // Tanggal disimpan dalam format string
    required: true,
  },
});

const OperationalExpense = mongoose.model(
  "OperationalExpense",
  operationalExpenseSchema
);

const assetSchema = new mongoose.Schema({
  assetName: { type: String, required: true },
  assetPrice: { type: Number, required: true },
  depreciationPeriod: { type: Number, required: true }, // in months
  monthlyDepreciation: { type: Number, required: true },
  purchaseDate: { type: Date, required: true },
  depreciationStatus: { type: Boolean, default: true }, // active or not
  depreciationEndDate: { type: Date, required: true },
});

const Asset = mongoose.model("Asset", assetSchema);

const materialSchema = new mongoose.Schema({
  materialName: { type: String, required: true },
  pricePerUnit: { type: Number, required: true },
  totalUnits: { type: Number, required: true },
  purchaseDate: { type: Date, required: true },
  usedUnits: { type: Number, default: 0 }, // Jumlah unit yang terpakai
  month: { type: Number, required: true }, // Bulan data
  year: { type: Number, required: true }, // Tahun data
});

// Menambahkan kolom virtual untuk menghitung nilai bahan secara dinamis
materialSchema.virtual("unusedUnits").get(function () {
  return this.totalUnits - this.usedUnits;
});

materialSchema.virtual("totalValue").get(function () {
  return this.totalUnits * this.pricePerUnit;
});

materialSchema.virtual("usedValue").get(function () {
  return this.usedUnits * this.pricePerUnit;
});

materialSchema.virtual("unusedValue").get(function () {
  return this.unusedUnits * this.pricePerUnit;
});

const Material = mongoose.model("Material", materialSchema);

module.exports = {
  Category,
  Product,
  Branch,
  SoldProduct,
  UnexpectedExpense,
  NetIncome,
  DailyReport,
  NetIncomeMonthly,
  OperationalExpense,
  Asset,
  Material,
};
