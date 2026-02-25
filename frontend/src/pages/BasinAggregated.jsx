import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "../styles/CoreDamInfo.css";

const API_URL = "http://localhost:5000";

const BasinAggregated = () => {
  const { damId } = useParams();
  const [formData, setFormData] = useState({
    basinRainfallAverage: "",
    basinLiveStorage: "",
    basinTotalStorage: "",
    basinFloodRiskLevel: "",
    upstreamStress: "",
    downstreamStress: "",
    damHealthScore: "",
    basinCoordinationStatus: "",
    flowBalance: "",
    basinStorageUtilization: "",
    cascadingFailureProbability: "",
    multiDamOptimizationScore: "",
  });
  const [isExisting, setIsExisting] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/dam/basin-aggregated/${damId}`);
        if (res.data) {
          setFormData(res.data);
          setIsExisting(true);
        }
      } catch (error) {
        console.error("Error fetching basin aggregated:", error);
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
        await axios.put(`${API_URL}/api/dam/basin-aggregated/${damId}`, formData);
        setMessage("Basin-level aggregated data updated successfully.");
      } else {
        await axios.post(`${API_URL}/api/dam/basin-aggregated/${damId}`, formData);
        setIsExisting(true);
        setMessage("Basin-level aggregated data saved successfully.");
      }
    } catch (error) {
      setMessage("Failed to save/update basin-level aggregated data.");
    }
  };

  const fields = [
    { label: "Basin Rainfall Average (mm)", name: "basinRainfallAverage", section: "Basin Meteorological Data" },
    { label: "Basin Live Storage (m³)", name: "basinLiveStorage", section: "Basin Storage Metrics" },
    { label: "Basin Total Storage (m³)", name: "basinTotalStorage", section: "Basin Storage Metrics" },
    { label: "Basin Flood Risk Level", name: "basinFloodRiskLevel", type: "select", options: ["Low", "Moderate", "High", "Critical", "Extreme"], section: "Basin Risk Assessment" },
    { label: "Upstream Stress (0-100)", name: "upstreamStress", section: "Basin Risk Assessment" },
    { label: "Downstream Stress (0-100)", name: "downstreamStress", section: "Basin Risk Assessment" },
    { label: "Dam Health Score (0-100)", name: "damHealthScore", section: "Basin Risk Assessment" },
    { label: "Basin Coordination Status", name: "basinCoordinationStatus", type: "select", options: ["Not Coordinated", "Partially Coordinated", "Fully Coordinated", "Optimized"], section: "Basin Coordination" },
    { label: "Flow Balance (0-100)", name: "flowBalance", section: "Basin Coordination" },
    
    { label: "Basin Storage Utilization (%) - Calculated", name: "basinStorageUtilization", disabled: true, section: "Calculated Basin Metrics" },
    { label: "Cascading Failure Probability (%) - Calculated", name: "cascadingFailureProbability", disabled: true, section: "Calculated Basin Metrics" },
    { label: "Multi-Dam Optimization Score (0-100) - Calculated", name: "multiDamOptimizationScore", disabled: true, section: "Calculated Basin Metrics" },
  ];

  return (
    <div className="core-dam-info">
      <h2>Basin-Level Aggregated Fields (Very Advanced)</h2>
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

export default BasinAggregated;
