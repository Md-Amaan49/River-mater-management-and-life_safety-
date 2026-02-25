import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "../styles/CoreDamInfo.css";

const API_URL = "http://localhost:5000";

const PredictiveSimulation = () => {
  const { damId } = useParams();
  const [formData, setFormData] = useState({
    upstreamDamDistance: "",
    upstreamRiverVelocity: "",
    downstreamDamDistance: "",
    downstreamRiverVelocity: "",
    currentStorage: "",
    netFlow: "",
    surfaceArea: "",
    availableCapacity: "",
    storageUtilization: "",
    rainfallForecast: "",
    downstreamRisk: "",
    simulationTimeHours: "",
    cascadingRiskIndex: "",
    upstreamStress: "",
    downstreamStress: "",
    arrivalTimeFromUpstream: "",
    downstreamArrivalTime: "",
    predictedStorage: "",
    predictedWaterLevel: "",
    timeToOverflow: "",
    floodRiskScore: "",
    overflowProbability: "",
    riskTrendIndex: "",
    predictionConfidenceLevel: "",
  });
  const [isExisting, setIsExisting] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/dam/predictive-simulation/${damId}`);
        if (res.data) {
          setFormData(res.data);
          setIsExisting(true);
        }
      } catch (error) {
        console.error("Error fetching predictive simulation:", error);
        setIsExisting(false);
      }
    };
    fetchData();
  }, [damId]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isExisting) {
        await axios.put(`${API_URL}/api/dam/predictive-simulation/${damId}`, formData);
        setMessage("Simulation data updated successfully.");
      } else {
        await axios.post(`${API_URL}/api/dam/predictive-simulation/${damId}`, formData);
        setIsExisting(true);
        setMessage("Simulation data saved successfully.");
      }
    } catch (error) {
      setMessage("Failed to save/update simulation data.");
    }
  };

  const fields = [
    { label: "Upstream Dam Distance (km)", name: "upstreamDamDistance", section: "Network Parameters" },
    { label: "Upstream River Velocity (m/s)", name: "upstreamRiverVelocity", section: "Network Parameters" },
    { label: "Downstream Dam Distance (km)", name: "downstreamDamDistance", section: "Network Parameters" },
    { label: "Downstream River Velocity (m/s)", name: "downstreamRiverVelocity", section: "Network Parameters" },
    
    { label: "Current Storage (m³)", name: "currentStorage", section: "Current State" },
    { label: "Net Flow (m³/s)", name: "netFlow", section: "Current State" },
    { label: "Surface Area (m²)", name: "surfaceArea", section: "Current State" },
    { label: "Available Capacity (m³)", name: "availableCapacity", section: "Current State" },
    { label: "Storage Utilization (%)", name: "storageUtilization", section: "Current State" },
    { label: "Rainfall Forecast (mm)", name: "rainfallForecast", section: "Current State" },
    { label: "Downstream Risk (0-100)", name: "downstreamRisk", section: "Current State" },
    { label: "Simulation Time Hours", name: "simulationTimeHours", section: "Current State" },
    { label: "Cascading Risk Index (0-100)", name: "cascadingRiskIndex", section: "Current State" },
    { label: "Upstream Stress (0-100)", name: "upstreamStress", section: "Current State" },
    { label: "Downstream Stress (0-100)", name: "downstreamStress", section: "Current State" },
    
    { label: "Arrival Time From Upstream (hours) - Calculated", name: "arrivalTimeFromUpstream", disabled: true, section: "Calculated Predictions" },
    { label: "Downstream Arrival Time (hours) - Calculated", name: "downstreamArrivalTime", disabled: true, section: "Calculated Predictions" },
    { label: "Predicted Storage (m³) - Calculated", name: "predictedStorage", disabled: true, section: "Calculated Predictions" },
    { label: "Predicted Water Level (m) - Calculated", name: "predictedWaterLevel", disabled: true, section: "Calculated Predictions" },
    { label: "Time to Overflow (hours) - Calculated", name: "timeToOverflow", disabled: true, section: "Calculated Predictions" },
    { label: "Flood Risk Score (0-100) - Calculated", name: "floodRiskScore", disabled: true, section: "Calculated Predictions" },
    { label: "Overflow Probability (%) - Calculated", name: "overflowProbability", disabled: true, section: "Calculated Predictions" },
    { label: "Risk Trend Index - Calculated", name: "riskTrendIndex", disabled: true, section: "Calculated Predictions" },
    { label: "Prediction Confidence Level (%) - Calculated", name: "predictionConfidenceLevel", disabled: true, section: "Calculated Predictions" },
  ];

  return (
    <div className="core-dam-info">
      <h2>Predictive & Simulation Outputs</h2>
      <form onSubmit={handleSubmit}>
        <table>
          <tbody>
            {fields.map((field, index) => (
              <React.Fragment key={field.name}>
                {field.section && (index === 0 || fields[index - 1].section !== field.section) && (
                  <tr className="section-header">
                    <td colSpan="2"><h3>{field.section}</h3></td>
                  </tr>
                )}
                <tr>
                  <td><strong>{field.label}</strong></td>
                  <td>
                    {field.type === "textarea" ? (
                      <textarea name={field.name} value={formData[field.name] || ""} onChange={handleChange} rows="3" disabled={field.disabled} />
                    ) : field.type === "select" ? (
                      <select name={field.name} value={formData[field.name] || ""} onChange={handleChange} disabled={field.disabled}>
                        <option value="">Select...</option>
                        {field.options.map(opt => (<option key={opt} value={opt}>{opt}</option>))}
                      </select>
                    ) : (
                      <input
                        name={field.name}
                        value={formData[field.name] || ""}
                        onChange={handleChange}
                        type={field.type || "number"}
                        step="0.01"
                        disabled={field.disabled}
                      />
                    )}
                  </td>
                </tr>
              </React.Fragment>
            ))}
          </tbody>
        </table>
        <button className="update-button" type="submit">
          {isExisting ? "Update" : "Save"}
        </button>
        {message && <p className="status-message">{message}</p>}
      </form>
    </div>
  );
};

export default PredictiveSimulation;
