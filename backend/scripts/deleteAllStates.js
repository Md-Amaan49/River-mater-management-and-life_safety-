import mongoose from "mongoose";
import dotenv from "dotenv";
import State from "../models/State.js";
import River from "../models/River.js";
import Dam from "../models/Dam.js";

dotenv.config();

async function deleteAllStates() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Count existing records before deletion
    const stateCount = await State.countDocuments();
    const riverCount = await River.countDocuments();
    const damCount = await Dam.countDocuments();

    console.log(`\n📊 Current Database State:`);
    console.log(`🏛️  States: ${stateCount}`);
    console.log(`🌊 Rivers: ${riverCount}`);
    console.log(`🏗️  Dams: ${damCount}`);

    if (stateCount === 0) {
      console.log("\n✅ No states found in database. Nothing to delete.");
      return;
    }

    // Show existing states and their rivers
    const statesWithRivers = await State.aggregate([
      {
        $lookup: {
          from: 'rivers',
          localField: '_id',
          foreignField: 'state',
          as: 'rivers'
        }
      },
      {
        $project: {
          name: 1,
          riverCount: { $size: '$rivers' },
          riverNames: '$rivers.name'
        }
      }
    ]);

    console.log(`\n📋 Current States and Rivers:`);
    statesWithRivers.forEach(state => {
      console.log(`🏛️  ${state.name} (${state.riverCount} rivers)`);
      if (state.riverNames.length > 0) {
        state.riverNames.forEach(river => {
          console.log(`   🌊 ${river}`);
        });
      }
    });

    // Confirm deletion
    console.log(`\n⚠️  WARNING: This will permanently delete ALL state and river data!`);
    console.log(`   This includes:`);
    console.log(`   - ${stateCount} state records`);
    console.log(`   - ${riverCount} river records`);
    
    if (damCount > 0) {
      console.log(`\n⚠️  NOTE: There are ${damCount} dams in the database.`);
      console.log(`   Deleting states and rivers may cause data integrity issues.`);
      console.log(`   Consider deleting dams first if they reference states/rivers.`);
    }

    // Delete all related data in proper order (foreign key dependencies)
    console.log(`\n🗑️  Starting deletion process...`);

    // 1. Delete Rivers first (they reference states)
    const deletedRivers = await River.deleteMany({});
    console.log(`✅ Deleted ${deletedRivers.deletedCount} river records`);

    // 2. Delete States
    const deletedStates = await State.deleteMany({});
    console.log(`✅ Deleted ${deletedStates.deletedCount} state records`);

    // Verify deletion
    const remainingStates = await State.countDocuments();
    const remainingRivers = await River.countDocuments();

    console.log(`\n📊 Database State After Deletion:`);
    console.log(`🏛️  States: ${remainingStates}`);
    console.log(`🌊 Rivers: ${remainingRivers}`);

    if (remainingStates === 0 && remainingRivers === 0) {
      console.log(`\n🎉 SUCCESS: All state and river data has been completely removed from the database!`);
    } else {
      console.log(`\n⚠️  WARNING: Some records may still remain. Please check manually.`);
    }

    console.log(`\n📝 Summary:`);
    console.log(`   - States deleted: ${deletedStates.deletedCount}`);
    console.log(`   - Rivers deleted: ${deletedRivers.deletedCount}`);
    console.log(`   - Total records deleted: ${deletedStates.deletedCount + deletedRivers.deletedCount}`);
    console.log(`   - Database is now clean of state/river data`);

    // Check if there are any orphaned dams
    const remainingDams = await Dam.countDocuments();
    if (remainingDams > 0) {
      console.log(`\n⚠️  NOTE: ${remainingDams} dam records still exist in the database.`);
      console.log(`   These may now have invalid state/river references.`);
      console.log(`   Consider running the deleteAllDams.js script if needed.`);
    }

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
deleteAllStates();