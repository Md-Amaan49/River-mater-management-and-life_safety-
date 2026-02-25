import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "../styles/CoreDamInfo.css";

const API_URL = "http://localhost:5000";

const StructuralHealth = () => {
  const { damId } = useParams();
  const [formData, setFormData] = useState({
    structuralStressIndex: "",
    seepageRate: "",
    vibrationLevel: "",
    crackSensorStatus: "",
    pressureSensorStatus: "",
    foundationUpliftPressure: "",
    lastInspectionDate: "",
    maintenanceRequiredFlag: "",
    designStressLimit: "",
    currentStressLevel: "",
    damHealthScore: "",
    structuralFailureProbability: "",
    maintenanceUrgencyLevel: "",
  });
  const [isExisting, setIsExisting] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/dam/structural-health/${damId}`);
        if (res.data) {
          setFormData(res.data);
          setIsExisting(true);
        }
      } catch (error) {
        console.error("Error fetching structural health:", error);
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
        await axios.put(`${API_URL}/api/dam/structural-health/${damId}`, formData);
        setMessage("Structural health data updated successfully.");
      } else {
        await axios.post(`${API_URL}/api/dam/structural-health/${damId}`, formData);
        setIsExisting(true);
        setMessage("Structural health data saved successfully.");
      }
    } catch (error) {
      setMessage("Failed to save/update structural health data.");
    }
  };

  const fields = [
    { label: "Structural Stress Index (0-10)", name: "structuralStressIndex", section: "Monitoring Data" },
    { label: "Seepage Rate (L/min)", name: "seepageRate", section: "Monitoring Data" },
    { label: "Vibration Level (mm/s)", name: "vibrationLevel", section: "Monitoring Data" },
    { label: "Crack Sensor Status", name: "crackSensorStatus", type: "select", options: ["Normal", "Warning", "Critical", "Offline"], section: "Sensor Status" },
    { label: "Pressure Sensor Status", name: "pressureSensorStatus", type: "select", options: ["Normal", "Warning", "Critical", "Offline"], section: "Sensor Status" },
    { label: "Foundation Uplift Pressure (kPa)", name: "foundationUpliftPressure", section: "Structural Parameters" },
    { label: "Last Inspection Date", name: "lastInspectionDate", type: "date", section: "Maintenance" },
    { label: "Maintenance Required Flag", name: "maintenanceRequiredFlag", type: "select", options: ["No", "Yes - Routine", "Yes - Urgent", "Yes - Critical"], section: "Maintenance" },
    { label: "Design Stress Limit (MPa)", name: "designStressLimit", section: "Structural Parameters" },
    { label: "Current Stress Level (MPa)", name: "currentStressLevel", section: "Structural Parameters" },
    
    { label: "Dam Health Score (0-100) - Calculated", name: "damHealthScore", disabled: true, section: "Calculated Health Metrics" },
    { label: "Structural Failure Probability (%) - Calculated", name: "structuralFailureProbability", disabled: true, section: "Calculated Health Metrics" },
    { label: "Maintenance Urgency Level - Calculated", name: "maintenanceUrgencyLevel", disabled: true, section: "Calculated Health Metrics" },
  ];

  return (
    <div className="core-dam-info">
      <h2>Structural Health Monitoring</h2>
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

export default StructuralHealth;
