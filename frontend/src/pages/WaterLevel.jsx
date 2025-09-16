import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import "../styles/WaterLevel.css";
import { useNavigate } from "react-router-dom";

const API_BASE = "http://localhost:5000/api/data"; // states/rivers/dams/status endpoints
const USER_API = "http://localhost:5000/api/users"; // saved-dams endpoints

// Helper: clamp 0..100
const clampPct = (v) => {
  const n = Number(v) || 0;
  return Math.max(0, Math.min(100, Math.round(n)));
};

// Compute three metrics from latestStatus
function computeMetrics(latest) {
  if (!latest) {
    return {
      waterPct: 0, waterLabel: "—",
      gatesPct: 0, gatesLabel: "—",
      outflowPct: 0, outflowLabel: "—",
      alert: "green",
    };
  }

  // WATER %
  let waterPct = 0;
  let waterLabel = "—";
  if (latest.levelUnit === "%") {
    waterPct = clampPct(latest.currentWaterLevel);
    waterLabel = `${latest.currentWaterLevel ?? "—"}%`;
  } else if (latest.maxLevel && latest.currentWaterLevel != null) {
    waterPct = clampPct((latest.currentWaterLevel / latest.maxLevel) * 100);
    waterLabel = `${latest.currentWaterLevel}${latest.levelUnit === "m" ? " m" : ""}`;
  } else if (latest.currentWaterLevel != null) {
    waterLabel = `${latest.currentWaterLevel}${latest.levelUnit || ""}`;
  }

  // GATES %
  let gatesPct = 0;
  let gatesLabel = "—";
  if (Array.isArray(latest.gateStatus) && latest.gateStatus.length) {
    const sum = latest.gateStatus.reduce((s, g) => s + (g.percentageOpen ?? 0), 0);
    const avg = sum / latest.gateStatus.length;
    gatesPct = clampPct(avg);
    gatesLabel = `${Math.round(avg)}%`;
  } else if (typeof latest.gatesOpen === "number") {
    // fallback if older field 'gatesOpen' stored as a percent
    gatesPct = clampPct(latest.gatesOpen);
    gatesLabel = `${Math.round(gatesPct)}%`;
  }

  // OUTFLOW %
  let outflowPct = 0;
  let outflowLabel = "—";
  const outflow = latest.outflowRate ?? latest.outflow ?? null;
  const spill = latest.spillwayDischarge ?? latest.maxOutflow ?? null;

  if (outflow != null) {
    outflowLabel = `${outflow} m³/s`;
    if (spill && spill > 0) {
      outflowPct = clampPct((outflow / spill) * 100);
    } else {
      // no spillway / max given — show relative by bounding to 0..100 using a heuristic
      outflowPct = clampPct(Math.min(100, Math.round((outflow / Math.max(1, outflow)) * 100))); // becomes 100
    }
  }

  // ALERT logic (red/yellow/green)
  let alert = "green";
  if (latest.levelUnit === "%") {
    const cur = Number(latest.currentWaterLevel) || 0;
    if (cur >= 90) alert = "red";
    else if (cur >= 75) alert = "yellow";
  } else if (latest.maxLevel && latest.currentWaterLevel != null) {
    const ratio = latest.currentWaterLevel / latest.maxLevel;
    if (ratio >= 0.95) alert = "red";
    else if (ratio >= 0.85) alert = "yellow";
  } else {
    // fallback: if any gate open large percent or outflow is high, mark yellow
    if (gatesPct >= 90 || outflowPct >= 90) alert = "red";
    else if (gatesPct >= 60 || outflowPct >= 60) alert = "yellow";
  }

  return {
    waterPct, waterLabel,
    gatesPct, gatesLabel,
    outflowPct, outflowLabel,
    alert,
  };
}

// Dam card component
function DamCard({ dam, latestStatus, saved, onToggleSave, onView }) {
  const metrics = useMemo(() => computeMetrics(latestStatus), [latestStatus]);

  const stateName = dam.state || dam.stateName || (dam._stateName) || ""; // try possible fields
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
          <CircularProgressbar value={metrics.waterPct} text={`${metrics.waterPct}%`} styles={buildStyles({ textSize: "18px" })} />
          <div className="chart-label">Water ({metrics.waterLabel})</div>
        </div>

        <div className="chart-block">
          <CircularProgressbar value={metrics.gatesPct} text={`${metrics.gatesPct}%`} styles={buildStyles({ textSize: "18px" })} />
          <div className="chart-label">Gates ({metrics.gatesLabel})</div>
        </div>

        <div className="chart-block">
          <CircularProgressbar value={metrics.outflowPct} text={`${metrics.outflowPct}%`} styles={buildStyles({ textSize: "18px" })} />
          <div className="chart-label">Outflow ({metrics.outflowLabel})</div>
        </div>
      </div>

      <div className="card-footer">
        <div className={`flag flag-${metrics.alert}`}>{metrics.alert.toUpperCase()}</div>
        <div className="actions">
          <button className="view-btn" onClick={() => onView?.(dam._id)}>View Dam</button>
        </div>
      </div>
    </div>
  );
}

