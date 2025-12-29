// components/SidePanel.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/SidePanel.css";

const API_BASE = "http://localhost:5000/api";

export default function SidePanel({ type, onClose }) {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const authHeader = token ? { Authorization: `Bearer ${token}` } : undefined;

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    
    const fetchData = async () => {
      if (!type || !token) return;

      setLoading(true);
      setError(null);
      setData(null);

      try {
        let endpoint = "";
        switch (type) {
          case "Alerts":
            endpoint = `${API_BASE}/sidebar/alerts`;
            break;
          case "Saved Dams":
            endpoint = `${API_BASE}/sidebar/saved-dams`;
            break;
          case "Guidelines":
            endpoint = `${API_BASE}/sidebar/guidelines`;
            break;
          case "Restricted Areas":
            endpoint = `${API_BASE}/sidebar/restricted-areas`;
            break;
          case "Public Spots":
            endpoint = `${API_BASE}/sidebar/public-spots`;
            break;
          case "History":
            endpoint = `${API_BASE}/sidebar/history`;
            break;
          case "Help":
            endpoint = `${API_BASE}/sidebar/help`;
            break;
          default:
            return;
        }

        const res = await axios.get(endpoint, { headers: authHeader });
        if (mounted) {
          setData(res.data);
        }
      } catch (err) {
        if (mounted) {
          console.error(`SidePanel fetch error for ${type}:`, err);
          setError(err.response?.data?.message || err.message || "Failed to load data");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchData();
    return () => {
      mounted = false;
    };
  }, [type, token]);

  const renderContent = () => {
    if (loading) return <div className="loading">Loading...</div>;
    if (error) return <div className="error">Error: {error}</div>;
    if (!data) return <div className="empty">No data available.</div>;

    switch (type) {
      case "Alerts":
        return renderAlerts();
      case "Saved Dams":
        return renderSavedDams();
      case "Guidelines":
        return renderGuidelines();
      case "Restricted Areas":
        return renderRestrictedAreas();
      case "Public Spots":
        return renderPublicSpots();
      case "History":
        return renderHistory();
      case "Help":
        return renderHelp();
      default:
        return <div className="empty">Unknown section.</div>;
    }
  };

  const renderAlerts = () => {
    if (!data.alerts?.length) {
      return <div className="empty">No alerts for your saved dams.</div>;
    }

    return (
      <div className="alerts-section">
        <div className="stats-bar">
          <div className="stat">
            <span className="stat-number">{data.total}</span>
            <span className="stat-label">Total Alerts</span>
          </div>
          <div className="stat critical">
            <span className="stat-number">{data.critical}</span>
            <span className="stat-label">Critical</span>
          </div>
        </div>
        
        <div className="alerts-list">
          {data.alerts.map((alert) => (
            <div key={alert._id} className={`alert-item ${alert.floodRiskLevel?.toLowerCase()}`}>
              <div className="alert-header">
                <h4>{alert.dam.name}</h4>
                <span className={`risk-badge ${alert.floodRiskLevel?.toLowerCase()}`}>
                  {alert.floodRiskLevel || "Unknown"}
                </span>
              </div>
              <div className="alert-details">
                <p><strong>Location:</strong> {alert.dam.state} • {alert.dam.river}</p>
                {alert.seepageReport && (
                  <p><strong>Seepage:</strong> {alert.seepageReport}</p>
                )}
                {alert.earthquakeZone && (
                  <p><strong>Earthquake Zone:</strong> {alert.earthquakeZone}</p>
                )}
                {alert.lastInspection && (
                  <p><strong>Last Inspection:</strong> {new Date(alert.lastInspection).toLocaleDateString()}</p>
                )}
                {alert.emergencyContact?.phone && (
                  <p><strong>Emergency:</strong> {alert.emergencyContact.phone}</p>
                )}
              </div>
              <button 
                className="view-dam-btn"
                onClick={() => {
                  navigate(`/dam-dashboard/${alert.dam._id}`);
                  onClose();
                }}
              >
                View Dam
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderSavedDams = () => {
    if (!data.dams?.length) {
      return <div className="empty">No saved dams found.</div>;
    }

    return (
      <div className="saved-dams-section">
        <div className="stats-bar">
          <div className="stat">
            <span className="stat-number">{data.total}</span>
            <span className="stat-label">Saved Dams</span>
          </div>
        </div>
        
        <div className="dams-list">
          {data.dams.map((dam) => (
            <div key={dam._id} className="dam-item">
              <div className="dam-header">
                <h4>{dam.name}</h4>
                {dam.safety?.floodRiskLevel && (
                  <span className={`risk-badge ${dam.safety.floodRiskLevel.toLowerCase()}`}>
                    {dam.safety.floodRiskLevel}
                  </span>
                )}
              </div>
              <div className="dam-details">
                <p><strong>Location:</strong> {dam.state} • {dam.river}</p>
                <p><strong>Type:</strong> {dam.damType} • <strong>Height:</strong> {dam.height}m</p>
                {dam.constructionYear && (
                  <p><strong>Built:</strong> {dam.constructionYear}</p>
                )}
                {dam.maxStorage && (
                  <p><strong>Capacity:</strong> {dam.maxStorage} MCM</p>
                )}
                {dam.recentEvents > 0 && (
                  <p><strong>Recent Events:</strong> {dam.recentEvents}</p>
                )}
              </div>
              <div className="dam-actions">
                <button 
                  className="view-dam-btn"
                  onClick={() => {
                    navigate(`/dam-dashboard/${dam._id}`);
                    onClose();
                  }}
                >
                  View Details
                </button>
                <button 
                  className="dashboard-btn"
                  onClick={() => {
                    navigate(`/dam-dashboard/${dam._id}`);
                    onClose();
                  }}
                >
                  Dashboard
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderGuidelines = () => {
    if (!data.guidelines || Object.keys(data.guidelines).length === 0) {
      return <div className="empty">No guidelines available for your saved dams.</div>;
    }

    return (
      <div className="guidelines-section">
        <div className="stats-bar">
          <div className="stat">
            <span className="stat-number">{data.total}</span>
            <span className="stat-label">Guidelines</span>
          </div>
          <div className="stat">
            <span className="stat-number">{data.categories.length}</span>
            <span className="stat-label">Categories</span>
          </div>
        </div>
        
        {Object.entries(data.guidelines).map(([category, guidelines]) => (
          <div key={category} className="category-section">
            <h3 className="category-title">{category.replace('_', ' ').toUpperCase()}</h3>
            <div className="guidelines-list">
              {guidelines.map((guideline) => (
                <div key={guideline._id} className={`guideline-item priority-${guideline.priority}`}>
                  <div className="guideline-header">
                    <h4>{guideline.title}</h4>
                    <span className={`priority-badge ${guideline.priority}`}>
                      {guideline.priority}
                    </span>
                  </div>
                  <p className="guideline-description">{guideline.description}</p>
                  {guideline.steps > 0 && (
                    <p className="guideline-steps">{guideline.steps} steps</p>
                  )}
                  {guideline.applicableDams?.length > 0 && (
                    <div className="applicable-dams">
                      <strong>Applicable to:</strong> {guideline.applicableDams.map(d => d.dam.name).join(', ')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderRestrictedAreas = () => {
    if (!data.areas || Object.keys(data.areas).length === 0) {
      return <div className="empty">No restricted areas found near your saved dams.</div>;
    }

    return (
      <div className="restricted-areas-section">
        <div className="stats-bar">
          <div className="stat">
            <span className="stat-number">{data.total}</span>
            <span className="stat-label">Restricted Areas</span>
          </div>
          <div className="stat">
            <span className="stat-number">{data.types.length}</span>
            <span className="stat-label">Types</span>
          </div>
        </div>
        
        {Object.entries(data.areas).map(([type, areas]) => (
          <div key={type} className="type-section">
            <h3 className="type-title">{type.replace('_', ' ').toUpperCase()}</h3>
            <div className="areas-list">
              {areas.map((area) => (
                <div key={area._id} className={`area-item restriction-${area.restrictionLevel}`}>
                  <div className="area-header">
                    <h4>{area.name}</h4>
                    <span className={`restriction-badge ${area.restrictionLevel}`}>
                      {area.restrictionLevel.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="area-description">{area.description}</p>
                  {area.location?.address && (
                    <p><strong>Location:</strong> {area.location.address}</p>
                  )}
                  {area.dangerType?.length > 0 && (
                    <p><strong>Dangers:</strong> {area.dangerType.join(', ')}</p>
                  )}
                  {area.nearbyDams?.length > 0 && (
                    <div className="nearby-dams">
                      <strong>Near:</strong> {area.nearbyDams.map(d => 
                        `${d.dam.name} (${d.distance}km)`
                      ).join(', ')}
                    </div>
                  )}
                  {area.contactAuthority?.phone && (
                    <p><strong>Contact:</strong> {area.contactAuthority.phone}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderPublicSpots = () => {
    if (!data.spots || Object.keys(data.spots).length === 0) {
      return <div className="empty">No public spots found near your saved dams.</div>;
    }

    return (
      <div className="public-spots-section">
        <div className="stats-bar">
          <div className="stat">
            <span className="stat-number">{data.total}</span>
            <span className="stat-label">Public Spots</span>
          </div>
          <div className="stat">
            <span className="stat-number">{data.types.length}</span>
            <span className="stat-label">Types</span>
          </div>
        </div>
        
        {Object.entries(data.spots).map(([type, spots]) => (
          <div key={type} className="type-section">
            <h3 className="type-title">{type.replace('_', ' ').toUpperCase()}</h3>
            <div className="spots-list">
              {spots.map((spot) => (
                <div key={spot._id} className="spot-item">
                  <div className="spot-header">
                    <h4>{spot.name}</h4>
                    <div className="rating">
                      {'★'.repeat(spot.rating)}{'☆'.repeat(5 - spot.rating)}
                    </div>
                  </div>
                  <p className="spot-description">{spot.description}</p>
                  {spot.location?.address && (
                    <p><strong>Address:</strong> {spot.location.address}</p>
                  )}
                  {spot.openingHours && (
                    <p><strong>Hours:</strong> {spot.openingHours}</p>
                  )}
                  {spot.facilities?.length > 0 && (
                    <p><strong>Facilities:</strong> {spot.facilities.join(', ')}</p>
                  )}
                  {spot.nearbyDams?.length > 0 && (
                    <div className="nearby-dams">
                      <strong>Near:</strong> {spot.nearbyDams.map(d => 
                        `${d.dam.name} (${d.distance}km)`
                      ).join(', ')}
                    </div>
                  )}
                  {spot.contactInfo?.phone && (
                    <p><strong>Contact:</strong> {spot.contactInfo.phone}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderHistory = () => {
    if (!data.history || Object.keys(data.history).length === 0) {
      return <div className="empty">No historical data available for your saved dams.</div>;
    }

    return (
      <div className="history-section">
        <div className="stats-bar">
          <div className="stat">
            <span className="stat-number">{data.stats.totalEvents}</span>
            <span className="stat-label">Total Events</span>
          </div>
          <div className="stat">
            <span className="stat-number">{data.stats.floods}</span>
            <span className="stat-label">Floods</span>
          </div>
          <div className="stat critical">
            <span className="stat-number">{data.stats.criticalEvents}</span>
            <span className="stat-label">Critical</span>
          </div>
          <div className="stat">
            <span className="stat-number">{data.stats.recentEvents}</span>
            <span className="stat-label">Recent (6mo)</span>
          </div>
        </div>
        
        {Object.entries(data.history).map(([damName, damHistory]) => (
          <div key={damName} className="dam-history-section">
            <h3 className="dam-title">
              {damName}
              <button 
                className="view-dam-btn small"
                onClick={() => {
                  navigate(`/dam-dashboard/${damHistory.dam._id}`);
                  onClose();
                }}
              >
                View Dam
              </button>
            </h3>
            <div className="events-list">
              {damHistory.events.slice(0, 10).map((event) => (
                <div key={event._id} className={`event-item ${event.eventType} severity-${event.severity}`}>
                  <div className="event-header">
                    <h4>{event.title}</h4>
                    <div className="event-meta">
                      <span className={`event-type ${event.eventType}`}>
                        {event.eventType}
                      </span>
                      <span className={`severity-badge ${event.severity}`}>
                        {event.severity}
                      </span>
                      <span className="event-date">
                        {new Date(event.eventDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <p className="event-description">{event.description}</p>
                  {event.impact && (
                    <p><strong>Impact:</strong> {event.impact}</p>
                  )}
                  {event.actionsTaken && (
                    <p><strong>Actions Taken:</strong> {event.actionsTaken}</p>
                  )}
                  {event.cost > 0 && (
                    <p><strong>Cost:</strong> ₹{event.cost.toLocaleString()}</p>
                  )}
                  {event.duration && (
                    <p><strong>Duration:</strong> {event.duration}</p>
                  )}
                  {event.affectedAreas?.length > 0 && (
                    <p><strong>Affected Areas:</strong> {event.affectedAreas.join(', ')}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderHelp = () => {
    if (!data.sections) {
      return <div className="empty">Help information not available.</div>;
    }

    return (
      <div className="help-section">
        <div className="help-header">
          <h3>Dam Management System Help</h3>
          <p>Version {data.version} • Last updated: {new Date(data.lastUpdated).toLocaleDateString()}</p>
        </div>
        
        {data.sections.map((section, index) => (
          <div key={index} className="help-category">
            <h4 className="help-category-title">{section.title}</h4>
            <div className="help-items">
              {section.items.map((item, itemIndex) => (
                <div key={itemIndex} className="help-item">
                  <h5 className="help-question">{item.question}</h5>
                  <p className="help-answer">{item.answer}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
        
        <div className="help-contacts">
          <h4>Contact Information</h4>
          <div className="contact-list">
            <div className="contact-item">
              <strong>Technical Support:</strong> {data.contacts.technical}
            </div>
            <div className="contact-item">
              <strong>Emergency Helpline:</strong> {data.contacts.emergency}
            </div>
            <div className="contact-item">
              <strong>General Inquiries:</strong> {data.contacts.general}
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (!token && type !== "Help") {
    return (
      <div className="side-panel-overlay" role="dialog" onClick={onClose}>
        <div className="side-panel" onClick={(e) => e.stopPropagation()}>
          <div className="side-panel-header">
            <h3 className="side-panel-title">{type}</h3>
            <button className="close-btn" onClick={onClose} aria-label="Close panel">
              ✕
            </button>
          </div>
          <div className="side-panel-body">
            <div className="auth-required">
              <h4>Login Required</h4>
              <p>Please login to view {type.toLowerCase()} for your saved dams.</p>
              <button 
                className="login-btn"
                onClick={() => {
                  navigate("/login");
                  onClose();
                }}
              >
                Go to Login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="side-panel-overlay" role="dialog" onClick={onClose}>
      <div className="side-panel" onClick={(e) => e.stopPropagation()}>
        <div className="side-panel-header">
          <h3 className="side-panel-title">{type}</h3>
          <button className="close-btn" onClick={onClose} aria-label="Close panel">
            ✕
          </button>
        </div>
        <div className="side-panel-body">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
