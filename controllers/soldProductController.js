// controllers/soldProductController.js
const { SoldProduct, Product } = require("../models/models_schema");

// Tambah jumlah produk terjual
const addSoldProduct = async (req, res) => {
  try {
    const { productId, date, amountSold } = req.body;

    // Validasi produk
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Cek jika sudah ada penjualan pada tanggal yang sama
    const existingSoldProduct = await SoldProduct.findOne({ productId, date });

    if (existingSoldProduct) {
      // Update jumlah terjual jika sudah ada data
      existingSoldProduct.amountSold += amountSold;
      await existingSoldProduct.save();
      return res.status(200).json({
        message: "Sold product updated successfully",
        soldProduct: existingSoldProduct,
      });
    }

    // Tambah data baru jika belum ada
    const soldProduct = new SoldProduct({ productId, date, amountSold });
    await soldProduct.save();

    res
      .status(201)
      .json({ message: "Sold product added successfully", soldProduct });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error adding sold product", error: error.message });
  }
};

module.exports = { addSoldProduct };