export default function WaterLevel() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const authHeader = token ? { Authorization: `Bearer ${token}` } : undefined;

  const [tab, setTab] = useState("saved"); // 'saved' | 'all'
  const [loading, setLoading] = useState(false);
  const [secretOnly, setSecretOnly] = useState(false);

  // Saved dams (array of { dam, latestStatus } or dam-only)
  const [savedList, setSavedList] = useState([]);
  const [savedIds, setSavedIds] = useState(new Set());

  // All-dams drilldowns
  const [states, setStates] = useState([]);
  const [rivers, setRivers] = useState([]);
  const [damsEnriched, setDamsEnriched] = useState([]); // [{ dam, latestStatus }]
  const [selectedState, setSelectedState] = useState("");
  const [selectedRiver, setSelectedRiver] = useState("");
  const [selectedDam, setSelectedDam] = useState("");

  // cache for statuses to avoid duplicate requests
  const statusCacheRef = React.useRef(new Map());

  // Fetch saved dams for user
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
      // Two possible shapes:
      // shape A: [{ dam: {...}, latestStatus: {...} }, ...]
      // shape B: [ { ... dam ... }, ... ]
      if (data.length && data[0].dam) {
        setSavedList(data);
        setSavedIds(new Set(data.map(r => r.dam._id.toString())));
      } else {
        // if it's an array of dams, we need to enrich with status
        const damsArr = data;
        const enriched = await Promise.all(damsArr.map(async (d) => {
          const latest = await fetchLatestStatus(d._id);
          return { dam: d, latestStatus: latest || null };
        }));
        setSavedList(enriched);
        setSavedIds(new Set(damsArr.map(d => d._id.toString())));
      }
    } catch (err) {
      console.error("Error fetching saved dams:", err);
      setSavedList([]);
      setSavedIds(new Set());
    } finally {
      setLoading(false);
    }
  };

  // Fetch all states (for All Dams tab)
  const fetchStates = async () => {
    try {
      const res = await axios.get(`${API_BASE}/states`);
      setStates(res.data || []);
    } catch (err) {
      console.error("Error fetching states:", err);
    }
  };

  // Fetch rivers for a selected state
  const fetchRivers = async (stateId) => {
    try {
      const res = await axios.get(`${API_BASE}/rivers/${stateId}`);
      setRivers(res.data || []);
    } catch (err) {
      console.error("Error fetching rivers:", err);
      setRivers([]);
    }
  };

  // Fetch dams for a river and enrich with status
  const fetchDamsByRiver = async (riverId) => {
    try {
      const res = await axios.get(`${API_BASE}/dams/${riverId}`);
      const damsRaw = res.data || [];
      // Some APIs may return dam docs or array of { dam... }
      const enriched = await Promise.all(damsRaw.map(async (d) => {
        const damDoc = d.dam ? d.dam : d;
        const latest = await fetchLatestStatus(damDoc._id);
        return { dam: damDoc, latestStatus: latest || null };
      }));
      setDamsEnriched(enriched);
    } catch (err) {
      console.error("Error fetching dams by river:", err);
      setDamsEnriched([]);
    }
  };

  // When state selected -> fetch all dams for that state (across rivers)
  const fetchDamsByState = async (stateId) => {
    try {
      setDamsEnriched([]);
      const riversRes = await axios.get(`${API_BASE}/rivers/${stateId}`);
      const riversList = riversRes.data || [];
      const allDams = [];
      for (const r of riversList) {
        try {
          const dr = await axios.get(`${API_BASE}/dams/${r._id}`);
          const arr = dr.data || [];
          for (const d of arr) {
            const damDoc = d.dam ? d.dam : d;
            allDams.push({ dam: damDoc, river: r });
          }
        } catch (e) {
          // continue on error for each river
          console.warn("Error fetching dams for river", r._id, e);
        }
      }
      // enrich statuses
      const enriched = await Promise.all(allDams.map(async (pair) => {
        const latest = await fetchLatestStatus(pair.dam._id);
        // attach state & river names reliably
        const DamWithMeta = {
          ...pair.dam,
          riverName: pair.river?.name || pair.dam.riverName || pair.dam.river,
          state: states.find(s => s._id === stateId)?.name || pair.dam.state || "",
        };
        return { dam: DamWithMeta, latestStatus: latest || null };
      }));
      setDamsEnriched(enriched);
    } catch (err) {
      console.error("Error fetching dams by state:", err);
      setDamsEnriched([]);
    }
  };

  // Fetch latest status for a dam with caching
  const fetchLatestStatus = async (damId) => {
    const cache = statusCacheRef.current;
    if (cache.has(damId)) return cache.get(damId);
    try {
      const res = await axios.get(`${API_BASE}/dam/${damId}/status`);
      cache.set(damId, res.data);
      return res.data;
    } catch (err) {
      // not found or error -> cache null to avoid repeat heavy calls
      cache.set(damId, null);
      return null;
    }
  };

  // Toggle saved/unsave
