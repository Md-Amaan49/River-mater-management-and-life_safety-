import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/AlertDashboard.css";

const API_BASE = "http://localhost:5000/api";

export default function TestAlertDashboard() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [criticalAlerts, setCriticalAlerts] = useState(null);

  useEffect(() => {
    fetchTestData();
  }, []);

  const fetchTestData = async () => {
    try {
      setLoading(true);
      const [dashboardResponse, criticalResponse] = await Promise.all([
        axios.get(`${API_BASE}/alerts/test/dashboard`),
        axios.get(`${API_BASE}/alerts/test/critical`)
      ]);
      
      setDashboardData(dashboardResponse.data);
      setCriticalAlerts(criticalResponse.data);
    } catch (error) {
      console.error("Error fetching test data:", error);
    } finally {
      setLoading(false);
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
    alert(`This would navigate to dam details for: ${damId}`);
  };

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
        <h1>🚨 Dam Alert Dashboard (Test Mode)</h1>
        <p>Real-time monitoring of dam safety and water conditions across India</p>
        <div style={{ background: '#fef3c7', padding: '12px', borderRadius: '8px', margin: '16px 0', border: '1px solid #f59e0b' }}>
          <strong>⚠️ Test Mode:</strong> This dashboard shows realistic sample data to demonstrate the alert system functionality.
        </div>
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
                      📍 {alert.dam.state} • {alert.dam.river} River
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
                          {alert.emergencyContact.email && (
                            <p>✉️ {alert.emergencyContact.email}</p>
                          )}
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
                      📍 {alert.dam.state} • {alert.dam.river} River
                    </div>
                    <div className="alert-details">
                      <p><strong>Seepage Report:</strong></p>
                      <p className="seepage-text">{alert.seepageReport}</p>
                      
                      {alert.earthquakeZone && (
                        <p><strong>Earthquake Zone:</strong> {alert.earthquakeZone}</p>
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

      {/* Additional Information */}
      <div style={{ background: '#f0f9ff', padding: '20px', borderRadius: '12px', marginTop: '40px', border: '1px solid #bfdbfe' }}>
        <h3>📋 Alert System Features</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginTop: '16px' }}>
          <div>
            <h4>🔴 High Risk Alerts</h4>
            <ul>
              <li>Critical seepage issues</li>
              <li>Structural damage concerns</li>
              <li>Emergency spillway operations</li>
              <li>Immediate evacuation protocols</li>
            </ul>
          </div>
          <div>
            <h4>🟡 Medium Risk Alerts</h4>
            <ul>
              <li>Elevated water levels</li>
              <li>Routine maintenance due</li>
              <li>Seasonal monitoring</li>
              <li>Equipment performance issues</li>
            </ul>
          </div>
          <div>
            <h4>🟢 Low Risk Status</h4>
            <ul>
              <li>Normal operations</li>
              <li>Regular monitoring</li>
              <li>Preventive maintenance</li>
              <li>Stable conditions</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}