const { OperationalExpense } = require("../models/models_schema");
const moment = require("moment-timezone");

// Tambah data baru
exports.createExpense = async (req, res) => {
  try {
    const { category, description, amount, date } = req.body;

    // Jika tanggal diberikan, gunakan tanggal tersebut; jika tidak, gunakan waktu sekarang
    const formattedDate = date
      ? moment.tz(date, "Asia/Jakarta").startOf("day").format() // Format waktu yang diberikan
      : moment.tz("Asia/Jakarta").startOf("day").format(); // Waktu saat ini, di awal hari

    const expense = new OperationalExpense({
      category,
      description,
      amount,
      date: formattedDate,
    });

    await expense.save();
    res.status(201).json({ success: true, data: expense });
    // console.log("Formatted Date (Asia/Jakarta):", formattedDate);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Ambil semua data (filter optional berdasarkan bulan)
exports.getExpenses = async (req, res) => {
  try {
    const { month, currentMonth } = req.query; // `month` atau `currentMonth`

    const filter = {};

    // Jika parameter `month` diberikan, filter berdasarkan bulan
    if (month) {
      const start = moment
        .tz(`${month}-01`, "Asia/Jakarta")
        .startOf("month")
        .toISOString(); // Awal bulan dalam string ISO
      const end = moment(start).endOf("month").toISOString(); // Akhir bulan dalam string ISO
      filter.date = { $gte: start, $lt: end };
    } else if (currentMonth === "true") {
      // Jika parameter `currentMonth=true`, filter berdasarkan bulan berjalan
      const start = moment.tz("Asia/Jakarta").startOf("month").toISOString(); // Awal bulan berjalan
      const end = moment(start).endOf("month").toISOString(); // Akhir bulan berjalan
      filter.date = { $gte: start, $lt: end };
    }

    // Ambil data dari database berdasarkan filter
    const expenses = await OperationalExpense.find(filter).sort({ date: -1 });
    res.status(200).json({ success: true, data: expenses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Ambil total amount per kategori dan total keseluruhan
exports.getExpenseSummary = async (req, res) => {
  try {
    const { currentMonth } = req.query; // Parameter untuk filter bulan berjalan

    const filter = {};

    // Jika parameter `currentMonth=true`, filter berdasarkan bulan berjalan
    if (currentMonth === "true") {
      const start = moment.tz("Asia/Jakarta").startOf("month").toISOString(); // Awal bulan berjalan
      const end = moment(start).endOf("month").toISOString(); // Akhir bulan berjalan
      filter.date = { $gte: start, $lt: end };
    }

    // Gunakan agregasi MongoDB untuk menghitung total amount per kategori
    const summary = await OperationalExpense.aggregate([
      { $match: filter }, // Filter data sesuai bulan jika ada
      {
        $group: {
          _id: "$category", // Kelompokkan berdasarkan kategori
          totalAmount: { $sum: "$amount" }, // Hitung total amount untuk setiap kategori
        },
      },
      {
        $sort: { _id: 1 }, // Urutkan kategori berdasarkan abjad
      },
    ]);

    // Hitung total keseluruhan dari semua kategori
    const totalOverall = summary.reduce(
      (acc, curr) => acc + curr.totalAmount,
      0
    );

    // Format respon
    res.status(200).json({
      success: true,
      data: {
        perCategory: summary,
        totalOverall,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Hapus data berdasarkan ID
exports.deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;

    const expense = await OperationalExpense.findByIdAndDelete(id);
    if (!expense) {
      return res
        .status(404)
        .json({ success: false, message: "Expense not found" });
    }

    res
      .status(200)
      .json({ success: true, message: "Expense deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update data berdasarkan ID
exports.updateExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const expense = await OperationalExpense.findByIdAndUpdate(id, updates, {
      new: true,
    });
    if (!expense) {
      return res
        .status(404)
        .json({ success: false, message: "Expense not found" });
    }

    res.status(200).json({ success: true, data: expense });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
