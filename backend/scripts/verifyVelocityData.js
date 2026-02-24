import mongoose from "mongoose";
import dotenv from "dotenv";
import Dam from "../models/Dam.js";
import DamStatus from "../models/DamStatus.js";

dotenv.config();

const verifyVelocityData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Get all dam statuses with dam info
    const allStatuses = await DamStatus.find().populate('dam', 'name upstreamDam downstreamDam');
    
    console.log(`\n📊 Verifying ${allStatuses.length} dam statuses...\n`);
    console.log("=".repeat(80));

    let correctCount = 0;
    let issueCount = 0;

    // Group by type
    const sourceDams = [];
    const terminalDams = [];
    const intermediateDams = [];

    for (const status of allStatuses) {
      const damName = status.dam?.name || 'Unknown Dam';
      const upstreamDam = status.dam?.upstreamDam || null;
      const downstreamDam = status.dam?.downstreamDam || null;
      
      let hasIssue = false;
      let issues = [];

      // Check source dams (no upstream)
      if (status.inflowFromUpstreamDam === 0) {
        if (status.upstreamRiverVelocity !== 0) {
          hasIssue = true;
          issues.push(`❌ Source dam should have upstream velocity = 0, but has ${status.upstreamRiverVelocity}`);
        }
        sourceDams.push({
          name: damName,
          inflowFromUpstream: status.inflowFromUpstreamDam,
          outflowToDownstream: status.outflowToDownstreamDam,
          upstreamVelocity: status.upstreamRiverVelocity,
          downstreamVelocity: status.downstreamRiverVelocity,
          hasIssue
        });
      }
      
      // Check terminal dams (no downstream)
      if (status.outflowToDownstreamDam === 0) {
        if (status.downstreamRiverVelocity !== 0) {
          hasIssue = true;
          issues.push(`❌ Terminal dam should have downstream velocity = 0, but has ${status.downstreamRiverVelocity}`);
        }
        terminalDams.push({
          name: damName,
          inflowFromUpstream: status.inflowFromUpstreamDam,
          outflowToDownstream: status.outflowToDownstreamDam,
          upstreamVelocity: status.upstreamRiverVelocity,
          downstreamVelocity: status.downstreamRiverVelocity,
          hasIssue
        });
      }
      
      // Check intermediate dams (both upstream and downstream)
      if (status.inflowFromUpstreamDam > 0 && status.outflowToDownstreamDam > 0) {
        if (status.upstreamRiverVelocity === 0) {
          hasIssue = true;
          issues.push(`❌ Intermediate dam should have upstream velocity > 0`);
        }
        if (status.downstreamRiverVelocity === 0) {
          hasIssue = true;
          issues.push(`❌ Intermediate dam should have downstream velocity > 0`);
        }
        intermediateDams.push({
          name: damName,
          inflowFromUpstream: status.inflowFromUpstreamDam,
          outflowToDownstream: status.outflowToDownstreamDam,
          upstreamVelocity: status.upstreamRiverVelocity,
          downstreamVelocity: status.downstreamRiverVelocity,
          hasIssue
        });
      }

      if (hasIssue) {
        console.log(`\n⚠️  ${damName}`);
        issues.forEach(issue => console.log(`   ${issue}`));
        issueCount++;
      } else {
        correctCount++;
      }
    }

    console.log("\n" + "=".repeat(80));
    console.log("📊 VERIFICATION SUMMARY");
    console.log("=".repeat(80));
    console.log(`✅ Correct: ${correctCount}`);
    console.log(`❌ Issues found: ${issueCount}`);
    console.log(`📝 Total: ${allStatuses.length}`);
    console.log("=".repeat(80));

    // Display sample dams from each category
    console.log("\n🔵 SOURCE DAMS (Sample - 3 dams)");
    console.log("=".repeat(80));
    sourceDams.slice(0, 3).forEach(dam => {
      console.log(`\n📍 ${dam.name}`);
      console.log(`   Inflow from upstream: ${dam.inflowFromUpstream} m³/s`);
      console.log(`   Outflow to downstream: ${dam.outflowToDownstream} m³/s`);
      console.log(`   Upstream velocity: ${dam.upstreamVelocity} m/s ${dam.upstreamVelocity === 0 ? '✅' : '❌'}`);
      console.log(`   Downstream velocity: ${dam.downstreamVelocity} m/s`);
    });

    console.log("\n\n🟢 INTERMEDIATE DAMS (Sample - 3 dams)");
    console.log("=".repeat(80));
    intermediateDams.slice(0, 3).forEach(dam => {
      console.log(`\n📍 ${dam.name}`);
      console.log(`   Inflow from upstream: ${dam.inflowFromUpstream} m³/s`);
      console.log(`   Outflow to downstream: ${dam.outflowToDownstream} m³/s`);
      console.log(`   Upstream velocity: ${dam.upstreamVelocity} m/s ${dam.upstreamVelocity > 0 ? '✅' : '❌'}`);
      console.log(`   Downstream velocity: ${dam.downstreamVelocity} m/s ${dam.downstreamVelocity > 0 ? '✅' : '❌'}`);
    });

    console.log("\n\n🔴 TERMINAL DAMS (Sample - 3 dams)");
    console.log("=".repeat(80));
    terminalDams.slice(0, 3).forEach(dam => {
      console.log(`\n📍 ${dam.name}`);
      console.log(`   Inflow from upstream: ${dam.inflowFromUpstream} m³/s`);
      console.log(`   Outflow to downstream: ${dam.outflowToDownstream} m³/s`);
      console.log(`   Upstream velocity: ${dam.upstreamVelocity} m/s`);
      console.log(`   Downstream velocity: ${dam.downstreamVelocity} m/s ${dam.downstreamVelocity === 0 ? '✅' : '❌'}`);
    });

    console.log("\n\n📈 CATEGORY COUNTS");
    console.log("=".repeat(80));
    console.log(`🔵 Source dams: ${sourceDams.length}`);
    console.log(`🟢 Intermediate dams: ${intermediateDams.length}`);
    console.log(`🔴 Terminal dams: ${terminalDams.length}`);
    console.log(`📝 Total: ${sourceDams.length + intermediateDams.length + terminalDams.length}`);
    console.log("=".repeat(80));

    await mongoose.connection.close();
    console.log("\n✅ Database connection closed");
    console.log("✅ Velocity data verification complete!");
    
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
};

verifyVelocityData();
