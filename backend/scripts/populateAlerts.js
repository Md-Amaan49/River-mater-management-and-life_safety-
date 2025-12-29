import mongoose from "mongoose";
import dotenv from "dotenv";
import Dam from "../models/Dam.js";
import Safety from "../models/Safety.js";

dotenv.config();

// Realistic dam alert scenarios
const alertScenarios = [
  {
    damName: "Tehri Dam",
    state: "Uttarakhand",
    river: "Bhagirathi",
    floodRiskLevel: "Red",
    seepageReport: "Significant seepage detected in downstream area. Flow rate: 15 L/min. Immediate monitoring required.",
    structuralHealth: {
      cracks: "Minor hairline cracks observed in spillway section",
      vibration: "Normal operational vibrations within acceptable limits",
      tilt: "No structural tilt detected"
    },
    earthquakeZone: "Zone IV - High Risk",
    maintenance: {
      lastInspection: new Date("2024-11-15"),
      nextInspection: new Date("2025-01-15"),
      reportFile: "tehri_inspection_nov2024.pdf"
    },
    emergencyContact: {
      authorityName: "Tehri Hydro Development Corporation",
      phone: "+91-1376-233456",
      email: "emergency@thdc.co.in",
      address: "Tehri Dam, Tehri Garhwal, Uttarakhand - 249001"
    }
  },
  {
    damName: "Sardar Sarovar Dam",
    state: "Gujarat",
    river: "Narmada",
    floodRiskLevel: "Yellow",
    seepageReport: "Minor seepage observed at foundation level. Flow rate: 5 L/min. Under regular monitoring.",
    structuralHealth: {
      cracks: "No significant cracks detected",
      vibration: "Slight increase in vibration levels during peak discharge",
      tilt: "Minimal tilt within design parameters"
    },
    earthquakeZone: "Zone III - Moderate Risk",
    maintenance: {
      lastInspection: new Date("2024-12-01"),
      nextInspection: new Date("2025-03-01"),
      reportFile: "sardar_sarovar_dec2024.pdf"
    },
    emergencyContact: {
      authorityName: "Sardar Sarovar Narmada Nigam Ltd",
      phone: "+91-2692-230123",
      email: "control@ssnnl.com",
      address: "Kevadia Colony, Narmada District, Gujarat - 393151"
    }
  },
  {
    damName: "Bhakra Dam",
    state: "Himachal Pradesh",
    river: "Sutlej",
    floodRiskLevel: "Green",
    seepageReport: "No significant seepage detected. All parameters within normal range.",
    structuralHealth: {
      cracks: "Routine maintenance cracks sealed during last inspection",
      vibration: "All vibration readings normal",
      tilt: "No structural displacement detected"
    },
    earthquakeZone: "Zone IV - High Risk",
    maintenance: {
      lastInspection: new Date("2024-10-20"),
      nextInspection: new Date("2025-01-20"),
      reportFile: "bhakra_oct2024.pdf"
    },
    emergencyContact: {
      authorityName: "Bhakra Beas Management Board",
      phone: "+91-1881-222333",
      email: "emergency@bbmb.gov.in",
      address: "Bhakra Dam, Bilaspur, Himachal Pradesh - 174001"
    }
  },
  {
    damName: "Hirakud Dam",
    state: "Odisha",
    river: "Mahanadi",
    floodRiskLevel: "Yellow",
    seepageReport: "Moderate seepage in left bank area. Flow rate: 8 L/min. Enhanced monitoring implemented.",
    structuralHealth: {
      cracks: "Surface cracks in concrete apron under repair",
      vibration: "Elevated vibration during monsoon discharge",
      tilt: "No significant tilt observed"
    },
    earthquakeZone: "Zone II - Low Risk",
    maintenance: {
      lastInspection: new Date("2024-11-30"),
      nextInspection: new Date("2025-02-28"),
      reportFile: "hirakud_nov2024.pdf"
    },
    emergencyContact: {
      authorityName: "Hirakud Dam Division",
      phone: "+91-663-2430789",
      email: "hd.control@odisha.gov.in",
      address: "Hirakud Dam, Sambalpur, Odisha - 768016"
    }
  },
  {
    damName: "Nagarjuna Sagar Dam",
    state: "Telangana",
    river: "Krishna",
    floodRiskLevel: "Red",
    seepageReport: "Critical seepage detected in right bank. Flow rate: 25 L/min. Emergency protocols activated.",
    structuralHealth: {
      cracks: "Major crack development in spillway gate structure",
      vibration: "Abnormal vibrations detected during gate operations",
      tilt: "Slight downstream tilt in gate pier No. 12"
    },
    earthquakeZone: "Zone II - Low Risk",
    maintenance: {
      lastInspection: new Date("2024-12-10"),
      nextInspection: new Date("2025-01-10"),
      reportFile: "nagarjuna_sagar_dec2024.pdf"
    },
    emergencyContact: {
      authorityName: "Krishna River Management Board",
      phone: "+91-8682-272456",
      email: "emergency@krmb.gov.in",
      address: "Nagarjuna Sagar, Nalgonda District, Telangana - 508202"
    }
  },
  {
    damName: "Koyna Dam",
    state: "Maharashtra",
    river: "Koyna",
    floodRiskLevel: "Yellow",
    seepageReport: "Seasonal seepage increase observed. Flow rate: 12 L/min. Normal for monsoon period.",
    structuralHealth: {
      cracks: "Historical earthquake-related cracks under continuous monitoring",
      vibration: "Seismic monitoring shows normal background activity",
      tilt: "No new structural movement detected"
    },
    earthquakeZone: "Zone IV - High Risk (Reservoir Induced Seismicity)",
    maintenance: {
      lastInspection: new Date("2024-11-25"),
      nextInspection: new Date("2025-02-25"),
      reportFile: "koyna_nov2024.pdf"
    },
    emergencyContact: {
      authorityName: "Maharashtra State Electricity Board",
      phone: "+91-2162-262789",
      email: "koyna.control@mahadiscom.in",
      address: "Koyna Dam, Satara District, Maharashtra - 415001"
    }
  },
  {
    damName: "Tungabhadra Dam",
    state: "Karnataka",
    river: "Tungabhadra",
    floodRiskLevel: "Green",
    seepageReport: "Minimal seepage within acceptable limits. Flow rate: 3 L/min.",
    structuralHealth: {
      cracks: "No new cracks detected in recent inspection",
      vibration: "All mechanical systems operating normally",
      tilt: "Structural alignment maintained"
    },
    earthquakeZone: "Zone II - Low Risk",
    maintenance: {
      lastInspection: new Date("2024-12-05"),
      nextInspection: new Date("2025-03-05"),
      reportFile: "tungabhadra_dec2024.pdf"
    },
    emergencyContact: {
      authorityName: "Tungabhadra Board",
      phone: "+91-8394-252123",
      email: "tb.emergency@karnataka.gov.in",
      address: "Tungabhadra Dam, Hospet, Karnataka - 583201"
    }
  },
  {
    damName: "Mettur Dam",
    state: "Tamil Nadu",
    river: "Cauvery",
    floodRiskLevel: "Red",
    seepageReport: "Excessive seepage through foundation. Flow rate: 30 L/min. Critical monitoring in progress.",
    structuralHealth: {
      cracks: "Extensive cracking in downstream face requires immediate attention",
      vibration: "High frequency vibrations during peak discharge operations",
      tilt: "Measurable downstream movement in central section"
    },
    earthquakeZone: "Zone II - Low Risk",
    maintenance: {
      lastInspection: new Date("2024-12-12"),
      nextInspection: new Date("2025-01-12"),
      reportFile: "mettur_dec2024.pdf"
    },
    emergencyContact: {
      authorityName: "Public Works Department, Tamil Nadu",
      phone: "+91-4287-222456",
      email: "mettur.control@tn.gov.in",
      address: "Mettur Dam, Salem District, Tamil Nadu - 636401"
    }
  },
  {
    damName: "Idukki Dam",
    state: "Kerala",
    river: "Periyar",
    floodRiskLevel: "Yellow",
    seepageReport: "Increased seepage during monsoon season. Flow rate: 10 L/min. Seasonal monitoring enhanced.",
    structuralHealth: {
      cracks: "Minor surface cracks in arch structure under observation",
      vibration: "Normal operational vibrations for arch dam",
      tilt: "No significant deformation detected"
    },
    earthquakeZone: "Zone III - Moderate Risk",
    maintenance: {
      lastInspection: new Date("2024-11-20"),
      nextInspection: new Date("2025-02-20"),
      reportFile: "idukki_nov2024.pdf"
    },
    emergencyContact: {
      authorityName: "Kerala State Electricity Board",
      phone: "+91-4862-232789",
      email: "idukki.control@kseb.in",
      address: "Idukki Dam, Idukki District, Kerala - 685602"
    }
  },
  {
    damName: "Almatti Dam",
    state: "Karnataka",
    river: "Krishna",
    floodRiskLevel: "Green",
    seepageReport: "No abnormal seepage detected. All monitoring systems functioning normally.",
    structuralHealth: {
      cracks: "Routine inspection shows no structural concerns",
      vibration: "All equipment operating within normal parameters",
      tilt: "No structural displacement observed"
    },
    earthquakeZone: "Zone II - Low Risk",
    maintenance: {
      lastInspection: new Date("2024-12-08"),
      nextInspection: new Date("2025-03-08"),
      reportFile: "almatti_dec2024.pdf"
    },
    emergencyContact: {
      authorityName: "Krishna Bhagya Jal Nigam Ltd",
      phone: "+91-8352-245678",
      email: "almatti.ops@kbjnl.co.in",
      address: "Almatti Dam, Bagalkot District, Karnataka - 587311"
    }
  }
];

