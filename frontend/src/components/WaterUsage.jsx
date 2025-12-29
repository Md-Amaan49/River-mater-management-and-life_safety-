import React, { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "../styles/WaterUsage.css";

const API_BASE = "https://river-water-management-and-life-safety.onrender.com/api/water-usage";

const emptyUsage = {
  irrigation: 0,
  drinking: 0,
  industrial: 0,
  hydropower: 0,
  evaporationLoss: 0,
  environmentalFlow: 0,
  farmingSupport: 0,
};

export default function WaterUsage() {
  const { damId } = useParams();
  const [usageId, setUsageId] = useState(null);
  const [usage, setUsage] = useState(emptyUsage);
  const [damName, setDamName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  // derived helper for display (sum of numeric usage fields except acreage)
  const totalAllocation = useMemo(() => {
    const { farmingSupport, ...rest } = usage;
    const nums = Object.values(rest).map(v => Number(v || 0));
    return nums.reduce((a, b) => a + b, 0);
  }, [usage]);

  useEffect(() => {
    let ignore = false;
    async function fetchUsage() {
      setLoading(true);
      setMsg("");
      try {
        const { data } = await axios.get(`${API_BASE}/${damId}`);
        if (ignore) return;
        // backend returns populated dam when available
        setUsageId(data?._id || null);
        setUsage({
          irrigation: data?.irrigation ?? 0,
          drinking: data?.drinking ?? 0,
          industrial: data?.industrial ?? 0,
          hydropower: data?.hydropower ?? 0,
          evaporationLoss: data?.evaporationLoss ?? 0,
          environmentalFlow: data?.environmentalFlow ?? 0,
          farmingSupport: data?.farmingSupport ?? 0,
        });
        setDamName(
          data?.damId?.name ||
          data?.dam?.name ||
          data?.damName ||
          ""
        );
      } catch (err) {
        // If 404 (no usage yet), start with empty usage
        if (err?.response?.status === 404) {
          setUsageId(null);
          setUsage(emptyUsage);
          setDamName("");
        } else {
          console.error("Fetch usage error:", err);
          setMsg("Failed to load water usage info.");
        }
      } finally {
        setLoading(false);
      }
    }
    fetchUsage();
    return () => { ignore = true; };
  }, [damId]);

  const handleChange = (field, val) => {
    // keep numbers numeric
    const num = val === "" ? "" : Number(val);
    setUsage(prev => ({ ...prev, [field]: Number.isNaN(num) ? 0 : num }));
  };

  const handleSave = async () => {
    setSaving(true);
    setMsg("");
    try {
      if (usageId) {
        const { data } = await axios.put(`${API_BASE}/${usageId}`, usage);
        setMsg("✅ Usage updated successfully.");
        setUsageId(data._id);
      } else {
        const payload = { damId, ...usage };
        const { data } = await axios.post(`${API_BASE}`, payload);
        setMsg("✅ Usage created successfully.");
        setUsageId(data._id);
      }
    } catch (err) {
      console.error("❌ Save usage error:", err);
      setMsg(err?.response?.data?.message || "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setUsage(emptyUsage);
    setMsg("");
  };

  if (loading) return <div className="wu-container">Loading usage...</div>;

  return (
    <div className="wu-container">
      <div className="wu-header">
        <h2>Water Usage Information</h2>
        {damName && <span className="wu-dam-pill">Dam: {damName}</span>}
      </div>

     

      <div className="wu-grid">
        <div className="wu-card">
          <label>Irrigation</label>
          <input
            type="number"
            step="any"
            value={usage.irrigation}
            onChange={e => handleChange("irrigation", e.target.value)}
            placeholder="e.g., 120 (MCM or %)"
          />
          <small>Volume (MCM) or % of allocation</small>
        </div>

        <div className="wu-card">
          <label>Residential</label>
          <input
            type="number"
            step="any"
            value={usage.drinking}
            onChange={e => handleChange("drinking", e.target.value)}
            placeholder="e.g., 40"
          />
          <small>Urban/rural supply</small>
        </div>

        <div className="wu-card">
          <label>Industrial</label>
          <input
            type="number"
            step="any"
            value={usage.industrial}
            onChange={e => handleChange("industrial", e.target.value)}
            placeholder="e.g., 25"
          />
          <small>Industrial consumption</small>
        </div>

        <div className="wu-card">
          <label>Hydropower</label>
          <input
            type="number"
            step="any"
            value={usage.hydropower}
            onChange={e => handleChange("hydropower", e.target.value)}
            placeholder="e.g., 18"
          />
          <small>MW or water-equivalent</small>
        </div>

        <div className="wu-card">
          <label>Evaporation Loss</label>
          <input
            type="number"
            step="any"
            value={usage.evaporationLoss}
            onChange={e => handleChange("evaporationLoss", e.target.value)}
            placeholder="e.g., 5"
          />
          <small>Estimated seasonal loss</small>
        </div>

        <div className="wu-card">
          <label>Environmental Flow</label>
          <input
            type="number"
            step="any"
            value={usage.environmentalFlow}
            onChange={e => handleChange("environmentalFlow", e.target.value)}
            placeholder="e.g., 10"
          />
          <small>River ecosystem release</small>
        </div>

        <div className="wu-card">
          <label>Farming Support (Acreage)</label>
          <input
            type="number"
            step="any"
            value={usage.farmingSupport}
            onChange={e => handleChange("farmingSupport", e.target.value)}
            placeholder="e.g., 15000"
          />
          <small>Hectares/Acres supported</small>
        </div>
      </div>

            {msg && <div className="wu-status">{msg}</div>}

      <div className="wu-summary">
        <div className="wu-total">
          <span>Total (excl. acreage): </span>
          <strong>{totalAllocation}</strong>
        </div>
        <div className="wu-actions">
          <button className="wu-btn secondary" onClick={handleReset} disabled={saving}>
            Reset
          </button>
          <button className="wu-btn primary" onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : (usageId ? "Update" : "Create")}
          </button>
        </div>
      </div>
    </div>
  );
}
