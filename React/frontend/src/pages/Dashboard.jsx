import React, { useEffect, useRef, useState } from "react";
import axios from "axios";

const Dashboard = () => {

  const videoRef = useRef(null);
  const [iotData, setIotData] = useState([]);

  /* ================= LIVE CAMERA ================= */

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.src = "http://localhost:5001/live";
      videoRef.current.play().catch(err => {
        console.log("Autoplay prevented:", err);
      });
    }
  }, []);

  /* ================= IOT DATA ================= */

  const loadData = async () => {
    try {
      const res = await axios.get("http://localhost:5001/iot-data");
      setIotData(res.data);
    } catch (error) {
      console.error("Error fetching IoT data:", error);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  /* ================= UI ================= */

  return (
    <div
      style={{
        background: "#0f172a",
        color: "white",
        minHeight: "100vh",
        padding: "20px"
      }}
    >
      <h1>🌊 Smart Dam Monitoring Dashboard</h1>

      <div style={{ display: "flex", gap: "30px" }}>

        {/* CAMERA */}
        <div>
          <h2>📷 Live Camera</h2>
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            controls={false}
            width="600"
            style={{ background: "black", borderRadius: "8px" }}
          />
        </div>

        {/* IOT TABLE */}
        <div>
          <h2>📡 IoT Data</h2>

          <table border="1" cellPadding="8">
            <thead>
              <tr>
                {iotData.length > 0 &&
                  iotData[0].map((header, i) => (
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

      </div>
    </div>
  );
};

export default Dashboard;