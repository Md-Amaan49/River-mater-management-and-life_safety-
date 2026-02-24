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

  inflowRate: { type: Number },   // m3/s - local inflow (streams, groundwater)
  outflowRate: { type: Number },  // m3/s - local outflow (irrigation, etc.)

  spillwayDischarge: { type: Number }, // m3/s - CALCULATED: outflowRate + outflowToDownstreamDam
  rainfallRate: { type: Number }, // m3/s - rainfall contribution to reservoir
  evaporationRate: { type: Number }, // m3/s - water loss due to evaporation
  totalInflow: { type: Number }, // m3/s - CALCULATED: inflowRate + inflowFromUpstreamDam + rainfallRate

  // upstream/downstream flow tracking
  inflowFromUpstreamDam: { type: Number }, // m3/s - water coming from upstream dam
  outflowToDownstreamDam: { type: Number }, // m3/s - water going to downstream dam
  upstreamRiverVelocity: { type: Number }, // m/s - water velocity in upstream river section
  downstreamRiverVelocity: { type: Number }, // m/s - water velocity in downstream river section

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

// Pre-save hook to calculate totalInflow and spillwayDischarge
damStatusSchema.pre('save', function(next) {
  // Calculate totalInflow = inflowRate + inflowFromUpstreamDam + rainfallRate
  const inflowRate = this.inflowRate || 0;
  const inflowFromUpstream = this.inflowFromUpstreamDam || 0;
  const rainfall = this.rainfallRate || 0;
  this.totalInflow = inflowRate + inflowFromUpstream + rainfall;
  
  // Calculate spillwayDischarge = outflowRate + outflowToDownstreamDam
  const outflowRate = this.outflowRate || 0;
  const outflowToDownstream = this.outflowToDownstreamDam || 0;
  this.spillwayDischarge = outflowRate + outflowToDownstream;
  
  next();
});
