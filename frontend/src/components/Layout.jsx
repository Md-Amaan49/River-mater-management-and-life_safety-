// components/Layout.jsx
import React, { useState } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import SidePanel from "./SidePanel";
import "../styles/Layout.css";
import { useLocation } from "react-router-dom";

export default function Layout({ children }) {
  const location = useLocation();
  const [panel, setPanel] = useState({ isOpen: false, type: null });

  // Extract damId only for /dam-dashboard/:damId (safe fallback)
  const match = location.pathname.match(/^\/dam-dashboard\/([^/]+)/);
  const damId = match ? match[1] : null;

  const openPanel = (type) => setPanel({ isOpen: true, type });
  const closePanel = () => setPanel({ isOpen: false, type: null });

  // hide sidebar on home
  const hideSidebar = location.pathname === "/" || location.pathname === "/home";

  return (
    <div className="layout">
      <Header />

      <div className="main">
        {!hideSidebar && <Sidebar onOpenPanel={openPanel} />}

        <div className="content">{children}</div>
      </div>

      {panel.isOpen && (
        <SidePanel type={panel.type} damId={damId} onClose={closePanel} />
      )}
    </div>
  );
}
