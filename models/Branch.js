// models/Branch.js
const mongoose = require("mongoose");

const branchSchema = new mongoose.Schema({
  name: { type: String, required: true }, // Nama cabang
  category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" }, // Referensi ke kategori
  products: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      sold: { type: Number, default: 0 }, // Jumlah terjual di cabang ini
    },
  ],
});

module.exports = mongoose.model("Branch", branchSchema);
