const mongoose = require("mongoose");

const dailySalesSchema = new mongoose.Schema({
  date: { type: String, required: true }, // Format: YYYY-MM-DD
  category: { type: String, required: true },
  totalRevenue: { type: Number, required: true },
  details: [
    {
      productName: { type: String, required: true },
      amountSold: { type: Number, required: true },
      revenue: { type: Number, required: true },
    },
  ],
});

module.exports = mongoose.model("DailySales", dailySalesSchema);
