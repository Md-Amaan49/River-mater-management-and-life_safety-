import express from "express";
import {
  addSensor,
  getSensors,
  updateSensor,
  deleteSensor,
} from "../controllers/sensorController.js";

const router = express.Router();

router.post("/", addSensor);        // Add sensor
router.get("/", getSensors);        // Get sensors
router.put("/:id", updateSensor);   // Update sensor
router.delete("/:id", deleteSensor); // Delete sensor

export default router;
