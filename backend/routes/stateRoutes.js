// routes/stateRoutes.js
import express from "express";
import State from "../models/State.js";

const router = express.Router();

// Get all states
router.get("/", async (req, res) => {
  try {
    const states = await State.find();
    res.json(states);
  } catch (err) {
    res.status(500).json({ message: "Error fetching states" });
  }
});

export default router;
