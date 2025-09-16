// frontend/src/pages/Features.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/Features.css";

const Features = ({ damId, token }) => {
  const [features, setFeatures] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch features from backend
  useEffect(() => {
    if (!damId) return;
    axios
      .get(`http://localhost:5000/api/features/dam/${damId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setFeatures(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching features:", err);
        setLoading(false);
      });
  }, [damId, token]);

  if (loading) return <p className="loading">Loading features...</p>;

  return (
    <div className="features-page">
      <h2 className="features-title">⚙️ Features</h2>

      <div className="features-grid">
        {features.length > 0 ? (
          features.map((f) => (
            <div key={f._id} className="feature-card">
              <h3>{f.title}</h3>
              <p>{f.description}</p>
              <p className="meta">
                <strong>Access:</strong> {f.roleBasedAccess}
              </p>
              <p className="meta">
                <strong>Category:</strong> {f.category}
              </p>
              <p className="meta">
                <strong>Created:</strong>{" "}
                {new Date(f.createdAt).toLocaleDateString()}
              </p>
            </div>
          ))
        ) : (
          <p>No features available for this dam yet.</p>
        )}
      </div>
    </div>
  );
};

export default Features;
