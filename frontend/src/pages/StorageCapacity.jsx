import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "../styles/CoreDamInfo.css";

const API_URL = "http://localhost:5000";

const StorageCapacity = () => {
  const { damId } = useParams();
  const [formData, setFormData] = useState({
    maxStorage: "",
    grossStorage: "",
    liveStorage: "",
    deadStorage: "",
    floodCushionStorage: "",
    dynamicFloodCushion: "",
    conservationStorage: "",
    inactiveStorage: "",
    currentExcessStorage: "",
    availableCapacity: "",
    storageUtilizationPercentage: "",
    floodCushionAvailable: "",
  });
  const [isExisting, setIsExisting] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/dam/storage-capacity/${damId}`);
        if (res.data) {
          setFormData(res.data);
          setIsExisting(true);
        }
      } catch (error) {
        console.error("Error fetching storage capacity:", error);
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
        await axios.put(`${API_URL}/api/dam/storage-capacity/${damId}`, formData);
        setMessage("Storage capacity updated successfully.");
      } else {
        await axios.post(`${API_URL}/api/dam/storage-capacity/${damId}`, formData);
        setIsExisting(true);
        setMessage("Storage capacity saved successfully.");
      }
    } catch (error) {
      setMessage("Failed to save/update storage capacity.");
    }
  };

  const fields = [
    { label: "Max Storage (m³)", name: "maxStorage", section: "Storage Capacities" },
    { label: "Gross Storage (m³)", name: "grossStorage", section: "Storage Capacities" },
    { label: "Live Storage (m³)", name: "liveStorage", section: "Storage Capacities" },
    { label: "Dead Storage (m³)", name: "deadStorage", section: "Storage Capacities" },
    { label: "Flood Cushion Storage (m³)", name: "floodCushionStorage", section: "Storage Capacities" },
    { label: "Dynamic Flood Cushion (m³)", name: "dynamicFloodCushion", section: "Storage Capacities" },
    { label: "Conservation Storage (m³)", name: "conservationStorage", section: "Storage Capacities" },
    { label: "Inactive Storage (m³)", name: "inactiveStorage", section: "Storage Capacities" },
    { label: "Current Excess Storage (m³)", name: "currentExcessStorage", section: "Storage Capacities" },
    
    { label: "Available Capacity (m³) - Calculated", name: "availableCapacity", disabled: true, section: "Calculated Fields" },
    { label: "Storage Utilization Percentage (%) - Calculated", name: "storageUtilizationPercentage", disabled: true, section: "Calculated Fields" },
    { label: "Flood Cushion Available (m³) - Calculated", name: "floodCushionAvailable", disabled: true, section: "Calculated Fields" },
  ];

  return (
    <div className="core-dam-info">
      <h2>Storage & Capacity Parameters</h2>
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
                    <input
                      name={field.name}
                      value={formData[field.name] || ""}
                      onChange={handleChange}
                      type="number"
                      step="0.01"
                      disabled={field.disabled}
                    />
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

export default StorageCapacity;
