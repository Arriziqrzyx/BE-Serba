const Category = require("../models/Category");

// Membuat kategori baru
const createCategory = async (req, res) => {
  try {
    const { name } = req.body;
    const newCategory = new Category({ name });
    await newCategory.save();
    res
      .status(201)
      .json({
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

module.exports = { createCategory, getCategories };
