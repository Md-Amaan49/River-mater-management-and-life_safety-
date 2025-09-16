// models/DamStatus.js
import mongoose from "mongoose";

const gateSchema = new mongoose.Schema({
  gateNumber: { type: Number, required: true },
  status: { type: String, enum: ["open", "closed"], default: "closed" },
  percentageOpen: { type: Number, min: 0, max: 100, default: 0 },
}, { _id: false });

const damStatusSchema = new mongoose.Schema({
  dam: { type: mongoose.Schema.Types.ObjectId, ref: "Dam", required: true, index: true },

  // core realtime fields
  currentWaterLevel: { type: Number, required: true }, // meters OR % (pick one consistently)
  levelUnit: { type: String, enum: ["m", "%"], default: "m" },

  maxLevel: { type: Number }, // threshold for alerts
  minLevel: { type: Number },

  inflowRate: { type: Number },   // m3/s
  outflowRate: { type: Number },  // m3/s

  spillwayDischarge: { type: Number }, // m3/s

  gateStatus: [gateSchema], // array to handle multiple gates

  // telemetry & meta
  source: { type: String, enum: ["sensor", "manual"], default: "manual" },
  sensorId: { type: String },
  powerStatus: { type: String, enum: ["ok", "low", "offline"], default: "ok" },
  lastSyncAt: { type: Date },
}, { timestamps: true });

// Helpful index for “latest by dam”
damStatusSchema.index({ dam: 1, createdAt: -1 });

export default mongoose.model("DamStatus", damStatusSchema);
