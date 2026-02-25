import mongoose from "mongoose";
import dotenv from "dotenv";
import Dam from "../models/Dam.js";
import ReservoirGeometry from "../models/ReservoirGeometry.js";

dotenv.config();

const testDataRetrieval = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected\n");

    // Get first dam
    const dam = await Dam.findOne();
    if (!dam) {
      console.log("❌ No dams found in database");
      process.exit(1);
    }

    console.log("📍 Testing with dam:");
    console.log(`   Name: ${dam.name}`);
    console.log(`   ID: ${dam._id}`);
    console.log(`   State: ${dam.state}\n`);

    // Try to fetch reservoir geometry
    console.log("🔍 Searching for ReservoirGeometry...");
    const geometry = await ReservoirGeometry.findOne({ dam: dam._id });
    
    if (geometry) {
      console.log("✅ Found ReservoirGeometry data:");
      console.log(JSON.stringify(geometry, null, 2));
    } else {
      console.log("❌ No ReservoirGeometry data found for this dam");
      
      // Check if any geometry data exists
      const anyGeometry = await ReservoirGeometry.findOne();
      if (anyGeometry) {
        console.log("\n⚠️  But found geometry data for another dam:");
        console.log(`   Dam ID in geometry: ${anyGeometry.dam}`);
        
        // Find that dam
        const otherDam = await Dam.findById(anyGeometry.dam);
        if (otherDam) {
          console.log(`   Dam Name: ${otherDam.name}`);
        }
      } else {
        console.log("\n❌ No ReservoirGeometry data exists in database at all");
      }
    }

    await mongoose.connection.close();
    console.log("\n🔌 MongoDB connection closed");
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
};

testDataRetrieval();
