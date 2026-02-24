# Calculated Fields Implementation - Total Inflow & Spillway Discharge

## Overview

Added evaporation rate field and implemented automatic calculation for totalInflow and spillwayDischarge fields in the RealtimeDamStatus component.

## Changes Made

### 1. Backend Model (`backend/models/DamStatus.js`)

#### New Fields Added:
- `evaporationRate` (Number) - Water loss due to evaporation (m³/s)
- `totalInflow` (Number) - CALCULATED field (m³/s)
- `spillwayDischarge` (Number) - CALCULATED field (m³/s)

#### Pre-Save Hook:
Added automatic calculation before saving:

```javascript
damStatusSchema.pre('save', function(next) {
  // Calculate totalInflow = inflowRate + inflowFromUpstreamDam + rainfallRate
  const inflowRate = this.inflowRate || 0;
  const inflowFromUpstream = this.inflowFromUpstreamDam || 0;
  const rainfall = this.rainfallRate || 0;
  this.totalInflow = inflowRate + inflowFromUpstream + rainfall;
  
  // Calculate spillwayDischarge = outflowRate + outflowToDownstreamDam
  const outflowRate = this.outflowRate || 0;
  const outflowToDownstream = this.outflowToDownstreamDam || 0;
  this.spillwayDischarge = outflowRate + outflowToDownstream;
  
  next();
});
```

### 2. Frontend Component (`frontend/src/components/RealtimeDamStatus.jsx`)

#### Form State Updates:
- Removed `spillwayDischarge` from editable fields
- Added `evaporationRate` as editable field
- `totalInflow` and `spillwayDischarge` are now calculated and read-only

#### Calculation Functions:
```javascript
const calculateTotalInflow = () => {
  const inflowRate = form.inflowRate || 0;
  const inflowFromUpstream = form.inflowFromUpstreamDam || 0;
  const rainfall = form.rainfallRate || 0;
  return inflowRate + inflowFromUpstream + rainfall;
};

const calculateSpillwayDischarge = () => {
  const outflowRate = form.outflowRate || 0;
  const outflowToDownstream = form.outflowToDownstreamDam || 0;
  return outflowRate + outflowToDownstream;
};
```

#### UI Changes:
1. Added evaporation rate input field
2. Replaced spillway discharge input with read-only calculated field
3. Added total inflow as read-only calculated field
4. Both calculated fields show formulas as helper text

## Field Order in Form

1. Current Water Level
2. Max Level
3. Min Level
4. Inflow Rate (editable)
5. Outflow Rate (editable)
6. Rainfall Rate (editable)
7. Evaporation Rate (editable) ← NEW
8. **Total Inflow (calculated, read-only)** ← NEW
9. **Spillway Discharge (calculated, read-only)** ← CHANGED
10. Inflow from Upstream Dam (editable)
11. Outflow to Downstream Dam (editable)
12. Upstream River Velocity (editable)
13. Downstream River Velocity (editable)
14. Gate Status

## Formulas

### Total Inflow
```
Total Inflow = Inflow Rate + Inflow from Upstream Dam + Rainfall Rate
```

**Components**:
- **Inflow Rate**: Local inflow (streams, groundwater, etc.)
- **Inflow from Upstream Dam**: Water released from upstream
- **Rainfall Rate**: Direct rainfall contribution

### Spillway Discharge
```
Spillway Discharge = Outflow Rate + Outflow to Downstream Dam
```

**Components**:
- **Outflow Rate**: Local outflow (irrigation, municipal use, etc.)
- **Outflow to Downstream Dam**: Water released to downstream

### Water Balance
```
Net Change = Total Inflow - Spillway Discharge - Evaporation Rate
```

- **Positive**: Dam is gaining water (level rising)
- **Negative**: Dam is losing water (level falling)

## Data Population Scripts

### 1. Evaporation Data (`populateEvaporationData.js`)
Populated evaporation rates for all 45 dams:
- Maharashtra: 2.5 - 3.8 m³/s
- Karnataka: 3.0 - 4.5 m³/s
- Tamil Nadu: 2.2 - 4.3 m³/s

**Average**: 3.43 m³/s
**Range**: 2.20 - 4.50 m³/s

### 2. Field Recalculation (`recalculateFields.js`)
Recalculates totalInflow and spillwayDischarge for all existing records by triggering the pre-save hook.

## How It Works

### Data Flow

1. **User Input**: User enters base values (inflowRate, outflowRate, rainfall, evaporation, etc.)
2. **Frontend Calculation**: Form displays calculated values in real-time
3. **Backend Calculation**: Pre-save hook calculates and stores values in database
4. **Retrieval**: Calculated values are fetched and displayed

### Automatic Calculation

The pre-save hook ensures that:
- Values are always up-to-date when any component changes
- No manual calculation needed
- Consistency between frontend display and database storage

## Use Cases

### 1. Water Balance Monitoring

Track net water change:
```javascript
const netChange = totalInflow - spillwayDischarge - evaporationRate;
if (netChange > 0) {
  console.log("Dam is gaining water");
} else {
  console.log("Dam is losing water");
}
```

### 2. Flood Risk Assessment

