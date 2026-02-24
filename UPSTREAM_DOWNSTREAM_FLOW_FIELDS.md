# Upstream/Downstream Flow Fields Addition to RealtimeDamStatus

## Overview

Added 4 new fields to the RealtimeDamStatus component and DamStatus model to track water flow and velocity between connected dams in a river network.

## New Fields Added

1. **Inflow from Upstream Dam** (Number) - Water flow rate coming from the upstream dam (m³/s)
2. **Outflow to Downstream Dam** (Number) - Water flow rate going to the downstream dam (m³/s)
3. **Upstream River Velocity** (Number) - Water velocity in the upstream river section (m/s)
4. **Downstream River Velocity** (Number) - Water velocity in the downstream river section (m/s)

All fields store float values with appropriate units.

## Changes Made

### 1. Backend - DamStatus Model (`backend/models/DamStatus.js`)

Added 4 new fields to the schema:

```javascript
const damStatusSchema = new mongoose.Schema({
  // ... existing fields ...
  
  // upstream/downstream flow tracking
  inflowFromUpstreamDam: { type: Number }, // m3/s - water coming from upstream dam
  outflowToDownstreamDam: { type: Number }, // m3/s - water going to downstream dam
  upstreamRiverVelocity: { type: Number }, // m/s - water velocity in upstream river section
  downstreamRiverVelocity: { type: Number }, // m/s - water velocity in downstream river section
  
  // ... rest of fields ...
}, { timestamps: true });
```

### 2. Frontend - RealtimeDamStatus Component (`frontend/src/components/RealtimeDamStatus.jsx`)

#### A. Updated Form State

Added new fields to the initial state:

```javascript
const [form, setForm] = useState({
  // ... existing fields ...
  inflowFromUpstreamDam: "",
  outflowToDownstreamDam: "",
  upstreamRiverVelocity: "",
  downstreamRiverVelocity: "",
  // ... rest of fields ...
});
```

#### B. Added Input Fields

Added four new input fields in the form:

```javascript
<label className="flex flex-col">
  <span className="font-medium">Inflow from Upstream Dam (m³/s)</span>
  <input
    value={form.inflowFromUpstreamDam || ""}
    onChange={(e) =>
      onChange("inflowFromUpstreamDam", e.target.value ? Number(e.target.value) : "")
    }
    type="number"
    step="0.01"
    placeholder="e.g., 125.5"
    className="border rounded p-2"
  />
</label>

<label className="flex flex-col">
  <span className="font-medium">Outflow to Downstream Dam (m³/s)</span>
  <input
    value={form.outflowToDownstreamDam || ""}
    onChange={(e) =>
      onChange("outflowToDownstreamDam", e.target.value ? Number(e.target.value) : "")
    }
    type="number"
    step="0.01"
    placeholder="e.g., 98.3"
    className="border rounded p-2"
  />
</label>

<label className="flex flex-col">
  <span className="font-medium">Upstream River Velocity (m/s)</span>
  <input
    value={form.upstreamRiverVelocity || ""}
    onChange={(e) =>
      onChange("upstreamRiverVelocity", e.target.value ? Number(e.target.value) : "")
    }
    type="number"
    step="0.01"
    placeholder="e.g., 2.5"
    className="border rounded p-2"
  />
</label>

<label className="flex flex-col">
  <span className="font-medium">Downstream River Velocity (m/s)</span>
  <input
    value={form.downstreamRiverVelocity || ""}
    onChange={(e) =>
      onChange("downstreamRiverVelocity", e.target.value ? Number(e.target.value) : "")
    }
    type="number"
    step="0.01"
    placeholder="e.g., 3.2"
    className="border rounded p-2"
  />
</label>
```

## How It Works

### Data Flow

1. **Input**: User enters flow values in RealtimeDamStatus form
2. **Storage**: Data is saved to MongoDB DamStatus collection
3. **Retrieval**: Data is fetched when viewing dam status
4. **Display**: Fields appear in the form with other status information

### Field Behavior

- Both fields accept decimal numbers (float values)
- Step value is 0.01 for precise measurements
- Values are stored in cubic meters per second (m³/s)
- Fields are optional (not required)
- Data is automatically saved/updated with other status information

## Use Cases

### 1. Water Balance Monitoring

Track water flow through a dam network:

```
Upstream Dam (Koyna) releases: 150 m³/s
↓
Current Dam (Ujjani) receives: 125.5 m³/s (inflowFromUpstreamDam)
Current Dam (Ujjani) releases: 98.3 m³/s (outflowToDownstreamDam)
↓
Downstream Dam (Bhima) receives: 98.3 m³/s
```

### 2. Cascade Effect Analysis

Monitor how water release from upstream affects current dam:
- Compare `inflowFromUpstreamDam` with `inflowRate` (total inflow)
- Difference indicates local catchment contribution
- Helps predict water level changes

### 3. Network Flow Visualization

Use this data to visualize water flow in dam networks:
- Show flow arrows between dams on map
- Display flow rates on connections
- Highlight high-flow situations

### 4. Water Loss Calculation

