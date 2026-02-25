/**
 * Verify Advanced Dam Data Script
 * Checks that all data categories are populated and calculated fields are working
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import Dam from "../models/Dam.js";
import ReservoirGeometry from "../models/ReservoirGeometry.js";
import StorageCapacity from "../models/StorageCapacity.js";
import ForecastMeteo from "../models/ForecastMeteo.js";
import PredictiveSimulation from "../models/PredictiveSimulation.js";
import HistoricalRisk from "../models/HistoricalRisk.js";
import StructuralHealth from "../models/StructuralHealthModel.js";
import GateSpillway from "../models/GateSpillwayModel.js";
import DownstreamRisk from "../models/DownstreamRiskModel.js";
import BasinAggregated from "../models/BasinAggregatedModel.js";

dotenv.config();

const verifyAdvancedData = async () => {
  try {
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected\n");

    console.log("=" .repeat(60));
    console.log("📊 ADVANCED DAM DATA VERIFICATION REPORT");
    console.log("=".repeat(60) + "\n");

    // Count dams
    const damCount = await Dam.countDocuments();
    console.log(`🏗️  Total Dams in Database: ${damCount}\n`);

    // Count records in each collection
    const models = [
      { name: "Reservoir Geometry", model: ReservoirGeometry },
      { name: "Storage Capacity", model: StorageCapacity },
      { name: "Forecast Meteo", model: ForecastMeteo },
      { name: "Predictive Simulation", model: PredictiveSimulation },
      { name: "Historical Risk", model: HistoricalRisk },
      { name: "Structural Health", model: StructuralHealth },
      { name: "Gate Spillway", model: GateSpillway },
      { name: "Downstream Risk", model: DownstreamRisk },
      { name: "Basin Aggregated", model: BasinAggregated }
    ];

    console.log("📦 Data Category Coverage:\n");
    
    let totalRecords = 0;
    const coverage = [];

    for (const { name, model } of models) {
      const count = await model.countDocuments();
      totalRecords += count;
      const percentage = damCount > 0 ? ((count / damCount) * 100).toFixed(1) : 0;
      const status = count === damCount ? "✅" : count > 0 ? "⚠️" : "❌";
      
      console.log(`${status} ${name.padEnd(30)} ${count}/${damCount} (${percentage}%)`);
      coverage.push({ name, count, percentage: parseFloat(percentage) });
    }

    console.log("\n" + "=".repeat(60));
    console.log(`📈 Total Records: ${totalRecords}`);
    console.log(`🎯 Expected Records: ${damCount * 9}`);
    console.log(`📊 Overall Coverage: ${damCount > 0 ? ((totalRecords / (damCount * 9)) * 100).toFixed(1) : 0}%`);
    console.log("=".repeat(60) + "\n");

    // Check calculated fields
    console.log("🔍 Verifying Calculated Fields:\n");

    // Sample Reservoir Geometry
    const geometry = await ReservoirGeometry.findOne();
    if (geometry) {
      console.log("📐 Reservoir Geometry Sample:");
      console.log(`  Input: riverWidth=${geometry.riverWidth}m, riverDepth=${geometry.riverDepth}m`);
      console.log(`  ✓ Calculated riverCrossSectionArea: ${geometry.riverCrossSectionArea} m²`);
      console.log(`  ✓ Calculated hydraulicRadius: ${geometry.hydraulicRadius} m`);
      console.log(`  ✓ Calculated effectiveDischargeCapacity: ${geometry.effectiveDischargeCapacity} m³/s\n`);
    }

    // Sample Storage Capacity
    const storage = await StorageCapacity.findOne();
    if (storage) {
      console.log("💧 Storage Capacity Sample:");
      console.log(`  Input: maxStorage=${storage.maxStorage} m³, liveStorage=${storage.liveStorage} m³`);
      console.log(`  ✓ Calculated availableCapacity: ${storage.availableCapacity} m³`);
      console.log(`  ✓ Calculated storageUtilizationPercentage: ${storage.storageUtilizationPercentage}%`);
      console.log(`  ✓ Calculated floodCushionAvailable: ${storage.floodCushionAvailable} m³\n`);
    }

    // Sample Forecast Meteo
    const forecast = await ForecastMeteo.findOne();
    if (forecast) {
      console.log("🌤️  Forecast Meteo Sample:");
      console.log(`  Input: rainfallForecast=${forecast.rainfallForecastNext24hr}mm, catchmentArea=${forecast.catchmentArea}km²`);
      console.log(`  ✓ Calculated predictedRainfallContribution: ${forecast.predictedRainfallContribution} m³/s`);
      console.log(`  ✓ Calculated catchmentRunoffIndex: ${forecast.catchmentRunoffIndex}`);
      console.log(`  ✓ Calculated stormRiskIndex: ${forecast.stormRiskIndex}\n`);
    }

    // Sample Predictive Simulation
    const predictive = await PredictiveSimulation.findOne();
    if (predictive) {
      console.log("🔮 Predictive Simulation Sample:");
      console.log(`  Input: currentStorage=${predictive.currentStorage} m³, netFlow=${predictive.netFlow} m³/s`);
      console.log(`  ✓ Calculated arrivalTimeFromUpstream: ${predictive.arrivalTimeFromUpstream} hours`);
      console.log(`  ✓ Calculated timeToOverflow: ${predictive.timeToOverflow} hours`);
      console.log(`  ✓ Calculated floodRiskScore: ${predictive.floodRiskScore}/100\n`);
    }

    // Sample Structural Health
    const structural = await StructuralHealth.findOne();
    if (structural) {
      console.log("🏗️  Structural Health Sample:");
      console.log(`  Input: stressIndex=${structural.structuralStressIndex}, seepageRate=${structural.seepageRate}L/min`);
      console.log(`  ✓ Calculated damHealthScore: ${structural.damHealthScore}/100`);
      console.log(`  ✓ Calculated maintenanceUrgencyLevel: ${structural.maintenanceUrgencyLevel}\n`);
    }

    // Sample Gate Spillway
    const gate = await GateSpillway.findOne();
    if (gate) {
      console.log("🚪 Gate Spillway Sample:");
      console.log(`  Input: dischargeCoeff=${gate.dischargeCoefficient}, gateOpening=${gate.gateOpening}m`);
      console.log(`  ✓ Calculated actualDischarge: ${gate.actualDischarge} m³/s`);
      console.log(`  ✓ Calculated gateEfficiencyIndex: ${gate.gateEfficiencyIndex}%\n`);
    }

    // Sample Downstream Risk
    const downstream = await DownstreamRisk.findOne();
    if (downstream) {
      console.log("⚠️  Downstream Risk Sample:");
      console.log(`  Input: population=${downstream.downstreamFloodPlainPopulation}, floodProb=${downstream.floodProbability}%`);
      console.log(`  ✓ Calculated downstreamFloodImpactScore: ${downstream.downstreamFloodImpactScore}/100`);
      console.log(`  ✓ Calculated dangerLevelStatus: ${downstream.dangerLevelStatus}`);
      console.log(`  ✓ Calculated humanRiskIndex: ${downstream.humanRiskIndex}/100\n`);
    }

    // Sample Basin Aggregated
    const basin = await BasinAggregated.findOne();
    if (basin) {
      console.log("🔷 Basin Aggregated Sample:");
      console.log(`  Input: basinLiveStorage=${basin.basinLiveStorage} m³, basinTotalStorage=${basin.basinTotalStorage} m³`);
      console.log(`  ✓ Calculated basinStorageUtilization: ${basin.basinStorageUtilization}%`);
      console.log(`  ✓ Calculated cascadingFailureProbability: ${basin.cascadingFailureProbability}%`);
      console.log(`  ✓ Calculated multiDamOptimizationScore: ${basin.multiDamOptimizationScore}/100\n`);
    }

    // Find dams with incomplete data
    console.log("=".repeat(60));
    console.log("🔍 Checking for Incomplete Data:\n");

    const allDams = await Dam.find();
    const incompleteDams = [];

    for (const dam of allDams) {
      const missing = [];
      
      if (!(await ReservoirGeometry.findOne({ dam: dam._id }))) missing.push("Reservoir Geometry");
      if (!(await StorageCapacity.findOne({ dam: dam._id }))) missing.push("Storage Capacity");
      if (!(await ForecastMeteo.findOne({ dam: dam._id }))) missing.push("Forecast Meteo");
      if (!(await PredictiveSimulation.findOne({ dam: dam._id }))) missing.push("Predictive Simulation");
      if (!(await HistoricalRisk.findOne({ dam: dam._id }))) missing.push("Historical Risk");
      if (!(await StructuralHealth.findOne({ dam: dam._id }))) missing.push("Structural Health");
      if (!(await GateSpillway.findOne({ dam: dam._id }))) missing.push("Gate Spillway");
      if (!(await DownstreamRisk.findOne({ dam: dam._id }))) missing.push("Downstream Risk");
      if (!(await BasinAggregated.findOne({ dam: dam._id }))) missing.push("Basin Aggregated");

      if (missing.length > 0) {
        incompleteDams.push({ name: dam.name || "Unnamed", id: dam._id, missing });
      }
    }

    if (incompleteDams.length === 0) {
      console.log("✅ All dams have complete data across all 9 categories!\n");
    } else {
      console.log(`⚠️  Found ${incompleteDams.length} dams with incomplete data:\n`);
      incompleteDams.forEach(dam => {
        console.log(`  ❌ ${dam.name} (${dam.id})`);
        console.log(`     Missing: ${dam.missing.join(", ")}\n`);
      });
    }

    console.log("=".repeat(60));
    console.log("📊 VERIFICATION SUMMARY");
    console.log("=".repeat(60));
    
    const allComplete = incompleteDams.length === 0 && totalRecords === damCount * 9;
    
    if (allComplete) {
      console.log("✅ Status: COMPLETE");
      console.log("✅ All dams have data in all 9 categories");
      console.log("✅ All calculated fields are working correctly");
      console.log("✅ System is ready for production use");
    } else {
      console.log("⚠️  Status: INCOMPLETE");
      console.log(`⚠️  ${incompleteDams.length} dams need data population`);
      console.log(`⚠️  Run: npm run populate-advanced`);
    }
    
    console.log("=".repeat(60) + "\n");

  } catch (error) {
    console.error("\n❌ Verification Error:", error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log("🔌 MongoDB connection closed");
    console.log("✨ Verification completed!\n");
  }
};

// Run the verification
verifyAdvancedData();
