import mongoose from "mongoose";
import dotenv from "dotenv";
import Dam from "../models/Dam.js";
import Safety from "../models/Safety.js";
import DamHistory from "../models/DamHistory.js";
import PublicSpot from "../models/PublicSpot.js";
import RestrictedArea from "../models/RestrictedArea.js";
import Guideline from "../models/Guideline.js";

dotenv.config();

async function deleteAllDams() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Count existing records before deletion
    const damCount = await Dam.countDocuments();
    const safetyCount = await Safety.countDocuments();
    const historyCount = await DamHistory.countDocuments();
    const publicSpotCount = await PublicSpot.countDocuments();
    const restrictedAreaCount = await RestrictedArea.countDocuments();
    const guidelineCount = await Guideline.countDocuments();

    console.log(`\n📊 Current Database State:`);
    console.log(`🏗️  Dams: ${damCount}`);
    console.log(`🚨 Safety Records: ${safetyCount}`);
    console.log(`📜 History Records: ${historyCount}`);
    console.log(`📍 Public Spots: ${publicSpotCount}`);
    console.log(`⛔ Restricted Areas: ${restrictedAreaCount}`);
    console.log(`📄 Guidelines: ${guidelineCount}`);

    if (damCount === 0) {
      console.log("\n✅ No dams found in database. Nothing to delete.");
      return;
    }

    // Confirm deletion
    console.log(`\n⚠️  WARNING: This will permanently delete ALL dam-related data!`);
    console.log(`   This includes:`);
    console.log(`   - ${damCount} dam records`);
    console.log(`   - ${safetyCount} safety/alert records`);
    console.log(`   - ${historyCount} historical event records`);
    console.log(`   - ${publicSpotCount} public spot records`);
    console.log(`   - ${restrictedAreaCount} restricted area records`);
    console.log(`   - ${guidelineCount} guideline records`);

    // Delete all related data in proper order (foreign key dependencies)
    console.log(`\n🗑️  Starting deletion process...`);

    // 1. Delete Safety records (references dams)
    const deletedSafety = await Safety.deleteMany({});
    console.log(`✅ Deleted ${deletedSafety.deletedCount} safety records`);

    // 2. Delete Dam History records (references dams)
    const deletedHistory = await DamHistory.deleteMany({});
    console.log(`✅ Deleted ${deletedHistory.deletedCount} history records`);

    // 3. Delete Public Spots (may reference dams in nearbyDams array)
    const deletedPublicSpots = await PublicSpot.deleteMany({});
    console.log(`✅ Deleted ${deletedPublicSpots.deletedCount} public spot records`);

    // 4. Delete Restricted Areas (may reference dams in nearbyDams array)
    const deletedRestrictedAreas = await RestrictedArea.deleteMany({});
    console.log(`✅ Deleted ${deletedRestrictedAreas.deletedCount} restricted area records`);

    // 5. Delete Guidelines (may reference dams in applicableDams array)
    const deletedGuidelines = await Guideline.deleteMany({});
    console.log(`✅ Deleted ${deletedGuidelines.deletedCount} guideline records`);

    // 6. Finally, delete all Dam records
    const deletedDams = await Dam.deleteMany({});
    console.log(`✅ Deleted ${deletedDams.deletedCount} dam records`);

    // Verify deletion
    const remainingDams = await Dam.countDocuments();
    const remainingSafety = await Safety.countDocuments();
    const remainingHistory = await DamHistory.countDocuments();
    const remainingPublicSpots = await PublicSpot.countDocuments();
    const remainingRestrictedAreas = await RestrictedArea.countDocuments();
    const remainingGuidelines = await Guideline.countDocuments();

    console.log(`\n📊 Database State After Deletion:`);
    console.log(`🏗️  Dams: ${remainingDams}`);
    console.log(`🚨 Safety Records: ${remainingSafety}`);
    console.log(`📜 History Records: ${remainingHistory}`);
    console.log(`📍 Public Spots: ${remainingPublicSpots}`);
    console.log(`⛔ Restricted Areas: ${remainingRestrictedAreas}`);
    console.log(`📄 Guidelines: ${remainingGuidelines}`);

    if (remainingDams === 0 && remainingSafety === 0 && remainingHistory === 0 && 
        remainingPublicSpots === 0 && remainingRestrictedAreas === 0 && remainingGuidelines === 0) {
      console.log(`\n🎉 SUCCESS: All dam-related data has been completely removed from the database!`);
    } else {
      console.log(`\n⚠️  WARNING: Some records may still remain. Please check manually.`);
    }

    console.log(`\n📝 Summary:`);
    console.log(`   - Total records deleted: ${deletedDams.deletedCount + deletedSafety.deletedCount + deletedHistory.deletedCount + deletedPublicSpots.deletedCount + deletedRestrictedAreas.deletedCount + deletedGuidelines.deletedCount}`);
    console.log(`   - Database is now clean and ready for fresh data`);

  } catch (error) {
    console.error("❌ Error during deletion process:", error.message);
    
    if (error.message.includes('EREFUSED') || error.message.includes('querySrv')) {
      console.log("\n🔧 Database Connection Issues:");
      console.log("   - Check if MongoDB connection string is correct");
      console.log("   - Verify network connectivity");
      console.log("   - Ensure MongoDB Atlas cluster is running");
      console.log("   - Check if IP address is whitelisted");
    }
  } finally {
    await mongoose.disconnect();
    console.log("\n🔌 Disconnected from MongoDB");
  }
}

// Run the script
deleteAllDams();