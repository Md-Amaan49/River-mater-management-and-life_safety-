# Safety & Alert System Implementation

## Overview
Comprehensive redesign of the Safety and Alert System with role-based dashboards and automatic calculations.

## Features Implemented

### 1. Backend Components

#### SafetyAlert Model (`backend/models/SafetyAlert.js`)
- **Input Fields** (Base Data):
  - Current State: water level, capacity, storage, inflow/outflow rates
  - Weather: forecast rainfall, thresholds
  - Structural: stress level, health score, gate status
  - Downstream: distance, velocity, affected areas, population
  - Safety: safe zones, evacuation routes, instructions

- **Calculated Fields** (Auto-computed):
  - Predictions: water levels (1hr, 6hr), flood arrival time
  - Flow Analysis: net inflow, available storage, time to full capacity
  - Risk Assessment: flood risk score, structural failure probability
  - Emergency Response: evacuation lead time, rescue window time
  - Alert levels: emergency level, public alert level

- **Alert Flags** (Boolean):
  - Controller: critical gate action, spillway adjustment, structural stress
  - Government: flood watch, district warning, evacuation, disaster alert
  - Rescue Team: deployment preparation, mobilization, road cutoff

#### Controller (`backend/controllers/safetyAlertController.js`)
- `getSafetyAlert`: Get all data for a dam
- `upsertSafetyAlert`: Create or update safety alert data
- `getControllerDashboard`: Controller-specific data
- `getGovernmentDashboard`: Government-specific data
- `getRescueDashboard`: Rescue team-specific data
- `getPublicAlert`: Public-facing alert data
- `getAllActiveAlerts`: Monitor all active alerts across dams

#### Routes (`backend/routes/safetyAlertRoutes.js`)
- `GET /api/safety-alert/dam/:damId` - Get safety alert data
- `POST /api/safety-alert/dam/:damId` - Create safety alert data
- `PUT /api/safety-alert/dam/:damId` - Update safety alert data
- `GET /api/safety-alert/dam/:damId/controller` - Controller dashboard
- `GET /api/safety-alert/dam/:damId/government` - Government dashboard
- `GET /api/safety-alert/dam/:damId/rescue` - Rescue dashboard
- `GET /api/safety-alert/dam/:damId/public` - Public alert
- `GET /api/safety-alert/active-alerts` - All active alerts

### 2. Frontend Components

#### SafetyAlertPage (`frontend/src/pages/SafetyAlertPage.jsx`)
Role-based tabbed interface with 5 sections:

**📝 Input Data Tab**
- All input fields organized by category
- Current State Parameters
- Weather & Predictions
- Structural Parameters
- Downstream Information
- Safety & Evacuation

**👷 Controller Dashboard Tab**
- Active alerts with color coding
- Current status
- Predictions (1hr, 6hr water levels)
- Flow analysis (net inflow, available storage, time to full capacity)
- Risk assessment (stress index, flood risk score, failure probability)
- Emergency response metrics

**🏛 Government Dashboard Tab**
- Emergency level indicator (color-coded)
- Flood risk score
- Active government alerts
- Affected districts and population
- Predicted flood time
- Evacuation lead time
- Economic loss estimate

**🚑 Rescue Team Dashboard Tab**
- Active rescue alerts
- Flood arrival time
- Predicted water depth
- Rescue window time
- Bridge submergence risk
- Affected villages list
- Safe route map

**👥 Public Alert Tab**
- Large color-coded alert level indicator
  - 🟢 Safe
  - 🟡 Be Alert
  - 🟠 Move To Safer Area
  - 🔴 Evacuate Immediately
- Estimated time of flood
- Water release time
- Safe zones
- Evacuation routes
- Safety instructions

### 3. Calculation Logic

#### Automatic Calculations (Pre-save Hook)
1. **Net Inflow Rate** = Inflow Rate - Outflow Rate
2. **Available Storage** = Max Capacity - Current Storage
3. **Time to Full Capacity** = Available Storage / (Net Inflow Rate × 3600)
4. **Predicted Water Levels** = Current Level + (Increase Rate × Time)
5. **Required Spillway Increase** = Net Inflow × 0.5 (if time to full < 6 hours)
6. **Downstream Flood Arrival Time** = Distance / Velocity
7. **Flood Risk Score** = Storage Risk + Inflow Risk + Rainfall Risk (0-100)
8. **Structural Failure Probability** = (1 - Health Score/100) × 100 × (1 + Stress Index)
9. **Evacuation Lead Time** = Flood Arrival Time - 2 hours
10. **Economic Loss Estimate** = Base × (Risk Score/100) × (Population/1000)
11. **Rescue Window Time** = Flood Arrival Time - 1 hour

