import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { google } from "googleapis";
import dotenv from "dotenv";
import { spawn } from "child_process";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 5001;

/* ===============================
   FIX __dirname (ES MODULE)
================================ */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* =====================================================
   🎥 LIVE CAMERA STREAM (LOW LATENCY)
===================================================== */

// 🔴 REPLACE WITH YOUR REAL RTSP DETAILS
const RTSP_URL =
  "rtsp://Apadamitra:Mgm@1234@172.28.135.37:554/stream2";

app.get("/live", (req, res) => {
  console.log("📹 Client connected to live stream");

  res.writeHead(200, {
    "Content-Type": "video/mp4",
    Connection: "keep-alive",
    "Cache-Control": "no-cache",
  });

  const ffmpeg = spawn("ffmpeg", [
  "-rtsp_transport", "tcp",
  "-fflags", "nobuffer",
  "-flags", "low_delay",
  "-probesize", "32",
  "-analyzeduration", "0",
  "-i", RTSP_URL,

  "-an",
  "-c:v", "libx264",
  "-preset", "ultrafast",
  "-tune", "zerolatency",

  "-g", "10",
  "-keyint_min", "10",

  "-f", "mp4",
  "-movflags", "frag_keyframe+empty_moov+faststart",
  "pipe:1",
]);

  ffmpeg.stdout.pipe(res);

  ffmpeg.stderr.on("data", (data) => {
    // Uncomment if debugging needed
    // console.log(data.toString());
  });

  req.on("close", () => {
    console.log("📴 Client disconnected");
    ffmpeg.kill("SIGINT");
  });
});

/* =====================================================
   📊 GOOGLE SHEETS CONFIG
===================================================== */

const SPREADSHEET_ID =
  "1mVVJvxLbp6jdI9Yyu-kJJuH4hol4qV7XZudn82QgoGI";

const SHEET_NAME = "Sheet1";

const auth = new google.auth.GoogleAuth({
  keyFile: "./service-account.json",
  scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
});

/* =====================================================
   📊 IOT DATA API
===================================================== */

app.get("/iot-data", async (req, res) => {
  try {
    console.log("📊 Fetching IoT Data...");

    const client = await auth.getClient();

    const sheets = google.sheets({
      version: "v4",
      auth: client,
    });

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A1:G1000`,
    });

    const rows = response.data.values;

    if (!rows || rows.length === 0) {
      return res.json([]);
    }

    res.json(rows);

  } catch (error) {
    console.error("❌ GOOGLE SHEET ERROR:", error.message);

    res.status(500).json({
      error: "Failed to fetch IoT data",
      details: error.message,
    });
  }
});

/* =====================================================
   TEST ROUTE
===================================================== */

app.get("/", (req, res) => {
  res.send("🚀 SMART DAM BACKEND RUNNING");
});

/* =====================================================
   START SERVER
===================================================== */

app.listen(PORT, () => {
  console.log("=================================");
  console.log("✅ SMART DAM BACKEND RUNNING");
  console.log(`🌐 http://localhost:${PORT}`);
  console.log("📹 Live Stream → /live");
  console.log("📊 IoT Data → /iot-data");
  console.log("=================================");
});