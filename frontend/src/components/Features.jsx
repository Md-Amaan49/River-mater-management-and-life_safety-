// frontend/src/components/Features.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/Features.css";
import { useNavigate } from "react-router-dom";

const API_BASE = "https://river-water-management-and-life-safety.onrender.com/api";
const USER_API = `${API_BASE}/users`;

const Features = ({ damId, token }) => {
  const navigate = useNavigate();
  const [features, setFeatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savedIds, setSavedIds] = useState(new Set());

  const authHeader = token ? { Authorization: `Bearer ${token}` } : undefined;

  // Fetch saved dams to know which ones are saved
  const fetchSavedDams = async () => {
    if (!token) return;
    try {
      const res = await axios.get(`${USER_API}/saved-dams`, { headers: authHeader });
      const data = res.data || [];
      if (data.length && data[0].dam) {
        setSavedIds(new Set(data.map(r => String(r.dam._id))));
      } else {
        setSavedIds(new Set(data.map(d => String(d._id))));
      }
    } catch (err) {
      console.error("Error fetching saved dams:", err);
    }
  };

  // Fetch features from backend
  useEffect(() => {
    if (!damId) return;
    
    const fetchFeatures = async () => {
      try {
        const res = await axios.get(`${API_BASE}/features`, {
          headers: authHeader,
        });
        setFeatures(res.data || []);
      } catch (err) {
        console.error("Error fetching features:", err);
        setFeatures([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFeatures();
    fetchSavedDams();
  }, [damId, token]);

  // Toggle save dam
  const toggleSave = async (damIdToToggle) => {
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      await axios.patch(`${USER_API}/saved-dams/${damIdToToggle}`, {}, { headers: authHeader });

      // Optimistic update
      setSavedIds(prev => {
        const newSet = new Set(prev);
        if (newSet.has(damIdToToggle)) {
          newSet.delete(damIdToToggle);
        } else {
          newSet.add(damIdToToggle);
        }
        return newSet;
      });
    } catch (err) {
      console.error("Error toggling save:", err);
    }
  };

  const viewDam = (damIdToView) => {
    navigate(`/dam-dashboard/${damIdToView}`);
  };

  if (loading) return <p className="loading">Loading features...</p>;

  return (
    <div className="features-page">
      <div className="features-header">
        <h2 className="features-title">⚙️ Features</h2>
        {token && damId && (
          <div className="dam-actions">
            <button
              className={`save-btn ${savedIds.has(damId) ? "saved" : ""}`}
              onClick={() => toggleSave(damId)}
              title={savedIds.has(damId) ? "Unsave Dam" : "Save Dam"}
            >
              {savedIds.has(damId) ? "★ Saved" : "☆ Save Dam"}
            </button>
            <button className="view-btn" onClick={() => viewDam(damId)}>
              View Dam Details
            </button>
          </div>
        )}
      </div>

      <div className="features-grid">
        {features.length > 0 ? (
          features.map((f) => (
            <div key={f._id} className="feature-card">
              <h3>{f.name}</h3>
              <p>{f.description}</p>
              <div className="feature-meta">
                <p className="meta">
                  <strong>Category:</strong> {f.category}
                </p>
                <p className="meta">
                  <strong>Status:</strong> 
                  <span className={`status-badge ${f.status.toLowerCase()}`}>
                    {f.status}
                  </span>
                </p>
                {f.adminOnly && (
                  <p className="meta admin-only">
                    <strong>Admin Only</strong>
                  </p>
                )}
                <p className="meta">
                  <strong>Created:</strong>{" "}
                  {new Date(f.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="no-features">
            <p>No features available yet.</p>
            <p>Features will be displayed here as they are added to the system.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Features;
