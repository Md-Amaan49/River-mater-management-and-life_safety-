import mongoose from "mongoose";
import dotenv from "dotenv";
import State from "../models/State.js";
import River from "../models/River.js";
import Dam from "../models/Dam.js";
import Safety from "../models/Safety.js";
import DamHistory from "../models/DamHistory.js";
import PublicSpot from "../models/PublicSpot.js";
import RestrictedArea from "../models/RestrictedArea.js";
import Guideline from "../models/Guideline.js";

dotenv.config();

async function populateCompleteData() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    let totalCreated = {
      states: 0,
      rivers: 0,
      dams: 0,
      safety: 0,
      history: 0,
      publicSpots: 0,
      restrictedAreas: 0,
      guidelines: 0
    };

    console.log("🚀 Starting comprehensive data population...");
    console.log("📊 Target: 3 states, 9 rivers, 45 dams with complete data");

    // Create Maharashtra
    console.log(`\n🏛️  Creating state: Maharashtra`);
    const maharashtra = new State({ name: "Maharashtra" });
    await maharashtra.save();
    totalCreated.states++;

    // Maharashtra Rivers and Dams
    const maharashtraRivers = [
      {
        name: "Godavari",
        dams: [
          {
            name: "Jayakwadi Dam",
            coordinates: { lat: 19.4833, lng: 75.3167 },
            damType: "Earthen Dam",
            constructionYear: "1976",
            operator: "Maharashtra Water Resources Department",
            maxStorage: 2909,
            liveStorage: 2171,
            deadStorage: 738,
            catchmentArea: "31731 sq km",
            surfaceArea: "351 sq km",
            height: "41.5 m",
            length: "10.8 km"
          },
          {
            name: "Vishnupuri Dam",
            coordinates: { lat: 19.2167, lng: 75.4833 },
            damType: "Concrete Gravity Dam",
            constructionYear: "1965",
            operator: "Irrigation Department Maharashtra",
            maxStorage: 465,
            liveStorage: 398,
            deadStorage: 67,
            catchmentArea: "8945 sq km",
            surfaceArea: "89 sq km",
            height: "28.5 m",
            length: "2.1 km"
          },
          {
            name: "Nathsagar Dam",
            coordinates: { lat: 19.1833, lng: 75.2167 },
            damType: "Masonry Dam",
            constructionYear: "1978",
            operator: "Maharashtra Irrigation Corporation",
            maxStorage: 312,
            liveStorage: 267,
            deadStorage: 45,
            catchmentArea: "5678 sq km",
            surfaceArea: "45 sq km",
            height: "32.8 m",
            length: "1.8 km"
          },
          {
            name: "Siddheshwar Dam",
            coordinates: { lat: 19.3167, lng: 75.1833 },
            damType: "Composite Dam",
            constructionYear: "1982",
            operator: "Water Resources Department",
            maxStorage: 189,
            liveStorage: 156,
            deadStorage: 33,
            catchmentArea: "3456 sq km",
            surfaceArea: "28 sq km",
            height: "25.4 m",
            length: "1.2 km"
          },
          {
            name: "Majalgaon Dam",
            coordinates: { lat: 19.2833, lng: 75.3833 },
            damType: "Earthen Dam",
            constructionYear: "1985",
            operator: "Maharashtra State Irrigation",
            maxStorage: 278,
            liveStorage: 234,
            deadStorage: 44,
            catchmentArea: "4567 sq km",
            surfaceArea: "38 sq km",
            height: "29.7 m",
            length: "1.6 km"
          }
        ]
      }
    ];

    // Process Maharashtra rivers
    for (const riverData of maharashtraRivers) {
      console.log(`  🌊 Creating river: ${riverData.name}`);
      const river = new River({ 
        name: riverData.name, 
        state: maharashtra._id 
      });
      await river.save();
      totalCreated.rivers++;

      // Process dams for this river
      for (let i = 0; i < riverData.dams.length; i++) {
        const damData = riverData.dams[i];
        console.log(`    🏗️  Creating dam: ${damData.name}`);
        
        // Create dam
        const dam = new Dam({
          name: damData.name,
          state: "Maharashtra",
          riverName: riverData.name,
          river: riverData.name,
          coordinates: damData.coordinates,
          damType: damData.damType,
          constructionYear: damData.constructionYear,
          operator: damData.operator,
          maxStorage: damData.maxStorage,
          liveStorage: damData.liveStorage,
          deadStorage: damData.deadStorage,
          catchmentArea: damData.catchmentArea,
          surfaceArea: damData.surfaceArea,
          height: damData.height,
          length: damData.length
        });
        await dam.save();
        totalCreated.dams++;

        // Create safety record
        const riskLevels = ["Green", "Yellow", "Red"];
        const riskLevel = riskLevels[i % 3];
        
        const safety = new Safety({
          dam: dam._id,
          floodRiskLevel: riskLevel,
          seepageReport: riskLevel === "Green" ? 
            "No significant seepage detected. All parameters within normal range." :
            riskLevel === "Yellow" ?
            "Minor seepage observed at foundation level. Flow rate: 5-8 L/min. Under regular monitoring." :
            "Significant seepage detected. Flow rate: 15-25 L/min. Enhanced monitoring implemented.",
          structuralHealth: {
            cracks: riskLevel === "Green" ? "Routine maintenance cracks sealed" : "Minor surface cracks under observation",
            vibration: "All vibration readings normal",
            tilt: "No structural displacement detected"
          },
          earthquakeZone: "Zone III - Moderate Risk",
          maintenance: {
            lastInspection: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000),
            nextInspection: new Date(Date.now() + Math.random() * 180 * 24 * 60 * 60 * 1000),
            reportFile: `${dam.name.toLowerCase().replace(/\s+/g, '_')}_inspection.pdf`
          },
          emergencyContact: {
            authorityName: damData.operator,
            phone: `+91-${Math.floor(Math.random() * 9000) + 1000}-${Math.floor(Math.random() * 900000) + 100000}`,
            email: `emergency@${damData.operator.toLowerCase().replace(/\s+/g, '')}.gov.in`,
            address: `${damData.name}, Maharashtra - ${Math.floor(Math.random() * 900000) + 100000}`
          }
        });
        await safety.save();
        totalCreated.safety++;
      }
    }

    console.log(`\n🎉 Maharashtra data created successfully!`);
    console.log(`📊 Created: ${totalCreated.states} states, ${totalCreated.rivers} rivers, ${totalCreated.dams} dams, ${totalCreated.safety} safety records`);

  } catch (error) {
    console.error("❌ Error during data population:", error);
  } finally {
    await mongoose.disconnect();
    console.log("\n🔌 Disconnected from MongoDB");
  }
}

// Run the script
populateCompleteData();