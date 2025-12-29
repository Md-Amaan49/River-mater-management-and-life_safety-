import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/AlertDashboard.css";

const API_BASE = "http://localhost:5000/api";

export default function AlertDashboard() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const authHeader = token ? { Authorization: `Bearer ${token}` } : undefined;

  const [loading, setLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [criticalAlerts, setCriticalAlerts] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [selectedState, setSelectedState] = useState("");

  useEffect(() => {
    if (token) {
      fetchDashboardData();
      fetchCriticalAlerts();
    }
  }, [token]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE}/alerts/dashboard`, { headers: authHeader });
      setDashboardData(response.data);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCriticalAlerts = async () => {
    try {
      const response = await axios.get(`${API_BASE}/alerts/critical`, { headers: authHeader });
      setCriticalAlerts(response.data);
    } catch (error) {
      console.error("Error fetching critical alerts:", error);
    }
  };

  const getRiskLevelColor = (level) => {
    switch (level?.toLowerCase()) {
      case 'red': return '#ef4444';
      case 'yellow': return '#f59e0b';
      case 'green': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getRiskLevelIcon = (level) => {
    switch (level?.toLowerCase()) {
      case 'red': return '🔴';
      case 'yellow': return '🟡';
      case 'green': return '🟢';
      default: return '⚪';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const handleViewDam = (damId) => {
    navigate(`/dam-dashboard/${damId}`);
  };

  if (!token) {
    return (
      <div className="alert-dashboard">
        <div className="auth-required">
          <h2>🚨 Alert Dashboard</h2>
          <p>Please login to view dam alerts and safety information.</p>
          <button onClick={() => navigate("/login")} className="login-btn">
            Login to View Alerts
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="alert-dashboard">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading alert dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="alert-dashboard">
      <div className="dashboard-header">
        <h1>🚨 Dam Alert Dashboard</h1>
        <p>Real-time monitoring of dam safety and water conditions across India</p>
      </div>

      {/* Overview Statistics */}
      {dashboardData && (
        <div className="stats-overview">
          <div className="stat-card total">
            <div className="stat-icon">📊</div>
            <div className="stat-content">
              <h3>{dashboardData.overview.totalAlerts}</h3>
              <p>Total Dams Monitored</p>
            </div>
          </div>
          
          <div className="stat-card critical">
            <div className="stat-icon">⚠️</div>
            <div className="stat-content">
              <h3>{dashboardData.overview.criticalAlerts}</h3>
              <p>Critical Alerts</p>
            </div>
          </div>

          <div className="stat-card red">
            <div className="stat-icon">🔴</div>
            <div className="stat-content">
              <h3>{dashboardData.overview.riskDistribution.Red || 0}</h3>
              <p>High Risk</p>
            </div>
          </div>

          <div className="stat-card yellow">
            <div className="stat-icon">🟡</div>
            <div className="stat-content">
              <h3>{dashboardData.overview.riskDistribution.Yellow || 0}</h3>
              <p>Medium Risk</p>
            </div>
          </div>

          <div className="stat-card green">
            <div className="stat-icon">🟢</div>
            <div className="stat-content">
              <h3>{dashboardData.overview.riskDistribution.Green || 0}</h3>
              <p>Low Risk</p>
            </div>
          </div>
        </div>
      )}

      {/* Critical Alerts Section */}
      {criticalAlerts && (
        <div className="critical-alerts-section">
          <h2>🚨 Critical Alerts Requiring Immediate Attention</h2>
          
          {criticalAlerts.critical.red.length > 0 && (
            <div className="alert-category">
              <h3 className="category-title red">🔴 High Risk Alerts ({criticalAlerts.critical.red.length})</h3>
              <div className="alerts-grid">
                {criticalAlerts.critical.red.map((alert) => (
                  <div key={alert._id} className="alert-card red">
                    <div className="alert-header">
                      <h4>{alert.dam.name}</h4>
                      <span className="risk-badge red">HIGH RISK</span>
                    </div>
                    <div className="alert-location">
                      📍 {alert.dam.state} • {alert.dam.river || alert.dam.riverName} River
                    </div>
                    <div className="alert-details">
                      <p><strong>Seepage Report:</strong></p>
                      <p className="seepage-text">{alert.seepageReport}</p>
                      
                      {alert.structuralHealth && (
                        <div className="structural-health">
                          <p><strong>Structural Concerns:</strong></p>
                          {alert.structuralHealth.cracks && (
                            <p>• Cracks: {alert.structuralHealth.cracks}</p>
                          )}
                          {alert.structuralHealth.vibration && (
                            <p>• Vibration: {alert.structuralHealth.vibration}</p>
                          )}
                          {alert.structuralHealth.tilt && (
                            <p>• Tilt: {alert.structuralHealth.tilt}</p>
                          )}
                        </div>
                      )}
                      
                      {alert.emergencyContact && (
                        <div className="emergency-contact">
                          <p><strong>Emergency Contact:</strong></p>
                          <p>{alert.emergencyContact.authorityName}</p>
                          <p>📞 {alert.emergencyContact.phone}</p>
                        </div>
                      )}
                    </div>
                    <div className="alert-actions">
                      <button 
                        className="view-dam-btn"
                        onClick={() => handleViewDam(alert.dam._id)}
                      >
                        View Dam Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {criticalAlerts.critical.yellow.length > 0 && (
            <div className="alert-category">
              <h3 className="category-title yellow">🟡 Medium Risk Alerts ({criticalAlerts.critical.yellow.length})</h3>
              <div className="alerts-grid">
                {criticalAlerts.critical.yellow.map((alert) => (
                  <div key={alert._id} className="alert-card yellow">
                    <div className="alert-header">
                      <h4>{alert.dam.name}</h4>
                      <span className="risk-badge yellow">MEDIUM RISK</span>
                    </div>
                    <div className="alert-location">
                      📍 {alert.dam.state} • {alert.dam.river || alert.dam.riverName} River
                    </div>
                    <div className="alert-details">
                      <p><strong>Seepage Report:</strong></p>
                      <p className="seepage-text">{alert.seepageReport}</p>
                      
                      {alert.earthquakeZone && (
                        <p><strong>Earthquake Zone:</strong> {alert.earthquakeZone}</p>
                      )}
                      
                      {alert.maintenance && alert.maintenance.nextInspection && (
                        <p><strong>Next Inspection:</strong> {formatDate(alert.maintenance.nextInspection)}</p>
                      )}
                    </div>
                    <div className="alert-actions">
                      <button 
                        className="view-dam-btn"
                        onClick={() => handleViewDam(alert.dam._id)}
                      >
                        View Dam Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* State-wise Distribution */}
      {dashboardData && dashboardData.topStates && (
        <div className="state-distribution">
          <h2>📍 State-wise Alert Distribution</h2>
          <div className="states-grid">
            {dashboardData.topStates.map((state) => (
              <div key={state._id} className="state-card">
                <h4>{state._id}</h4>
                <div className="state-stats">
                  <div className="state-stat">
                    <span className="stat-number">{state.totalAlerts}</span>
                    <span className="stat-label">Total</span>
                  </div>
                  <div className="state-stat red">
                    <span className="stat-number">{state.redAlerts}</span>
                    <span className="stat-label">High Risk</span>
                  </div>
                  <div className="state-stat yellow">
                    <span className="stat-number">{state.yellowAlerts}</span>
                    <span className="stat-label">Medium Risk</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Maintenance Schedule */}
      {dashboardData && dashboardData.maintenanceDue && dashboardData.maintenanceDue.length > 0 && (
        <div className="maintenance-schedule">
          <h2>🔧 Upcoming Maintenance Schedule</h2>
          <div className="maintenance-list">
            {dashboardData.maintenanceDue.map((item, index) => (
              <div key={index} className="maintenance-item">
                <div className="maintenance-info">
                  <h4>{item.damName}</h4>
                  <p>{item.state}</p>
                </div>
                <div className="maintenance-date">
                  <span className="days-until">
                    {item.daysUntilInspection > 0 
                      ? `${item.daysUntilInspection} days` 
                      : 'Overdue'
                    }
                  </span>
                  <span className="inspection-date">{formatDate(item.nextInspection)}</span>
                </div>
                <div className="maintenance-risk">
                  {getRiskLevelIcon(item.riskLevel)} {item.riskLevel}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}