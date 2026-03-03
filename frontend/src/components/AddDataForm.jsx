import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import API_BASE_URL from "../config";
import "../styles/AddDataForm.css";

const AddDataForm = () => {
  const navigate = useNavigate(); 

  const [states, setStates] = useState([]);
  const [rivers, setRivers] = useState([]);
  const [dams, setDams] = useState([]);

  const [selectedState, setSelectedState] = useState("");
  const [selectedRiver, setSelectedRiver] = useState("");
  const [selectedDam, setSelectedDam] = useState("");

  const [newState, setNewState] = useState("");
  const [newRiver, setNewRiver] = useState("");
  const [newDam, setNewDam] = useState("");

  const [message, setMessage] = useState("");
  const [user, setUser] = useState(null);

  const API_BASE = `${API_BASE_URL}/api/data`;

  // Fetch user profile to check role and assigned dam
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await axios.get(`${API_BASE_URL}/api/users/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setUser(res.data);

        // If dam operator, auto-select their assigned dam
        if (res.data.role === "dam_operator" && res.data.assignedDam) {
          setSelectedDam(res.data.assignedDam._id);
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    };

    fetchUserProfile();
  }, []);

  useEffect(() => {
    axios.get(`${API_BASE}/states`).then((res) => setStates(res.data));
  }, []);

  useEffect(() => {
    if (selectedState) {
      axios.get(`${API_BASE}/rivers/${selectedState}`).then((res) => setRivers(res.data));
      setSelectedRiver("");
      // Don't clear selectedDam if user is dam operator
      if (user?.role !== "dam_operator") {
        setSelectedDam("");
      }
      setDams([]);
    }
  }, [selectedState, user]);

  useEffect(() => {
    if (selectedRiver) {
      axios.get(`${API_BASE}/dams/${selectedRiver}`).then((res) => setDams(res.data));
      // Don't clear selectedDam if user is dam operator
      if (user?.role !== "dam_operator") {
        setSelectedDam("");
      }
    }
  }, [selectedRiver, user]);

  const handleAddState = () => {
    if (!newState) return;
    axios.post(`${API_BASE}/state`, { name: newState })
      .then(() => {
        setMessage(`State "${newState}" added`);
        setNewState("");
        return axios.get(`${API_BASE}/states`);
      })
      .then((res) => setStates(res.data))
      .catch((err) => setMessage(err.response?.data?.message || "Error"));
  };

  const handleAddRiver = () => {
    if (!newRiver || !selectedState) return;
    axios.post(`${API_BASE}/river`, { name: newRiver, stateId: selectedState })
      .then(() => {
        setMessage(`River "${newRiver}" added`);
        setNewRiver("");
        return axios.get(`${API_BASE}/rivers/${selectedState}`);
      })
      .then((res) => setRivers(res.data))
      .catch((err) => setMessage(err.response?.data?.message || "Error"));
  };

  const handleAddDam = () => {
    if (!newDam || !selectedRiver) return;
    axios.post(`${API_BASE}/dam`, { name: newDam, riverId: selectedRiver })
      .then(() => {
        setMessage(`Dam "${newDam}" added`);
        setNewDam("");
        return axios.get(`${API_BASE}/dams/${selectedRiver}`);
      })
      .then((res) => setDams(res.data))
      .catch((err) => setMessage(err.response?.data?.message || "Error"));
  };

  const featureCards = [
    { id: 1, icon: "🧠", title: "Core Dam Information", route: "/core-dam-info" },
    { id: 2, icon: "🌊", title: "Real-time Water Level & Flow", route: "/realtime" },
    { id: 3, icon: "📊", title: "Water Usage Information", route: "/water-usage" },
    { id: 4, icon: "🛰️", title: "Sensor & Telemetry Integration", route: "/sensors" },
    { id: 5, icon: "📁", title: "Supporting Information", route: "/supporting-info" },
    { id: 6, icon: "🔧", title: "Optional Advanced Features", route: "/features" },
    { id: 7, icon: "🚨", title: "Safety & Alert System", route: "/safety-alert" },
    { id: 8, icon: "📋", title: "Admin Data Management", route: "/admin-data" },
    { id: 9, icon: "📐", title: "Reservoir Geometry & Physical Characteristics", route: "/reservoir-geometry" },
    { id: 10, icon: "💧", title: "Storage & Capacity Parameters", route: "/storage-capacity" },
    { id: 11, icon: "🌤️", title: "Forecast & Meteorological Data", route: "/forecast-meteo" },
    { id: 12, icon: "🔮", title: "Predictive & Simulation Outputs", route: "/predictive-simulation" },
    { id: 13, icon: "📜", title: "Historical & Risk Reference Data", route: "/historical-risk" },
    { id: 14, icon: "🏗️", title: "Structural Health Monitoring", route: "/structural-health" },
    { id: 15, icon: "🚪", title: "Gate & Spillway Control System", route: "/gate-spillway" },
    { id: 16, icon: "⚠️", title: "Downstream Risk & Safety Parameters", route: "/downstream-risk" },
    { id: 17, icon: "🔷", title: "Basin-Level Aggregated Fields", route: "/basin-aggregated" }
  ];

  const handleCardClick = (card) => {
    if (selectedDam && card.route) {
      navigate(`${card.route}/${selectedDam}`);
    } else {
      setMessage("Please select a dam first");
    }
  };
  
  const handleDamSelect = (value) => {
    setSelectedDam(value);
    // Don't auto-navigate - let user choose which card to click
  };

  // Check if user is dam operator
  const isDamOperator = user?.role === "dam_operator";
  const canModifyData = user?.role === "admin" || user?.role === "govt" || isDamOperator;

  return (
    <div className="add-data-form">
      <h2>Add / Manage Dam Data</h2>

      {/* Show info message for dam operators */}
      {isDamOperator && user?.assignedDam && (
        <div className="info-message">
          🏗️ You are assigned to: <strong>{user.assignedDam.name}</strong>
          <br />
          You can only view and update data for your assigned dam.
        </div>
      )}

      <div className="form-row">
        <label>State</label>
        <div className="input-group">
          <select 
            onChange={(e) => setSelectedState(e.target.value)} 
            value={selectedState}
            disabled={isDamOperator}
          >
            <option value="">-- Select State --</option>
            {states.map((state) => (
              <option key={state._id} value={state._id}>{state.name}</option>
            ))}
          </select>
          <input
            type="text"
            placeholder="New state"
            value={newState}
            onChange={(e) => setNewState(e.target.value)}
            disabled={!canModifyData || isDamOperator}
          />
          <button 
            onClick={handleAddState}
            disabled={!canModifyData || isDamOperator}
          >
            +
          </button>
        </div>
      </div>

      <div className="form-row">
        <label>River</label>
        <div className="input-group">
          <select
            onChange={(e) => setSelectedRiver(e.target.value)}
            value={selectedRiver}
            disabled={!selectedState || isDamOperator}
          >
            <option value="">-- Select River --</option>
            {rivers.map((river) => (
              <option key={river._id} value={river._id}>{river.name}</option>
            ))}
          </select>
          <input
            type="text"
            placeholder="New river"
            value={newRiver}
            onChange={(e) => setNewRiver(e.target.value)}
            disabled={!selectedState || !canModifyData || isDamOperator}
          />
          <button 
            onClick={handleAddRiver} 
            disabled={!selectedState || !canModifyData || isDamOperator}
          >
            +
          </button>
        </div>
      </div>

      <div className="form-row">
        <label>Dam</label>
        <div className="input-group">
          <select
            onChange={(e) => handleDamSelect(e.target.value)}
            value={selectedDam}
            disabled={!selectedRiver || isDamOperator}
          >
            <option value="">-- Select Dam --</option>
            {dams.map((dam) => (
              <option key={dam._id} value={dam._id}>{dam.name}</option>
            ))}
          </select>
          <input
            type="text"
            placeholder="New dam"
            value={newDam}
            onChange={(e) => setNewDam(e.target.value)}
            disabled={!selectedRiver || !canModifyData || isDamOperator}
          />
          <button 
            onClick={handleAddDam} 
            disabled={!selectedRiver || !canModifyData || isDamOperator}
          >
            +
          </button>
        </div>
      </div>

      {selectedDam && (
        <div className="card-grid">
          {featureCards.map((card) => (
            <div
              key={card.id}
              className="feature-card"
              onClick={() => handleCardClick(card)}
            >
              <div className="card-icon">{card.icon}</div>
              <div className="card-title">{card.title}</div>
            </div>
          ))}
        </div>
      )}

      {message && <p className="message">{message}</p>}
    </div>
  );
};

export default AddDataForm;
