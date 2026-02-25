import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "../styles/CoreDamInfo.css";

const API_URL = "http://localhost:5000";

const DownstreamRisk = () => {
  const { damId } = useParams();
  const [formData, setFormData] = useState({
    downstreamRiverBankHeight: "",
    floodWarningLevel: "",
    dangerLevel: "",
    downstreamFloodPlainPopulation: "",
    evacuationTimeRequired: "",
    villageDistanceFromRiver: "",
    criticalInfrastructureDownstream: "",
    criticalInfrastructureCount: "",
    currentDischarge: "",
    predictedRiverLevel: "",
    predictedRiverBankOverflowTime: "",
    floodProbability: "",
    downstreamFloodImpactScore: "",
    evacuationTimeRemaining: "",
    dangerLevelStatus: "",
    humanRiskIndex: "",
  });
  const [isExisting, setIsExisting] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/dam/downstream-risk/${damId}`);
        if (res.data) {
          setFormData(res.data);
          setIsExisting(true);
        }
      } catch (error) {
        console.error("Error fetching downstream risk:", error);
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
        await axios.put(`${API_URL}/api/dam/downstream-risk/${damId}`, formData);
        setMessage("Downstream risk data updated successfully.");
      } else {
        await axios.post(`${API_URL}/api/dam/downstream-risk/${damId}`, formData);
        setIsExisting(true);
        setMessage("Downstream risk data saved successfully.");
      }
    } catch (error) {
      setMessage("Failed to save/update downstream risk data.");
    }
  };

  const fields = [
    { label: "Downstream River Bank Height (m)", name: "downstreamRiverBankHeight", section: "River Parameters" },
    { label: "Flood Warning Level (m)", name: "floodWarningLevel", section: "Flood Levels" },
    { label: "Danger Level (m)", name: "dangerLevel", section: "Flood Levels" },
    { label: "Downstream Flood Plain Population", name: "downstreamFloodPlainPopulation", section: "Population & Infrastructure" },
    { label: "Evacuation Time Required (minutes)", name: "evacuationTimeRequired", section: "Emergency Response" },
    { label: "Village Distance From River (km)", name: "villageDistanceFromRiver", section: "Location" },
    { label: "Critical Infrastructure Downstream", name: "criticalInfrastructureDownstream", type: "textarea", section: "Infrastructure" },
    { label: "Critical Infrastructure Count", name: "criticalInfrastructureCount", section: "Infrastructure" },
    { label: "Current Discharge (m³/s)", name: "currentDischarge", section: "Current Conditions" },
    { label: "Predicted River Level (m)", name: "predictedRiverLevel", section: "Current Conditions" },
    { label: "Predicted River Bank Overflow Time (hours)", name: "predictedRiverBankOverflowTime", section: "Current Conditions" },
    { label: "Flood Probability (%)", name: "floodProbability", section: "Current Conditions" },
    
    { label: "Downstream Flood Impact Score (0-100) - Calculated", name: "downstreamFloodImpactScore", disabled: true, section: "Calculated Risk Metrics" },
    { label: "Evacuation Time Remaining (minutes) - Calculated", name: "evacuationTimeRemaining", disabled: true, section: "Calculated Risk Metrics" },
    { label: "Danger Level Status - Calculated", name: "dangerLevelStatus", disabled: true, section: "Calculated Risk Metrics" },
    { label: "Human Risk Index (0-100) - Calculated", name: "humanRiskIndex", disabled: true, section: "Calculated Risk Metrics" },
  ];

  return (
    <div className="core-dam-info">
      <h2>Downstream Risk & Safety Parameters</h2>
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

export default DownstreamRisk;