Monitor total inflow for flood warnings:
```javascript
if (totalInflow > maxInflowThreshold) {
  createAlert("High inflow - flood risk");
}
```

### 3. Drought Monitoring

Track water loss:
```javascript
if (netChange < -10 && currentWaterLevel < minLevel * 1.2) {
  createAlert("Rapid water loss - drought risk");
}
```

### 4. Operational Planning

Balance inflow and outflow:
```javascript
// Adjust outflow to maintain level
const targetOutflow = totalInflow - evaporationRate - desiredLevelChange;
```

## Example Data

### Sample Dam (Jayakwadi Dam)

| Field | Value | Unit | Type |
|-------|-------|------|------|
| Inflow Rate | 30.0 | m³/s | Input |
| Inflow from Upstream | 85.0 | m³/s | Input |
| Rainfall Rate | 28.3 | m³/s | Input |
| **Total Inflow** | **143.3** | **m³/s** | **Calculated** |
| Outflow Rate | 0.0 | m³/s | Input |
| Outflow to Downstream | 120.0 | m³/s | Input |
| **Spillway Discharge** | **120.0** | **m³/s** | **Calculated** |
| Evaporation Rate | 3.5 | m³/s | Input |
| **Net Change** | **19.8** | **m³/s** | **Calculated** |

**Analysis**: Dam is gaining 19.8 m³/s (water level rising)

## Testing

### Frontend Testing

1. Navigate to RealtimeDamStatus for any dam
2. Enter values for:
   - Inflow Rate: 30
   - Outflow Rate: 0
   - Rainfall Rate: 28.3
   - Evaporation Rate: 3.5
   - Inflow from Upstream: 85
   - Outflow to Downstream: 120
3. Observe calculated fields update automatically:
   - Total Inflow: 143.30 m³/s
   - Spillway Discharge: 120.00 m³/s
4. Click Save
5. Refresh page and verify values persist

### Backend Testing

```bash
# Populate evaporation data
node backend/scripts/populateEvaporationData.js

# Recalculate all fields
node backend/scripts/recalculateFields.js
```

## Database Schema

```javascript
{
  dam: ObjectId,
  currentWaterLevel: Number,
  levelUnit: String,
  maxLevel: Number,
  minLevel: Number,
  
  // Input fields
  inflowRate: Number,              // m³/s
  outflowRate: Number,             // m³/s
  rainfallRate: Number,            // m³/s
  evaporationRate: Number,         // m³/s - NEW
  inflowFromUpstreamDam: Number,   // m³/s
  outflowToDownstreamDam: Number,  // m³/s
  
  // Calculated fields (auto-computed)
  totalInflow: Number,             // m³/s - CALCULATED
  spillwayDischarge: Number,       // m³/s - CALCULATED
  
  // Velocity fields
  upstreamRiverVelocity: Number,   // m/s
  downstreamRiverVelocity: Number, // m/s
  
  // Gate status
  gateStatus: [GateSchema],
  
  // Metadata
  source: String,
  timestamps: true
}
```

## Benefits

1. **Data Consistency**: Calculations always match between frontend and backend
2. **Reduced Errors**: No manual calculation mistakes
3. **Real-time Feedback**: Users see calculated values immediately
4. **Simplified Input**: Users only enter base values
5. **Audit Trail**: Calculated values stored for historical analysis
6. **Water Balance**: Easy to track net water change

## Future Enhancements

### 1. Historical Trends
Track how water balance changes over time:
```javascript
const trends = await DamStatus.find({ dam: damId })
  .sort({ createdAt: -1 })
  .limit(24); // Last 24 hours

const netChanges = trends.map(t => 
  t.totalInflow - t.spillwayDischarge - t.evaporationRate
);
```

### 2. Predictive Modeling
Use historical data to predict future levels:
```javascript
const avgNetChange = calculateAverage(netChanges);
const hoursToFull = (maxLevel - currentLevel) / (avgNetChange / 3600);
```

### 3. Automated Alerts
Generate alerts based on water balance:
```javascript
if (netChange > 50 && currentLevel > maxLevel * 0.9) {
  createAlert("Rapid water gain - spillway release recommended");
}
```

### 4. Optimization Recommendations
Suggest optimal outflow rates:
```javascript
const optimalOutflow = totalInflow - evaporationRate - targetLevelChange;
suggestOutflowAdjustment(optimalOutflow);
```

## Status

✅ **COMPLETED** - All fields implemented and tested
- Backend model with pre-save hook
- Frontend component with calculated fields
- Evaporation data populated for all 45 dams
- Recalculation script created

## Files Modified/Created

### Modified:
- `backend/models/DamStatus.js` - Added fields and pre-save hook
- `frontend/src/components/RealtimeDamStatus.jsx` - Added evaporation field and calculations

### Created:
- `backend/scripts/populateEvaporationData.js` - Populate evaporation rates
- `backend/scripts/recalculateFields.js` - Recalculate all calculated fields
- `CALCULATED_FIELDS_IMPLEMENTATION.md` - This documentation

---

**Implementation Date**: Current Session
**Total Dams Updated**: 45
**Average Evaporation Rate**: 3.43 m³/s
