// routes/supportingInfoRoutes.js
import express from "express";
import {
  createSupportingInfo,
  getSupportingInfoByDam,
  updateSupportingInfo,
  deleteSupportingInfo
} from "../controllers/supportingInfoController.js";
import { getStates, getRiversByState, getDamsByRiver } from "../controllers/stateController.js";

const router = express.Router();

// Add new info
router.post("/dam/:damId", createSupportingInfo);

// Get all for a dam
router.get("/dam/:damId", getSupportingInfoByDam);

// Update
router.put("/:id", updateSupportingInfo);

// Delete
router.delete("/:id", deleteSupportingInfo);


router.get("/states", getStates);                  // GET all states
router.get("/rivers/:stateId", getRiversByState);  // GET rivers for a state
router.get("/dams/:riverId", getDamsByRiver);      // GET dams for a river

export default router;
