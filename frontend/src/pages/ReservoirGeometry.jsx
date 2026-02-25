import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "../styles/CoreDamInfo.css";

const API_URL = "http://localhost:5000";

const ReservoirGeometry = () => {
  const { damId } = useParams();
  const [formData, setFormData] = useState({
    height: "",
    length: "",
    crestLevel: "",
    riverWidth: "",
    riverDepth: "",
    damCrestWidth: "",
    foundationDepth: "",
    slopeUpstream: "",
    slopeDownstream: "",
    spillwayWidth: "",
    spillwayLength: "",
    gateWidth: "",
    gateHeight: "",
    dischargeCoefficient: "",
    gateOpeningPercentage: "",
    head: "",
    riverCrossSectionArea: "",
    hydraulicRadius: "",
    effectiveDischargeCapacity: "",
  });
  const [isExisting, setIsExisting] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("Fetching reservoir geometry for damId:", damId);
        const res = await axios.get(`${API_URL}/api/dam/reservoir-geometry/${damId}`);
        console.log("API Response:", res.data);
        if (res.data) {
          setFormData(res.data);
          setIsExisting(true);
        }
      } catch (error) {
        console.error("Error fetching reservoir geometry:", error);
        console.error("Error response:", error.response);
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
        await axios.put(`${API_URL}/api/dam/reservoir-geometry/${damId}`, formData);
        setMessage("Reservoir geometry updated successfully.");
      } else {
        await axios.post(`${API_URL}/api/dam/reservoir-geometry/${damId}`, formData);
        setIsExisting(true);
        setMessage("Reservoir geometry saved successfully.");
      }
    } catch (error) {
      console.error("Save/Update error:", error);
      setMessage("Failed to save/update reservoir geometry.");
    }
  };

  const fields = [
    { label: "Height (m)", name: "height", section: "Dam Structure" },
    { label: "Length (m)", name: "length", section: "Dam Structure" },
    { label: "Crest Level (m)", name: "crestLevel", section: "Dam Structure" },
    { label: "Dam Crest Width (m)", name: "damCrestWidth", section: "Dam Structure" },
    { label: "Foundation Depth (m)", name: "foundationDepth", section: "Dam Structure" },
    { label: "Slope Upstream (ratio)", name: "slopeUpstream", section: "Dam Structure" },
    { label: "Slope Downstream (ratio)", name: "slopeDownstream", section: "Dam Structure" },
    
    { label: "Spillway Width (m)", name: "spillwayWidth", section: "Spillway Dimensions" },
    { label: "Spillway Length (m)", name: "spillwayLength", section: "Spillway Dimensions" },
    { label: "Gate Width (m)", name: "gateWidth", section: "Spillway Dimensions" },
    { label: "Gate Height (m)", name: "gateHeight", section: "Spillway Dimensions" },
    
    { label: "River Width (m)", name: "riverWidth", section: "River Characteristics" },
    { label: "River Depth (m)", name: "riverDepth", section: "River Characteristics" },
    { label: "River Cross Section Area (m²) - Calculated", name: "riverCrossSectionArea", disabled: true, section: "River Characteristics" },
    { label: "Hydraulic Radius (m) - Calculated", name: "hydraulicRadius", disabled: true, section: "River Characteristics" },
    
    { label: "Discharge Coefficient", name: "dischargeCoefficient", section: "Hydraulic Parameters" },
    { label: "Gate Opening Percentage (%)", name: "gateOpeningPercentage", section: "Hydraulic Parameters" },
    { label: "Head (m)", name: "head", section: "Hydraulic Parameters" },
    { label: "Effective Discharge Capacity (m³/s) - Calculated", name: "effectiveDischargeCapacity", disabled: true, section: "Hydraulic Parameters" },
  ];

  return (
    <div className="core-dam-info">
      <h2>Reservoir Geometry & Physical Characteristics</h2>
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
                      <textarea
                        name={field.name}
                        value={formData[field.name] || ""}
                        onChange={handleChange}
                        rows="3"
                        disabled={field.disabled}
                      />
                    ) : field.type === "select" ? (
                      <select
                        name={field.name}
                        value={formData[field.name] || ""}
                        onChange={handleChange}
                        disabled={field.disabled}
                      >
                        <option value="">Select...</option>
                        {field.options.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        name={field.name}
                        value={formData[field.name] || ""}
                        onChange={handleChange}
                        type="number"
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

export default ReservoirGeometry;
