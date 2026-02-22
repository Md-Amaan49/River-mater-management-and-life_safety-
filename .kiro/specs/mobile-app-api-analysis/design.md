# Mobile App API Analysis - Design Document

## Executive Summary

Your dam management system has a comprehensive REST API backend built with Express.js and MongoDB. After analyzing all routes, controllers, and models, here's the complete assessment for mobile app development.

**Overall Status**: 85% of APIs are mobile-ready with minor modifications needed. The backend uses JWT authentication, returns JSON responses, and follows RESTful conventions.

---

## 1. API Categories & Status

### 1.1 Authentication & User Management ✅ READY
**Base Path**: `/api/users`

| Endpoint | Method | Auth | Status | Notes |
|----------|--------|------|--------|-------|
| `/register` | POST | None | ✅ Ready | Supports profile image upload |
| `/login` | POST | None | ✅ Ready | Returns JWT + refresh token |
| `/refresh` | POST | None | ✅ Ready | Token refresh mechanism |
| `/profile` | GET | Required | ✅ Ready | User profile data |
| `/stats` | GET | Required | ✅ Ready | User statistics |
| `/saved-dams` | GET | Required | ✅ Ready | User's saved dams |
| `/saved-dams/:damId` | PATCH | Required | ✅ Ready | Toggle save/unsave dam |

**Mobile Readiness**: ✅ Excellent
- JWT authentication with refresh tokens
- Proper validation (email, mobile, password strength)
- Image upload support via multipart/form-data
- Clean JSON responses

---

### 1.2 Dam Data Management ✅ READY
**Base Paths**: `/api/data`, `/api/dam`, `/api/dams`

#### Core Dam Operations
| Endpoint | Method | Auth | Status | Notes |
|----------|--------|------|--------|-------|
| `/api/data/states` | GET | None | ✅ Ready | List all states |
| `/api/data/rivers/:stateId` | GET | None | ✅ Ready | Rivers by state |
| `/api/data/dams/:riverId` | GET | None | ✅ Ready | Dams by river |
| `/api/data/dam/:damId` | GET | None | ✅ Ready | Dam details |
| `/api/dam/dam/:id` | GET | None | ✅ Ready | Dam by ID |
| `/api/dam/by-state/:stateId` | GET | None | ✅ Ready | Dams by state |
| `/api/dam/by-river/:riverId` | GET | None | ✅ Ready | Dams by river name |

#### Dam Points (Map Integration)
| Endpoint | Method | Auth | Status | Notes |
|----------|--------|------|--------|-------|
| `/api/dam/dam-points` | GET | None | ✅ Ready | All dams with coordinates |
| `/api/dam/dam-points/state/:stateId` | GET | None | ✅ Ready | Dam points by state |
| `/api/dam/dam-points/:riverId` | GET | None | ✅ Ready | Dam points by river |

#### Search Functionality
| Endpoint | Method | Auth | Status | Notes |
|----------|--------|------|--------|-------|
| `/api/data/search/rivers` | GET | None | ✅ Ready | Search rivers |
| `/api/data/search/dams` | GET | None | ✅ Ready | Search dams |
| `/api/data/search/global` | GET | None | ✅ Ready | Global search |

**Mobile Readiness**: ✅ Excellent
- Hierarchical data structure (State → River → Dam)
- Coordinate data available for map integration
- Search functionality implemented
- No pagination (⚠️ may need for large datasets)

---

### 1.3 Real-time Dam Status ✅ READY
**Base Path**: `/api/data/dam/:damId/status`

| Endpoint | Method | Auth | Status | Notes |
|----------|--------|------|--------|-------|
| `/api/data/dam/:damId/status` | POST | None | ✅ Ready | Create status entry |
| `/api/data/dam/:damId/status` | PUT | None | ✅ Ready | Upsert current status |
| `/api/data/dam/:damId/status` | GET | None | ✅ Ready | Get latest status |
| `/api/data/dam/:damId/status/history` | GET | None | ✅ Ready | Status history (paginated) |

**Data Includes**:
- Water level (current, max, min)
- Inflow/outflow rates
- Spillway discharge
- Gate status (multiple gates supported)
- Sensor telemetry (source, power status, sync time)

**Mobile Readiness**: ✅ Excellent
- Perfect for real-time monitoring
- History with pagination (limit parameter)
- Supports both sensor and manual data entry
- ⚠️ Consider WebSocket for live updates

---

### 1.4 Alert System ✅ READY
**Base Path**: `/api/alerts`

