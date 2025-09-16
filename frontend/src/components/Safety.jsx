import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "../styles/Safety.css";

const API_BASE = "http://localhost:5000/api/safety";

export default function Safety() {
  const { damId } = useParams();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const [form, setForm] = useState({
    floodRiskLevel: "Green",
    seepageReport: "",
    structuralHealth: {
      cracks: "",
      vibration: "",
      tilt: "",
    },
    earthquakeZone: "",
    maintenance: {
      lastInspection: "",
      nextInspection: "",
      reportFile: "", // store URL/path; actual file upload can be added later
    },
    emergencyContact: {
      authorityName: "",
      phone: "",
      email: "",
      address: "",
    },
  });

  // helper for nested updates
  const setNested = (path, value) => {
    setForm((prev) => {
      const clone = structuredClone(prev);
      const keys = path.split(".");
      let cur = clone;
      for (let i = 0; i < keys.length - 1; i++) cur = cur[keys[i]];
      cur[keys[keys.length - 1]] = value;
      return clone;
    });
  };

  useEffect(() => {
    let ignore = false;
    (async () => {
      setLoading(true);
      setMsg("");
      try {
        const { data } = await axios.get(`${API_BASE}/dam/${damId}`);
        if (ignore) return;
        // convert ISO dates to yyyy-mm-dd for input[type=date]
        const li = data?.maintenance?.lastInspection
          ? new Date(data.maintenance.lastInspection).toISOString().slice(0, 10)
          : "";
        const ni = data?.maintenance?.nextInspection
          ? new Date(data.maintenance.nextInspection).toISOString().slice(0, 10)
          : "";
        setForm({
          floodRiskLevel: data.floodRiskLevel ?? "Green",
          seepageReport: data.seepageReport ?? "",
          structuralHealth: {
            cracks: data?.structuralHealth?.cracks ?? "",
            vibration: data?.structuralHealth?.vibration ?? "",
            tilt: data?.structuralHealth?.tilt ?? "",
          },
          earthquakeZone: data?.earthquakeZone ?? "",
          maintenance: {
            lastInspection: li,
            nextInspection: ni,
            reportFile: data?.maintenance?.reportFile ?? "",
          },
          emergencyContact: {
            authorityName: data?.emergencyContact?.authorityName ?? "",
            phone: data?.emergencyContact?.phone ?? "",
            email: data?.emergencyContact?.email ?? "",
            address: data?.emergencyContact?.address ?? "",
          },
        });
      } catch (err) {
        if (err?.response?.status === 404) {
          // no safety yet — start blank
          setMsg("No safety info found yet. Create one below.");
        } else {
          console.error(err);
          setMsg("Failed to load safety info.");
        }
      } finally {
        setLoading(false);
      }
    })();
    return () => {
      ignore = true;
    };
  }, [damId]);

  const handleSave = async () => {
    setSaving(true);
    setMsg("");
    try {
      // convert yyyy-mm-dd back to Date on the fly
      const payload = {
        ...form,
        maintenance: {
          ...form.maintenance,
          lastInspection: form.maintenance.lastInspection
            ? new Date(form.maintenance.lastInspection)
            : null,
          nextInspection: form.maintenance.nextInspection
            ? new Date(form.maintenance.nextInspection)
            : null,
        },
      };
      await axios.put(`${API_BASE}/dam/${damId}`, payload);
      setMsg("✅ Safety info saved successfully.");
    } catch (err) {
      console.error(err);
      setMsg(err?.response?.data?.message || "❌ Save failed.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="safe-container">Loading safety info…</div>;

  return (
    <div className="safe-container">
      <div className="safe-header">
        <h2>Safety & Alert System</h2>
        <div className={`risk-pill ${form.floodRiskLevel.toLowerCase()}`}>
          Risk: {form.floodRiskLevel}
        </div>
      </div>

     

      {/* Flood Risk */}
      <div className="safe-section">
        <h3>Flood Risk Level</h3>
        <select
          value={form.floodRiskLevel}
          onChange={(e) => setNested("floodRiskLevel", e.target.value)}
        >
          <option>Green</option>
          <option>Yellow</option>
          <option>Orange</option>
          <option>Red</option>
          
        </select>
        <p className="hint">Use this to manually set risk; automation can be added from live thresholds.</p>
      </div>

      {/* Seepage */}
      <div className="safe-section">
        <h3>Seepage Reports</h3>
        <textarea
          rows={3}
          value={form.seepageReport}
          onChange={(e) => setNested("seepageReport", e.target.value)}
          placeholder="Notes on seepage observations/severity"
        />
      </div>

      {/* Structural Health */}
    
        <h3>Structural Health</h3>
        <div className="grid">
          <div className="card">
            <label>Cracks</label>
            <input
              value={form.structuralHealth.cracks}
              onChange={(e) => setNested("structuralHealth.cracks", e.target.value)}
              placeholder="e.g., none / hairline / observed"
            />
          </div>
          <div className="card">
            <label>Vibration</label>
            <input
              value={form.structuralHealth.vibration}
              onChange={(e) => setNested("structuralHealth.vibration", e.target.value)}
              placeholder="e.g., normal / high"
            />
          </div>
          <div className="card">
            <label>Tilt</label>
            <input
              value={form.structuralHealth.tilt}
              onChange={(e) => setNested("structuralHealth.tilt", e.target.value)}
              placeholder="e.g., normal / deviation observed"
            />
          </div>
        </div>
      

      {/* Earthquake */}
      <div className="safe-section">
        <h3>Earthquake Sensitivity / Zone</h3>
        <input
          value={form.earthquakeZone}
          onChange={(e) => setNested("earthquakeZone", e.target.value)}
          placeholder="e.g., Zone IV"
        />
      </div>

      {/* Maintenance */}
    
        <h3>Maintenance & Inspection</h3>
        <br />
        <div className="grid">
          <div className="card">
            <label>Last Inspection</label>
            <input
              type="date"
              value={form.maintenance.lastInspection}
              onChange={(e) => setNested("maintenance.lastInspection", e.target.value)}
            />
          </div>
          <div className="card">
            <label>Next Inspection</label>
            <input
              type="date"
              value={form.maintenance.nextInspection}
              onChange={(e) => setNested("maintenance.nextInspection", e.target.value)}
            />
          </div>
          <div className="card">
            <label>Report File (URL)</label>
            <input
              value={form.maintenance.reportFile}
              onChange={(e) => setNested("maintenance.reportFile", e.target.value)}
              placeholder="https://…/report.pdf"
            />
            <small>We can add actual file upload later.</small>
          </div>
        </div>
      

      {/* Emergency Contact */}
     
        <h3>Emergency Contact</h3>
        <br />
        <div className="grid">
          <div className="card">
            <label>Authority Name</label>
            <input
              value={form.emergencyContact.authorityName}
              onChange={(e) => setNested("emergencyContact.authorityName", e.target.value)}
            />
          </div>
          <div className="card">
            <label>Phone</label>
            <input
              value={form.emergencyContact.phone}
              onChange={(e) => setNested("emergencyContact.phone", e.target.value)}
            />
          </div>
          <div className="card">
            <label>Email</label>
            <input
              type="email"
              value={form.emergencyContact.email}
              onChange={(e) => setNested("emergencyContact.email", e.target.value)}
            />
          </div>
          <div className="card">
            <label>Address</label>
            <input
              value={form.emergencyContact.address}
              onChange={(e) => setNested("emergencyContact.address", e.target.value)}
            />
          </div>
        </div>
      
 {msg && <div className="safe-status">{msg}</div>}
      <div className="safe-actions">
        <button className="btn primary" onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save Safety Info"}
        </button>
      </div>
    </div>
  );
}
