# Calculated Fields Comprehensive Implementation

## Overview
This document outlines the implementation of calculated/derived fields across all 9 data management categories for the Dam Management System.

## Implementation Status

### ✅ Completed Components

1. **Calculation Engine** (`backend/utils/calculationEngine.js`)
   - Contains all mathematical formulas for derived fields
   - Organized by category (Geometry, Storage, Flow, Forecast, etc.)
   - Exports individual calculation functions
   - Includes constants (gravity, runoff coefficients, etc.)

2. **MongoDB Models with Pre-save Hooks**
   - `ReservoirGeometry.js` - Calculates geometry-related fields
   - `StorageCapacity.js` - Calculates storage and capacity metrics

### 🔄 Implementation Approach

The system uses **Mongoose pre-save hooks** to automatically calculate derived fields before saving to the database. This ensures:
- Data consistency
- Automatic recalculation when input fields change
- No manual calculation required in controllers
- Values are stored in database for quick retrieval

## Calculated Fields by Category

### 1️⃣ Dam Identification & Network Connectivity (CoreDamInfo)

**Derived Fields:**
- `cascadingRiskIndex` - Computed from upstream/downstream stress
- `basinPriorityIndex` - Based on dam importance in basin
- `downstreamAbsorptionCapacity` - From downstream dam capacities
- `basinCoordinationStatus` - Computed from coordination metrics

**Formulas:**
```javascript
cascadingRiskIndex = f(upstreamStress, downstreamStress, damHealthScore)
basinPriorityIndex = f(storageCapacity, downstreamPopulation, criticalInfrastructure)
downstreamAbsorptionCapacity = downstreamDam.maxStorage - downstreamDam.liveStorage
```

### 2️⃣ Reservoir Geometry & Physical Characteristics

**Derived Fields:**
- `riverCrossSectionArea` → riverWidth × riverDepth
- `hydraulicRadius` → Area / WettedPerimeter
- `effectiveDischargeCapacity` → dischargeCoefficient × gateOpeningPercentage × head
- `elevationFromStorage` → Using storage-elevation curves
- `surfaceAreaAtCurrentLevel` → From area-elevation curves

**Implementation:** ✅ Model created with pre-save hooks

### 3️⃣ Storage & Capacity Parameters

**Derived Fields:**
- `availableCapacity` → maxStorage − liveStorage
- `storageUtilizationPercentage` → (liveStorage / maxStorage) × 100
- `floodCushionAvailable` → floodCushionStorage − currentExcessStorage
- `basinTotalStorage` → Sum of all dam storages
- `basinStorageUtilization` → (basinLiveStorage / basinTotalStorage) × 100

**Implementation:** ✅ Model created with pre-save hooks

### 4️⃣ Real-time Water Level & Flow

**Derived Fields:**
- `totalInflow` → inflowRate + inflowFromUpstreamDam + rainfallContribution
- `rainfallContribution` → rainfallRate × catchmentArea × runoffCoefficient
- `evaporationLoss` → evaporationRate × surfaceArea
- `netFlow` → totalInflow − (outflowRate + spillwayDischarge + evaporationLoss)
- `riverVelocity` → Using Manning's Equation
- `safeOutflowMargin` → downstreamSafeDischargeLimit − currentDischarge

**Implementation:** ⚠️ Partially implemented in DamStatus model

### 5️⃣ Forecast & Meteorological Data

**Derived Fields:**
- `predictedRainfallContribution` → rainfallForecast × catchmentArea × runoffCoefficient
- `runoffVolumeForecast` → rainfallForecastNext24hr × runoffCoefficient
- `catchmentRunoffIndex` → f(soilMoistureIndex, rainfallForecast)
- `stormRiskIndex` → f(weatherSystemSeverityIndex, windSpeed)
- `basinRainfallAverage` → Average rainfall of all dams

**Formulas in calculationEngine.js:** ✅

### 6️⃣ Predictive & Simulation Outputs

**Derived Fields:**
- `arrivalTimeFromUpstream` → upstreamDamDistance / upstreamRiverVelocity
- `downstreamArrivalTime` → downstreamDamDistance / downstreamRiverVelocity
- `predictedStorage` → currentStorage + (netFlow × time)
- `predictedWaterLevel` → predictedStorage ÷ surfaceArea
- `timeToOverflow` → availableCapacity ÷ netFlow
- `floodRiskScore` → Weighted combination of multiple factors
- `cascadingFailureProbability` → Based on upstream + downstream stress

**Formulas in calculationEngine.js:** ✅

### 7️⃣ Historical & Risk Reference Data

**Derived Fields:**
- `returnPeriodFloodLevel` → Statistical frequency analysis
- `probableMaximumFlood (PMF)` → Hydrological modeling
- `floodRecurrenceInterval` → Derived from historicalFloodEvents
- `anomalyDetectionScore` → AI anomaly detection

**Note:** These require historical data analysis and ML models

### 8️⃣ Structural Health Monitoring

**Derived Fields:**
- `damHealthScore` → Weighted function of stress, seepage, vibration, sensors
- `structuralFailureProbability` → Based on stress vs design limit
- `maintenanceUrgencyLevel` → f(damHealthScore, inspectionDate)

**Formula:**
```javascript
damHealthScore = 100 - (
  (structuralStressIndex/10) * 30 +
  (seepageRate/100) * 25 +
  (vibrationLevel/10) * 20 +
  sensorStatusPenalty * 15 +
  (upliftPressure/1000) * 10
)
```

