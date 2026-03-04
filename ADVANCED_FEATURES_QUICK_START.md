# Advanced Features - Quick Start Guide

## What Was Integrated?

Your temporary React app with live camera and IoT sensors has been integrated into the main Dam Management System under "Optional Advanced Features".

## How to Use

### 1. Start the Monitoring Backend
```bash
cd React/backend
npm install
node server.js
```

The backend will run on `http://localhost:5001`

### 2. Access the Feature
1. Login to your Dam Management System
2. Go to Admin Panel → Add Data Form
3. Select State, River, and Dam
4. Click the "Optional Advanced Features" card (🔧 icon)
5. You'll see the Advanced Monitoring page with:
   - 📷 Live Camera tab
   - 📡 IoT Sensors tab
   - 🔄 Both Views tab

## What You'll See

### Live Camera Tab
- Real-time video stream from your RTSP camera
- Video controls (play, pause, volume, fullscreen)
- Live indicator showing stream status
- Stream quality information

### IoT Sensors Tab
- Real-time sensor data from Google Sheets
- Auto-refreshing table (every 5 seconds)
- Manual refresh button
- Last update timestamp
- All sensor readings in tabular format

### Both Views Tab
- Camera and sensors side-by-side
- Perfect for comprehensive monitoring
- Responsive layout

## Configuration

### Update Camera URL
Edit `React/backend/server.js`:
```javascript
const RTSP_URL = "rtsp://your-username:your-password@camera-ip:port/stream";
```

### Update Google Sheets
Edit `React/backend/server.js`:
```javascript
const SPREADSHEET_ID = "your-spreadsheet-id";
const SHEET_NAME = "Sheet1";
```

## Troubleshooting

### Camera Not Loading
- Check if backend is running on port 5001
- Verify RTSP URL is correct
- Ensure FFmpeg is installed
- Check camera is accessible from server

### Sensor Data Not Showing
- Verify Google Sheets API credentials
- Check spreadsheet ID is correct
- Ensure service account has access to sheet
- Check backend console for errors

### CORS Errors
- Backend should be running on localhost:5001
- Frontend should be on localhost:3000 (or 5173 for Vite)
- Check CORS is enabled in backend

## Next Steps

1. Test the camera stream
2. Verify sensor data loads
3. Try all three view modes
4. Check responsive design on mobile
5. Configure for your production environment

## Production Deployment

When deploying to production:
1. Update API URLs in `AdvancedFeatures.jsx`
2. Configure production RTSP camera
3. Set up environment variables
4. Update CORS settings
5. Ensure FFmpeg is installed on production server

## Support

If you encounter issues:
1. Check backend console logs
2. Check browser console for errors
3. Verify all dependencies are installed
4. Ensure ports 5001 is not blocked
5. Test camera and sheets access separately

Enjoy your new Advanced Monitoring features! 🎉
