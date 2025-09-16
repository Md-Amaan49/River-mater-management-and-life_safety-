import Safety from "../models/Safety.js";

// ➕ Add Safety Info
export const addSafetyInfo = async (req, res) => {
  try {
    const damId = req.params.id;
    const newSafety = new Safety({ ...req.body, dam: damId });
    await newSafety.save();
    res.status(201).json(newSafety);
  } catch (error) {
    res.status(500).json({ message: "Error adding safety info", error });
  }
};

// 📄 Get Safety Info
export const getSafetyInfo = async (req, res) => {
  try {
    const damId = req.params.id;
    const safety = await Safety.findOne({ dam: damId });
    if (!safety) return res.status(404).json({ message: "No safety info found" });
    res.json(safety);
  } catch (error) {
    res.status(500).json({ message: "Error fetching safety info", error });
  }
};

// ✏️ Update Safety Info
export const updateSafetyInfo = async (req, res) => {
  try {
    const damId = req.params.id;
    const updated = await Safety.findOneAndUpdate(
      { dam: damId },
      req.body,
      { new: true, upsert: true }
    );
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: "Error updating safety info", error });
  }
};
