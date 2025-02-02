const {
  DailyReport,
  Material,
  OperationalExpense,
  Asset,
  MonthlyReport,
  Category,
  Branch,
} = require("../models/models_schema");
const moment = require("moment-timezone");

const generateMonthlyReport = async () => {
  try {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0"); // Format MM
    const monthString = `${year}-${month}`;

    // Cek apakah rekap bulan ini sudah ada
    const existingReport = await MonthlyReport.findOne({ month: monthString });
    if (existingReport) {
      await MonthlyReport.deleteOne({ month: monthString }); // Hapus jika ada
    }

    // Ambil data rentang bulan berjalan
    const moment = require("moment-timezone");

    const timeZone = "Asia/Jakarta"; // Zona waktu Indonesia

    // Awal bulan dalam UTC
    const startOfMonth = moment
      .tz(`${monthString}-01 00:00:00`, timeZone)
      .utc()
      .toISOString();

    // Akhir bulan dalam UTC (tanggal terakhir dalam bulan)
    const endOfMonth = moment
      .tz(`${monthString}-01 23:59:59.999`, timeZone)
      .endOf("month")
      .utc()
      .toISOString();

    console.log("Start of Month:", startOfMonth);
    console.log("End of Month:", endOfMonth);

    const dailyReports = await DailyReport.find({
      date: { $gte: startOfMonth, $lte: endOfMonth },
    });

    const materials = await Material.find({
      purchaseDate: { $gte: startOfMonth, $lte: endOfMonth },
    });

    const operationalExpenses = await OperationalExpense.find({
      date: { $gte: startOfMonth, $lte: endOfMonth },
    });

    const assets = await Asset.find({ depreciationStatus: true });

    // Simpan ke koleksi monthly_reports
    const newReport = new MonthlyReport({
      month: monthString,
      dailyReports,
      materials,
      operationalExpenses,
      assets,
    });

    await newReport.save();
    console.log(`Rekap bulan ${monthString} berhasil dibuat.`);
  } catch (error) {
    console.error("Gagal membuat rekap bulanan:", error);
  }
};

const getSummary = async (req, res) => {
  try {
    const reports = await MonthlyReport.find();

    const summary = reports.map((report) => {
      const income = report.dailyReports.reduce(
        (sum, dr) => sum + dr.netIncome,
        0
      );

      const unUsedUnitsValue = report.materials.reduce((sum, mat) => {
        const unUsedUnits = mat.totalUnits - mat.usedUnits;
        return sum + unUsedUnits * mat.pricePerUnit;
      }, 0);

      const usedUnitsValue = report.materials.reduce((sum, mat) => {
        return sum + mat.usedUnits * mat.pricePerUnit;
      }, 0);

      const operationalExpenses = report.operationalExpenses.reduce(
        (sum, exp) => sum + exp.amount,
        0
      );

      const depreciationExpenses = report.assets.reduce(
        (sum, asset) => sum + asset.monthlyDepreciation,
        0
      );

      const grossProfit = income + unUsedUnitsValue;
      const biayaOperasionalEfektif =
        usedUnitsValue + operationalExpenses + depreciationExpenses;
      const netProfit = grossProfit - biayaOperasionalEfektif;

      return {
        _id: report._id,
        month: report.month,
        Income: income,
        unUsedUnitsValue,
        usedUnitsValue,
        operationalExpenses,
        depreciationExpenses,
        grossProfit,
        biayaOperasionalEfektif,
        NetProfit: netProfit,
      };
    });

    res.json(summary);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Terjadi kesalahan dalam mengambil data ringkasan" });
  }
};

