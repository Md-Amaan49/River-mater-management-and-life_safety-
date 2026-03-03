# API URL Configuration Update

## Overview
Updated all frontend files to use the centralized config file for API URLs instead of hardcoded localhost or production URLs. This ensures the application works correctly in both development and production environments.

## Changes Made

### 1. Config File Update (`frontend/src/config.js`)
Changed default URL from localhost to production:
```javascript
// Before
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// After
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://river-water-management-and-life-safety.onrender.com';
```

### 2. Files Updated (Total: 27 files)

#### Components (11 files)
1. `frontend/src/components/Sidebar.jsx`
2. `frontend/src/components/RealtimeDamStatus.jsx`
3. `frontend/src/components/SupportingInfo.jsx`
4. `frontend/src/components/SensorManagement.jsx`
5. `frontend/src/components/WaterUsage.jsx`
6. `frontend/src/components/Safety.jsx`
7. `frontend/src/components/Features.jsx`
8. `frontend/src/components/AlertDashboard.jsx`
9. `frontend/src/components/AdminDataForms.jsx`
10. `frontend/src/components/CoreDamInfo.jsx`
11. `frontend/src/components/TestAlertDashboard.jsx`

#### Pages (10 files)
1. `frontend/src/pages/WaterFlowPage.jsx`
2. `frontend/src/pages/AlertPage.jsx`
3. `frontend/src/pages/WaterLevel.jsx`
4. `frontend/src/pages/DamDashboard.jsx`
5. `frontend/src/pages/WaterUsagePage.jsx`
6. `frontend/src/pages/AdminDashboard.jsx`
7. `frontend/src/pages/LoginPage.jsx`
8. `frontend/src/pages/ForecastMeteo.jsx`
9. `frontend/src/pages/GateSpillway.jsx`
10. `frontend/src/pages/HistoricalRisk.jsx`

#### Advanced Feature Pages (6 files)
1. `frontend/src/pages/BasinAggregated.jsx`
2. `frontend/src/pages/PredictiveSimulation.jsx`
3. `frontend/src/pages/DownstreamRisk.jsx`
4. `frontend/src/pages/StructuralHealth.jsx`
5. `frontend/src/pages/SafetyAlertPage.jsx`
6. `frontend/src/pages/ReservoirGeometry.jsx`
7. `frontend/src/pages/StorageCapacity.jsx`

#### Context Files (2 files)
1. `frontend/src/context/AuthContext.jsx`
2. `frontend/src/contexts/SearchContext.jsx`

## Pattern Used

All files now follow this pattern:

```javascript
// Import the config
import API_BASE_URL from "../config";

// Use it to construct API URLs
const API_BASE = `${API_BASE_URL}/api`;
const DATA_API = `${API_BASE}/data`;
// etc.
```

## Environment Variable Support

The application now supports environment-based configuration:

### Development (Local)
Set environment variable:
```bash
VITE_API_URL=http://localhost:5000
```

### Production (Render)
No environment variable needed - defaults to:
```
https://river-water-management-and-life-safety.onrender.com
```

### Custom Environment
Set any custom URL:
```bash
VITE_API_URL=https://your-custom-domain.com
```

## Benefits

1. **Single Source of Truth**: All API URLs managed in one place
2. **Environment Flexibility**: Easy to switch between dev/prod/staging
3. **No Hardcoded URLs**: Eliminates maintenance issues
4. **Production Ready**: Defaults to production URL for deployed builds
5. **Developer Friendly**: Can override with local environment variable

## Testing Checklist

- [x] Config file updated
- [x] All components updated
- [x] All pages updated
- [x] Context files updated
- [x] No diagnostics errors
- [ ] Test login/register on production
- [ ] Test all API calls work correctly
- [ ] Verify environment variable override works

## Deployment Notes

When deploying to Render:
1. Frontend will automatically use production URL
2. No environment variables needed (unless custom URL required)
3. All API calls will point to: `https://river-water-management-and-life-safety.onrender.com`

For local development:
1. Create `.env` file in frontend directory
2. Add: `VITE_API_URL=http://localhost:5000`
3. Restart dev server

## Files Modified Summary

- **Config**: 1 file
- **Components**: 11 files
- **Pages**: 16 files
- **Contexts**: 2 files
- **Total**: 30 files

## Status
✅ **COMPLETED** - All frontend files now use centralized API configuration
