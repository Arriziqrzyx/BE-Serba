const {
  Product,
  Branch,
  SoldProduct,
  NetIncome,
  Category,
} = require("../models/models_schema");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const { UnexpectedExpense } = require("../models/models_schema");

// Total pendapatan per kategori atau branch
exports.getIncomeByCategoryOrBranch = async (req, res) => {
  const { id, model } = req.params; // id = categoryOrBranchId, model = Category/Branch

  try {
    // Ambil semua produk berdasarkan kategori/cabang
    const products = await Product.find({
      categoryOrBranchId: id,
      categoryOrBranchModel: model,
    });

    const productIds = products.map((product) => product._id);

    // Ambil semua soldProducts yang terkait
    const soldProducts = await SoldProduct.find({
      productId: { $in: productIds },
    });

    // Hitung total pendapatan
    let income = 0;
    soldProducts.forEach((sold) => {
      const product = products.find((p) => p._id.equals(sold.productId));
      if (product) {
        income += sold.amountSold * product.price;
      }
    });

    // Ambil semua biaya tak terduga terkait
    const unexpectedExpenses = await UnexpectedExpense.find({
      categoryOrBranchId: id,
      categoryOrBranchModel: model,
    });

    // Hitung total biaya tak terduga
    const totalExpenses = unexpectedExpenses.reduce((sum, expense) => {
      return sum + expense.amount;
    }, 0);

    // Hitung pendapatan bersih
    const totalIncome = income + totalExpenses;

    // Simpan ke koleksi NetIncome
    const today = new Date().toISOString().split("T")[0]; // Format YYYY-MM-DD
    await NetIncome.findOneAndUpdate(
      { categoryOrBranchId: id, categoryOrBranchModel: model, date: today },
      { income, totalExpenses, totalIncome },
      { upsert: true, new: true }
    );

    res.json({ income, totalExpenses, totalIncome });
  } catch (error) {
    console.error("Error calculating income:", error.message);
    res.status(500).json({ message: "Gagal menghitung pendapatan" });
  }
};

// Total pendapatan semua branch dalam kategori
exports.getTotalIncomeByCategory = async (req, res) => {
  const { id } = req.params; // id = categoryId

  try {
    // Ambil semua branch berdasarkan kategori
    const branches = await Branch.find({ category: id });

    const branchIds = branches.map((branch) => branch._id);

    // Ambil pendapatan bersih dari NetIncome untuk semua cabang
    const today = new Date().toISOString().split("T")[0];
    const netIncomes = await NetIncome.find({
      categoryOrBranchId: { $in: branchIds },
      categoryOrBranchModel: "Branch",
      date: today,
    });

    // Hitung total pendapatan bersih
    const totalIncome = netIncomes.reduce(
      (sum, income) => sum + income.totalIncome,
      0
    );

    res.json({ totalIncome });
  } catch (error) {
    console.error("Error calculating income by category:", error.message);
    res.status(500).json({ message: "Gagal menghitung pendapatan kategori" });
  }
};

// Total pendapatan semua kategori
exports.getTotalIncomeAllCategories = async (req, res) => {
  try {
    const today = new Date().toISOString().split("T")[0];

    // Ambil semua pendapatan bersih dari NetIncome
    const netIncomes = await NetIncome.find({ date: today });

    // Hitung total pendapatan bersih
    const totalIncome = netIncomes.reduce(
      (sum, income) => sum + income.totalIncome,
      0
    );

    res.json({ totalIncome });
  } catch (error) {
    console.error(
      "Error calculating total income for all categories:",
      error.message
    );
    res.status(500).json({ message: "Gagal menghitung total pendapatan" });
  }
};

// Inisialisasi semua data NetIncome saat server berjalan
exports.calculateNetIncomeForAll = async () => {
  try {
    const today = new Date().toISOString().split("T")[0]; // Format YYYY-MM-DD

    const categories = await Category.find({});
    const branches = await Branch.find({});

    // Proses kategori
    for (const category of categories) {
      const products = await Product.find({
        categoryOrBranchId: category._id,
        categoryOrBranchModel: "Category",
      });

      const productIds = products.map((product) => product._id);

      const soldProducts = await SoldProduct.find({
        productId: { $in: productIds },
      });

      // Hitung total pendapatan
      let income = 0;
      soldProducts.forEach((sold) => {
        const product = products.find((p) => p._id.equals(sold.productId));
        if (product) {
          income += sold.amountSold * product.price;
        }
      });

      // Hitung total biaya tak terduga
      const unexpectedExpenses = await UnexpectedExpense.find({
        categoryOrBranchId: category._id,
        categoryOrBranchModel: "Category",
      });

      const totalExpenses = unexpectedExpenses.reduce((sum, expense) => {
        return sum + expense.amount;
      }, 0);

      // Hitung pendapatan bersih
      const totalIncome = income - totalExpenses;

      // Simpan ke NetIncome
      if (income !== 0 || totalExpenses !== 0) {
        await NetIncome.findOneAndUpdate(
          {
            categoryOrBranchId: category._id,
            categoryOrBranchModel: "Category",
            date: today,
          },
          { income, totalExpenses, totalIncome },
          { upsert: true, new: true }
        );
      }
    }

    // Proses branch
    for (const branch of branches) {
      const products = await Product.find({
        categoryOrBranchId: branch._id,
        categoryOrBranchModel: "Branch",
      });

      const productIds = products.map((product) => product._id);

      const soldProducts = await SoldProduct.find({
        productId: { $in: productIds },
      });

      // Hitung total pendapatan
      let income = 0;
      soldProducts.forEach((sold) => {
        const product = products.find((p) => p._id.equals(sold.productId));
        if (product) {
          income += sold.amountSold * product.price;
        }
      });

      // Hitung total biaya tak terduga
      const unexpectedExpenses = await UnexpectedExpense.find({
        categoryOrBranchId: branch._id,
        categoryOrBranchModel: "Branch",
      });

      const totalExpenses = unexpectedExpenses.reduce((sum, expense) => {
        return sum + expense.amount;
      }, 0);

      // Hitung pendapatan bersih
      const totalIncome = income - totalExpenses;

      // Simpan ke NetIncome
      if (income !== 0 || totalExpenses !== 0) {
        await NetIncome.findOneAndUpdate(
          {
            categoryOrBranchId: branch._id,
            categoryOrBranchModel: "Branch",
            date: today,
          },
          { income, totalExpenses, totalIncome },
          { upsert: true, new: true }
        );
      }
    }

    console.log("NetIncome calculated for all categories and branches.");
  } catch (error) {
    console.error("Error calculating NetIncome for all:", error.message);
  }
};
