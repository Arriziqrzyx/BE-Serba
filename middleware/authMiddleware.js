const jwt = require("jsonwebtoken");
const User = require("../models/models_schema").User;

const authenticate = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token provided" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user || user.currentSessionToken !== token) {
      return res.status(401).json({ message: "Invalid session" });
    }

    req.user = decoded;
    next();
  } catch (err) {
    console.error(err);
    res.status(403).json({ message: "Unauthorized" });
  }
};

module.exports = authenticate;
