const Product = require("../models/Product");
const Category = require("../models/Category");

// Membuat produk baru dalam kategori tertentu
const createProduct = async (req, res) => {
  try {
    const { name, price } = req.body;
    const { categoryId } = req.params;
    const photo = req.file ? req.file.path : null; // Ambil path gambar dari upload

    // Pastikan gambar ada jika tidak ditambahkan
    if (!photo) {
      return res.status(400).json({ error: "Product image is required" });
    }

    const newProduct = new Product({ name, price, photo });
    await newProduct.save();

    // Menambahkan produk ke kategori yang sesuai
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }
    category.products.push(newProduct._id);
    await category.save();

    // res
    //   .status(201)
    //   .json({ message: "Product created successfully", product: newProduct });
    console.log("File received:", req.file);
    console.log("Body received:", req.body);
    res
      .status(200)
      .json({
        message: "Product added successfully",
        data: req.body,
        file: req.file,
      });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create product" });
  }
};

// Mendapatkan semua produk dalam kategori
const getProductsByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const products = await Product.find({
      _id: { $in: (await Category.findById(categoryId)).products },
    });
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch products" });
  }
};

// Perbarui Jumlah Terjual Produk
const updateProductSold = async (req, res) => {
  try {
    const { productId } = req.params;
    const { amountSold } = req.body;

    // Validasi jumlah yang ditambahkan
    if (!amountSold || amountSold <= 0) {
      return res.status(400).json({ error: "Invalid sold amount" });
    }

    // Cari produk dan perbarui jumlah terjual
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    product.sold += amountSold;

    // Simpan penjualan harian
    const today = new Date().toISOString().slice(0, 10); // Format: YYYY-MM-DD
    const existingSale = product.sales.find((sale) => sale.date === today);

    if (existingSale) {
      existingSale.amountSold += amountSold;
    } else {
      product.sales.push({ date: today, amountSold });
    }

    await product.save();
    res
      .status(200)
      .json({ message: "Product sold count updated successfully", product });
  } catch (error) {
    res.status(500).json({ error: "Failed to update sold count" });
  }
};

// Hitung Omzet Harian
const calculateDailyRevenue = async (req, res) => {
  try {
    const { categoryId } = req.params;

    // Cari kategori dan produk terkait
    const category = await Category.findById(categoryId).populate("products");
    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }

    const today = new Date().toISOString().slice(0, 10); // Format: YYYY-MM-DD
    let totalRevenue = 0;

    // Hitung omzet dari produk-produk dalam kategori
    for (const productId of category.products) {
      const product = await Product.findById(productId);

      // Gunakan filter untuk mendapatkan penjualan hari ini
      const todaySales = product.sales.filter((sale) => {
        const saleDate = new Date(sale.date).toISOString().slice(0, 10);
        return saleDate === today;
      });

      // Hitung omzet berdasarkan penjualan hari ini
      if (todaySales.length > 0) {
        totalRevenue += todaySales.reduce(
          (sum, sale) => sum + sale.amountSold * product.price,
          0
        );
      }
    }

    res.status(200).json({ date: today, revenue: totalRevenue });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to calculate daily revenue" });
  }
};

module.exports = {
  createProduct,
  getProductsByCategory,
  updateProductSold,
  calculateDailyRevenue,
};
