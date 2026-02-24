import mongoose from "mongoose";
import dotenv from "dotenv";
import Dam from "../models/Dam.js";
import DamStatus from "../models/DamStatus.js";

dotenv.config();

// Rainfall patterns by state and river (m³/s)
// These represent typical monsoon season rainfall contributions
const rainfallData = {
  // Maharashtra - receives good monsoon rainfall
  maharashtra: {
    godavari: [25.5, 28.3, 32.1, 29.8, 26.4], // Gangapur, Jayakwadi, Vishnupuri, Nanded, Pochampad
    krishna: [22.8, 24.5, 26.2, 28.9, 31.5], // Koyna, Warna, Dhom, Ujjani, Almatti
    tapi: [18.5, 20.2, 22.8, 25.4, 23.1], // Hatnur, Panzara, Girna, Ukai, Kakrapar
  },
  
  // Karnataka - moderate to high rainfall
  karnataka: {
    cauvery: [30.2, 32.8, 35.5, 33.1, 28.7], // Harangi, Hemavathi, KRS, Kabini, Arkavathi
    tungabhadra: [24.6, 26.3, 28.1, 29.5, 27.8], // Tungabhadra, Munirabad, Hospet, Kudligi, Bellary
    krishna: [31.5, 33.2, 35.8, 37.4, 34.9], // Almatti, Narayanpur, Hippargi, Ghataprabha, Malaprabha
  },
  
  // Tamil Nadu - varied rainfall (coastal and interior)
  tamilnadu: {
    cauvery: [28.5, 30.2, 32.8, 31.5, 29.3], // Mettur, Bhavani Sagar, Amaravathi, Aliyar, Thirumoorthy
    vaigai: [26.8, 28.5, 30.1, 29.2, 27.6], // Idukki, Mullaperiyar, Periyar, Vaigai, Shanmughanadi
    palar: [15.2, 16.8, 18.5, 17.3, 16.1], // Krishnagiri, Sathanur, Poondi, Cholavaram, Redhills
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

const populateRainfallData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    let updatedCount = 0;
    let notFoundCount = 0;
    let skippedCount = 0;

    console.log("\n📊 Populating rainfall data for 45 dams...\n");
    console.log("=".repeat(80));

    // Process each state
    for (const [state, rivers] of Object.entries(damsByStateRiver)) {
      console.log(`\n🌍 Processing ${state.toUpperCase()} dams...`);
      
      // Process each river in the state
      for (const [river, damNames] of Object.entries(rivers)) {
        console.log(`\n  🌊 ${river.charAt(0).toUpperCase() + river.slice(1)} River:`);
        
        const rainfallRates = rainfallData[state][river];
        
        // Process each dam in the river
        for (let i = 0; i < damNames.length; i++) {
          const damName = damNames[i];
          const rainfallRate = rainfallRates[i];
          
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

          // Update rainfall rate
          status.rainfallRate = rainfallRate;
          await status.save();

          console.log(`    ✅ ${damName}: ${rainfallRate} m³/s`);
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
    const allStatuses = await DamStatus.find({ rainfallRate: { $exists: true, $ne: null } });
    const rainfallRates = allStatuses.map(s => s.rainfallRate);
    const avgRainfall = rainfallRates.reduce((a, b) => a + b, 0) / rainfallRates.length;
    const minRainfall = Math.min(...rainfallRates);
    const maxRainfall = Math.max(...rainfallRates);

    console.log("\n📈 RAINFALL STATISTICS");
    console.log("=".repeat(80));
    console.log(`Average rainfall rate: ${avgRainfall.toFixed(2)} m³/s`);
    console.log(`Minimum rainfall rate: ${minRainfall.toFixed(2)} m³/s`);
    console.log(`Maximum rainfall rate: ${maxRainfall.toFixed(2)} m³/s`);
    console.log("=".repeat(80));

    console.log("\n🌧️  RAINFALL BY REGION");
    console.log("=".repeat(80));
    
    // Calculate averages by state
    const maharashtraStatuses = await DamStatus.find().populate({
      path: 'dam',
      match: { state: 'Maharashtra' }
    });
    const maharashtraRainfall = maharashtraStatuses
      .filter(s => s.dam && s.rainfallRate)
      .map(s => s.rainfallRate);
    const maharashtraAvg = maharashtraRainfall.length > 0 
      ? maharashtraRainfall.reduce((a, b) => a + b, 0) / maharashtraRainfall.length 
      : 0;

    const karnatakaStatuses = await DamStatus.find().populate({
      path: 'dam',
      match: { state: 'Karnataka' }
    });
    const karnatakaRainfall = karnatakaStatuses
      .filter(s => s.dam && s.rainfallRate)
      .map(s => s.rainfallRate);
    const karnatakaAvg = karnatakaRainfall.length > 0 
      ? karnatakaRainfall.reduce((a, b) => a + b, 0) / karnatakaRainfall.length 
      : 0;

    const tamilnaduStatuses = await DamStatus.find().populate({
      path: 'dam',
      match: { state: 'Tamil Nadu' }
    });
    const tamilnaduRainfall = tamilnaduStatuses
      .filter(s => s.dam && s.rainfallRate)
      .map(s => s.rainfallRate);
    const tamilnaduAvg = tamilnaduRainfall.length > 0 
      ? tamilnaduRainfall.reduce((a, b) => a + b, 0) / tamilnaduRainfall.length 
      : 0;

    console.log(`Maharashtra average: ${maharashtraAvg.toFixed(2)} m³/s (${maharashtraRainfall.length} dams)`);
    console.log(`Karnataka average: ${karnatakaAvg.toFixed(2)} m³/s (${karnatakaRainfall.length} dams)`);
    console.log(`Tamil Nadu average: ${tamilnaduAvg.toFixed(2)} m³/s (${tamilnaduRainfall.length} dams)`);
    console.log("=".repeat(80));

    await mongoose.connection.close();
    console.log("\n✅ Database connection closed");
    console.log("✅ Rainfall data population complete!");
    
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
};

populateRainfallData();