const toggleSave = async (damId) => {
  if (!token) {
    navigate("/login");
    return;
  }

  try {
    await axios.patch(
      `${USER_API}/saved-dams/${damId}`,
      {},
      { headers: authHeader }
    );

    // Optimistic UI update
    setSavedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(damId)) {
        newSet.delete(damId);
      } else {
        newSet.add(damId);
      }
      return newSet;
    });

    // Also refresh savedList so "Saved Dams" tab gets the latest info
    fetchSavedDams();
  } catch (error) {
    console.error("Error toggling dam:", error);
  }
};


  // View dam details
  const viewDam = (damId) => {
    navigate(`/core-dam-info/${damId}`);
  };

  // SECRET filter toggler (only show red-alert)
  const toggleSecret = () => setSecretOnly((s) => !s);

  // Filter helper for secret filter
  const applySecretFilter = (arr) => {
    if (!secretOnly) return arr;
    return arr.filter(item => {
      const st = item.latestStatus;
      if (!st) return false;
      const metrics = computeMetrics(st);
      return metrics.alert === "red";
    });
  };

  // When tab switches or mount
  useEffect(() => {
    fetchStates(); // load states for all tab
    if (tab === "saved") fetchSavedDams();
    // clear selections when switching tab
    setSelectedState("");
    setSelectedRiver("");
    setSelectedDam("");
    setDamsEnriched([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  // When selectedState changes
  useEffect(() => {
    if (!selectedState) {
      setRivers([]);
      setDamsEnriched([]);
      setSelectedRiver("");
      setSelectedDam("");
      return;
    }
    // fetch rivers
    fetchRivers(selectedState);
    // fetch dams across rivers to populate below section
    fetchDamsByState(selectedState);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedState]);

  // When selectedRiver changes (narrow within state)
  useEffect(() => {
    if (!selectedRiver) {
      // if no river, we already have dams from state-level fetch; keep that
      setSelectedDam("");
      return;
    }
    // fetch dams for this river
    fetchDamsByRiver(selectedRiver);
    setSelectedDam("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRiver]);

  // When selectedDam changes, narrow damsEnriched to that dam only (we keep state)
  useEffect(() => {
    if (!selectedDam) return;
    // if the selected dam is already in damsEnriched, nothing else required (dropdown selection narrows UI)
    // But ensure selectedDam corresponds to dam._id values.
  }, [selectedDam]);

  // Convenience derived arrays for rendering
  const savedDisplay = applySecretFilter(savedList);
  const allDisplay = useMemo(() => {
    // if selectedDam -> filter to that dam id
    let list = damsEnriched;
    if (selectedDam) {
      list = list.filter(x => (x.dam._id || x.dam.id || x.dam._id?.toString()) === selectedDam);
    } else if (selectedRiver) {
      // when river selected we already set damsEnriched to that river
      list = damsEnriched;
    } else if (selectedState) {
      // state-level damsEnriched already contains all dams for that state
      list = damsEnriched;
    }
    return applySecretFilter(list);
  }, [damsEnriched, selectedDam, selectedRiver, selectedState, secretOnly]);

  return (
     <div className="waterlevel-page">
    {/* Page Title */}
    <h1 className="page-title">🌊 Water Level Monitoring</h1>

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
              <p>Please login or create an account to see your saved dams.</p>
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
                  {savedDisplay.map(({ dam, latestStatus }) => (
                    <DamCard
                      key={dam._id}
                      dam={dam}
                      latestStatus={latestStatus}
                      saved={savedIds.has(dam._id.toString())}
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
              {/* list options come from damsEnriched (if selectedRiver, damsEnriched holds that river's dams; if selectedState, it holds state dams) */}
              {damsEnriched.map(x => <option key={x.dam._id} value={x.dam._id}>{x.dam.name}</option>)}
            </select>
          </div>

          {/* Dam cards */}
          {allDisplay.length ? (
            <div className="dam-grid">
              {allDisplay.map(({ dam, latestStatus }) => (
                <DamCard
                  key={dam._id}
                  dam={dam}
                  latestStatus={latestStatus}
                  saved={savedIds.has(dam._id.toString())}
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