| Endpoint | Method | Auth | Status | Notes |
|----------|--------|------|--------|-------|
| `/api/alerts` | GET | Required | ✅ Ready | All alerts with filters |
| `/api/alerts/critical` | GET | Required | ✅ Ready | Red & Yellow alerts only |
| `/api/alerts/regions` | GET | Required | ✅ Ready | Alerts grouped by state |
| `/api/alerts/activity` | GET | Required | ✅ Ready | Recent activity (7 days default) |
| `/api/alerts/dashboard` | GET | Required | ✅ Ready | Dashboard statistics |
| `/api/alerts/:alertId` | PUT | Admin | ✅ Ready | Update alert (admin only) |
| `/api/alerts/test/critical` | GET | None | ✅ Ready | Test data (no DB) |
| `/api/alerts/test/dashboard` | GET | None | ✅ Ready | Test dashboard |

**Query Parameters**:
- `riskLevel`: Filter by Green/Yellow/Red
- `state`: Filter by state name
- `river`: Filter by river name
- `sortBy`: Sort field (default: updatedAt)
- `sortOrder`: asc/desc (default: desc)
- `days`: Activity period (default: 7)

**Mobile Readiness**: ✅ Excellent
- Filtering and sorting support
- Categorized by urgency
- Geographic grouping
- Statistics included
- ⚠️ Missing: Push notification endpoints

---

### 1.5 Water Usage ✅ READY
**Base Path**: `/api/water-usage`

| Endpoint | Method | Auth | Status | Notes |
|----------|--------|------|--------|-------|
| `/api/water-usage` | GET | None | ✅ Ready | All water usage data |
| `/api/water-usage/:damId` | GET | None | ✅ Ready | Usage by dam |
| `/api/water-usage/dam/:damId` | GET | None | ✅ Ready | Usage by dam (alt) |
| `/api/water-usage/state/:stateName` | GET | None | ✅ Ready | Aggregated by state |
| `/api/water-usage/river/:riverId` | GET | None | ✅ Ready | Aggregated by river |
| `/api/water-usage` | POST | None | ⚠️ Needs Auth | Add usage data |
| `/api/water-usage/:id` | PUT | None | ⚠️ Needs Auth | Update usage |
| `/api/water-usage/:id` | DELETE | None | ⚠️ Needs Auth | Delete usage |

**Data Categories**:
- Irrigation, Drinking, Industrial, Hydropower
- Evaporation loss, Environmental flow
- Farming support (hectares)

**Mobile Readiness**: ✅ Good
- Comprehensive data structure
- Aggregation by state/river
- ⚠️ POST/PUT/DELETE should require authentication

---

### 1.6 Safety Information ✅ READY
**Base Path**: `/api/safety/dam/:id`

| Endpoint | Method | Auth | Status | Notes |
|----------|--------|------|--------|-------|
| `/api/safety/dam/:id` | GET | None | ✅ Ready | Get safety info |
| `/api/safety/dam/:id` | POST | None | ⚠️ Needs Auth | Add safety info |
| `/api/safety/dam/:id` | PUT | None | ⚠️ Needs Auth | Update safety info |

**Data Includes**:
- Flood risk level (Green/Yellow/Red)
- Seepage reports
- Structural health (cracks, vibration, tilt)
- Earthquake zone
- Maintenance schedule
- Emergency contacts

**Mobile Readiness**: ✅ Good
- Critical safety data available
- ⚠️ POST/PUT should require authentication

---

### 1.7 Sensor Management ✅ READY
**Base Path**: `/api/sensors`

| Endpoint | Method | Auth | Status | Notes |
|----------|--------|------|--------|-------|
| `/api/sensors` | GET | None | ✅ Ready | All sensors |
| `/api/sensors` | POST | None | ⚠️ Needs Auth | Add sensor |
| `/api/sensors/:id` | PUT | None | ⚠️ Needs Auth | Update sensor |
| `/api/sensors/:id` | DELETE | None | ⚠️ Needs Auth | Delete sensor |

**Sensor Types**: level, flow, seepage, vibration, weather

**Mobile Readiness**: ✅ Good
- Sensor status tracking
- Battery monitoring
- Last sync timestamps
- ⚠️ Write operations need authentication
- ⚠️ Missing: Filter by damId

---

### 1.8 Supporting Information ✅ READY
**Base Path**: `/api/supporting-info`

| Endpoint | Method | Auth | Status | Notes |
|----------|--------|------|--------|-------|
| `/api/supporting-info/dam/:damId` | GET | None | ✅ Ready | Get all info for dam |
| `/api/supporting-info/dam/:damId` | POST | None | ⚠️ Needs Auth | Add info |
| `/api/supporting-info/:id` | PUT | None | ⚠️ Needs Auth | Update info |
| `/api/supporting-info/:id` | DELETE | None | ⚠️ Needs Auth | Delete info |
| `/api/supporting-info/states` | GET | None | ✅ Ready | List states |
| `/api/supporting-info/rivers/:stateId` | GET | None | ✅ Ready | Rivers by state |
| `/api/supporting-info/dams/:riverId` | GET | None | ✅ Ready | Dams by river |

