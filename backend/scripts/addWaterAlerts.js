import mongoose from "mongoose";
import dotenv from "dotenv";
import Dam from "../models/Dam.js";
import Safety from "../models/Safety.js";

dotenv.config();

// Additional water-specific alert scenarios
const waterAlertScenarios = [
  {
    damName: "Bansagar Dam",
    state: "Madhya Pradesh",
    river: "Son",
    floodRiskLevel: "Red",
    seepageReport: "Flash flood conditions detected upstream. Reservoir level at 98% capacity. Emergency spillway gates opened.",
    structuralHealth: {
      cracks: "Stress cracks appearing due to maximum water pressure",
      vibration: "High vibrations from emergency spillway operations",
      tilt: "Slight structural stress under maximum load"
    },
    earthquakeZone: "Zone II - Low Risk",
    maintenance: {
      lastInspection: new Date("2024-12-15"),
      nextInspection: new Date("2025-01-15"),
      reportFile: "bansagar_emergency_dec2024.pdf"
    },
    emergencyContact: {
      authorityName: "Bansagar Control Board",
      phone: "+91-7652-245789",
      email: "emergency@bansagar.mp.gov.in",
      address: "Bansagar Dam, Shahdol District, Madhya Pradesh - 484001"
    }
  },
  {
    damName: "Indira Sagar Dam",
    state: "Madhya Pradesh",
    river: "Narmada",
    floodRiskLevel: "Yellow",
    seepageReport: "Monsoon water levels rising rapidly. Current level at 85% capacity. Controlled discharge initiated.",
    structuralHealth: {
      cracks: "No new structural damage observed",
      vibration: "Increased turbine vibrations due to high flow rates",
      tilt: "Structure stable under current load conditions"
    },
    earthquakeZone: "Zone II - Low Risk",
    maintenance: {
      lastInspection: new Date("2024-12-01"),
      nextInspection: new Date("2025-02-01"),
      reportFile: "indira_sagar_dec2024.pdf"
    },
    emergencyContact: {
      authorityName: "Narmada Hydroelectric Development Corporation",
      phone: "+91-7574-234567",
      email: "control@nhdc.co.in",
      address: "Indira Sagar Dam, Khandwa District, Madhya Pradesh - 450001"
    }
  },
  {
    damName: "Srisailam Dam",
    state: "Andhra Pradesh",
    river: "Krishna",
    floodRiskLevel: "Yellow",
    seepageReport: "Drought conditions affecting water levels. Reservoir at 45% capacity. Water conservation measures active.",
    structuralHealth: {
      cracks: "Exposed areas showing minor weathering due to low water levels",
      vibration: "Reduced vibrations due to lower operational capacity",
      tilt: "No structural concerns at current water levels"
    },
    earthquakeZone: "Zone II - Low Risk",
    maintenance: {
      lastInspection: new Date("2024-11-28"),
      nextInspection: new Date("2025-02-28"),
      reportFile: "srisailam_nov2024.pdf"
    },
    emergencyContact: {
      authorityName: "Andhra Pradesh Power Generation Corporation",
      phone: "+91-8524-267890",
      email: "srisailam.control@apgenco.gov.in",
      address: "Srisailam Dam, Kurnool District, Andhra Pradesh - 518102"
    }
  },
  {
    damName: "Rajghat Dam",
    state: "Uttar Pradesh",
    river: "Betwa",
    floodRiskLevel: "Red",
    seepageReport: "Unprecedented rainfall causing rapid water level rise. Emergency evacuation of downstream areas initiated.",
    structuralHealth: {
      cracks: "Emergency inspection reveals new stress fractures",
      vibration: "Abnormal vibrations from overflowing spillways",
      tilt: "Monitoring equipment shows structural stress indicators"
    },
    earthquakeZone: "Zone III - Moderate Risk",
    maintenance: {
      lastInspection: new Date("2024-12-18"),
      nextInspection: new Date("2025-01-18"),
      reportFile: "rajghat_emergency_dec2024.pdf"
    },
    emergencyContact: {
      authorityName: "Uttar Pradesh Irrigation Department",
      phone: "+91-5192-234567",
      email: "emergency@upid.gov.in",
      address: "Rajghat Dam, Lalitpur District, Uttar Pradesh - 284403"
    }
  },
  {
    damName: "Pong Dam",
    state: "Himachal Pradesh",
    river: "Beas",
    floodRiskLevel: "Yellow",
    seepageReport: "Glacial melt increasing inflow rates. Water level at 78% capacity. Enhanced monitoring for sudden surges.",
    structuralHealth: {
      cracks: "Cold weather causing minor concrete expansion joints stress",
      vibration: "Normal operational parameters maintained",
      tilt: "Thermal expansion within acceptable limits"
    },
    earthquakeZone: "Zone IV - High Risk",
    maintenance: {
      lastInspection: new Date("2024-12-10"),
      nextInspection: new Date("2025-03-10"),
      reportFile: "pong_dec2024.pdf"
    },
    emergencyContact: {
      authorityName: "Bhakra Beas Management Board",
      phone: "+91-1972-234567",
      email: "pong.control@bbmb.gov.in",
      address: "Pong Dam, Kangra District, Himachal Pradesh - 176001"
    }
  },
  {
    damName: "Ukai Dam",
    state: "Gujarat",
    river: "Tapi",
    floodRiskLevel: "Green",
    seepageReport: "Water levels stable at 65% capacity. All systems functioning normally. Regular monitoring continues.",
    structuralHealth: {
      cracks: "Routine maintenance completed, no structural issues",
      vibration: "All mechanical systems operating smoothly",
      tilt: "Structural integrity maintained"
    },
    earthquakeZone: "Zone III - Moderate Risk",
    maintenance: {
      lastInspection: new Date("2024-12-05"),
      nextInspection: new Date("2025-03-05"),
      reportFile: "ukai_dec2024.pdf"
    },
    emergencyContact: {
      authorityName: "Gujarat State Electricity Corporation",
      phone: "+91-2621-234567",
      email: "ukai.control@gsecl.in",
      address: "Ukai Dam, Tapi District, Gujarat - 394680"
    }
  }
];

