import express from "express";
import {
  addDamHistory,
  getDamHistory,
  updateDamHistory,
  deleteDamHistory,
  addPublicSpot,
  getPublicSpots,
  updatePublicSpot,
  deletePublicSpot,
  addRestrictedArea,
  getRestrictedAreas,
  updateRestrictedArea,
  deleteRestrictedArea,
  addGuideline,
  getGuidelines,
  updateGuideline,
  deleteGuideline,
} from "../controllers/adminDataController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Dam History Routes
router.post("/dam-history", protect, admin, addDamHistory);
router.get("/dam-history/:damId", protect, getDamHistory);
router.put("/dam-history/:id", protect, admin, updateDamHistory);
router.delete("/dam-history/:id", protect, admin, deleteDamHistory);

// Public Spots Routes
router.post("/public-spots", protect, admin, addPublicSpot);
router.get("/public-spots", protect, getPublicSpots);
router.put("/public-spots/:id", protect, admin, updatePublicSpot);
router.delete("/public-spots/:id", protect, admin, deletePublicSpot);

// Restricted Areas Routes
router.post("/restricted-areas", protect, admin, addRestrictedArea);
router.get("/restricted-areas", protect, getRestrictedAreas);
router.put("/restricted-areas/:id", protect, admin, updateRestrictedArea);
router.delete("/restricted-areas/:id", protect, admin, deleteRestrictedArea);

// Guidelines Routes
router.post("/guidelines", protect, admin, addGuideline);
router.get("/guidelines", protect, getGuidelines);
router.put("/guidelines/:id", protect, admin, updateGuideline);
router.delete("/guidelines/:id", protect, admin, deleteGuideline);

export default router;