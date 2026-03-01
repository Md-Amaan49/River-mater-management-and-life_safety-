import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.js";
import Dam from "../models/Dam.js";
import SafetyAlert from "../models/SafetyAlert.js";

dotenv.config();

const testSidebarAlerts = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Find a user (you can replace with your actual user email)
    const user = await User.findOne().populate("savedDams");
    
    if (!user) {
      console.log("❌ No users found in database");
      process.exit(1);
    }

    console.log(`\n📊 User: ${user.email}`);
    console.log(`📊 Saved Dams Count: ${user.savedDams.length}`);

    if (user.savedDams.length === 0) {
      console.log("\n⚠️ User has no saved dams!");
      console.log("💡 To fix this, save some dams from the UI first");
      
      // Show available dams
      const allDams = await Dam.find().limit(5);
      console.log("\n📋 Available dams to save:");
      allDams.forEach(dam => {
        console.log(`  - ${dam.name} (${dam.state})`);
      });
      
      process.exit(0);
    }

    console.log("\n📋 Saved Dams:");
    user.savedDams.forEach(dam => {
      console.log(`  - ${dam.name} (${dam.state})`);
    });

    const savedDamIds = user.savedDams.map(dam => dam._id);

    // Check for safety alerts
    const safetyAlerts = await SafetyAlert.find({ damId: { $in: savedDamIds } })
      .populate("damId", "name state river");

    console.log(`\n🚨 Safety Alerts Found: ${safetyAlerts.length}`);

    if (safetyAlerts.length === 0) {
      console.log("\n⚠️ No safety alerts found for saved dams!");
      console.log("💡 Run: npm run populate-safety-alerts");
      
      // Check if safety alerts exist at all
      const totalAlerts = await SafetyAlert.countDocuments();
      console.log(`\n📊 Total Safety Alerts in DB: ${totalAlerts}`);
      
      if (totalAlerts > 0) {
        console.log("\n💡 Safety alerts exist but not for your saved dams.");
        console.log("   Try saving different dams or run the populate script again.");
      }
    } else {
      console.log("\n✅ Safety Alerts Details:");
      safetyAlerts.forEach(alert => {
        console.log(`\n  Dam: ${alert.damId.name}`);
        console.log(`  Alert Level: ${alert.alertLevel}`);
        console.log(`  Emergency Level: ${alert.emergencyLevel}`);
        console.log(`  Flood Risk Score: ${alert.floodRiskScore}`);
        console.log(`  Affected Districts: ${alert.affectedDistricts || "N/A"}`);
      });

      // Count high-risk alerts
      const highRiskAlerts = safetyAlerts.filter(alert => 
        alert.floodRiskScore >= 50 || 
        alert.emergencyLevel === "Critical" || 
        alert.emergencyLevel === "Disaster" ||
        alert.alertLevel === "Evacuate Immediately" ||
        alert.alertLevel === "Move To Safer Area"
      );

      console.log(`\n⚠️ High Risk Alerts: ${highRiskAlerts.length}`);
    }

    await mongoose.connection.close();
    console.log("\n✅ Test completed");
    process.exit(0);

  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
};

testSidebarAlerts();
