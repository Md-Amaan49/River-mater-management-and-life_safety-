// components/Sidebar.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/Sidebar.css";
import API_BASE_URL from "../config";

const API_BASE = `${API_BASE_URL}/api`;

export default function Sidebar({ onOpenPanel }) {
  const [collapsed, setCollapsed] = useState(false);
  const [hasHighRiskAlerts, setHasHighRiskAlerts] = useState(false);
  const token = localStorage.getItem("token");

  // Check for high-risk alerts
  useEffect(() => {
    if (!token) {
      setHasHighRiskAlerts(false);
      return;
    }

    const checkAlerts = async () => {
      try {
        const authHeader = { Authorization: `Bearer ${token}` };
        const res = await axios.get(`${API_BASE}/sidebar/alerts`, { headers: authHeader });
        setHasHighRiskAlerts(res.data.hasHighRisk || false);
      } catch (err) {
        console.error("Error checking alerts:", err);
        setHasHighRiskAlerts(false);
      }
    };

    // Check immediately
    checkAlerts();

    // Poll every 2 minutes for updates
    const interval = setInterval(checkAlerts, 120000);

    return () => clearInterval(interval);
  }, [token]);

  const links = [
    { name: "Alerts", icon: "🔔", showNotification: true },
    { name: "Saved Dams", icon: "💾", showNotification: false },
    { name: "Guidelines", icon: "📄", showNotification: false },
    { name: "Restricted Areas", icon: "⛔", showNotification: false },
    { name: "Public Spots", icon: "📍", showNotification: false },
    { name: "History", icon: "📜", showNotification: false },
    { name: "Help", icon: "❓", showNotification: false },
  ];

  return (
    <div className={`sidebar ${collapsed ? "collapsed" : ""}`}>
      <button
        className="toggle-btn"
        onClick={() => setCollapsed((s) => !s)}
        aria-label="Toggle sidebar"
      >
        ☰
      </button>

      <nav>
        {links.map((link, index) => (
          <button
            key={index}
            type="button"
            className="sidebar-link"
            onClick={() => onOpenPanel && onOpenPanel(link.name)}
          >
            <span className="icon-wrapper">
              <span className="icon">{link.icon}</span>
              {link.showNotification && hasHighRiskAlerts && (
                <span className="notification-badge blink"></span>
              )}
            </span>
            {!collapsed && <span className="text">{link.name}</span>}
          </button>
        ))}
      </nav>
    </div>
  );
}