Calculate water loss between dams:
```javascript
const waterLoss = inflowFromUpstreamDam - outflowToDownstreamDam;
// Positive value = water stored/evaporated
// Negative value = additional water from local sources
```

## Example Data Entry

For **Ujjani Dam** on Krishna River:

| Field | Value | Unit |
|-------|-------|------|
| Inflow from Upstream Dam | 125.5 | m³/s |
| Outflow to Downstream Dam | 98.3 | m³/s |
| Inflow Rate (total) | 150.0 | m³/s |
| Outflow Rate (total) | 120.0 | m³/s |

**Analysis**:
- Upstream contribution: 125.5 m³/s
- Local catchment: 150.0 - 125.5 = 24.5 m³/s
- Water stored: 150.0 - 120.0 = 30.0 m³/s
- Downstream release: 98.3 m³/s

## Relationship with CoreDamInfo Fields

These new fields work together with the upstream/downstream dam fields added to CoreDamInfo:

### CoreDamInfo (Static Data)
- `upstreamDam`: Name of upstream dam
- `upstreamDamDistance`: Distance in km
- `downstreamDam`: Name of downstream dam
- `downstreamDamDistance`: Distance in km

### RealtimeDamStatus (Dynamic Data)
- `inflowFromUpstreamDam`: Current flow from upstream (m³/s)
- `outflowToDownstreamDam`: Current flow to downstream (m³/s)

Together, they provide complete network information:
- **Who** is connected (CoreDamInfo)
- **How far** they are (CoreDamInfo)
- **How much water** is flowing (RealtimeDamStatus)

## API Endpoints

The existing RealtimeDamStatus API endpoints automatically handle these new fields:

- **GET** `/api/data/dam/:damId/status` - Retrieves status including new fields
- **POST** `/api/data/dam/:damId/status` - Creates status with new fields
- **PUT** `/api/data/dam/:damId/status` - Updates status including new fields

No changes needed to controllers - they already handle all fields in the DamStatus model.

## Database Migration

### For Existing Status Records

Existing status records will have these fields as `undefined` or `null` until updated. This is fine because:
- MongoDB handles missing fields gracefully
- The form displays empty strings for undefined values
- Users can update status records to add this information

### No Migration Script Needed

Since these are optional fields with no default values required, no migration script is necessary.

## Testing

To test the new fields:

1. **Navigate to RealtimeDamStatus**:
   - Go to any dam dashboard
   - Click on "Real-time Water Level & Flow" tab

2. **Enter New Data**:
   - Scroll to find "Inflow from Upstream Dam (m³/s)"
   - Enter a value (e.g., "125.5")
   - Find "Outflow to Downstream Dam (m³/s)"
   - Enter a value (e.g., "98.3")

3. **Save**:
   - Click "Save" button
   - Verify success message appears

4. **Verify Storage**:
   - Refresh the page
   - Check that values are still present
   - Check "Latest Status" JSON display at bottom
   - Verify in MongoDB that fields are saved

5. **API Testing**:
   ```bash
   # Get dam status
   curl https://your-api.com/api/data/dam/:damId/status
   
   # Should return:
   {
     "currentWaterLevel": 52.3,
     "inflowRate": 150.0,
     "outflowRate": 120.0,
     "inflowFromUpstreamDam": 125.5,
     "outflowToDownstreamDam": 98.3,
     ...
   }
   ```

## Future Enhancements

### 1. Auto-Calculate from Upstream Dam

Automatically fetch upstream dam's outflow:
```javascript
// When upstream dam is known from CoreDamInfo
const upstreamStatus = await fetchUpstreamDamStatus(upstreamDamId);
setForm(prev => ({
  ...prev,
  inflowFromUpstreamDam: upstreamStatus.outflowToDownstreamDam
}));
```

### 2. Flow Consistency Validation

Validate that flows make sense:
```javascript
// Warning if inflow from upstream > total inflow
if (inflowFromUpstreamDam > inflowRate) {
  showWarning("Upstream inflow cannot exceed total inflow");
}
```

### 3. Network Flow Diagram

Visualize flow between dams:
```javascript
// Show animated flow arrows on map
<FlowArrow 
  from={upstreamDam.coordinates}
  to={currentDam.coordinates}
  flowRate={inflowFromUpstreamDam}
  animated={true}
/>
```

### 4. Historical Flow Analysis

Track flow changes over time:
```javascript
// Chart showing upstream inflow vs downstream outflow
<LineChart data={historicalFlowData}>
  <Line dataKey="inflowFromUpstreamDam" stroke="blue" />
  <Line dataKey="outflowToDownstreamDam" stroke="green" />
</LineChart>
```

### 5. Alert System

Alert when flow rates are unusual:
```javascript
// Alert if downstream outflow suddenly drops
if (outflowToDownstreamDam < previousOutflow * 0.5) {
  createAlert("Significant flow reduction to downstream dam");
}
```

## Notes

- Values are stored as Numbers (float) for precise calculations
- Unit is always m³/s (cubic meters per second)
- Fields are optional to maintain backward compatibility
- No validation enforces relationship with total inflow/outflow
- Consider adding validation in future to ensure data consistency
- These fields complement the static upstream/downstream dam info in CoreDamInfo
