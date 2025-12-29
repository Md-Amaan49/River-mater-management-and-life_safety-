import React, { useEffect, useMemo, useState, useRef } from "react";
import axios from "axios";
import "../styles/AlertPage.css";
import { useNavigate } from "react-router-dom";

const BASE_API = "https://river-water-management-and-life-safety.onrender.com/api";     // server base
const DATA_API = `${BASE_API}/data`;               // states/rivers/dams endpoints
const USER_API = `${BASE_API}/users`;              // saved-dams endpoint
const SAFETY_API = `${BASE_API}/safety`;           // safety endpoints
const STATUS_API = `${BASE_API}/data`;             // dam status endpoints

// clamp 0..100
const clampPct = (v) => {
  const n = Number(v) || 0;
  return Math.max(0, Math.min(100, Math.round(n)));
};

// compute three safety-related metrics for circular widgets
function computeSafetyMetrics(safety, damStatus, damCore) {
  if (!safety && !damStatus) {
    return {
      riskPct: 0, riskLabel: "—",
      structPct: 0, structLabel: "—",
      maintenancePct: 0, maintenanceLabel: "—",
      alert: "green",
    };
  }

  // Enhanced Flood Risk calculation using real-time water level data
  let riskPct = 0;
  let riskLabel = "Green";
  let alert = "green";

  if (damStatus && damCore) {
    // Calculate water level percentage
    const currentLevel = damStatus.currentWaterLevel || 0;
    const maxLevel = damStatus.maxLevel || damCore.maxStorage || 100;
    const minLevel = damStatus.minLevel || 0;
    
    let waterLevelPct = 0;
    if (damStatus.levelUnit === "%") {
      waterLevelPct = currentLevel;
    } else {
      // Convert meters to percentage based on capacity
      waterLevelPct = maxLevel > minLevel ? 
        ((currentLevel - minLevel) / (maxLevel - minLevel)) * 100 : 0;
    }
    
    // Calculate inflow/outflow ratio risk
    const inflowRate = damStatus.inflowRate || 0;
    const outflowRate = damStatus.outflowRate || 0;
    const flowRatio = outflowRate > 0 ? inflowRate / outflowRate : inflowRate > 0 ? 2 : 1;
    
    // Base risk calculation on water level percentage
    let baseRisk = 0;
    if (waterLevelPct >= 90) {
      baseRisk = 85; // Very high water level
    } else if (waterLevelPct >= 80) {
      baseRisk = 65; // High water level
    } else if (waterLevelPct >= 70) {
      baseRisk = 45; // Moderate water level
    } else if (waterLevelPct >= 50) {
      baseRisk = 25; // Normal water level
    } else {
      baseRisk = 10; // Low water level
    }
    
    // Adjust risk based on inflow/outflow ratio
    if (flowRatio > 1.5) {
      baseRisk += 15; // Inflow significantly higher than outflow
    } else if (flowRatio > 1.2) {
      baseRisk += 10; // Inflow moderately higher than outflow
    } else if (flowRatio < 0.8) {
      baseRisk -= 5; // Good outflow management
    }
    
    // Factor in structural health from safety data
    if (safety) {
      const structuralRisk = calculateStructuralRisk(safety);
      baseRisk += structuralRisk;
      
      // Override with manual assessment if it's higher
      const manualRiskMap = { Green: 20, Yellow: 65, Red: 100 };
      const manualRisk = manualRiskMap[safety.floodRiskLevel] || 20;
      if (manualRisk > baseRisk) {
        baseRisk = manualRisk;
      }
    }
    
    // Clamp and set final values
    riskPct = clampPct(baseRisk);
    
    // Determine risk level and alert color
    if (riskPct >= 80) {
      riskLabel = "Red";
      alert = "red";
    } else if (riskPct >= 50) {
      riskLabel = "Yellow"; 
      alert = "yellow";
    } else {
      riskLabel = "Green";
      alert = "green";
    }
    
    // Add water level info to label (separate from percentage)
    if (damStatus) {
      const waterLevelPct = damStatus.levelUnit === "%" ? 
        damStatus.currentWaterLevel : 
        (damStatus.maxLevel > damStatus.minLevel ? 
          ((damStatus.currentWaterLevel - damStatus.minLevel) / (damStatus.maxLevel - damStatus.minLevel)) * 100 : 0);
      riskLabel = `${riskLabel} (${Math.round(waterLevelPct)}% full)`;
    }
    
  } else if (safety) {
    // Fallback to manual assessment only
    const riskMap = { Green: 20, Yellow: 65, Red: 100 };
    const riskLevel = (safety.floodRiskLevel || "Green");
    riskPct = clampPct(riskMap[riskLevel] ?? 0);
    riskLabel = riskLevel;
    
    if (riskLevel.toLowerCase() === "red") alert = "red";
    else if (riskLevel.toLowerCase() === "yellow") alert = "yellow";
  }

  // Structural health score: percent of structural fields present (simple heuristic)
  let structPct = 0;
  let structLabel = "OK";
  
  if (safety) {
    const sh = safety.structuralHealth || {};
    const structFields = ["cracks", "vibration", "tilt"];
    let presentCount = 0;
    for (const f of structFields) {
      const v = sh[f];
      if (v !== undefined && v !== null && String(v).trim() !== "") presentCount += 1;
    }
    structPct = clampPct(Math.round((presentCount / structFields.length) * 100));
    
    if (presentCount === 0) structLabel = "No data";
    else {
      const parts = structFields.map(f => sh[f] ? `${f[0].toUpperCase()+f.slice(1)}:${String(sh[f]).slice(0,10)}` : null)
                               .filter(Boolean);
      structLabel = parts.join(", ");
    }
  }

  // Maintenance progress: proportion of time elapsed between lastInspection -> nextInspection
  let maintenancePct = 0;
  let maintenanceLabel = "—";
  
  if (safety) {
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
  }

  return {
    riskPct, riskLabel,
    structPct, structLabel,
    maintenancePct, maintenanceLabel,
    alert,
  };
}

