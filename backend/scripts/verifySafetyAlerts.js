import mongoose from "mongoose";
import dotenv from "dotenv";
import SafetyAlert from "../models/SafetyAlert.js";
import Dam from "../models/Dam.js";

dotenv.config();

async function verifySafetyAlerts() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB\n");

    // Count total safety alerts
    const totalAlerts = await SafetyAlert.countDocuments();
    console.log(`Total Safety Alerts: ${totalAlerts}`);

    // Get alert distribution
    const criticalAlerts = await SafetyAlert.countDocuments({ floodRiskScore: { $gte: 70 } });
    const warningAlerts = await SafetyAlert.countDocuments({ floodRiskScore: { $gte: 50, $lt: 70 } });
    const watchAlerts = await SafetyAlert.countDocuments({ floodRiskScore: { $gte: 30, $lt: 50 } });
    const normalAlerts = await SafetyAlert.countDocuments({ floodRiskScore: { $lt: 30 } });

    console.log("\nAlert Distribution:");
    console.log(`🔴 Critical/Disaster (≥70): ${criticalAlerts}`);
    console.log(`🟠 Warning (50-70): ${warningAlerts}`);
    console.log(`🟡 Watch (30-50): ${watchAlerts}`);
    console.log(`🟢 Normal (<30): ${normalAlerts}`);

    // Get emergency level distribution
    const disaster = await SafetyAlert.countDocuments({ emergencyLevel: "Disaster" });
    const critical = await SafetyAlert.countDocuments({ emergencyLevel: "Critical" });
    const warning = await SafetyAlert.countDocuments({ emergencyLevel: "Warning" });
    const watch = await SafetyAlert.countDocuments({ emergencyLevel: "Watch" });
    const normal = await SafetyAlert.countDocuments({ emergencyLevel: "Normal" });

    console.log("\nEmergency Level Distribution:");
    console.log(`Disaster: ${disaster}`);
    console.log(`Critical: ${critical}`);
    console.log(`Warning: ${warning}`);
    console.log(`Watch: ${watch}`);
    console.log(`Normal: ${normal}`);

    // Show sample alerts from each category
    console.log("\n" + "=".repeat(60));
    console.log("SAMPLE ALERTS");
    console.log("=".repeat(60));

    const sampleAlerts = await SafetyAlert.find({})
      .populate("damId", "name state")
      .limit(5)
      .sort({ floodRiskScore: -1 });

    sampleAlerts.forEach((alert, idx) => {
      console.log(`\n${idx + 1}. ${alert.damId.name} (${alert.damId.state})`);
      console.log(`   Flood Risk Score: ${alert.floodRiskScore.toFixed(2)}`);
      console.log(`   Emergency Level: ${alert.emergencyLevel}`);
      console.log(`   Alert Level: ${alert.alertLevel}`);
      console.log(`   Time to Full Capacity: ${alert.timeToFullCapacity.toFixed(2)} hours`);
      console.log(`   Evacuation Lead Time: ${alert.evacuationLeadTime.toFixed(2)} hours`);
      console.log(`   Affected Population: ${alert.expectedAffectedPopulation.toLocaleString()}`);
      
      // Show active alerts
      const activeAlerts = [];
      if (alert.alerts.criticalGateActionRequired) activeAlerts.push("Critical Gate Action");
      if (alert.alerts.immediateSpillwayAdjustment) activeAlerts.push("Spillway Adjustment");
      if (alert.alerts.heavyRainfallPredicted) activeAlerts.push("Heavy Rainfall");
      if (alert.alerts.structuralStressWarning) activeAlerts.push("Structural Stress");
      if (alert.alerts.evacuationRecommended) activeAlerts.push("Evacuation Recommended");
      if (alert.alerts.nationalDisasterAlert) activeAlerts.push("National Disaster");
      
      if (activeAlerts.length > 0) {
        console.log(`   Active Alerts: ${activeAlerts.join(", ")}`);
      }
    });

    console.log("\n" + "=".repeat(60));
    console.log("VERIFICATION COMPLETE");
    console.log("=".repeat(60));

    process.exit(0);
  } catch (error) {
    console.error("Error verifying safety alerts:", error);
    process.exit(1);
  }
}

verifySafetyAlerts();
