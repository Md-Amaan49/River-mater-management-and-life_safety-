import express from "express";
import {
  getAllAlerts,
  getCriticalAlerts,
  getAlertsByRegion,
  getRecentAlertActivity,
  updateAlertStatus,
  getAlertDashboard
} from "../controllers/alertController.js";
import { getTestAlerts, getTestDashboard } from "../controllers/testAlertController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes (with authentication)
router.get("/", protect, getAllAlerts);
router.get("/critical", protect, getCriticalAlerts);
router.get("/regions", protect, getAlertsByRegion);
router.get("/activity", protect, getRecentAlertActivity);
router.get("/dashboard", protect, getAlertDashboard);

// Test routes (without database dependency)
router.get("/test/critical", getTestAlerts);
router.get("/test/dashboard", getTestDashboard);

// Admin-only routes
router.put("/:alertId", protect, admin, updateAlertStatus);

export default router;