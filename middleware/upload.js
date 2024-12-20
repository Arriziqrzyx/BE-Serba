// middleware/upload.js

const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Membuat folder secara otomatis jika belum ada
const createFolderIfNotExists = (folderPath) => {
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }
};

// Storage untuk kategori icon
const iconStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folderPath = "uploads/icons";
    createFolderIfNotExists(folderPath); // Buat folder jika belum ada
    cb(null, folderPath);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

// Storage untuk foto produk
const productStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folderPath = "uploads/products";
    createFolderIfNotExists(folderPath); // Buat folder jika belum ada
    cb(null, folderPath);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

// Filter untuk memvalidasi hanya file gambar yang diperbolehkan
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype = allowedTypes.test(file.mimetype);

  console.log("File being uploaded:", {
    originalname: file.originalname,
    mimetype: file.mimetype,
    extname: path.extname(file.originalname),
  });

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error("Only images are allowed!"));
  }
};

// Middleware untuk upload
const uploadIcon = multer({ storage: iconStorage, fileFilter });
const uploadProductPhoto = multer({ storage: productStorage, fileFilter });

module.exports = { uploadIcon, uploadProductPhoto };
