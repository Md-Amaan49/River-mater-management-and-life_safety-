// controllers/damController.js

import State from "../models/State.js";
import River from "../models/River.js";
import Dam from "../models/Dam.js";

// ======================= STATE CONTROLLERS =======================
export const addState = async (req, res) => {
  try {
    const newState = new State(req.body);
    const savedState = await newState.save();
    res.status(201).json(savedState);
  } catch (error) {
    console.error("Error adding state:", error);
    res.status(500).json({ message: "Failed to add state" });
  }
};

export const getStates = async (req, res) => {
  try {
    const states = await State.find();
    res.status(200).json(states);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch states" });
  }
};

// ======================= RIVER CONTROLLERS =======================
export const addRiver = async (req, res) => {
  try {
    const newRiver = new River(req.body);
    const savedRiver = await newRiver.save();
    res.status(201).json(savedRiver);
  } catch (error) {
    console.error("Error adding river:", error);
    res.status(500).json({ message: "Failed to add river" });
  }
};

export const getRiversByState = async (req, res) => {
  try {
    const rivers = await River.find({ stateId: req.params.stateId });
    res.status(200).json(rivers);
  } catch (error) {
    console.error("Error fetching rivers:", error);
    res.status(500).json({ message: "Failed to fetch rivers for the state" });
  }
};

// ======================= DAM CONTROLLERS =======================
export const addDam = async (req, res) => {
  try {
    const newDam = new Dam(req.body);
    const savedDam = await newDam.save();
    res.status(201).json(savedDam);
  } catch (error) {
    console.error("Error adding dam:", error);
    res.status(500).json({ message: "Failed to add dam" });
  }
};

export const getDamsByRiver = async (req, res) => {
  try {
    const dams = await Dam.find({ riverId: req.params.riverId });
    res.status(200).json(dams);
  } catch (error) {
    console.error("Error fetching dams:", error);
    res.status(500).json({ message: "Failed to fetch dams for the river" });
  }
};

export const getDamById = async (req, res) => {
  try {
    const dam = await Dam.findById(req.params.id);
    if (!dam) {
      return res.status(404).json({ message: "Dam not found" });
    }
    res.json(dam);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving dam" });
  }
};

export const getDamDetails = async (req, res) => {
  const { damId } = req.params;
  try {
    const dam = await Dam.findById(damId);
    if (!dam) {
      return res.status(404).json({ message: "Dam not found" });
    }
    res.json(dam);
  } catch (error) {
    console.error("Error getting dam details:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const createCoreDamInfo = async (req, res) => {
  try {
    const dam = new Dam(req.body);
    await dam.save();
    res.status(201).json(dam);
  } catch (error) {
    console.error("Error creating core dam info:", error);
    res.status(500).json({ message: "Failed to create core dam info" });
  }
};

export const updateDam = async (req, res) => {
  try {
    const updatedDam = await Dam.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!updatedDam) {
      return res.status(404).json({ message: "Dam not found" });
    }
    res.status(200).json(updatedDam);
  } catch (error) {
    console.error("Error updating dam:", error);
    res.status(500).json({ message: "Update failed", error });
  }
};

export const updateCoreDamInfo = async (req, res) => {
  try {
    const updatedDam = await Dam.findByIdAndUpdate(
      req.params.damId,
      req.body,
      { new: true }
    );
    if (!updatedDam) {
      return res.status(404).json({ message: "Dam not found" });
    }
    res.status(200).json(updatedDam);
  } catch (error) {
    console.error("Error updating core dam info:", error);
    res.status(500).json({ message: "Failed to update core dam info" });
  }
};


// Get core dam info by damId
export const getCoreDamInfo = async (req, res) => {
  try {
    const dam = await Dam.findById(req.params.damId);
    if (!dam) {
      return res.status(404).json({ message: "Dam not found" });
    }
    res.status(200).json(dam);
  } catch (err) {
    res.status(500).json({ message: "Error fetching dam data", error: err.message });
  }
};

// Save or Update dam info
export const saveOrUpdateCoreDamInfo = async (req, res) => {
  const damId = req.params.damId;
  const updateData = req.body;

  try {
    let dam = await Dam.findById(damId);
    if (dam) {
      // Update existing
      dam = await Dam.findByIdAndUpdate(damId, updateData, { new: true });
      return res.status(200).json({ message: "Updated successfully", dam });
    } else {
      // Create new
      const newDam = new Dam({ _id: damId, ...updateData });
      await newDam.save();
      return res.status(201).json({ message: "Created successfully", dam: newDam });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Save/Update failed", error: err.message });
  }
};// Get all dam points (for default view)
export const getAllDamPoints = async (req, res) => {
  try {
    const dams = await Dam.find({}, "name state river coordinates");
    const points = dams
      .filter(d => d.coordinates)
      .map(d => {
        let coords = null;
        if (typeof d.coordinates === "string") {
          const parts = d.coordinates.split(",").map(p => p.trim());
          if (parts.length === 2) coords = [Number(parts[0]), Number(parts[1])];
        }
        return { _id: d._id, name: d.name, state: d.state, river: d.river, coordinates: coords };
      });
    res.json(points);
  } catch (err) {
    res.status(500).json({ message: "Error fetching dam points", error: err.message });
  }
};

// Get dam points by state
export const getDamPointsByState = async (req, res) => {
  const { stateId } = req.params;
  try {
    const state = await State.findById(stateId);
    if (!state) return res.status(404).json({ message: "State not found" });
    const dams = await Dam.find({ state: state.name }).lean();
    const points = dams.map(d => ({
      _id: d._id,
      name: d.name,
      coordinates: d.coordinates ? [d.coordinates.lat, d.coordinates.lng] : null,
      state: d.state || null,
      place: d.place || null
    }));
    res.json(points);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch dam points by state" });
  }
};
// Get dam points by river
export const getDamPointsByRiver = async (req, res) => {
  try {
    const { riverId } = req.params;
    const dams = await Dam.find({ river: riverId }, "name state river coordinates");
    const points = dams.map(d => ({
      _id: d._id,
      name: d.name,
      state: d.state,
      river: d.river,
      coordinates: d.coordinates 
        ? d.coordinates.split(",").map(n => Number(n.trim())) 
        : null
    }));
    res.json(points);
  } catch (err) {
    res.status(500).json({ message: "Error fetching dams by river", error: err.message });
  }
};

// Get dams by state (for WaterFlowPage)
export const getDamsByState = async (req, res) => {
  try {
    const { stateId } = req.params;
    const state = await State.findById(stateId);
    if (!state) return res.status(404).json({ message: "State not found" });
    
    const dams = await Dam.find({ state: state.name }).lean();
    res.json(dams);
  } catch (err) {
    console.error("Error fetching dams by state:", err);
    res.status(500).json({ message: "Failed to fetch dams by state" });
  }
};

// Get dams by river (for WaterFlowPage)
export const getDamsByRiverName = async (req, res) => {
  try {
    const { riverId } = req.params;
    const river = await River.findById(riverId);
    if (!river) return res.status(404).json({ message: "River not found" });
    
    const dams = await Dam.find({ river: river.name }).lean();
    res.json(dams);
  } catch (err) {
    console.error("Error fetching dams by river:", err);
    res.status(500).json({ message: "Failed to fetch dams by river" });
  }
};
