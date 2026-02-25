# API Endpoints for Calculated Fields

## Base URL
```
https://river-water-management-and-life-safety.onrender.com/api/dam
```

## Endpoints by Category

### 1. Reservoir Geometry & Physical Characteristics
```
GET    /api/dam/reservoir-geometry/:damId
POST   /api/dam/reservoir-geometry/:damId
PUT    /api/dam/reservoir-geometry/:damId
```

**Calculated Fields:**
- `riverCrossSectionArea` (m²)
- `hydraulicRadius` (m)
- `effectiveDischargeCapacity` (m³/s)

---

### 2. Storage & Capacity Parameters
```
GET    /api/dam/storage-capacity/:damId
POST   /api/dam/storage-capacity/:damId
PUT    /api/dam/storage-capacity/:damId
```

**Calculated Fields:**
- `availableCapacity` (m³)
- `storageUtilizationPercentage` (%)
- `floodCushionAvailable` (m³)

---

### 3. Forecast & Meteorological Data
```
GET    /api/dam/forecast-meteo/:damId
POST   /api/dam/forecast-meteo/:damId
PUT    /api/dam/forecast-meteo/:damId
```

**Calculated Fields:**
- `predictedRainfallContribution` (m³/s)
- `runoffVolumeForecast` (m³)
- `catchmentRunoffIndex` (0-100)
- `stormRiskIndex` (0-100)

---

### 4. Predictive & Simulation Outputs
```
GET    /api/dam/predictive-simulation/:damId
POST   /api/dam/predictive-simulation/:damId
PUT    /api/dam/predictive-simulation/:damId
```

**Calculated Fields:**
- `arrivalTimeFromUpstream` (hours)
- `downstreamArrivalTime` (hours)
- `predictedStorage` (m³)
- `predictedWaterLevel` (m)
- `timeToOverflow` (hours)
- `floodRiskScore` (0-100)
- `overflowProbability` (%)
- `predictionConfidenceLevel` (%)

---

### 5. Historical & Risk Reference Data
```
GET    /api/dam/historical-risk/:damId
POST   /api/dam/historical-risk/:damId
PUT    /api/dam/historical-risk/:damId
```

**Calculated Fields:**
- `returnPeriodFloodLevel` (m)
- `probableMaximumFlood` (m³/s)
- `floodRecurrenceInterval` (years)
- `anomalyDetectionScore` (0-100)

---

### 6. Structural Health Monitoring
```
GET    /api/dam/structural-health/:damId
POST   /api/dam/structural-health/:damId
PUT    /api/dam/structural-health/:damId
```

**Calculated Fields:**
- `damHealthScore` (0-100)
- `structuralFailureProbability` (%)
- `maintenanceUrgencyLevel` (Low/Medium/High/Critical)

---

### 7. Gate & Spillway Control System
```
GET    /api/dam/gate-spillway/:damId
POST   /api/dam/gate-spillway/:damId
PUT    /api/dam/gate-spillway/:damId
```

**Calculated Fields:**
- `actualDischarge` (m³/s)
- `requiredSpillwayIncrease` (m³/s)
- `gateEfficiencyIndex` (%)
- `releaseOptimizationValue` (0-100)

---

### 8. Downstream Risk & Safety Parameters
```
GET    /api/dam/downstream-risk/:damId
POST   /api/dam/downstream-risk/:damId
PUT    /api/dam/downstream-risk/:damId
```

**Calculated Fields:**
- `downstreamFloodImpactScore` (0-100)
- `evacuationTimeRemaining` (minutes)
- `dangerLevelStatus` (Safe/Warning/Danger/Critical)
- `humanRiskIndex` (0-100)

---

### 9. Basin-Level Aggregated Fields
```
GET    /api/dam/basin-aggregated/:damId
POST   /api/dam/basin-aggregated/:damId
PUT    /api/dam/basin-aggregated/:damId
```

**Calculated Fields:**
- `basinStorageUtilization` (%)
- `cascadingFailureProbability` (%)
- `multiDamOptimizationScore` (0-100)

---

## Special Endpoints

### Get All Data for a Dam
```
GET /api/dam/all-data/:damId
```