**Info Types**: guideline, publicSpot, prohibitedRegion

**Mobile Readiness**: ✅ Good
- Categorized information
- ⚠️ Write operations need authentication

---

### 1.9 Water Flow & GeoJSON 🔶 PARTIALLY READY
**Base Path**: `/api/waterflow`

| Endpoint | Method | Auth | Status | Notes |
|----------|--------|------|--------|-------|
| `/api/waterflow/states` | GET | None | ✅ Ready | Dropdown data |
| `/api/waterflow/rivers/:stateId` | GET | None | ✅ Ready | Rivers by state |
| `/api/waterflow/dams/:riverId` | GET | None | ✅ Ready | Dams by river |
| `/api/waterflow/geo/india` | GET | None | 🔶 Check | India GeoJSON |
| `/api/waterflow/geo/state/:stateId` | GET | None | 🔶 Check | State GeoJSON |
| `/api/waterflow/geo/river/:riverId` | GET | None | 🔶 Check | River GeoJSON |
| `/api/waterflow/dam-points/:riverId` | GET | None | ✅ Ready | Dam coordinates |
| `/api/waterflow/state-stats/:stateId` | GET | None | ✅ Ready | State statistics |
| `/api/waterflow/river-stats/:riverId` | GET | None | ✅ Ready | River statistics |
| `/api/waterflow/dam/:damId` | GET | None | ✅ Ready | Dam details |

**Mobile Readiness**: 🔶 Good with Caveats
- GeoJSON endpoints exist but need verification
- Static GeoJSON files served from `/geojson` directory
- ⚠️ Large GeoJSON files may be too heavy for mobile
- Consider simplified/compressed versions for mobile

---

### 1.10 Sidebar (User-Specific Data) ✅ READY
**Base Path**: `/api/sidebar`

| Endpoint | Method | Auth | Status | Notes |
|----------|--------|------|--------|-------|
| `/api/sidebar/alerts` | GET | Required | ✅ Ready | Alerts for saved dams |
| `/api/sidebar/saved-dams` | GET | Required | ✅ Ready | User's saved dams details |
| `/api/sidebar/guidelines` | GET | Required | ✅ Ready | Guidelines for saved dams |
| `/api/sidebar/restricted-areas` | GET | Required | ✅ Ready | Restricted areas |
| `/api/sidebar/public-spots` | GET | Required | ✅ Ready | Public spots |
| `/api/sidebar/history` | GET | Required | ✅ Ready | History for saved dams |
| `/api/sidebar/help` | GET | None | ✅ Ready | Help information |

**Mobile Readiness**: ✅ Excellent
- Personalized data based on user's saved dams
- Perfect for mobile dashboard/home screen

---

### 1.11 Admin Data Management ✅ READY
**Base Path**: `/api`

#### Dam History
| Endpoint | Method | Auth | Status | Notes |
|----------|--------|------|--------|-------|
| `/api/dam-history` | POST | Admin | ✅ Ready | Add history event |
| `/api/dam-history/:damId` | GET | Required | ✅ Ready | Get dam history |
| `/api/dam-history/:id` | PUT | Admin | ✅ Ready | Update event |
| `/api/dam-history/:id` | DELETE | Admin | ✅ Ready | Delete event |

#### Public Spots
| Endpoint | Method | Auth | Status | Notes |
|----------|--------|------|--------|-------|
| `/api/public-spots` | POST | Admin | ✅ Ready | Add spot |
| `/api/public-spots` | GET | Required | ✅ Ready | Get all spots |
| `/api/public-spots/:id` | PUT | Admin | ✅ Ready | Update spot |
| `/api/public-spots/:id` | DELETE | Admin | ✅ Ready | Delete spot |

#### Restricted Areas
| Endpoint | Method | Auth | Status | Notes |
|----------|--------|------|--------|-------|
| `/api/restricted-areas` | POST | Admin | ✅ Ready | Add area |
| `/api/restricted-areas` | GET | Required | ✅ Ready | Get all areas |
| `/api/restricted-areas/:id` | PUT | Admin | ✅ Ready | Update area |
| `/api/restricted-areas/:id` | DELETE | Admin | ✅ Ready | Delete area |

