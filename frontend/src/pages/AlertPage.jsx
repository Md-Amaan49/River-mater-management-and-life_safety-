import React, { useEffect, useMemo, useState, useRef } from "react";
import axios from "axios";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import "../styles/AlertPage.css";
import { useNavigate } from "react-router-dom";

const BASE_API = "https://river-water-management-and-life-safety.onrender.com/api";     // server base
const DATA_API = `${BASE_API}/data`;               // states/rivers/dams endpoints
const USER_API = `${BASE_API}/users`;              // saved-dams endpoint
const SAFETY_API = `${BASE_API}/safety`;           // safety endpoints

// clamp 0..100
const clampPct = (v) => {
  const n = Number(v) || 0;
  return Math.max(0, Math.min(100, Math.round(n)));
};

// compute three safety-related metrics for circular widgets
function computeSafetyMetrics(safety) {
  if (!safety) {
    return {
      riskPct: 0, riskLabel: "—",
      structPct: 0, structLabel: "—",
      maintenancePct: 0, maintenanceLabel: "—",
      alert: "green",
    };
  }

  // Flood Risk mapping
  const riskMap = { Green: 20, Yellow: 65, Red: 100 };
  const riskLevel = (safety.floodRiskLevel || "Green");
  const riskPct = clampPct(riskMap[riskLevel] ?? 0);
  const riskLabel = riskLevel;

  // Structural health score: percent of structural fields present (simple heuristic)
  const sh = safety.structuralHealth || {};
  const structFields = ["cracks", "vibration", "tilt"];
  let presentCount = 0;
  for (const f of structFields) {
    const v = sh[f];
    if (v !== undefined && v !== null && String(v).trim() !== "") presentCount += 1;
  }
  const structPct = clampPct(Math.round((presentCount / structFields.length) * 100));
  // Short structural label: combine short notes or generic statuses
  let structLabel = "OK";
  if (presentCount === 0) structLabel = "No data";
  else {
    const parts = structFields.map(f => sh[f] ? `${f[0].toUpperCase()+f.slice(1)}:${String(sh[f]).slice(0,10)}` : null)
                             .filter(Boolean);
    structLabel = parts.join(", ");
  }

  // Maintenance progress: proportion of time elapsed between lastInspection -> nextInspection
  let maintenancePct = 0;
  let maintenanceLabel = "—";
  const m = safety.maintenance || {};
  const last = m.lastInspection ? new Date(m.lastInspection) : null;
  const next = m.nextInspection ? new Date(m.nextInspection) : null;
  if (last && next && !isNaN(last.getTime()) && !isNaN(next.getTime())) {
    const now = Date.now();
    const total = next.getTime() - last.getTime();
    const elapsed = now - last.getTime();
    const frac = total > 0 ? (elapsed / total) : 0;
    maintenancePct = clampPct(Math.round(frac * 100));
    const lastStr = last.toLocaleDateString();
    const nextStr = next.toLocaleDateString();
    maintenanceLabel = `${lastStr} → ${nextStr}`;
  } else if (last && !next) {
    maintenancePct = 50;
    maintenanceLabel = `Last: ${last.toLocaleDateString()}`;
  } else {
    maintenancePct = 0;
    maintenanceLabel = "No schedule";
  }

  let alert = "green";
  if (riskLevel.toLowerCase() === "red") alert = "red";
  else if (riskLevel.toLowerCase() === "yellow") alert = "yellow";

  return {
    riskPct, riskLabel,
    structPct, structLabel,
    maintenancePct, maintenanceLabel,
    alert,
  };
}

