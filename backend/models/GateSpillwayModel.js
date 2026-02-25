import mongoose from "mongoose";
import {
  calculateActualDischarge,
  calculateGateEfficiencyIndex
} from "../utils/calculationEngine.js";

const gateSpillwaySchema = new mongoose.Schema({
  dam: { type: mongoose.Schema.Types.ObjectId, ref: "Dam", required: true, unique: true },
  
  // Input fields
  numberOfSpillwayGates: Number,
  gateOpeningPercentage: Number, // %
  maxGateDischargeCapacity: Number, // m³/s
  emergencySpillwayCapacity: Number, // m³/s
  currentGateStatus: { type: String, enum: ["Open", "Closed", "Partial"] },
  lastGateOperationTime: Date,
  manualOverrideStatus: { type: String, enum: ["Active", "Inactive"] },
  authorityApprovalStatus: { type: String, enum: ["Approved", "Pending", "Not Required"] },
  dischargeCoefficient: Number,
  gateOpening: Number, // m
  head: Number, // m
  totalInflow: Number, // m³/s
  safeStorageTarget: Number, // m³
  
  // Calculated fields
  actualDischarge: Number, // m³/s - calculated
  requiredSpillwayIncrease: Number, // m³/s - calculated
  gateEfficiencyIndex: Number, // % - calculated
  releaseOptimizationValue: Number, // calculated
  
}, { timestamps: true });

// Pre-save hook to calculate derived fields
gateSpillwaySchema.pre('save', function(next) {
  // Calculate actual discharge
  if (this.dischargeCoefficient && this.gateOpening !== null && this.gateOpening !== undefined && this.head) {
    this.actualDischarge = calculateActualDischarge(
      this.dischargeCoefficient,
      this.gateOpening,
      this.head
    );
  }
  
  // Calculate required spillway increase
  if (this.totalInflow && this.safeStorageTarget) {
    this.requiredSpillwayIncrease = Math.max(0, this.totalInflow - this.safeStorageTarget);
  }
  
  // Calculate gate efficiency index
  if (this.actualDischarge && this.maxGateDischargeCapacity) {
    this.gateEfficiencyIndex = calculateGateEfficiencyIndex(
      this.actualDischarge,
      this.maxGateDischargeCapacity
    );
  }
  
  // Calculate release optimization value (simplified - can be AI-based)
  if (this.gateEfficiencyIndex !== null && this.gateEfficiencyIndex !== undefined && this.totalInflow) {
    // Simplified optimization: balance between efficiency and safety
    this.releaseOptimizationValue = (this.gateEfficiencyIndex * 0.6) + 
                                     (Math.min(this.totalInflow / 100, 1) * 40);
  }
  
  next();
});

export default mongoose.model("GateSpillway", gateSpillwaySchema);
