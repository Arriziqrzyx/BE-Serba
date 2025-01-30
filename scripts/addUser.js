const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
require("dotenv").config();

const User = require("../models/models_schema").User;

// Koneksi ke database
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Tambahkan contoh user
const addUser = async () => {
  try {
    const hashedPassword = await bcrypt.hash("sejak2020", 10);

    const users = [
      {
        username: "admin1",
        password: hashedPassword,
        name: "Admin 1",
        role: "admin",
        branch: null,
      },
      {
        username: "barista",
        password: hashedPassword,
        name: "Staff Kopi",
        role: "staff",
        branch: "kopi",
      },
      {
        username: "kokiayam",
        password: hashedPassword,
        name: "Staff Ayam D Kremes",
        role: "staff",
        branch: "ayam",
      },
      {
        username: "tehpusat",
        password: hashedPassword,
        name: "Staff Teh Pusat",
        role: "staff",
        branch: "pusat",
      },
      {
        username: "tehbangkir",
        password: hashedPassword,
        name: "Staff Teh Bangkir",
        role: "staff",
        branch: "bangkir",
      },
    ];

    await User.insertMany(users);
    console.log("Users added successfully");
    mongoose.connection.close();
  } catch (err) {
    console.error("Error adding users:", err);
    mongoose.connection.close();
  }
};

addUser();