// Alert card (mirrors DamCard layout from WaterLevel)
function AlertCard({ dam, safety, saved, onToggleSave, onView }) {
  const metrics = useMemo(() => computeSafetyMetrics(safety), [safety]);

  const stateName = dam.state || dam.stateName || dam._stateName || "";
  const riverName = dam.riverName || dam.river || dam._riverName || "";

  return (
    <div className="dam-card">
      <div className="dam-card-top">
        <div className="dam-path">{stateName ? `${stateName} / ` : ""}{riverName ? `${riverName} / ` : ""}<strong>{dam.name}</strong></div>
        <button
          className={`save-btn ${saved ? "saved" : ""}`}
          onClick={() => onToggleSave?.(dam._id)}
          title={saved ? "Unsave" : "Save"}
        >
          {saved ? "★" : "☆"}
        </button>
      </div>

      <div className="charts-row">
        <div className="chart-block">
          <CircularProgressbar
            value={metrics.riskPct}
            text={`${metrics.riskPct}%`}
            styles={buildStyles({ textSize: "18px" })}
          />
          <div className="chart-label">Flood Risk ({metrics.riskLabel})</div>
        </div>

        <div className="chart-block">
          <CircularProgressbar
            value={metrics.structPct}
            text={`${metrics.structPct}%`}
            styles={buildStyles({ textSize: "18px" })}
          />
          <div className="chart-label">Structural ({metrics.structLabel})</div>
        </div>

        <div className="chart-block">
          <CircularProgressbar
            value={metrics.maintenancePct}
            text={`${metrics.maintenancePct}%`}
            styles={buildStyles({ textSize: "18px" })}
          />
          <div className="chart-label">Maintenance ({metrics.maintenanceLabel})</div>
        </div>
      </div>

      <div className="card-footer">
        <div className={`flag flag-${metrics.alert}`}>{metrics.alert.toUpperCase()}</div>
        <div className="actions">
          <button className="view-btn" onClick={() => onView?.(dam._id)}>View Dam</button>
        </div>
      </div>

      {/* expanded details shown below charts (exact fields requested) */}
      <div style={{ marginTop: 8, borderTop: "1px solid #eef2ff", paddingTop: 8 }}>
        {safety ? (
          <>
            <div style={{ fontSize: 13, color: "#334155", marginBottom: 6 }}>
              <strong>Seepage:</strong> {safety.seepageReport || "N/A"}
            </div>

            <div style={{ fontSize: 13, color: "#334155", marginBottom: 6 }}>
              <strong>Earthquake Zone:</strong> {safety.earthquakeZone || "N/A"}
            </div>

            <div style={{ fontSize: 13, color: "#334155", marginBottom: 6 }}>
              <strong>Emergency Contact:</strong><br />
              <span>{safety.emergencyContact?.authorityName || "N/A"}</span><br />
              <span>{safety.emergencyContact?.phone || ""} {safety.emergencyContact?.email ? `• ${safety.emergencyContact.email}` : ""}</span><br />
              <span>{safety.emergencyContact?.address || ""}</span>
            </div>

            <div style={{ fontSize: 13 }}>
              <strong>Maintenance Report:</strong>
              <div>
                {safety.maintenance?.reportFile ? (
                  <a href={`${BASE_API}/uploads/${safety.maintenance.reportFile}`} target="_blank" rel="noreferrer">View Report</a>
                ) : " N/A"}
              </div>
            </div>
          </>
        ) : (
          <div style={{ fontSize: 13, color: "#6b7280" }}>No safety data available.</div>
        )}
      </div>
    </div>
  );
}

