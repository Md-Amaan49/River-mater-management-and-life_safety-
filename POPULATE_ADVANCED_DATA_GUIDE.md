# Guide: Populate Advanced Dam Data

## Overview
This guide explains how to populate all 9 advanced data categories for all 45 dams in your database with realistic, calculated data.

---

## What Gets Populated

The script will create data for **9 categories** per dam:

1. **Reservoir Geometry & Physical Characteristics**
   - Height, length, crest level
   - River dimensions (width, depth)
   - Gate and spillway specifications
   - ✅ Auto-calculates: Cross-section area, hydraulic radius, discharge capacity

2. **Storage & Capacity Parameters**
   - Max storage, live storage, dead storage
   - Flood cushion storage
   - ✅ Auto-calculates: Available capacity, utilization %, flood cushion available

3. **Forecast & Meteorological Data**
   - Rainfall forecasts (6hr, 12hr, 24hr, 48hr)
   - Temperature, wind speed, humidity
   - Soil moisture, storm probability
   - ✅ Auto-calculates: Rainfall contribution, runoff forecast, risk indices

4. **Predictive & Simulation Outputs**
   - Upstream/downstream distances and velocities
   - Current storage, net flow
   - Risk indices
   - ✅ Auto-calculates: Arrival times, predicted levels, flood risk score, time to overflow

5. **Historical & Risk Reference Data**
   - Historical peak inflow, max water level
   - Flood events history
   - Risk classification
   - ✅ Auto-calculates: Return period, PMF, recurrence interval, anomaly score

6. **Structural Health Monitoring**
   - Stress index, seepage rate, vibration level
   - Sensor statuses
   - Inspection dates
   - ✅ Auto-calculates: Dam health score, failure probability, maintenance urgency

7. **Gate & Spillway Control System**
   - Number of gates, opening percentage
   - Discharge capacities
   - Gate status, operation times
   - ✅ Auto-calculates: Actual discharge, efficiency index, optimization value

8. **Downstream Risk & Safety Parameters**
   - River bank height, flood levels
   - Population, evacuation time
   - Infrastructure details
   - ✅ Auto-calculates: Impact score, evacuation time remaining, danger status, risk index

9. **Basin-Level Aggregated Fields**
   - Basin rainfall, storage metrics
   - Coordination status
   - Stress levels
   - ✅ Auto-calculates: Basin utilization, cascading failure probability, optimization score

---

## Prerequisites

1. **MongoDB Connection**: Ensure your `.env` file has the correct `MONGO_URI`
2. **Existing Dams**: The database must have dams already populated
3. **Node.js**: Version 14 or higher

---

## How to Run

### Method 1: Using npm script (Recommended)

```bash
npm run populate-advanced
```

### Method 2: Direct execution

```bash
node backend/scripts/populateAdvancedDamData.js
```

---

## What Happens During Execution

### Step 1: Connection
```
🔌 Connecting to MongoDB...
✅ MongoDB connected
```

### Step 2: Dam Discovery
```
📊 Fetching all dams...
✅ Found 45 dams
```

### Step 3: Data Population
For each dam, the script will:
```
📍 Processing: Bhakra Dam (507f1f77bcf86cd799439011)
  ✓ Reservoir Geometry
  ✓ Storage Capacity
  ✓ Forecast Meteo
  ✓ Predictive Simulation
  ✓ Historical Risk
  ✓ Structural Health
  ✓ Gate Spillway
  ✓ Downstream Risk
  ✓ Basin Aggregated
  ✅ Completed (1/45)
```

### Step 4: Summary
```
============================================================
📊 POPULATION SUMMARY
============================================================
✅ Successfully populated: 45 dams
❌ Errors: 0 dams
📦 Total categories per dam: 9
📈 Total records created: 405
============================================================
```

### Step 5: Verification
```
🔍 Verifying calculated fields...

📐 Sample Calculated Fields:
  River Cross-Section Area: 500 m²
  Hydraulic Radius: 7.14 m
  Effective Discharge Capacity: 9 m³/s
  Available Capacity: 250000 m³
  Storage Utilization: 75%

✅ All calculated fields are working correctly!
```

---

## Data Characteristics

### Realistic Ranges

The script generates data within realistic ranges:

- **Heights**: 20-100 meters
- **Lengths**: 200-800 meters
- **Storage**: 500,000 - 5,000,000 m³
- **River Width**: 30-100 meters
- **River Depth**: 5-20 meters
- **Rainfall Forecasts**: 0-200 mm
- **Population**: 1,000 - 100,000 people
- **Risk Scores**: 0-100 scale

### Calculated Fields

All derived fields are automatically calculated using:
- Standard hydraulic engineering formulas
- Manning's equation for flow velocity
- Statistical methods for risk assessment
- Weighted scoring for composite indices

