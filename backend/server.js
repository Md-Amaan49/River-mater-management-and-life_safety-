import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import userRoutes from "./routes/userRoutes.js";
import dataRoutes from "./routes/dataRoutes.js";
import damRoutes from "./routes/damRoutes.js";
import waterUsageRoutes from "./routes/waterUsageRoutes.js";
import safetyRoutes from "./routes/safetyRoutes.js";
import sensorRoutes from "./routes/sensorRoutes.js";
import supportingInfoRoutes from "./routes/supportingInfoRoutes.js";
import featuresRoutes from "./routes/featuresRoutes.js";
import stateRoutes from "./routes/stateRoutes.js";
import waterFlowRoutes from "./routes/waterFlowRoutes.js";
import sidebarRoutes from "./routes/sidebarRoutes.js";
import adminDataRoutes from "./routes/adminDataRoutes.js";
import alertRoutes from "./routes/alertRoutes.js";

dotenv.config();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// API routes
app.use("/api/states", stateRoutes);
app.use("/api/users", userRoutes);
app.use("/api/data", dataRoutes);
app.use("/api/dam", damRoutes);
app.use("/api/dams", damRoutes);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/api/water-usage", waterUsageRoutes);
app.use("/api/safety", safetyRoutes);
app.use("/api/sensors", sensorRoutes);
app.use("/api/supporting-info", supportingInfoRoutes);
app.use("/api/features", featuresRoutes);

// serve geojson directory (create backend/geojson and subfolders)
app.use("/geojson", express.static(path.join(__dirname, "geojson")));
app.use("/api/waterflow", waterFlowRoutes);
app.use("/api/sidebar", sidebarRoutes);
app.use("/api/alerts", alertRoutes);
app.use("/api", adminDataRoutes);

// Serve frontend
app.use(express.static(path.join(__dirname, "../frontend/dist")));

app.get("*", (req, res) => {
  if (req.path.startsWith("/api") || req.path.includes(".")) {
    return res.status(404).send("Not found");
  }
  res.sendFile(path.resolve(__dirname, "../frontend/dist/index.html"));
});

// DB + Server start
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () =>
      console.log(`Server running on http://localhost:${PORT}`)
    );
  })
  .catch((err) => console.log("DB connection error:", err));