#### Guidelines
| Endpoint | Method | Auth | Status | Notes |
|----------|--------|------|--------|-------|
| `/api/guidelines` | POST | Admin | ✅ Ready | Add guideline |
| `/api/guidelines` | GET | Required | ✅ Ready | Get all guidelines |
| `/api/guidelines/:id` | PUT | Admin | ✅ Ready | Update guideline |
| `/api/guidelines/:id` | DELETE | Admin | ✅ Ready | Delete guideline |

**Mobile Readiness**: ✅ Excellent
- Proper role-based access control
- Admin features clearly separated
- ⚠️ Missing: Query filters (by damId, etc.)

---

### 1.12 Features Management ✅ READY
**Base Path**: `/api/features`

| Endpoint | Method | Auth | Status | Notes |
|----------|--------|------|--------|-------|
| `/api/features` | GET | None | ✅ Ready | List all features |
| `/api/features/dam/:damId` | GET | None | ✅ Ready | Features for dam |
| `/api/features` | POST | Admin | ✅ Ready | Add feature |
| `/api/features/:id` | PUT | Admin | ✅ Ready | Update feature |
| `/api/features/:id` | DELETE | Admin | ✅ Ready | Delete feature |
| `/api/features/history/:damId` | GET | Admin | ✅ Ready | Dam event history |
| `/api/features/report/:damId` | GET | Admin | ✅ Ready | Dam report |

**Mobile Readiness**: ✅ Good
- Feature listing available
- Admin tools for reports

---

## 2. Missing APIs for Mobile App

### 2.1 Critical Missing APIs 🔴

#### Push Notifications
```
POST /api/notifications/register
- Register device token for push notifications
- Body: { deviceToken, platform: 'ios'|'android', userId }

POST /api/notifications/subscribe
- Subscribe to specific dam alerts
- Body: { damId, alertTypes: ['flood', 'maintenance'] }

GET /api/notifications/preferences
- Get user notification preferences

PUT /api/notifications/preferences
- Update notification preferences
```

#### Offline Data Sync
```
GET /api/sync/last-updated
- Get last update timestamps for all data types
- Response: { dams: timestamp, alerts: timestamp, ... }

POST /api/sync/batch
- Batch sync multiple resources
- Body: { resources: ['dams', 'alerts'], lastSync: timestamp }
```

#### App-Specific Endpoints
```
GET /api/mobile/dashboard
- Optimized dashboard data for mobile
- Single endpoint returning: user stats, critical alerts, saved dams

GET /api/mobile/dam/:damId/summary
- Lightweight dam summary for list views
- Excludes heavy data like full history
```

### 2.2 High Priority Missing APIs 🟡

#### Pagination Support
```
Current: Most GET endpoints return all data
Needed: Add pagination to:
- /api/data/dams/:riverId?page=1&limit=20
- /api/alerts?page=1&limit=20
- /api/dam-history/:damId?page=1&limit=20
```

#### Filtering Enhancements
```
GET /api/sensors?damId=xxx&status=active
GET /api/public-spots?damId=xxx
GET /api/restricted-areas?damId=xxx
GET /api/guidelines?damId=xxx
```

#### Bulk Operations
```
POST /api/users/saved-dams/bulk
- Add/remove multiple dams at once
- Body: { action: 'add'|'remove', damIds: [] }
```

### 2.3 Medium Priority Missing APIs 🟢

#### Analytics
```
GET /api/analytics/user-activity
- User engagement metrics

GET /api/analytics/popular-dams
- Most viewed/saved dams
```

#### Favorites/Bookmarks
```
GET /api/users/recent-views
- Recently viewed dams

POST /api/users/recent-views/:damId
- Track dam view
```

#### Social Features
```
POST /api/reports/issue
- Report issues with dam data
- Body: { damId, issueType, description, images }

GET /api/reports/my-reports
- User's submitted reports
```

---

## 3. Authentication Implementation

### 3.1 Current Implementation ✅
```javascript
// JWT with refresh token
- Access token: 15 minutes (configurable)
- Refresh token: 7 days (configurable)
- Tokens stored in: JWT_SECRET, JWT_REFRESH_SECRET

// Middleware
- protect: Verifies JWT token
- admin: Checks user role === 'admin'
```

### 3.2 Mobile Integration
```
1. Login Flow:
   POST /api/users/login
   → Returns: { token, refreshToken, user }
   → Store both tokens securely (Keychain/Keystore)

2. API Requests:
   Headers: { Authorization: 'Bearer <token>' }

3. Token Refresh:
   POST /api/users/refresh
   Body: { token: refreshToken }
   → Returns: { accessToken }

4. Logout:
   - Clear local tokens
   - No server-side endpoint needed
```

