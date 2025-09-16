// src/pages/SensorManagement.jsx
import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import "../styles/SensorManagement.css";
import { useNavigate, useParams } from "react-router-dom";

const API = "http://localhost:5000/api/sensors";

export default function SensorManagement() {
  // If you navigate to /sensors/:damId you can manage sensors for a dam
  const { damId: routeDamId } = useParams();
  const navigate = useNavigate();

  const [sensors, setSensors] = useState([]);
  const [filterDam, setFilterDam] = useState(routeDamId || "");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [polling, setPolling] = useState(false);

  const [form, setForm] = useState({
    damId: filterDam || "",
    sensorId: "",
    type: "level",
    unit: "m",
    status: "active",
    batteryStatus: "good",
    lastReading: 0,
  });

  const pollRef = useRef(null);

  useEffect(() => {
    // keep form.damId in sync when routeDamId exists
    if (routeDamId) setForm(f => ({ ...f, damId: routeDamId }));
  }, [routeDamId]);

  useEffect(() => {
    fetchSensors();
    return () => stopPolling();
    // eslint-disable-next-line
  }, [filterDam]);

  useEffect(() => {
    if (polling) startPolling();
    else stopPolling();
    return () => stopPolling();
    // eslint-disable-next-line
  }, [polling, filterDam]);

  async function fetchSensors() {
    setLoading(true);
    setMsg("");
    try {
      const q = filterDam ? `?damId=${filterDam}` : "";
      const res = await axios.get(`${API}${q}`);
      setSensors(res.data || []);
    } catch (err) {
      console.error("Fetch sensors error", err);
      setMsg("Failed to load sensors");
    } finally {
      setLoading(false);
    }
  }

  function startPolling() {
    if (pollRef.current) return;
    pollRef.current = setInterval(fetchSensors, 10000); // every 10s
  }

  function stopPolling() {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }

  const handleChange = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const resetForm = () =>
    setForm({
      damId: filterDam || "",
      sensorId: "",
      type: "level",
      unit: "m",
      status: "active",
      batteryStatus: "good",
      lastReading: 0,
    });

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.damId || !form.sensorId) {
      setMsg("Please provide damId and sensorId.");
      return;
    }
    setSaving(true);
    setMsg("");
    try {
      const res = await axios.post(API, form);
      setMsg("Sensor added");
      setForm(prev => ({ ...prev, sensorId: "" }));
      fetchSensors();
    } catch (err) {
      console.error("Add sensor", err);
      setMsg(err?.response?.data?.message || "Create failed");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (id, payload) => {
    setSaving(true);
    setMsg("");
    try {
      await axios.put(`${API}/${id}`, payload);
      setMsg("Updated");
      fetchSensors();
    } catch (err) {
      console.error("Update sensor", err);
      setMsg("Update failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this sensor?")) return;
    setSaving(true);
    setMsg("");
    try {
      await axios.delete(`${API}/${id}`);
      setMsg("Deleted");
      fetchSensors();
    } catch (err) {
      console.error("Delete sensor", err);
      setMsg("Delete failed");
    } finally {
      setSaving(false);
    }
  };

  // simulate telemetry -> update lastReading and lastSync via PUT
  const handleSendReading = async (id, value) => {
    setSaving(true);
    setMsg("");
    try {
      await axios.put(`${API}/${id}`, {
        lastReading: Number(value),
        lastSync: new Date().toISOString()
      });
      setMsg("Reading pushed");
      fetchSensors();
    } catch (err) {
      console.error("Push reading", err);
      setMsg("Failed to push reading");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="sm-container">
      <div className="sm-header">
        <h2>Sensor & Telemetry Management</h2>
        <div className="sm-controls">
          <input
            placeholder="Filter by damId (optional)"
            value={filterDam}
            onChange={(e) => setFilterDam(e.target.value)}
          />
          <button onClick={() => { setFilterDam(""); resetForm(); navigate("/sensors"); }}>
            Clear
          </button>
          <label className="poll-toggle">
            <input type="checkbox" checked={polling} onChange={(e) => setPolling(e.target.checked)} />
            Auto-refresh
          </label>
        </div>
      </div>

      {msg && <div className="sm-msg">{msg}</div>}

      <form className="sm-form" onSubmit={handleAdd}>
        <div className="sm-row">
          <input
            value={form.damId}
            onChange={(e) => handleChange("damId", e.target.value)}
            placeholder="Dam ID (required)"
          />
          <input
            value={form.sensorId}
            onChange={(e) => handleChange("sensorId", e.target.value)}
            placeholder="Sensor unique ID (required)"
          />
          <div className="card">
            <label>Sensor   Type</label>
          <select value={form.type} onChange={(e) => handleChange("type", e.target.value)}>
            <option value="level">level</option>
            <option value="flow">flow</option>
            <option value="seepage">seepage</option>
            <option value="vibration">vibration</option>
            <option value="weather">weather</option>
          </select>
          </div>
        </div>

        <div className="sm-row">
         <div className="card">
            <label>Unit</label>
          <input value={form.unit} onChange={(e) => handleChange("unit", e.target.value)} placeholder="Unit (m, m³/s, mm...)" />
         </div>
         <div className="card">
            <label>Sensor Status</label>
          <select value={form.status} onChange={(e) => handleChange("status", e.target.value)}>
            <option value="active">active</option>
            <option value="inactive">inactive</option>
            <option value="faulty">faulty</option>
          </select>
        </div>
        <div className="card">
            <label>Battery Status</label>
          <select value={form.batteryStatus} onChange={(e) => handleChange("batteryStatus", e.target.value)}>
            <option value="good">good</option>
            <option value="low">low</option>
            <option value="critical">critical</option>
          </select>
          </div>
        </div>

        <div className="sm-actions">
          <button type="submit" disabled={saving}>{saving ? "Saving..." : "Add Sensor"}</button>
          <button type="button" onClick={resetForm} className="secondary">Reset</button>
        </div>
      </form>

      <hr />

      <div className="sm-list">
        <h3>Registered Sensors {filterDam ? `(filter dam: ${filterDam})` : ""}</h3>
        {loading ? <div>Loading...</div> : (
          <table className="sm-table">
            <thead>
              <tr>
                <th>Sensor ID</th>
                <th>Dam</th>
                <th>Type</th>
                <th>Unit</th>
                <th>Status</th>
                <th>Battery</th>
                <th>Last Reading</th>
                <th>Last Sync</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sensors.length === 0 && <tr><td colSpan="9">No sensors found</td></tr>}
              {sensors.map(sensor => (
                <tr key={sensor._id}>
                  <td>{sensor.sensorId}</td>
                  <td>{sensor.damId || sensor.dam}</td>
                  <td>{sensor.type}</td>
                  <td>{sensor.unit}</td>
                  <td className={`status ${sensor.status}`}>{sensor.status}</td>
                  <td className={`battery ${sensor.batteryStatus}`}>{sensor.batteryStatus}</td>
                  <td>{sensor.lastReading ?? "-"}</td>
                  <td>{sensor.lastSync ? new Date(sensor.lastSync).toLocaleString() : "-"}</td>
                  <td className="actions">
                    <button onClick={() => {
                      const newVal = prompt("Enter reading value:", sensor.lastReading ?? 0);
                      if (newVal !== null) handleSendReading(sensor._id, newVal);
                    }}>Push Reading</button>

                    <button onClick={() => {
                      const newStatus = prompt("Set new status (active/inactive/faulty):", sensor.status);
                      if (newStatus) handleUpdate(sensor._id, { status: newStatus });
                    }}>Set Status</button>

                    <button onClick={() => {
                      const newBattery = prompt("Set battery (good/low/critical):", sensor.batteryStatus);
                      if (newBattery) handleUpdate(sensor._id, { batteryStatus: newBattery });
                    }}>Set Battery</button>

                    <button className="danger" onClick={() => handleDelete(sensor._id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );

  async function handleSendCalibration(id, val) {
    // confirm numeric
    const num = Number(val);
    if (Number.isNaN(num)) return setMsg("Invalid numeric reading");
    await handleSendReadingInternal(id, num);
  }

  // inner PUT wrapper (rename to avoid duplicate function name in top scope)
  async function handleSendReadingInternal(id, value) {
    setSaving(true);
    setMsg("");
    try {
      await axios.put(`${API}/${id}`, { lastReading: value, lastSync: new Date().toISOString() });
      setMsg("Reading updated");
      fetchSensors();
    } catch (err) {
      console.error("Push reading error", err);
      setMsg("Failed to update reading");
    } finally {
      setSaving(false);
    }
  }
}
