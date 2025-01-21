const express = require("express");
const router = express.Router();
const {
  addMaterial,
  updateUsedUnits,
  getMonthlyMaterials,
} = require("../controllers/materialController");

router.post("/", addMaterial); // Tambah bahan baru
router.patch("/:id/use", updateUsedUnits); // Update unit terpakai
router.get("/", getMonthlyMaterials); // Get bahan bulanan

module.exports = router;
