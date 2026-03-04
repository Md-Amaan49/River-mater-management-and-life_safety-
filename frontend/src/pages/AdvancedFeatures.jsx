import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "../styles/AdvancedFeatures.css";

const AdvancedFeatures = () => {
  const { damId } = useParams();
  const videoRef = useRef(null);
  const [iotData, setIotData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("camera");

  // Live Camera Stream URL (from your backend)
  const LIVE_STREAM_URL = "http://localhost:5001/live";
  const IOT_DATA_URL = "http://localhost:5001/iot-data";

  /* ================= LIVE CAMERA ================= */
  useEffect(() => {
    if (videoRef.current && activeTab === "camera") {
      videoRef.current.src = LIVE_STREAM_URL;
      videoRef.current.play().catch(err => {
        console.log("Autoplay prevented:", err);
        setError("Camera autoplay prevented. Please click play button.");
      });
    }
  }, [activeTab]);

  /* ================= IOT DATA ================= */
  const loadIoTData = async () => {
    try {
      setLoading(true);
      const res = await axios.get(IOT_DATA_URL);
      setIotData(res.data);
      setError(null);
    } catch (error) {
      console.error("Error fetching IoT data:", error);
      setError("Failed to fetch IoT sensor data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "sensors") {
      loadIoTData();
      // Refresh data every 5 seconds
      const interval = setInterval(loadIoTData, 5000);
      return () => clearInterval(interval);
    }
  }, [activeTab]);

  /* ================= UI ================= */
  return (
    <div className="advanced-features-container">
      <div className="advanced-features-header">
        <h1>🌊 Advanced Dam Monitoring</h1>
        <p className="dam-id-label">Dam ID: {damId}</p>
      </div>

      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button
          className={`tab-button ${activeTab === "camera" ? "active" : ""}`}
          onClick={() => setActiveTab("camera")}
        >
          📷 Live Camera
        </button>
        <button
          className={`tab-button ${activeTab === "sensors" ? "active" : ""}`}
          onClick={() => setActiveTab("sensors")}
        >
          📡 IoT Sensors
        </button>
        <button
          className={`tab-button ${activeTab === "both" ? "active" : ""}`}
          onClick={() => setActiveTab("both")}
        >
          🔄 Both Views
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="error-message">
          <span>⚠️</span> {error}
        </div>
      )}

      {/* Content Area */}
      <div className="content-area">
        {/* Camera View */}
        {(activeTab === "camera" || activeTab === "both") && (
          <div className="camera-section">
            <div className="section-header">
              <h2>📷 Live Camera Feed</h2>
              <span className="live-indicator">🔴 LIVE</span>
            </div>
            <div className="video-container">
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                controls
                className="live-video"
              />
            </div>
            <div className="camera-info">
              <p>Real-time video stream from dam surveillance camera</p>
              <p className="stream-quality">Quality: HD | Latency: Low</p>
            </div>
          </div>
        )}

        {/* Sensors View */}
        {(activeTab === "sensors" || activeTab === "both") && (
          <div className="sensors-section">
            <div className="section-header">
              <h2>📡 IoT Sensor Data</h2>
              <button onClick={loadIoTData} className="refresh-button">
                🔄 Refresh
              </button>
            </div>

            {loading && activeTab === "sensors" ? (
              <div className="loading-spinner">Loading sensor data...</div>
            ) : iotData.length > 0 ? (
              <div className="table-container">
                <table className="iot-data-table">
                  <thead>
                    <tr>
                      {iotData[0]?.map((header, i) => (
                        <th key={i}>{header}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {iotData.slice(1).map((row, i) => (
                      <tr key={i}>
                        {row.map((col, j) => (
                          <td key={j}>{col}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="no-data">
                <p>No sensor data available</p>
              </div>
            )}

            <div className="sensor-info">
              <p>Data updates every 5 seconds</p>
              <p className="last-update">
                Last updated: {new Date().toLocaleTimeString()}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="instructions-panel">
        <h3>ℹ️ Instructions</h3>
        <ul>
          <li>
            <strong>Live Camera:</strong> View real-time video feed from the dam
            surveillance system
          </li>
          <li>
            <strong>IoT Sensors:</strong> Monitor water level, flow rate,
            temperature, and other sensor readings
          </li>
          <li>
            <strong>Both Views:</strong> See camera and sensor data
            side-by-side for comprehensive monitoring
          </li>
        </ul>
      </div>
    </div>
  );
};

export default AdvancedFeatures;
