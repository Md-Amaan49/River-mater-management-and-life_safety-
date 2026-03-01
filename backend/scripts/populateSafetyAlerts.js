import mongoose from "mongoose";
import dotenv from "dotenv";
import Dam from "../models/Dam.js";
import SafetyAlert from "../models/SafetyAlert.js";

dotenv.config();

const generateSafetyAlertData = (dam, index) => {
  // Create varied risk levels across dams
  const riskLevel = index % 5; // 0-4 for different risk scenarios
  
  // Base values that vary by risk level
  const baseInflowRate = [50, 150, 300, 500, 800][riskLevel];
  const baseOutflowRate = [45, 120, 250, 400, 600][riskLevel];
  const baseRainfall = [10, 30, 60, 100, 150][riskLevel];
  const baseStress = [0.2, 0.4, 0.6, 0.8, 0.95][riskLevel];
  
  // Districts for different states
  const districts = {
    "Maharashtra": ["Pune", "Nashik", "Ahmednagar", "Satara"],
    "Gujarat": ["Ahmedabad", "Vadodara", "Surat", "Rajkot"],
    "Karnataka": ["Bangalore", "Mysore", "Belgaum", "Hubli"],
    "Madhya Pradesh": ["Bhopal", "Indore", "Jabalpur", "Gwalior"],
    "Rajasthan": ["Jaipur", "Jodhpur", "Udaipur", "Kota"],
    "Andhra Pradesh": ["Hyderabad", "Vijayawada", "Visakhapatnam", "Guntur"],
    "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli"],
    "Telangana": ["Hyderabad", "Warangal", "Nizamabad", "Karimnagar"],
    "Uttar Pradesh": ["Lucknow", "Kanpur", "Agra", "Varanasi"],
    "Kerala": ["Thiruvananthapuram", "Kochi", "Kozhikode", "Thrissur"]
  };
  
  const stateDistricts = districts[dam.state] || ["District A", "District B"];
  const affectedDistrict = stateDistricts[index % stateDistricts.length];
  
  // Villages list
  const villages = [
    "Village A, Village B, Village C",
    "Riverside Village, Hill Village, Valley Village",
    "North Village, South Village, East Village",
    "Upstream Village, Downstream Village, Central Village",
    "Green Village, Blue Village, Red Village"
  ];
  
  return {
    damId: dam._id,
    
    // Current State
    currentWaterLevel: 50 + (index * 2) % 50,
    maxCapacity: 100000 + (index * 10000),
    currentStorage: 50000 + (index * 5000) + (riskLevel * 10000),
    inflowRate: baseInflowRate + (Math.random() * 50),
    outflowRate: baseOutflowRate + (Math.random() * 40),
    safeDischargeLimit: 500 + (index * 10),
    
    // Weather
    forecastRainfall: baseRainfall + (Math.random() * 20),
    rainfallThreshold: 50,
    
    // Structural
    damStressLevel: baseStress + (Math.random() * 0.05),
    structuralHealthScore: 100 - (riskLevel * 15) - (Math.random() * 10),
    gateOperationStatus: ["Normal", "Normal", "Partial", "Emergency", "Emergency"][riskLevel],
    
    // Downstream
    downstreamDistance: 10 + (index * 2) % 50,
    riverVelocity: 2 + (Math.random() * 3),
    affectedDistricts: affectedDistrict,
    affectedVillagesList: villages[index % villages.length],
    expectedAffectedPopulation: 5000 + (index * 1000) + (riskLevel * 5000),
    
    // Safety Routes
    safeZones: `${affectedDistrict} Community Center, ${affectedDistrict} School, ${affectedDistrict} Stadium`,
    evacuationRoutes: `Highway ${index + 1}, State Road ${index + 10}, Village Road ${index + 20}`,
    safeRouteMap: `https://maps.example.com/dam-${dam._id}`,
    
    // Risk
    bridgeSubmergenceRisk: riskLevel * 20 + (Math.random() * 10),
    economicLossBase: 1000000 + (index * 100000),
    
    // Instructions
    waterReleaseTime: riskLevel > 2 ? new Date(Date.now() + 3600000 * (6 - riskLevel)).toLocaleString() : "No release scheduled",
    safetyInstructions: [
      "Stay informed through official channels. Keep emergency supplies ready.",
      "Monitor water levels regularly. Prepare evacuation kit with essentials.",
      "Be ready to evacuate on short notice. Move valuables to higher ground.",
      "Evacuate immediately to designated safe zones. Follow official instructions.",
      "Emergency evacuation in progress. Move to high ground immediately. Do not return until all-clear is given."
    ][riskLevel]
  };
};

async function populateSafetyAlerts() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // Get all dams
    const dams = await Dam.find({}).sort({ name: 1 });
    console.log(`Found ${dams.length} dams`);

    if (dams.length === 0) {
      console.log("No dams found in database. Please populate dams first.");
      process.exit(1);
    }

    // Clear existing safety alerts
    await SafetyAlert.deleteMany({});
    console.log("Cleared existing safety alert data");

    let successCount = 0;
    let errorCount = 0;

    // Create safety alert data for each dam
    for (let i = 0; i < dams.length; i++) {
      const dam = dams[i];
      try {
        const safetyData = generateSafetyAlertData(dam, i);
        const safetyAlert = new SafetyAlert(safetyData);
        await safetyAlert.save(); // This triggers the pre-save hook for calculations
        
        successCount++;
        console.log(`✓ [${i + 1}/${dams.length}] Created safety alert for: ${dam.name}`);
      } catch (error) {
        errorCount++;
        console.error(`✗ [${i + 1}/${dams.length}] Error for ${dam.name}:`, error.message);
      }
    }

    console.log("\n" + "=".repeat(60));
    console.log("POPULATION COMPLETE");
    console.log("=".repeat(60));
    console.log(`Total Dams: ${dams.length}`);
    console.log(`Successfully Created: ${successCount}`);
    console.log(`Errors: ${errorCount}`);
    console.log("=".repeat(60));

    // Show sample of created data
    const sampleAlerts = await SafetyAlert.find({}).limit(3).populate("damId", "name");
    console.log("\nSample Safety Alerts:");
    sampleAlerts.forEach((alert, idx) => {
      console.log(`\n${idx + 1}. ${alert.damId.name}`);
      console.log(`   Flood Risk Score: ${alert.floodRiskScore.toFixed(2)}`);
      console.log(`   Emergency Level: ${alert.emergencyLevel}`);
      console.log(`   Alert Level: ${alert.alertLevel}`);
      console.log(`   Time to Full Capacity: ${alert.timeToFullCapacity.toFixed(2)} hours`);
    });

    // Show alert statistics
    const criticalAlerts = await SafetyAlert.countDocuments({ floodRiskScore: { $gte: 70 } });
    const warningAlerts = await SafetyAlert.countDocuments({ floodRiskScore: { $gte: 50, $lt: 70 } });
    const watchAlerts = await SafetyAlert.countDocuments({ floodRiskScore: { $gte: 30, $lt: 50 } });
    const normalAlerts = await SafetyAlert.countDocuments({ floodRiskScore: { $lt: 30 } });

    console.log("\nAlert Distribution:");
    console.log(`🔴 Critical/Disaster (≥70): ${criticalAlerts}`);
    console.log(`🟠 Warning (50-70): ${warningAlerts}`);
    console.log(`🟡 Watch (30-50): ${watchAlerts}`);
    console.log(`🟢 Normal (<30): ${normalAlerts}`);

    process.exit(0);
  } catch (error) {
    console.error("Error populating safety alerts:", error);
    process.exit(1);
  }
}

populateSafetyAlerts();
