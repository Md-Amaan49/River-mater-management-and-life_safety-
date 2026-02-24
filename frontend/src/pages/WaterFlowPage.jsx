import React, { useEffect, useState } from "react";
import axios from "axios";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useNavigate } from "react-router-dom";
import "../styles/WaterFlowPage.css"; // You can rename to RiverMapPage.css if you want

// Base API for backend
const API_BASE = "https://river-water-management-and-life-safety.onrender.com/api";
const DAM_API = `${API_BASE}/dam`;
const DATA_API = `${API_BASE}/data`;
const USER_API = `${API_BASE}/users`;

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

        // Check if coordinates exist and are valid
        if (d.coordinates && typeof d.coordinates === "object") {
          lat = d.coordinates.lat;
          lng = d.coordinates.lng;
        }

        // Validate coordinates
        if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
          console.warn(`Invalid coordinates for dam ${d.name}:`, d.coordinates);
          return null;
        }

        // Return dam with coordinates as [lat, lng] array for Leaflet
        return { 
          ...d, 
          coordinates: [parseFloat(lat), parseFloat(lng)]
        };
      })
      .filter(Boolean);
  };

  // Fetch all distinct states (from dams collection)
  useEffect(() => {
    axios
      .get(`${DATA_API}/states`)
      .then((res) => setStates(res.data))
      .catch((err) => console.error("Error fetching states:", err));
    
    fetchSavedDams();
  }, []);

  // When state selected
  useEffect(() => {
    if (!selectedState) {
      setRivers([]);
      setDams([]);
      setSelectedRiver("");
      setSelectedDam("");
      setRiverLine(null);
      return;
    }

    // Fetch rivers for that state
    axios
      .get(`${DATA_API}/rivers/${selectedState}`)
      .then((res) => {
        console.log("Rivers API response:", res.data);
        console.log("Number of rivers found:", res.data?.length || 0);
        setRivers(res.data);
        
        // Get the selected state name for filtering
        const selectedStateName = states.find(s => s._id === selectedState)?.name;
        console.log("Selected state name:", selectedStateName);
        
        // Fetch all dams for all rivers in this state
        return Promise.all(
          res.data.map(river => 
            axios.get(`${DATA_API}/dams/${river._id}`)
              .then(damRes => damRes.data)
              .catch(err => {
                console.warn(`Error fetching dams for river ${river.name}:`, err);
                return [];
              })
          )
        ).then(allDamsArrays => ({ allDamsArrays, selectedStateName }));
      })
      .then(({ allDamsArrays, selectedStateName }) => {
        // Flatten array of arrays into single array
        const allDams = allDamsArrays.flat();
        console.log("All dams before filtering:", allDams);
        
        // Filter dams to only include those in the selected state
        const stateDams = allDams.filter(dam => {
          const damState = dam.state || dam.stateName || "";
          const matches = damState === selectedStateName;
          if (!matches && damState) {
            console.log(`Filtering out dam ${dam.name} - state: ${damState} (expected: ${selectedStateName})`);
          }
          return matches;
        });
        
        console.log("Dams after state filtering:", stateDams);
        const valid = normalizeDamCoords(stateDams);
        setDams(valid);
        if (valid.length > 0) {
          setMapCenter(valid[0].coordinates);
          setZoom(7);
        }
      })
      .catch((err) => {
        console.error("Error fetching rivers:", err);
        console.error("Error details:", err.response?.data);
      });

    // Reset downstream selections
    setSelectedRiver("");
    setSelectedDam("");
    setRiverLine(null);
  }, [selectedState, states]);

  // When river selected
  useEffect(() => {
    if (!selectedRiver) {
      // If no river selected but state is selected, keep showing all state dams
      // (already loaded in state effect)
      setSelectedDam("");
      setRiverLine(null);
      return;
    }

    // Get the selected state name for filtering
    const selectedStateName = states.find(s => s._id === selectedState)?.name;

    axios
      .get(`${DATA_API}/dams/${selectedRiver}`)
      .then((res) => {
        console.log("Dams for river (before filtering):", res.data);
        
        // Filter dams to only include those in the selected state
        const filteredDams = selectedStateName 
          ? res.data.filter(dam => {
              const damState = dam.state || dam.stateName || "";
              return damState === selectedStateName;
            })
          : res.data;
        
        console.log("Dams for river (after filtering):", filteredDams);
        const valid = normalizeDamCoords(filteredDams);
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
  }, [selectedRiver, selectedState, states]);

  // When dam selected
  useEffect(() => {
    if (!selectedDam) return;
    const dam = dams.find((d) => d._id === selectedDam);
    if (dam && dam.coordinates) {
      setMapCenter(dam.coordinates);
      setZoom(11);
      setRiverLine(null);
    }
  }, [selectedDam, dams]);

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
            <option value="">All Rivers</option>
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
            disabled={!selectedState}
          >
            <option value="">All Dams</option>
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
            .filter((d) => {
              // Filter based on selected dam
              if (selectedDam) {
                return d._id === selectedDam;
              }
              // Otherwise show all dams in current list
              return d.coordinates && d.coordinates.length === 2;
            })
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
