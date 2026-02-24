import mongoose from "mongoose";
import dotenv from "dotenv";
import Dam from "../models/Dam.js";
import DamStatus from "../models/DamStatus.js";

dotenv.config();

// Function to calculate realistic velocity based on flow rate
// Higher flow rates typically mean higher velocities
const calculateVelocity = (flowRate) => {
  if (flowRate === 0) return 0;
  
  // Typical river velocities range from 0.5 to 5 m/s
  // We'll use a formula: velocity = base + (flowRate / scaleFactor)
  // This gives realistic velocities that scale with flow
  
  if (flowRate < 50) {
    return 0.8 + (flowRate / 100); // Low flow: 0.8 - 1.3 m/s
  } else if (flowRate < 100) {
    return 1.2 + (flowRate / 150); // Medium flow: 1.2 - 1.9 m/s
  } else if (flowRate < 200) {
    return 1.8 + (flowRate / 200); // High flow: 1.8 - 2.8 m/s
  } else {
    return 2.5 + (flowRate / 300); // Very high flow: 2.5 - 3.5 m/s
  }
};

const populateVelocityData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Get all dam statuses
    const allStatuses = await DamStatus.find().populate('dam', 'name');
    
    console.log(`\n📊 Processing ${allStatuses.length} dam statuses...\n`);

    let updatedCount = 0;
    let skippedCount = 0;

    for (const status of allStatuses) {
      const damName = status.dam?.name || 'Unknown Dam';
      
      // Skip if flow data is missing
      if (status.inflowFromUpstreamDam === undefined || status.outflowToDownstreamDam === undefined) {
        console.log(`⚠️  ${damName}: SKIPPED - Missing flow data`);
        skippedCount++;
        continue;
      }
      
      // Calculate upstream velocity
      let upstreamVelocity = 0;
      if (status.inflowFromUpstreamDam === 0) {
        upstreamVelocity = 0; // Source dam - no upstream flow
        console.log(`📍 ${damName}: SOURCE DAM`);
      } else {
        upstreamVelocity = calculateVelocity(status.inflowFromUpstreamDam);
        console.log(`📍 ${damName}: Upstream flow ${status.inflowFromUpstreamDam} m³/s`);
      }
      
      // Calculate downstream velocity
      let downstreamVelocity = 0;
      if (status.outflowToDownstreamDam === 0) {
        downstreamVelocity = 0; // Terminal dam - no downstream flow
        console.log(`   Terminal dam - no downstream`);
      } else {
        downstreamVelocity = calculateVelocity(status.outflowToDownstreamDam);
        console.log(`   Downstream flow ${status.outflowToDownstreamDam} m³/s`);
      }
      
      // Update the status with velocity data
      status.upstreamRiverVelocity = parseFloat(upstreamVelocity.toFixed(2));
      status.downstreamRiverVelocity = parseFloat(downstreamVelocity.toFixed(2));
      
      await status.save();
      
      console.log(`✅ Updated velocities:`);
      console.log(`   Upstream velocity: ${status.upstreamRiverVelocity} m/s`);
      console.log(`   Downstream velocity: ${status.downstreamRiverVelocity} m/s\n`);
      
      updatedCount++;
    }

    console.log("\n" + "=".repeat(60));
    console.log("📊 SUMMARY");
    console.log("=".repeat(60));
    console.log(`✅ Dam statuses updated: ${updatedCount}`);
    console.log(`⏭️  Skipped (no status): ${skippedCount}`);
    console.log(`📝 Total processed: ${allStatuses.length}`);
    console.log("=".repeat(60));

    // Show some statistics
    const sourceCount = allStatuses.filter(s => s.inflowFromUpstreamDam === 0).length;
    const terminalCount = allStatuses.filter(s => s.outflowToDownstreamDam === 0).length;
    const intermediateCount = allStatuses.length - sourceCount - terminalCount;
    
    console.log("\n📈 VELOCITY STATISTICS");
    console.log("=".repeat(60));
    console.log(`🔵 Source dams (upstream velocity = 0): ${sourceCount}`);
    console.log(`🔴 Terminal dams (downstream velocity = 0): ${terminalCount}`);
    console.log(`🟢 Intermediate dams (both velocities > 0): ${intermediateCount}`);
    console.log("=".repeat(60));

    await mongoose.connection.close();
    console.log("\n✅ Database connection closed");
    console.log("✅ Velocity data population complete!");
    
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
};

populateVelocityData();
