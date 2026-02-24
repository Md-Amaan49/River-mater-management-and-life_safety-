import mongoose from "mongoose";
import dotenv from "dotenv";
import Dam from "../models/Dam.js";
import DamStatus from "../models/DamStatus.js";

dotenv.config({ path: '../.env' });

const verifyDamNetwork = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB\n");

    // Check a few sample dams
    const sampleDams = [
      "Jayakwadi Dam",
      "Koyna Dam",
      "Mettur Dam",
      "Pochampad Dam",
      "Redhills Lake"
    ];

    for (const damName of sampleDams) {
      const dam = await Dam.findOne({ name: damName });
      if (dam) {
        console.log(`\n🏗️  ${dam.name} (${dam.state})`);
        console.log(`   River: ${dam.riverName}`);
        console.log(`   Upstream: ${dam.upstreamDam || 'None'} (${dam.upstreamDamDistance || 0} km)`);
        console.log(`   Downstream: ${dam.downstreamDam || 'None'} (${dam.downstreamDamDistance || 0} km)`);
        
        const status = await DamStatus.findOne({ dam: dam._id });
        if (status) {
          console.log(`   💧 Inflow from upstream: ${status.inflowFromUpstreamDam || 0} m³/s`);
          console.log(`   💧 Outflow to downstream: ${status.outflowToDownstreamDam || 0} m³/s`);
        }
      }
    }

    await mongoose.disconnect();
    console.log("\n\n✅ Verification complete!");
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
};

verifyDamNetwork();
