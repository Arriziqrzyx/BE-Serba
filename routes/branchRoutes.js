// routes/branchRoutes.js
const express = require("express");
const Branch = require("../models/Branch");
const router = express.Router();

// Membuat cabang baru
router.post("/:categoryId", async (req, res) => {
  const { name } = req.body;
  const { categoryId } = req.params;

  try {
    const branch = new Branch({ name, category: categoryId });
    await branch.save();
    res.status(201).json(branch);
  } catch (error) {
    res.status(500).json({ message: "Failed to create branch", error });
  }
});

// Mendapatkan semua cabang berdasarkan kategori
router.get("/:categoryId", async (req, res) => {
  const { categoryId } = req.params;

  try {
    const branches = await Branch.find({ category: categoryId });
    res.status(200).json(branches);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch branches", error });
  }
});

module.exports = router;
