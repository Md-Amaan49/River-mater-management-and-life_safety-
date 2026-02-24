# Upstream/Downstream Dam Fields Addition

## Overview

Added 4 new fields to the CoreDamInfo form and Dam database model to track upstream and downstream dam relationships and distances.

## New Fields Added

1. **Upstream Dam** (String) - Name of the dam located upstream on the same river
2. **Upstream Dam Distance** (Number) - Distance in kilometers to the upstream dam
3. **Downstream Dam** (String) - Name of the dam located downstream on the same river
4. **Downstream Dam Distance** (Number) - Distance in kilometers to the downstream dam

## Changes Made

### 1. Backend - Dam Model (`backend/models/Dam.js`)

Added 4 new fields to the schema:

```javascript
const damSchema = new mongoose.Schema({
  // ... existing fields ...
  upstreamDam: String,
  upstreamDamDistance: Number,
  downstreamDam: String,
  downstreamDamDistance: Number,
}, { timestamps: true });
```

### 2. Frontend - CoreDamInfo Component (`frontend/src/components/CoreDamInfo.jsx`)

#### A. Updated State

Added new fields to the initial state:

```javascript
const [formData, setFormData] = useState({
  // ... existing fields ...
  upstreamDam: "",
  upstreamDamDistance: "",
  downstreamDam: "",
  downstreamDamDistance: "",
});
```

#### B. Updated Fields Array

Added new fields to the form fields array:

```javascript
const fields = [
  // ... existing fields ...
  { label: "Upstream Dam", name: "upstreamDam" },
  { label: "Upstream Dam Distance (km)", name: "upstreamDamDistance" },
  { label: "Downstream Dam", name: "downstreamDam" },
  { label: "Downstream Dam Distance (km)", name: "downstreamDamDistance" },
];
```

## How It Works

### Data Flow

1. **Input**: User enters upstream/downstream dam information in CoreDamInfo form
2. **Storage**: Data is saved to MongoDB with the dam document
3. **Retrieval**: Data is fetched when viewing/editing dam information
4. **Display**: Fields appear in the form table with other dam information

### Form Behavior

- All 4 new fields are optional (not required)
- Distance fields accept numeric values (in kilometers)
- Dam name fields accept text strings
- Data is automatically saved/updated with other dam information

## Use Cases

### 1. River Flow Analysis
Track the sequence of dams along a river to understand water flow patterns:
```
Upstream Dam: "Koyna Dam" (50 km upstream)
Current Dam: "Ujjani Dam"
Downstream Dam: "Bhima Dam" (75 km downstream)
```

### 2. Cascade Effect Monitoring
Monitor how water release from one dam affects downstream dams:
- If upstream dam releases water, downstream dams can prepare
- Distance helps calculate water travel time

### 3. Network Visualization
Use this data to draw connections between dams on the WaterFlowPage map:
- Show polylines connecting related dams
- Display distance labels on connections
- Highlight dam networks on rivers

## Example Data Entry

For **Ujjani Dam** on Krishna River:

| Field | Value |
|-------|-------|
| Upstream Dam | Koyna Dam |
| Upstream Dam Distance | 50 |
| Downstream Dam | Bhima Dam |
| Downstream Dam Distance | 75 |

## API Endpoints

The existing CoreDamInfo API endpoints automatically handle these new fields:

- **GET** `/api/dam/core/:damId` - Retrieves dam info including new fields
- **POST** `/api/dam/core/:damId` - Creates dam info with new fields
- **PUT** `/api/dam/core/:damId` - Updates dam info including new fields

No changes needed to controllers - they already handle all fields in the Dam model.

## Database Migration

### For Existing Dams

Existing dams in the database will have these fields as `undefined` or `null` until updated. This is fine because:
- MongoDB is schema-less and handles missing fields gracefully
- The form displays empty strings for undefined values
- Users can update dams to add this information over time

### No Migration Script Needed

Since these are optional fields with no default values required, no migration script is necessary.

## Future Enhancements

### 1. Dam Dropdown Selection
Instead of typing dam names, provide a dropdown of dams on the same river:
```javascript
<select name="upstreamDam">
  <option value="">Select Upstream Dam</option>
  {damsOnSameRiver.map(dam => (
    <option key={dam._id} value={dam.name}>{dam.name}</option>
  ))}
</select>
```

### 2. Auto-Calculate Distance
Use coordinates to automatically calculate distance between dams:
```javascript
const distance = calculateDistance(
  currentDam.coordinates,
  upstreamDam.coordinates
);
```

### 3. Visual Network on Map
Show dam connections on WaterFlowPage:
```javascript
// Draw line from current dam to upstream dam
<Polyline 
  positions={[currentDam.coords, upstreamDam.coords]}
  color="green"
/>
```

### 4. Bidirectional Relationships
Automatically update related dams when setting upstream/downstream:
- When setting Dam A's downstream as Dam B
- Automatically set Dam B's upstream as Dam A

## Testing

To test the new fields:

1. **Navigate to CoreDamInfo**:
   - Go to any dam dashboard
   - Click on "Core Dam Information" tab

2. **Enter New Data**:
   - Fill in "Upstream Dam" field (e.g., "Koyna Dam")
   - Fill in "Upstream Dam Distance" (e.g., "50")
   - Fill in "Downstream Dam" field (e.g., "Bhima Dam")
   - Fill in "Downstream Dam Distance" (e.g., "75")

3. **Save**:
   - Click "Save" or "Update" button
   - Verify success message appears

4. **Verify Storage**:
   - Refresh the page
   - Check that the values are still present
   - Verify in MongoDB that fields are saved

5. **API Testing**:
   ```bash
   # Get dam info
   curl https://your-api.com/api/dam/core/:damId
   
   # Should return:
   {
     "name": "Ujjani Dam",
     "upstreamDam": "Koyna Dam",
     "upstreamDamDistance": 50,
     "downstreamDam": "Bhima Dam",
     "downstreamDamDistance": 75,
     ...
   }
   ```

## Notes

- Distance values are stored as numbers (not strings) for easier calculations
- Dam names are stored as strings (could be changed to ObjectId references in future)
- Fields are optional to maintain backward compatibility
- No validation is enforced on dam names (could add validation to check if dam exists)