// Helper function to calculate structural risk contribution
function calculateStructuralRisk(safety) {
  let structuralRisk = 0;
  const sh = safety.structuralHealth || {};
  
  // Check for structural issues
  if (sh.cracks && sh.cracks.toLowerCase().includes('severe')) structuralRisk += 20;
  else if (sh.cracks && sh.cracks.toLowerCase().includes('moderate')) structuralRisk += 10;
  else if (sh.cracks && sh.cracks.toLowerCase().includes('minor')) structuralRisk += 5;
  
  if (sh.vibration && sh.vibration.toLowerCase().includes('high')) structuralRisk += 15;
  else if (sh.vibration && sh.vibration.toLowerCase().includes('moderate')) structuralRisk += 8;
  
  if (sh.tilt && sh.tilt.toLowerCase().includes('significant')) structuralRisk += 25;
  else if (sh.tilt && sh.tilt.toLowerCase().includes('slight')) structuralRisk += 10;
  
  // Check seepage
  if (safety.seepageReport) {
    const seepage = safety.seepageReport.toLowerCase();
    if (seepage.includes('heavy') || seepage.includes('severe')) structuralRisk += 20;
    else if (seepage.includes('moderate')) structuralRisk += 10;
    else if (seepage.includes('minor') || seepage.includes('slight')) structuralRisk += 5;
  }
  
  // Check earthquake zone
  if (safety.earthquakeZone) {
    const zone = safety.earthquakeZone.toLowerCase();
    if (zone.includes('v') || zone.includes('5')) structuralRisk += 15;
    else if (zone.includes('iv') || zone.includes('4')) structuralRisk += 10;
    else if (zone.includes('iii') || zone.includes('3')) structuralRisk += 5;
  }
  
  return Math.min(structuralRisk, 30); // Cap structural risk contribution
}