---

## Verification

### Check Data in MongoDB

```javascript
// Connect to MongoDB and check
use your_database_name

// Count records
db.reservoirgeometries.countDocuments()  // Should be 45
db.storagecapacities.countDocuments()    // Should be 45
db.forecastmeteos.countDocuments()       // Should be 45
// ... etc for all 9 collections

// View sample data
db.reservoirgeometries.findOne()
```

### Check via API

```bash
# Get all data for a specific dam
curl http://localhost:5000/api/dam/all-data/YOUR_DAM_ID

# Get specific category
curl http://localhost:5000/api/dam/reservoir-geometry/YOUR_DAM_ID
```

### Check in Frontend

1. Navigate to Add Data Form
2. Select a dam
3. Click on any of the 9 new data cards
4. You should see populated data with calculated fields

---

## Troubleshooting

### Error: "No dams found in database"
**Solution**: Run the dam population script first
```bash
node backend/scripts/createRealisticDatabase.js
```

### Error: "MongoDB connection failed"
**Solution**: Check your `.env` file has correct `MONGO_URI`

### Error: "Model not found"
**Solution**: Ensure all model files are in `backend/models/` directory

### Partial Population
If some dams fail, the script will continue with others and show a summary of successes and errors.

---

## Re-running the Script

The script uses `findOneAndUpdate` with `upsert: true`, which means:
- ✅ Safe to run multiple times
- ✅ Will update existing data
- ✅ Won't create duplicates
- ✅ Preserves dam references

---

## Data Update Strategy

### Option 1: Full Repopulation
```bash
npm run populate-advanced
```
Updates all dams with fresh data.

### Option 2: Selective Update
Modify the script to filter specific dams:
```javascript
const dams = await Dam.find({ state: "Maharashtra" });
```

### Option 3: Single Dam Update
Use the API to update individual dams:
```bash
curl -X PUT http://localhost:5000/api/dam/reservoir-geometry/DAM_ID \
  -H "Content-Type: application/json" \
  -d '{"riverWidth": 55, "riverDepth": 12}'
```

---

## Expected Output Files

After running, you'll have data in these MongoDB collections:
- `reservoirgeometries`
- `storagecapacities`
- `forecastmeteos`
- `predictivesimulations`
- `historicalrisks`
- `structuralhealths`
- `gatespillways`
- `downstreamrisks`
- `basinaggregates`

---

## Performance

- **Time**: ~2-5 seconds per dam
- **Total Time**: ~2-4 minutes for 45 dams
- **Memory**: Minimal (processes one dam at a time)
- **Network**: Single connection to MongoDB

---

## Next Steps After Population

1. **Verify Data**: Check a few dams in the frontend
2. **Test Calculations**: Update some input fields and verify calculated fields update
3. **API Testing**: Test GET/POST/PUT endpoints
4. **Frontend Integration**: Ensure all pages display data correctly
5. **User Training**: Show users how to view and update data

---

## Advanced Usage

### Custom Data Generation

Edit `backend/scripts/populateAdvancedDamData.js` to customize:

```javascript
// Example: Adjust rainfall ranges
rainfallForecastNext24hr: random(0, 150), // Instead of 0-120

// Example: Set specific values for certain dams
if (dam.name === "Bhakra Dam") {
  return {
    ...generateReservoirGeometry(dam),
    height: 226 // Actual height
  };
}
```

### Batch Processing

For very large databases, process in batches:
```javascript
const batchSize = 10;
for (let i = 0; i < dams.length; i += batchSize) {
  const batch = dams.slice(i, i + batchSize);
  await Promise.all(batch.map(dam => processDam(dam)));
}
```

---

## Maintenance

### Regular Updates

Consider scheduling regular updates for:
- **Forecast Data**: Daily (weather changes)
- **Real-time Data**: Hourly (water levels, flow)
- **Structural Health**: Weekly (sensor readings)
- **Historical Data**: Annually (after flood season)

### Backup Before Population

```bash
# Backup MongoDB
mongodump --uri="YOUR_MONGO_URI" --out=backup_$(date +%Y%m%d)
```

---

## Support

If you encounter issues:
1. Check the console output for specific error messages
2. Verify MongoDB connection
3. Ensure all model files exist
4. Check that dams are populated in the database
5. Review the script logs for detailed error information

---

## Summary

✅ **What**: Populates 9 data categories for all dams
✅ **How**: Run `npm run populate-advanced`
✅ **Result**: 405 records (45 dams × 9 categories)
✅ **Time**: 2-4 minutes
✅ **Safe**: Can run multiple times
✅ **Smart**: Auto-calculates 50+ derived fields

**Ready to populate? Run the command and watch the magic happen!** 🚀
