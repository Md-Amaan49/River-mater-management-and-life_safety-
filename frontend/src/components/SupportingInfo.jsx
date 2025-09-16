// pages/SupportingInfo.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "../styles/SupportingInfo.css";

const API_BASE = "http://localhost:5000/api/supporting-info";

export default function SupportingInfo() {
  const { damId } = useParams();
  const [infos, setInfos] = useState([]);
  const [form, setForm] = useState({
    type: "guideline",
    title: "",
    description: "",
    location: "",
    dangerLevel: "",
  });
  const [msg, setMsg] = useState("");

  const fetchInfos = () => {
    axios
      .get(`${API_BASE}/dam/${damId}`)
      .then((res) => setInfos(res.data))
      .catch(() => setInfos([]));
  };

  useEffect(() => {
    if (damId) fetchInfos();
  }, [damId]);

  const onChange = (k, v) => setForm((prev) => ({ ...prev, [k]: v }));

  const save = () => {
    axios
      .post(`${API_BASE}/dam/${damId}`, form)
      .then(() => {
        setMsg("✅ Saved successfully.");
        setForm({
          type: "guideline",
          title: "",
          description: "",
          location: "",
          dangerLevel: "",
        });
        fetchInfos();
      })
      .catch((err) => {
        console.error(err);
        setMsg("❌ Save failed.");
      });
  };

  const del = (id) => {
    axios
      .delete(`${API_BASE}/${id}`)
      .then(() => fetchInfos())
      .catch(() => setMsg("❌ Delete failed."));
  };

  return (
    <div className="supporting-info-container">
      <h2>📁 Supporting Info</h2>
      {msg && <p className="message">{msg}</p>}

      <div className="supporting-form">
        <label>
          Type
          <select
            value={form.type}
            onChange={(e) => onChange("type", e.target.value)}
          >
            <option value="guideline">Guideline</option>
            <option value="publicSpot">Public Spot</option>
            <option value="prohibitedRegion">Prohibited Region</option>
          </select>
        </label>

        <label>
          Title
          <input
            value={form.title}
            onChange={(e) => onChange("title", e.target.value)}
            placeholder="Title"
          />
        </label>

        <label>
          Description
          <textarea
            value={form.description}
            onChange={(e) => onChange("description", e.target.value)}
            placeholder="Description"
          />
        </label>

        {form.type !== "guideline" && (
          <label>
            Location
            <input
              value={form.location}
              onChange={(e) => onChange("location", e.target.value)}
              placeholder="Location"
            />
          </label>
        )}

        {form.type === "prohibitedRegion" && (
          <label>
            Danger Level
            <input
              value={form.dangerLevel}
              onChange={(e) => onChange("dangerLevel", e.target.value)}
              placeholder="Danger Level"
            />
          </label>
        )}

        <button className="save-btn" onClick={save}>
          Save
        </button>
      </div>

      <hr />
      <h3>📌 Existing Supporting Info</h3>
      <ul className="info-list">
        {infos.map((info) => (
          <li key={info._id} className="info-item">
            <b>{info.type}</b>: {info.title} - {info.description}
            {info.location && ` | Location: ${info.location}`}
            {info.dangerLevel && ` | Danger: ${info.dangerLevel}`}
            <button
              className="delete-btn"
              onClick={() => del(info._id)}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
