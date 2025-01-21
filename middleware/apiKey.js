// Ambil API key dari environment variable
const apiKey = process.env.API_KEY;

const checkApiKey = (req, res, next) => {
  const userApiKey = req.headers["x-api-key"]; // Ambil API key dari header

  // Jika API key tidak ada
  if (!userApiKey) {
    return res.status(403).json({ message: "API key is required" });
  }

  // Jika API key tidak valid
  if (userApiKey !== apiKey) {
    return res.status(403).json({ message: "Invalid API key" });
  }

  next(); // Jika API key valid, lanjutkan ke route berikutnya
};

module.exports = checkApiKey;
