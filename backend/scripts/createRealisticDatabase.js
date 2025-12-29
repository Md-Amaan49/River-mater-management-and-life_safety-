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
import DamStatus from "../models/DamStatus.js";
import WaterUsage from "../models/WaterUsage.js";

dotenv.config({ path: '../.env' });

async function createRealisticDatabase() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Clear existing data
    await State.deleteMany({});
    await River.deleteMany({});
    await Dam.deleteMany({});
    await Safety.deleteMany({});
    await DamHistory.deleteMany({});
    await PublicSpot.deleteMany({});
    await RestrictedArea.deleteMany({});
    await Guideline.deleteMany({});
    await DamStatus.deleteMany({});
    await WaterUsage.deleteMany({});
    console.log("🗑️  Cleared existing data");

    let totalCreated = { 
      states: 0, rivers: 0, dams: 0, safety: 0, history: 0, 
      publicSpots: 0, restrictedAreas: 0, guidelines: 0, 
      damStatus: 0, waterUsage: 0 
    };

    // Realistic dam data for each state and river
    const statesData = [
      {
        name: "Maharashtra",
        rivers: [
          {
            name: "Godavari",
            dams: [
              { name: "Jayakwadi Dam", type: "Earthen Dam", year: "1976", height: "41.5", capacity: 2909 },
              { name: "Vishnupuri Barrage", type: "Concrete Barrage", year: "1965", height: "15.2", capacity: 125 },
              { name: "Nanded Barrage", type: "Concrete Barrage", year: "1978", height: "18.3", capacity: 89 },
              { name: "Pochampad Dam", type: "Masonry Dam", year: "1982", height: "28.5", capacity: 1800 },
              { name: "Gangapur Dam", type: "Masonry Dam", year: "1955", height: "32.0", capacity: 1250 }
            ]
          },
          {
            name: "Krishna",
            dams: [
              { name: "Koyna Dam", type: "Concrete Arch Dam", year: "1964", height: "103.0", capacity: 2797 },
              { name: "Warna Dam", type: "Earthen Dam", year: "1993", height: "52.0", capacity: 1100 },
              { name: "Dhom Dam", type: "Masonry Dam", year: "1982", height: "46.0", capacity: 560 },
              { name: "Ujjani Dam", type: "Earthen Dam", year: "1980", height: "58.5", capacity: 3340 },
              { name: "Almatti Dam", type: "Concrete Gravity Dam", year: "2005", height: "123.0", capacity: 3406 }
            ]
          },
          {
            name: "Tapi",
            dams: [
              { name: "Ukai Dam", type: "Masonry Dam", year: "1972", height: "80.0", capacity: 8511 },
              { name: "Kakrapar Weir", type: "Concrete Weir", year: "1957", height: "12.0", capacity: 45 },
              { name: "Girna Dam", type: "Earthen Dam", year: "1979", height: "42.0", capacity: 398 },
              { name: "Panzara Dam", type: "Earthen Dam", year: "1985", height: "35.5", capacity: 312 },
              { name: "Hatnur Dam", type: "Earthen Dam", year: "1991", height: "28.0", capacity: 189 }
            ]
          }
        ]
      },
      {
        name: "Karnataka",
        rivers: [
          {
            name: "Cauvery",
            dams: [
              { name: "Krishna Raja Sagara Dam", type: "Masonry Dam", year: "1931", height: "40.0", capacity: 1368 },
              { name: "Kabini Dam", type: "Masonry Dam", year: "1974", height: "58.5", capacity: 544 },
              { name: "Harangi Dam", type: "Earthen Dam", year: "1979", height: "50.6", capacity: 417 },
              { name: "Hemavathi Dam", type: "Masonry Dam", year: "1979", height: "58.4", capacity: 1048 },
              { name: "Arkavathi Dam", type: "Earthen Dam", year: "1967", height: "32.0", capacity: 125 }
            ]
          },
          {
            name: "Tungabhadra",
            dams: [
              { name: "Tungabhadra Dam", type: "Masonry Dam", year: "1953", height: "49.4", capacity: 3276 },
              { name: "Hospet Anicut", type: "Concrete Weir", year: "1892", height: "8.5", capacity: 15 },
              { name: "Munirabad Dam", type: "Earthen Dam", year: "1975", height: "25.0", capacity: 89 },
              { name: "Kudligi Barrage", type: "Concrete Barrage", year: "1988", height: "12.5", capacity: 35 },
              { name: "Bellary Barrage", type: "Concrete Barrage", year: "1995", height: "15.2", capacity: 42 }
            ]
          },
          {
            name: "Krishna",
            dams: [
              { name: "Almatti Dam", type: "Concrete Gravity Dam", year: "2005", height: "123.0", capacity: 3406 },
              { name: "Narayanpur Dam", type: "Masonry Dam", year: "1982", height: "30.5", capacity: 312 },
              { name: "Hippargi Barrage", type: "Concrete Barrage", year: "1977", height: "18.0", capacity: 78 },
              { name: "Ghataprabha Dam", type: "Masonry Dam", year: "1977", height: "64.0", capacity: 1368 },
              { name: "Malaprabha Dam", type: "Masonry Dam", year: "1973", height: "61.0", capacity: 1123 }
            ]
          }
        ]
      },
      {
        name: "Tamil Nadu",
        rivers: [
          {
            name: "Cauvery",
            dams: [
              { name: "Mettur Dam", type: "Masonry Dam", year: "1934", height: "65.0", capacity: 2648 },
              { name: "Bhavani Sagar Dam", type: "Masonry Dam", year: "1955", height: "38.1", capacity: 1465 },
              { name: "Amaravathi Dam", type: "Masonry Dam", year: "1957", height: "33.5", capacity: 528 },
              { name: "Aliyar Dam", type: "Masonry Dam", year: "1962", height: "67.4", capacity: 97 },
              { name: "Thirumoorthy Dam", type: "Masonry Dam", year: "1965", height: "58.5", capacity: 365 }
            ]
          },
          {
            name: "Vaigai",
            dams: [
              { name: "Vaigai Dam", type: "Composite Dam", year: "1959", height: "111.0", capacity: 1465 },
              { name: "Periyar Dam", type: "Masonry Dam", year: "1895", height: "53.6", capacity: 443 },
              { name: "Mullaperiyar Dam", type: "Masonry Dam", year: "1895", height: "53.6", capacity: 443 },
              { name: "Idukki Dam", type: "Concrete Arch Dam", year: "1976", height: "168.9", capacity: 1996 },
              { name: "Shanmughanadi Dam", type: "Earthen Dam", year: "1982", height: "28.5", capacity: 156 }
            ]
          },
          {
            name: "Palar",
            dams: [
              { name: "Krishnagiri Dam", type: "Earthen Dam", year: "1957", height: "38.4", capacity: 1465 },
              { name: "Sathanur Dam", type: "Masonry Dam", year: "1958", height: "36.6", capacity: 2279 },
              { name: "Poondi Reservoir", type: "Earthen Dam", year: "1944", height: "15.2", capacity: 100 },
              { name: "Cholavaram Tank", type: "Earthen Dam", year: "1876", height: "12.8", capacity: 45 },
              { name: "Redhills Lake", type: "Earthen Dam", year: "1893", height: "18.3", capacity: 93 }
            ]
          }
        ]
      }
    ];

    for (const stateData of statesData) {
      console.log(`\n🏛️  Creating state: ${stateData.name}`);
      const state = new State({ name: stateData.name });
      await state.save();
      totalCreated.states++;

      for (const riverData of stateData.rivers) {
        const riverName = riverData.name;
        console.log(`  🌊 Creating river: ${riverName}`);
        
        const river = new River({ name: riverName, state: state._id });
        await river.save();
        totalCreated.rivers++;

        for (const damData of riverData.dams) {
          console.log(`    🏗️  Creating dam: ${damData.name}`);
          
          // Create realistic coordinates based on state
          let baseCoords = { lat: 20, lng: 77 }; // Default India center
          if (stateData.name === "Maharashtra") baseCoords = { lat: 19.7515, lng: 75.7139 };
          else if (stateData.name === "Karnataka") baseCoords = { lat: 15.3173, lng: 75.7139 };
          else if (stateData.name === "Tamil Nadu") baseCoords = { lat: 11.1271, lng: 78.6569 };
          
          const dam = new Dam({
            name: damData.name,
            state: stateData.name,
            riverName: riverName,
            river: riverName,
            coordinates: {
              lat: baseCoords.lat + (Math.random() - 0.5) * 4,
              lng: baseCoords.lng + (Math.random() - 0.5) * 4
            },
            damType: damData.type,
            constructionYear: damData.year,
            operator: `${stateData.name} Water Resources Department`,
            maxStorage: damData.capacity, // MCM (Million Cubic Meters)
            liveStorage: Math.floor(damData.capacity * 0.8), // MCM
            deadStorage: Math.floor(damData.capacity * 0.1), // MCM
            catchmentArea: `${Math.floor(Math.random() * 50000) + 1000} sq km`,
            surfaceArea: `${Math.floor(Math.random() * 500) + 50} sq km`,
            height: `${damData.height} m`,
            length: `${(Math.random() * 5 + 0.5).toFixed(1)} km`
          });
          await dam.save();
          totalCreated.dams++;

          // Create realistic water level and flow data
          const currentLevel = Math.floor(Math.random() * 100) + 50; // 50-150m
          const maxLevel = currentLevel + Math.floor(Math.random() * 50) + 20; // 70-200m
          const inflow = Math.floor(Math.random() * 5000) + 100; // 100-5100 m³/s
          const outflow = Math.floor(inflow * (0.7 + Math.random() * 0.3)); // 70-100% of inflow
          
          const damStatus = new DamStatus({
            dam: dam._id,
            currentWaterLevel: currentLevel,
            levelUnit: "m",
            maxLevel: maxLevel,
            minLevel: Math.floor(currentLevel * 0.3),
            inflowRate: inflow,
            outflowRate: outflow,
            spillwayDischarge: Math.random() > 0.7 ? Math.floor(Math.random() * 2000) + 500 : 0,
            gateStatus: Array.from({length: Math.floor(Math.random() * 5) + 3}, (_, i) => ({
              gateNumber: i + 1,
              status: Math.random() > 0.7 ? "open" : "closed",
              percentageOpen: Math.random() > 0.7 ? Math.floor(Math.random() * 100) : 0
            })),
            source: "sensor",
            sensorId: `SENSOR_${dam._id.toString().slice(-6).toUpperCase()}`,
            powerStatus: ["ok", "low", "offline"][Math.floor(Math.random() * 3)],
            lastSyncAt: new Date()
          });
          await damStatus.save();
          totalCreated.damStatus++;

          // Create water usage data (all in MCM - Million Cubic Meters)
          const totalCapacity = damData.capacity; // MCM
          const irrigation = Math.floor(totalCapacity * (0.4 + Math.random() * 0.3)); // 40-70% in MCM
          const drinking = Math.floor(totalCapacity * (0.1 + Math.random() * 0.2)); // 10-30% in MCM
          const industrial = Math.floor(totalCapacity * (0.05 + Math.random() * 0.15)); // 5-20% in MCM
          const hydropower = Math.floor(totalCapacity * (0.1 + Math.random() * 0.2)); // 10-30% in MCM
          
          const waterUsage = new WaterUsage({
            damId: dam._id,
            irrigation: irrigation, // MCM
            drinking: drinking, // MCM
            industrial: industrial, // MCM
            hydropower: hydropower, // MCM
            evaporationLoss: Math.floor(totalCapacity * 0.05), // MCM
            environmentalFlow: Math.floor(totalCapacity * 0.1), // MCM
            farmingSupport: Math.floor(Math.random() * 50000) + 10000 // hectares (not MCM)
          });
          await waterUsage.save();
          totalCreated.waterUsage++;

          // Create safety record with realistic data
          const riskLevels = ["Green", "Yellow", "Red"];
          const riskLevel = riskLevels[Math.floor(Math.random() * 3)];
          
          const safety = new Safety({
            dam: dam._id,
            floodRiskLevel: riskLevel,
            seepageReport: riskLevel === "Green" ? 
              "No significant seepage detected. All parameters within normal range." :
              riskLevel === "Yellow" ?
              "Minor seepage observed. Flow rate: 5-8 L/min. Under monitoring." :
              "Significant seepage detected. Flow rate: 15-25 L/min. Enhanced monitoring required.",
            structuralHealth: {
              cracks: riskLevel === "Green" ? "No structural issues detected" : 
                     riskLevel === "Yellow" ? "Minor hairline cracks under observation" :
                     "Structural cracks requiring immediate attention",
              vibration: "Normal operational vibrations within acceptable limits",
              tilt: "No structural displacement detected"
            },
            earthquakeZone: `Zone ${Math.floor(Math.random() * 4) + 1} - ${["Low", "Moderate", "High", "Very High"][Math.floor(Math.random() * 4)]} Risk`,
            maintenance: {
              lastInspection: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000),
              nextInspection: new Date(Date.now() + Math.random() * 180 * 24 * 60 * 60 * 1000),
              reportFile: `${damData.name.toLowerCase().replace(/\s+/g, '_')}_inspection_report.pdf`
            },
            emergencyContact: {
              authorityName: `${stateData.name} Dam Safety Authority`,
              phone: `+91-${Math.floor(Math.random() * 9000) + 1000}-${Math.floor(Math.random() * 900000) + 100000}`,
              email: `emergency@${stateData.name.toLowerCase().replace(/\s+/g, '')}dams.gov.in`,
              address: `${damData.name} Control Room, ${stateData.name} - ${Math.floor(Math.random() * 900000) + 100000}`
            }
          });
          await safety.save();
          totalCreated.safety++;

          // Create historical events
          const eventTypes = ["maintenance", "flood", "inspection", "repair", "upgrade", "emergency"];
          const severities = ["low", "medium", "high", "critical"];
          
          for (let h = 1; h <= 3; h++) {
            const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
            const severity = severities[Math.floor(Math.random() * severities.length)];
            
            const history = new DamHistory({
              dam: dam._id,
              eventType: eventType,
              title: `${eventType.charAt(0).toUpperCase() + eventType.slice(1)} at ${damData.name}`,
              description: `Comprehensive ${eventType} operation conducted at ${damData.name} on ${riverName} river.`,
              eventDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
              severity: severity,
              impact: `${severity.charAt(0).toUpperCase() + severity.slice(1)} impact on dam operations and downstream areas.`,
              actionsTaken: `Standard ${eventType} protocols implemented with appropriate safety measures.`,
              cost: Math.floor(Math.random() * 10000000) + 500000,
              duration: `${Math.floor(Math.random() * 45) + 5} days`,
              affectedAreas: [`${damData.name} vicinity`, `Downstream ${riverName} basin`, `${stateData.name} irrigation network`],
              reportedBy: {
                name: `${["Dr. Rajesh Kumar", "Eng. Priya Sharma", "Mr. Suresh Patel", "Dr. Meera Singh"][Math.floor(Math.random() * 4)]}`,
                designation: "Chief Dam Engineer",
                contact: `+91-${Math.floor(Math.random() * 9000) + 1000}-${Math.floor(Math.random() * 900000) + 100000}`
              },
              status: ["resolved", "monitoring", "closed"][Math.floor(Math.random() * 3)]
            });
            await history.save();
            totalCreated.history++;
          }

          // Create public spots near the dam
          const spotTypes = ["temple", "tourist_spot", "viewpoint", "park", "restaurant", "hotel"];
          const publicSpot = new PublicSpot({
            name: `${damData.name} ${spotTypes[Math.floor(Math.random() * spotTypes.length)].replace('_', ' ')}`,
            type: spotTypes[Math.floor(Math.random() * spotTypes.length)],
            description: `Popular destination near ${damData.name} offering scenic views and recreational facilities.`,
            location: {
              address: `Near ${damData.name}, ${riverName} Basin, ${stateData.name}`,
              coordinates: {
                latitude: baseCoords.lat + (Math.random() - 0.5) * 0.1,
                longitude: baseCoords.lng + (Math.random() - 0.5) * 0.1
              },
              city: `${damData.name.split(' ')[0]} City`,
              state: stateData.name,
              pincode: `${Math.floor(Math.random() * 900000) + 100000}`
            },
            nearbyDams: [{ dam: dam._id, distance: Math.floor(Math.random() * 5) + 1 }],
            facilities: ["parking", "restroom", "food", "accommodation", "boating"].slice(0, Math.floor(Math.random() * 3) + 2),
            openingHours: "6:00 AM - 8:00 PM",
            contactInfo: {
              phone: `+91-${Math.floor(Math.random() * 9000) + 1000}-${Math.floor(Math.random() * 900000) + 100000}`,
              email: `info@${damData.name.toLowerCase().replace(/\s+/g, '')}tourism.com`
            },
            rating: Math.floor(Math.random() * 2) + 4,
            accessibility: {
              wheelchairAccessible: Math.random() > 0.5,
              publicTransport: Math.random() > 0.3,
              parking: true
            }
          });
          await publicSpot.save();
          totalCreated.publicSpots++;

          // Create restricted area
          const restrictedArea = new RestrictedArea({
            name: `${damData.name} Security Perimeter`,
            type: "dam_restricted_zone",
            description: `High-security restricted zone around ${damData.name} critical infrastructure and operational areas.`,
            location: {
              address: `${damData.name} Security Zone, ${stateData.name}`,
              coordinates: {
                latitude: baseCoords.lat + (Math.random() - 0.5) * 0.05,
                longitude: baseCoords.lng + (Math.random() - 0.5) * 0.05
              },
              city: `${damData.name.split(' ')[0]} City`,
              state: stateData.name
            },
            nearbyDams: [{ dam: dam._id, distance: 0.2, riskLevel: "high" }],
            restrictionLevel: "no_entry",
            dangerType: ["structural_collapse", "flood_risk", "contamination"],
            restrictions: {
              noEntry: true,
              permitRequired: true,
              timeRestrictions: "24/7 restriction - No public access"
            },
            penalties: { fine: 100000, imprisonment: "Up to 1 year" },
            contactAuthority: {
              name: "Dam Security Chief",
              phone: `+91-${Math.floor(Math.random() * 9000) + 1000}-${Math.floor(Math.random() * 900000) + 100000}`,
              office: `${damData.name} Security Control Room`
            },
            signageInfo: { hasSignage: true, signageType: "High-visibility warning boards with multilingual text" },
            emergencyInfo: {
              emergencyContact: `+91-${Math.floor(Math.random() * 9000) + 1000}-${Math.floor(Math.random() * 900000) + 100000}`,
              nearestHospital: `${damData.name.split(' ')[0]} District Hospital`
            }
          });
          await restrictedArea.save();
          totalCreated.restrictedAreas++;

          // Create guidelines
          const categories = ["safety", "operation", "emergency", "visitor", "maintenance"];
          for (let g = 1; g <= 2; g++) {
            const category = categories[Math.floor(Math.random() * categories.length)];
            const guideline = new Guideline({
              title: `${damData.name} ${category.charAt(0).toUpperCase() + category.slice(1)} Protocol`,
              category: category,
              description: `Comprehensive ${category} guidelines and procedures for ${damData.name} operations.`,
              content: `Detailed ${category} protocols covering all aspects of ${damData.name} management and operations.`,
              applicableDams: [{ dam: dam._id, isSpecific: true }],
              priority: g === 1 ? "high" : "medium",
              targetAudience: ["operators", "maintenance_staff", "emergency_responders"],
              steps: [
                { stepNumber: 1, title: "Initial Assessment", description: "Conduct thorough evaluation of current conditions", isRequired: true },
                { stepNumber: 2, title: "Protocol Implementation", description: "Execute established procedures with safety measures", isRequired: true },
                { stepNumber: 3, title: "Monitoring & Documentation", description: "Continuous monitoring and detailed documentation", isRequired: true }
              ],
              compliance: { 
                isRegulatory: true, 
                authority: "Central Water Commission & Dam Safety Authority",
                regulationNumber: `CWC-${Math.floor(Math.random() * 9000) + 1000}`
              },
              effectiveDate: new Date(),
              version: "2.1",
              approvedBy: { 
                name: "Chief Engineer", 
                designation: `${stateData.name} Dam Authority`, 
                date: new Date() 
              }
            });
            await guideline.save();
            totalCreated.guidelines++;
          }
        }
      }
    }

    console.log(`\n🎉 Realistic database population completed successfully!`);
    console.log(`\n📊 Summary of created records:`);
    console.log(`🏛️  States: ${totalCreated.states}`);
    console.log(`🌊 Rivers: ${totalCreated.rivers}`);
    console.log(`🏗️  Dams: ${totalCreated.dams}`);
    console.log(`💧 Dam Status Records: ${totalCreated.damStatus}`);
    console.log(`🚰 Water Usage Records: ${totalCreated.waterUsage}`);
    console.log(`🚨 Safety Records: ${totalCreated.safety}`);
    console.log(`📜 History Events: ${totalCreated.history}`);
    console.log(`📍 Public Spots: ${totalCreated.publicSpots}`);
    console.log(`⛔ Restricted Areas: ${totalCreated.restrictedAreas}`);
    console.log(`📄 Guidelines: ${totalCreated.guidelines}`);
    console.log(`\n🔢 Total Records: ${Object.values(totalCreated).reduce((a, b) => a + b, 0)}`);

  } catch (error) {
    console.error("❌ Error during realistic database creation:", error);
  } finally {
    await mongoose.disconnect();
    console.log("\n🔌 Disconnected from MongoDB");
  }
}

// Run the script
createRealisticDatabase();