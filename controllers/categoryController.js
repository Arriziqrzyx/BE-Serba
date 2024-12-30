// controllers/categoryController.js

const { Category, Branch } = require("../models/models_schema"); // Pastikan file ini berada di lokasi yang benar

// Ambil semua kategori dengan properti hasBranch
const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find();

    // Tambahkan properti hasBranch secara dinamis
    const categoriesWithBranches = await Promise.all(
      categories.map(async (category) => {
        const branchCount = await Branch.countDocuments({
          category: category._id,
        });
        return {
          ...category._doc, // Salin data kategori
          hasBranch: branchCount > 0, // true jika ada cabang
        };
      })
    );

    res.status(200).json(categoriesWithBranches);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching categories", error: error.message });
  }
};

// Menambahkan kategori baru
const addCategory = async (req, res) => {
  try {
    const { name } = req.body;

    // Cek jika file icon diupload
    const icon = req.file ? req.file.path : null;

    // Validasi jika name kosong
    if (!name) {
      return res.status(400).json({ message: "Name is required." });
    }

    // Buat kategori baru
    const newCategory = new Category({ name, icon });
    await newCategory.save();

    res
      .status(201)
      .json({ message: "Category added successfully!", category: newCategory });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getCategoryById = async (req, res) => {
  const { categoryId } = req.params;
  // console.log("Category ID received:", categoryId); // Debugging log
  try {
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    res.status(200).json(category);
  } catch (error) {
    console.error("Error fetching category:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { getAllCategories, addCategory, getCategoryById };
