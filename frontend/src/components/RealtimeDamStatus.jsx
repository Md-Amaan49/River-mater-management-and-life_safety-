// pages/RealtimeDamStatus.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/RealtimeDamStatus.css";

const API_BASE = "https://river-water-management-and-life-safety.onrender.com/api/data";
const USER_API = "https://river-water-management-and-life-safety.onrender.com/api/users";

export default function RealtimeDamStatus() {
  const { damId } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const authHeader = token ? { Authorization: `Bearer ${token}` } : undefined;

  const [status, setStatus] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [form, setForm] = useState({
    currentWaterLevel: "",
    levelUnit: "m",
    maxLevel: "",
    minLevel: "",
    inflowRate: "",
    outflowRate: "",
    rainfallRate: "",
    evaporationRate: "",
    inflowFromUpstreamDam: "",
    outflowToDownstreamDam: "",
    upstreamRiverVelocity: "",
    downstreamRiverVelocity: "",
    downstreamSafeDischargeLimit: "",
    minimumEnvironmentalFlowRequirement: "",
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

    // Check if dam is saved
    if (token) {
      axios.get(`${USER_API}/saved-dams`, { headers: authHeader })
        .then((res) => {
          const savedDams = res.data || [];
          const isCurrentDamSaved = savedDams.some(item => {
            const dam = item.dam || item;
            return String(dam._id) === String(damId);
          });
          setIsSaved(isCurrentDamSaved);
        })
        .catch((err) => console.error("Error checking saved status:", err));
    }
  }, [damId, token]);

  const onChange = (k, v) => setForm((prev) => ({ ...prev, [k]: v }));

  // Calculate totalInflow and spillwayDischarge
  const calculateTotalInflow = () => {
    const inflowRate = form.inflowRate || 0;
    const inflowFromUpstream = form.inflowFromUpstreamDam || 0;
    const rainfall = form.rainfallRate || 0;
    return inflowRate + inflowFromUpstream + rainfall;
  };

  const calculateSpillwayDischarge = () => {
    const outflowRate = form.outflowRate || 0;
    const outflowToDownstream = form.outflowToDownstreamDam || 0;
    return outflowRate + outflowToDownstream;
  };

  // Toggle save dam
  const toggleSave = async () => {
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      await axios.patch(`${USER_API}/saved-dams/${damId}`, {}, { headers: authHeader });
      setIsSaved(!isSaved);
    } catch (err) {
      console.error("Error toggling save:", err);
    }
  };

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
      <div className="realtime-header">
        <h2 className="text-2xl font-bold mb-4">Real-time Water Level & Flow</h2>
        <div className="header-actions">
          {token && (
            <button
              className={`save-btn ${isSaved ? "saved" : ""}`}
              onClick={toggleSave}
              title={isSaved ? "Unsave Dam" : "Save Dam"}
            >
              {isSaved ? "★ Saved" : "☆ Save Dam"}
            </button>
          )}
          <button 
            className="details-btn"
            onClick={() => navigate(`/core-dam-info/${damId}`)}
          >
            View Details
          </button>
        </div>
      </div>

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
          <span className="font-medium">Rainfall Rate (m³/s)</span>
          <input
            value={form.rainfallRate || ""}
            onChange={(e) =>
              onChange("rainfallRate", e.target.value ? Number(e.target.value) : "")
            }
            type="number"
            step="0.01"
            placeholder="e.g., 15.5"
            className="border rounded p-2"
          />
        </label>

        <label className="flex flex-col">
          <span className="font-medium">Evaporation Rate (m³/s)</span>
          <input
            value={form.evaporationRate || ""}
            onChange={(e) =>
              onChange("evaporationRate", e.target.value ? Number(e.target.value) : "")
            }
            type="number"
            step="0.01"
            placeholder="e.g., 5.2"
            className="border rounded p-2"
          />
        </label>

        <label className="flex flex-col">
          <span className="font-medium">Total Inflow (m³/s) - Calculated</span>
          <input
            value={calculateTotalInflow().toFixed(2)}
            type="number"
            className="border rounded p-2 bg-gray-100"
            readOnly
            disabled
          />
          <span className="text-xs text-gray-500 mt-1">
            = Inflow Rate + Inflow from Upstream + Rainfall Rate
          </span>
        </label>

        <label className="flex flex-col">
          <span className="font-medium">Spillway Discharge (m³/s) - Calculated</span>
          <input
            value={calculateSpillwayDischarge().toFixed(2)}
            type="number"
            className="border rounded p-2 bg-gray-100"
            readOnly
            disabled
          />
          <span className="text-xs text-gray-500 mt-1">
            = Outflow Rate + Outflow to Downstream
          </span>
        </label>

        <label className="flex flex-col">
          <span className="font-medium">Inflow from Upstream Dam (m³/s)</span>
          <input
            value={form.inflowFromUpstreamDam || ""}
            onChange={(e) =>
              onChange("inflowFromUpstreamDam", e.target.value ? Number(e.target.value) : "")
            }
            type="number"
            step="0.01"
            placeholder="e.g., 125.5"
            className="border rounded p-2"
          />
        </label>

        <label className="flex flex-col">
          <span className="font-medium">Outflow to Downstream Dam (m³/s)</span>
          <input
            value={form.outflowToDownstreamDam || ""}
            onChange={(e) =>
              onChange("outflowToDownstreamDam", e.target.value ? Number(e.target.value) : "")
            }
            type="number"
            step="0.01"
            placeholder="e.g., 98.3"
            className="border rounded p-2"
          />
        </label>

        <label className="flex flex-col">
          <span className="font-medium">Upstream River Velocity (m/s)</span>
          <input
            value={form.upstreamRiverVelocity || ""}
            onChange={(e) =>
              onChange("upstreamRiverVelocity", e.target.value ? Number(e.target.value) : "")
            }
            type="number"
            step="0.01"
            placeholder="e.g., 2.5"
            className="border rounded p-2"
          />
        </label>

        <label className="flex flex-col">
          <span className="font-medium">Downstream River Velocity (m/s)</span>
          <input
            value={form.downstreamRiverVelocity || ""}
            onChange={(e) =>
              onChange("downstreamRiverVelocity", e.target.value ? Number(e.target.value) : "")
            }
            type="number"
            step="0.01"
            placeholder="e.g., 3.2"
            className="border rounded p-2"
          />
        </label>

        {/* Environmental and Safety Limits Section */}
        <div className="col-span-full mt-4 pt-4 border-t-2 border-blue-200">
          <h3 className="text-lg font-semibold text-blue-600 mb-3">Environmental & Safety Limits</h3>
        </div>

        <label className="flex flex-col">
          <span className="font-medium">Downstream Safe Discharge Limit (m³/s)</span>
          <input
            value={form.downstreamSafeDischargeLimit || ""}
            onChange={(e) =>
              onChange("downstreamSafeDischargeLimit", e.target.value ? Number(e.target.value) : "")
            }
            type="number"
            step="0.01"
            placeholder="e.g., 500.0"
            className="border rounded p-2"
          />
          <span className="text-xs text-gray-500 mt-1">
            Maximum safe discharge rate to prevent downstream flooding
          </span>
        </label>

        <label className="flex flex-col">
          <span className="font-medium">Minimum Environmental Flow Requirement (m³/s)</span>
          <input
            value={form.minimumEnvironmentalFlowRequirement || ""}
            onChange={(e) =>
              onChange("minimumEnvironmentalFlowRequirement", e.target.value ? Number(e.target.value) : "")
            }
            type="number"
            step="0.01"
            placeholder="e.g., 25.0"
            className="border rounded p-2"
          />
          <span className="text-xs text-gray-500 mt-1">
            Minimum flow required to maintain ecosystem health
          </span>
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
