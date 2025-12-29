import DamHistory from "../models/DamHistory.js";
import PublicSpot from "../models/PublicSpot.js";
import RestrictedArea from "../models/RestrictedArea.js";
import Guideline from "../models/Guideline.js";

// ======================= DAM HISTORY =======================
export const addDamHistory = async (req, res) => {
  try {
    const historyData = {
      ...req.body,
      createdBy: req.user?._id,
    };
    
    const history = new DamHistory(historyData);
    await history.save();
    
    res.status(201).json({
      message: "History event added successfully",
      history
    });
  } catch (error) {
    console.error("Error adding dam history:", error);
    res.status(400).json({
      message: "Failed to add history event",
      error: error.message
    });
  }
};

export const getDamHistory = async (req, res) => {
  try {
    const { damId } = req.params;
    const history = await DamHistory.find({ dam: damId })
      .populate("dam", "name state river")
      .sort({ eventDate: -1 });
    
    res.json(history);
  } catch (error) {
    console.error("Error fetching dam history:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateDamHistory = async (req, res) => {
  try {
    const { id } = req.params;
    const history = await DamHistory.findByIdAndUpdate(id, req.body, { new: true });
    
    if (!history) {
      return res.status(404).json({ message: "History event not found" });
    }
    
    res.json(history);
  } catch (error) {
    console.error("Error updating dam history:", error);
    res.status(400).json({ message: "Failed to update history event" });
  }
};

export const deleteDamHistory = async (req, res) => {
  try {
    const { id } = req.params;
    const history = await DamHistory.findByIdAndDelete(id);
    
    if (!history) {
      return res.status(404).json({ message: "History event not found" });
    }
    
    res.json({ message: "History event deleted successfully" });
  } catch (error) {
    console.error("Error deleting dam history:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ======================= PUBLIC SPOTS =======================
export const addPublicSpot = async (req, res) => {
  try {
    const spotData = {
      ...req.body,
      createdBy: req.user?._id,
    };
    
    const spot = new PublicSpot(spotData);
    await spot.save();
    
    res.status(201).json({
      message: "Public spot added successfully",
      spot
    });
  } catch (error) {
    console.error("Error adding public spot:", error);
    res.status(400).json({
      message: "Failed to add public spot",
      error: error.message
    });
  }
};

export const getPublicSpots = async (req, res) => {
  try {
    const { damId } = req.query;
    let query = { isActive: true };
    
    if (damId) {
      query["nearbyDams.dam"] = damId;
    }
    
    const spots = await PublicSpot.find(query)
      .populate("nearbyDams.dam", "name state river")
      .sort({ rating: -1, createdAt: -1 });
    
    res.json(spots);
  } catch (error) {
    console.error("Error fetching public spots:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const updatePublicSpot = async (req, res) => {
  try {
    const { id } = req.params;
    const spot = await PublicSpot.findByIdAndUpdate(id, req.body, { new: true });
    
    if (!spot) {
      return res.status(404).json({ message: "Public spot not found" });
    }
    
    res.json(spot);
  } catch (error) {
    console.error("Error updating public spot:", error);
    res.status(400).json({ message: "Failed to update public spot" });
  }
};

export const deletePublicSpot = async (req, res) => {
  try {
    const { id } = req.params;
    const spot = await PublicSpot.findByIdAndDelete(id);
    
    if (!spot) {
      return res.status(404).json({ message: "Public spot not found" });
    }
    
    res.json({ message: "Public spot deleted successfully" });
  } catch (error) {
    console.error("Error deleting public spot:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ======================= RESTRICTED AREAS =======================
export const addRestrictedArea = async (req, res) => {
  try {
    const areaData = {
      ...req.body,
      createdBy: req.user?._id,
    };
    
    const area = new RestrictedArea(areaData);
    await area.save();
    
    res.status(201).json({
      message: "Restricted area added successfully",
      area
    });
  } catch (error) {
    console.error("Error adding restricted area:", error);
    res.status(400).json({
      message: "Failed to add restricted area",
      error: error.message
    });
  }
};

export const getRestrictedAreas = async (req, res) => {
  try {
    const { damId } = req.query;
    let query = { isActive: true };
    
    if (damId) {
      query["nearbyDams.dam"] = damId;
    }
    
    const areas = await RestrictedArea.find(query)
      .populate("nearbyDams.dam", "name state river")
      .sort({ "nearbyDams.riskLevel": -1, createdAt: -1 });
    
    res.json(areas);
  } catch (error) {
    console.error("Error fetching restricted areas:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateRestrictedArea = async (req, res) => {
  try {
    const { id } = req.params;
    const area = await RestrictedArea.findByIdAndUpdate(id, req.body, { new: true });
    
    if (!area) {
      return res.status(404).json({ message: "Restricted area not found" });
    }
    
    res.json(area);
  } catch (error) {
    console.error("Error updating restricted area:", error);
    res.status(400).json({ message: "Failed to update restricted area" });
  }
};

export const deleteRestrictedArea = async (req, res) => {
  try {
    const { id } = req.params;
    const area = await RestrictedArea.findByIdAndDelete(id);
    
    if (!area) {
      return res.status(404).json({ message: "Restricted area not found" });
    }
    
    res.json({ message: "Restricted area deleted successfully" });
  } catch (error) {
    console.error("Error deleting restricted area:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ======================= GUIDELINES =======================
export const addGuideline = async (req, res) => {
  try {
    const guidelineData = {
      ...req.body,
      createdBy: req.user?._id,
    };
    
    const guideline = new Guideline(guidelineData);
    await guideline.save();
    
    res.status(201).json({
      message: "Guideline added successfully",
      guideline
    });
  } catch (error) {
    console.error("Error adding guideline:", error);
    res.status(400).json({
      message: "Failed to add guideline",
      error: error.message
    });
  }
};

export const getGuidelines = async (req, res) => {
  try {
    const { damId, category, priority } = req.query;
    let query = { isActive: true };
    
    if (damId) {
      query.$or = [
        { "applicableDams.dam": damId },
        { "applicableDams": { $size: 0 } },
        { "targetAudience": { $in: ["public", "all"] } }
      ];
    }
    
    if (category) {
      query.category = category;
    }
    
    if (priority) {
      query.priority = priority;
    }
    
    const guidelines = await Guideline.find(query)
      .populate("applicableDams.dam", "name state river")
      .sort({ priority: -1, createdAt: -1 });
    
    res.json(guidelines);
  } catch (error) {
    console.error("Error fetching guidelines:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateGuideline = async (req, res) => {
  try {
    const { id } = req.params;
    const guideline = await Guideline.findByIdAndUpdate(id, req.body, { new: true });
    
    if (!guideline) {
      return res.status(404).json({ message: "Guideline not found" });
    }
    
    res.json(guideline);
  } catch (error) {
    console.error("Error updating guideline:", error);
    res.status(400).json({ message: "Failed to update guideline" });
  }
};

export const deleteGuideline = async (req, res) => {
  try {
    const { id } = req.params;
    const guideline = await Guideline.findByIdAndDelete(id);
    
    if (!guideline) {
      return res.status(404).json({ message: "Guideline not found" });
    }
    
    res.json({ message: "Guideline deleted successfully" });
  } catch (error) {
    console.error("Error deleting guideline:", error);
    res.status(500).json({ message: "Server error" });
  }
};