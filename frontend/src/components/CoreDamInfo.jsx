import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "../styles/CoreDamInfo.css"; // Assuming you have a CSS file for styling'

const CoreDamInfo = () => {
  const { damId } = useParams();
  const [formData, setFormData] = useState({});
  const [isExisting, setIsExisting] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchDamDetails = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/dam/core/${damId}`);
        if (res.data) {
          setFormData(res.data);
          setIsExisting(true);
        }
      } catch (error) {
        console.log("No existing data found. Creating new entry.");
        setIsExisting(false);
        setFormData({});
      }
    };

    fetchDamDetails();
  }, [damId]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      let res;
      if (isExisting) {
        // Update
        res = await axios.put(`http://localhost:5000/api/dam/core/${damId}`, formData);
        setMessage("Dam information updated successfully.");
      } else {
        // Save new
        res = await axios.post(`http://localhost:5000/api/dam/core/${damId}`, formData);
        setIsExisting(true); // Mark as existing after creating
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
    { label: "River id", name: "river" },
    { label: "Coordinates", name: "coordinates" },
    { label: "Dam Type", name: "damType" },
    { label: "Year of Construction", name: "constructionYear" },
    { label: "Operator/Authority", name: "operator" },
    { label: "Max Storage Capacity (MCM)", name: "maxStorage" },
    { label: "Live Storage Capacity", name: "liveStorage" },
    { label: "Dead Storage", name: "deadStorage" },
    { label: "Catchment Area", name: "catchmentArea" },
    { label: "Surface Area", name: "surfaceArea" },
    { label: "Height", name: "height" },
    { label: "Length", name: "length" },
  ];

  return (
    <div className="core-dam-info">
      <h2>Core Dam Information</h2>
      
      <form onSubmit={handleSubmit}>
        <table>
          <tbody>
            {fields.map((field) => (
              <tr key={field.name}>
                <td><strong>{field.label}</strong></td>
                <td>
                  <input
                    name={field.name}
                    value={formData[field.name] || ""}
                    onChange={handleChange}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <button className="update-button" type="submit">
          {isExisting ? "Update" : "Save"}
        </button>{message && <p className="status-message">{message}</p>}

      </form>
    </div>
  );
};

export default CoreDamInfo;