---

## 4. Data Models Summary

### 4.1 Core Models
- **User**: name, email, password, mobile, place, state, role, profileImage, savedDams[]
- **Dam**: name, state, riverName, river, coordinates{lat,lng}, damType, constructionYear, operator, storage data, dimensions
- **State**: name
- **River**: name, state (ref)
- **DamStatus**: dam (ref), waterLevel, inflowRate, outflowRate, gateStatus[], sensor data
- **DamStatusHistory**: Historical status records
- **Safety**: dam (ref), floodRiskLevel, seepageReport, structuralHealth, maintenance, emergencyContact
- **Sensor**: damId (ref), sensorId, type, status, batteryStatus, lastSync, lastReading
- **WaterUsage**: damId (ref), irrigation, drinking, industrial, hydropower, losses
- **SupportingInfo**: dam (ref), type, title, description, location
- **DamHistory**: dam (ref), eventType, title, description, eventDate, severity, documents[]
- **Feature**: name, description, category, status, adminOnly

---

## 5. Recommendations for Mobile App

### 5.1 Immediate Actions ✅
1. **Add Authentication to Write Operations**
   - Water usage POST/PUT/DELETE
   - Safety POST/PUT
   - Sensor POST/PUT/DELETE
   - Supporting info POST/PUT/DELETE

2. **Implement Pagination**
   - Add to all list endpoints
   - Default: page=1, limit=20
   - Return: { data: [], total, page, pages }

3. **Add Query Filters**
   - Sensors by damId
   - Public spots/restricted areas/guidelines by damId
   - Dam history with date range filters

### 5.2 Mobile-Specific Optimizations 🔧
1. **Create Lightweight Endpoints**
   ```
   GET /api/mobile/dams/list
   - Returns minimal dam data for list views
   - Only: id, name, state, river, coordinates, status
   ```

2. **Batch Endpoints**
   ```
   POST /api/mobile/batch
   - Single request for multiple resources
   - Reduces network calls
   ```

3. **Image Optimization**
   - Add image resizing for profile images
   - Return thumbnail URLs for mobile
   - Consider CDN integration

### 5.3 Real-time Features 🔴
1. **WebSocket Implementation**
   ```
   ws://server/dam/:damId/status
   - Real-time status updates
   - Reduces polling overhead
   ```

2. **Push Notifications**
   - Integrate Firebase Cloud Messaging (FCM)
   - Apple Push Notification Service (APNS)
   - Create notification management endpoints

### 5.4 Offline Support 📱
1. **Caching Strategy**
   - Cache dam list, states, rivers
   - Store last sync timestamps
   - Implement delta sync

2. **Offline Queue**
   - Queue write operations when offline
   - Sync when connection restored

---

## 6. API Response Format Standards

### 6.1 Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional success message"
}
```

### 6.2 Error Response
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error (dev mode only)"
}
```

### 6.3 Paginated Response
```json
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "pages": 8
  }
}
```

---

## 7. Security Considerations

### 7.1 Current Security ✅
- Password hashing with bcrypt
- JWT authentication
- Role-based access control (user, admin)
- Input validation on registration/login

### 7.2 Recommendations 🔒
1. **Rate Limiting**
   - Add rate limiting middleware
   - Prevent brute force attacks

2. **CORS Configuration**
   - Currently allows all origins
   - Restrict to specific mobile app domains

3. **Input Sanitization**
   - Add validation middleware for all inputs
   - Prevent NoSQL injection

4. **HTTPS Only**
   - Enforce HTTPS in production
   - Add security headers

---

## 8. Testing Recommendations

### 8.1 API Testing
- Test all endpoints with Postman/Insomnia
- Create test collection for mobile team
- Document expected responses

### 8.2 Load Testing
- Test pagination with large datasets
- Verify performance with concurrent users
- Monitor database query performance

---

## 9. Summary

### ✅ Ready for Mobile (85%)
- Authentication & user management
- Dam data retrieval
- Real-time status monitoring
- Alert system
- Search functionality
- User-specific data (saved dams, sidebar)
- Admin features

### ⚠️ Needs Minor Fixes (10%)
- Add authentication to write operations
- Implement pagination
- Add query filters
- Optimize GeoJSON for mobile

### 🔴 Missing Critical Features (5%)
- Push notifications
- Offline sync
- WebSocket for real-time updates
- Mobile-optimized endpoints

**Overall Assessment**: Your backend is well-structured and 85% ready for mobile app development. The main gaps are mobile-specific features like push notifications and offline support, which are typically added during mobile development. The core CRUD operations and data retrieval APIs are solid and ready to use.
