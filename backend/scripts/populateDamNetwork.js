import mongoose from "mongoose";
import dotenv from "dotenv";
import Dam from "../models/Dam.js";
import DamStatus from "../models/DamStatus.js";

dotenv.config({ path: '../.env' });

// Dam network data - organized by river systems matching createRealisticDatabase.js
const damNetworkData = {
  // Maharashtra - Godavari River (5 dams)
  maharashtra_godavari: [
    { name: "Gangapur Dam", upstream: null, upstreamDist: 0, downstream: "Jayakwadi Dam", downstreamDist: 65, inflowFromUpstream: 0, outflowToDownstream: 85 },
    { name: "Jayakwadi Dam", upstream: "Gangapur Dam", upstreamDist: 65, downstream: "Vishnupuri Barrage", downstreamDist: 55, inflowFromUpstream: 85, outflowToDownstream: 120 },
    { name: "Vishnupuri Barrage", upstream: "Jayakwadi Dam", upstreamDist: 55, downstream: "Nanded Barrage", downstreamDist: 42, inflowFromUpstream: 120, outflowToDownstream: 145 },
    { name: "Nanded Barrage", upstream: "Vishnupuri Barrage", upstreamDist: 42, downstream: "Pochampad Dam", downstreamDist: 78, inflowFromUpstream: 145, outflowToDownstream: 170 },
    { name: "Pochampad Dam", upstream: "Nanded Barrage", upstreamDist: 78, downstream: null, downstreamDist: 0, inflowFromUpstream: 170, outflowToDownstream: 0 },
  ],
  
  // Maharashtra - Krishna River (5 dams)
  maharashtra_krishna: [
    { name: "Koyna Dam", upstream: null, upstreamDist: 0, downstream: "Warna Dam", downstreamDist: 45, inflowFromUpstream: 0, outflowToDownstream: 110 },
    { name: "Warna Dam", upstream: "Koyna Dam", upstreamDist: 45, downstream: "Dhom Dam", downstreamDist: 38, inflowFromUpstream: 110, outflowToDownstream: 135 },
    { name: "Dhom Dam", upstream: "Warna Dam", upstreamDist: 38, downstream: "Ujjani Dam", downstreamDist: 85, inflowFromUpstream: 135, outflowToDownstream: 165 },
    { name: "Ujjani Dam", upstream: "Dhom Dam", upstreamDist: 85, downstream: "Almatti Dam", downstreamDist: 180, inflowFromUpstream: 165, outflowToDownstream: 200 },
    { name: "Almatti Dam", upstream: "Ujjani Dam", upstreamDist: 180, downstream: null, downstreamDist: 0, inflowFromUpstream: 200, outflowToDownstream: 0 },
  ],
  
  // Maharashtra - Tapi River (5 dams)
  maharashtra_tapi: [
    { name: "Hatnur Dam", upstream: null, upstreamDist: 0, downstream: "Panzara Dam", downstreamDist: 48, inflowFromUpstream: 0, outflowToDownstream: 55 },
    { name: "Panzara Dam", upstream: "Hatnur Dam", upstreamDist: 48, downstream: "Girna Dam", downstreamDist: 52, inflowFromUpstream: 55, outflowToDownstream: 75 },
    { name: "Girna Dam", upstream: "Panzara Dam", upstreamDist: 52, downstream: "Ukai Dam", downstreamDist: 185, inflowFromUpstream: 75, outflowToDownstream: 95 },
    { name: "Ukai Dam", upstream: "Girna Dam", upstreamDist: 185, downstream: "Kakrapar Weir", downstreamDist: 65, inflowFromUpstream: 95, outflowToDownstream: 120 },
    { name: "Kakrapar Weir", upstream: "Ukai Dam", upstreamDist: 65, downstream: null, downstreamDist: 0, inflowFromUpstream: 120, outflowToDownstream: 0 },
  ],
  
  // Karnataka - Cauvery River (5 dams)
  karnataka_cauvery: [
    { name: "Harangi Dam", upstream: null, upstreamDist: 0, downstream: "Hemavathi Dam", downstreamDist: 72, inflowFromUpstream: 0, outflowToDownstream: 90 },
    { name: "Hemavathi Dam", upstream: "Harangi Dam", upstreamDist: 72, downstream: "Krishna Raja Sagara Dam", downstreamDist: 88, inflowFromUpstream: 90, outflowToDownstream: 125 },
    { name: "Krishna Raja Sagara Dam", upstream: "Hemavathi Dam", upstreamDist: 88, downstream: "Kabini Dam", downstreamDist: 65, inflowFromUpstream: 125, outflowToDownstream: 160 },
    { name: "Kabini Dam", upstream: "Krishna Raja Sagara Dam", upstreamDist: 65, downstream: "Arkavathi Dam", downstreamDist: 45, inflowFromUpstream: 160, outflowToDownstream: 185 },
    { name: "Arkavathi Dam", upstream: "Kabini Dam", upstreamDist: 45, downstream: null, downstreamDist: 0, inflowFromUpstream: 185, outflowToDownstream: 0 },
  ],
  
  // Karnataka - Tungabhadra River (5 dams)
  karnataka_tungabhadra: [
    { name: "Tungabhadra Dam", upstream: null, upstreamDist: 0, downstream: "Munirabad Dam", downstreamDist: 95, inflowFromUpstream: 0, outflowToDownstream: 180 },
    { name: "Munirabad Dam", upstream: "Tungabhadra Dam", upstreamDist: 95, downstream: "Hospet Anicut", downstreamDist: 42, inflowFromUpstream: 180, outflowToDownstream: 195 },
    { name: "Hospet Anicut", upstream: "Munirabad Dam", upstreamDist: 42, downstream: "Kudligi Barrage", downstreamDist: 58, inflowFromUpstream: 195, outflowToDownstream: 205 },
    { name: "Kudligi Barrage", upstream: "Hospet Anicut", upstreamDist: 58, downstream: "Bellary Barrage", downstreamDist: 48, inflowFromUpstream: 205, outflowToDownstream: 215 },
    { name: "Bellary Barrage", upstream: "Kudligi Barrage", upstreamDist: 48, downstream: null, downstreamDist: 0, inflowFromUpstream: 215, outflowToDownstream: 0 },
  ],
  
  // Karnataka - Krishna River (5 dams)
  karnataka_krishna: [
    { name: "Almatti Dam", upstream: null, upstreamDist: 0, downstream: "Narayanpur Dam", downstreamDist: 95, inflowFromUpstream: 0, outflowToDownstream: 250 },
    { name: "Narayanpur Dam", upstream: "Almatti Dam", upstreamDist: 95, downstream: "Hippargi Barrage", downstreamDist: 68, inflowFromUpstream: 250, outflowToDownstream: 280 },
    { name: "Hippargi Barrage", upstream: "Narayanpur Dam", upstreamDist: 68, downstream: "Ghataprabha Dam", downstreamDist: 85, inflowFromUpstream: 280, outflowToDownstream: 295 },
    { name: "Ghataprabha Dam", upstream: "Hippargi Barrage", upstreamDist: 85, downstream: "Malaprabha Dam", downstreamDist: 72, inflowFromUpstream: 295, outflowToDownstream: 315 },
    { name: "Malaprabha Dam", upstream: "Ghataprabha Dam", upstreamDist: 72, downstream: null, downstreamDist: 0, inflowFromUpstream: 315, outflowToDownstream: 0 },
  ],
  
  // Tamil Nadu - Cauvery River (5 dams)
  tamilnadu_cauvery: [
    { name: "Mettur Dam", upstream: null, upstreamDist: 0, downstream: "Bhavani Sagar Dam", downstreamDist: 125, inflowFromUpstream: 0, outflowToDownstream: 220 },
    { name: "Bhavani Sagar Dam", upstream: "Mettur Dam", upstreamDist: 125, downstream: "Amaravathi Dam", downstreamDist: 68, inflowFromUpstream: 220, outflowToDownstream: 245 },
    { name: "Amaravathi Dam", upstream: "Bhavani Sagar Dam", upstreamDist: 68, downstream: "Aliyar Dam", downstreamDist: 55, inflowFromUpstream: 245, outflowToDownstream: 260 },
    { name: "Aliyar Dam", upstream: "Amaravathi Dam", upstreamDist: 55, downstream: "Thirumoorthy Dam", downstreamDist: 42, inflowFromUpstream: 260, outflowToDownstream: 275 },
    { name: "Thirumoorthy Dam", upstream: "Aliyar Dam", upstreamDist: 42, downstream: null, downstreamDist: 0, inflowFromUpstream: 275, outflowToDownstream: 0 },
  ],
  
  // Tamil Nadu - Vaigai River (5 dams)
  tamilnadu_vaigai: [
    { name: "Idukki Dam", upstream: null, upstreamDist: 0, downstream: "Mullaperiyar Dam", downstreamDist: 85, inflowFromUpstream: 0, outflowToDownstream: 150 },
    { name: "Mullaperiyar Dam", upstream: "Idukki Dam", upstreamDist: 85, downstream: "Periyar Dam", downstreamDist: 12, inflowFromUpstream: 150, outflowToDownstream: 165 },
    { name: "Periyar Dam", upstream: "Mullaperiyar Dam", upstreamDist: 12, downstream: "Vaigai Dam", downstreamDist: 95, inflowFromUpstream: 165, outflowToDownstream: 180 },
    { name: "Vaigai Dam", upstream: "Periyar Dam", upstreamDist: 95, downstream: "Shanmughanadi Dam", downstreamDist: 68, inflowFromUpstream: 180, outflowToDownstream: 195 },
    { name: "Shanmughanadi Dam", upstream: "Vaigai Dam", upstreamDist: 68, downstream: null, downstreamDist: 0, inflowFromUpstream: 195, outflowToDownstream: 0 },
  ],
  
  // Tamil Nadu - Palar River (5 dams)
  tamilnadu_palar: [
    { name: "Krishnagiri Dam", upstream: null, upstreamDist: 0, downstream: "Sathanur Dam", downstreamDist: 95, inflowFromUpstream: 0, outflowToDownstream: 75 },
    { name: "Sathanur Dam", upstream: "Krishnagiri Dam", upstreamDist: 95, downstream: "Poondi Reservoir", downstreamDist: 125, inflowFromUpstream: 75, outflowToDownstream: 90 },
    { name: "Poondi Reservoir", upstream: "Sathanur Dam", upstreamDist: 125, downstream: "Cholavaram Tank", downstreamDist: 28, inflowFromUpstream: 90, outflowToDownstream: 95 },
    { name: "Cholavaram Tank", upstream: "Poondi Reservoir", upstreamDist: 28, downstream: "Redhills Lake", downstreamDist: 18, inflowFromUpstream: 95, outflowToDownstream: 100 },
    { name: "Redhills Lake", upstream: "Cholavaram Tank", upstreamDist: 18, downstream: null, downstreamDist: 0, inflowFromUpstream: 100, outflowToDownstream: 0 },
  ],
};

