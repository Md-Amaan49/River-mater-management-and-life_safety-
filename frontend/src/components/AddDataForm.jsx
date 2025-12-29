import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
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

  const API_BASE = "https://river-water-management-and-life-safety.onrender.com/api/data";

  useEffect(() => {
    axios.get(`${API_BASE}/states`).then((res) => setStates(res.data));
  }, []);

  useEffect(() => {
    if (selectedState) {
      axios.get(`${API_BASE}/rivers/${selectedState}`).then((res) => setRivers(res.data));
      setSelectedRiver("");
      setSelectedDam("");
      setDams([]);
    }
  }, [selectedState]);

  useEffect(() => {
    if (selectedRiver) {
      axios.get(`${API_BASE}/dams/${selectedRiver}`).then((res) => setDams(res.data));
      setSelectedDam("");
    }
  }, [selectedRiver]);

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
    { id: 1, icon: "🧠", title: "Core Dam Information" },
    { id: 2, icon: "🌊", title: "Real-time Water Level & Flow" },
    { id: 3, icon: "📊", title: "Water Usage Information" },
    { id: 4, icon: "🛰️", title: "Sensor & Telemetry Integration" },
    { id: 5, icon: "📁", title: "Supporting Information" },
    { id: 6, icon: "🔧", title: "Optional Advanced Features" },
    { id: 7, icon: "🚨", title: "Safety & Alert System" },
    { id: 8, icon: "📋", title: "Admin Data Management" }
  ];

  const handleCardClick = (cardId) => {
    if (cardId === 1 && selectedDam) {
      navigate(`/core-dam-info/${selectedDam}`);
    }
    else if (cardId === 2 && selectedDam) {
      navigate(`/realtime/${selectedDam}`);
    }
    else if (cardId === 3 && selectedDam) {
      navigate(`/water-usage/${selectedDam}`);
    }
    else if (cardId === 4 && selectedDam) {
      navigate(`/sensors/${selectedDam}`);
    }
    else if (cardId === 5 && selectedDam) {
      navigate(`/supporting-info/${selectedDam}`);
    }
    else if (cardId === 6 && selectedDam) {
      navigate(`/features/${selectedDam}`);
    }
    else if (cardId === 7 && selectedDam) {
      navigate(`/safety/${selectedDam}`);
    }
    else if (cardId === 8 && selectedDam) {
      navigate(`/admin-data/${selectedDam}`);
    }
    else {
      console.log(`Feature ${cardId} clicked`);
    }
  };
  const handleDamSelect = (value) => {
  setSelectedDam({ ...value, _id: value._id });
  navigate(`/core-dam-info/${value._id}`); // 👈 Add this line
};


  return (
    <div className="add-data-form">
      <h2>Add / Manage Dam Data</h2>

      <div className="form-row">
        <label>State</label>
        <div className="input-group">
          <select onChange={(e) => setSelectedState(e.target.value)} value={selectedState}>
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
          />
          <button onClick={handleAddState}>+</button>
        </div>
      </div>

      <div className="form-row">
        <label>River</label>
        <div className="input-group">
          <select
            onChange={(e) => setSelectedRiver(e.target.value)}
            value={selectedRiver}
            disabled={!selectedState}
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
            disabled={!selectedState}
          />
          <button onClick={handleAddRiver} disabled={!selectedState}>+</button>
        </div>
      </div>

      <div className="form-row">
        <label>Dam</label>
        <div className="input-group">
          <select
            onChange={(e) => setSelectedDam(e.target.value)}
            value={selectedDam}
            disabled={!selectedRiver}
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
            disabled={!selectedRiver}
          />
          <button onClick={handleAddDam} disabled={!selectedRiver}>+</button>
        </div>
      </div>

      {selectedDam && (
        <div className="card-grid">
          {featureCards.map((card) => (
            <div
              key={card.id}
              className="feature-card"
              onClick={() => handleCardClick(card.id)}
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
