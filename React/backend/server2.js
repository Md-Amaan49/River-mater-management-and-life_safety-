// import express from 'express';
// import cors from 'cors';
// import { google } from 'googleapis';
// import fs from 'fs';
// import path from 'path';
// import { fileURLToPath } from 'url';
// import dotenv from 'dotenv';

// dotenv.config();

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// const app = express();
// app.use(cors());
// app.use(express.json());

// const CREDENTIALS_PATH = path.join(__dirname, '../tapo-videos-project-3074b6e6637b.json');
// const FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID;

// // Service Account Authentication
// const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH));
// const auth = new google.auth.GoogleAuth({
//   credentials,
//   scopes: ['https://www.googleapis.com/auth/drive.readonly']
// });

// // Get videos from Google Drive folder
// app.get('/videos', async (req, res) => {
//   try {
//     const { limit, hours } = req.query;
//     const drive = google.drive({ version: 'v3', auth });
    
//     // Build query
//     let query = `'${FOLDER_ID}' in parents and mimeType contains 'video/'`;
    
//     // Add time filter if hours parameter is provided
//     if (hours) {
//       const hoursAgo = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
//       query += ` and createdTime > '${hoursAgo}'`;
//     }
    
//     const response = await drive.files.list({
//       q: query,
//       fields: 'files(id, name, mimeType, webViewLink, thumbnailLink, createdTime, modifiedTime)',
//       orderBy: 'createdTime desc',
//       pageSize: limit ? parseInt(limit) : 1000
//     });

//     const videos = response.data.files.map(file => ({
//       id: file.id,
//       name: file.name,
//       mimeType: file.mimeType,
//       embedUrl: `https://drive.google.com/file/d/${file.id}/preview`,
//       webViewLink: file.webViewLink,
//       downloadUrl: `http://localhost:${PORT}/download/${file.id}`,
//       thumbnailLink: file.thumbnailLink,
//       createdTime: file.createdTime,
//       modifiedTime: file.modifiedTime
//     }));

//     res.json({ videos, count: videos.length });
//   } catch (error) {
//     console.error('Error fetching videos:', error);
//     res.status(500).json({ error: error.message });
//   }
// });

// // Download video endpoint
// app.get('/download/:fileId', async (req, res) => {
//   try {
//     const { fileId } = req.params;
//     const drive = google.drive({ version: 'v3', auth });
    
//     // Get file metadata
//     const fileMetadata = await drive.files.get({
//       fileId: fileId,
//       fields: 'name, mimeType'
//     });
    
//     // Set response headers
//     res.setHeader('Content-Disposition', `attachment; filename="${fileMetadata.data.name}"`);
//     res.setHeader('Content-Type', fileMetadata.data.mimeType);
    
//     // Stream the file
//     const fileStream = await drive.files.get(
//       { fileId: fileId, alt: 'media' },
//       { responseType: 'stream' }
//     );
    
//     fileStream.data
//       .on('error', err => {
//         console.error('Error downloading file:', err);
//         res.status(500).json({ error: 'Download failed' });
//       })
//       .pipe(res);
      
//   } catch (error) {
//     console.error('Error in download endpoint:', error);
//     res.status(500).json({ error: error.message });
//   }
// });

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//   console.log(`Server running on http://localhost:${PORT}`);
// });



// only Camera
// import express from "express";
// import cors from "cors";
// import { spawn } from "child_process";
// import fs from "fs";
// import path from "path";

// const app = express();
// app.use(cors());

// const RTSP_URL =
//   "rtsp://Apadamitra:Mgm@1234@172.28.135.37:554/stream2";

// const HLS_DIR = "./hls";

// /* create folder */
// if (!fs.existsSync(HLS_DIR)) {
//   fs.mkdirSync(HLS_DIR);
// }

// /* START FFMPEG */
// const ffmpeg = spawn("ffmpeg", [
//   "-rtsp_transport", "tcp",
//   "-i", RTSP_URL,
//   "-c:v", "libx264",
//   "-preset", "veryfast",
//   "-f", "hls",
//   "-hls_time", "2",
//   "-hls_list_size", "3",
//   "-hls_flags", "delete_segments",
//   `${HLS_DIR}/stream.m3u8`
// ]);

// ffmpeg.stderr.on("data", data => {
//   // console.log(`FFmpeg: ${data}`);
// });

// /* serve stream */
// app.use("/hls", express.static(path.resolve(HLS_DIR)));

// app.listen(5001, () => {
//   console.log("✅ Live stream ready:");
//   console.log("http://localhost:5001/hls/stream.m3u8");
// });


// /* =====================================================
//    APADAMITRA BACKEND
//    Camera Stream + Google Sheet IoT Data
// ===================================================== */

