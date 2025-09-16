import State from "../models/State.js";
import River from "../models/River.js";
import Dam from "../models/Dam.js";

// ADD new State



export const getCoreDamInfo = async (req, res) => {
  try {
    const dam = await Dam.findById(req.params.damId);
    if (!dam) {
      return res.status(404).json({ message: "Dam not found" });
    }
    res.json(dam);
  } catch (err) {
    console.error("Error fetching dam:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateCoreDamInfo = async (req, res) => {
  try {
    const updated = await Dam.findByIdAndUpdate(req.params.damId, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: "Dam not found" });
    res.json(updated);
  } catch (error) {
    console.error("Error updating dam info:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const addState = async (req, res) => {
  const { name } = req.body;
  const exists = await State.findOne({ name });
  if (exists) return res.status(400).json({ message: "State already exists" });
  const state = await State.create({ name });
  res.json(state);
};

// ADD new River
export const addRiver = async (req, res) => {
  const { name, stateId } = req.body;
  const exists = await River.findOne({ name, state: stateId });
  if (exists) return res.status(400).json({ message: "River already exists" });
  const river = await River.create({ name, state: stateId });
  res.json(river);
};

// ADD new Dam
export const addDam = async (req, res) => {
  const { name, riverId } = req.body;
  const exists = await Dam.findOne({ name, river: riverId });
  if (exists) return res.status(400).json({ message: "Dam already exists" });
  const dam = await Dam.create({ name, river: riverId });
  res.json(dam);
};

// Get all States
export const getStates = async (req, res) => {
  const states = await State.find();
  res.json(states);
};

// Get Rivers by State
export const getRiversByState = async (req, res) => {
  const { stateId } = req.params;
  const rivers = await River.find({ state: stateId });
  res.json(rivers);
};

// Get Dams by River
export const getDamsByRiver = async (req, res) => {
  const { riverId } = req.params;
  const dams = await Dam.find({ river: riverId });
  res.json(dams);
};

// Get Dam Details
export const getDamDetails = async (req, res) => {
  const { damId } = req.params;
  const dam = await Dam.findById(damId);
  res.json(dam);
  
};
