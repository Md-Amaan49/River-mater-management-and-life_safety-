import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "../styles/CoreDamInfo.css";

const API_URL = "http://localhost:5000";

const HistoricalRisk = () => {
  const { damId } = useParams();
  const [formData, setFormData] = useState({
    historicalPeakInflow: "",
    historicalMaxWaterLevel: "",
    historicalFloodEvents: "",
    lastMajorFloodYear: "",
    floodDamageHistory: "",
    designFloodLevel: "",
    safetyMargin: "",
    riskClassification: "",
    historicalFailureIncidents: "",
    yearsInOperation: "",
    returnPeriodFloodLevel: "",
    probableMaximumFlood: "",
    floodRecurrenceInterval: "",
    anomalyDetectionScore: "",
  });
  const [isExisting, setIsExisting] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/dam/historical-risk/${damId}`);
        if (res.data) {
          setFormData(res.data);
          setIsExisting(true);
        }
      } catch (error) {
        console.error("Error fetching historical risk:", error);
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
        await axios.put(`${API_URL}/api/dam/historical-risk/${damId}`, formData);
        setMessage("Historical data updated successfully.");
      } else {
        await axios.post(`${API_URL}/api/dam/historical-risk/${damId}`, formData);
        setIsExisting(true);
        setMessage("Historical data saved successfully.");
      }
    } catch (error) {
      setMessage("Failed to save/update historical data.");
    }
  };

  const fields = [
    { label: "Historical Peak Inflow (m³/s)", name: "historicalPeakInflow", section: "Historical Data" },
    { label: "Historical Max Water Level (m)", name: "historicalMaxWaterLevel", section: "Historical Data" },
    { label: "Historical Flood Events (count)", name: "historicalFloodEvents", section: "Historical Data" },
    { label: "Last Major Flood Year", name: "lastMajorFloodYear", section: "Historical Data" },
    { label: "Flood Damage History", name: "floodDamageHistory", type: "textarea", section: "Historical Data" },
    { label: "Design Flood Level (m)", name: "designFloodLevel", section: "Historical Data" },
    { label: "Safety Margin (m)", name: "safetyMargin", section: "Historical Data" },
    { label: "Risk Classification", name: "riskClassification", type: "select", options: ["Low", "Moderate", "High", "Very High", "Extreme"], section: "Historical Data" },
    { label: "Historical Failure Incidents (count)", name: "historicalFailureIncidents", section: "Historical Data" },
    { label: "Years In Operation", name: "yearsInOperation", section: "Historical Data" },
    
    { label: "Return Period Flood Level (m) - Calculated", name: "returnPeriodFloodLevel", disabled: true, section: "Calculated Risk Metrics" },
    { label: "Probable Maximum Flood (m³/s) - Calculated", name: "probableMaximumFlood", disabled: true, section: "Calculated Risk Metrics" },
    { label: "Flood Recurrence Interval (years) - Calculated", name: "floodRecurrenceInterval", disabled: true, section: "Calculated Risk Metrics" },
    { label: "Anomaly Detection Score (0-100) - Calculated", name: "anomalyDetectionScore", disabled: true, section: "Calculated Risk Metrics" },
  ];

  return (
    <div className="core-dam-info">
      <h2>Historical & Risk Reference Data</h2>
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

export default HistoricalRisk;
