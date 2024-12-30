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
  branches: [
    {
      branchId: { type: mongoose.Schema.Types.ObjectId, ref: "Branch" },
      income: { type: Number },
      totalExpenses: { type: Number },
      totalIncome: { type: Number },
    },
  ],
});

const DailyReport = mongoose.model("DailyReport", dailyReportSchema);

module.exports = {
  Category,
  Product,
  Branch,
  SoldProduct,
  UnexpectedExpense,
  NetIncome,
  DailyReport,
};
