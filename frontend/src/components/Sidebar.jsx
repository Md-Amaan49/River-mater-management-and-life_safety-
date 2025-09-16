// components/Sidebar.jsx
import React, { useState } from "react";
import "../styles/Sidebar.css";

export default function Sidebar({ onOpenPanel }) {
  const [collapsed, setCollapsed] = useState(false);

  const links = [
    { name: "Alerts", icon: "🔔" },
    { name: "Saved Dams", icon: "💾" },
    { name: "Guidelines", icon: "📄" },
    { name: "Restricted Areas", icon: "⛔" },
    { name: "Public Spots", icon: "📍" },
    { name: "History", icon: "📜" },
    { name: "Help", icon: "❓" },
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
            <span className="icon">{link.icon}</span>
            {!collapsed && <span className="text">{link.name}</span>}
          </button>
        ))}
      </nav>
    </div>
  );
}
