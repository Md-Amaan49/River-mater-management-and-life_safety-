import mongoose from "mongoose";
import dotenv from "dotenv";
import Dam from "../models/Dam.js";
import DamStatus from "../models/DamStatus.js";

dotenv.config();

// Evaporation rates by state (m³/s)
// Evaporation varies by climate, temperature, and surface area
// Higher in hot, dry regions; lower in cooler, humid regions
const evaporationData = {
  // Maharashtra - hot climate, moderate evaporation
  maharashtra: {
    godavari: [3.2, 3.5, 3.8, 3.6, 3.3], // Gangapur, Jayakwadi, Vishnupuri, Nanded, Pochampad
    krishna: [2.8, 3.0, 3.2, 3.5, 3.8], // Koyna, Warna, Dhom, Ujjani, Almatti
    tapi: [2.5, 2.7, 2.9, 3.2, 3.0], // Hatnur, Panzara, Girna, Ukai, Kakrapar
  },
  
  // Karnataka - varied climate, moderate evaporation
  karnataka: {
    cauvery: [3.5, 3.8, 4.2, 3.9, 3.4], // Harangi, Hemavathi, KRS, Kabini, Arkavathi
    tungabhadra: [3.0, 3.2, 3.4, 3.6, 3.3], // Tungabhadra, Munirabad, Hospet, Kudligi, Bellary
    krishna: [3.8, 4.0, 4.3, 4.5, 4.2], // Almatti, Narayanpur, Hippargi, Ghataprabha, Malaprabha
  },
  
  // Tamil Nadu - hot and humid, higher evaporation
  tamilnadu: {
    cauvery: [3.8, 4.0, 4.3, 4.1, 3.9], // Mettur, Bhavani Sagar, Amaravathi, Aliyar, Thirumoorthy
    vaigai: [3.5, 3.7, 3.9, 3.8, 3.6], // Idukki, Mullaperiyar, Periyar, Vaigai, Shanmughanadi
    palar: [2.2, 2.4, 2.6, 2.5, 2.3], // Krishnagiri, Sathanur, Poondi, Cholavaram, Redhills
  },
};

// Dam names organized by state and river
const damsByStateRiver = {
  maharashtra: {
    godavari: ["Gangapur Dam", "Jayakwadi Dam", "Vishnupuri Barrage", "Nanded Barrage", "Pochampad Dam"],
    krishna: ["Koyna Dam", "Warna Dam", "Dhom Dam", "Ujjani Dam", "Almatti Dam"],
    tapi: ["Hatnur Dam", "Panzara Dam", "Girna Dam", "Ukai Dam", "Kakrapar Weir"],
  },
  karnataka: {
    cauvery: ["Harangi Dam", "Hemavathi Dam", "Krishna Raja Sagara Dam", "Kabini Dam", "Arkavathi Dam"],
    tungabhadra: ["Tungabhadra Dam", "Munirabad Dam", "Hospet Anicut", "Kudligi Barrage", "Bellary Barrage"],
    krishna: ["Almatti Dam", "Narayanpur Dam", "Hippargi Barrage", "Ghataprabha Dam", "Malaprabha Dam"],
  },
  tamilnadu: {
    cauvery: ["Mettur Dam", "Bhavani Sagar Dam", "Amaravathi Dam", "Aliyar Dam", "Thirumoorthy Dam"],
    vaigai: ["Idukki Dam", "Mullaperiyar Dam", "Periyar Dam", "Vaigai Dam", "Shanmughanadi Dam"],
    palar: ["Krishnagiri Dam", "Sathanur Dam", "Poondi Reservoir", "Cholavaram Tank", "Redhills Lake"],
  },
};