async function addWaterAlerts() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    let createdCount = 0;
    let skippedCount = 0;

    for (const scenario of waterAlertScenarios) {
      try {
        // Find or create the dam
        let dam = await Dam.findOne({ 
          name: { $regex: new RegExp(scenario.damName, 'i') }
        });

        if (!dam) {
          // Create the dam if it doesn't exist
          dam = new Dam({
            name: scenario.damName,
            state: scenario.state,
            river: scenario.river,
            riverName: scenario.river,
            damType: "Concrete Gravity", // Default type
            height: "80", // Default height
            coordinates: { lat: 0, lng: 0 } // Default coordinates
          });
          await dam.save();
          console.log(`Created dam: ${scenario.damName}`);
        }

        // Check if safety record already exists
        const existingSafety = await Safety.findOne({ dam: dam._id });
        if (existingSafety) {
          console.log(`⚠️  Safety record already exists for ${scenario.damName}, skipping...`);
          skippedCount++;
          continue;
        }

        // Create safety record
        const safety = new Safety({
          dam: dam._id,
          floodRiskLevel: scenario.floodRiskLevel,
          seepageReport: scenario.seepageReport,
          structuralHealth: scenario.structuralHealth,
          earthquakeZone: scenario.earthquakeZone,
          maintenance: scenario.maintenance,
          emergencyContact: scenario.emergencyContact
        });

        await safety.save();
        createdCount++;
        console.log(`✅ Created water alert for ${scenario.damName} - Risk Level: ${scenario.floodRiskLevel}`);

      } catch (error) {
        console.error(`❌ Error creating water alert for ${scenario.damName}:`, error.message);
        skippedCount++;
      }
    }

    console.log(`\n📊 Water Alerts Summary:`);
    console.log(`✅ Successfully created: ${createdCount} water alerts`);
    console.log(`❌ Skipped: ${skippedCount} alerts`);
    
    // Display total alerts in database
    const totalAlerts = await Safety.countDocuments();
    const riskCounts = await Safety.aggregate([
      { $group: { _id: "$floodRiskLevel", count: { $sum: 1 } } }
    ]);
    
    console.log(`\n🌊 Total Alerts in Database: ${totalAlerts}`);
    console.log(`📈 Current Risk Distribution:`);
    riskCounts.forEach(({ _id, count }) => {
      const emoji = _id === 'Red' ? '🔴' : _id === 'Yellow' ? '🟡' : '🟢';
      console.log(`${emoji} ${_id}: ${count} dams`);
    });

  } catch (error) {
    console.error("Error adding water alerts:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

// Run the script
addWaterAlerts();