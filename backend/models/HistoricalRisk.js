import mongoose from "mongoose";

const historicalRiskSchema = new mongoose.Schema({
  dam: { type: mongoose.Schema.Types.ObjectId, ref: "Dam", required: true, unique: true },
  
  // Input fields
  historicalPeakInflow: Number, // m³/s
  historicalMaxWaterLevel: Number, // m
  historicalFloodEvents: Number, // count
  lastMajorFloodYear: Number,
  floodDamageHistory: String, // text description
  designFloodLevel: Number, // m
  safetyMargin: Number, // m
  riskClassification: { type: String, enum: ["Low", "Moderate", "High", "Very High", "Extreme"] },
  historicalFailureIncidents: Number, // count
  yearsInOperation: Number,
  
  // Calculated fields
  returnPeriodFloodLevel: Number, // m - calculated from statistical analysis
  probableMaximumFlood: Number, // m³/s - calculated
  floodRecurrenceInterval: Number, // years - calculated
  anomalyDetectionScore: Number, // 0-100 - calculated
  
}, { timestamps: true });

// Pre-save hook to calculate derived fields
historicalRiskSchema.pre('save', function(next) {
  // Calculate return period flood level (simplified statistical approach)
  if (this.historicalMaxWaterLevel && this.yearsInOperation) {
    // Simplified: based on historical max and years of operation
    this.returnPeriodFloodLevel = this.historicalMaxWaterLevel * 1.15; // 15% safety factor
  }
  
  // Calculate probable maximum flood (PMF)
  if (this.historicalPeakInflow) {
    // Simplified: PMF is typically 1.5-2x historical peak
    this.probableMaximumFlood = this.historicalPeakInflow * 1.75;
  }
  
  // Calculate flood recurrence interval
  if (this.historicalFloodEvents && this.yearsInOperation && this.historicalFloodEvents > 0) {
    this.floodRecurrenceInterval = this.yearsInOperation / this.historicalFloodEvents;
  }
  
  // Calculate anomaly detection score (simplified)
  if (this.historicalFailureIncidents !== null && this.historicalFailureIncidents !== undefined && this.yearsInOperation) {
    const failureRate = this.historicalFailureIncidents / this.yearsInOperation;
    this.anomalyDetectionScore = Math.min(failureRate * 100, 100);
  }
  
  next();
});

export default mongoose.model("HistoricalRisk", historicalRiskSchema);
