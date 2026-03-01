import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.js";
import Dam from "../models/Dam.js";
import SafetyAlert from "../models/SafetyAlert.js";
import DamStatus from "../models/DamStatus.js";

dotenv.config();

const testSidebarAlertsDetailed = async () => {
  try {
    console.log("🔍 DETAILED SIDEBAR ALERTS TEST");
    console.log("=".repeat(60));
    
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB\n");

    // Step 1: Check Users
    console.log("📊 STEP 1: Checking Users");
    console.log("-".repeat(60));
    const users = await User.find().populate("savedDams");
    console.log(`Total Users: ${users.length}`);
    
    if (users.length === 0) {
      console.log("❌ No users found! Please register a user first.");
      process.exit(1);
    }

    const userWithSavedDams = users.find(u => u.savedDams && u.savedDams.length > 0);
    
    if (!userWithSavedDams) {
      console.log("\n⚠️ No users have saved dams!");
      console.log("💡 To fix: Login to the app and save some dams\n");
      
      // Show first user
      const firstUser = users[0];
      console.log(`First User: ${firstUser.email}`);
      console.log(`Saved Dams: ${firstUser.savedDams.length}`);
      
      // Show available dams
      const allDams = await Dam.find().limit(10);
      console.log(`\n📋 Available Dams (first 10):`);
      allDams.forEach((dam, idx) => {
        console.log(`  ${idx + 1}. ${dam.name} (${dam.state}) - ID: ${dam._id}`);
      });
      
      process.exit(0);
    }

    console.log(`\n✅ Found user with saved dams: ${userWithSavedDams.email}`);
    console.log(`   Saved Dams Count: ${userWithSavedDams.savedDams.length}`);
    console.log(`\n   Saved Dams List:`);
    userWithSavedDams.savedDams.forEach((dam, idx) => {
      console.log(`   ${idx + 1}. ${dam.name} (${dam.state}) - ID: ${dam._id}`);
    });

    // Step 2: Check Safety Alerts
    console.log("\n📊 STEP 2: Checking Safety Alerts");
    console.log("-".repeat(60));
    
    const savedDamIds = userWithSavedDams.savedDams.map(dam => dam._id);
    
    const safetyAlerts = await SafetyAlert.find({ damId: { $in: savedDamIds } })
      .populate("damId", "name state river");
    
    console.log(`Safety Alerts for Saved Dams: ${safetyAlerts.length}`);
    
    if (safetyAlerts.length === 0) {
      console.log("\n❌ No safety alerts found for saved dams!");
      
      // Check total alerts
      const totalAlerts = await SafetyAlert.countDocuments();
      console.log(`Total Safety Alerts in DB: ${totalAlerts}`);
      
      if (totalAlerts === 0) {
        console.log("\n💡 No safety alerts in database at all!");
        console.log("   Run: node backend/scripts/populateSafetyAlerts.js");
      } else {
        console.log("\n💡 Safety alerts exist but not for your saved dams.");
        console.log("   Either:");
        console.log("   1. Save different dams from the UI");
        console.log("   2. Run: node backend/scripts/populateSafetyAlerts.js");
      }
      
      process.exit(0);
    }

    // Step 3: Check DamStatus
    console.log("\n📊 STEP 3: Checking DamStatus (Real-time Water Level)");
    console.log("-".repeat(60));
    
    const damStatusCount = await DamStatus.countDocuments({ dam: { $in: savedDamIds } });
    console.log(`DamStatus records for Saved Dams: ${damStatusCount}`);

    // Step 4: Detailed Alert Analysis
    console.log("\n📊 STEP 4: Detailed Alert Analysis");
    console.log("-".repeat(60));
    
    for (const alert of safetyAlerts) {
      console.log(`\n🚨 Alert for: ${alert.damId.name}`);
      console.log(`   State: ${alert.damId.state} | River: ${alert.damId.river}`);
      console.log(`   
   ===== 5 KEY FIELDS =====`);
      console.log(`   1. Emergency Level: ${alert.emergencyLevel || "Normal"}`);
      console.log(`   2. Flood Risk Score: ${alert.floodRiskScore || 0}/100`);
      console.log(`   3. Predicted Flood Time: ${alert.predictedFloodTime || "Not predicted"}`);
      console.log(`   4. Evacuation Lead Time: ${alert.evacuationLeadTime || 0} hours`);
      console.log(`   5. Current Water Level: ${alert.currentWaterLevel || 0} m`);
      
      // Check DamStatus for this dam
      const damStatus = await DamStatus.findOne({ dam: alert.damId._id });
      if (damStatus) {
        console.log(`   
   Real-time Water Level (from DamStatus): ${damStatus.currentWaterLevel} ${damStatus.levelUnit || "m"}`);
      } else {
        console.log(`   ⚠️ No DamStatus found for this dam`);
      }
      
      console.log(`   
   Additional Info:`);
      console.log(`   - Alert Level: ${alert.alertLevel || "Safe"}`);
      console.log(`   - Affected Districts: ${alert.affectedDistricts || "N/A"}`);
      console.log(`   - Safety Instructions: ${alert.safetyInstructions ? "Yes" : "No"}`);
    }

    // Step 5: Count High-Risk Alerts
    console.log("\n📊 STEP 5: Risk Analysis");
    console.log("-".repeat(60));
    
    const highRiskAlerts = safetyAlerts.filter(alert => 
      alert.floodRiskScore >= 50 || 
      alert.emergencyLevel === "Critical" || 
      alert.emergencyLevel === "Disaster" ||
      alert.alertLevel === "Evacuate Immediately" ||
      alert.alertLevel === "Move To Safer Area"
    );
    
    console.log(`Total Alerts: ${safetyAlerts.length}`);
    console.log(`High Risk Alerts: ${highRiskAlerts.length}`);
    
    // Distribution
    const disaster = safetyAlerts.filter(a => a.emergencyLevel === "Disaster").length;
    const critical = safetyAlerts.filter(a => a.emergencyLevel === "Critical").length;
    const warning = safetyAlerts.filter(a => a.emergencyLevel === "Warning").length;
    const watch = safetyAlerts.filter(a => a.emergencyLevel === "Watch").length;
    const normal = safetyAlerts.filter(a => a.emergencyLevel === "Normal").length;
    
    console.log(`\nEmergency Level Distribution:`);
    console.log(`  🔴 Disaster: ${disaster}`);
    console.log(`  🟠 Critical: ${critical}`);
    console.log(`  🟡 Warning: ${warning}`);
    console.log(`  🔵 Watch: ${watch}`);
    console.log(`  🟢 Normal: ${normal}`);

    // Step 6: Simulate API Response
    console.log("\n📊 STEP 6: Simulated API Response");
    console.log("-".repeat(60));
    
    const formattedAlerts = safetyAlerts.map(alert => {
      const damStatus = null; // Would be fetched in real API
      const currentWaterLevel = damStatus?.currentWaterLevel ?? alert.currentWaterLevel ?? 0;
      const levelUnit = damStatus?.levelUnit ?? "m";
      
      return {
        _id: alert._id,
        dam: {
          _id: alert.damId._id,
          name: alert.damId.name,
          state: alert.damId.state,
          river: alert.damId.river
        },
        emergencyLevel: alert.emergencyLevel || "Normal",
        floodRiskScore: alert.floodRiskScore ?? 0,
        predictedFloodTime: alert.predictedFloodTime || "Not predicted",
        evacuationLeadTime: alert.evacuationLeadTime ?? 0,
        currentWaterLevel: currentWaterLevel,
        levelUnit: levelUnit,
        alertLevel: alert.alertLevel || "Safe",
        affectedDistricts: alert.affectedDistricts || "",
        safetyInstructions: alert.safetyInstructions || "",
      };
    });
    
    console.log(`\nFormatted Response:`);
    console.log(JSON.stringify({
      total: safetyAlerts.length,
      highRisk: highRiskAlerts.length,
      hasHighRisk: highRiskAlerts.length > 0,
      alerts: formattedAlerts.slice(0, 2) // Show first 2
    }, null, 2));

    console.log("\n" + "=".repeat(60));
    console.log("✅ TEST COMPLETE - All data is properly configured!");
    console.log("=".repeat(60));
    console.log("\n💡 If alerts are not showing in the UI:");
    console.log("   1. Make sure you're logged in");
    console.log("   2. Check browser console for errors");
    console.log("   3. Verify API_BASE URL in SidePanel.jsx");
    console.log("   4. Check network tab for API call to /api/sidebar/alerts");

    await mongoose.connection.close();
    process.exit(0);

  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
};

testSidebarAlertsDetailed();
