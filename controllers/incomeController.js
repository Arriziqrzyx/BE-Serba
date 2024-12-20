const { Product, Branch, SoldProduct, NetIncome } = require("../models_schema");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const { UnexpectedExpense } = require("../models_schema");

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
    let totalIncome = 0;
    soldProducts.forEach((sold) => {
      const product = products.find((p) => p._id.equals(sold.productId));
      if (product) {
        totalIncome += sold.amountSold * product.price;
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

    // Kurangi total pendapatan dengan total biaya tak terduga
    const netIncome = totalIncome - totalExpenses;

    // Simpan ke koleksi NetIncome
    const today = new Date().toISOString().split("T")[0]; // Format YYYY-MM-DD
    await NetIncome.findOneAndUpdate(
      { categoryOrBranchId: id, categoryOrBranchModel: model, date: today },
      { totalIncome: netIncome, totalExpenses },
      { upsert: true, new: true }
    );

    res.json({ netIncome, totalIncome, totalExpenses });
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