// import express from "express";
// import cors from "cors";
// import { spawn } from "child_process";
// import { google } from "googleapis";

// const app = express();
// app.use(cors());
// app.use(express.json());

// /* =====================================================
//    1️⃣ TAPO CAMERA LIVE STREAM
// ===================================================== */

// // ✅ Replace if IP changes
// const RTSP_URL =
//   "rtsp://Apadamitra:Mgm@1234@172.28.135.37:554/stream2";

// app.get("/live", (req, res) => {
//   console.log("📹 Client connected to camera stream");

//   res.writeHead(200, {
//     "Content-Type": "video/mp4",
//     Connection: "keep-alive",
//     "Cache-Control": "no-cache",
//   });

//   const ffmpeg = spawn("ffmpeg", [
//     "-rtsp_transport", "tcp",
//     "-i", RTSP_URL,

//     // 🔥 LOW LATENCY SETTINGS
//     "-an",
//     "-c:v", "libx264",
//     "-preset", "ultrafast",
//     "-tune", "zerolatency",

//     "-f", "mp4",
//     "-movflags", "frag_keyframe+empty_moov",
//     "pipe:1",
//   ]);

//   ffmpeg.stdout.pipe(res);

//   ffmpeg.stderr.on("data", (data) => {
//     console.log("FFmpeg:", data.toString());
//   });

//   ffmpeg.on("error", (err) => {
//     console.error("❌ FFmpeg ERROR:", err);
//   });

//   req.on("close", () => {
//     console.log("📴 Camera client disconnected");
//     ffmpeg.kill("SIGINT");
//   });
// });

// /* =====================================================
//    2️⃣ GOOGLE SHEET IOT DATA API
// ===================================================== */

// // ✅ YOUR SHEET DETAILS
// const SPREADSHEET_ID =
//   "1q8SYW_V1cQbAO-sP9gmzFNrMm9ih-kjZAe9X_n-Y-KI";

// const SHEET_NAME = "IOT-DATA";

// // ✅ Service Account Authentication
// const auth = new google.auth.GoogleAuth({
//   keyFile: "./service-account.json",
//   scopes: [
//     "https://www.googleapis.com/auth/spreadsheets.readonly",
//   ],
// });

// app.get("/iot-data", async (req, res) => {
//   try {
//     console.log("📊 Fetching IoT Data...");

//     const client = await auth.getClient();

//     const sheets = google.sheets({
//       version: "v4",
//       auth: client,
//     });

//     // ✅ IMPORTANT RANGE FIX
//     const response = await sheets.spreadsheets.values.get({
//       spreadsheetId: SPREADSHEET_ID,
//       range: `${SHEET_NAME}!A1:Z1000`,
//     });

//     const rows = response.data.values;

//     if (!rows || rows.length === 0) {
//       return res.json([]);
//     }

//     const headers = rows[0];

//     const data = rows.slice(1).map((row) => {
//       const obj = {};
//       headers.forEach((header, i) => {
//         obj[header] = row[i] || "";
//       });
//       return obj;
//     });

//     console.log("✅ IoT data sent:", data.length, "rows");

//     res.json(data);

//   } catch (error) {
//     console.error("❌ GOOGLE SHEET ERROR:");
//     console.error(error.message);

//     res.status(500).json({
//       error: "Failed to fetch IoT data",
//       details: error.message,
//     });
//   }
// });

// /* =====================================================
//    SERVER START
// ===================================================== */

// const PORT = 5001;

// app.listen(PORT, () => {
//   console.log("=================================");
//   console.log("✅ APADAMITRA BACKEND RUNNING");
//   console.log(`🌐 http://localhost:${PORT}`);
//   console.log("📹 Camera → /live");
//   console.log("📊 IoT Data → /iot-data");
//   console.log("=================================");
// });


import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

// Fix __dirname in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 5001;

app.use(cors());
app.use(express.json());

/* ===============================
   TEST ROUTE
================================ */
app.get("/", (req, res) => {
  res.send("Backend Running ✅");
});

/* ===============================
   IOT DATA API
================================ */
app.get("/iot-data", (req, res) => {
  const data = {
    damLevel: Math.floor(Math.random() * 100),
    rainfall: Math.floor(Math.random() * 50),
    inflow: Math.floor(Math.random() * 200),
    outflow: Math.floor(Math.random() * 150),
    status: "Normal",
    time: new Date()
  };

  res.json(data);
});

/* ===============================
   HLS STREAM
================================ */
const hlsPath = path.join(__dirname, "hls");

app.use("/hls", express.static(hlsPath));

/* ===============================
   START SERVER
================================ */
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});