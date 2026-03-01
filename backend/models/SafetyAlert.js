import mongoose from "mongoose";

const SafetyAlertSchema = new mongoose.Schema(
  {
    damId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Dam",
      required: true,
      unique: true,
    },

    // ===== INPUT FIELDS (Base Data) =====
    // Current State
    currentWaterLevel: { type: Number, default: 0 }, // m
    maxCapacity: { type: Number, default: 0 }, // m³
    currentStorage: { type: Number, default: 0 }, // m³
    inflowRate: { type: Number, default: 0 }, // m³/s
    outflowRate: { type: Number, default: 0 }, // m³/s
    safeDischargeLimit: { type: Number, default: 0 }, // m³/s
    
    // Predictions
    forecastRainfall: { type: Number, default: 0 }, // mm
    rainfallThreshold: { type: Number, default: 50 }, // mm
    
    // Structural
    damStressLevel: { type: Number, default: 0 }, // 0-1 scale
    structuralHealthScore: { type: Number, default: 100 }, // 0-100
    
    // Gate Operations
    gateOperationStatus: { 
      type: String, 
      enum: ["Normal", "Partial", "Emergency", "Closed"],
      default: "Normal" 
    },
    
    // Downstream Info
    downstreamDistance: { type: Number, default: 0 }, // km
    riverVelocity: { type: Number, default: 0 }, // m/s
    affectedDistricts: { type: String, default: "" }, // comma-separated
    affectedVillagesList: { type: String, default: "" }, // comma-separated
    expectedAffectedPopulation: { type: Number, default: 0 },
    
    // Safety Routes
    safeZones: { type: String, default: "" },
    evacuationRoutes: { type: String, default: "" },
    safeRouteMap: { type: String, default: "" }, // URL
    
    // Risk Assessment
    bridgeSubmergenceRisk: { type: Number, default: 0 }, // 0-100
    economicLossBase: { type: Number, default: 0 }, // Base value for calculation
    
    // Water Release Info
    waterReleaseTime: { type: String, default: "" },
    safetyInstructions: { type: String, default: "" },

    // ===== CALCULATED FIELDS (Derived) =====
    // Controller Dashboard
    predictedWaterLevel_1hr: { type: Number, default: 0 }, // m
    predictedWaterLevel_6hr: { type: Number, default: 0 }, // m
    netInflowRate: { type: Number, default: 0 }, // m³/s
    availableStorage: { type: Number, default: 0 }, // m³
    timeToFullCapacity: { type: Number, default: 0 }, // hours
    requiredSpillwayIncrease: { type: Number, default: 0 }, // m³/s
    downstreamFloodArrivalTime: { type: Number, default: 0 }, // hours
    damStressIndex: { type: Number, default: 0 }, // 0-1
    floodRiskScore: { type: Number, default: 0 }, // 0-100
    structuralFailureProbability: { type: Number, default: 0 }, // %
    emergencyGateOperationTime: { type: Number, default: 0 }, // minutes
    
    // Government Dashboard
    predictedFloodTime: { type: String, default: "" },
    evacuationLeadTime: { type: Number, default: 0 }, // hours
    economicLossEstimate: { type: Number, default: 0 }, // currency
    emergencyLevel: { 
      type: String, 
      enum: ["Normal", "Watch", "Warning", "Critical", "Disaster"],
      default: "Normal" 
    },
    
    // Rescue Team
    predictedWaterDepth: { type: Number, default: 0 }, // m
    rescueWindowTime: { type: Number, default: 0 }, // hours
    
    // Public Alert
    alertLevel: { 
      type: String, 
      enum: ["Safe", "Be Alert", "Move To Safer Area", "Evacuate Immediately"],
      default: "Safe" 
    },
    estimatedTimeOfFlood: { type: String, default: "" },
    
    // Alert Types (Boolean flags for active alerts)
    alerts: {
      // Controller Alerts
      criticalGateActionRequired: { type: Boolean, default: false },
      immediateSpillwayAdjustment: { type: Boolean, default: false },
      upstreamSurgeIncoming: { type: Boolean, default: false },
      heavyRainfallPredicted: { type: Boolean, default: false },
      structuralStressWarning: { type: Boolean, default: false },
      
      // Government Alerts
      floodWatchAdvisory: { type: Boolean, default: false },
      districtFloodWarning: { type: Boolean, default: false },
      evacuationRecommended: { type: Boolean, default: false },
      nationalDisasterAlert: { type: Boolean, default: false },
      
      // Rescue Team Alerts
      prepareDeployment: { type: Boolean, default: false },
      immediateMobilization: { type: Boolean, default: false },
      roadCutoffExpected: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

// Pre-save hook for calculations
SafetyAlertSchema.pre("save", function (next) {
  try {
    // Net Inflow Rate
    this.netInflowRate = this.inflowRate - this.outflowRate;
    
    // Available Storage
    this.availableStorage = Math.max(0, this.maxCapacity - this.currentStorage);
    
    // Time to Full Capacity (hours)
    if (this.netInflowRate > 0 && this.availableStorage > 0) {
      this.timeToFullCapacity = this.availableStorage / (this.netInflowRate * 3600);
    } else {
      this.timeToFullCapacity = 999; // Very large number if not filling
    }
    
    // Predicted Water Levels
    const waterLevelIncreaseRate = this.netInflowRate * 0.001; // Simplified
    this.predictedWaterLevel_1hr = this.currentWaterLevel + (waterLevelIncreaseRate * 1);
    this.predictedWaterLevel_6hr = this.currentWaterLevel + (waterLevelIncreaseRate * 6);
    
    // Required Spillway Increase
    if (this.netInflowRate > 0 && this.timeToFullCapacity < 6) {
      this.requiredSpillwayIncrease = this.netInflowRate * 0.5;
    } else {
      this.requiredSpillwayIncrease = 0;
    }
    
    // Downstream Flood Arrival Time (hours)
    if (this.downstreamDistance > 0 && this.riverVelocity > 0) {
      this.downstreamFloodArrivalTime = (this.downstreamDistance * 1000) / (this.riverVelocity * 3600);
    } else {
      this.downstreamFloodArrivalTime = 0;
    }
    
    // Dam Stress Index (0-1)
    this.damStressIndex = this.damStressLevel;
    
    // Flood Risk Score (0-100)
    const storageRisk = (this.currentStorage / this.maxCapacity) * 40;
    const inflowRisk = Math.min((this.netInflowRate / 1000) * 30, 30);
    const rainfallRisk = Math.min((this.forecastRainfall / 100) * 30, 30);
    this.floodRiskScore = Math.min(100, storageRisk + inflowRisk + rainfallRisk);
    
    // Structural Failure Probability (%)
    this.structuralFailureProbability = Math.min(100, (1 - this.structuralHealthScore / 100) * 100 * (1 + this.damStressIndex));
    
    // Emergency Gate Operation Time (minutes)
    this.emergencyGateOperationTime = this.timeToFullCapacity < 2 ? 15 : 30;
    
    // Evacuation Lead Time (hours)
    this.evacuationLeadTime = Math.max(0, this.downstreamFloodArrivalTime - 2);
    
    // Economic Loss Estimate
    this.economicLossEstimate = this.economicLossBase * (this.floodRiskScore / 100) * (this.expectedAffectedPopulation / 1000);
    
    // Predicted Water Depth (m)
    this.predictedWaterDepth = Math.max(0, this.predictedWaterLevel_6hr - this.currentWaterLevel);
    
    // Rescue Window Time (hours)
    this.rescueWindowTime = Math.max(0, this.downstreamFloodArrivalTime - 1);
    
    // Emergency Level
    if (this.floodRiskScore >= 90) {
      this.emergencyLevel = "Disaster";
    } else if (this.floodRiskScore >= 70) {
      this.emergencyLevel = "Critical";
    } else if (this.floodRiskScore >= 50) {
      this.emergencyLevel = "Warning";
    } else if (this.floodRiskScore >= 30) {
      this.emergencyLevel = "Watch";
    } else {
      this.emergencyLevel = "Normal";
    }
    
    // Alert Level (Public)
    if (this.floodRiskScore >= 80) {
      this.alertLevel = "Evacuate Immediately";
    } else if (this.floodRiskScore >= 60) {
      this.alertLevel = "Move To Safer Area";
    } else if (this.floodRiskScore >= 30) {
      this.alertLevel = "Be Alert";
    } else {
      this.alertLevel = "Safe";
    }
    
    // Predicted Flood Time
    if (this.downstreamFloodArrivalTime > 0) {
      const now = new Date();
      const floodTime = new Date(now.getTime() + this.downstreamFloodArrivalTime * 60 * 60 * 1000);
      this.predictedFloodTime = floodTime.toLocaleString();
      this.estimatedTimeOfFlood = floodTime.toLocaleString();
    }
    
    // ===== ALERT FLAGS =====
    // Controller Alerts
    this.alerts.criticalGateActionRequired = this.timeToFullCapacity < 2;
    this.alerts.immediateSpillwayAdjustment = this.requiredSpillwayIncrease > this.safeDischargeLimit;
    this.alerts.heavyRainfallPredicted = this.forecastRainfall > this.rainfallThreshold;
    this.alerts.structuralStressWarning = this.damStressIndex > 0.9;
    
    // Government Alerts
    this.alerts.floodWatchAdvisory = this.floodRiskScore >= 30 && this.floodRiskScore < 50;
    this.alerts.districtFloodWarning = this.floodRiskScore >= 50 && this.floodRiskScore < 70;
    this.alerts.evacuationRecommended = this.floodRiskScore >= 70 && this.floodRiskScore < 90;
    this.alerts.nationalDisasterAlert = this.floodRiskScore >= 90;
    
    // Rescue Team Alerts
    this.alerts.prepareDeployment = this.floodRiskScore >= 40 && this.floodRiskScore < 60;
    this.alerts.immediateMobilization = this.floodRiskScore >= 60;
    this.alerts.roadCutoffExpected = this.bridgeSubmergenceRisk > 70;
    
    next();
  } catch (error) {
    next(error);
  }
});

export default mongoose.model("SafetyAlert", SafetyAlertSchema);
