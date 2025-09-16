import WaterUsage from "../models/WaterUsage.js";
import Dam from "../models/Dam.js";
import River from "../models/River.js";

// ➕ Add water usage info
export const addWaterUsage = async (req, res) => {
  try {
    const waterUsage = new WaterUsage(req.body);
    await waterUsage.save();
    res.status(201).json(waterUsage);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// 📋 Get all usage info
export const getAllWaterUsage = async (req, res) => {
  try {
    const usage = await WaterUsage.find().populate("damId");
    res.json(usage);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🔍 Get usage by Dam
export const getWaterUsageByDam = async (req, res) => {
  try {
    const usage = await WaterUsage.findOne({ damId: req.params.damId }).populate("damId");
    if (!usage) return res.status(404).json({ message: "No usage data for this dam" });
    res.json(usage);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✏️ Update usage info
export const updateWaterUsage = async (req, res) => {
  try {
    const usage = await WaterUsage.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!usage) return res.status(404).json({ message: "Usage data not found" });
    res.json(usage);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// ❌ Delete usage info
export const deleteWaterUsage = async (req, res) => {
  try {
    const usage = await WaterUsage.findByIdAndDelete(req.params.id);
    if (!usage) return res.status(404).json({ message: "Usage data not found" });
    res.json({ message: "Usage info deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🌍 Aggregated: Get usage by State
export const getWaterUsageByState = async (req, res) => {
  try {
    const { stateName } = req.params;

    const dams = await Dam.find({ state: stateName });
    const damIds = dams.map((d) => d._id);

    const usages = await WaterUsage.find({ damId: { $in: damIds } });

    if (usages.length === 0)
      return res.status(404).json({ message: "No usage found" });

    const totals = usages.reduce(
      (acc, u) => {
        acc.irrigation += u.irrigation || 0;
        acc.drinking += u.drinking || 0;
        acc.industrial += u.industrial || 0;
        acc.hydroPower += u.hydroPower || 0;
        acc.evaporationLoss += u.evaporationLoss || 0;
        acc.environmentalFlow += u.environmentalFlow || 0;
        acc.farming += u.farming || 0;
        return acc;
      },
      {
        irrigation: 0,
        drinking: 0,
        industrial: 0,
        hydroPower: 0,
        evaporationLoss: 0,
        environmentalFlow: 0,
        farming: 0,
      }
    );

    res.json({ state: stateName, totals, dams });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 🌊 Aggregated: Get usage by River
export const getWaterUsageByRiver = async (req, res) => {
  try {
    const { riverId } = req.params;

    const river = await River.findById(riverId);
    if (!river) return res.status(404).json({ message: "River not found" });

    const dams = await Dam.find({ river: river.name });
    const damIds = dams.map((d) => d._id);

    const usages = await WaterUsage.find({ damId: { $in: damIds } });

    if (usages.length === 0)
      return res.status(404).json({ message: "No usage found" });

    const totals = usages.reduce(
      (acc, u) => {
        acc.irrigation += u.irrigation || 0;
        acc.drinking += u.drinking || 0;
        acc.industrial += u.industrial || 0;
        acc.hydroPower += u.hydroPower || 0;
        acc.evaporationLoss += u.evaporationLoss || 0;
        acc.environmentalFlow += u.environmentalFlow || 0;
        acc.farming += u.farming || 0;
        return acc;
      },
      {
        irrigation: 0,
        drinking: 0,
        industrial: 0,
        hydroPower: 0,
        evaporationLoss: 0,
        environmentalFlow: 0,
        farming: 0,
      }
    );

    res.json({ river: river.name, totals, dams });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
