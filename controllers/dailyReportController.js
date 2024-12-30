const {
  Category,
  Branch,
  Product,
  SoldProduct,
  UnexpectedExpense,
  DailyReport,
  NetIncome,
} = require("../models/models_schema");
const moment = require("moment-timezone");

const createDailyReport = async (req = null, res = null) => {
  try {
    const today = moment.tz("Asia/Jakarta").startOf("day").format(); // ISO 8601 String

    // Cek apakah laporan harian untuk tanggal ini sudah ada
    const existingReport = await DailyReport.findOne({ date: today });
    if (existingReport) {
      const errorMessage = "Laporan harian untuk tanggal ini sudah dibuat.";
      if (res) {
        return res.status(400).json({ error: errorMessage });
      }
      console.log(`[ERROR] ${errorMessage}`);
      return; // Keluar dari fungsi tanpa melempar error
    }

    // Ambil semua kategori dari database
    const categories = await Category.find();

    const reports = [];
    for (const category of categories) {
      const branches = await Branch.find({ category: category._id });

      if (branches.length > 0) {
        const branchReports = [];
        let aggregatedProducts = []; // Variabel untuk menggabungkan produk dari semua cabang

        for (const branch of branches) {
          const {
            income,
            totalExpenses,
            totalIncome,
            products,
            expenses,
            totalUnexpectedExpenses,
            netIncome,
          } = await calculateBranchData(branch);

          branchReports.push({
            branchId: branch._id,
            income,
            totalExpenses,
            totalIncome,
            totalUnexpectedExpenses,
            netIncome,
          });

          // Gabungkan data produk dari semua cabang
          aggregatedProducts = [...aggregatedProducts, ...products];

          // Simpan laporan cabang menggunakan upsert
          await DailyReport.findOneAndReplace(
            { date: today, categoryOrBranchId: branch._id },
            {
              categoryOrBranchId: branch._id,
              categoryOrBranchModel: "Branch",
              date: today,
              products,
              income,
              totalUnexpectedExpenses,
              netIncome,
              totalExpenses,
              totalIncome,
              unexpectedExpenses: expenses,
            },
            { upsert: true, returnDocument: "after" }
          );
        }

        // Hitung total kategori berdasarkan laporan cabang
        const categoryIncome = branchReports.reduce(
          (sum, b) => sum + b.income,
          0
        );
        const categoryExpenses = branchReports.reduce(
          (sum, b) => sum + b.totalExpenses,
          0
        );
        const categoryUnexpectedExpenses = branchReports.reduce(
          (sum, b) => sum + b.totalUnexpectedExpenses,
          0
        );
        const categoryNetIncome = branchReports.reduce(
          (sum, b) => sum + b.netIncome,
          0
        );

        // Simpan laporan kategori menggunakan upsert
        await DailyReport.findOneAndReplace(
          { date: today, categoryOrBranchId: category._id },
          {
            categoryOrBranchId: category._id,
            categoryOrBranchModel: "Category",
            date: today,
            products: aggregatedProducts,
            income: categoryIncome,
            totalUnexpectedExpenses: categoryUnexpectedExpenses,
            netIncome: categoryNetIncome,
            totalExpenses: categoryExpenses,
            totalIncome: categoryIncome - categoryExpenses,
            unexpectedExpenses: [],
          },
          { upsert: true, returnDocument: "after" }
        );
      } else {
        const {
          income,
          totalExpenses,
          totalIncome,
          products,
          expenses,
          totalUnexpectedExpenses,
          netIncome,
        } = await calculateCategoryData(category);

        await DailyReport.findOneAndReplace(
          { date: today, categoryOrBranchId: category._id },
          {
            categoryOrBranchId: category._id,
            categoryOrBranchModel: "Category",
            date: today,
            products,
            income,
            totalUnexpectedExpenses,
            netIncome,
            totalExpenses,
            totalIncome,
            unexpectedExpenses: expenses,
          },
          { upsert: true, returnDocument: "after" }
        );
      }
    }

    await resetDailyData();

    const successMessage = "Laporan harian berhasil dibuat.";
    if (res) {
      return res.status(201).json({ message: successMessage });
    }
    console.log(`[SUCCESS] ${successMessage}`);
  } catch (error) {
    console.error("[ERROR] Gagal membuat laporan harian:", error);

    if (res) {
      return res.status(500).json({ error: "Gagal membuat laporan harian." });
    }
    throw error; // Lempar error jika tanpa res
  }
};

