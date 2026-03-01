import express from "express";
import {
  getSafetyAlert,
  upsertSafetyAlert,
  getControllerDashboard,
  getGovernmentDashboard,
  getRescueDashboard,
  getPublicAlert,
  getAllActiveAlerts
} from "../controllers/safetyAlertController.js";

const router = express.Router();

// Main CRUD routes
router.get("/dam/:damId", getSafetyAlert);
router.post("/dam/:damId", upsertSafetyAlert);
router.put("/dam/:damId", upsertSafetyAlert);

// Role-specific dashboard routes
router.get("/dam/:damId/controller", getControllerDashboard);
router.get("/dam/:damId/government", getGovernmentDashboard);
router.get("/dam/:damId/rescue", getRescueDashboard);
router.get("/dam/:damId/public", getPublicAlert);

// Monitoring route
router.get("/active-alerts", getAllActiveAlerts);

export default router;
