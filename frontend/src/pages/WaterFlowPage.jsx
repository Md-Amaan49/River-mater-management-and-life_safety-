import React, { useEffect, useState } from "react";
import axios from "axios";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useNavigate } from "react-router-dom";
import "../styles/WaterFlowPage.css"; // You can rename to RiverMapPage.css if you want

// Base API for backend
const DAM_API = "http://localhost:5000/api/dam";
const USER_API = "http://localhost:5000/api/users";

// Fix default Leaflet icon path issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const RiverMapPage = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const authHeader = token ? { Authorization: `Bearer ${token}` } : undefined;

  const [states, setStates] = useState([]);
  const [rivers, setRivers] = useState([]);
  const [dams, setDams] = useState([]);
  const [savedIds, setSavedIds] = useState(new Set());

  const [selectedState, setSelectedState] = useState("");
  const [selectedRiver, setSelectedRiver] = useState("");
  const [selectedDam, setSelectedDam] = useState("");

  const [mapCenter, setMapCenter] = useState([22.9734, 78.6569]); // India center
  const [zoom, setZoom] = useState(5);

  const [riverLine, setRiverLine] = useState(null);

  // Fetch saved dams to know which ones are saved
  const fetchSavedDams = async () => {
    if (!token) return;
    try {
      const res = await axios.get(`${USER_API}/saved-dams`, { headers: authHeader });
      const data = res.data || [];
      if (data.length && data[0].dam) {
        setSavedIds(new Set(data.map(r => String(r.dam._id))));
      } else {
        setSavedIds(new Set(data.map(d => String(d._id))));
      }
    } catch (err) {
      console.error("Error fetching saved dams:", err);
    }
  };

  // Toggle save dam
  const toggleSave = async (damId) => {
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      await axios.patch(`${USER_API}/saved-dams/${damId}`, {}, { headers: authHeader });

      // Optimistic update
      setSavedIds(prev => {
        const newSet = new Set(prev);
        if (newSet.has(damId)) {
          newSet.delete(damId);
        } else {
          newSet.add(damId);
        }
        return newSet;
      });
    } catch (err) {
      console.error("Error toggling save:", err);
    }
  };

  // Normalize coordinate formats safely
  const normalizeDamCoords = (data) => {
  return data
    .map((d) => {
      let lat, lng;

      // 1️⃣ case: coordinates as object
      if (d.coordinates && typeof d.coordinates === "object") {
        lat = d.coordinates.lat ?? d.coordinates[0];
        lng = d.coordinates.lng ?? d.coordinates[1];
      }

      // 2️⃣ case: stored as lat/lng fields directly
      if (!lat && d.lat) lat = d.lat;
      if (!lng && d.lng) lng = d.lng;

      // 3️⃣ case: stored as string
      if (typeof d.coordinates === "string") {
        const parts = d.coordinates.split(",").map(Number);
        lat = parts[0];
        lng = parts[1];
      }

      // 4️⃣ final check
      if (!lat || !lng || isNaN(lat) || isNaN(lng)) return null;

      return { ...d, coordinates: [lat, lng] };
    })
    .filter(Boolean);
};

  // Fetch all distinct states (from dams collection)
  useEffect(() => {
    axios
      .get(`${DAM_API}/states`)
      .then((res) => setStates(res.data))
      .catch((err) => console.error("Error fetching states:", err));
    
    fetchSavedDams();
  }, []);

  // When state selected
  useEffect(() => {
    if (!selectedState) return;

    // Fetch rivers for that state
    axios
      .get(`${DAM_API}/rivers/${selectedState}`)
      .then((res) => setRivers(res.data))
      .catch((err) => console.error("Error fetching rivers:", err));

    // Fetch all dams in that state
    axios
      .get(`${DAM_API}/by-state/${selectedState}`)
      .then((res) => {
        const valid = normalizeDamCoords(res.data);
        setDams(valid);
        if (valid.length > 0) {
          setMapCenter(valid[0].coordinates);
          setZoom(7);
        }
      })
      .catch((err) => console.error("Error fetching dams by state:", err));

    // Reset downstream selections
    setSelectedRiver("");
    setSelectedDam("");
    setRiverLine(null);
  }, [selectedState]);

  // When river selected
  useEffect(() => {
    if (!selectedRiver) return;

    axios
      .get(`${DAM_API}/by-river/${selectedRiver}`)
      .then((res) => {
        const valid = normalizeDamCoords(res.data);
        setDams(valid);
        if (valid.length > 0) {
          setMapCenter(valid[0].coordinates);
          setZoom(8);
        }

        // Optional: fake river polyline using dam coordinates (sorted roughly by lat)
        if (valid.length > 1) {
          const line = valid
            .map((d) => d.coordinates)
            .sort((a, b) => a[0] - b[0]);
          setRiverLine(line);
        } else {
          setRiverLine(null);
        }
      })
      .catch((err) => console.error("Error fetching dams by river:", err));

    setSelectedDam("");
  }, [selectedRiver]);

  // When dam selected
  useEffect(() => {
    if (!selectedDam) return;
    const dam = dams.find((d) => d._id === selectedDam);
    if (dam && dam.coordinates) {
      setMapCenter(dam.coordinates);
      setZoom(11);
      setDams([dam]); // show only selected dam
      setRiverLine(null);
    }
  }, [selectedDam]);

  return (
    <div className="river-map-page">
      <div className="dropdown-section">
        <h2>River and Dam Map</h2>
        <div className="dropdowns">
          {/* State Dropdown */}
          <select value={selectedState} onChange={(e) => setSelectedState(e.target.value)}>
            <option value="">Select State</option>
            {states.map((s) => (
              <option key={s._id || s.name} value={s._id || s.name}>
                {s.name}
              </option>
            ))}
          </select>

          {/* River Dropdown */}
          <select
            value={selectedRiver}
            onChange={(e) => setSelectedRiver(e.target.value)}
            disabled={!selectedState}
          >
            <option value="">Select River</option>
            {rivers.map((r) => (
              <option key={r._id || r.name} value={r._id || r.name}>
                {r.name}
              </option>
            ))}
          </select>

          {/* Dam Dropdown */}
          <select
            value={selectedDam}
            onChange={(e) => setSelectedDam(e.target.value)}
            disabled={!selectedRiver}
          >
            <option value="">Select Dam</option>
            {dams.map((d) => (
              <option key={d._id} value={d._id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="map-container">
        <MapContainer center={mapCenter} zoom={zoom} style={{ height: "75vh", width: "100%" }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="© OpenStreetMap contributors"
          />

          {/* River Polyline (highlighted river) */}
          {riverLine && <Polyline positions={riverLine} color="blue" weight={3} />}

          {/* Dams Markers */}
          {dams
            .filter((d) => d.coordinates && d.coordinates.length === 2)
            .map((dam) => (
              <Marker key={dam._id} position={dam.coordinates}>
                <Popup>
                  <div className="dam-popup">
                    <strong>{dam.name}</strong>
                    <br />
                    River: {dam.riverName || "N/A"}
                    <br />
                    State: {dam.state || "N/A"}
                    <br />
                    <div className="popup-actions">
                      <a href={`/dam-dashboard/${dam._id}`}>View Dam Details</a>
                      {token && (
                        <button
                          className={`popup-save-btn ${savedIds.has(dam._id) ? "saved" : ""}`}
                          onClick={() => toggleSave(dam._id)}
                        >
                          {savedIds.has(dam._id) ? "★ Saved" : "☆ Save"}
                        </button>
                      )}
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
        </MapContainer>
      </div>
    </div>
  );
};

export default RiverMapPage;
