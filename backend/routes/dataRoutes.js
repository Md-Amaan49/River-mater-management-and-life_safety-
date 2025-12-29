import express from "express";
import {
  addState,
  addRiver,
  addDam,
  getStates,
  getRiversByState,
  getDamsByRiver,
  getDamDetails,
  getCoreDamInfo,
  updateCoreDamInfo,
  searchRivers,
  searchDams,
  globalSearch
} from "../controllers/dataController.js";

import {
  createDamStatus,
  upsertCurrentDamStatus,
  getLatestDamStatus,
  getDamStatusHistory
} from "../controllers/statusController.js";


const router = express.Router();

// existing
router.post("/state", addState);
router.post("/river", addRiver);
router.post("/dam", addDam);

router.get("/core-info/:damId", getCoreDamInfo);
router.put("/core-info/:damId", updateCoreDamInfo);

router.get("/states", getStates);
router.get("/rivers/:stateId", getRiversByState);
router.get("/dams/:riverId", getDamsByRiver);
router.get("/dam/:damId", getDamDetails);

// Search endpoints
router.get("/search/rivers", searchRivers);
router.get("/search/dams", searchDams);
router.get("/search/global", globalSearch);

// NEW: realtime status
// Create a new sample (append-only history)
router.post("/dam/:damId/status", createDamStatus);

// Upsert a single “current” doc (idempotent endpoint for sensors)
router.put("/dam/:damId/status", upsertCurrentDamStatus);

// Read latest status
router.get("/dam/:damId/status", getLatestDamStatus);

// History (paginated)
router.get("/dam/:damId/status/history", getDamStatusHistory);

export default router;
