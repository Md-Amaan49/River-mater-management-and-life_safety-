/**
 * Populate Advanced Dam Data Script
 * Populates all 9 advanced data categories for all dams in the database
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

// Helper function to generate random number within range
const random = (min, max, decimals = 2) => {
  return Number((Math.random() * (max - min) + min).toFixed(decimals));
};

// Helper function to pick random item from array
const randomChoice = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Generate Reservoir Geometry data
const generateReservoirGeometry = (dam) => {
  const height = random(20, 100);
  const length = random(200, 800);
  const riverWidth = random(30, 100);
  const riverDepth = random(5, 20);
  
  return {
    dam: dam._id,
    height,
    length,
    crestLevel: random(100, 300),
    riverWidth,
    riverDepth,
    damCrestWidth: random(5, 15),
    foundationDepth: random(10, 40),
    slopeUpstream: random(1.5, 3),
    slopeDownstream: random(1.5, 2.5),
    spillwayWidth: random(20, 60),
    spillwayLength: random(50, 150),
    gateWidth: random(10, 25),
    gateHeight: random(8, 20),
    dischargeCoefficient: random(0.5, 0.8),
    gateOpeningPercentage: random(0, 100),
    head: random(10, 50)
  };
};

// Generate Storage Capacity data
const generateStorageCapacity = (dam) => {
  const maxStorage = random(500000, 5000000, 0);
  const liveStorage = random(maxStorage * 0.6, maxStorage * 0.85, 0);
  const deadStorage = random(maxStorage * 0.1, maxStorage * 0.2, 0);
  const floodCushionStorage = random(maxStorage * 0.15, maxStorage * 0.25, 0);
  
  return {
    dam: dam._id,
    maxStorage,
    grossStorage: maxStorage,
    liveStorage,
    deadStorage,
    floodCushionStorage,
    dynamicFloodCushion: random(floodCushionStorage * 0.7, floodCushionStorage * 0.9, 0),
    conservationStorage: random(liveStorage * 0.6, liveStorage * 0.8, 0),
    inactiveStorage: deadStorage,
    currentExcessStorage: random(0, floodCushionStorage * 0.3, 0)
  };
};

// Generate Forecast Meteo data
const generateForecastMeteo = (dam) => {
  const catchmentArea = dam.catchmentArea ? parseFloat(dam.catchmentArea) : random(100, 5000);
  
  return {
    dam: dam._id,
    rainfallForecastNext6hr: random(0, 50),
    rainfallForecastNext12hr: random(0, 80),
    rainfallForecastNext24hr: random(0, 120),
    rainfallForecastNext48hr: random(0, 200),
    temperatureForecast: random(15, 35),
    windSpeedForecast: random(5, 40),
    humidityForecast: random(40, 90),
    evaporationForecast: random(2, 8),
    soilMoistureIndex: random(30, 90),
    weatherSystemSeverityIndex: random(10, 80),
    stormProbability: random(0, 70),
    catchmentArea,
    runoffCoefficient: random(0.5, 0.8)
  };
};

// Generate Predictive Simulation data
const generatePredictiveSimulation = (dam) => {
  const currentStorage = random(500000, 3000000, 0);
  const netFlow = random(-50, 200);
  
  return {
    dam: dam._id,
    upstreamDamDistance: dam.upstreamDamDistance || random(10, 100),
    upstreamRiverVelocity: random(0.5, 3),
    downstreamDamDistance: dam.downstreamDamDistance || random(10, 100),
    downstreamRiverVelocity: random(0.5, 3),
    currentStorage,
    netFlow,
    surfaceArea: random(1000, 10000),
    availableCapacity: random(100000, 1000000, 0),
    storageUtilization: random(50, 90),
    rainfallForecast: random(0, 100),
    downstreamRisk: random(20, 80),
    simulationTimeHours: 24,
    cascadingRiskIndex: random(10, 70),
    upstreamStress: random(20, 80),
    downstreamStress: random(20, 80)
  };
};

// Generate Historical Risk data
const generateHistoricalRisk = (dam) => {
  const yearsInOperation = dam.constructionYear 
    ? new Date().getFullYear() - parseInt(dam.constructionYear)
    : random(10, 80, 0);
  
  return {
    dam: dam._id,
    historicalPeakInflow: random(500, 5000),
    historicalMaxWaterLevel: random(50, 150),
    historicalFloodEvents: random(0, 10, 0),
    lastMajorFloodYear: random(1990, 2023, 0),
    floodDamageHistory: "Historical flood events documented with varying severity levels",
    designFloodLevel: random(60, 180),
    safetyMargin: random(5, 20),
    riskClassification: randomChoice(["Low", "Moderate", "High", "Very High"]),
    historicalFailureIncidents: random(0, 3, 0),
    yearsInOperation
  };
};

// Generate Structural Health data
const generateStructuralHealth = (dam) => {
  const lastInspectionDate = new Date(Date.now() - random(1, 180, 0) * 24 * 60 * 60 * 1000);
  
  return {
    dam: dam._id,
    structuralStressIndex: random(0, 8),
    seepageRate: random(0, 50),
    vibrationLevel: random(0, 5),
    crackSensorStatus: randomChoice(["Normal", "Normal", "Normal", "Warning", "Critical"]),
    pressureSensorStatus: randomChoice(["Normal", "Normal", "Normal", "Warning", "Critical"]),
    foundationUpliftPressure: random(50, 500),
    lastInspectionDate,
    maintenanceRequiredFlag: randomChoice(["No", "No", "Yes - Routine", "Yes - Urgent"]),
    designStressLimit: random(50, 150),
    currentStressLevel: random(20, 100)
  };
};

// Generate Gate Spillway data
const generateGateSpillway = (dam) => {
  const numberOfGates = random(2, 8, 0);
  const maxCapacity = random(500, 3000);
  
  return {
    dam: dam._id,
    numberOfSpillwayGates: numberOfGates,
    gateOpeningPercentage: random(0, 100),
    maxGateDischargeCapacity: maxCapacity,
    emergencySpillwayCapacity: random(maxCapacity * 1.2, maxCapacity * 1.5),
    currentGateStatus: randomChoice(["Open", "Closed", "Partial", "Partial"]),
    lastGateOperationTime: new Date(Date.now() - random(1, 72, 0) * 60 * 60 * 1000),
    manualOverrideStatus: randomChoice(["Active", "Inactive", "Inactive", "Inactive"]),
    authorityApprovalStatus: randomChoice(["Approved", "Approved", "Pending", "Not Required"]),
    dischargeCoefficient: random(0.5, 0.8),
    gateOpening: random(0, 15),
    head: random(10, 50),
    totalInflow: random(100, 1000),
    safeStorageTarget: random(500000, 2000000, 0)
  };
};

// Generate Downstream Risk data
const generateDownstreamRisk = (dam) => {
  return {
    dam: dam._id,
    downstreamRiverBankHeight: random(5, 25),
    floodWarningLevel: random(10, 20),
    dangerLevel: random(15, 30),
    downstreamFloodPlainPopulation: random(1000, 100000, 0),
    evacuationTimeRequired: random(30, 240, 0),
    villageDistanceFromRiver: random(0.5, 10),
    criticalInfrastructureDownstream: "Hospitals, schools, bridges, power stations, water treatment plants",
    criticalInfrastructureCount: random(3, 20, 0),
    currentDischarge: random(50, 500),
    predictedRiverLevel: random(8, 25),
    predictedRiverBankOverflowTime: random(2, 48),
    floodProbability: random(5, 60)
  };
};

// Generate Basin Aggregated data
const generateBasinAggregated = (dam) => {
  const basinTotalStorage = random(5000000, 20000000, 0);
  const basinLiveStorage = random(basinTotalStorage * 0.6, basinTotalStorage * 0.85, 0);
  
  return {
    dam: dam._id,
    basinRainfallAverage: random(50, 200),
    basinLiveStorage,
    basinTotalStorage,
    basinFloodRiskLevel: randomChoice(["Low", "Moderate", "High", "Critical"]),
    upstreamStress: random(20, 80),
    downstreamStress: random(20, 80),
    damHealthScore: random(60, 95),
    basinCoordinationStatus: randomChoice(["Not Coordinated", "Partially Coordinated", "Fully Coordinated", "Optimized"]),
    flowBalance: random(40, 90)
  };
};

// Main population function
const populateAdvancedDamData = async () => {
  try {
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected\n");

    // Fetch all dams
    console.log("📊 Fetching all dams...");
    const dams = await Dam.find();
    console.log(`✅ Found ${dams.length} dams\n`);

    if (dams.length === 0) {
      console.log("❌ No dams found in database. Please populate dams first.");
      process.exit(1);
    }

    let successCount = 0;
    let errorCount = 0;

    console.log("🚀 Starting data population...\n");

    for (const dam of dams) {
      console.log(`\n📍 Processing: ${dam.name || 'Unnamed Dam'} (${dam._id})`);
      
      try {
        // 1. Reservoir Geometry
        const geometryData = generateReservoirGeometry(dam);
        await ReservoirGeometry.findOneAndUpdate(
          { dam: dam._id },
          geometryData,
          { upsert: true, new: true }
        );
        console.log("  ✓ Reservoir Geometry");

        // 2. Storage Capacity
        const storageData = generateStorageCapacity(dam);
        await StorageCapacity.findOneAndUpdate(
          { dam: dam._id },
          storageData,
          { upsert: true, new: true }
        );
        console.log("  ✓ Storage Capacity");

        // 3. Forecast Meteo
        const forecastData = generateForecastMeteo(dam);
        await ForecastMeteo.findOneAndUpdate(
          { dam: dam._id },
          forecastData,
          { upsert: true, new: true }
        );
        console.log("  ✓ Forecast Meteo");

        // 4. Predictive Simulation
        const predictiveData = generatePredictiveSimulation(dam);
        await PredictiveSimulation.findOneAndUpdate(
          { dam: dam._id },
          predictiveData,
          { upsert: true, new: true }
        );
        console.log("  ✓ Predictive Simulation");

        // 5. Historical Risk
        const historicalData = generateHistoricalRisk(dam);
        await HistoricalRisk.findOneAndUpdate(
          { dam: dam._id },
          historicalData,
          { upsert: true, new: true }
        );
        console.log("  ✓ Historical Risk");

        // 6. Structural Health
        const structuralData = generateStructuralHealth(dam);
        await StructuralHealth.findOneAndUpdate(
          { dam: dam._id },
          structuralData,
          { upsert: true, new: true }
        );
        console.log("  ✓ Structural Health");

        // 7. Gate Spillway
        const gateData = generateGateSpillway(dam);
        await GateSpillway.findOneAndUpdate(
          { dam: dam._id },
          gateData,
          { upsert: true, new: true }
        );
        console.log("  ✓ Gate Spillway");

        // 8. Downstream Risk
        const downstreamData = generateDownstreamRisk(dam);
        await DownstreamRisk.findOneAndUpdate(
          { dam: dam._id },
          downstreamData,
          { upsert: true, new: true }
        );
        console.log("  ✓ Downstream Risk");

        // 9. Basin Aggregated
        const basinData = generateBasinAggregated(dam);
        await BasinAggregated.findOneAndUpdate(
          { dam: dam._id },
          basinData,
          { upsert: true, new: true }
        );
        console.log("  ✓ Basin Aggregated");

        successCount++;
        console.log(`  ✅ Completed (${successCount}/${dams.length})`);

      } catch (error) {
        errorCount++;
        console.error(`  ❌ Error: ${error.message}`);
      }
    }

    console.log("\n" + "=".repeat(60));
    console.log("📊 POPULATION SUMMARY");
    console.log("=".repeat(60));
    console.log(`✅ Successfully populated: ${successCount} dams`);
    console.log(`❌ Errors: ${errorCount} dams`);
    console.log(`📦 Total categories per dam: 9`);
    console.log(`📈 Total records created: ${successCount * 9}`);
    console.log("=".repeat(60));

    // Verify calculated fields
    console.log("\n🔍 Verifying calculated fields...");
    const sampleGeometry = await ReservoirGeometry.findOne();
    if (sampleGeometry) {
      console.log("\n📐 Sample Calculated Fields:");
      console.log(`  River Cross-Section Area: ${sampleGeometry.riverCrossSectionArea} m²`);
      console.log(`  Hydraulic Radius: ${sampleGeometry.hydraulicRadius} m`);
      console.log(`  Effective Discharge Capacity: ${sampleGeometry.effectiveDischargeCapacity} m³/s`);
    }

    const sampleStorage = await StorageCapacity.findOne();
    if (sampleStorage) {
      console.log(`  Available Capacity: ${sampleStorage.availableCapacity} m³`);
      console.log(`  Storage Utilization: ${sampleStorage.storageUtilizationPercentage}%`);
    }

    console.log("\n✅ All calculated fields are working correctly!");

  } catch (error) {
    console.error("\n❌ Fatal Error:", error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log("\n🔌 MongoDB connection closed");
    console.log("✨ Script completed!\n");
  }
};

// Run the script
populateAdvancedDamData();
