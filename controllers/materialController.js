const { Material } = require("../models/models_schema");
const moment = require("moment-timezone");

// Tambah Data Bahan Baru
const addMaterial = async (req, res) => {
  try {
    const { materialName, pricePerUnit, totalUnits, purchaseDate } = req.body;

    const today = moment.tz("Asia/Jakarta").startOf("day").format(); // ISO 8601 String

    // Validasi input
    if (!materialName || !pricePerUnit || !totalUnits || !purchaseDate) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const material = new Material({
      materialName,
      pricePerUnit,
      totalUnits,
      purchaseDate: today, // Simpan sebagai Date
    });

    const savedMaterial = await material.save();
    res.status(201).json({
      message: "Material added successfully",
      material: savedMaterial,
    });
  } catch (error) {
    res.status(500).json({ message: "Error adding material", error });
  }
};

// Tandai Unit Terpakai
const updateUsedUnits = async (req, res) => {
  try {
    const { id } = req.params;
    const { usedUnits } = req.body;

    if (!usedUnits && usedUnits !== 0) {
      return res.status(400).json({ message: "Used units are required" });
    }

    const material = await Material.findById(id);

    if (!material) {
      return res.status(404).json({ message: "Material not found" });
    }

    if (usedUnits > material.totalUnits) {
      return res.status(400).json({
        message: "Used units cannot exceed total units",
      });
    }

    material.usedUnits = usedUnits;
    const updatedMaterial = await material.save();

    res.status(200).json({
      message: "Material updated successfully",
      material: updatedMaterial,
    });
  } catch (error) {
    res.status(500).json({ message: "Error updating material", error });
  }
};

// Get Semua Data Bahan Bulanan
const getMonthlyMaterials = async (req, res) => {
  try {
    const { month, year } = req.query;

    if (!month || !year) {
      return res.status(400).json({ message: "Month and year are required" });
    }

    // Pastikan month dan day menggunakan dua digit
    const formattedMonth = String(month).padStart(2, "0"); // Misal: "1" -> "01"
    const formattedDay = "01"; // Tanggal selalu "01" untuk awal bulan

    // Buat range tanggal untuk bulan dan tahun yang diminta
    const startDate = moment
      .tz(`${year}-${formattedMonth}-${formattedDay}`, "Asia/Jakarta")
      .startOf("day")
      .format();
    const endDate = moment
      .tz(`${year}-${formattedMonth}-${formattedDay}`, "Asia/Jakarta")
      .endOf("month")
      .format();

    // Cari data berdasarkan range tanggal
    const materials = await Material.find({
      purchaseDate: { $gte: startDate, $lte: endDate },
    });

    // Hitung total nilai
    let totalUsedValue = 0;
    let totalUnusedValue = 0;
    let grandTotalValue = 0;

    const formattedMaterials = materials.map((material) => {
      totalUsedValue += material.usedValue;
      totalUnusedValue += material.unusedValue;
      grandTotalValue += material.totalValue;

      return {
        _id: material._id,
        materialName: material.materialName,
        pricePerUnit: material.pricePerUnit,
        totalUnits: material.totalUnits,
        usedUnits: material.usedUnits,
        unusedUnits: material.unusedUnits,
        totalValue: material.totalValue,
        usedValue: material.usedValue,
        unusedValue: material.unusedValue,
        purchaseDate: material.purchaseDate,
      };
    });

    res.status(200).json({
      materials: formattedMaterials,
      totalUsedValue,
      totalUnusedValue,
      grandTotalValue,
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching materials", error });
  }
};

// Ekspor semua fungsi
module.exports = {
  addMaterial,
  updateUsedUnits,
  getMonthlyMaterials,
};
