import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "../styles/CoreDamInfo.css";

const CoreDamInfo = () => {
  const { damId } = useParams();
  const [formData, setFormData] = useState({
    name: "",
    state: "",
    riverName: "",
    river: "",
    lat: "",
    lng: "",
    damType: "",
    constructionYear: "",
    operator: "",
    maxStorage: "",
    liveStorage: "",
    deadStorage: "",
    catchmentArea: "",
    surfaceArea: "",
    height: "",
    length: "",
    upstreamDam: "",
    upstreamDamDistance: "",
    downstreamDam: "",
    downstreamDamDistance: "",
    // Basin Coordination Fields
    basinName: "",
    basinPriorityIndex: "",
    coordinatedReleasePlan: "",
    upstreamReleaseSchedule: "",
    downstreamAbsorptionCapacity: "",
    basinCoordinationStatus: "",
  });
  const [isExisting, setIsExisting] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchDamDetails = async () => {
      try {
        const res = await axios.get(`https://river-water-management-and-life-safety.onrender.com/api/dam/core/${damId}`);
        if (res.data) {
          // Flatten coordinates for easier form editing
          const data = {
            ...res.data,
            lat: res.data.coordinates?.lat || "",
            lng: res.data.coordinates?.lng || "",
          };
          setFormData(data);
          setIsExisting(true);
        }
      } catch (error) {
        console.log("No existing data found. Creating new entry.");
        setIsExisting(false);
      }
    };

    fetchDamDetails();
  }, [damId]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...formData,
      coordinates: {
        lat: parseFloat(formData.lat) || null,
        lng: parseFloat(formData.lng) || null,
      },
    };

    try {
      let res;
      if (isExisting) {
        res = await axios.put(`https://river-water-management-and-life-safety.onrender.com/api/dam/core/${damId}`, payload);
        setMessage("Dam information updated successfully.");
      } else {
        res = await axios.post(`https://river-water-management-and-life-safety.onrender.com/api/dam/core/${damId}`, payload);
        setIsExisting(true);
        setMessage("Dam information saved successfully.");
      }
    } catch (error) {
      console.error("Save/Update error:", error);
      setMessage("Failed to save/update dam information.");
    }
  };

  const fields = [
    { label: "Dam Name", name: "name" },
    { label: "Location (State)", name: "state" },
    { label: "River Name", name: "riverName" },
    { label: "River ID", name: "river" },
    { label: "Latitude", name: "lat" },
    { label: "Longitude", name: "lng" },
    { label: "Dam Type", name: "damType" },
    { label: "Year of Construction", name: "constructionYear" },
    { label: "Operator/Authority", name: "operator" },
    { label: "Max Storage Capacity (MCM)", name: "maxStorage" },
    { label: "Live Storage Capacity (MCM)", name: "liveStorage" },
    { label: "Dead Storage (MCM)", name: "deadStorage" },
    { label: "Catchment Area (km²)", name: "catchmentArea" },
    { label: "Surface Area (km²)", name: "surfaceArea" },
    { label: "Height (m)", name: "height" },
    { label: "Length (m)", name: "length" },
    { label: "Upstream Dam", name: "upstreamDam" },
    { label: "Upstream Dam Distance (km)", name: "upstreamDamDistance" },
    { label: "Downstream Dam", name: "downstreamDam" },
    { label: "Downstream Dam Distance (km)", name: "downstreamDamDistance" },
    // Basin Coordination Fields
    { label: "Basin Name", name: "basinName", section: "Basin Coordination" },
    { label: "Basin Priority Index (1-10)", name: "basinPriorityIndex", section: "Basin Coordination" },
    { label: "Coordinated Release Plan", name: "coordinatedReleasePlan", type: "textarea", section: "Basin Coordination" },
    { label: "Upstream Release Schedule", name: "upstreamReleaseSchedule", type: "textarea", section: "Basin Coordination" },
    { label: "Downstream Absorption Capacity (m³/s)", name: "downstreamAbsorptionCapacity", section: "Basin Coordination" },
    { label: "Basin Coordination Status", name: "basinCoordinationStatus", type: "select", options: ["Active", "Inactive", "Pending", "Under Review"], section: "Basin Coordination" },
  ];

  return (
    <div className="core-dam-info">
      <h2>Core Dam Information</h2>

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
                      />
                    ) : field.type === "select" ? (
                      <select
                        name={field.name}
                        value={formData[field.name] || ""}
                        onChange={handleChange}
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
                        type={field.name.includes("Index") || field.name.includes("Capacity") || field.name.includes("Distance") ? "number" : "text"}
                        required={
                          field.name === "lat" ||
                          field.name === "lng" ||
                          field.name === "state" ||
                          field.name === "name"
                        }
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

export default CoreDamInfo;