const getSalesSummary = async (req, res) => {
  try {
    const { monthlyReportId } = req.params;

    // Cari laporan berdasarkan ID
    const report = await MonthlyReport.findById(monthlyReportId);
    if (!report) {
      return res.status(404).json({ message: "Monthly report not found" });
    }

    // Inisialisasi variabel
    let income = 0;
    let totalUnexpectedExpenses = 0;
    let netIncome = 0;
    let netIncomePerDay = {};
    let totalProductsSold = {};
    let categoryOrBranchMap = {};

    report.dailyReports.forEach((daily) => {
      // Hitung income, totalUnexpectedExpenses, dan netIncome
      income += daily.income || 0;
      totalUnexpectedExpenses += daily.totalUnexpectedExpenses || 0;
      netIncome += daily.netIncome || 0;

      // Grafik net income per hari
      const date = daily.date.split("T")[0];
      netIncomePerDay[date] = (netIncomePerDay[date] || 0) + daily.netIncome;

      // Hitung total produk terjual
      daily.products.forEach((product) => {
        totalProductsSold[product.name] =
          (totalProductsSold[product.name] || 0) + product.amountSold;
      });

      // Hitung netIncome per categoryOrBranchId
      const categoryOrBranchId = daily.categoryOrBranchId.toString();
      if (!categoryOrBranchMap[categoryOrBranchId]) {
        categoryOrBranchMap[categoryOrBranchId] = {
          categoryOrBranchId,
          categoryOrBranchModel: daily.categoryOrBranchModel,
          name: "", // Akan diisi nanti
          income: 0,
        };
      }
      categoryOrBranchMap[categoryOrBranchId].income += daily.income || 0;
    });

    // Ambil nama category/branch dari database
    const categoryOrBranchArray = Object.values(categoryOrBranchMap);
    await Promise.all(
      categoryOrBranchArray.map(async (item) => {
        if (item.categoryOrBranchModel === "Category") {
          const category = await Category.findById(item.categoryOrBranchId);
          item.name = category ? category.name : "Unknown";
        } else if (item.categoryOrBranchModel === "Branch") {
          const branch = await Branch.findById(item.categoryOrBranchId);
          item.name = branch ? "Teh " + branch.name : "Unknown";
        }
      })
    );

    res.json({
      categoryOrBranch: categoryOrBranchArray,
      income,
      totalUnexpectedExpenses,
      netIncome,
      netIncomeGraph: netIncomePerDay, // Format { "YYYY-MM-DD": amount }
      totalProductsSold, // Format { "Product Name": totalAmountSold }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getOperationalSummary = async (req, res) => {
  try {
    const { monthlyReportId } = req.params;

    const operational = await MonthlyReport.findById(monthlyReportId);
    if (!operational) {
      return res.status(404).json({ message: "Monthly report not found" });
    }

    const { operationalExpenses } = operational;
    const totalAmount = operationalExpenses.reduce(
      (sum, expense) => sum + expense.amount,
      0
    );

    res.json({
      operationalExpenses,
      totalAmount,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getAssetsSummary = async (req, res) => {
  try {
    const { monthlyReportId } = req.params;

    // Cari laporan berdasarkan ID
    const report = await MonthlyReport.findById(monthlyReportId);
    if (!report) {
      return res.status(404).json({ message: "Monthly report not found" });
    }

    // Ambil assetName dan monthlyDepreciation dari assets
    const assetsSummary = report.assets.map((asset) => ({
      assetName: asset.assetName,
      monthlyDepreciation: asset.monthlyDepreciation,
    }));

    // Hitung total monthlyDepreciation
    const totalMonthlyDepreciation = report.assets.reduce(
      (total, asset) => total + asset.monthlyDepreciation,
      0
    );

    res.json({
      assets: assetsSummary,
      totalMonthlyDepreciation,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getMaterialsSummary = async (req, res) => {
  try {
    const { monthlyReportId } = req.params;

    // Cari laporan berdasarkan ID
    const report = await MonthlyReport.findById(monthlyReportId);
    if (!report) {
      return res.status(404).json({ message: "Monthly report not found" });
    }

    let totalUsedValue = 0;
    let totalUnUsedValue = 0;

    // Ambil data materials dengan perhitungan yang diminta
    const materialsSummary = report.materials.map((material) => {
      const totalPrice = material.pricePerUnit * material.totalUnits;
      const unUsedUnits = material.totalUnits - material.usedUnits;
      const usedValue = material.usedUnits * material.pricePerUnit;
      const unUsedValue = unUsedUnits * material.pricePerUnit;

      // Akumulasi total usedValue dan unUsedValue
      totalUsedValue += usedValue;
      totalUnUsedValue += unUsedValue;

      return {
        materialName: material.materialName,
        totalUnits: material.totalUnits,
        totalPrice,
        usedUnits: material.usedUnits,
        unUsedUnits,
        usedValue,
        unUsedValue,
      };
    });

    res.json({
      materials: materialsSummary,
      totalUsedValue,
      totalUnUsedValue,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  generateMonthlyReport,
  getSummary,
  getSalesSummary,
  getOperationalSummary,
  getAssetsSummary,
  getMaterialsSummary,
};
