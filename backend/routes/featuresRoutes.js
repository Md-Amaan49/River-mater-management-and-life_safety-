// backend/routes/featureRoutes.js
import express from "express";
import {
  getFeatures,
  addFeature,
  updateFeature,
  deleteFeature,
  getDamEventHistory,
  getDamReport,
} from "../controllers/featuresController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public: view features list (you can wrap with protect if you want)
router.get("/", getFeatures);

// Admin only: manage features
router.post("/", protect, admin, addFeature);
router.put("/:id", protect, admin, updateFeature);
router.delete("/:id", protect, admin, deleteFeature);

// Admin: tools for history & reports for a dam
router.get("/history/:damId", protect, admin, getDamEventHistory);
router.get("/report/:damId", protect, admin, getDamReport);

export default router;
