/**
 * Advanced Data Routes
 * Routes for all advanced dam data categories with calculated fields
 */

import express from "express";
import {
  // Reservoir Geometry
  getReservoirGeometry,
  createReservoirGeometry,
  updateReservoirGeometry,
  
  // Storage Capacity
  getStorageCapacity,
  createStorageCapacity,
  updateStorageCapacity,
  
  // Forecast Meteo
  getForecastMeteo,
  createForecastMeteo,
  updateForecastMeteo,
  
  // Predictive Simulation
  getPredictiveSimulation,
  createPredictiveSimulation,
  updatePredictiveSimulation,
  
  // Historical Risk
  getHistoricalRisk,
  createHistoricalRisk,
  updateHistoricalRisk,
  
  // Structural Health
  getStructuralHealth,
  createStructuralHealth,
  updateStructuralHealth,
  
  // Gate Spillway
  getGateSpillway,
  createGateSpillway,
  updateGateSpillway,
  
  // Downstream Risk
  getDownstreamRisk,
  createDownstreamRisk,
  updateDownstreamRisk,
  
  // Basin Aggregated
  getBasinAggregated,
  createBasinAggregated,
  updateBasinAggregated,
  
  // Special functions
  getAllDamData,
  recalculateAllFields
} from "../controllers/advancedDataController.js";

const router = express.Router();

// ==================== RESERVOIR GEOMETRY ROUTES ====================
router.get("/reservoir-geometry/:damId", getReservoirGeometry);
router.post("/reservoir-geometry/:damId", createReservoirGeometry);
router.put("/reservoir-geometry/:damId", updateReservoirGeometry);

// ==================== STORAGE CAPACITY ROUTES ====================
router.get("/storage-capacity/:damId", getStorageCapacity);
router.post("/storage-capacity/:damId", createStorageCapacity);
router.put("/storage-capacity/:damId", updateStorageCapacity);

// ==================== FORECAST METEO ROUTES ====================
router.get("/forecast-meteo/:damId", getForecastMeteo);
router.post("/forecast-meteo/:damId", createForecastMeteo);
router.put("/forecast-meteo/:damId", updateForecastMeteo);

// ==================== PREDICTIVE SIMULATION ROUTES ====================
router.get("/predictive-simulation/:damId", getPredictiveSimulation);
router.post("/predictive-simulation/:damId", createPredictiveSimulation);
router.put("/predictive-simulation/:damId", updatePredictiveSimulation);

// ==================== HISTORICAL RISK ROUTES ====================
router.get("/historical-risk/:damId", getHistoricalRisk);
router.post("/historical-risk/:damId", createHistoricalRisk);
router.put("/historical-risk/:damId", updateHistoricalRisk);

// ==================== STRUCTURAL HEALTH ROUTES ====================
router.get("/structural-health/:damId", getStructuralHealth);
router.post("/structural-health/:damId", createStructuralHealth);
router.put("/structural-health/:damId", updateStructuralHealth);

// ==================== GATE SPILLWAY ROUTES ====================
router.get("/gate-spillway/:damId", getGateSpillway);
router.post("/gate-spillway/:damId", createGateSpillway);
router.put("/gate-spillway/:damId", updateGateSpillway);

// ==================== DOWNSTREAM RISK ROUTES ====================
router.get("/downstream-risk/:damId", getDownstreamRisk);
router.post("/downstream-risk/:damId", createDownstreamRisk);
router.put("/downstream-risk/:damId", updateDownstreamRisk);

// ==================== BASIN AGGREGATED ROUTES ====================
router.get("/basin-aggregated/:damId", getBasinAggregated);
router.post("/basin-aggregated/:damId", createBasinAggregated);
router.put("/basin-aggregated/:damId", updateBasinAggregated);

// ==================== SPECIAL ROUTES ====================
// Get all data for a dam
router.get("/all-data/:damId", getAllDamData);

// Recalculate all derived fields
router.post("/recalculate/:damId", recalculateAllFields);

export default router;