#### Alert Triggers
- **Critical Gate Action**: Time to full capacity < 2 hours
- **Immediate Spillway Adjustment**: Required increase > safe discharge limit
- **Heavy Rainfall Predicted**: Forecast > threshold
- **Structural Stress Warning**: Stress index > 0.9
- **Flood Watch Advisory**: Risk score 30-50
- **District Flood Warning**: Risk score 50-70
- **Evacuation Recommended**: Risk score 70-90
- **National Disaster Alert**: Risk score ≥ 90
- **Prepare Deployment**: Risk score 40-60
- **Immediate Mobilization**: Risk score ≥ 60
- **Road Cutoff Expected**: Bridge submergence risk > 70%

### 4. Emergency Levels
- **Normal**: Risk score < 30
- **Watch**: Risk score 30-50
- **Warning**: Risk score 50-70
- **Critical**: Risk score 70-90
- **Disaster**: Risk score ≥ 90

### 5. Public Alert Levels
- **🟢 Safe**: Risk score < 30
- **🟡 Be Alert**: Risk score 30-60
- **🟠 Move To Safer Area**: Risk score 60-80
- **🔴 Evacuate Immediately**: Risk score ≥ 80

## Usage

### For Dam Controllers
1. Navigate to Safety Alert page for a dam
2. Go to "Input Data" tab
3. Enter all current measurements and parameters
4. Click "Save" or "Update"
5. Switch to "Controller" tab to see calculated metrics and active alerts

### For Government Officials
1. Access the "Government" tab
2. View emergency level and flood risk score
3. Check active alerts
4. Review affected areas and population
5. Monitor evacuation lead time and economic impact

### For Rescue Teams
1. Access the "Rescue Team" tab
2. Check active rescue alerts
3. Review flood arrival time and rescue window
4. Access affected villages list
5. View safe route map

### For Public
1. Access the "Public Alert" tab
2. See large, clear alert level indicator
3. Read estimated time of flood
4. Note safe zones and evacuation routes
5. Follow safety instructions

## API Endpoints

### Main Endpoints
```
GET    /api/safety-alert/dam/:damId
POST   /api/safety-alert/dam/:damId
PUT    /api/safety-alert/dam/:damId
```

### Role-Specific Endpoints
```
GET    /api/safety-alert/dam/:damId/controller
GET    /api/safety-alert/dam/:damId/government
GET    /api/safety-alert/dam/:damId/rescue
GET    /api/safety-alert/dam/:damId/public
```

### Monitoring
```
GET    /api/safety-alert/active-alerts
```

## Database Schema
- Collection: `safetyalerts`
- Unique constraint on `damId`
- Automatic timestamps (createdAt, updatedAt)
- Pre-save hook for all calculations

## Color Coding
- **Green (#4CAF50)**: Safe/Normal
- **Yellow (#FFC107)**: Be Alert/Watch
- **Orange (#FF9800)**: Warning/Move to Safety
- **Red (#F44336)**: Critical/Evacuate
- **Blue (#2196F3)**: Information

## Next Steps
1. ✅ Test with real dam data
2. ✅ Populate safety alert data for all 45 dams
3. Create monitoring dashboard for all active alerts
4. Add SMS/Email notification system
5. Integrate with weather API for automatic rainfall updates
6. Add historical alert logs
7. Create mobile app interface

## Data Population

### Scripts Available
- `npm run populate-safety-alerts` - Populate safety alert data for all 45 dams
- `npm run verify-safety-alerts` - Verify and display safety alert statistics

### Population Results
- **Total Dams**: 45
- **Successfully Created**: 45
- **Errors**: 0

### Alert Distribution
- 🔴 Critical/Disaster (≥70): 0
- 🟠 Warning (50-70): 19
- 🟡 Watch (30-50): 17
- 🟢 Normal (<30): 9

All safety alert data has been successfully populated with realistic values including:
- Varied risk levels across dams
- State-specific affected districts
- Realistic inflow/outflow rates
- Weather predictions
- Structural health metrics
- Downstream impact assessments
- Evacuation and safety information

## Files Created/Modified
- `backend/models/SafetyAlert.js` (new)
- `backend/controllers/safetyAlertController.js` (new)
- `backend/routes/safetyAlertRoutes.js` (new)
- `backend/server.js` (modified - added routes)
- `backend/scripts/populateSafetyAlerts.js` (new)
- `backend/scripts/verifySafetyAlerts.js` (new)
- `frontend/src/pages/SafetyAlertPage.jsx` (new)
- `frontend/src/App.jsx` (modified - added route)
- `frontend/src/components/AddDataForm.jsx` (modified - updated card route)
- `package.json` (modified - added npm scripts)

## Route in Application
Access via: `/safety-alert/:damId`

Example: `http://localhost:3000/safety-alert/695133a1b8a023da8b240761`
