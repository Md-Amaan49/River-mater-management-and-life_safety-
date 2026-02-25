import mongoose from "mongoose";
import {
  calculateBasinStorageUtilization,
  calculateCascadingFailureProbability,
  calculateMultiDamOptimizationScore
} from "../utils/calculationEngine.js";

const basinAggregatedSchema = new mongoose.Schema({
  dam: { type: mongoose.Schema.Types.ObjectId, ref: "Dam", required: true, unique: true },
  
  // Input fields
  basinRainfallAverage: Number, // mm - can be calculated from all dams in basin
  basinLiveStorage: Number, // m³
  basinTotalStorage: Number, // m³
  basinFloodRiskLevel: { type: String, enum: ["Low", "Moderate", "High", "Critical", "Extreme"] },
  upstreamStress: Number, // 0-100
  downstreamStress: Number, // 0-100
  damHealthScore: Number, // 0-100
  basinCoordinationStatus: { 
    type: String, 
    enum: ["Not Coordinated", "Partially Coordinated", "Fully Coordinated", "Optimized"] 
  },
  flowBalance: Number, // 0-100
  
  // Calculated fields
  basinStorageUtilization: Number, // % - calculated
  cascadingFailureProbability: Number, // % - calculated
  multiDamOptimizationScore: Number, // 0-100 - calculated
  
}, { timestamps: true });

// Pre-save hook to calculate derived fields
basinAggregatedSchema.pre('save', function(next) {
  // Calculate basin storage utilization
  if (this.basinLiveStorage && this.basinTotalStorage) {
    this.basinStorageUtilization = calculateBasinStorageUtilization(
      this.basinLiveStorage,
      this.basinTotalStorage
    );
  }
  
  // Calculate cascading failure probability
  if (this.upstreamStress !== null && this.upstreamStress !== undefined && 
      this.downstreamStress !== null && this.downstreamStress !== undefined && 
      this.damHealthScore) {
    this.cascadingFailureProbability = calculateCascadingFailureProbability(
      this.upstreamStress,
      this.downstreamStress,
      this.damHealthScore
    );
  }
  
  // Calculate multi-dam optimization score
  if (this.basinCoordinationStatus) {
    this.multiDamOptimizationScore = calculateMultiDamOptimizationScore(
      this.basinCoordinationStatus,
      this.basinStorageUtilization,
      this.flowBalance
    );
  }
  
  next();
});

export default mongoose.model("BasinAggregated", basinAggregatedSchema);
