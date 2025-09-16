import State from "../models/State.js";
import River from "../models/River.js";
import Dam from "../models/Dam.js";

// Get all states
export const getStates = async (req, res) => {
  try {
    const states = await State.find();
    res.json(states);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get rivers by stateId
export const getRiversByState = async (req, res) => {
  try {
    const rivers = await River.find({ state: req.params.stateId });
    if (!rivers.length) return res.status(404).json({ message: "No rivers found" });
    res.json(rivers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get dams by riverId
export const getDamsByRiver = async (req, res) => {
  try {
    const dams = await Dam.find({ river: req.params.riverId });
    if (!dams.length) return res.status(404).json({ message: "No dams found" });
    res.json(dams);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
