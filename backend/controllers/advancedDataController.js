/**
 * Advanced Data Controller
 * Handles CRUD operations for all advanced dam data categories
 */

import ReservoirGeometry from "../models/ReservoirGeometry.js";
import StorageCapacity from "../models/StorageCapacity.js";
import ForecastMeteo from "../models/ForecastMeteo.js";
import PredictiveSimulation from "../models/PredictiveSimulation.js";
import HistoricalRisk from "../models/HistoricalRisk.js";
import StructuralHealth from "../models/StructuralHealthModel.js";
import GateSpillway from "../models/GateSpillwayModel.js";
import DownstreamRisk from "../models/DownstreamRiskModel.js";
import BasinAggregated from "../models/BasinAggregatedModel.js";

// ==================== GENERIC CRUD FUNCTIONS ====================

/**
 * Generic GET function
 */
const getData = (Model) => async (req, res) => {
  try {
    const { damId } = req.params;
    const data = await Model.findOne({ dam: damId });
    
    if (!data) {
      return res.status(404).json({ message: "Data not found" });
    }
    
    res.status(200).json(data);
  } catch (error) {
    console.error(`Error fetching data:`, error);
    res.status(500).json({ message: "Failed to fetch data", error: error.message });
  }
};

/**
 * Generic POST function
 */
const createData = (Model) => async (req, res) => {
  try {
    const { damId } = req.params;
    
    // Check if data already exists
    const existing = await Model.findOne({ dam: damId });
    if (existing) {
      return res.status(400).json({ message: "Data already exists for this dam. Use PUT to update." });
    }
    
    const data = new Model({
      dam: damId,
      ...req.body
    });
    
    await data.save();
    res.status(201).json(data);
  } catch (error) {
    console.error(`Error creating data:`, error);
    res.status(500).json({ message: "Failed to create data", error: error.message });
  }
};

/**
 * Generic PUT function
 */
const updateData = (Model) => async (req, res) => {
  try {
    const { damId } = req.params;
    
    const data = await Model.findOneAndUpdate(
      { dam: damId },
      { ...req.body },
      { new: true, runValidators: true }
    );
    
    if (!data) {
      return res.status(404).json({ message: "Data not found" });
    }
    
    res.status(200).json(data);
  } catch (error) {
    console.error(`Error updating data:`, error);
    res.status(500).json({ message: "Failed to update data", error: error.message });
  }
};

// ==================== RESERVOIR GEOMETRY ====================
export const getReservoirGeometry = getData(ReservoirGeometry);
export const createReservoirGeometry = createData(ReservoirGeometry);
export const updateReservoirGeometry = updateData(ReservoirGeometry);

// ==================== STORAGE CAPACITY ====================
export const getStorageCapacity = getData(StorageCapacity);
export const createStorageCapacity = createData(StorageCapacity);
export const updateStorageCapacity = updateData(StorageCapacity);

// ==================== FORECAST METEO ====================
export const getForecastMeteo = getData(ForecastMeteo);
export const createForecastMeteo = createData(ForecastMeteo);
export const updateForecastMeteo = updateData(ForecastMeteo);

// ==================== PREDICTIVE SIMULATION ====================
export const getPredictiveSimulation = getData(PredictiveSimulation);
export const createPredictiveSimulation = createData(PredictiveSimulation);
export const updatePredictiveSimulation = updateData(PredictiveSimulation);

// ==================== HISTORICAL RISK ====================
export const getHistoricalRisk = getData(HistoricalRisk);
export const createHistoricalRisk = createData(HistoricalRisk);
export const updateHistoricalRisk = updateData(HistoricalRisk);

// ==================== STRUCTURAL HEALTH ====================
export const getStructuralHealth = getData(StructuralHealth);
export const createStructuralHealth = createData(StructuralHealth);
export const updateStructuralHealth = updateData(StructuralHealth);

// ==================== GATE SPILLWAY ====================
export const getGateSpillway = getData(GateSpillway);
export const createGateSpillway = createData(GateSpillway);
export const updateGateSpillway = updateData(GateSpillway);

// ==================== DOWNSTREAM RISK ====================
export const getDownstreamRisk = getData(DownstreamRisk);
export const createDownstreamRisk = createData(DownstreamRisk);
export const updateDownstreamRisk = updateData(DownstreamRisk);

// ==================== BASIN AGGREGATED ====================
export const getBasinAggregated = getData(BasinAggregated);
export const createBasinAggregated = createData(BasinAggregated);
export const updateBasinAggregated = updateData(BasinAggregated);

// ==================== SPECIAL FUNCTIONS ====================

/**
 * Get all calculated fields for a dam
 * Returns a comprehensive view of all data categories
 */
export const getAllDamData = async (req, res) => {
  try {
    const { damId } = req.params;
    
    const [
      geometry,
      storage,
      forecast,
      predictive,
      historical,
      structural,
      gateSpillway,
      downstream,
      basin
    ] = await Promise.all([
      ReservoirGeometry.findOne({ dam: damId }),
      StorageCapacity.findOne({ dam: damId }),
      ForecastMeteo.findOne({ dam: damId }),
      PredictiveSimulation.findOne({ dam: damId }),
      HistoricalRisk.findOne({ dam: damId }),
      StructuralHealth.findOne({ dam: damId }),
      GateSpillway.findOne({ dam: damId }),
      DownstreamRisk.findOne({ dam: damId }),
      BasinAggregated.findOne({ dam: damId })
    ]);
    
    res.status(200).json({
      reservoirGeometry: geometry,
      storageCapacity: storage,
      forecastMeteo: forecast,
      predictiveSimulation: predictive,
      historicalRisk: historical,
      structuralHealth: structural,
      gateSpillway: gateSpillway,
      downstreamRisk: downstream,
      basinAggregated: basin
    });
  } catch (error) {
    console.error("Error fetching all dam data:", error);
    res.status(500).json({ message: "Failed to fetch all dam data", error: error.message });
  }
};

/**
 * Recalculate all derived fields for a dam
 * Useful when input data changes
 */
export const recalculateAllFields = async (req, res) => {
  try {
    const { damId } = req.params;
    
    // Fetch all data
    const models = [
      ReservoirGeometry,
      StorageCapacity,
      ForecastMeteo,
      PredictiveSimulation,
      HistoricalRisk,
      StructuralHealth,
      GateSpillway,
      DownstreamRisk,
      BasinAggregated
    ];
    
    const results = [];
    
    for (const Model of models) {
      const data = await Model.findOne({ dam: damId });
      if (data) {
        // Trigger recalculation by saving
        await data.save();
        results.push({
          model: Model.modelName,
          status: "recalculated"
        });
      }
    }
    
    res.status(200).json({
      message: "All fields recalculated successfully",
      results
    });
  } catch (error) {
    console.error("Error recalculating fields:", error);
    res.status(500).json({ message: "Failed to recalculate fields", error: error.message });
  }
};
