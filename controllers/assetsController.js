const { Asset } = require("../models/models_schema");

const createAsset = async (req, res) => {
  try {
    const { assetName, assetPrice, depreciationPeriod, purchaseDate } =
      req.body;

    // Calculate monthly depreciation and end date
    // const monthlyDepreciation = Math.round(assetPrice / depreciationPeriod); // Pembulatan ke angka bulat

    const monthlyDepreciation =
      Math.ceil(assetPrice / depreciationPeriod / 1000) * 1000; // Dibulatkan ke ribuan diatasnya (gunakan Math.round jika ingin bulat terdekat)
    const depreciationEndDate = new Date(purchaseDate);
    depreciationEndDate.setMonth(
      depreciationEndDate.getMonth() + depreciationPeriod
    );

    // Create new asset
    const asset = new Asset({
      assetName,
      assetPrice,
      depreciationPeriod,
      monthlyDepreciation,
      purchaseDate,
      depreciationEndDate,
    });

    await asset.save();
    res.status(201).json({ message: "Asset saved successfully", asset });
  } catch (error) {
    res.status(500).json({ message: "An error occurred", error });
  }
};

const getAllAssets = async (req, res) => {
  try {
    const assets = await Asset.find();

    // Hitung total monthly depreciation
    let totalMonthlyDepreciation = 0;

    const formattedAssets = assets.map((asset) => {
      // Hitung sisa masa penyusutan
      const today = new Date();
      const endDate = new Date(asset.depreciationEndDate);
      let remainingMonths = 0;
      let remainingYears = 0;

      if (endDate > today) {
        const totalMonths =
          (endDate.getFullYear() - today.getFullYear()) * 12 +
          (endDate.getMonth() - today.getMonth());

        remainingYears = Math.floor(totalMonths / 12);
        remainingMonths = totalMonths % 12;
      }

      // Tentukan nilai remainingDepreciation
      let remainingDepreciation;
      if (!asset.depreciationStatus) {
        remainingDepreciation = "Habis"; // Jika status false, langsung set "Habis"
      } else {
        remainingDepreciation =
          remainingYears > 0 || remainingMonths > 0
            ? `${remainingYears > 0 ? `${remainingYears} tahun ` : ""}${
                remainingMonths > 0 ? `${remainingMonths} bulan` : ""
              }`
            : "0 bulan"; // Jika status masih true, tampilkan sisa masa penyusutan
      }

      // Tambahkan ke total monthly depreciation jika aset masih aktif
      if (asset.depreciationStatus) {
        totalMonthlyDepreciation += asset.monthlyDepreciation;
      }

      return {
        _id: asset._id,
        assetName: asset.assetName,
        assetPrice: asset.assetPrice,
        purchaseDate: asset.purchaseDate, // Ditambahkan
        depreciationEndDate: asset.depreciationEndDate, // Ditambahkan
        monthlyDepreciation: asset.monthlyDepreciation,
        remainingDepreciation,
        depreciationStatus: asset.depreciationStatus,
      };
    });

    const sortedAssets = formattedAssets.sort((a, b) => {
      // Urutkan berdasarkan depreciationEndDate
      const dateA = new Date(a.depreciationEndDate);
      const dateB = new Date(b.depreciationEndDate);

      if (dateA < dateB) return 1; // Terlama di atas
      if (dateA > dateB) return -1; // Terkecil di bawah

      return a.depreciationStatus === b.depreciationStatus
        ? 0
        : a.depreciationStatus
        ? -1
        : 1;
    });

    res.status(200).json({
      assets: sortedAssets,
      totalMonthlyDepreciation,
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching assets", error });
  }
};

const processDepreciationCheck = async (req = null, res = null) => {
  try {
    const today = new Date();

    // Ambil semua aset dari database
    const assets = await Asset.find();

    const updates = assets.map(async (asset) => {
      const { depreciationEndDate, _id, depreciationStatus } = asset;
      const endDate = new Date(depreciationEndDate);

      let remainingDepreciation;

      if (!depreciationStatus) {
        remainingDepreciation = "Habis";
      } else if (endDate <= today) {
        remainingDepreciation = "Habis";
        return Asset.findByIdAndUpdate(_id, {
          depreciationStatus: false,
          remainingDepreciation,
        });
      } else {
        const totalMonths =
          (endDate.getFullYear() - today.getFullYear()) * 12 +
          (endDate.getMonth() - today.getMonth());

        const remainingYears = Math.floor(totalMonths / 12);
        const remainingMonths = totalMonths % 12;

        remainingDepreciation =
          remainingYears > 0 || remainingMonths > 0
            ? `${remainingYears > 0 ? `${remainingYears} tahun ` : ""}${
                remainingMonths > 0 ? `${remainingMonths} bulan` : ""
              }`
            : "0 bulan";

        return Asset.findByIdAndUpdate(_id, {
          remainingDepreciation,
        });
      }
    });

    await Promise.all(updates);

    // Hanya kirim respons jika res tersedia
    if (res) {
      res.status(200).json({ message: "Depreciation check completed." });
    } else {
      console.log("Depreciation check completed.");
    }
  } catch (error) {
    if (res) {
      res
        .status(500)
        .json({ message: "Error running depreciation check", error });
    } else {
      console.error("Error running depreciation check:", error);
    }
  }
};

module.exports = {
  createAsset,
  getAllAssets,
  processDepreciationCheck,
};
