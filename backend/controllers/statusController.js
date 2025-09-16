// controllers/statusController.js
import Dam from "../models/Dam.js";
import DamStatus from "../models/DamStatus.js";          // current/latest
import DamStatusHistory from "../models/DamStatusHistory.js"; // historical log

// Create a new status sample (good for sensor pushes or manual entries)
export const createDamStatus = async (req, res) => {
  try {
    const { damId } = req.params;
    const dam = await Dam.findById(damId);
    if (!dam) return res.status(404).json({ message: "Dam not found" });

    const payload = { ...req.body, dam: damId, lastSyncAt: req.body.lastSyncAt || new Date() };
    const created = await DamStatus.create(payload);

    // Create history from the saved doc
    const historyDoc = created.toObject();
    delete historyDoc._id;
    await DamStatusHistory.create(historyDoc);

    return res.status(201).json(created);
  } catch (err) {
    console.error("createDamStatus error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Upsert a single “current” status doc
export const upsertCurrentDamStatus = async (req, res) => {
  try {
    const { damId } = req.params;
    const dam = await Dam.findById(damId);
    if (!dam) return res.status(404).json({ message: "Dam not found" });

    const payload = { ...req.body, dam: damId, lastSyncAt: new Date() };

    const updated = await DamStatus.findOneAndUpdate(
      { dam: damId },
      { $set: payload },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    // Create history from updated doc
    const historyDoc = updated.toObject();
    delete historyDoc._id;
    await DamStatusHistory.create(historyDoc);

    return res.json(updated);
  } catch (err) {
    console.error("upsertCurrentDamStatus error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Get latest status (for dashboards)
export const getLatestDamStatus = async (req, res) => {
  try {
    const { damId } = req.params;
    const current = await DamStatus.findOne({ dam: damId }).populate("dam");
    if (!current) return res.status(404).json({ message: "No current status found" });
    res.json(current);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get history (for graphs)
export const getDamStatusHistory = async (req, res) => {
  try {
    const { damId } = req.params;
    const limit = Math.min(parseInt(req.query.limit || 50, 10), 1000);

    const history = await DamStatusHistory.find({ dam: damId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    res.json(history.reverse()); // ensure oldest first
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
