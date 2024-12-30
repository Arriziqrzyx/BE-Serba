// controllers/branchController.js
const { Branch, Category } = require("../models/models_schema");

// Tambah cabang baru
const createBranch = async (req, res) => {
  try {
    const { name, categoryId } = req.body;

    // Validasi kategori
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    // Buat cabang baru
    const branch = new Branch({
      name,
      category: categoryId,
    });

    await branch.save();
    res.status(201).json({ message: "Branch created successfully", branch });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating branch", error: error.message });
  }
};

// Ambil semua cabang berdasarkan kategori
const getBranchesByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;

    // Ambil cabang berdasarkan kategori
    const branches = await Branch.find({ category: categoryId });

    res.status(200).json({ branches });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching branches", error: error.message });
  }
};

// Hapus cabang
const deleteBranch = async (req, res) => {
  try {
    const { id } = req.params;

    // Hapus cabang berdasarkan ID
    const branch = await Branch.findByIdAndDelete(id);
    if (!branch) {
      return res.status(404).json({ message: "Branch not found" });
    }

    res.status(200).json({ message: "Branch deleted successfully", branch });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting branch", error: error.message });
  }
};

module.exports = { createBranch, getBranchesByCategory, deleteBranch };
