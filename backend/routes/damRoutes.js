// routes/damRoutes.js

import express from "express";
const router = express.Router();

import {
  addState,
  getStates,
  addRiver,
  getRiversByState,
  addDam,
  getDamsByRiver,
  getDamById,
  getDamDetails,
  updateDam,
  updateCoreDamInfo,
  createCoreDamInfo,
  getCoreDamInfo,
  saveOrUpdateCoreDamInfo,
  getAllDamPoints, 
  getDamPointsByState, 
  getDamPointsByRiver,
  getDamsByState,
  getDamsByRiverName
} from "../controllers/damController.js";

// ==== State Routes ====
router.post("/states", addState);
router.get("/states", getStates);

// ==== River Routes ====
router.post("/rivers", addRiver);
router.get("/rivers/:stateId", getRiversByState);

// ==== Dam Routes ====
router.post("/dams", addDam);
router.get("/dams/:riverId", getDamsByRiver);
router.get("/dam/:id", getDamById);

// ==== Routes for WaterFlowPage ====
router.get("/by-state/:stateId", getDamsByState);
router.get("/by-river/:riverId", getDamsByRiverName);

// ==== Core Dam Info Routes ====
router.get("/core/:damId", getDamDetails);
router.post("/core", createCoreDamInfo); // For creating new core info
router.put("/core/:damId", updateCoreDamInfo); // For updating existing core info

// Get existing dam core info
router.get("/core/:damId", getCoreDamInfo);
// Save new core info
router.post("/core/:damId", saveOrUpdateCoreDamInfo);
// Update existing core info
router.put("/core/:damId", saveOrUpdateCoreDamInfo);

// ==== New route: Get all dams with coordinates ====

router.get("/dam-points", getAllDamPoints); // all dams
router.get("/dam-points/state/:stateId", getDamPointsByState); // dams by state
router.get("/dam-points/:riverId", getDamPointsByRiver);
export default router;
