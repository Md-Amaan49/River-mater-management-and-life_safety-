import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "../styles/CoreDamInfo.css";

const API_URL = "http://localhost:5000";

const GateSpillway = () => {
  const { damId } = useParams();
  const [formData, setFormData] = useState({
    numberOfSpillwayGates: "",
    gateOpeningPercentage: "",
    maxGateDischargeCapacity: "",
    emergencySpillwayCapacity: "",
    currentGateStatus: "",
    lastGateOperationTime: "",
    manualOverrideStatus: "",
    authorityApprovalStatus: "",
    dischargeCoefficient: "",
    gateOpening: "",
    head: "",
    totalInflow: "",
    safeStorageTarget: "",
    actualDischarge: "",
    requiredSpillwayIncrease: "",
    gateEfficiencyIndex: "",
    releaseOptimizationValue: "",
  });
  const [isExisting, setIsExisting] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/dam/gate-spillway/${damId}`);
        if (res.data) {
          setFormData(res.data);
          setIsExisting(true);
        }
      } catch (error) {
        console.error("Error fetching gate spillway:", error);
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
        await axios.put(`${API_URL}/api/dam/gate-spillway/${damId}`, formData);
        setMessage("Gate & spillway data updated successfully.");
      } else {
        await axios.post(`${API_URL}/api/dam/gate-spillway/${damId}`, formData);
        setIsExisting(true);
        setMessage("Gate & spillway data saved successfully.");
      }
    } catch (error) {
      setMessage("Failed to save/update gate & spillway data.");
    }
  };

  const fields = [
    { label: "Number of Spillway Gates", name: "numberOfSpillwayGates", section: "Gate Configuration" },
    { label: "Gate Opening Percentage (%)", name: "gateOpeningPercentage", section: "Gate Configuration" },
    { label: "Max Gate Discharge Capacity (m³/s)", name: "maxGateDischargeCapacity", section: "Capacity" },
    { label: "Emergency Spillway Capacity (m³/s)", name: "emergencySpillwayCapacity", section: "Capacity" },
    { label: "Current Gate Status", name: "currentGateStatus", type: "select", options: ["Open", "Closed", "Partial"], section: "Status" },
    { label: "Last Gate Operation Time", name: "lastGateOperationTime", type: "datetime-local", section: "Operations" },
    { label: "Manual Override Status", name: "manualOverrideStatus", type: "select", options: ["Active", "Inactive"], section: "Control" },
    { label: "Authority Approval Status", name: "authorityApprovalStatus", type: "select", options: ["Approved", "Pending", "Not Required"], section: "Control" },
    
    { label: "Discharge Coefficient", name: "dischargeCoefficient", section: "Hydraulic Parameters" },
    { label: "Gate Opening (m)", name: "gateOpening", section: "Hydraulic Parameters" },
    { label: "Head (m)", name: "head", section: "Hydraulic Parameters" },
    { label: "Total Inflow (m³/s)", name: "totalInflow", section: "Hydraulic Parameters" },
    { label: "Safe Storage Target (m³)", name: "safeStorageTarget", section: "Hydraulic Parameters" },
    
    { label: "Actual Discharge (m³/s) - Calculated", name: "actualDischarge", disabled: true, section: "Calculated Discharge Metrics" },
    { label: "Required Spillway Increase (m³/s) - Calculated", name: "requiredSpillwayIncrease", disabled: true, section: "Calculated Discharge Metrics" },
    { label: "Gate Efficiency Index (%) - Calculated", name: "gateEfficiencyIndex", disabled: true, section: "Calculated Discharge Metrics" },
    { label: "Release Optimization Value - Calculated", name: "releaseOptimizationValue", disabled: true, section: "Calculated Discharge Metrics" },
  ];

  return (
    <div className="core-dam-info">
      <h2>Gate & Spillway Control System</h2>
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
                    {field.type === "select" ? (
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

export default GateSpillway;