Returns all data categories for a specific dam in a single response.

**Response Structure:**
```json
{
  "reservoirGeometry": { ... },
  "storageCapacity": { ... },
  "forecastMeteo": { ... },
  "predictiveSimulation": { ... },
  "historicalRisk": { ... },
  "structuralHealth": { ... },
  "gateSpillway": { ... },
  "downstreamRisk": { ... },
  "basinAggregated": { ... }
}
```

---

### Recalculate All Fields
```
POST /api/dam/recalculate/:damId
```

Triggers recalculation of all derived fields for a dam. Useful when input data changes.

**Response:**
```json
{
  "message": "All fields recalculated successfully",
  "results": [
    { "model": "ReservoirGeometry", "status": "recalculated" },
    { "model": "StorageCapacity", "status": "recalculated" },
    ...
  ]
}
```

---

## Request/Response Examples

### Example: Create Reservoir Geometry Data

**Request:**
```http
POST /api/dam/reservoir-geometry/507f1f77bcf86cd799439011
Content-Type: application/json

{
  "riverWidth": 50,
  "riverDepth": 10,
  "dischargeCoefficient": 0.6,
  "gateOpeningPercentage": 75,
  "head": 20,
  "height": 45,
  "length": 300,
  "crestLevel": 150
}
```

**Response:**
```json
{
  "_id": "507f1f77bcf86cd799439012",
  "dam": "507f1f77bcf86cd799439011",
  "riverWidth": 50,
  "riverDepth": 10,
  "dischargeCoefficient": 0.6,
  "gateOpeningPercentage": 75,
  "head": 20,
  "height": 45,
  "length": 300,
  "crestLevel": 150,
  "riverCrossSectionArea": 500,
  "hydraulicRadius": 7.14,
  "effectiveDischargeCapacity": 9,
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

---

### Example: Update Storage Capacity Data

**Request:**
```http
PUT /api/dam/storage-capacity/507f1f77bcf86cd799439011
Content-Type: application/json

{
  "maxStorage": 1000000,
  "liveStorage": 750000,
  "floodCushionStorage": 200000,
  "currentExcessStorage": 50000
}
```

**Response:**
```json
{
  "_id": "507f1f77bcf86cd799439013",
  "dam": "507f1f77bcf86cd799439011",
  "maxStorage": 1000000,
  "liveStorage": 750000,
  "floodCushionStorage": 200000,
  "currentExcessStorage": 50000,
  "availableCapacity": 250000,
  "storageUtilizationPercentage": 75,
  "floodCushionAvailable": 150000,
  "updatedAt": "2024-01-15T10:35:00.000Z"
}
```

---

## Error Responses

### 404 - Data Not Found
```json
{
  "message": "Data not found"
}
```

### 400 - Data Already Exists
```json
{
  "message": "Data already exists for this dam. Use PUT to update."
}
```

### 500 - Server Error
```json
{
  "message": "Failed to create data",
  "error": "Error details here"
}
```

---

## Notes

1. **Automatic Calculation**: All calculated fields are automatically computed when data is saved or updated. You don't need to provide values for calculated fields in POST/PUT requests.

2. **Validation**: The API validates input data according to the model schema. Invalid data will return a 400 error.

3. **Unique Constraint**: Each dam can have only one record per data category. Use PUT to update existing data.

4. **Timestamps**: All records include `createdAt` and `updatedAt` timestamps.

5. **Units**: All measurements use SI units (meters, cubic meters, seconds, etc.)

---

## Frontend Integration

Update the frontend pages to use these endpoints:

```javascript
// Example: Fetch reservoir geometry data
const fetchData = async () => {
  try {
    const res = await axios.get(
      `https://river-water-management-and-life-safety.onrender.com/api/dam/reservoir-geometry/${damId}`
    );
    setFormData(res.data);
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

// Example: Save/update data
const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const method = isExisting ? 'put' : 'post';
    await axios[method](
      `https://river-water-management-and-life-safety.onrender.com/api/dam/reservoir-geometry/${damId}`,
      formData
    );
    setMessage("Data saved successfully");
  } catch (error) {
    setMessage("Failed to save data");
  }
};
```
