const { UnexpectedExpense } = require("../models/models_schema");

// Menambahkan biaya tidak terduga
exports.addUnexpectedExpense = async (req, res) => {
  const {
    categoryOrBranchId,
    categoryOrBranchModel,
    date,
    amount,
    description,
  } = req.body;

  try {
    const expense = new UnexpectedExpense({
      categoryOrBranchId,
      categoryOrBranchModel,
      date,
      amount,
      description,
    });
    await expense.save();
    res
      .status(201)
      .json({ message: "Biaya tidak terduga berhasil ditambahkan", expense });
  } catch (error) {
    res.status(500).json({
      message: "Gagal menambahkan biaya tidak terduga",
      error: error.message,
    });
  }
};

// Mengambil biaya tidak terduga berdasarkan kategori/cabang dan tanggal (opsional)
exports.getUnexpectedExpenses = async (req, res) => {
  const { id, model } = req.params;
  const { date } = req.query; // Tanggal (opsional)

  try {
    const filter = { categoryOrBranchId: id, categoryOrBranchModel: model };
    if (date) {
      filter.date = new Date(date);
    }
    const expenses = await UnexpectedExpense.find(filter);
    res.json({ expenses });
  } catch (error) {
    res.status(500).json({
      message: "Gagal mengambil biaya tidak terduga",
      error: error.message,
    });
  }
};
