import express from "express";
import {
  addSafetyInfo,
  getSafetyInfo,
  updateSafetyInfo,
} from "../controllers/safetyController.js";

const router = express.Router();

// /api/safety/dam/:id
router.post("/dam/:id", addSafetyInfo);
router.get("/dam/:id", getSafetyInfo);
router.put("/dam/:id", updateSafetyInfo);

export default router;
