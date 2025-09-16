import express from "express";
import {
  addWaterUsage,
  getAllWaterUsage,
  getWaterUsageByDam,
  updateWaterUsage,
  deleteWaterUsage,
  getWaterUsageByState,
  getWaterUsageByRiver,
 
} from "../controllers/waterUsageController.js";

const router = express.Router();

router.post("/", addWaterUsage); // ➕ Add
router.get("/", getAllWaterUsage); // 📋 All
router.get("/:damId", getWaterUsageByDam); // 🔍 By Dam
router.put("/:id", updateWaterUsage); // ✏️ Update
router.delete("/:id", deleteWaterUsage); // ❌ Delete

// Get usage for a specific dam
router.get("/dam/:damId", getWaterUsageByDam);

// Get aggregated usage for a state
router.get("/state/:stateName", getWaterUsageByState);

// Get aggregated usage for a river
router.get("/river/:riverId", getWaterUsageByRiver);
export default router;
