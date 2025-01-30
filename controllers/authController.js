const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../models/models_schema").User;

const login = async (req, res) => {
  const { username, password, forceLogin } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ message: "User tidak ditemukan" });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid)
      return res.status(401).json({ message: "Password Salah" });

    if (user.currentSessionToken) {
      if (!forceLogin) {
        return res.status(200).json({
          message: "Active session found on another device",
          activeSessionFound: true,
        });
      }
    }

    const token = jwt.sign(
      { id: user._id, role: user.role, branch: user.branch, name: user.name },
      process.env.JWT_SECRET
    );
    user.currentSessionToken = token;
    await user.save();

    // Kirimkan token beserta role dan branch dalam response
    return res.status(200).json({
      message: forceLogin ? "Login successful (forced)" : "Login successful",
      token,
      forceLoginSuccess: !!forceLogin,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

const logout = async (req, res) => {
  const userId = req.user.id;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.currentSessionToken = null;
    await user.save();

    res.status(200).json({ message: "Logout successful" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { login, logout };

// const validateToken = async (req, res) => {
//   const token = req.header("Authorization")?.split(" ")[1];
//   if (!token) return res.status(401).json({ message: "Token Tidak Ada" });

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     const user = await User.findById(decoded.id);

//     if (!user || user.currentSessionToken !== token) {
//       return res
//         .status(408)
//         .json({ message: "Sesi kadaluarsa, silakan login kembali." });
//     }

//     res.status(200).json({ message: "Token valid" });
//   } catch (error) {
//     res.status(403).json({ message: "Token tidak valid." });
//   }
// };

// const das = async (req, res) => {
//   const { username, password, forceLogin } = req.body;

//   try {
//     // Cari user berdasarkan username
//     const user = await User.findOne({ username });
//     if (!user) {
//       return res.status(404).json({ message: "User tidak ditemukan" });
//     }

//     // Verifikasi password
//     const isPasswordValid = await bcrypt.compare(password, user.password);
//     if (!isPasswordValid) {
//       return res.status(401).json({ message: "Password Salah" });
//     }

//     // Cek apakah sesi aktif ada
//     if (user.currentSessionToken) {
//       if (!forceLogin) {
//         return res.status(200).json({
//           message: "Active session found on another device",
//           activeSessionFound: true,
//         });
//       }
//     }

//     // Buat token baru dan perbarui currentSessionToken
//     const token = jwt.sign(
//       { id: user._id, role: user.role, branch: user.branch, name: user.name }, // Pastikan branch ditambahkan di sini
//       process.env.JWT_SECRET
//     );
//     user.currentSessionToken = token;
//     await user.save();

//     // Kirimkan token beserta role dan branch dalam response
//     return res.status(200).json({
//       message: forceLogin ? "Login successful (forced)" : "Login successful",
//       token,
//       name: user.name,
//       role: user.role, // Menambahkan role dalam response
//       branch: user.branch, // Menambahkan branch dalam response
//       forceLoginSuccess: !!forceLogin,
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Something went wrong" });
//   }
// };
