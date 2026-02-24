import mongoose from "mongoose";
import dotenv from "dotenv";
import Dam from "../models/Dam.js";
import DamStatus from "../models/DamStatus.js";

dotenv.config();

const recalculateFields = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Get all dam statuses
    const allStatuses = await DamStatus.find().populate('dam', 'name');
    
    console.log(`\n📊 Recalculating totalInflow and spillwayDischarge for ${allStatuses.length} dams...\n`);
    console.log("=".repeat(80));

    let updatedCount = 0;

    for (const status of allStatuses) {
      const damName = status.dam?.name || 'Unknown Dam';
      
      // The pre-save hook will automatically calculate these values
      // We just need to trigger a save
      await status.save();
      
      console.log(`✅ ${damName}:`);
      console.log(`   Total Inflow: ${(status.totalInflow || 0).toFixed(2)} m³/s`);
      console.log(`   Spillway Discharge: ${(status.spillwayDischarge || 0).toFixed(2)} m³/s`);
      console.log(`   Evaporation: ${(status.evaporationRate || 0).toFixed(2)} m³/s`);
      
      const netChange = (status.totalInflow || 0) - (status.spillwayDischarge || 0) - (status.evaporationRate || 0);
      console.log(`   Net Change: ${netChange.toFixed(2)} m³/s ${netChange > 0 ? '✅ (gaining)' : '⚠️  (losing)'}\n`);
      
      updatedCount++;
    }

    console.log("=".repeat(80));
    console.log("📊 SUMMARY");
    console.log("=".repeat(80));
    console.log(`✅ Dam statuses recalculated: ${updatedCount}`);
    console.log("=".repeat(80));

    // Calculate overall statistics
    const totalInflowValues = allStatuses.map(s => s.totalInflow || 0);
    const spillwayValues = allStatuses.map(s => s.spillwayDischarge || 0);
    const evaporationValues = allStatuses.map(s => s.evaporationRate || 0);
    
    const avgTotalInflow = totalInflowValues.reduce((a, b) => a + b, 0) / totalInflowValues.length;
    const avgSpillway = spillwayValues.reduce((a, b) => a + b, 0) / spillwayValues.length;
    const avgEvaporation = evaporationValues.reduce((a, b) => a + b, 0) / evaporationValues.length;
    
    console.log("\n📈 OVERALL STATISTICS");
    console.log("=".repeat(80));
    console.log(`Average Total Inflow: ${avgTotalInflow.toFixed(2)} m³/s`);
    console.log(`Average Spillway Discharge: ${avgSpillway.toFixed(2)} m³/s`);
    console.log(`Average Evaporation: ${avgEvaporation.toFixed(2)} m³/s`);
    console.log("=".repeat(80));

    // Show dams with positive net change (gaining water)
    const gainingDams = allStatuses.filter(s => {
      const netChange = (s.totalInflow || 0) - (s.spillwayDischarge || 0) - (s.evaporationRate || 0);
      return netChange > 0;
    });
    
    console.log(`\n✅ Dams gaining water: ${gainingDams.length}`);
    console.log(`⚠️  Dams losing water: ${allStatuses.length - gainingDams.length}`);

    await mongoose.connection.close();
    console.log("\n✅ Database connection closed");
    console.log("✅ Field recalculation complete!");
    
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
};

recalculateFields();
