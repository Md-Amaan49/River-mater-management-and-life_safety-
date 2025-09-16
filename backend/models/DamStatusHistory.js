// models/DamStatusHistory.js
import mongoose from "mongoose";

const gateSchema = new mongoose.Schema({
  gateNumber: { type: Number, required: true },
  status: { type: String, enum: ["open", "closed"], default: "closed" },
  percentageOpen: { type: Number, min: 0, max: 100, default: 0 },
}, { _id: false });

const damStatusHistorySchema = new mongoose.Schema({
  dam: { type: mongoose.Schema.Types.ObjectId, ref: "Dam", required: true, index: true },

  currentWaterLevel: { type: Number, required: true },
  levelUnit: { type: String, enum: ["m", "%"], default: "m" },
  maxLevel: { type: Number },
  minLevel: { type: Number },

  inflowRate: { type: Number },
  outflowRate: { type: Number },
  spillwayDischarge: { type: Number },

  gateStatus: [gateSchema],

  source: { type: String, enum: ["sensor","manual"], default: "manual" },
  sensorId: { type: String },
  powerStatus: { type: String, enum: ["ok","low","offline"], default: "ok" },
  lastSyncAt: { type: Date },
}, { timestamps: true });

export default mongoose.models.DamStatusHistory || mongoose.model("DamStatusHistory", damStatusHistorySchema);
