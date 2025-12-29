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
  try {
    const { name } = req.body;
    const exists = await State.findOne({ name });
    if (exists) return res.status(400).json({ message: "State already exists" });
    const state = await State.create({ name });
    res.json(state);
  } catch (error) {
    console.error("Error adding state:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ADD new River
export const addRiver = async (req, res) => {
  try {
    const { name, stateId } = req.body;
    const exists = await River.findOne({ name, state: stateId });
    if (exists) return res.status(400).json({ message: "River already exists" });
    const river = await River.create({ name, state: stateId });
    res.json(river);
  } catch (error) {
    console.error("Error adding river:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ADD new Dam
export const addDam = async (req, res) => {
  try {
    const { name, riverId } = req.body;
    
    // Get the river name from river ID
    const river = await River.findById(riverId);
    if (!river) {
      return res.status(404).json({ message: "River not found" });
    }
    
    // Get the state name from state ID
    const state = await State.findById(river.state);
    if (!state) {
      return res.status(404).json({ message: "State not found" });
    }
    
    // Check if dam already exists
    const exists = await Dam.findOne({ name, river: river.name });
    if (exists) return res.status(400).json({ message: "Dam already exists" });
    
    // Create dam with proper data structure
    const dam = await Dam.create({ 
      name, 
      river: river.name,
      riverName: river.name,
      state: state.name,
      // Add default coordinates if not provided
      coordinates: { lat: 0, lng: 0 },
      damType: "Concrete Gravity Dam",
      constructionYear: new Date().getFullYear().toString(),
      operator: `${state.name} Water Resources Department`,
      maxStorage: 0,
      liveStorage: 0,
      deadStorage: 0,
      catchmentArea: "0 sq km",
      surfaceArea: "0 sq km",
      height: "0 m",
      length: "0 km"
    });
    res.json(dam);
  } catch (error) {
    console.error("Error adding dam:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all States
export const getStates = async (req, res) => {
  try {
    const states = await State.find();
    res.json(states);
  } catch (error) {
    console.error("Error fetching states:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get Rivers by State
export const getRiversByState = async (req, res) => {
  try {
    const { stateId } = req.params;
    const rivers = await River.find({ state: stateId });
    res.json(rivers);
  } catch (error) {
    console.error("Error fetching rivers by state:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get Dams by River
export const getDamsByRiver = async (req, res) => {
  try {
    const { riverId } = req.params;
    
    // First get the river name from the river ID
    const river = await River.findById(riverId);
    if (!river) {
      return res.status(404).json({ message: "River not found" });
    }
    
    // Then find dams by river name (since Dam.river is stored as string)
    const dams = await Dam.find({ river: river.name });
    res.json(dams);
  } catch (error) {
    console.error("Error fetching dams by river:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get Dam Details
export const getDamDetails = async (req, res) => {
  try {
    const { damId } = req.params;
    const dam = await Dam.findById(damId);
    if (!dam) {
      return res.status(404).json({ message: "Dam not found" });
    }
    res.json(dam);
  } catch (error) {
    console.error("Error fetching dam details:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Search Rivers
export const searchRivers = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length < 2) {
      return res.json([]);
    }
    
    const rivers = await River.find({
      name: { $regex: q, $options: 'i' }
    }).populate('state', 'name').limit(10);
    
    res.json(rivers);
  } catch (error) {
    console.error("Error searching rivers:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Search Dams
export const searchDams = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length < 2) {
      return res.json([]);
    }
    
    const dams = await Dam.find({
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { river: { $regex: q, $options: 'i' } },
        { state: { $regex: q, $options: 'i' } }
      ]
    }).limit(10);
    
    res.json(dams);
  } catch (error) {
    console.error("Error searching dams:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Global Search (searches across states, rivers, and dams)
export const globalSearch = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length < 2) {
      return res.json({ states: [], rivers: [], dams: [] });
    }
    
    const searchRegex = { $regex: q, $options: 'i' };
    
    // Search states
    const states = await State.find({ name: searchRegex }).limit(5);
    
    // Search rivers
    const rivers = await River.find({ name: searchRegex }).populate('state', 'name').limit(5);
    
    // Search dams
    const dams = await Dam.find({
      $or: [
        { name: searchRegex },
        { river: searchRegex },
        { state: searchRegex }
      ]
    }).limit(10);
    
    res.json({ states, rivers, dams });
  } catch (error) {
    console.error("Error in global search:", error);
    res.status(500).json({ message: "Server error" });
  }
};
