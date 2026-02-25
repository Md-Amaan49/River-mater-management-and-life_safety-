import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "../styles/CoreDamInfo.css";

const API_URL = "http://localhost:5000";

const ForecastMeteo = () => {
  const { damId } = useParams();
  const [formData, setFormData] = useState({
    rainfallForecastNext6hr: "",
    rainfallForecastNext12hr: "",
    rainfallForecastNext24hr: "",
    rainfallForecastNext48hr: "",
    temperatureForecast: "",
    windSpeedForecast: "",
    humidityForecast: "",
    evaporationForecast: "",
    soilMoistureIndex: "",
    weatherSystemSeverityIndex: "",
    stormProbability: "",
    catchmentArea: "",
    runoffCoefficient: "",
    predictedRainfallContribution: "",
    runoffVolumeForecast: "",
    catchmentRunoffIndex: "",
    stormRiskIndex: "",
  });
  const [isExisting, setIsExisting] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/dam/forecast-meteo/${damId}`);
        if (res.data) {
          setFormData(res.data);
          setIsExisting(true);
        }
      } catch (error) {
        console.error("Error fetching forecast meteo:", error);
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
        await axios.put(`${API_URL}/api/dam/forecast-meteo/${damId}`, formData);
        setMessage("Forecast data updated successfully.");
      } else {
        await axios.post(`${API_URL}/api/dam/forecast-meteo/${damId}`, formData);
        setIsExisting(true);
        setMessage("Forecast data saved successfully.");
      }
    } catch (error) {
      setMessage("Failed to save/update forecast data.");
    }
  };

  const fields = [
    { label: "Rainfall Forecast Next 6hr (mm)", name: "rainfallForecastNext6hr", section: "Rainfall Forecasts" },
    { label: "Rainfall Forecast Next 12hr (mm)", name: "rainfallForecastNext12hr", section: "Rainfall Forecasts" },
    { label: "Rainfall Forecast Next 24hr (mm)", name: "rainfallForecastNext24hr", section: "Rainfall Forecasts" },
    { label: "Rainfall Forecast Next 48hr (mm)", name: "rainfallForecastNext48hr", section: "Rainfall Forecasts" },
    
    { label: "Temperature Forecast (°C)", name: "temperatureForecast", section: "Meteorological Parameters" },
    { label: "Wind Speed Forecast (km/h)", name: "windSpeedForecast", section: "Meteorological Parameters" },
    { label: "Humidity Forecast (%)", name: "humidityForecast", section: "Meteorological Parameters" },
    { label: "Evaporation Forecast (mm/day)", name: "evaporationForecast", section: "Meteorological Parameters" },
    { label: "Soil Moisture Index (0-100)", name: "soilMoistureIndex", section: "Meteorological Parameters" },
    { label: "Weather System Severity Index (0-100)", name: "weatherSystemSeverityIndex", section: "Meteorological Parameters" },
    { label: "Storm Probability (%)", name: "stormProbability", section: "Meteorological Parameters" },
    { label: "Catchment Area (km²)", name: "catchmentArea", section: "Meteorological Parameters" },
    { label: "Runoff Coefficient (0-1)", name: "runoffCoefficient", section: "Meteorological Parameters" },
    
    { label: "Predicted Rainfall Contribution (m³/s) - Calculated", name: "predictedRainfallContribution", disabled: true, section: "Calculated Fields" },
    { label: "Runoff Volume Forecast (m³) - Calculated", name: "runoffVolumeForecast", disabled: true, section: "Calculated Fields" },
    { label: "Catchment Runoff Index (0-100) - Calculated", name: "catchmentRunoffIndex", disabled: true, section: "Calculated Fields" },
    { label: "Storm Risk Index (0-100) - Calculated", name: "stormRiskIndex", disabled: true, section: "Calculated Fields" },
  ];

  return (
    <div className="core-dam-info">
      <h2>Forecast & Meteorological Data</h2>
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

export default ForecastMeteo;