**Formulas in calculationEngine.js:** ✅

### 9️⃣ Gate & Spillway Control System

**Derived Fields:**
- `actualDischarge` → dischargeCoefficient × gateOpening × √(2 × g × head)
- `requiredSpillwayIncrease` → totalInflow − safeStorageTarget
- `gateEfficiencyIndex` → actualDischarge / maxGateDischargeCapacity
- `releaseOptimizationValue` → AI output

**Formulas in calculationEngine.js:** ✅

### 🔟 Downstream Risk & Safety

**Derived Fields:**
- `downstreamFloodImpactScore` → f(population, infrastructure, discharge)
- `evacuationTimeRemaining` → predictedOverflowTime − evacuationTimeRequired
- `dangerLevelStatus` → Compare predictedRiverLevel with dangerLevel
- `humanRiskIndex` → f(population, floodProbability)

**Formulas in calculationEngine.js:** ✅

### 1️⃣1️⃣ Basin-Level Aggregated Fields

**Derived Fields:**
- `basinRainfallAverage` → Average rainfall of all dams in basin
- `basinStorageUtilization` → (basinLiveStorage / basinTotalStorage) × 100
- `basinFloodRiskLevel` → Aggregated floodRiskScore
- `cascadingFailureProbability` → Based on upstream + downstream stress
- `multiDamOptimizationScore` → AI optimization output

**Formulas in calculationEngine.js:** ✅

## Implementation Steps

### Phase 1: Core Infrastructure ✅
- [x] Create calculation engine with all formulas
- [x] Create ReservoirGeometry model with pre-save hooks
- [x] Create StorageCapacity model with pre-save hooks

### Phase 2: Remaining Models ✅
- [x] Create ForecastMeteo model
- [x] Create PredictiveSimulation model
- [x] Create HistoricalRisk model
- [x] Create StructuralHealth model
- [x] Create GateSpillway model
- [x] Create DownstreamRisk model
- [x] Create BasinAggregated model

### Phase 3: Controllers & Routes ✅
- [x] Create controllers for each new model
- [x] Add CRUD routes for each category
- [x] Implement GET/POST/PUT endpoints
- [x] Add special endpoints (getAllDamData, recalculateAllFields)
- [x] Integrate routes into server.js

### Phase 4: Frontend Integration (To Do)
- [ ] Update frontend pages to display calculated fields as read-only
- [ ] Add visual indicators for calculated vs input fields
- [ ] Implement real-time calculation preview

### Phase 5: Basin-Level Aggregation (To Do)
- [ ] Create aggregation service for basin-wide calculations
- [ ] Implement scheduled jobs for periodic recalculation
- [ ] Add basin dashboard with aggregated metrics

## Usage Example

```javascript
// Creating a new reservoir geometry record
const geometry = new ReservoirGeometry({
  dam: damId,
  riverWidth: 50,
  riverDepth: 10,
  dischargeCoefficient: 0.6,
  gateOpeningPercentage: 75,
  head: 20
});

// Save will automatically calculate derived fields
await geometry.save();

// Calculated fields are now available
console.log(geometry.riverCrossSectionArea); // 500 m²
console.log(geometry.hydraulicRadius); // 7.14 m
console.log(geometry.effectiveDischargeCapacity); // 9 m³/s
```

## API Endpoints Structure

```
POST   /api/dam/reservoir-geometry/:damId
GET    /api/dam/reservoir-geometry/:damId
PUT    /api/dam/reservoir-geometry/:damId

POST   /api/dam/storage-capacity/:damId
GET    /api/dam/storage-capacity/:damId
PUT    /api/dam/storage-capacity/:damId

POST   /api/dam/forecast-meteo/:damId
GET    /api/dam/forecast-meteo/:damId
PUT    /api/dam/forecast-meteo/:damId

... (similar for all categories)
```

## Frontend Display Strategy

### Input Fields
- Normal text/number inputs
- User can edit
- White background

### Calculated Fields
- Read-only display
- Light gray background
- Icon indicator (🔢 or ⚙️)
- Tooltip showing formula

### Example UI:
```
┌─────────────────────────────────────┐
│ River Width (m): [____50____]      │ ← Input
│ River Depth (m): [____10____]      │ ← Input
│ Cross-Section Area: 500 m² 🔢      │ ← Calculated (read-only)
└─────────────────────────────────────┘
```

## Testing Strategy

1. **Unit Tests** - Test each calculation function
2. **Integration Tests** - Test model pre-save hooks
3. **API Tests** - Test CRUD operations
4. **Validation Tests** - Ensure calculated values are correct

## Performance Considerations

- Calculations run on save (not on every read)
- Indexed fields for quick queries
- Caching for basin-level aggregations
- Batch updates for multiple dams

## Future Enhancements

1. **Real-time Recalculation** - WebSocket updates when upstream data changes
2. **ML Integration** - Machine learning models for advanced predictions
3. **Historical Analysis** - Trend analysis and anomaly detection
4. **Optimization Engine** - Multi-objective optimization for basin management
5. **Alert System** - Automatic alerts based on calculated risk scores

## Notes

- All calculations use SI units (meters, cubic meters, seconds)
- Formulas are based on standard hydraulic engineering principles
- Manning's coefficient default: 0.03 (concrete channels)
- Runoff coefficient default: 0.7 (typical for catchments)
- Gravity constant: 9.81 m/s²

## References

- Manning's Equation for open channel flow
- Hydraulic engineering principles
- Dam safety guidelines
- Flood risk assessment methodologies