async function populateAlerts() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // Clear existing safety data
    await Safety.deleteMany({});
    console.log("Cleared existing safety data");

    let createdCount = 0;
    let skippedCount = 0;

    for (const scenario of alertScenarios) {
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
            height: "100", // Default height
            coordinates: { lat: 0, lng: 0 } // Default coordinates
          });
          await dam.save();
          console.log(`Created dam: ${scenario.damName}`);
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
        console.log(`✅ Created alert for ${scenario.damName} - Risk Level: ${scenario.floodRiskLevel}`);

      } catch (error) {
        console.error(`❌ Error creating alert for ${scenario.damName}:`, error.message);
        skippedCount++;
      }
    }

    console.log(`\n📊 Summary:`);
    console.log(`✅ Successfully created: ${createdCount} alerts`);
    console.log(`❌ Skipped due to errors: ${skippedCount} alerts`);
    
    // Display alert distribution
    const riskDistribution = alertScenarios.reduce((acc, scenario) => {
      acc[scenario.floodRiskLevel] = (acc[scenario.floodRiskLevel] || 0) + 1;
      return acc;
    }, {});
    
    console.log(`\n🚨 Alert Risk Distribution:`);
    Object.entries(riskDistribution).forEach(([risk, count]) => {
      const emoji = risk === 'Red' ? '🔴' : risk === 'Yellow' ? '🟡' : '🟢';
      console.log(`${emoji} ${risk}: ${count} dams`);
    });

  } catch (error) {
    console.error("Error populating alerts:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

// Run the script
populateAlerts();