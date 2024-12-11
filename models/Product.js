const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  photo: { type: String, required: true },
  sold: { type: Number, default: 0 },
  sales: [
    {
      date: { type: Date, required: true },
      amountSold: { type: Number, required: true },
    },
  ],
});

module.exports = mongoose.model("Product", productSchema);
