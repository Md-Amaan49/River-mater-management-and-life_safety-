// pages/RealtimeDamStatus.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "../styles/RealtimeDamStatus.css";

const API_BASE = "http://localhost:5000/api/data";

export default function RealtimeDamStatus() {
  const { damId } = useParams();
  const [status, setStatus] = useState(null);
  const [form, setForm] = useState({
    currentWaterLevel: "",
    levelUnit: "m",
    maxLevel: "",
    minLevel: "",
    inflowRate: "",
    outflowRate: "",
    spillwayDischarge: "",
    source: "manual",
    gateStatus: [{ gateNumber: 1, status: "closed", percentageOpen: 0 }],
  });
  const [msg, setMsg] = useState("");

  useEffect(() => {
    axios
      .get(`${API_BASE}/dam/${damId}/status`)
      .then((res) => {
        if (res.data) {
          setStatus(res.data);
          setForm((prev) => ({
            ...prev,
            ...res.data,
            gateStatus: res.data.gateStatus?.length
              ? res.data.gateStatus
              : prev.gateStatus,
          }));
        }
      })
      .catch(() => {}); // okay if no status exists
  }, [damId]);

  const onChange = (k, v) => setForm((prev) => ({ ...prev, [k]: v }));

  const save = async () => {
    try {
      // prepare clean payload
      const payload = { ...form, dam: damId };
      Object.keys(payload).forEach((k) => {
        if (payload[k] === "" || Number.isNaN(payload[k])) {
          payload[k] = null;
        }
      });

      // if status exists -> update, else -> create
      const res = status?._id
        ? await axios.put(`${API_BASE}/dam/${damId}/status`, payload)
        : await axios.post(`${API_BASE}/dam/${damId}/status`, payload);

      setStatus(res.data);
      setMsg("✅ Status saved successfully.");
    } catch (err) {
      console.error("Save error:", err.response?.data || err.message);
      setMsg("❌ Save failed.");
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Real-time Water Level & Flow</h2>

      <label className="flex flex-col">
        <span className="font-medium">Level Unit</span>
        <select
          value={form.levelUnit}
          onChange={(e) => onChange("levelUnit", e.target.value)}
          className="border rounded p-2"
        >
          <option value="m">m</option>
          <option value="%">%</option>
        </select>
      </label>
      <br />

      <div className="grid gap-4 max-w-lg bg-white shadow rounded-xl p-6">
        <label className="flex flex-col">
          <span className="font-medium">Current Water Level</span>
          <input
            value={form.currentWaterLevel || ""}
            onChange={(e) =>
              onChange("currentWaterLevel", e.target.value ? Number(e.target.value) : "")
            }
            type="number"
            placeholder="e.g., 52.3"
            className="border rounded p-2"
          />
        </label>

        <label className="flex flex-col">
          <span className="font-medium">Max Level (threshold)</span>
          <input
            value={form.maxLevel || ""}
            onChange={(e) =>
              onChange("maxLevel", e.target.value ? Number(e.target.value) : "")
            }
            type="number"
            className="border rounded p-2"
          />
        </label>

        <label className="flex flex-col">
          <span className="font-medium">Min Level (threshold)</span>
          <input
            value={form.minLevel || ""}
            onChange={(e) =>
              onChange("minLevel", e.target.value ? Number(e.target.value) : "")
            }
            type="number"
            className="border rounded p-2"
          />
        </label>

        <label className="flex flex-col">
          <span className="font-medium">Inflow Rate (m³/s)</span>
          <input
            value={form.inflowRate || ""}
            onChange={(e) =>
              onChange("inflowRate", e.target.value ? Number(e.target.value) : "")
            }
            type="number"
            className="border rounded p-2"
          />
        </label>

        <label className="flex flex-col">
          <span className="font-medium">Outflow Rate (m³/s)</span>
          <input
            value={form.outflowRate || ""}
            onChange={(e) =>
              onChange("outflowRate", e.target.value ? Number(e.target.value) : "")
            }
            type="number"
            className="border rounded p-2"
          />
        </label>

        <label className="flex flex-col">
          <span className="font-medium">Spillway Discharge (m³/s)</span>
          <input
            value={form.spillwayDischarge || ""}
            onChange={(e) =>
              onChange("spillwayDischarge", e.target.value ? Number(e.target.value) : "")
            }
            type="number"
            className="border rounded p-2"
          />
        </label>

        <label className="flex flex-col">
          <span className="font-medium">Gate 1 % Open</span>
          <input
            value={form.gateStatus?.[0]?.percentageOpen ?? 0}
            onChange={(e) =>
              onChange("gateStatus", [
                {
                  gateNumber: 1,
                  status: Number(e.target.value) > 0 ? "open" : "closed",
                  percentageOpen: Number(e.target.value),
                },
              ])
            }
            type="number"
            min="0"
            max="100"
            className="border rounded p-2"
          />
        </label>
      </div>

      <button onClick={save} className="update-button">
        Save
      </button>
      {msg && <p className="mb-4 font-medium">{msg}</p>}

      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-2">Latest Status</h3>
        <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
          {status ? JSON.stringify(status, null, 2) : "No data yet."}
        </pre>
      </div>
    </div>
  );
}
