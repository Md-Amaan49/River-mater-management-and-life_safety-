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

const recalculateAllDams = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected\n");

    // Get all dams
    const dams = await Dam.find();
    console.log(`📊 Found ${dams.length} dams\n`);

    const models = [
      { Model: ReservoirGeometry, name: "ReservoirGeometry" },
      { Model: StorageCapacity, name: "StorageCapacity" },
      { Model: ForecastMeteo, name: "ForecastMeteo" },
      { Model: PredictiveSimulation, name: "PredictiveSimulation" },
      { Model: HistoricalRisk, name: "HistoricalRisk" },
      { Model: StructuralHealth, name: "StructuralHealth" },
      { Model: GateSpillway, name: "GateSpillway" },
      { Model: DownstreamRisk, name: "DownstreamRisk" },
      { Model: BasinAggregated, name: "BasinAggregated" }
    ];

    let totalRecalculated = 0;

    for (const dam of dams) {
      console.log(`🔄 Processing: ${dam.name} (${dam._id})`);
      
      for (const { Model, name } of models) {
        const data = await Model.findOne({ dam: dam._id });
        if (data) {
          await data.save(); // Trigger pre-save hook to recalculate
          totalRecalculated++;
          console.log(`   ✓ ${name} recalculated`);
        }
      }
      console.log("");
    }

    console.log(`\n✅ Recalculation complete!`);
    console.log(`📈 Total records recalculated: ${totalRecalculated}`);

    await mongoose.connection.close();
    console.log("\n🔌 MongoDB connection closed");
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
};

recalculateAllDams();
