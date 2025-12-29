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

dotenv.config({ path: '../.env' });

async function createFullDatabase() {
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
    console.log("🗑️  Cleared existing data");

    let totalCreated = { states: 0, rivers: 0, dams: 0, safety: 0, history: 0, publicSpots: 0, restrictedAreas: 0, guidelines: 0 };

    // Create 3 States
    const states = [
      { name: "Maharashtra", rivers: ["Godavari", "Krishna", "Tapi"] },
      { name: "Karnataka", rivers: ["Cauvery", "Tungabhadra", "Krishna"] },
      { name: "Tamil Nadu", rivers: ["Cauvery", "Vaigai", "Palar"] }
    ];

    for (const stateData of states) {
      console.log(`\n🏛️  Creating state: ${stateData.name}`);
      const state = new State({ name: stateData.name });
      await state.save();
      totalCreated.states++;

      // Create 3 rivers per state
      for (let r = 0; r < stateData.rivers.length; r++) {
        const riverName = stateData.rivers[r];
        console.log(`  🌊 Creating river: ${riverName}`);
        
        const river = new River({ name: riverName, state: state._id });
        await river.save();
        totalCreated.rivers++;

        // Create 5 dams per river
        for (let d = 1; d <= 5; d++) {
          const damName = `${riverName} Dam ${d}`;
          console.log(`    🏗️  Creating dam: ${damName}`);
          
          // Create dam with complete data
          const dam = new Dam({
            name: damName,
            state: stateData.name,
            riverName: riverName,
            river: riverName,
            coordinates: {
              lat: 10 + Math.random() * 20,
              lng: 70 + Math.random() * 20
            },
            damType: ["Concrete Gravity Dam", "Earthen Dam", "Masonry Dam", "Arch Dam", "Composite Dam"][d % 5],
            constructionYear: (1950 + Math.floor(Math.random() * 70)).toString(),
            operator: `${stateData.name} Water Resources Department`,
            maxStorage: Math.floor(Math.random() * 5000) + 500,
            liveStorage: Math.floor(Math.random() * 3000) + 400,
            deadStorage: Math.floor(Math.random() * 500) + 50,
            catchmentArea: `${Math.floor(Math.random() * 50000) + 1000} sq km`,
            surfaceArea: `${Math.floor(Math.random() * 500) + 50} sq km`,
            height: `${Math.floor(Math.random() * 100) + 20} m`,
            length: `${(Math.random() * 5 + 0.5).toFixed(1)} km`
          });
          await dam.save();
          totalCreated.dams++;

          // Create safety record
          const riskLevels = ["Green", "Yellow", "Red"];
          const riskLevel = riskLevels[d % 3];
          
          const safety = new Safety({
            dam: dam._id,
            floodRiskLevel: riskLevel,
            seepageReport: riskLevel === "Green" ? 
              "No significant seepage detected. All parameters within normal range." :
              riskLevel === "Yellow" ?
              "Minor seepage observed. Flow rate: 5-8 L/min. Under monitoring." :
              "Significant seepage detected. Flow rate: 15-25 L/min. Enhanced monitoring.",
            structuralHealth: {
              cracks: riskLevel === "Green" ? "No structural issues" : "Minor cracks under observation",
              vibration: "Normal operational vibrations",
              tilt: "No structural displacement"
            },
            earthquakeZone: `Zone ${Math.floor(Math.random() * 4) + 1} - ${["Low", "Moderate", "High", "Very High"][Math.floor(Math.random() * 4)]} Risk`,
            maintenance: {
              lastInspection: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000),
              nextInspection: new Date(Date.now() + Math.random() * 180 * 24 * 60 * 60 * 1000),
              reportFile: `${damName.toLowerCase().replace(/\s+/g, '_')}_report.pdf`
            },
            emergencyContact: {
              authorityName: `${stateData.name} Dam Authority`,
              phone: `+91-${Math.floor(Math.random() * 9000) + 1000}-${Math.floor(Math.random() * 900000) + 100000}`,
              email: `emergency@${stateData.name.toLowerCase()}dams.gov.in`,
              address: `${damName}, ${stateData.name} - ${Math.floor(Math.random() * 900000) + 100000}`
            }
          });
          await safety.save();
          totalCreated.safety++;

          // Create 2 history records per dam
          for (let h = 1; h <= 2; h++) {
            const eventTypes = ["maintenance", "flood", "inspection", "repair", "upgrade"];
            const severities = ["low", "medium", "high", "critical"];
            
            const history = new DamHistory({
              dam: dam._id,
              eventType: eventTypes[h % eventTypes.length],
              title: `${eventTypes[h % eventTypes.length].charAt(0).toUpperCase() + eventTypes[h % eventTypes.length].slice(1)} Event ${h}`,
              description: `Detailed description of ${eventTypes[h % eventTypes.length]} event at ${damName}.`,
              eventDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
              severity: severities[h % severities.length],
              impact: `Impact assessment for ${damName} ${eventTypes[h % eventTypes.length]} event.`,
              actionsTaken: `Corrective actions taken for ${eventTypes[h % eventTypes.length]} at ${damName}.`,
              cost: Math.floor(Math.random() * 5000000) + 100000,
              duration: `${Math.floor(Math.random() * 30) + 1} days`,
              affectedAreas: [`${damName} vicinity`, `Downstream ${riverName} area`],
              reportedBy: {
                name: `Engineer ${h}`,
                designation: "Dam Safety Officer",
                contact: `+91-${Math.floor(Math.random() * 9000) + 1000}-${Math.floor(Math.random() * 900000) + 100000}`
              },
              status: ["ongoing", "resolved", "monitoring", "closed"][h % 4]
            });
            await history.save();
            totalCreated.history++;
          }

          // Create 1 public spot per dam
          const spotTypes = ["temple", "tourist_spot", "viewpoint", "park", "restaurant"];
          const publicSpot = new PublicSpot({
            name: `${damName} ${spotTypes[d % spotTypes.length].replace('_', ' ')}`,
            type: spotTypes[d % spotTypes.length],
            description: `Popular ${spotTypes[d % spotTypes.length].replace('_', ' ')} near ${damName}.`,
            location: {
              address: `Near ${damName}, ${stateData.name}`,
              coordinates: {
                latitude: dam.coordinates.lat + (Math.random() - 0.5) * 0.1,
                longitude: dam.coordinates.lng + (Math.random() - 0.5) * 0.1
              },
              city: `${damName.split(' ')[0]} City`,
              state: stateData.name,
              pincode: `${Math.floor(Math.random() * 900000) + 100000}`
            },
            nearbyDams: [{ dam: dam._id, distance: Math.floor(Math.random() * 10) + 1 }],
            facilities: ["parking", "restroom", "food"],
            openingHours: "6:00 AM - 6:00 PM",
            contactInfo: {
              phone: `+91-${Math.floor(Math.random() * 9000) + 1000}-${Math.floor(Math.random() * 900000) + 100000}`
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

          // Create 1 restricted area per dam
          const restrictedArea = new RestrictedArea({
            name: `${damName} Security Zone`,
            type: "dam_restricted_zone",
            description: `Restricted security zone around ${damName} infrastructure.`,
            location: {
              address: `${damName} Perimeter, ${stateData.name}`,
              coordinates: {
                latitude: dam.coordinates.lat,
                longitude: dam.coordinates.lng
              },
              city: `${damName.split(' ')[0]} City`,
              state: stateData.name
            },
            nearbyDams: [{ dam: dam._id, distance: 0.5, riskLevel: "high" }],
            restrictionLevel: "no_entry",
            dangerType: ["structural_collapse", "flood_risk"],
            restrictions: {
              noEntry: true,
              permitRequired: true,
              timeRestrictions: "24/7 restriction"
            },
            penalties: { fine: 50000, imprisonment: "Up to 6 months" },
            contactAuthority: {
              name: "Dam Security Officer",
              phone: `+91-${Math.floor(Math.random() * 9000) + 1000}-${Math.floor(Math.random() * 900000) + 100000}`,
              office: `${damName} Control Room`
            },
            signageInfo: { hasSignage: true, signageType: "Warning boards" },
            emergencyInfo: {
              emergencyContact: `+91-${Math.floor(Math.random() * 9000) + 1000}-${Math.floor(Math.random() * 900000) + 100000}`,
              nearestHospital: `${damName.split(' ')[0]} Hospital`
            }
          });
          await restrictedArea.save();
          totalCreated.restrictedAreas++;

          // Create 2 guidelines per dam
          for (let g = 1; g <= 2; g++) {
            const categories = ["safety", "operation", "emergency", "visitor"];
            const guideline = new Guideline({
              title: `${damName} ${categories[g % categories.length]} Guidelines`,
              category: categories[g % categories.length],
              description: `${categories[g % categories.length]} guidelines for ${damName}.`,
              content: `Detailed ${categories[g % categories.length]} procedures for ${damName}.`,
              applicableDams: [{ dam: dam._id, isSpecific: true }],
              priority: g === 1 ? "high" : "medium",
              targetAudience: ["operators", "maintenance_staff"],
              steps: [
                { stepNumber: 1, title: "Initial assessment", description: "Conduct evaluation", isRequired: true },
                { stepNumber: 2, title: "Implementation", description: "Execute procedures", isRequired: true }
              ],
              compliance: { isRegulatory: true, authority: "Central Water Commission" },
              effectiveDate: new Date(),
              version: "1.0",
              approvedBy: { name: "Chief Engineer", designation: "Dam Authority", date: new Date() }
            });
            await guideline.save();
            totalCreated.guidelines++;
          }
        }
      }
    }

    console.log(`\n🎉 Database population completed successfully!`);
    console.log(`\n📊 Summary of created records:`);
    console.log(`🏛️  States: ${totalCreated.states}`);
    console.log(`🌊 Rivers: ${totalCreated.rivers}`);
    console.log(`🏗️  Dams: ${totalCreated.dams}`);
    console.log(`🚨 Safety Records: ${totalCreated.safety}`);
    console.log(`📜 History Events: ${totalCreated.history}`);
    console.log(`📍 Public Spots: ${totalCreated.publicSpots}`);
    console.log(`⛔ Restricted Areas: ${totalCreated.restrictedAreas}`);
    console.log(`📄 Guidelines: ${totalCreated.guidelines}`);
    console.log(`\n🔢 Total Records: ${Object.values(totalCreated).reduce((a, b) => a + b, 0)}`);

  } catch (error) {
    console.error("❌ Error during database creation:", error);
  } finally {
    await mongoose.disconnect();
    console.log("\n🔌 Disconnected from MongoDB");
  }
}

// Run the script
createFullDatabase();