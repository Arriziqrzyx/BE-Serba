const User = require("../models/models_schema").User;
const mongoose = require("mongoose");
require("dotenv").config();

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

const testDelete = async () => {
  try {
    await User.updateMany(
      { role: "staff" },
      { $set: { currentSessionToken: null } }
    );
    console.log("Auto logout completed for staff");
  } catch (err) {
    console.error("Error during auto logout:", err);
  }
};

testDelete();
