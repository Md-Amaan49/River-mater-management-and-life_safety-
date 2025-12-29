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
  });
  const [isExisting, setIsExisting] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchDamDetails = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/dam/core/${damId}`);
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
        res = await axios.put(`http://localhost:5000/api/dam/core/${damId}`, payload);
        setMessage("Dam information updated successfully.");
      } else {
        res = await axios.post(`http://localhost:5000/api/dam/core/${damId}`, payload);
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
                    required={
                      field.name === "lat" ||
                      field.name === "lng" ||
                      field.name === "state" ||
                      field.name === "name"
                    }
                  />
                </td>
              </tr>
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
