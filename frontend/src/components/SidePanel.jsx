// components/SidePanel.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/SidePanel.css";

export default function SidePanel({ type, damId, onClose }) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);

  // map sidebar types to backend config
  const configMap = {
    Alerts: { endpoint: "safety", isSafety: true },
    Guidelines: { endpoint: "supporting-info", typeFilter: "guideline" },
    "Restricted Areas": { endpoint: "supporting-info", typeFilter: "prohibitedRegion" },
    "Public Spots": { endpoint: "supporting-info", typeFilter: "publicSpot" },
  };

  useEffect(() => {
    let mounted = true;
    const fetchData = async () => {
      if (!type) return;
      const cfg = configMap[type];
      if (!cfg) return;

      setLoading(true);
      setError(null);
      setData([]);

      try {
        if (damId) {
          // dam-specific
          const res = await axios.get(`/api/${cfg.endpoint}/dam/${damId}`);
          if (!mounted) return;

          if (cfg.isSafety) {
            // Safety = Alerts, single object
            setData(res.data ? [res.data] : []);
          } else {
            // SupportingInfo = array, filter by type
            setData(
              (res.data || []).filter(
                (item) => item.type === cfg.typeFilter
              )
            );
          }
        } else {
          // aggregate from saved dams
          const meRes = await axios.get("/api/users/me");
          if (!mounted) return;

          const saved = meRes.data?.savedDams || [];
          if (saved.length === 0) {
            setData([]);
            return;
          }

          const results = await Promise.all(
            saved.map((s) =>
              axios
                .get(`/api/${cfg.endpoint}/dam/${s._id}`)
                .then((r) => r.data)
                .catch(() => null)
            )
          );

          const merged = results.filter(Boolean).flat();
          if (cfg.isSafety) {
            setData(results.filter(Boolean)); // array of safety objects
          } else {
            setData(
              merged.filter((item) => item.type === cfg.typeFilter)
            );
          }
        }
      } catch (err) {
        if (!mounted) return;
        console.error("SidePanel fetch error:", err);
        setError(err.response?.data?.message || err.message || "Failed to load");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchData();
    return () => {
      mounted = false;
    };
  }, [type, damId]);

  const renderItem = (item, idx) => {
    if (configMap[type]?.isSafety) {
      // Alerts (Safety model)
      return (
        <div className="panel-item" key={idx}>
          <h4>Flood Risk: {item.floodRiskLevel}</h4>
          <p><strong>Seepage:</strong> {item.seepageReport || "N/A"}</p>
          <p>
            <strong>Structural Health:</strong>{" "}
            Cracks: {item.structuralHealth?.cracks || "N/A"}, 
            Vibration: {item.structuralHealth?.vibration || "N/A"}, 
            Tilt: {item.structuralHealth?.tilt || "N/A"}
          </p>
          <p><strong>Earthquake Zone:</strong> {item.earthquakeZone || "N/A"}</p>
          <p>
            <strong>Last Inspection:</strong>{" "}
            {item.maintenance?.lastInspection
              ? new Date(item.maintenance.lastInspection).toDateString()
              : "N/A"}
          </p>
          <p>
            <strong>Next Inspection:</strong>{" "}
            {item.maintenance?.nextInspection
              ? new Date(item.maintenance.nextInspection).toDateString()
              : "N/A"}
          </p>
          <p>
            <strong>Emergency Contact:</strong>{" "}
            {item.emergencyContact?.authorityName}{" "}
            ({item.emergencyContact?.phone || "N/A"})
          </p>
        </div>
      );
    } else {
      // Supporting Info (Guidelines, Public Spots, Restricted)
      return (
        <div className="panel-item" key={item._id}>
          <h4>{item.title}</h4>
          <p>{item.description}</p>
          {item.location && <p><strong>Location:</strong> {item.location}</p>}
          {item.dangerLevel && <p><strong>Danger Level:</strong> {item.dangerLevel}</p>}
        </div>
      );
    }
  };

  return (
    <div className="side-panel-overlay" role="dialog" onClick={onClose}>
      <div className="side-panel" onClick={(e) => e.stopPropagation()}>
        <div className="side-panel-header">
          <h3 className="side-panel-title">
            {type} {damId ? `— Dam ${damId}` : "— Saved dams"}
          </h3>
          <button className="close-btn" onClick={onClose} aria-label="Close panel">
            ✕
          </button>
        </div>

        <div className="side-panel-body">
          {loading && <div className="loading">Loading...</div>}
          {error && <div className="error">Error: {error}</div>}
          {!loading && !error && data.length === 0 && (
            <div className="empty">No data found.</div>
          )}
          {!loading && !error && data.length > 0 && (
            <div className="list">{data.map(renderItem)}</div>
          )}
        </div>
      </div>
    </div>
  );
}
