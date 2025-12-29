import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import "../styles/WaterUsagePage.css";
import { useNavigate } from "react-router-dom";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const API_BASE = "https://river-water-management-and-life-safety.onrender.com/api";
const DATA_API = `${API_BASE}/data`;
const USER_API = `${API_BASE}/users`;
const USAGE_API = `${API_BASE}/water-usage`;

/**
 * Utility: safe number
 */
const num = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

function UsageCard({ title, value, suffix }) {
  return (
    <div className="usage-card">
      <div className="usage-card-title">{title}</div>
      <div className="usage-card-value">{value}{suffix ? ` ${suffix}` : ""}</div>
    </div>
  );
}

/**
 * Dam usage small card (like WaterLevel dam-card but usage)
 */
function DamUsageCard({ dam, usage, saved, onToggleSave, onView }) {
  // fallback values if usage is null
  const irr = num(usage?.irrigation);
  const drink = num(usage?.drinking);
  const ind = num(usage?.industrial);
  const hydro = num(usage?.hydropower ?? usage?.hydroPower ?? usage?.hydroPower);
  const evap = num(usage?.evaporationLoss);
  const env = num(usage?.environmentalFlow);
  const farm = num(usage?.farmingSupport);

  const stateName = dam.state || dam.stateName || dam._stateName || "";
  const riverName = dam.riverName || dam.river || dam._riverName || "";

  return (
    
    <div className="dam-card usage-dam-card">
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

      <div className="usage-breakdown">
        <div className="usage-left">
          <div className="usage-row"><span>Irrigation (MCM)</span><strong>{irr}</strong></div>
          <div className="usage-row"><span>Drinking (MCM)</span><strong>{drink}</strong></div>
          <div className="usage-row"><span>Industrial (MCM)</span><strong>{ind}</strong></div>
        </div>

        <div className="usage-right">
          <div className="usage-row"><span>Hydropower (MCM)</span><strong>{hydro}</strong></div>
          <div className="usage-row"><span>Evaporation Loss (MCM)</span><strong>{evap}</strong></div>
          <div className="usage-row"><span>Environmental Flow (MCM)</span><strong>{env}</strong></div>
          <div className="usage-row"><span>Farming Support (Hectares)</span><strong>{farm}</strong></div>
        </div>
      </div>

      <div className="card-footer">
        <div className="actions">
          <button className="view-btn" onClick={() => onView?.(dam._id)}>View Dam</button>
        </div>
      </div>
    </div>
  );
}

