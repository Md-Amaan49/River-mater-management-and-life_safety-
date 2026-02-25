import mongoose from "mongoose";
import {
  calculateArrivalTimeFromUpstream,
  calculateDownstreamArrivalTime,
  calculatePredictedStorage,
  calculatePredictedWaterLevel,
  calculateTimeToOverflow,
  calculateFloodRiskScore
} from "../utils/calculationEngine.js";

const predictiveSimulationSchema = new mongoose.Schema({
  dam: { type: mongoose.Schema.Types.ObjectId, ref: "Dam", required: true, unique: true },
  
  // Input fields
  upstreamDamDistance: Number, // km
  upstreamRiverVelocity: Number, // m/s
  downstreamDamDistance: Number, // km
  downstreamRiverVelocity: Number, // m/s
  currentStorage: Number, // m³
  netFlow: Number, // m³/s
  surfaceArea: Number, // m²
  availableCapacity: Number, // m³
  storageUtilization: Number, // %
  rainfallForecast: Number, // mm
  downstreamRisk: Number, // 0-100
  simulationTimeHours: Number, // hours
  cascadingRiskIndex: Number, // 0-100
  upstreamStress: Number, // 0-100
  downstreamStress: Number, // 0-100
  
  // Calculated fields
  arrivalTimeFromUpstream: Number, // hours - calculated
  downstreamArrivalTime: Number, // hours - calculated
  predictedStorage: Number, // m³ - calculated
  predictedWaterLevel: Number, // m - calculated
  timeToOverflow: Number, // hours - calculated
  floodRiskScore: Number, // 0-100 - calculated
  overflowProbability: Number, // % - calculated
  riskTrendIndex: Number, // calculated
  predictionConfidenceLevel: Number, // % - calculated
  
}, { timestamps: true });

// Pre-save hook to calculate derived fields
predictiveSimulationSchema.pre('save', function(next) {
  // Calculate arrival time from upstream
  if (this.upstreamDamDistance && this.upstreamRiverVelocity) {
    this.arrivalTimeFromUpstream = calculateArrivalTimeFromUpstream(
      this.upstreamDamDistance,
      this.upstreamRiverVelocity
    );
  }
  
  // Calculate downstream arrival time
  if (this.downstreamDamDistance && this.downstreamRiverVelocity) {
    this.downstreamArrivalTime = calculateDownstreamArrivalTime(
      this.downstreamDamDistance,
      this.downstreamRiverVelocity
    );
  }
  
  // Calculate predicted storage
  if (this.currentStorage !== null && this.currentStorage !== undefined && this.netFlow && this.simulationTimeHours) {
    this.predictedStorage = calculatePredictedStorage(
      this.currentStorage,
      this.netFlow,
      this.simulationTimeHours
    );
  }
  
  // Calculate predicted water level
  if (this.predictedStorage && this.surfaceArea) {
    this.predictedWaterLevel = calculatePredictedWaterLevel(
      this.predictedStorage,
      this.surfaceArea
    );
  }
  
  // Calculate time to overflow
  if (this.availableCapacity && this.netFlow) {
    this.timeToOverflow = calculateTimeToOverflow(
      this.availableCapacity,
      this.netFlow
    );
  }
  
  // Calculate flood risk score
  if (this.storageUtilization !== null && this.storageUtilization !== undefined) {
    this.floodRiskScore = calculateFloodRiskScore(
      this.storageUtilization,
      this.rainfallForecast,
      this.timeToOverflow,
      this.downstreamRisk
    );
  }
  
  // Calculate overflow probability (simplified)
  if (this.floodRiskScore !== null && this.floodRiskScore !== undefined) {
    this.overflowProbability = this.floodRiskScore; // Can be refined with ML
  }
  
  // Calculate prediction confidence level (simplified - can be enhanced with ML)
  if (this.upstreamRiverVelocity && this.downstreamRiverVelocity) {
    this.predictionConfidenceLevel = 85; // Default high confidence, can be ML-based
  }
  
  next();
});

export default mongoose.model("PredictiveSimulation", predictiveSimulationSchema);