const populateEvaporationData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    let updatedCount = 0;
    let notFoundCount = 0;
    let skippedCount = 0;

    console.log("\n📊 Populating evaporation data for 45 dams...\n");
    console.log("=".repeat(80));

    // Process each state
    for (const [state, rivers] of Object.entries(damsByStateRiver)) {
      console.log(`\n🌍 Processing ${state.toUpperCase()} dams...`);
      
      // Process each river in the state
      for (const [river, damNames] of Object.entries(rivers)) {
        console.log(`\n  🌊 ${river.charAt(0).toUpperCase() + river.slice(1)} River:`);
        
        const evaporationRates = evaporationData[state][river];
        
        // Process each dam in the river
        for (let i = 0; i < damNames.length; i++) {
          const damName = damNames[i];
          const evaporationRate = evaporationRates[i];
          
          // Find dam by name
          const dam = await Dam.findOne({ 
            name: { $regex: new RegExp(`^${damName}$`, 'i') } 
          });

          if (!dam) {
            console.log(`    ❌ Dam not found: ${damName}`);
            notFoundCount++;
            continue;
          }

          // Find dam status
          const status = await DamStatus.findOne({ dam: dam._id });

          if (!status) {
            console.log(`    ⚠️  ${damName}: No status record found - skipped`);
            skippedCount++;
            continue;
          }

          // Update evaporation rate
          status.evaporationRate = evaporationRate;
          await status.save();

          console.log(`    ✅ ${damName}: ${evaporationRate} m³/s`);
          console.log(`       Total Inflow: ${(status.totalInflow || 0).toFixed(2)} m³/s`);
          console.log(`       Spillway Discharge: ${(status.spillwayDischarge || 0).toFixed(2)} m³/s`);
          updatedCount++;
        }
      }
    }

    console.log("\n" + "=".repeat(80));
    console.log("📊 SUMMARY");
    console.log("=".repeat(80));
    console.log(`✅ Dam statuses updated: ${updatedCount}`);
    console.log(`❌ Dams not found: ${notFoundCount}`);
    console.log(`⚠️  Skipped (no status): ${skippedCount}`);
    console.log(`📝 Total expected: 45`);
    console.log("=".repeat(80));

    // Calculate statistics
    const allStatuses = await DamStatus.find({ evaporationRate: { $exists: true, $ne: null } });
    const evaporationRates = allStatuses.map(s => s.evaporationRate);
    const avgEvaporation = evaporationRates.reduce((a, b) => a + b, 0) / evaporationRates.length;
    const minEvaporation = Math.min(...evaporationRates);
    const maxEvaporation = Math.max(...evaporationRates);

    console.log("\n📈 EVAPORATION STATISTICS");
    console.log("=".repeat(80));
    console.log(`Average evaporation rate: ${avgEvaporation.toFixed(2)} m³/s`);
    console.log(`Minimum evaporation rate: ${minEvaporation.toFixed(2)} m³/s`);
    console.log(`Maximum evaporation rate: ${maxEvaporation.toFixed(2)} m³/s`);
    console.log("=".repeat(80));

    // Show water balance for a few sample dams
    console.log("\n💧 WATER BALANCE SAMPLES");
    console.log("=".repeat(80));
    
    const sampleDams = await DamStatus.find()
      .populate('dam', 'name state')
      .limit(5);
    
    sampleDams.forEach(status => {
      if (status.dam) {
        const netChange = (status.totalInflow || 0) - (status.spillwayDischarge || 0) - (status.evaporationRate || 0);
        console.log(`\n📍 ${status.dam.name} (${status.dam.state})`);
        console.log(`   Total Inflow: ${(status.totalInflow || 0).toFixed(2)} m³/s`);
        console.log(`   Spillway Discharge: ${(status.spillwayDischarge || 0).toFixed(2)} m³/s`);
        console.log(`   Evaporation: ${(status.evaporationRate || 0).toFixed(2)} m³/s`);
        console.log(`   Net Change: ${netChange.toFixed(2)} m³/s ${netChange > 0 ? '(gaining)' : '(losing)'}`);
      }
    });

    console.log("\n" + "=".repeat(80));

    await mongoose.connection.close();
    console.log("\n✅ Database connection closed");
    console.log("✅ Evaporation data population complete!");
    
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
};

populateEvaporationData();