export default function WaterUsagePage() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const authHeader = token ? { Authorization: `Bearer ${token}` } : undefined;

  const [tab, setTab] = useState("saved"); // 'saved' | 'all'
  const [loading, setLoading] = useState(false);

  // Saved usage list
  const [savedList, setSavedList] = useState([]); // [{ dam, usage }]
  const [savedIds, setSavedIds] = useState(new Set());

  // Drilldowns for all
  const [states, setStates] = useState([]);
  const [rivers, setRivers] = useState([]);
  const [damsEnriched, setDamsEnriched] = useState([]); // [{ dam, usage }]
  const [selectedState, setSelectedState] = useState("");
  const [selectedRiver, setSelectedRiver] = useState("");
  const [selectedDam, setSelectedDam] = useState("");

  // usage cache
  const usageCacheRef = useRef(new Map());

  // chart selection state
  const [chartTarget, setChartTarget] = useState(null); // null or { type: 'dam'|'river'|'state', id, label }

  // ----------------------------------------------------------------------------
  // Helpers: fetch usage for a dam with caching
  const fetchUsageForDam = async (damId) => {
    const cache = usageCacheRef.current;
    if (cache.has(damId)) return cache.get(damId);
    try {
      const res = await axios.get(`${USAGE_API}/dam/${damId}`);
      cache.set(damId, res.data);
      return res.data;
    } catch (err) {
      cache.set(damId, null);
      return null;
    }
  };

  // ----------------------------------------------------------------------------
  // Fetch saved dams (from user) and enrich with usage
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

      if (data.length && data[0].dam) {
        // shape: [{ dam, ... }]
        const enriched = await Promise.all(data.map(async (r) => {
          const dam = r.dam;
          // controller may return pre-attached usage in some cases; try variants
          const usage = r.usage ?? r.waterUsage ?? await fetchUsageForDam(dam._id);
          return { dam, usage: usage || null };
        }));
        setSavedList(enriched);
        setSavedIds(new Set(data.map(r => String(r.dam._id))));
      } else {
        // array of dams
        const enriched = await Promise.all(data.map(async (d) => {
          const usage = await fetchUsageForDam(d._id);
          return { dam: d, usage: usage || null };
        }));
        setSavedList(enriched);
        setSavedIds(new Set(data.map(d => String(d._id))));
      }
    } catch (err) {
      console.error("Error fetching saved dams (usage):", err);
      setSavedList([]);
      setSavedIds(new Set());
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------------------------------------------------------
  // Fetch states/rivers/dams (using /api/data endpoints provided earlier)
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
        const usage = await fetchUsageForDam(damDoc._id);
        return { dam: damDoc, usage: usage || null };
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
        const usage = await fetchUsageForDam(pair.dam._id);
        const DamWithMeta = {
          ...pair.dam,
          riverName: pair.river?.name || pair.dam.riverName || pair.dam.river,
          state: states.find(s => s._id === stateId)?.name || pair.dam.state || "",
        };
        return { dam: DamWithMeta, usage: usage || null };
      }));
      setDamsEnriched(enriched);
    } catch (err) {
      console.error("Error fetching dams by state:", err);
      setDamsEnriched([]);
    }
  };

  // ----------------------------------------------------------------------------
  // Toggle save (same endpoint as WaterLevel)
  const toggleSave = async (damId) => {
    if (!token) {
      navigate("/login");
      return;
    }
    try {
      await axios.patch(`${USER_API}/saved-dams/${damId}`, {}, { headers: authHeader });

      setSavedIds(prev => {
        const newSet = new Set(prev);
        if (newSet.has(damId)) newSet.delete(damId); else newSet.add(damId);
        return newSet;
      });

      // refresh saved list
      fetchSavedDams();
    } catch (err) {
      console.error("Error toggling save:", err);
    }
  };

  const viewDam = (damId) => {
    navigate(`/dam-dashboard/${damId}`);
  };

  // ----------------------------------------------------------------------------
  // Chart data building
  // If a specific dam selected: chart shows categories for that dam
  // If multiple dams (state/river): chart shows grouped bars: one dataset per category, labels are dam names
  const buildChartForList = (list) => {
    // list: [{ dam, usage }]
    const labels = list.map(x => x.dam?.name || "Unnamed");
    const categories = [
      { key: "irrigation", label: "Irrigation" },
      { key: "drinking", label: "Drinking" },
      { key: "industrial", label: "Industrial" },
      { key: "hydropower", label: "Hydropower" },
      { key: "evaporationLoss", label: "Evap. Loss" },
      { key: "environmentalFlow", label: "Env. Flow" },
      { key: "farmingSupport", label: "Farming" },
    ];

    const datasets = categories.map((cat, idx) => {
      return {
        label: cat.label,
        data: list.map(x => num(x.usage?.[cat.key] ?? x.usage?.[cat.key.replace(/([A-Z])/g, (m) => m.toLowerCase())] ?? 0)),
        // default colors; ChartJS will pick something if not provided
        backgroundColor: `rgba(${30 + idx*25}, ${99 + (idx*10)%100}, ${200 - idx*10}, 0.7)`,
        borderColor: `rgba(${30 + idx*25}, ${99 + (idx*10)%100}, ${200 - idx*10}, 1)`,
        borderWidth: 1,
      };
    });

    return {
      labels,
      datasets,
    };
  };

  // For single dam: present categories and a simple chart
  const buildChartForSingle = (usage, damName) => {
    const labels = ["Irrigation","Drinking","Industrial","Hydropower","Evap. Loss","Env. Flow","Farming"];
    const values = [
      num(usage?.irrigation ),
      num(usage?.drinking),
      num(usage?.industrial),
      num(usage?.hydropower ?? usage?.hydroPower ?? 0),
      num(usage?.evaporationLoss),
      num(usage?.environmentalFlow),
      num(usage?.farmingSupport),
    ];
    return {
      labels,
      datasets: [
        {
          label: damName || "Usage",
          data: values,
          backgroundColor: "rgba(37,99,235,0.7)",
          borderColor: "rgba(37,99,235,1)",
          borderWidth: 1,
        },
      ],
    };
  };

  // ----------------------------------------------------------------------------
  // Effect: on mount or when tab changes
  useEffect(() => {
    fetchStates();
    if (tab === "saved") fetchSavedDams();
    // reset selections
    setSelectedState("");
    setSelectedRiver("");
    setSelectedDam("");
    setDamsEnriched([]);
    setChartTarget(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  // When state changes
  useEffect(() => {
    if (!selectedState) {
      setRivers([]);
      setDamsEnriched([]);
      setSelectedRiver("");
      setSelectedDam("");
      setChartTarget(null);
      return;
    }
    fetchRivers(selectedState);
    fetchDamsByState(selectedState);
    // set chart target for aggregated state totals (call API)
    setChartTarget({ type: "state", id: selectedState });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedState]);

  // When river changes
  useEffect(() => {
    if (!selectedRiver) {
      setSelectedDam("");
      setChartTarget(selectedState ? { type: "state", id: selectedState } : null);
      return;
    }
    fetchDamsByRiver(selectedRiver);
    setSelectedDam("");
    setChartTarget({ type: "river", id: selectedRiver });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRiver]);

  // When dam selected -> narrow list and set chart target to that dam
  useEffect(() => {
    if (!selectedDam) return;
    setChartTarget({ type: "dam", id: selectedDam });
  }, [selectedDam]);

  // ----------------------------------------------------------------------------
  // Derived displays
  const savedDisplay = savedList; // [{dam, usage}]
  const allDisplay = useMemo(() => {
    let list = damsEnriched;
    if (selectedDam) {
      list = list.filter(x => String(x.dam._id) === String(selectedDam));
    }
    return list;
  }, [damsEnriched, selectedDam]);

  // Chart data selection build
  const chartData = useMemo(() => {
    if (!chartTarget) return null;

    if (chartTarget.type === "dam") {
      // find usage in either damsEnriched or savedList cache
      const found = (damsEnriched.find(x => String(x.dam._id) === String(chartTarget.id))
            || savedList.find(x => String(x.dam._id) === String(chartTarget.id))
            || null);
      if (found) return buildChartForSingle(found.usage, found.dam?.name);
      // fallback: fetch usage from cache
      const cached = usageCacheRef.current.get(chartTarget.id) || null;
      if (cached) return buildChartForSingle(cached, cached?.damName || "Dam");
      return null;
    }

    // state or river -> show all dams in damsEnriched
    if (!allDisplay || allDisplay.length === 0) return null;
    return buildChartForList(allDisplay);
  }, [chartTarget, damsEnriched, savedList, allDisplay]);

  // ----------------------------------------------------------------------------
  // optional aggregated totals for top cards: if selected state or river, call aggregated endpoints
  const [aggregatedTotals, setAggregatedTotals] = useState(null);
  useEffect(() => {
    let cancelled = false;
    const fetchAggregated = async () => {
      try {
        if (selectedState) {
          const res = await axios.get(`${USAGE_API}/state/${encodeURIComponent(states.find(s => s._id === selectedState)?.name || selectedState)}`);
          if (!cancelled) setAggregatedTotals(res.data?.totals ?? null);
        } else if (selectedRiver) {
          const res = await axios.get(`${USAGE_API}/river/${selectedRiver}`);
          if (!cancelled) setAggregatedTotals(res.data?.totals ?? null);
        } else {
          setAggregatedTotals(null);
        }
      } catch (err) {
        console.warn("No aggregated usage available:", err);
        if (!cancelled) setAggregatedTotals(null);
      }
    };
    fetchAggregated();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedState, selectedRiver]);

  // ----------------------------------------------------------------------------
  // Render
  return (
    <div className="waterlevel-page">
    {/* Page Title */}
    <h1 className="page-title">📊 Water Usage Monitoring</h1>

    <div className="top-buttons">
      <button className={tab === "saved" ? "active" : ""} onClick={() => setTab("saved")}>Saved Dams</button>
      <button className={tab === "all" ? "active" : ""} onClick={() => setTab("all")}>All Dams</button>
    </div>

      {loading && <div className="loading">Loading…</div>}

      {/* Saved Dams */}
      {tab === "saved" && (
        <div className="section">
          <h2 className="section-title">Saved Dams</h2>

          {!token ? (
            <div className="not-logged">
              <p>Please login or create an account to see your saved dams.</p>
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
                <>
                  {/* Top cards: aggregated across saved dams */}
                  <div className="usage-top-cards">
                    {/* compute aggregated sums across savedDisplay */}
                    {(() => {
                      const totals = savedDisplay.reduce((acc, x) => {
                        const u = x.usage || {};
                        acc.irrigation += num(u.irrigation);
                        acc.drinking += num(u.drinking);
                        acc.industrial += num(u.industrial);
                        acc.hydropower += num(u.hydropower ?? u.hydroPower ?? 0);
                        acc.evaporationLoss += num(u.evaporationLoss);
                        acc.environmentalFlow += num(u.environmentalFlow);
                        acc.farmingSupport += num(u.farmingSupport);
                        return acc;
                      }, { irrigation: 0, drinking: 0, industrial: 0, hydropower: 0, evaporationLoss: 0, environmentalFlow:0, farmingSupport:0 });

                      return (
                        <>
                          <UsageCard title="Irrigation (total)" value={totals.irrigation} suffix="" />
                          <UsageCard title="Drinking (total)" value={totals.drinking} />
                          <UsageCard title="Industrial (total)" value={totals.industrial} />
                          <UsageCard title="Hydropower (total)" value={totals.hydropower} />
                          <UsageCard title="Evaporation Loss" value={totals.evaporationLoss} />
                          <UsageCard title="Environmental Flow" value={totals.environmentalFlow} />
                          <UsageCard title="Farming Support" value={totals.farmingSupport} />
                        </>
                      );
                    })()}
                  </div>

                  {/* Dam cards */}
                  <div className="dam-grid">
                    {savedDisplay.map(({ dam, usage }) => (
                      <DamUsageCard
                        key={dam._id}
                        dam={dam}
                        usage={usage}
                        saved={savedIds.has(String(dam._id))}
                        onToggleSave={toggleSave}
                        onView={viewDam}
                      />
                    ))}
                  </div>

                  {/* Chart area */}
                  <div className="chart-area">
                    <h3>Usage Chart</h3>
                    {chartData ? (
                      <Bar data={chartData} options={{
                        responsive: true,
                        plugins: {
                          legend: { position: 'top' },
                          title: { display: false, text: 'Water Usage' },
                        },
                      }} />
                    ) : (
                      <div className="no-chart">Select a dam (or an option) to view chart</div>
                    )}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      )}

      {/* All Dams */}
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

          {/* Top cards — aggregated totals come from aggregatedTotals if present, otherwise compute from damsEnriched */}
          <div className="usage-top-cards">
            {(() => {
              const sourceTotals = aggregatedTotals ? aggregatedTotals : (() => {
                const totals = damsEnriched.reduce((acc, x) => {
                  const u = x.usage || {};
                  acc.irrigation += num(u.irrigation);
                  acc.drinking += num(u.drinking);
                  acc.industrial += num(u.industrial);
                  acc.hydropower += num(u.hydropower ?? u.hydroPower ?? 0);
                  acc.evaporationLoss += num(u.evaporationLoss);
                  acc.environmentalFlow += num(u.environmentalFlow);
                  acc.farmingSupport += num(u.farmingSupport);
                  return acc;
                }, { irrigation: 0, drinking: 0, industrial: 0, hydropower: 0, evaporationLoss: 0, environmentalFlow:0, farmingSupport:0 });
                return totals;
              })();

              return (
                <>
                  <UsageCard title="Irrigation  (total)" value={sourceTotals.irrigation +" MCM"} />
                  <UsageCard title="Drinking (total)" value={sourceTotals.drinking +" MCM"} />
                  <UsageCard title="Industrial (total)" value={sourceTotals.industrial +" MCM"} />
                  <UsageCard title="Hydropower (total)" value={sourceTotals.hydropower + " MCM"} />
                  <UsageCard title="Evaporation Loss (total)" value={sourceTotals.evaporationLoss + " MCM"} />
                  <UsageCard title="Environmental Flow (total)" value={sourceTotals.environmentalFlow + " MCM"} />
                  <UsageCard title="Farming Support (Hectares)" value={sourceTotals.farmingSupport + " Ha"} />
                </>
              );
            })()}
          </div>

          {/* Dam cards */}
          {allDisplay.length ? (
            <div className="dam-grid">
              {allDisplay.map(({ dam, usage }) => (
                <DamUsageCard
                  key={dam._id}
                  dam={dam}
                  usage={usage}
                  saved={savedIds.has(String(dam._id))}
                  onToggleSave={toggleSave}
                  onView={viewDam}
                />
              ))}
            </div>
          ) : (
            <div className="no-dams">No dams found for current selection.</div>
          )}

          {/* Chart area */}
          <div className="chart-area">
            <h3>Usage Chart</h3>
            {chartData ? (
              <Bar data={chartData} options={{
                responsive: true,
                plugins: {
                  legend: { position: 'top' },
                },
                scales: {
                  x: { stacked: false },
                  y: { beginAtZero: true }
                }
              }} />
            ) : (
              <div className="no-chart">Select a state/river/dam to view chart</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
