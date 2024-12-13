const multer = require("multer");
const path = require("path");

// Tentukan penyimpanan file
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/products"); // Tentukan folder tempat gambar disimpan
  },
  filename: (req, file, cb) => {
    cb(
      null,
      Date.now() + path.extname(file.originalname) // Nama file unik berdasarkan waktu
    );
  },
});

// Filter untuk menerima hanya file gambar
const fileFilter = (req, file, cb) => {
  const filetypes = /jpeg|jpg|png|gif/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true); // File diterima
  } else {
    cb(new Error("Only image files are allowed!"), false); // Menolak file selain gambar
  }
};

// Setup multer dengan konfigurasi yang telah dibuat
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // Maksimal ukuran file 5MB
});

module.exports = upload;
