import mongoose from "mongoose";
import { calculateDamHealthScore } from "../utils/calculationEngine.js";

const structuralHealthSchema = new mongoose.Schema({
  dam: { type: mongoose.Schema.Types.ObjectId, ref: "Dam", required: true, unique: true },
  
  // Input fields
  structuralStressIndex: Number, // 0-10
  seepageRate: Number, // L/min
  vibrationLevel: Number, // mm/s
  crackSensorStatus: { type: String, enum: ["Normal", "Warning", "Critical", "Offline"] },
  pressureSensorStatus: { type: String, enum: ["Normal", "Warning", "Critical", "Offline"] },
  foundationUpliftPressure: Number, // kPa
  lastInspectionDate: Date,
  maintenanceRequiredFlag: { type: String, enum: ["No", "Yes - Routine", "Yes - Urgent", "Yes - Critical"] },
  designStressLimit: Number, // MPa
  currentStressLevel: Number, // MPa
  
  // Calculated fields
  damHealthScore: Number, // 0-100 - calculated
  structuralFailureProbability: Number, // % - calculated
  maintenanceUrgencyLevel: { type: String, enum: ["Low", "Medium", "High", "Critical"] }, // calculated
  
}, { timestamps: true });

// Pre-save hook to calculate derived fields
structuralHealthSchema.pre('save', function(next) {
  // Calculate dam health score
  if (this.structuralStressIndex !== null && this.structuralStressIndex !== undefined) {
    this.damHealthScore = calculateDamHealthScore(
      this.structuralStressIndex,
      this.seepageRate,
      this.vibrationLevel,
      this.crackSensorStatus,
      this.foundationUpliftPressure
    );
  }
  
  // Calculate structural failure probability
  if (this.currentStressLevel && this.designStressLimit && this.designStressLimit > 0) {
    const stressRatio = this.currentStressLevel / this.designStressLimit;
    this.structuralFailureProbability = Math.min(stressRatio * 100, 100);
  }
  
  // Calculate maintenance urgency level
  if (this.damHealthScore !== null && this.damHealthScore !== undefined) {
    const daysSinceInspection = this.lastInspectionDate 
      ? Math.floor((Date.now() - this.lastInspectionDate.getTime()) / (1000 * 60 * 60 * 24))
      : 999;
    
    if (this.damHealthScore < 50 || daysSinceInspection > 180) {
      this.maintenanceUrgencyLevel = "Critical";
    } else if (this.damHealthScore < 70 || daysSinceInspection > 90) {
      this.maintenanceUrgencyLevel = "High";
    } else if (this.damHealthScore < 85 || daysSinceInspection > 60) {
      this.maintenanceUrgencyLevel = "Medium";
    } else {
      this.maintenanceUrgencyLevel = "Low";
    }
  }
  
  next();
});

export default mongoose.model("StructuralHealth", structuralHealthSchema);
