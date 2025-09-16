// frontend/src/pages/About.jsx
import React from "react";
import "../styles/About.css";
import Sidebar from "../components/Sidebar";

export default function About() {
  return (
    <div className="about-page">
      
      <div className="about-content">
        <h1>About Us</h1>
        <p>
          The <strong>River Water Management and Life Safety System</strong> is
          designed to provide real-time monitoring of dams, water levels, usage,
          and alerts. Our goal is to ensure safe, efficient, and sustainable
          management of water resources for communities and industries.
        </p>

        <div className="about-sections">
          <div className="about-card">
            <h2>🌊 Our Mission</h2>
            <p>
              To provide accurate water monitoring, early warning alerts, and
              intelligent insights that help prevent disasters and ensure water
              availability.
            </p>
          </div>

          <div className="about-card">
            <h2>⚙️ Our Technology</h2>
            <p>
              Powered by real-time IoT data, AI-based predictions, and advanced
              visualization dashboards, our system ensures data-driven
              decision-making.
            </p>
          </div>

          <div className="about-card">
            <h2>🤝 Our Team</h2>
            <p>
              A multidisciplinary team of engineers, researchers, and developers
              working together to solve critical water management challenges.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
