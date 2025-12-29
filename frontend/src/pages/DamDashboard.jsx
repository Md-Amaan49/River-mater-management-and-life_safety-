import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  RadialBarChart,
  RadialBar,
  ResponsiveContainer,
} from "recharts";
import "../styles/DamDashboard.css";

const DAM_API = "https://river-water-management-and-life-safety.onrender.com/api/dam";
const DATA_API = "https://river-water-management-and-life-safety.onrender.com/api/data";
const USAGE_API = "https://river-water-management-and-life-safety.onrender.com/api/water-usage";
const SENSORS_API = "https://river-water-management-and-life-safety.onrender.com/api/sensors";
const USER_API = "https://river-water-management-and-life-safety.onrender.com/api/users";

// Compact Card
const Card = ({ title, children, className = "" }) => (
  <div className={`card ${className}`}>
    {title ? <div className="card-title">{title}</div> : null}
    {children}
  </div>
);

export default function DamDashboard() {
  const { damId } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const authHeader = token ? { Authorization: `Bearer ${token}` } : undefined;

  const [core, setCore] = useState(null);
  const [status, setStatus] = useState(null);
  const [history, setHistory] = useState([]);
  const [usage, setUsage] = useState(null);
  const [sensors, setSensors] = useState([]);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [coreRes, statusRes, histRes, usageRes, sensorsRes] =
          await Promise.all([
            axios.get(`${DAM_API}/core/${damId}`),
            axios
              .get(`${DATA_API}/dam/${damId}/status`)
              .catch(() => ({ data: null })),
            axios
              .get(`${DATA_API}/dam/${damId}/status/history`, {
                params: { limit: 48 },
              })
              .catch(() => ({ data: [] })),
            axios.get(`${USAGE_API}/${damId}`).catch(() => ({ data: null })),
            axios.get(`${SENSORS_API}?damId=${damId}`).catch(() => ({
              data: [],
            })),
          ]);
        setCore(coreRes?.data || null);
        setStatus(statusRes?.data || null);
        setHistory(Array.isArray(histRes?.data) ? histRes.data : []);
        setUsage(usageRes?.data || null);
        setSensors(Array.isArray(sensorsRes?.data) ? sensorsRes.data : []);

        // Check if dam is saved
        if (token) {
          try {
            const savedRes = await axios.get(`${USER_API}/saved-dams`, { headers: authHeader });
            const savedDams = savedRes.data || [];
            const isCurrentDamSaved = savedDams.some(item => {
              const dam = item.dam || item;
              return String(dam._id) === String(damId);
            });
            setIsSaved(isCurrentDamSaved);
          } catch (err) {
            console.error("Error checking saved status:", err);
          }
        }
      } catch (err) {
        console.error("Error loading dashboard:", err);
      }
    })();
  }, [damId, token]);

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

  // Derived datasets
  const reservoirPct = useMemo(() => {
    if (!status) return null;
    if (status.levelUnit === "%") return status.currentWaterLevel;
    if (status.maxLevel && status.minLevel) {
      return (
        ((status.currentWaterLevel - status.minLevel) /
          (status.maxLevel - status.minLevel)) *
        100
      );
    }
    return null;
  }, [status]);

  const flowSeries = useMemo(() => {
    return [...history].reverse().map((h) => ({
      t: new Date(h.createdAt || h.updatedAt),
      Inflow: h.inflowRate,
      Outflow: h.outflowRate,
    }));
  }, [history]);

  const levelSeries = useMemo(() => {
    return [...history].reverse().map((h) => ({
      t: new Date(h.createdAt || h.updatedAt),
      level: h.currentWaterLevel,
    }));
  }, [history]);

  const usagePie = useMemo(() => {
    if (!usage) return [];
    return [
      { name: "Irrigation", value: usage.irrigation },
      { name: "Residential", value: usage.drinking },
      { name: "Industrial", value: usage.industrial },
      { name: "Hydropower", value: usage.hydropower },
      { name: "Env. Flow", value: usage.environmentalFlow },
      { name: "Evap. Loss", value: usage.evaporationLoss },
    ].filter((u) => u.value > 0);
  }, [usage]);

  return (
    <div className="dashboard">
      {/* Dashboard Header */}
      <div className="dashboard-header">
        <div className="dam-info">
          <h1 className="dam-name">{core?.name || "Dam Dashboard"}</h1>
          <p className="dam-location">{core?.riverName} • {core?.state}</p>
        </div>
        <div className="dashboard-actions">
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

      <div className="grid-top">
        {/* KPI */}
        <Card title="Current Level">
          {status?.currentWaterLevel} {status?.levelUnit}
        </Card>
        <Card title="Inflow">{status?.inflowRate} m³/s</Card>
        <Card title="Outflow">{status?.outflowRate} m³/s</Card>
        <Card title="Gates Open">
          {status?.gateStatus?.filter((g) => g.status === "open").length || 0}
        </Card>
        <Card title="Max Storage">{core?.maxStorage} MCM</Card>
        <Card title="Last Sync">
          {status?.lastSyncAt
            ? new Date(status.lastSyncAt).toLocaleString()
            : "—"}
        </Card>
      </div>

      <div className="grid-charts">
        {/* Reservoir Gauge */}
        <Card title="Reservoir Fill %">
          <div className="chart-small">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart
                innerRadius="70%"
                outerRadius="100%"
                data={[{ value: reservoirPct || 0 }]}
                startAngle={180}
                endAngle={0}
              >
                <RadialBar
                  dataKey="value"
                  clockWise
                  cornerRadius={10}
                  fill={
                    (reservoirPct || 0) < 70
                      ? "#34d399"
                      : (reservoirPct || 0) < 90
                      ? "#fbbf24"
                      : "#f87171"
                  }
                />
                <text
                  x="50%"
                  y="60%"
                  textAnchor="middle"
                  fill="#fff"
                  fontSize={18}
                >
                  {reservoirPct ? `${Math.round(reservoirPct)}%` : "—"}
                </text>
              </RadialBarChart>
            </ResponsiveContainer>
          </div>
        </Card>



        {/* Flow Bar */}
        <Card title="Inflow vs Outflow">
          <div className="chart-small">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={flowSeries}>
                <XAxis
                  dataKey="t"
                  tickFormatter={(t) =>
                    new Date(t).toISOString().split("T")[1].slice(0, 5) // HH:MM UTC
                  }
                />
                <Tooltip
                  labelFormatter={(t) =>
                    new Date(t).toISOString().replace("T", " ").replace("Z", " UTC")
                  }
                />
                <YAxis />
                <Tooltip
                  labelFormatter={(t) => new Date(t).toLocaleString()}
                  formatter={(val, name) => [`${val} m³/s`, name]}
                />
                <Legend />
                <Bar dataKey="Inflow" fill="#60a5fa" />
                <Bar dataKey="Outflow" fill="#f87171" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Level Line */}
        <Card title="Water Level Trend">
          <div className="chart-small">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={levelSeries}>
                <XAxis
                  dataKey="t"
                  tickFormatter={(t) =>
                    new Date(t).toISOString().split("T")[1].slice(0, 5) // HH:MM UTC
                  }
                />
                <YAxis />
                <Tooltip
                  labelFormatter={(t) =>
                    new Date(t).toISOString().replace("T", " ").replace("Z", " UTC")
                  }
                  formatter={(val, name) => [`${val} m`, name]}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="level"
                  stroke="#34d399"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Usage Pie */}
        <Card title="Water Usage">
          <div className="chart-small">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={usagePie}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={70}
                  label
                >
                  {usagePie.map((_, i) => (
                    <Cell
                      key={i}
                      fill={
                        [
                          "#34d399",
                          "#60a5fa",
                          "#fbbf24",
                          "#f87171",
                          "#a78bfa",
                          "#facc15",
                        ][i % 6]
                      }
                    />
                  ))}
                </Pie>
                <Tooltip formatter={(val, name) => [`${val} MCM`, name]} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Core Info */}
      <Card title="Core Details">
        <div className="details-grid">
          {Object.entries({
            River: core?.riverName,
            Coordinates: core?.coordinates ? `${core.coordinates.lat?.toFixed(4)}, ${core.coordinates.lng?.toFixed(4)}` : "—",
            "Year Built": core?.constructionYear,
            Operator: core?.operator,
            "Live Storage": core?.liveStorage ? core.liveStorage + " MCM" : "—",
            "Dead Storage": core?.deadStorage ? core.deadStorage + " MCM" : "—",
            Catchment: core?.catchmentArea || "—",
            "Surface Area": core?.surfaceArea || "—",
            Height: core?.height || "—",
            Length: core?.length || "—",
            Type: core?.damType,
          }).map(([k, v]) => (
            <div key={k} className="detail-item">
              <span className="detail-label">{k}</span>
              <span>{v || "—"}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Gate Status */}
      <Card title="Gate Status">
        {status?.gateStatus?.length ? (
          <table className="compact-table">
            <thead>
              <tr>
                <th>Gate</th>
                <th>Status</th>
                <th>% Open</th>
              </tr>
            </thead>
            <tbody>
              {status.gateStatus.map((g, i) => (
                <tr key={i}>
                  <td>{g.gateNumber}</td>
                  <td>{g.status}</td>
                  <td>{g.percentageOpen || 0}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          "No data"
        )}
      </Card>

      {/* Sensors */}
      <Card title="Sensors">
        {sensors?.length ? (
          <table className="compact-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Type</th>
                <th>Status</th>
                <th>Battery</th>
                <th>Last</th>
              </tr>
            </thead>
            <tbody>
              {sensors.map((s) => (
                <tr key={s._id}>
                  <td>{s.sensorId || "—"}</td>
                  <td>{s.type || "—"}</td>
                  <td>{s.status || "—"}</td>
                  <td>{s.batteryStatus || "—"}</td>
                  <td>
                    {s.lastReading ? `${s.lastReading} ${s.unit || ""}` : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No sensors configured</p>
        )}
      </Card>
    </div>
  );
}
