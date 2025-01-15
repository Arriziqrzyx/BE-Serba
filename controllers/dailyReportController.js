const {
  Category,
  Branch,
  Product,
  SoldProduct,
  UnexpectedExpense,
  DailyReport,
  NetIncome,
  NetIncomeMonthly,
} = require("../models/models_schema");
const moment = require("moment-timezone");
const mongoose = require("mongoose");

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

    for (const category of categories) {
      const branches = await Branch.find({ category: category._id });

      if (branches.length > 0) {
        // Jika kategori memiliki cabang, hanya simpan laporan untuk setiap cabang
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
      } else {
        // Jika kategori tidak memiliki cabang, simpan laporan kategori
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

//Mendapatkan Laporan Harian Bulan Ini
const getDailyReportsByCategoryOrBranch = async (req, res) => {
  const { categoryOrBranchId, categoryOrBranchModel, date } = req.query;

  if (!categoryOrBranchId || !categoryOrBranchModel) {
    return res.status(400).json({
      error:
        "Parameter 'categoryOrBranchId' dan 'categoryOrBranchModel' diperlukan.",
    });
  }

  try {
    const objectId = new mongoose.Types.ObjectId(categoryOrBranchId);

    const now = new Date();
    const startOfMonth = `${now.getFullYear()}-${String(
      now.getMonth() + 1
    ).padStart(2, "0")}-01`;
    const startOfNextMonth = `${now.getFullYear()}-${String(
      now.getMonth() + 2
    ).padStart(2, "0")}-01`;

    const dateFilter = date
      ? { date: new RegExp(`^${date}`) } // Gunakan RegExp untuk mencocokkan string tanggal
      : { date: { $gte: startOfMonth, $lt: startOfNextMonth } };

    //Test mengambil semuanya tanpa filter bulan aktif
    // const dateFilter = date
    //   ? { date: new RegExp(`^${date}`) } // Gunakan RegExp untuk mencocokkan string tanggal
    //   : {}; // Jika tidak ada tanggal, maka tidak ada filter tanggal

    if (categoryOrBranchModel === "Category") {
      const category = await Category.findById(objectId);
      const branches = await Branch.find({ category: objectId });

      if (branches.length > 0) {
        const dailyReports = await DailyReport.find({
          categoryOrBranchId: { $in: branches.map((branch) => branch._id) },
          categoryOrBranchModel: "Branch",
          ...dateFilter,
        })
          .sort({ date: -1 })
          .populate("categoryOrBranchId", "name")
          .lean();

        const groupedReports = dailyReports.reduce((acc, report) => {
          const dateString = report.date;
          const branchName = report.categoryOrBranchId?.name || "Unknown";

          if (!acc[dateString]) {
            acc[dateString] = {
              _id: report._id,
              name: category.name,
              date: report.date,
              netIncome: 0,
              branches: [],
            };
          }

          acc[dateString].branches.push({
            name: branchName,
            income: report.netIncome,
          });

          acc[dateString].netIncome += report.netIncome;

          return acc;
        }, {});

        const formattedReports = Object.values(groupedReports);

        // Fitur baru: Simpan net income bulanan ke koleksi NetIncomeMonthly
        if (!date) {
          const totalNetIncome = formattedReports.reduce(
            (sum, report) => sum + report.netIncome,
            0
          );

          await NetIncomeMonthly.findOneAndUpdate(
            { categoryId: objectId },
            { $set: { netIncome: totalNetIncome } },
            { upsert: true }
          );
        }

        return res.status(200).json(formattedReports);
      } else {
        const dailyReports = await DailyReport.find({
          categoryOrBranchId: objectId,
          categoryOrBranchModel: "Category",
          ...dateFilter,
        })
          .sort({ date: -1 })
          .populate("categoryOrBranchId", "name")
          .lean();

        const formattedReports = dailyReports.map((report) => ({
          _id: report._id,
          name: report.categoryOrBranchId?.name || "Unknown",
          date: report.date,
          netIncome: report.netIncome,
        }));

        // Fitur baru: Simpan net income bulanan ke koleksi NetIncomeMonthly
        if (!date) {
          const totalNetIncome = formattedReports.reduce(
            (sum, report) => sum + report.netIncome,
            0
          );

          await NetIncomeMonthly.findOneAndUpdate(
            { categoryId: objectId },
            { $set: { netIncome: totalNetIncome } },
            { upsert: true }
          );
        }

        return res.status(200).json(formattedReports);
      }
    } else if (categoryOrBranchModel === "Branch") {
      const dailyReports = await DailyReport.find({
        categoryOrBranchId: objectId,
        categoryOrBranchModel: "Branch",
        ...dateFilter,
      })
        .sort({ date: -1 })
        .populate("categoryOrBranchId", "name")
        .lean();

      const formattedReports = dailyReports.map((report) => ({
        _id: report._id,
        name: report.categoryOrBranchId?.name || "Unknown",
        date: report.date,
        netIncome: report.netIncome,
      }));

      return res.status(200).json(formattedReports);
    }
  } catch (error) {
    console.error("Error fetching daily reports:", error);
    res.status(500).json({ error: "Gagal mengambil laporan harian." });
  }
};

//Mendapatkan Detail Laporan Harian
const getDailyReportDetail = async (req, res) => {
  const { reportId } = req.params; // Ambil ID laporan harian dari parameter

  if (!reportId) {
    return res.status(400).json({ error: "Parameter 'reportId' diperlukan." });
  }

  try {
    // Ambil data laporan harian berdasarkan ID
    const dailyReport = await DailyReport.findById(reportId)
      .populate("categoryOrBranchId", "name") // Ambil nama kategori atau cabang
      .lean();

    if (!dailyReport) {
      return res.status(404).json({ error: "Laporan harian tidak ditemukan." });
    }

    // Format data untuk respon
    const formattedReport = {
      _id: dailyReport._id,
      name: dailyReport.categoryOrBranchId?.name || "Unknown",
      date: dailyReport.date,
      products: dailyReport.products,
      unexpectedExpenses: dailyReport.unexpectedExpenses,
      income: dailyReport.income,
      totalUnexpectedExpenses: dailyReport.totalUnexpectedExpenses,
      netIncome: dailyReport.netIncome,
    };

    res.status(200).json(formattedReport);
  } catch (error) {
    console.error("Error fetching daily report detail:", error);
    res.status(500).json({ error: "Gagal mengambil detail laporan harian." });
  }
};

// Controller untuk update jumlah terjual produk
const updateProductAmountSold = async (req, res) => {
  const { dailyReportId, productId } = req.params;
  const { newAmountSold } = req.body;

  try {
    // Temukan laporan harian berdasarkan ID
    const dailyReport = await DailyReport.findById(dailyReportId);

    if (!dailyReport) {
      return res
        .status(404)
        .json({ message: "Laporan harian tidak ditemukan." });
    }

    // Temukan produk berdasarkan ID produk
    const product = dailyReport.products.find(
      (prod) => prod.productId.toString() === productId
    );

    if (!product) {
      return res.status(404).json({ message: "Produk tidak ditemukan." });
    }

    // Perbarui jumlah terjual
    product.amountSold = newAmountSold;

    // Hitung kembali pendapatan harian
    dailyReport.income = dailyReport.products.reduce(
      (total, prod) => total + prod.price * prod.amountSold,
      0
    );

    dailyReport.netIncome =
      dailyReport.income + dailyReport.totalUnexpectedExpenses;

    // Simpan perubahan
    await dailyReport.save();

    res
      .status(200)
      .json({ message: "Jumlah terjual berhasil diperbarui.", dailyReport });
  } catch (error) {
    console.error("Error updating product amountSold:", error);
    res
      .status(500)
      .json({ message: "Gagal memperbarui jumlah terjual.", error });
  }
};

// Controller untuk penambahan Biaya Tidak Terduga ke laporan harian
const addUnexpectedExpense = async (req, res) => {
  const { dailyReportId } = req.params; // ID laporan harian
  const { amount, description } = req.body; // Data biaya tidak terduga

  try {
    // Cari laporan harian berdasarkan ID
    const dailyReport = await DailyReport.findById(dailyReportId);

    if (!dailyReport) {
      return res
        .status(404)
        .json({ message: "Laporan harian tidak ditemukan." });
    }

    // Tambahkan biaya tidak terduga ke array
    dailyReport.unexpectedExpenses.push({ amount, description });

    // Hitung total pengeluaran tak terduga
    dailyReport.totalUnexpectedExpenses = dailyReport.unexpectedExpenses.reduce(
      (total, expense) => total + expense.amount,
      0
    );

    // Hitung pendapatan bersih (netIncome)
    dailyReport.netIncome =
      dailyReport.income + dailyReport.totalUnexpectedExpenses;

    // Simpan perubahan ke database
    await dailyReport.save();

    res.status(201).json({
      message: "Biaya tidak terduga berhasil ditambahkan.",
      // dailyReport,
    });
  } catch (error) {
    console.error("Error adding unexpected expense:", error);
    res
      .status(500)
      .json({ message: "Gagal menambahkan biaya tidak terduga.", error });
  }
};

const deleteUnexpectedExpense = async (req, res) => {
  const { dailyReportId, expenseId } = req.params; // ID laporan harian dan ID biaya tak terduga

  try {
    // Cari laporan harian berdasarkan ID
    const dailyReport = await DailyReport.findById(dailyReportId);

    if (!dailyReport) {
      return res
        .status(404)
        .json({ message: "Laporan harian tidak ditemukan." });
    }

    // Temukan dan hapus biaya tak terduga berdasarkan ID
    const expenseIndex = dailyReport.unexpectedExpenses.findIndex(
      (expense) => expense._id.toString() === expenseId
    );

    if (expenseIndex === -1) {
      return res
        .status(404)
        .json({ message: "Biaya tak terduga tidak ditemukan." });
    }

    // Hapus biaya tak terduga dari array
    dailyReport.unexpectedExpenses.splice(expenseIndex, 1);

    // Hitung ulang total pengeluaran tak terduga
    dailyReport.totalUnexpectedExpenses = dailyReport.unexpectedExpenses.reduce(
      (total, expense) => total + expense.amount,
      0
    );

    // Hitung pendapatan bersih (netIncome)
    dailyReport.netIncome =
      dailyReport.income + dailyReport.totalUnexpectedExpenses;

    // Simpan perubahan ke database
    await dailyReport.save();

    res.status(200).json({
      message: "Biaya tak terduga berhasil dihapus.",
      // dailyReport,
    });
  } catch (error) {
    console.error("Error deleting unexpected expense:", error);
    res
      .status(500)
      .json({ message: "Gagal menghapus biaya tak terduga.", error });
  }
};

const updateUnexpectedExpense = async (req, res) => {
  const { dailyReportId, expenseId } = req.params;
  const { description, amount } = req.body;

  try {
    // Cari laporan harian berdasarkan ID
    const dailyReport = await DailyReport.findById(dailyReportId);

    if (!dailyReport) {
      return res
        .status(404)
        .json({ message: "Laporan harian tidak ditemukan." });
    }

    // Temukan biaya tak terduga yang akan diperbarui
    const expense = dailyReport.unexpectedExpenses.find(
      (exp) => exp._id.toString() === expenseId
    );

    if (!expense) {
      return res
        .status(404)
        .json({ message: "Biaya tak terduga tidak ditemukan." });
    }

    // Update detail biaya tak terduga
    if (description) expense.description = description;
    if (amount !== undefined) expense.amount = amount;

    // Hitung ulang total pengeluaran tak terduga
    dailyReport.totalUnexpectedExpenses = dailyReport.unexpectedExpenses.reduce(
      (total, exp) => total + exp.amount,
      0
    );

    // Hitung ulang pendapatan bersih (netIncome)
    dailyReport.netIncome =
      dailyReport.income + dailyReport.totalUnexpectedExpenses;

    // Simpan perubahan ke database
    await dailyReport.save();

    res.status(200).json({
      message: "Biaya tak terduga berhasil diperbarui.",
    });
  } catch (error) {
    console.error("Error updating unexpected expense:", error);
    res
      .status(500)
      .json({ message: "Gagal memperbarui biaya tak terduga.", error });
  }
};

// Mendapatkan Detail Laporan Harian Berdasarkan Tanggal dan Branch
const getDailyReportDetailByDateAndBranch = async (req, res) => {
  const { date, categoryOrBranchId } = req.query; // Ambil date dan categoryOrBranchId dari query

  if (!date || !categoryOrBranchId) {
    return res.status(400).json({
      error: "Parameter 'date' dan 'categoryOrBranchId' diperlukan.",
    });
  }

  try {
    // Ambil tanggal dalam format YYYY-MM-DD (misalnya: "2025-01-08")
    const formattedDate = new Date(date).toISOString().split("T")[0]; // Ambil hanya tanggalnya

    // Cari laporan berdasarkan categoryOrBranchId dan hanya berdasarkan tanggal
    const dailyReport = await DailyReport.findOne({
      categoryOrBranchId,
      date: { $regex: `^${formattedDate}` }, // Cocokkan hanya berdasarkan YYYY-MM-DD
    })
      .populate("categoryOrBranchId", "name") // Ambil nama kategori atau cabang
      .lean();

    if (!dailyReport) {
      return res.status(404).json({ error: "Laporan harian tidak ditemukan." });
    }

    // Format data untuk respon
    const formattedReport = {
      _id: dailyReport._id,
      name: dailyReport.categoryOrBranchId?.name || "Unknown",
      date: dailyReport.date,
      products: dailyReport.products,
      unexpectedExpenses: dailyReport.unexpectedExpenses,
      income: dailyReport.income,
      totalUnexpectedExpenses: dailyReport.totalUnexpectedExpenses,
      netIncome: dailyReport.netIncome,
    };

    res.status(200).json(formattedReport);
  } catch (error) {
    console.error("Error fetching daily report detail:", error);
    res.status(500).json({ error: "Gagal mengambil detail laporan harian." });
  }
};

const getNetIncomeByCategory = async (req, res) => {
  const { categoryId } = req.query;

  try {
    // Jika ada parameter categoryId, ambil berdasarkan categoryId
    if (categoryId) {
      const netIncome = await NetIncomeMonthly.findOne({ categoryId });

      if (!netIncome) {
        return res.status(404).json({
          error: "Data net income untuk kategori ini tidak ditemukan.",
        });
      }

      return res.status(200).json(netIncome);
    }

    // Jika tidak ada parameter categoryId, ambil semua data
    const netIncomes = await NetIncomeMonthly.find();

    // if (netIncomes.length === 0) {
    //   return res.status(404).json({
    //     error: "Tidak ada data net income ditemukan.",
    //   });
    // }

    return res.status(200).json(netIncomes);
  } catch (error) {
    console.error("Error fetching net income:", error);
    res.status(500).json({ error: "Gagal mengambil data net income." });
  }
};

const getMonthlyIncomePerBranch = async (req, res) => {
  try {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");

    // Format tanggal awal dan akhir bulan sebagai string
    const startOfMonth = `${year}-${month}-01`;
    const endOfMonth = `${year}-${String(now.getMonth() + 2).padStart(
      2,
      "0"
    )}-01`; // Awal bulan berikutnya

    // Ambil semua cabang
    const branches = await Branch.find().lean();
    if (branches.length === 0) {
      return res.status(404).json({
        error: "Tidak ada cabang ditemukan.",
      });
    }

    const branchIds = branches.map((branch) => branch._id);

    // Hitung income, unexpected expenses, dan net income
    const branchSummaries = await DailyReport.aggregate([
      {
        $match: {
          categoryOrBranchId: { $in: branchIds },
          categoryOrBranchModel: "Branch",
          date: { $gte: startOfMonth, $lt: endOfMonth }, // Filter berdasarkan string tanggal
        },
      },
      {
        $addFields: {
          unexpectedExpensesTotal: {
            $sum: "$unexpectedExpenses.amount",
          },
        },
      },
      {
        $group: {
          _id: "$categoryOrBranchId",
          totalIncome: { $sum: "$income" },
          totalUnexpectedExpenses: { $sum: "$unexpectedExpensesTotal" },
          totalNetIncome: { $sum: "$netIncome" },
        },
      },
      {
        $sort: { _id: 1 }, // Urutkan berdasarkan _id cabang
      },
    ]);

    // Gabungkan hasil dengan data cabang
    const summaryPerBranch = branchSummaries.map((summary) => {
      const branch = branches.find(
        (branch) => branch._id.toString() === summary._id.toString()
      );
      return {
        branchId: branch._id,
        branchName: branch?.name || "Unknown",
        income: summary.totalIncome,
        totalUnexpectedExpenses: summary.totalUnexpectedExpenses,
        totalNetIncome: summary.totalNetIncome,
      };
    });

    return res.status(200).json(summaryPerBranch);
  } catch (error) {
    console.error("Error fetching monthly branch summary:", error);
    res
      .status(500)
      .json({ error: "Gagal menghitung ringkasan bulanan per cabang." });
  }
};

module.exports = {
  createDailyReport,
  getDailyReportsByCategoryOrBranch,
  getDailyReportDetail,
  updateProductAmountSold,
  addUnexpectedExpense,
  deleteUnexpectedExpense,
  updateUnexpectedExpense,
  getDailyReportDetailByDateAndBranch,
  getNetIncomeByCategory,
  getMonthlyIncomePerBranch,
};
