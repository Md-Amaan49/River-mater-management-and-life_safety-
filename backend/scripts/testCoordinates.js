import mongoose from "mongoose";
import dotenv from "dotenv";
import Dam from "../models/Dam.js";

dotenv.config();

const testCoordinates = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // Find a few dams and check their coordinates
    const dams = await Dam.find().limit(5);
    
    console.log("\n=== Testing Dam Coordinates ===\n");
    
    if (dams.length === 0) {
      console.log("No dams found in database");
    } else {
      dams.forEach((dam, index) => {
        console.log(`Dam ${index + 1}: ${dam.name}`);
        console.log(`  State: ${dam.state}`);
        console.log(`  River: ${dam.riverName || dam.river}`);
        console.log(`  Coordinates:`, dam.coordinates);
        console.log(`  Coordinates type:`, typeof dam.coordinates);
        
        if (dam.coordinates) {
          console.log(`  Lat: ${dam.coordinates.lat} (${typeof dam.coordinates.lat})`);
          console.log(`  Lng: ${dam.coordinates.lng} (${typeof dam.coordinates.lng})`);
          console.log(`  Valid: ${!isNaN(dam.coordinates.lat) && !isNaN(dam.coordinates.lng)}`);
        } else {
          console.log(`  ⚠️  No coordinates stored`);
        }
        console.log("");
      });
    }

    await mongoose.connection.close();
    console.log("Connection closed");
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
};

testCoordinates();
