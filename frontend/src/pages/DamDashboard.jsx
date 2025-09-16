import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
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

const DAM_API = "http://localhost:5000/api/dam";
const DATA_API = "http://localhost:5000/api/data";
const USAGE_API = "http://localhost:5000/api/water-usage";
const SENSORS_API = "http://localhost:5000/api/sensors";

// Compact Card
const Card = ({ title, children, className = "" }) => (
  <div className={`card ${className}`}>
    {title ? <div className="card-title">{title}</div> : null}
    {children}
  </div>
);

export default function DamDashboard() {
  const { damId } = useParams();

  const [core, setCore] = useState(null);
  const [status, setStatus] = useState(null);
  const [history, setHistory] = useState([]);
  const [usage, setUsage] = useState(null);
  const [sensors, setSensors] = useState([]);

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
      } catch (err) {
        console.error("Error loading dashboard:", err);
      }
    })();
  }, [damId]);

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
        endAngle={180 - ((reservoirPct || 0) / 100) * 180} // dynamically cut arc
      >
        <RadialBar
          dataKey="value"
          clockWise
          cornerRadius={10}
          fill={
            reservoirPct < 70
              ? "#34d399"
              : reservoirPct < 90
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
                <Tooltip
                  labelFormatter={(t) =>
                    new Date(t).toISOString().replace("T", " ").replace("Z", " UTC")
                  }
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
            Coordinates: core?.coordinates,
            "Year Built": core?.constructionYear,
            Operator: core?.operator,
            "Live Storage": core?.liveStorage + " MCM",
            "Dead Storage": core?.deadStorage + " MCM",
            Catchment: core?.catchmentArea,
            "Surface Area": core?.surfaceArea,
            Height: core?.height,
            Length: core?.length,
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
                <td>{s.sensorId}</td>
                <td>{s.type}</td>
                <td>{s.status}</td>
                <td>{s.batteryStatus}</td>
                <td>
                  {s.lastReading} {s.unit}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
