import axios from 'axios';

const API_URL = "http://localhost:5000";
const damId = "695133a1b8a023da8b240761";

async function testAPI() {
  try {
    console.log("Testing Safety Alert API...\n");
    
    // Test dam endpoint
    console.log(`1. Testing: GET ${API_URL}/api/dam/${damId}`);
    const damRes = await axios.get(`${API_URL}/api/dam/${damId}`);
    console.log("Dam Name:", damRes.data.name);
    console.log("✓ Dam endpoint working\n");
    
    // Test safety alert endpoint
    console.log(`2. Testing: GET ${API_URL}/api/safety-alert/dam/${damId}`);
    const alertRes = await axios.get(`${API_URL}/api/safety-alert/dam/${damId}`);
    console.log("Safety Alert Data:");
    console.log("- Flood Risk Score:", alertRes.data.floodRiskScore);
    console.log("- Emergency Level:", alertRes.data.emergencyLevel);
    console.log("- Alert Level:", alertRes.data.alertLevel);
    console.log("- Current Water Level:", alertRes.data.currentWaterLevel);
    console.log("✓ Safety alert endpoint working\n");
    
    console.log("All tests passed! ✓");
  } catch (error) {
    console.error("Error:", error.message);
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Data:", error.response.data);
    }
  }
}

testAPI();
