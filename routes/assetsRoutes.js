const express = require("express");
const {
  createAsset,
  getAllAssets,
  processDepreciationCheck,
} = require("../controllers/assetsController");

const router = express.Router();

router.post("/", createAsset);
router.get("/", getAllAssets);
router.post("/depreciation-check", processDepreciationCheck);

module.exports = router;
