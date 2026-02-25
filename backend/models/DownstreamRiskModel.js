import mongoose from "mongoose";
import {
  calculateDownstreamFloodImpactScore,
  calculateEvacuationTimeRemaining,
  calculateHumanRiskIndex
} from "../utils/calculationEngine.js";

const downstreamRiskSchema = new mongoose.Schema({
  dam: { type: mongoose.Schema.Types.ObjectId, ref: "Dam", required: true, unique: true },
  
  // Input fields
  downstreamRiverBankHeight: Number, // m
  floodWarningLevel: Number, // m
  dangerLevel: Number, // m
  downstreamFloodPlainPopulation: Number,
  evacuationTimeRequired: Number, // minutes
  villageDistanceFromRiver: Number, // km
  criticalInfrastructureDownstream: String, // text description
  criticalInfrastructureCount: Number, // count of facilities
  currentDischarge: Number, // m³/s
  predictedRiverLevel: Number, // m
  predictedRiverBankOverflowTime: Number, // hours
  floodProbability: Number, // %
  
  // Calculated fields
  downstreamFloodImpactScore: Number, // 0-100 - calculated
  evacuationTimeRemaining: Number, // minutes - calculated
  dangerLevelStatus: { type: String, enum: ["Safe", "Warning", "Danger", "Critical"] }, // calculated
  humanRiskIndex: Number, // 0-100 - calculated
  
}, { timestamps: true });

// Pre-save hook to calculate derived fields
downstreamRiskSchema.pre('save', function(next) {
  // Calculate downstream flood impact score
  if (this.downstreamFloodPlainPopulation) {
    this.downstreamFloodImpactScore = calculateDownstreamFloodImpactScore(
      this.downstreamFloodPlainPopulation,
      this.criticalInfrastructureCount,
      this.currentDischarge
    );
  }
  
  // Calculate evacuation time remaining
  if (this.predictedRiverBankOverflowTime && this.evacuationTimeRequired) {
    const evacuationTimeHours = this.evacuationTimeRequired / 60; // Convert to hours
    this.evacuationTimeRemaining = calculateEvacuationTimeRemaining(
      this.predictedRiverBankOverflowTime,
      evacuationTimeHours
    ) * 60; // Convert back to minutes
  }
  
  // Calculate danger level status
  if (this.predictedRiverLevel && this.dangerLevel && this.floodWarningLevel) {
    if (this.predictedRiverLevel >= this.dangerLevel) {
      this.dangerLevelStatus = "Critical";
    } else if (this.predictedRiverLevel >= this.floodWarningLevel) {
      this.dangerLevelStatus = "Danger";
    } else if (this.predictedRiverLevel >= this.floodWarningLevel * 0.8) {
      this.dangerLevelStatus = "Warning";
    } else {
      this.dangerLevelStatus = "Safe";
    }
  }
  
  // Calculate human risk index
  if (this.downstreamFloodPlainPopulation && this.floodProbability !== null && this.floodProbability !== undefined) {
    this.humanRiskIndex = calculateHumanRiskIndex(
      this.downstreamFloodPlainPopulation,
      this.floodProbability
    );
  }
  
  next();
});

export default mongoose.model("DownstreamRisk", downstreamRiskSchema);
