import mongoose from "mongoose";
import {
  calculateRiverCrossSectionArea,
  calculateHydraulicRadius,
  calculateEffectiveDischargeCapacity
} from "../utils/calculationEngine.js";

const reservoirGeometrySchema = new mongoose.Schema({
  dam: { type: mongoose.Schema.Types.ObjectId, ref: "Dam", required: true, unique: true },
  
  // Input fields
  height: Number, // m
  length: Number, // m
  crestLevel: Number, // m above sea level
  riverWidth: Number, // m
  riverDepth: Number, // m
  damCrestWidth: Number, // m
  foundationDepth: Number, // m
  slopeUpstream: Number, // ratio
  slopeDownstream: Number, // ratio
  spillwayWidth: Number, // m
  spillwayLength: Number, // m
  gateWidth: Number, // m
  gateHeight: Number, // m
  dischargeCoefficient: Number,
  gateOpeningPercentage: Number, // %
  head: Number, // m
  
  // Calculated fields
  riverCrossSectionArea: Number, // m² - calculated
  hydraulicRadius: Number, // m - calculated
  effectiveDischargeCapacity: Number, // m³/s - calculated
  
}, { timestamps: true });

// Pre-save hook to calculate derived fields
reservoirGeometrySchema.pre('save', function(next) {
  // Calculate river cross-section area
  if (this.riverWidth && this.riverDepth) {
    this.riverCrossSectionArea = calculateRiverCrossSectionArea(this.riverWidth, this.riverDepth);
  }
  
  // Calculate hydraulic radius
  if (this.riverWidth && this.riverDepth) {
    this.hydraulicRadius = calculateHydraulicRadius(this.riverWidth, this.riverDepth);
  }
  
  // Calculate effective discharge capacity
  if (this.dischargeCoefficient && this.gateOpeningPercentage !== null && this.gateOpeningPercentage !== undefined && this.head) {
    this.effectiveDischargeCapacity = calculateEffectiveDischargeCapacity(
      this.dischargeCoefficient,
      this.gateOpeningPercentage,
      this.head
    );
  }
  
  next();
});

export default mongoose.model("ReservoirGeometry", reservoirGeometrySchema);