// Alert card (mirrors DamCard layout from WaterLevel)
function AlertCard({ dam, safety, damStatus, damCore, saved, onToggleSave, onView }) {
  const metrics = useMemo(() => computeSafetyMetrics(safety, damStatus, damCore), [safety, damStatus, damCore]);

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

      {/* Real-time water level info */}
      {damStatus && (
        <div className="water-level-info" style={{ 
          padding: "8px", 
          backgroundColor: "#f8fafc", 
          borderRadius: "4px", 
          marginBottom: "8px",
          fontSize: "12px",
          color: "#475569"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span><strong>Current Level:</strong> {damStatus.currentWaterLevel} {damStatus.levelUnit}</span>
            <span><strong>Inflow:</strong> {damStatus.inflowRate || 0} m³/s</span>
            <span><strong>Outflow:</strong> {damStatus.outflowRate || 0} m³/s</span>
          </div>
          {damStatus.lastSyncAt && (
            <div style={{ marginTop: "4px", fontSize: "11px", color: "#64748b" }}>
              Last updated: {new Date(damStatus.lastSyncAt).toLocaleString()}
            </div>
          )}
        </div>
      )}

      <div className="charts-row">
        <div className="chart-block">
          <div className={`metric-card risk-${metrics.alert}`}>
            <div className="metric-header">
              <span className="metric-title">Flood Risk</span>
              <span className="metric-value">{metrics.riskPct}%</span>
            </div>
            <div className="metric-bar">
              <div 
                className={`metric-progress risk-${metrics.alert}`}
                style={{ width: `${metrics.riskPct}%` }}
              />
            </div>
            <div className="metric-description">{metrics.riskLabel}</div>
          </div>
        </div>

        <div className="chart-block">
          <div className="metric-card">
            <div className="metric-header">
              <span className="metric-title">Structural</span>
              <span className="metric-value">{metrics.structPct}%</span>
            </div>
            <div className="metric-bar">
              <div 
                className="metric-progress structural"
                style={{ width: `${metrics.structPct}%` }}
              />
            </div>
            <div className="metric-description">{metrics.structLabel}</div>
          </div>
        </div>

        <div className="chart-block">
          <div className="metric-card">
            <div className="metric-header">
              <span className="metric-title">Maintenance</span>
              <span className="metric-value">{metrics.maintenancePct}%</span>
            </div>
            <div className="metric-bar">
              <div 
                className="metric-progress maintenance"
                style={{ width: `${metrics.maintenancePct}%` }}
              />
            </div>
            <div className="metric-description">{metrics.maintenanceLabel}</div>
          </div>
        </div>
      </div>

      <div className="card-footer">
        <div className={`flag flag-${metrics.alert}`}>{metrics.alert.toUpperCase()}</div>
        <div className="actions">
          <button className="view-btn" onClick={() => onView?.(dam._id)}>View Dam</button>
        </div>
      </div>

      {/* expanded details shown below charts */}
      <div className="dam-details">
        {safety ? (
          <>
            <div className="detail-item">
              <span className="detail-label">Seepage:</span>
              <span className="detail-value">{safety.seepageReport || "N/A"}</span>
            </div>

            <div className="detail-item">
              <span className="detail-label">Earthquake Zone:</span>
              <span className="detail-value">{safety.earthquakeZone || "N/A"}</span>
            </div>

            <div className="detail-item">
              <span className="detail-label">Emergency Contact:</span>
              <div className="detail-value">
                <div>{safety.emergencyContact?.authorityName || "N/A"}</div>
                <div className="contact-info">
                  {safety.emergencyContact?.phone && (
                    <span>📞 {safety.emergencyContact.phone}</span>
                  )}
                  {safety.emergencyContact?.email && (
                    <span>✉️ {safety.emergencyContact.email}</span>
                  )}
                </div>
                {safety.emergencyContact?.address && (
                  <div className="contact-address">📍 {safety.emergencyContact.address}</div>
                )}
              </div>
            </div>

            <div className="detail-item">
              <span className="detail-label">Maintenance Report:</span>
              <div className="detail-value">
                {safety.maintenance?.reportFile ? (
                  <a 
                    href={`${BASE_API}/uploads/${safety.maintenance.reportFile}`} 
                    target="_blank" 
                    rel="noreferrer"
                    className="report-link"
                  >
                    📄 View Report
                  </a>
                ) : (
                  "N/A"
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="no-data">No safety data available.</div>
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

  // Saved entries: array of { dam, safety, damStatus, damCore }
  const [savedList, setSavedList] = useState([]);
  const [savedIds, setSavedIds] = useState(new Set());

  // All-dams drilldowns
  const [states, setStates] = useState([]);
  const [rivers, setRivers] = useState([]);
  const [damsEnriched, setDamsEnriched] = useState([]); // [{ dam, safety, damStatus, damCore }]
  const [selectedState, setSelectedState] = useState("");
  const [selectedRiver, setSelectedRiver] = useState("");
  const [selectedDam, setSelectedDam] = useState("");

  // cache for safety and status to avoid duplicate requests
  const safetyCacheRef = useRef(new Map());
  const statusCacheRef = useRef(new Map());
  const coreCacheRef = useRef(new Map());

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

  // fetch dam status for dam (with cache)
  const fetchStatusForDam = async (damId) => {
    const cache = statusCacheRef.current;
    if (cache.has(damId)) return cache.get(damId);
    try {
      const res = await axios.get(`${STATUS_API}/dam/${damId}/status`);
      cache.set(damId, res.data);
      return res.data;
    } catch (err) {
      cache.set(damId, null);
      return null;
    }
  };

  // fetch dam core info (with cache)
  const fetchCoreForDam = async (damId) => {
    const cache = coreCacheRef.current;
    if (cache.has(damId)) return cache.get(damId);
    try {
      const res = await axios.get(`${DATA_API}/dam/${damId}`);
      cache.set(damId, res.data);
      return res.data;
    } catch (err) {
      cache.set(damId, null);
      return null;
    }
  };

  // Fetch saved dams for user and enrich with safety and status data
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
        // enrich with safety, status, and core data
        const enriched = await Promise.all(data.map(async (r) => {
          const dam = r.dam;
          const [safety, damStatus, damCore] = await Promise.all([
            r.safety ?? r.latestSafety ?? r.latestStatus ?? fetchSafetyForDam(dam._id),
            fetchStatusForDam(dam._id),
            fetchCoreForDam(dam._id)
          ]);
          return { dam, safety: safety || null, damStatus: damStatus || null, damCore: damCore || dam };
        }));
        setSavedList(enriched);
        setSavedIds(new Set(data.map(r => String(r.dam._id))));
      } else {
        // array of dams
        const damsArr = data;
        const enriched = await Promise.all(damsArr.map(async (d) => {
          const [safety, damStatus, damCore] = await Promise.all([
            fetchSafetyForDam(d._id),
            fetchStatusForDam(d._id),
            fetchCoreForDam(d._id)
          ]);
          return { dam: d, safety: safety || null, damStatus: damStatus || null, damCore: damCore || d };
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
        const [safety, damStatus, damCore] = await Promise.all([
          fetchSafetyForDam(damDoc._id),
          fetchStatusForDam(damDoc._id),
          fetchCoreForDam(damDoc._id)
        ]);
        return { dam: damDoc, safety: safety || null, damStatus: damStatus || null, damCore: damCore || damDoc };
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
        const [safety, damStatus, damCore] = await Promise.all([
          fetchSafetyForDam(pair.dam._id),
          fetchStatusForDam(pair.dam._id),
          fetchCoreForDam(pair.dam._id)
        ]);
        const DamWithMeta = {
          ...pair.dam,
          riverName: pair.river?.name || pair.dam.riverName || pair.dam.river,
          state: states.find(s => s._id === stateId)?.name || pair.dam.state || "",
        };
        return { dam: DamWithMeta, safety: safety || null, damStatus: damStatus || null, damCore: damCore || DamWithMeta };
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
    navigate(`/dam-dashboard/${damId}`);
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
                <button onClick={() => navigate("/register")} className="btn btn-outline">Create Account</button>
              </div>
            </div>
          ) : (
            <>
              {!savedDisplay.length ? (
                <div className="no-dams">No saved dams.</div>
              ) : (
                <div className="dam-grid">
                  {savedDisplay.map(({ dam, safety, damStatus, damCore }) => (
                    <AlertCard
                      key={dam._id}
                      dam={dam}
                      safety={safety}
                      damStatus={damStatus}
                      damCore={damCore}
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
              {allDisplay.map(({ dam, safety, damStatus, damCore }) => (
                <AlertCard
                  key={dam._id}
                  dam={dam}
                  safety={safety}
                  damStatus={damStatus}
                  damCore={damCore}
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
