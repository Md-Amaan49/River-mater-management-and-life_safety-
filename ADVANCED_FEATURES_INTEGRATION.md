# Advanced Features Integration - Live Camera & IoT Sensors

## Overview
Successfully integrated live camera streaming and IoT sensor data monitoring into the "Optional Advanced Features" page of the Dam Management System.

## Features Implemented

### 1. Live Camera Feed
- Real-time video streaming from dam surveillance cameras
- Uses RTSP to HTTP streaming via FFmpeg
- Low-latency video feed with controls
- Live indicator showing stream status
- Autoplay with fallback controls

### 2. IoT Sensor Data
- Real-time sensor data from Google Sheets
- Auto-refresh every 5 seconds
- Displays water level, flow rate, temperature, and other metrics
- Tabular format with clean styling
- Manual refresh button

### 3. View Modes
- **Camera Only**: Full-screen camera view
- **Sensors Only**: Full-screen sensor data table
- **Both Views**: Side-by-side camera and sensor monitoring

## Files Created

### Frontend
1. **`frontend/src/pages/AdvancedFeatures.jsx`**
   - Main component for advanced monitoring
   - Handles camera streaming and sensor data
   - Tab-based navigation between views
   - Responsive design

2. **`frontend/src/styles/AdvancedFeatures.css`**
   - Modern dark theme styling
   - Responsive grid layout
   - Animated live indicators
   - Professional table styling

## Files Modified

### Frontend
1. **`frontend/src/App.jsx`**
   - Added import for AdvancedFeatures component
   - Updated route `/features/:damId` to use AdvancedFeatures

## Backend Requirements

The feature relies on your existing React backend server (`React/backend/server.js`) which provides:

### Endpoints
1. **`GET /live`** - Live camera stream
   - RTSP to HTTP conversion using FFmpeg
   - Low-latency MP4 streaming
   - Handles client connections/disconnections

2. **`GET /iot-data`** - IoT sensor data
   - Fetches data from Google Sheets
   - Returns array of sensor readings
   - Updates in real-time

### Configuration Needed
The backend requires:
- RTSP camera URL (currently: `rtsp://Apadamitra:Mgm@1234@172.28.135.37:554/stream2`)
- Google Sheets API credentials (`service-account.json`)
- Spreadsheet ID for sensor data

## How It Works

### Camera Streaming Flow
```
RTSP Camera → FFmpeg (Backend) → HTTP Stream → React Video Element
```

1. Backend receives RTSP stream from camera
2. FFmpeg converts to HTTP-compatible MP4 format
3. Frontend video element displays the stream
4. Low latency with fragmented MP4

### Sensor Data Flow
```
Google Sheets → Backend API → Frontend Table → Auto-refresh
```

1. Backend fetches data from Google Sheets API
2. Returns data as JSON array
3. Frontend displays in table format
4. Auto-refreshes every 5 seconds

## Usage

### For Users
1. Navigate to Add Data Form
2. Select a dam
3. Click "Optional Advanced Features" card
4. Choose view mode:
   - 📷 Live Camera - Watch real-time video
   - 📡 IoT Sensors - Monitor sensor readings
   - 🔄 Both Views - See everything at once

### For Developers
To start the monitoring backend:
```bash
cd React/backend
npm install
node server.js
```

Backend runs on: `http://localhost:5001`

## Environment Setup

### Backend Dependencies
```json
{
  "express": "^4.18.2",
  "cors": "^2.8.5",
  "googleapis": "^118.0.0",
  "dotenv": "^16.0.3"
}
```

### System Requirements
- FFmpeg installed on server
- RTSP camera access
- Google Sheets API credentials
- Node.js 16+

## Configuration

### Camera Settings
Update in `React/backend/server.js`:
```javascript
const RTSP_URL = "rtsp://username:password@ip:port/stream";
```

### Sensor Data Settings
Update in `React/backend/server.js`:
```javascript
const SPREADSHEET_ID = "your-spreadsheet-id";
const SHEET_NAME = "Sheet1";
```

### Frontend API URLs
Update in `frontend/src/pages/AdvancedFeatures.jsx`:
```javascript
const LIVE_STREAM_URL = "http://localhost:5001/live";
const IOT_DATA_URL = "http://localhost:5001/iot-data";
```

## Features

### Camera View
- ✅ Real-time video streaming
- ✅ Video controls (play, pause, volume)
- ✅ Live indicator
- ✅ Stream quality info
- ✅ Responsive video player

### Sensor View
- ✅ Real-time data table
- ✅ Auto-refresh (5 seconds)
- ✅ Manual refresh button
- ✅ Last update timestamp
- ✅ Responsive table design

### UI/UX
- ✅ Tab-based navigation
- ✅ Dark theme design
- ✅ Loading states
- ✅ Error handling
- ✅ Mobile responsive
- ✅ Instructions panel

## Responsive Design

### Desktop (1200px+)
- Side-by-side camera and sensors in "Both Views"
- Full-width single views
- Large video player

### Tablet (768px - 1200px)
- Stacked layout for "Both Views"
- Optimized table sizing
- Medium video player

### Mobile (<768px)
- Vertical stacking
- Compact table
- Smaller video player
- Full-width buttons

## Security Considerations

1. **Camera Access**
   - RTSP credentials in backend only
   - No direct camera access from frontend
   - Stream proxied through backend

2. **Sensor Data**
   - Google Sheets API credentials server-side
   - Read-only access to spreadsheet
   - No sensitive data exposed

3. **CORS**
   - Backend configured for localhost
   - Update for production deployment

## Production Deployment

### Backend
1. Update RTSP URL for production camera
2. Configure Google Sheets credentials
3. Set up FFmpeg on production server
4. Update CORS settings
5. Use environment variables for sensitive data

### Frontend
1. Update API URLs to production backend
2. Test camera autoplay policies
3. Optimize video quality settings
4. Configure CDN if needed

## Testing Checklist

- [ ] Camera stream loads correctly
- [ ] Video controls work
- [ ] Sensor data displays
- [ ] Auto-refresh works
- [ ] Tab switching works
- [ ] Responsive on mobile
- [ ] Error handling works
- [ ] Loading states display
- [ ] Both views layout correct

## Known Limitations

1. **Camera Stream**
   - Requires FFmpeg on server
   - RTSP camera must be accessible
   - May have slight latency (1-3 seconds)

2. **Sensor Data**
   - Depends on Google Sheets API
   - 5-second refresh interval
   - Limited by API quotas

3. **Browser Support**
   - Modern browsers only
   - Autoplay may be blocked
   - Requires user interaction for audio

## Future Enhancements

1. **Camera Features**
   - Multiple camera support
   - PTZ controls
   - Snapshot capture
   - Recording functionality
   - Motion detection alerts

2. **Sensor Features**
   - Real-time charts/graphs
   - Historical data view
   - Alert thresholds
   - Data export
   - Custom sensor configuration

3. **UI Improvements**
   - Fullscreen mode
   - Picture-in-picture
   - Dark/light theme toggle
   - Customizable layouts
   - Keyboard shortcuts

## Status
✅ **COMPLETED** - Advanced Features page successfully integrated with live camera and IoT sensor monitoring
