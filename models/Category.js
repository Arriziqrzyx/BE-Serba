const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  icon: { type: String, required: true }, // URL atau path icon
  products: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
});

module.exports = mongoose.model("Category", categorySchema);
