// controllers/supportingInfoController.js
import Dam from "../models/Dam.js";
import SupportingInfo from "../models/SupportingInfo.js";

// Create
export const createSupportingInfo = async (req, res) => {
  try {
    const { damId } = req.params;
    const dam = await Dam.findById(damId);
    if (!dam) return res.status(404).json({ message: "Dam not found" });

    const payload = { ...req.body, dam: damId };
    const created = await SupportingInfo.create(payload);
    return res.status(201).json(created);
  } catch (err) {
    console.error("createSupportingInfo error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Get all by dam
export const getSupportingInfoByDam = async (req, res) => {
  try {
    const { damId } = req.params;
    const infos = await SupportingInfo.find({ dam: damId }).sort({ createdAt: -1 });
    return res.json(infos);
  } catch (err) {
    console.error("getSupportingInfoByDam error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Update
export const updateSupportingInfo = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await SupportingInfo.findByIdAndUpdate(id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: "Info not found" });
    return res.json(updated);
  } catch (err) {
    console.error("updateSupportingInfo error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Delete
export const deleteSupportingInfo = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await SupportingInfo.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: "Info not found" });
    return res.json({ message: "Deleted" });
  } catch (err) {
    console.error("deleteSupportingInfo error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
