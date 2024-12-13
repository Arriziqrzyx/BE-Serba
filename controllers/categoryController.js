const Category = require("../models/Category");

// Membuat kategori baru
const createCategory = async (req, res) => {
  try {
    const { name } = req.body;
    const iconPath = req.file.path; // Multer akan menyimpan path file di req.file

    const newCategory = new Category({
      name,
      icon: iconPath, // Simpan path icon ke dalam database
    });

    await newCategory.save();
    res.status(201).json({
      message: "Category created successfully",
      category: newCategory,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to create category" });
  }
};

// Mendapatkan semua kategori
const getCategories = async (req, res) => {
  try {
    const categories = await Category.find().populate("products");
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch categories" });
  }
};

// Mendapatkan kategori berdasarkan categoryId
const getCategoryById = async (req, res) => {
  const { categoryId } = req.params; // Ambil categoryId dari parameter URL
  try {
    const category = await Category.findById(categoryId); // Temukan kategori berdasarkan ID
    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }
    res.status(200).json(category); // Kembalikan kategori yang ditemukan
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch category" });
  }
};

module.exports = { createCategory, getCategories, getCategoryById };