export default function AlertPage() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const authHeader = token ? { Authorization: `Bearer ${token}` } : undefined;

  const [tab, setTab] = useState("saved"); // 'saved' | 'all'
  const [loading, setLoading] = useState(false);
  const [secretOnly, setSecretOnly] = useState(false);

  // Saved entries: array of { dam, safety }
  const [savedList, setSavedList] = useState([]);
  const [savedIds, setSavedIds] = useState(new Set());

  // All-dams drilldowns
  const [states, setStates] = useState([]);
  const [rivers, setRivers] = useState([]);
  const [damsEnriched, setDamsEnriched] = useState([]); // [{ dam, safety }]
  const [selectedState, setSelectedState] = useState("");
  const [selectedRiver, setSelectedRiver] = useState("");
  const [selectedDam, setSelectedDam] = useState("");

  // cache for safety to avoid duplicate requests
  const safetyCacheRef = useRef(new Map());

  // -----------------------------------------
  // fetch safety for dam (with cache)
  const fetchSafetyForDam = async (damId) => {
    const cache = safetyCacheRef.current;
    if (cache.has(damId)) return cache.get(damId);
    try {
      const res = await axios.get(`${SAFETY_API}/dam/${damId}`);
      cache.set(damId, res.data);
      return res.data;
    } catch (err) {
      cache.set(damId, null);
      return null;
    }
  };

  // Fetch saved dams for user and enrich with safety
  const fetchSavedDams = async () => {
    setLoading(true);
    try {
      if (!token) {
        setSavedList([]);
        setSavedIds(new Set());
        setLoading(false);
        return;
      }
      const res = await axios.get(`${USER_API}/saved-dams`, { headers: authHeader });
      const data = res.data || [];

      // If API returns shape [{ dam: {...}, ...}, ...]
      if (data.length && data[0].dam) {
        // enrich with safety if not provided
        const enriched = await Promise.all(data.map(async (r) => {
          const dam = r.dam;
          const safety = r.safety ?? r.latestSafety ?? r.latestStatus ?? await fetchSafetyForDam(dam._id);
          return { dam, safety: safety || null };
        }));
        setSavedList(enriched);
        setSavedIds(new Set(data.map(r => String(r.dam._id))));
      } else {
        // array of dams
        const damsArr = data;
        const enriched = await Promise.all(damsArr.map(async (d) => {
          const safety = await fetchSafetyForDam(d._id);
          return { dam: d, safety: safety || null };
        }));
        setSavedList(enriched);
        setSavedIds(new Set(damsArr.map(d => String(d._id))));
      }
    } catch (err) {
      console.error("Error fetching saved dams (alerts):", err);
      setSavedList([]);
      setSavedIds(new Set());
    } finally {
      setLoading(false);
    }
  };

  // Fetch states / rivers / dams (same as WaterLevel)
  const fetchStates = async () => {
    try {
      const res = await axios.get(`${DATA_API}/states`);
      setStates(res.data || []);
    } catch (err) {
      console.error("Error fetching states:", err);
      setStates([]);
    }
  };

  const fetchRivers = async (stateId) => {
    try {
      const res = await axios.get(`${DATA_API}/rivers/${stateId}`);
      setRivers(res.data || []);
    } catch (err) {
      console.error("Error fetching rivers:", err);
      setRivers([]);
    }
  };

  const fetchDamsByRiver = async (riverId) => {
    try {
      const res = await axios.get(`${DATA_API}/dams/${riverId}`);
      const damsRaw = res.data || [];
      const enriched = await Promise.all(damsRaw.map(async (d) => {
        const damDoc = d.dam ? d.dam : d;
        const safety = await fetchSafetyForDam(damDoc._id);
        return { dam: damDoc, safety: safety || null };
      }));
      setDamsEnriched(enriched);
    } catch (err) {
      console.error("Error fetching dams by river:", err);
      setDamsEnriched([]);
    }
  };

  const fetchDamsByState = async (stateId) => {
    try {
      setDamsEnriched([]);
      const riversRes = await axios.get(`${DATA_API}/rivers/${stateId}`);
      const riversList = riversRes.data || [];
      const allDams = [];
      for (const r of riversList) {
        try {
          const dr = await axios.get(`${DATA_API}/dams/${r._id}`);
          const arr = dr.data || [];
          for (const d of arr) {
            const damDoc = d.dam ? d.dam : d;
            allDams.push({ dam: damDoc, river: r });
          }
        } catch (e) {
          console.warn("Error fetching dams for river", r._id, e);
        }
      }

      const enriched = await Promise.all(allDams.map(async (pair) => {
        const safety = await fetchSafetyForDam(pair.dam._id);
        const DamWithMeta = {
          ...pair.dam,
          riverName: pair.river?.name || pair.dam.riverName || pair.dam.river,
          state: states.find(s => s._id === stateId)?.name || pair.dam.state || "",
        };
        return { dam: DamWithMeta, safety: safety || null };
      }));
      setDamsEnriched(enriched);
    } catch (err) {
      console.error("Error fetching dams by state:", err);
      setDamsEnriched([]);
    }
  };

  // Toggle saved/unsave (same endpoint as WaterLevel)
  const toggleSave = async (damId) => {
    if (!token) {
      navigate("/login");
      return;
    }
    try {
      await axios.patch(`${USER_API}/saved-dams/${damId}`, {}, { headers: authHeader });

      // optimistic update
      setSavedIds(prev => {
        const newSet = new Set(prev);
        if (newSet.has(damId)) newSet.delete(damId);
        else newSet.add(damId);
        return newSet;
      });

      // refresh saved list
      fetchSavedDams();
    } catch (err) {
      console.error("Error toggling save for alert:", err);
    }
  };

  const viewDam = (damId) => {
    navigate(`/core-dam-info/${damId}`);
  };

  const toggleSecret = () => setSecretOnly(s => !s);

  const applySecretFilter = (arr) => {
    if (!secretOnly) return arr;
    return arr.filter(item => {
      const s = item.safety;
      if (!s) return false;
      return (String(s.floodRiskLevel || "").toLowerCase() === "red");
    });
  };

  // On mount or when tab changes
  useEffect(() => {
    fetchStates();
    if (tab === "saved") fetchSavedDams();
    // clear selections
    setSelectedState("");
    setSelectedRiver("");
    setSelectedDam("");
    setDamsEnriched([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  useEffect(() => {
    if (!selectedState) {
      setRivers([]);
      setDamsEnriched([]);
      setSelectedRiver("");
      setSelectedDam("");
      return;
    }
    fetchRivers(selectedState);
    fetchDamsByState(selectedState);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedState]);

  useEffect(() => {
    if (!selectedRiver) {
      setSelectedDam("");
      return;
    }
    fetchDamsByRiver(selectedRiver);
    setSelectedDam("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRiver]);

  useEffect(() => {
    if (!selectedDam) return;
    // nothing special required here — dropdown narrows the view
  }, [selectedDam]);

  // Derived arrays for rendering
  const savedDisplay = applySecretFilter(savedList);
  const allDisplay = useMemo(() => {
    let list = damsEnriched;
    if (selectedDam) {
      list = list.filter(x => (x.dam._id || x.dam.id || String(x.dam._id)) === selectedDam);
    } else if (selectedRiver) {
      list = damsEnriched;
    } else if (selectedState) {
      list = damsEnriched;
    }
    return applySecretFilter(list);
  }, [damsEnriched, selectedDam, selectedRiver, selectedState, secretOnly]);

  return (
<div className="waterlevel-page">
    {/* Page Title */}
    <h1 className="page-title">🚨 Alerts</h1>

    <div className="top-buttons">
      <button className={tab === "saved" ? "active" : ""} onClick={() => setTab("saved")}>Saved Dams</button>
      <button className={tab === "all" ? "active" : ""} onClick={() => setTab("all")}>All Dams</button>
      <div className="right-actions">
        <button className="secret-filter" onClick={toggleSecret}>{secretOnly ? "Show All" : "SECRET FILTER"}</button>
      </div>
    </div>

      {loading && <div className="loading">Loading…</div>}

      {/* Saved Dams tab */}
      {tab === "saved" && (
        <div className="section">
          <h2 className="section-title">Saved Dams</h2>

          {!token ? (
            <div className="not-logged">
              <p>Please login or create an account to see your saved dams (alerts).</p>
              <div className="auth-buttons">
                <button onClick={() => navigate("/login")} className="btn">Login</button>
                <button onClick={() => navigate("/signup")} className="btn btn-outline">Create Account</button>
              </div>
            </div>
          ) : (
            <>
              {!savedDisplay.length ? (
                <div className="no-dams">No saved dams.</div>
              ) : (
                <div className="dam-grid">
                  {savedDisplay.map(({ dam, safety }) => (
                    <AlertCard
                      key={dam._id}
                      dam={dam}
                      safety={safety}
                      saved={savedIds.has(String(dam._id))}
                      onToggleSave={toggleSave}
                      onView={viewDam}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* All Dams tab */}
      {tab === "all" && (
        <div className="section">
          <h2 className="section-title">All Dams</h2>

          <div className="filters">
            <select value={selectedState} onChange={(e) => setSelectedState(e.target.value)}>
              <option value="">Select State</option>
              {states.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
            </select>

            <select value={selectedRiver} onChange={(e) => setSelectedRiver(e.target.value)} disabled={!selectedState}>
              <option value="">Select River</option>
              {rivers.map(r => <option key={r._id} value={r._id}>{r.name}</option>)}
            </select>

            <select value={selectedDam} onChange={(e) => setSelectedDam(e.target.value)} disabled={!selectedRiver && !selectedState}>
              <option value="">Select Dam</option>
              {damsEnriched.map(x => <option key={x.dam._id} value={x.dam._id}>{x.dam.name}</option>)}
            </select>
          </div>

          {allDisplay.length ? (
            <div className="dam-grid">
              {allDisplay.map(({ dam, safety }) => (
                <AlertCard
                  key={dam._id}
                  dam={dam}
                  safety={safety}
                  saved={savedIds.has(String(dam._id))}
                  onToggleSave={toggleSave}
                  onView={viewDam}
                />
              ))}
            </div>
          ) : (
            <div className="no-dams">No dams found for current selection.</div>
          )}
        </div>
      )}
    </div>
  );
}