const calculateBranchData = async (branch) => {
  const products = await Product.find({
    categoryOrBranchId: branch._id,
    categoryOrBranchModel: "Branch",
  });

  const soldProducts = await SoldProduct.find({
    productId: { $in: products.map((p) => p._id) },
  });

  const productsWithSales = products.map((product) => {
    const sold = soldProducts.find(
      (sp) => sp.productId.toString() === product._id.toString()
    );
    return {
      productId: product._id,
      name: product.name,
      price: product.price,
      photo: product.photo,
      amountSold: sold ? sold.amountSold : 0,
    };
  });

  const income = productsWithSales.reduce(
    (sum, product) => sum + product.price * product.amountSold,
    0
  );

  const expenses = await UnexpectedExpense.find({
    categoryOrBranchId: branch._id,
    categoryOrBranchModel: "Branch",
  });

  const totalUnexpectedExpenses = expenses.reduce(
    (sum, expense) => sum + expense.amount,
    0
  );
  const netIncome = income + totalUnexpectedExpenses;

  return {
    income,
    totalExpenses: totalUnexpectedExpenses,
    totalIncome: netIncome,
    products: productsWithSales,
    expenses,
    totalUnexpectedExpenses, // Return nilai ini
    netIncome, // Return nilai ini
  };
};

const calculateCategoryData = async (category) => {
  const products = await Product.find({
    categoryOrBranchId: category._id,
    categoryOrBranchModel: "Category",
  });

  const soldProducts = await SoldProduct.find({
    productId: { $in: products.map((p) => p._id) },
  });

  const productsWithSales = products.map((product) => {
    const sold = soldProducts.find(
      (sp) => sp.productId.toString() === product._id.toString()
    );
    return {
      productId: product._id,
      name: product.name,
      price: product.price,
      photo: product.photo,
      amountSold: sold ? sold.amountSold : 0,
    };
  });

  const income = productsWithSales.reduce(
    (sum, product) => sum + product.price * product.amountSold,
    0
  );

  const expenses = await UnexpectedExpense.find({
    categoryOrBranchId: category._id,
    categoryOrBranchModel: "Category",
  });

  const totalUnexpectedExpenses = expenses.reduce(
    (sum, expense) => sum + expense.amount,
    0
  );
  const netIncome = income + totalUnexpectedExpenses;

  return {
    income,
    totalExpenses: totalUnexpectedExpenses,
    totalIncome: netIncome,
    products: productsWithSales,
    expenses,
    totalUnexpectedExpenses, // Return nilai ini
    netIncome, // Return nilai ini
  };
};

const resetDailyData = async () => {
  await SoldProduct.deleteMany();
  await UnexpectedExpense.deleteMany();
  await NetIncome.deleteMany();
};

const mongoose = require("mongoose");

const getDailyReportsByCategoryOrBranch = async (req, res) => {
  const { categoryOrBranchId, categoryOrBranchModel } = req.query;

  if (!categoryOrBranchId || !categoryOrBranchModel) {
    return res.status(400).json({
      error:
        "Parameter 'categoryOrBranchId' dan 'categoryOrBranchModel' diperlukan.",
    });
  }

  try {
    // Konversi categoryOrBranchId ke ObjectId
    const objectId = new mongoose.Types.ObjectId(categoryOrBranchId);

    // Ambil data dari DailyReport berdasarkan filter
    const dailyReports = await DailyReport.find({
      categoryOrBranchId: objectId,
      categoryOrBranchModel,
    })
      .sort({ date: -1 }) // Urutkan berdasarkan tanggal terbaru
      .populate("categoryOrBranchId", "name") // Ambil `name` dari kategori/branch
      .lean();

    // Format data untuk response
    const formattedReports = dailyReports.map((report) => ({
      _id: report._id,
      name: report.categoryOrBranchId?.name || "Unknown",
      date: report.date,
      netIncome: report.netIncome,
    }));

    res.status(200).json(formattedReports);
  } catch (error) {
    console.error("Error fetching daily reports:", error);
    res.status(500).json({ error: "Gagal mengambil laporan harian." });
  }
};

module.exports = { createDailyReport, getDailyReportsByCategoryOrBranch };
