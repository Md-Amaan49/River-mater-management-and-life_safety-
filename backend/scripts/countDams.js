import mongoose from "mongoose";
import dotenv from "dotenv";
import Dam from "../models/Dam.js";
import Safety from "../models/Safety.js";

dotenv.config();

async function countDams() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Count total dams
    const totalDams = await Dam.countDocuments();
    console.log(`\n📊 Database Statistics:`);
    console.log(`🏗️  Total Dams: ${totalDams}`);

    // Count dams by state
    const damsByState = await Dam.aggregate([
      {
        $group: {
          _id: "$state",
          count: { $sum: 1 },
          dams: { $push: "$name" }
        }
      },
      { $sort: { count: -1 } }
    ]);

    console.log(`\n📍 Dams by State:`);
    damsByState.forEach(state => {
      console.log(`   ${state._id}: ${state.count} dams`);
      state.dams.forEach(dam => {
        console.log(`      - ${dam}`);
      });
    });

    // Count dams by river
    const damsByRiver = await Dam.aggregate([
      {
        $group: {
          _id: { $ifNull: ["$river", "$riverName"] },
          count: { $sum: 1 },
          dams: { $push: "$name" }
        }
      },
      { $sort: { count: -1 } }
    ]);

    console.log(`\n🌊 Dams by River:`);
    damsByRiver.forEach(river => {
      console.log(`   ${river._id}: ${river.count} dams`);
      river.dams.forEach(dam => {
        console.log(`      - ${dam}`);
      });
    });

    // Count safety records
    const totalSafetyRecords = await Safety.countDocuments();
    console.log(`\n🚨 Safety Records: ${totalSafetyRecords}`);

    // Count safety records by risk level
    const safetyByRisk = await Safety.aggregate([
      {
        $group: {
          _id: "$floodRiskLevel",
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    console.log(`\n⚠️  Safety Alerts by Risk Level:`);
    safetyByRisk.forEach(risk => {
      const emoji = risk._id === 'Red' ? '🔴' : risk._id === 'Yellow' ? '🟡' : '🟢';
      console.log(`   ${emoji} ${risk._id}: ${risk.count} alerts`);
    });

    // Get detailed dam information
    const allDams = await Dam.find({}).select('name state river riverName damType height constructionYear');
    
    console.log(`\n📋 Detailed Dam List:`);
    allDams.forEach((dam, index) => {
      console.log(`${index + 1}. ${dam.name}`);
      console.log(`   State: ${dam.state || 'Not specified'}`);
      console.log(`   River: ${dam.river || dam.riverName || 'Not specified'}`);
      console.log(`   Type: ${dam.damType || 'Not specified'}`);
      console.log(`   Height: ${dam.height || 'Not specified'}`);
      console.log(`   Built: ${dam.constructionYear || 'Not specified'}`);
      console.log('');
    });

    // Check for dams with safety records
    const damsWithSafety = await Dam.aggregate([
      {
        $lookup: {
          from: 'safeties',
          localField: '_id',
          foreignField: 'dam',
          as: 'safetyRecord'
        }
      },
      {
        $project: {
          name: 1,
          state: 1,
          river: { $ifNull: ["$river", "$riverName"] },
          hasSafety: { $gt: [{ $size: "$safetyRecord" }, 0] },
          riskLevel: { $arrayElemAt: ["$safetyRecord.floodRiskLevel", 0] }
        }
      }
    ]);

    console.log(`\n🔗 Dams with Safety Records:`);
    const withSafety = damsWithSafety.filter(dam => dam.hasSafety);
    const withoutSafety = damsWithSafety.filter(dam => !dam.hasSafety);
    
    console.log(`   ✅ With Safety Records: ${withSafety.length}`);
    withSafety.forEach(dam => {
      const emoji = dam.riskLevel === 'Red' ? '🔴' : dam.riskLevel === 'Yellow' ? '🟡' : '🟢';
      console.log(`      ${emoji} ${dam.name} (${dam.state}) - ${dam.riskLevel}`);
    });
    
    console.log(`   ❌ Without Safety Records: ${withoutSafety.length}`);
    withoutSafety.forEach(dam => {
      console.log(`      ⚪ ${dam.name} (${dam.state})`);
    });

  } catch (error) {
    console.error("❌ Error connecting to database:", error.message);
    
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
countDams();