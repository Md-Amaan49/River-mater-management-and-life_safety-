import express from "express";
import {
  getAlertsForSavedDams,
  getSavedDamsDetails,
  getGuidelinesForSavedDams,
  getRestrictedAreasForSavedDams,
  getPublicSpotsForSavedDams,
  getHistoryForSavedDams,
  getHelpInfo,
} from "../controllers/sidebarController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// All routes require authentication since they deal with saved dams
router.get("/alerts", protect, getAlertsForSavedDams);
router.get("/saved-dams", protect, getSavedDamsDetails);
router.get("/guidelines", protect, getGuidelinesForSavedDams);
router.get("/restricted-areas", protect, getRestrictedAreasForSavedDams);
router.get("/public-spots", protect, getPublicSpotsForSavedDams);
router.get("/history", protect, getHistoryForSavedDams);
router.get("/help", getHelpInfo); // Help doesn't require auth

export default router;