const populateDamNetwork = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    let updatedCount = 0;
    let statusCreatedCount = 0;
    let notFoundCount = 0;

    // Flatten all dam network data
    const allDamData = [
      ...damNetworkData.maharashtra_godavari,
      ...damNetworkData.maharashtra_krishna,
      ...damNetworkData.maharashtra_tapi,
      ...damNetworkData.karnataka_cauvery,
      ...damNetworkData.karnataka_tungabhadra,
      ...damNetworkData.karnataka_krishna,
      ...damNetworkData.tamilnadu_cauvery,
      ...damNetworkData.tamilnadu_vaigai,
      ...damNetworkData.tamilnadu_palar,
    ];

    console.log(`\n📊 Processing ${allDamData.length} dams...\n`);

    for (const damData of allDamData) {
      // Find dam by name (case-insensitive)
      const dam = await Dam.findOne({ 
        name: { $regex: new RegExp(`^${damData.name}$`, 'i') } 
      });

      if (!dam) {
        console.log(`❌ Dam not found: ${damData.name}`);
        notFoundCount++;
        continue;
      }

      // Update Dam document with upstream/downstream info
      dam.upstreamDam = damData.upstream;
      dam.upstreamDamDistance = damData.upstreamDist;
      dam.downstreamDam = damData.downstream;
      dam.downstreamDamDistance = damData.downstreamDist;
      await dam.save();

      console.log(`✅ Updated CoreDamInfo: ${damData.name}`);
      console.log(`   Upstream: ${damData.upstream || 'None'} (${damData.upstreamDist} km)`);
      console.log(`   Downstream: ${damData.downstream || 'None'} (${damData.downstreamDist} km)`);
      updatedCount++;

      // Create or update DamStatus with flow data
      let status = await DamStatus.findOne({ dam: dam._id });
      
      if (!status) {
        // Create new status
        status = new DamStatus({
          dam: dam._id,
          currentWaterLevel: 50, // Default value
          levelUnit: "m",
          maxLevel: 100,
          minLevel: 20,
          inflowRate: damData.inflowFromUpstream + 30, // Total inflow (upstream + local)
          outflowRate: damData.outflowToDownstream,
          spillwayDischarge: 0,
          inflowFromUpstreamDam: damData.inflowFromUpstream,
          outflowToDownstreamDam: damData.outflowToDownstream,
          source: "manual",
          gateStatus: [{ gateNumber: 1, status: "closed", percentageOpen: 0 }],
        });
        await status.save();
        console.log(`✅ Created DamStatus: ${damData.name}`);
        console.log(`   Inflow from upstream: ${damData.inflowFromUpstream} m³/s`);
        console.log(`   Outflow to downstream: ${damData.outflowToDownstream} m³/s\n`);
        statusCreatedCount++;
      } else {
        // Update existing status
        status.inflowFromUpstreamDam = damData.inflowFromUpstream;
        status.outflowToDownstreamDam = damData.outflowToDownstream;
        await status.save();
        console.log(`✅ Updated DamStatus: ${damData.name}`);
        console.log(`   Inflow from upstream: ${damData.inflowFromUpstream} m³/s`);
        console.log(`   Outflow to downstream: ${damData.outflowToDownstream} m³/s\n`);
        statusCreatedCount++;
      }
    }

    console.log("\n" + "=".repeat(60));
    console.log("📊 SUMMARY");
    console.log("=".repeat(60));
    console.log(`✅ Dams updated (CoreDamInfo): ${updatedCount}`);
    console.log(`✅ Dam statuses created/updated: ${statusCreatedCount}`);
    console.log(`❌ Dams not found: ${notFoundCount}`);
    console.log(`📝 Total processed: ${allDamData.length}`);
    console.log("=".repeat(60));

    await mongoose.connection.close();
    console.log("\n✅ Database connection closed");
    console.log("✅ Dam network population complete!");
    
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
};

populateDamNetwork();
