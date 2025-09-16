// backend/controllers/featureController.js
import Feature from "../models/featuresModel.js";
import DamStatus from "../models/DamStatus.js"; // used for history/report

// List all features
export const getFeatures = async (req, res) => {
  try {
    const items = await Feature.find().sort({ createdAt: -1 }).lean();
    res.json(items);
  } catch (e) {
    res.status(500).json({ message: "Failed to fetch features" });
  }
};

// Create
export const addFeature = async (req, res) => {
  try {
    const payload = {
      name: req.body.name,
      description: req.body.description || "",
      category: req.body.category,
      status: req.body.status || "Active",
      adminOnly: !!req.body.adminOnly,
      createdBy: req.user?._id,
    };
    const created = await Feature.create(payload);
    res.status(201).json(created);
  } catch (e) {
    res.status(400).json({ message: "Failed to create feature", error: e.message });
  }
};

// Update
export const updateFeature = async (req, res) => {
  try {
    const updated = await Feature.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: "Feature not found" });
    res.json(updated);
  } catch (e) {
    res.status(400).json({ message: "Failed to update feature", error: e.message });
  }
};

// Delete
export const deleteFeature = async (req, res) => {
  try {
    const ok = await Feature.findByIdAndDelete(req.params.id);
    if (!ok) return res.status(404).json({ message: "Feature not found" });
    res.json({ message: "Feature deleted" });
  } catch (e) {
    res.status(400).json({ message: "Failed to delete feature", error: e.message });
  }
};

// --- Admin tools ----

// History for a dam (recent status samples)
export const getDamEventHistory = async (req, res) => {
  try {
    const { damId } = req.params;
    const limit = Math.min(parseInt(req.query.limit || "100", 10), 500);
    const items = await DamStatus.find({ dam: damId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
    res.json(items);
  } catch (e) {
    res.status(500).json({ message: "Failed to fetch history" });
  }
};

// Simple report summary for a dam (last N entries)
export const getDamReport = async (req, res) => {
  try {
    const { damId } = req.params;
    const limit = Math.min(parseInt(req.query.limit || "200", 10), 1000);
    const items = await DamStatus.find({ dam: damId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    if (!items.length) return res.json({ summary: null, items: [] });

    // Compute simple aggregates
    const avg = (arr) => (arr.length ? arr.reduce((a, b) => a + (b ?? 0), 0) / arr.length : 0);
    const numbers = (key) => items.map((x) => Number(x[key])).filter((n) => !Number.isNaN(n));

    const summary = {
      count: items.length,
      latestAt: items[0].createdAt,
      levelUnit: items[0].levelUnit,
      avgCurrentWaterLevel: avg(numbers("currentWaterLevel")),
      avgInflowRate: avg(numbers("inflowRate")),
      avgOutflowRate: avg(numbers("outflowRate")),
      avgSpillwayDischarge: avg(numbers("spillwayDischarge")),
      maxLevelObserved: Math.max(...numbers("currentWaterLevel"), 0),
      minLevelObserved: Math.min(...numbers("currentWaterLevel"), 0),
    };

    res.json({ summary, items });
  } catch (e) {
    res.status(500).json({ message: "Failed to build report" });
  }
};
