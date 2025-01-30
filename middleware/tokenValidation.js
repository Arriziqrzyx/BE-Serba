const jwt = require("jsonwebtoken");
const User = require("../models/models_schema").User;

const validateToken = async (req, res, next) => {
  const token = req.header("Authorization")?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Token Tidak Ada" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user || user.currentSessionToken !== token) {
      return res
        .status(419)
        .json({ message: "Sesi kadaluarsa, silakan login kembali." });
    }

    // Simpan data user di request untuk digunakan di controller
    req.user = user;
    next(); // Lanjut ke controller berikutnya
  } catch (error) {
    res.status(403).json({ message: "Token tidak valid." });
  }
};

module.exports = validateToken;
