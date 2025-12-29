// backend/routes/waterFlowRoutes.js
import express from "express";
const router = express.Router();
import {
  getStates,
  getRiversByState,
  getDamsByRiver,
  getIndiaGeoJSON,
  getStateGeoJSON,
  getRiverGeoJSON,
  getDamPointsForRiver,
  getStateStats,
  getRiverStats,
 
  getDamDetails
} from "../controllers/waterFlowController.js";

// dropdown data
router.get("/states", getStates);
router.get("/rivers/:stateId", getRiversByState);
router.get("/dams/:riverId", getDamsByRiver);

// geojson / map layers
router.get("/geo/india", getIndiaGeoJSON);
router.get("/geo/state/:stateId", getStateGeoJSON);
router.get("/geo/river/:riverId", getRiverGeoJSON);

// dam points for a river
router.get("/dam-points/:riverId", getDamPointsForRiver);

// stats
router.get("/state-stats/:stateId", getStateStats);
router.get("/river-stats/:riverId", getRiverStats);

// dam details
router.get("/dam/:damId", getDamDetails);

export default router;
