import SafetyAlert from "../models/SafetyAlert.js";

// Get safety alert data for a specific dam
export const getSafetyAlert = async (req, res) => {
  try {
    const { damId } = req.params;
    const safetyAlert = await SafetyAlert.findOne({ damId });
    
    if (!safetyAlert) {
      return res.status(404).json({ message: "Safety alert data not found for this dam" });
    }
    
    res.json(safetyAlert);
  } catch (error) {
    console.error("Error fetching safety alert:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Create or update safety alert data
export const upsertSafetyAlert = async (req, res) => {
  try {
    const { damId } = req.params;
    const data = req.body;
    
    // Find existing or create new
    let safetyAlert = await SafetyAlert.findOne({ damId });
    
    if (safetyAlert) {
      // Update existing
      Object.assign(safetyAlert, data);
      await safetyAlert.save(); // Triggers pre-save hook for calculations
    } else {
      // Create new
      safetyAlert = new SafetyAlert({ damId, ...data });
      await safetyAlert.save();
    }
    
    res.json(safetyAlert);
  } catch (error) {
    console.error("Error upserting safety alert:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get controller dashboard data
export const getControllerDashboard = async (req, res) => {
  try {
    const { damId } = req.params;
    const safetyAlert = await SafetyAlert.findOne({ damId });
    
    if (!safetyAlert) {
      return res.status(404).json({ message: "Safety alert data not found" });
    }
    
    // Return only controller-relevant fields
    const controllerData = {
      currentWaterLevel: safetyAlert.currentWaterLevel,
      predictedWaterLevel_1hr: safetyAlert.predictedWaterLevel_1hr,
      predictedWaterLevel_6hr: safetyAlert.predictedWaterLevel_6hr,
      netInflowRate: safetyAlert.netInflowRate,
      availableStorage: safetyAlert.availableStorage,
      timeToFullCapacity: safetyAlert.timeToFullCapacity,
      requiredSpillwayIncrease: safetyAlert.requiredSpillwayIncrease,
      downstreamFloodArrivalTime: safetyAlert.downstreamFloodArrivalTime,
      damStressIndex: safetyAlert.damStressIndex,
      floodRiskScore: safetyAlert.floodRiskScore,
      structuralFailureProbability: safetyAlert.structuralFailureProbability,
      gateOperationStatus: safetyAlert.gateOperationStatus,
      emergencyGateOperationTime: safetyAlert.emergencyGateOperationTime,
      alerts: {
        criticalGateActionRequired: safetyAlert.alerts.criticalGateActionRequired,
        immediateSpillwayAdjustment: safetyAlert.alerts.immediateSpillwayAdjustment,
        upstreamSurgeIncoming: safetyAlert.alerts.upstreamSurgeIncoming,
        heavyRainfallPredicted: safetyAlert.alerts.heavyRainfallPredicted,
        structuralStressWarning: safetyAlert.alerts.structuralStressWarning,
      }
    };
    
    res.json(controllerData);
  } catch (error) {
    console.error("Error fetching controller dashboard:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get government dashboard data
export const getGovernmentDashboard = async (req, res) => {
  try {
    const { damId } = req.params;
    const safetyAlert = await SafetyAlert.findOne({ damId });
    
    if (!safetyAlert) {
      return res.status(404).json({ message: "Safety alert data not found" });
    }
    
    const governmentData = {
      floodRiskScore: safetyAlert.floodRiskScore,
      affectedDistricts: safetyAlert.affectedDistricts,
      predictedFloodTime: safetyAlert.predictedFloodTime,
      evacuationLeadTime: safetyAlert.evacuationLeadTime,
      expectedAffectedPopulation: safetyAlert.expectedAffectedPopulation,
      economicLossEstimate: safetyAlert.economicLossEstimate,
      emergencyLevel: safetyAlert.emergencyLevel,
      alerts: {
        floodWatchAdvisory: safetyAlert.alerts.floodWatchAdvisory,
        districtFloodWarning: safetyAlert.alerts.districtFloodWarning,
        evacuationRecommended: safetyAlert.alerts.evacuationRecommended,
        nationalDisasterAlert: safetyAlert.alerts.nationalDisasterAlert,
      }
    };
    
    res.json(governmentData);
  } catch (error) {
    console.error("Error fetching government dashboard:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get rescue team dashboard data
export const getRescueDashboard = async (req, res) => {
  try {
    const { damId } = req.params;
    const safetyAlert = await SafetyAlert.findOne({ damId });
    
    if (!safetyAlert) {
      return res.status(404).json({ message: "Safety alert data not found" });
    }
    
    const rescueData = {
      downstreamFloodArrivalTime: safetyAlert.downstreamFloodArrivalTime,
      predictedWaterDepth: safetyAlert.predictedWaterDepth,
      affectedVillagesList: safetyAlert.affectedVillagesList,
      safeRouteMap: safetyAlert.safeRouteMap,
      bridgeSubmergenceRisk: safetyAlert.bridgeSubmergenceRisk,
      rescueWindowTime: safetyAlert.rescueWindowTime,
      alerts: {
        prepareDeployment: safetyAlert.alerts.prepareDeployment,
        immediateMobilization: safetyAlert.alerts.immediateMobilization,
        roadCutoffExpected: safetyAlert.alerts.roadCutoffExpected,
      }
    };
    
    res.json(rescueData);
  } catch (error) {
    console.error("Error fetching rescue dashboard:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get public alert data
export const getPublicAlert = async (req, res) => {
  try {
    const { damId } = req.params;
    const safetyAlert = await SafetyAlert.findOne({ damId });
    
    if (!safetyAlert) {
      return res.status(404).json({ message: "Safety alert data not found" });
    }
    
    const publicData = {
      alertLevel: safetyAlert.alertLevel,
      estimatedTimeOfFlood: safetyAlert.estimatedTimeOfFlood,
      safeZones: safetyAlert.safeZones,
      evacuationRoutes: safetyAlert.evacuationRoutes,
      waterReleaseTime: safetyAlert.waterReleaseTime,
      safetyInstructions: safetyAlert.safetyInstructions,
    };
    
    res.json(publicData);
  } catch (error) {
    console.error("Error fetching public alert:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get all active alerts for all dams (for monitoring dashboard)
export const getAllActiveAlerts = async (req, res) => {
  try {
    const alerts = await SafetyAlert.find({
      $or: [
        { "alerts.criticalGateActionRequired": true },
        { "alerts.immediateSpillwayAdjustment": true },
        { "alerts.nationalDisasterAlert": true },
        { "alerts.evacuationRecommended": true },
        { floodRiskScore: { $gte: 50 } }
      ]
    }).populate("damId", "name state");
    
    res.json(alerts);
  } catch (error) {
    console.error("Error fetching active alerts:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
