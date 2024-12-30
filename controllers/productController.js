// controllers/productController.js
const { Product, Category, Branch } = require("../models/models_schema");
const mongoose = require("mongoose"); // Tambahkan ini
const { ObjectId } = mongoose.Types;

// Tambah produk baru
const createProduct = async (req, res) => {
  try {
    const { name, price, categoryOrBranchId, categoryOrBranchModel } = req.body;

    // Validasi model referensi
    if (!["Category", "Branch"].includes(categoryOrBranchModel)) {
      return res.status(400).json({ message: "Invalid categoryOrBranchModel" });
    }

    // Cek apakah referensi kategori/cabang valid
    const refModel = categoryOrBranchModel === "Category" ? Category : Branch;
    const reference = await refModel.findById(categoryOrBranchId);
    if (!reference) {
      return res
        .status(404)
        .json({ message: `${categoryOrBranchModel} not found` });
    }

    // Buat produk baru
    const product = new Product({
      name,
      price,
      photo: req.file ? req.file.path : null, // Gunakan path file
      categoryOrBranchId,
      categoryOrBranchModel,
    });

    console.log("Saving product:", product); // Log produk sebelum disimpan
    await product.save();
    res.status(201).json({ message: "Product created successfully", product });
  } catch (error) {
    console.error("Error creating product:", error.message); // Log detail error
    res
      .status(500)
      .json({ message: "Error creating product", error: error.message });
  }
};

// Ambil semua produk berdasarkan kategori/cabang
const getProductsByCategoryOrBranch = async (req, res) => {
  try {
    const { id, model } = req.params;

    // console.log("Fetching products for:", { id, model });

    const products = await Product.aggregate([
      {
        $match: {
          categoryOrBranchId: new ObjectId(id), // Konversi id ke ObjectId
          categoryOrBranchModel: model,
        },
      },
      {
        $lookup: {
          from: "soldproducts", // Koleksi soldProduct
          localField: "_id", // Field di koleksi Product
          foreignField: "productId", // Field referensi di SoldProduct
          as: "soldData", // Alias untuk data sold
        },
      },
      {
        $addFields: {
          sold: { $sum: "$soldData.amountSold" }, // Hitung total penjualan
        },
      },
      {
        $project: {
          soldData: 0, // Jangan tampilkan detail soldData (opsional)
        },
      },
    ]);

    // console.log("Aggregated Products:", products);
    res.status(200).json(products);
  } catch (error) {
    console.error("Error fetching products:", error.message);
    res.status(500).json({ message: "Error fetching products" });
  }
};

// Hapus produk
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // Hapus produk berdasarkan ID
    const product = await Product.findByIdAndDelete(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({ message: "Product deleted successfully", product });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting product", error: error.message });
  }
};

module.exports = {
  createProduct,
  getProductsByCategoryOrBranch,
  deleteProduct,
};
