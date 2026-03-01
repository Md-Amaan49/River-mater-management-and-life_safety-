import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "../styles/SafetyAlertPage.css";

const API_URL = "http://localhost:5000";

const SafetyAlertPage = () => {
  const { damId } = useParams();
  const [activeTab, setActiveTab] = useState("input");
  const [damName, setDamName] = useState("");
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    // Input Fields
    currentWaterLevel: "",
    maxCapacity: "",
    currentStorage: "",
    inflowRate: "",
    outflowRate: "",
    safeDischargeLimit: "",
    forecastRainfall: "",
    rainfallThreshold: "",
    damStressLevel: "",
    structuralHealthScore: "",
    gateOperationStatus: "Normal",
    downstreamDistance: "",
    riverVelocity: "",
    affectedDistricts: "",
    affectedVillagesList: "",
    expectedAffectedPopulation: "",
    safeZones: "",
    evacuationRoutes: "",
    safeRouteMap: "",
    bridgeSubmergenceRisk: "",
    economicLossBase: "",
    waterReleaseTime: "",
    safetyInstructions: "",
    
    // Calculated Fields (read-only)
    predictedWaterLevel_1hr: "",
    predictedWaterLevel_6hr: "",
    netInflowRate: "",
    availableStorage: "",
    timeToFullCapacity: "",
    requiredSpillwayIncrease: "",
    downstreamFloodArrivalTime: "",
    damStressIndex: "",
    floodRiskScore: "",
    structuralFailureProbability: "",
    emergencyGateOperationTime: "",
    predictedFloodTime: "",
    evacuationLeadTime: "",
    economicLossEstimate: "",
    emergencyLevel: "",
    predictedWaterDepth: "",
    rescueWindowTime: "",
    alertLevel: "",
    estimatedTimeOfFlood: "",
    
    // Alert Flags
    alerts: {
      criticalGateActionRequired: false,
      immediateSpillwayAdjustment: false,
      upstreamSurgeIncoming: false,
      heavyRainfallPredicted: false,
      structuralStressWarning: false,
      floodWatchAdvisory: false,
      districtFloodWarning: false,
      evacuationRecommended: false,
      nationalDisasterAlert: false,
      prepareDeployment: false,
      immediateMobilization: false,
      roadCutoffExpected: false,
    }
  });
  const [isExisting, setIsExisting] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch dam name first
        try {
          const damRes = await axios.get(`${API_URL}/api/dam/${damId}`);
          if (damRes.data && damRes.data.name) {
            setDamName(damRes.data.name);
          }
        } catch (damError) {
          console.log("Could not fetch dam name:", damError.message);
        }
        
        // Fetch safety alert data
        const res = await axios.get(`${API_URL}/api/safety-alert/dam/${damId}`);
        if (res.data) {
          setFormData(res.data);
          setIsExisting(true);
        }
      } catch (error) {
        console.log("No existing safety alert data found. You can create new data.");
        setIsExisting(false);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [damId]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let res;
      if (isExisting) {
        res = await axios.put(`${API_URL}/api/safety-alert/dam/${damId}`, formData);
        setMessage("Safety alert data updated successfully.");
      } else {
        res = await axios.post(`${API_URL}/api/safety-alert/dam/${damId}`, formData);
        setIsExisting(true);
        setMessage("Safety alert data saved successfully.");
      }
      
      // Refresh data to get calculated fields
      if (res.data) {
        setFormData(res.data);
      }
    } catch (error) {
      console.error("Save/Update error:", error);
      setMessage("Failed to save/update safety alert data.");
    }
  };

  const getAlertColor = (level) => {
    switch(level) {
      case "Safe": return "#4CAF50";
      case "Be Alert": return "#FFC107";
      case "Move To Safer Area": return "#FF9800";
      case "Evacuate Immediately": return "#F44336";
      default: return "#9E9E9E";
    }
  };

  const getEmergencyColor = (level) => {
    switch(level) {
      case "Normal": return "#4CAF50";
      case "Watch": return "#2196F3";
      case "Warning": return "#FF9800";
      case "Critical": return "#FF5722";
      case "Disaster": return "#F44336";
      default: return "#9E9E9E";
    }
  };

  // Helper function to safely format numbers
  const formatNumber = (value, decimals = 2) => {
    if (value === null || value === undefined || value === "") return "N/A";
    const num = Number(value);
    if (isNaN(num)) return "N/A";
    return num.toFixed(decimals);
  };

  const renderInputFields = () => (
    <div>
      <div className="form-section">
        <h3 className="form-section-title">💧 Current State Parameters</h3>
        <div className="form-grid">
          <div className="form-group">
            <label>Current Water Level (m)</label>
            <input name="currentWaterLevel" value={formData.currentWaterLevel || ""} onChange={handleChange} type="number" step="0.01" />
          </div>
          <div className="form-group">
            <label>Max Capacity (m³)</label>
            <input name="maxCapacity" value={formData.maxCapacity || ""} onChange={handleChange} type="number" step="0.01" />
          </div>
          <div className="form-group">
            <label>Current Storage (m³)</label>
            <input name="currentStorage" value={formData.currentStorage || ""} onChange={handleChange} type="number" step="0.01" />
          </div>
          <div className="form-group">
            <label>Inflow Rate (m³/s)</label>
            <input name="inflowRate" value={formData.inflowRate || ""} onChange={handleChange} type="number" step="0.01" />
          </div>
          <div className="form-group">
            <label>Outflow Rate (m³/s)</label>
            <input name="outflowRate" value={formData.outflowRate || ""} onChange={handleChange} type="number" step="0.01" />
          </div>
          <div className="form-group">
            <label>Safe Discharge Limit (m³/s)</label>
            <input name="safeDischargeLimit" value={formData.safeDischargeLimit || ""} onChange={handleChange} type="number" step="0.01" />
          </div>
        </div>
      </div>

      <div className="form-section">
        <h3 className="form-section-title">🌧️ Weather & Predictions</h3>
        <div className="form-grid">
          <div className="form-group">
            <label>Forecast Rainfall (mm)</label>
            <input name="forecastRainfall" value={formData.forecastRainfall || ""} onChange={handleChange} type="number" step="0.01" />
          </div>
          <div className="form-group">
            <label>Rainfall Threshold (mm)</label>
            <input name="rainfallThreshold" value={formData.rainfallThreshold || ""} onChange={handleChange} type="number" step="0.01" />
          </div>
        </div>
      </div>

      <div className="form-section">
        <h3 className="form-section-title">🏗️ Structural Parameters</h3>
        <div className="form-grid">
          <div className="form-group">
            <label>Dam Stress Level (0-1)</label>
            <input name="damStressLevel" value={formData.damStressLevel || ""} onChange={handleChange} type="number" step="0.01" min="0" max="1" />
          </div>
          <div className="form-group">
            <label>Structural Health Score (0-100)</label>
            <input name="structuralHealthScore" value={formData.structuralHealthScore || ""} onChange={handleChange} type="number" step="0.01" min="0" max="100" />
          </div>
          <div className="form-group">
            <label>Gate Operation Status</label>
            <select name="gateOperationStatus" value={formData.gateOperationStatus || "Normal"} onChange={handleChange}>
              <option value="Normal">Normal</option>
              <option value="Partial">Partial</option>
              <option value="Emergency">Emergency</option>
              <option value="Closed">Closed</option>
            </select>
          </div>
        </div>
      </div>

      <div className="form-section">
        <h3 className="form-section-title">🏘️ Downstream Information</h3>
        <div className="form-grid">
          <div className="form-group">
            <label>Downstream Distance (km)</label>
            <input name="downstreamDistance" value={formData.downstreamDistance || ""} onChange={handleChange} type="number" step="0.01" />
          </div>
          <div className="form-group">
            <label>River Velocity (m/s)</label>
            <input name="riverVelocity" value={formData.riverVelocity || ""} onChange={handleChange} type="number" step="0.01" />
          </div>
          <div className="form-group">
            <label>Affected Districts</label>
            <input name="affectedDistricts" value={formData.affectedDistricts || ""} onChange={handleChange} placeholder="Comma-separated" />
          </div>
          <div className="form-group">
            <label>Expected Affected Population</label>
            <input name="expectedAffectedPopulation" value={formData.expectedAffectedPopulation || ""} onChange={handleChange} type="number" />
          </div>
          <div className="form-group">
            <label>Bridge Submergence Risk (0-100)</label>
            <input name="bridgeSubmergenceRisk" value={formData.bridgeSubmergenceRisk || ""} onChange={handleChange} type="number" step="0.01" min="0" max="100" />
          </div>
          <div className="form-group">
            <label>Economic Loss Base (₹)</label>
            <input name="economicLossBase" value={formData.economicLossBase || ""} onChange={handleChange} type="number" step="0.01" />
          </div>
          <div className="form-group" style={{gridColumn: '1 / -1'}}>
            <label>Affected Villages List</label>
            <textarea name="affectedVillagesList" value={formData.affectedVillagesList || ""} onChange={handleChange} rows="3" />
          </div>
        </div>
      </div>

      <div className="form-section">
        <h3 className="form-section-title">🚨 Safety & Evacuation</h3>
        <div className="form-grid">
          <div className="form-group" style={{gridColumn: '1 / -1'}}>
            <label>Safe Zones</label>
            <textarea name="safeZones" value={formData.safeZones || ""} onChange={handleChange} rows="2" />
          </div>
          <div className="form-group" style={{gridColumn: '1 / -1'}}>
            <label>Evacuation Routes</label>
            <textarea name="evacuationRoutes" value={formData.evacuationRoutes || ""} onChange={handleChange} rows="2" />
          </div>
          <div className="form-group">
            <label>Safe Route Map (URL)</label>
            <input name="safeRouteMap" value={formData.safeRouteMap || ""} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Water Release Time</label>
            <input name="waterReleaseTime" value={formData.waterReleaseTime || ""} onChange={handleChange} />
          </div>
          <div className="form-group" style={{gridColumn: '1 / -1'}}>
            <label>Safety Instructions</label>
            <textarea name="safetyInstructions" value={formData.safetyInstructions || ""} onChange={handleChange} rows="3" />
          </div>
        </div>
      </div>
    </div>
  );

  const renderControllerDashboard = () => (
    <div>
      <h3 style={{color: "#1976D2"}}>👷 DAM CONTROLLER ALERTS</h3>
      <p style={{fontSize: "14px", color: "#ffffffff"}}>Essential Emergency Dashboard - Controller must see EVERYTHING</p>
      
      <div style={{backgroundColor: "#39485fff", padding: "15px", borderRadius: "8px", marginBottom: "20px"}}>
        <h4>Active Alerts</h4>
        {formData.alerts?.criticalGateActionRequired && <div style={{color: "#F44336", fontWeight: "bold"}}>🔴 Critical Gate Action Required - Time to Full: {formData.timeToFullCapacity?.toFixed(2)} hours</div>}
        {formData.alerts?.immediateSpillwayAdjustment && <div style={{color: "#F44336", fontWeight: "bold"}}>🔴 Immediate Spillway Adjustment Required</div>}
        {formData.alerts?.upstreamSurgeIncoming && <div style={{color: "#FF9800", fontWeight: "bold"}}>🟠 Upstream Surge Incoming</div>}
        {formData.alerts?.heavyRainfallPredicted && <div style={{color: "#FFC107", fontWeight: "bold"}}>🟡 Heavy Rainfall Predicted</div>}
        {formData.alerts?.structuralStressWarning && <div style={{color: "#F44336", fontWeight: "bold"}}>🔴 Structural Stress Warning</div>}
        {!formData.alerts?.criticalGateActionRequired && !formData.alerts?.immediateSpillwayAdjustment && !formData.alerts?.structuralStressWarning && <div style={{color: "#4CAF50"}}>✅ All Systems Normal</div>}
      </div>

      <table>
        <tbody>
          <tr className="section-header"><td colSpan="2"><h3>Current Status</h3></td></tr>
          <tr><td><strong>Current Water Level (m)</strong></td><td>{formatNumber(formData.currentWaterLevel)}</td></tr>
          <tr><td><strong>Gate Operation Status</strong></td><td>{formData.gateOperationStatus || "N/A"}</td></tr>
          
          <tr className="section-header"><td colSpan="2"><h3>Predictions</h3></td></tr>
          <tr><td><strong>Predicted Water Level (1hr) - Calculated</strong></td><td style={{backgroundColor: "#1d3e56ff"}}>{formatNumber(formData.predictedWaterLevel_1hr)} m</td></tr>
          <tr><td><strong>Predicted Water Level (6hr) - Calculated</strong></td><td style={{backgroundColor: "#1d3e56ff"}}>{formatNumber(formData.predictedWaterLevel_6hr)} m</td></tr>
          
          <tr className="section-header"><td colSpan="2"><h3>Flow Analysis</h3></td></tr>
          <tr><td><strong>Net Inflow Rate - Calculated</strong></td><td style={{backgroundColor: "#1d3e56ff"}}>{formatNumber(formData.netInflowRate)} m³/s</td></tr>
          <tr><td><strong>Available Storage - Calculated</strong></td><td style={{backgroundColor: "#1d3e56ff"}}>{formatNumber(formData.availableStorage)} m³</td></tr>
          <tr><td><strong>Time to Full Capacity - Calculated</strong></td><td style={{backgroundColor: "#1d3e56ff", fontWeight: "bold", color: formData.timeToFullCapacity < 2 ? "#F44336" : "#4CAF50"}}>{formatNumber(formData.timeToFullCapacity)} hours</td></tr>
          <tr><td><strong>Required Spillway Increase - Calculated</strong></td><td style={{backgroundColor: "#1d3e56ff"}}>{formatNumber(formData.requiredSpillwayIncrease)} m³/s</td></tr>
          
          <tr className="section-header"><td colSpan="2"><h3>Risk Assessment</h3></td></tr>
          <tr><td><strong>Dam Stress Index - Calculated</strong></td><td style={{backgroundColor: "#1d3e56ff", color: formData.damStressIndex > 0.9 ? "#F44336" : "#4CAF50"}}>{formatNumber(formData.damStressIndex)}</td></tr>
          <tr><td><strong>Flood Risk Score - Calculated</strong></td><td style={{backgroundColor: "#1d3e56ff", fontWeight: "bold"}}>{formatNumber(formData.floodRiskScore)} / 100</td></tr>
          <tr><td><strong>Structural Failure Probability - Calculated</strong></td><td style={{backgroundColor: "#1d3e56ff"}}>{formatNumber(formData.structuralFailureProbability)} %</td></tr>
          
          <tr className="section-header"><td colSpan="2"><h3>Emergency Response</h3></td></tr>
          <tr><td><strong>Downstream Flood Arrival Time - Calculated</strong></td><td style={{backgroundColor:"#1d3e56ff"}}>{formatNumber(formData.downstreamFloodArrivalTime)} hours</td></tr>
          <tr><td><strong>Emergency Gate Operation Time - Calculated</strong></td><td style={{backgroundColor: "#1d3e56ff"}}>{formatNumber(formData.emergencyGateOperationTime, 0)} minutes</td></tr>
        </tbody>
      </table>
    </div>
  );

  const renderGovernmentDashboard = () => (
    <div>
      <h3 style={{color: "#1976D2"}}>🏛 GOVERNMENT OFFICIAL ALERTS</h3>
      <p style={{fontSize: "14px", color: "#4CAF50"}}>High-level overview for policy decisions</p>
      
      <div style={{backgroundColor: getEmergencyColor(formData.emergencyLevel), color: "#FFF", padding: "20px", borderRadius: "8px", marginBottom: "20px", textAlign: "center"}}>
        <h2 style={{margin: 0}}>Emergency Level: {formData.emergencyLevel || "Normal"}</h2>
        <h3 style={{margin: "10px 0 0 0"}}>Flood Risk Score: {formatNumber(formData.floodRiskScore, 0)} / 100</h3>
      </div>

      <div style={{backgroundColor: "#6d6c6bff", padding: "15px", borderRadius: "8px", marginBottom: "20px"}}>
        <h4>Active Government Alerts</h4>
        {formData.alerts?.nationalDisasterAlert && <div style={{color: "#F44336", fontWeight: "bold"}}>🔴 National Disaster Alert</div>}
        {formData.alerts?.evacuationRecommended && <div style={{color: "#F44336", fontWeight: "bold"}}>🔴 Evacuation Recommended</div>}
        {formData.alerts?.districtFloodWarning && <div style={{color: "#F44336", fontWeight: "bold"}}>🔴 District Flood Warning</div>}
        {formData.alerts?.floodWatchAdvisory && <div style={{color: "#FF9800", fontWeight: "bold"}}>🟠 Flood Watch Advisory</div>}
        {!formData.alerts?.nationalDisasterAlert && !formData.alerts?.evacuationRecommended && !formData.alerts?.districtFloodWarning && !formData.alerts?.floodWatchAdvisory && <div style={{color: "#4CAF50"}}>✅ No Active Alerts</div>}
      </div>

      <table>
        <tbody>
          <tr><td><strong>Affected Districts</strong></td><td>{formData.affectedDistricts || "N/A"}</td></tr>
          <tr><td><strong>Predicted Flood Time - Calculated</strong></td><td style={{backgroundColor: "#1d3e56ff"}}>{formData.predictedFloodTime || "N/A"}</td></tr>
          <tr><td><strong>Evacuation Lead Time - Calculated</strong></td><td style={{backgroundColor: "#1d3e56ff"}}>{formatNumber(formData.evacuationLeadTime)} hours</td></tr>
          <tr><td><strong>Expected Affected Population</strong></td><td>{formData.expectedAffectedPopulation?.toLocaleString() || "N/A"}</td></tr>
          <tr><td><strong>Economic Loss Estimate - Calculated</strong></td><td style={{backgroundColor: "#1d3e56ff"}}>₹ {formatNumber(formData.economicLossEstimate, 0)}</td></tr>
        </tbody>
      </table>
    </div>
  );

  const renderRescueDashboard = () => (
    <div>
      <h3 style={{color: "#1976D2"}}>🚑 RESCUE TEAM ALERTS</h3>
      <p style={{fontSize: "14px", color: "#ffffffff"}}>Operational readiness information</p>
      
      <div style={{backgroundColor: "#858585ff", padding: "15px", borderRadius: "8px", marginBottom: "20px"}}>
        <h4>Active Rescue Alerts</h4>
        {formData.alerts?.immediateMobilization && <div style={{color: "#F44336", fontWeight: "bold"}}>🔴 Immediate Mobilization Required</div>}
        {formData.alerts?.roadCutoffExpected && <div style={{color: "#F44336", fontWeight: "bold"}}>🔴 Road Cut-off Expected</div>}
        {formData.alerts?.prepareDeployment && <div style={{color: "#FF9800", fontWeight: "bold"}}>🟠 Prepare Deployment</div>}
        {!formData.alerts?.immediateMobilization && !formData.alerts?.roadCutoffExpected && !formData.alerts?.prepareDeployment && <div style={{color: "#4CAF50"}}>✅ Standby Mode</div>}
      </div>

      <table>
        <tbody>
          <tr><td><strong>Flood Arrival Time - Calculated</strong></td><td style={{backgroundColor:"#1d3e56ff", fontWeight: "bold"}}>{formatNumber(formData.downstreamFloodArrivalTime)} hours</td></tr>
          <tr><td><strong>Predicted Water Depth - Calculated</strong></td><td style={{backgroundColor:"#1d3e56ff"}}>{formatNumber(formData.predictedWaterDepth)} m</td></tr>
          <tr><td><strong>Rescue Window Time - Calculated</strong></td><td style={{backgroundColor: "#1d3e56ff", fontWeight: "bold"}}>{formatNumber(formData.rescueWindowTime)} hours</td></tr>
          <tr><td><strong>Bridge Submergence Risk</strong></td><td style={{color: formData.bridgeSubmergenceRisk > 70 ? "#F44336" : "#56ff78ff"}}>{formatNumber(formData.bridgeSubmergenceRisk)} %</td></tr>
          <tr><td><strong>Affected Villages List</strong></td><td><textarea value={formData.affectedVillagesList || "N/A"} readOnly rows="3" style={{width: "100%"}} /></td></tr>
          <tr><td><strong>Safe Route Map</strong></td><td>{formData.safeRouteMap ? <a href={formData.safeRouteMap} target="_blank" rel="noopener noreferrer">View Map</a> : "N/A"}</td></tr>
        </tbody>
      </table>
    </div>
  );

  const renderPublicAlert = () => (
    <div>
      <h3 style={{color: "#1976D2"}}>👥 PUBLIC ALERT SYSTEM</h3>
      <p style={{fontSize: "14px", color: "#7fd8f9ff"}}>Simple, clear, panic-free information</p>
      
      <div style={{backgroundColor: getAlertColor(formData.alertLevel), color: "#FFF", padding: "30px", borderRadius: "8px", marginBottom: "20px", textAlign: "center"}}>
        <h1 style={{margin: 0, fontSize: "36px"}}>
          {formData.alertLevel === "Safe" && "🟢"}
          {formData.alertLevel === "Be Alert" && "🟡"}
          {formData.alertLevel === "Move To Safer Area" && "🟠"}
          {formData.alertLevel === "Evacuate Immediately" && "🔴"}
        </h1>
        <h2 style={{margin: "10px 0"}}>{formData.alertLevel || "Safe"}</h2>
      </div>

      <table>
        <tbody>
          <tr><td><strong>Estimated Time of Flood - Calculated</strong></td><td style={{backgroundColor:"#1d3e56ff", fontWeight: "bold", fontSize: "16px"}}>{formData.estimatedTimeOfFlood || "No immediate threat"}</td></tr>
          <tr><td><strong>Water Release Time</strong></td><td>{formData.waterReleaseTime || "N/A"}</td></tr>
          <tr><td><strong>Safe Zones</strong></td><td><textarea value={formData.safeZones || "N/A"} readOnly rows="2" style={{width: "100%"}} /></td></tr>
          <tr><td><strong>Evacuation Routes</strong></td><td><textarea value={formData.evacuationRoutes || "N/A"} readOnly rows="2" style={{width: "100%"}} /></td></tr>
          <tr><td><strong>Safety Instructions</strong></td><td><textarea value={formData.safetyInstructions || "N/A"} readOnly rows="4" style={{width: "100%"}} /></td></tr>
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="safety-alert-page">
      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <div className="loading-text">Loading Safety Alert Data...</div>
        </div>
      ) : (
        <>
      <div className="safety-alert-header">
        <h1>
          <span className="alert-icon">🚨</span>
          Safety & Alert System
        </h1>
        {damName && <div className="dam-name-badge">{damName}</div>}
      </div>
      
      <div className="tab-navigation">
        <button 
          onClick={() => setActiveTab("input")} 
          className={`tab-button ${activeTab === "input" ? "active" : ""}`}
        >
          <span className="tab-icon">📝</span>
          Input Data
        </button>
        <button 
          onClick={() => setActiveTab("controller")} 
          className={`tab-button ${activeTab === "controller" ? "active" : ""}`}
        >
          <span className="tab-icon">👷</span>
          Controller
        </button>
        <button 
          onClick={() => setActiveTab("government")} 
          className={`tab-button ${activeTab === "government" ? "active" : ""}`}
        >
          <span className="tab-icon">🏛</span>
          Government
        </button>
        <button 
          onClick={() => setActiveTab("rescue")} 
          className={`tab-button ${activeTab === "rescue" ? "active" : ""}`}
        >
          <span className="tab-icon">🚑</span>
          Rescue Team
        </button>
        <button 
          onClick={() => setActiveTab("public")} 
          className={`tab-button ${activeTab === "public" ? "active" : ""}`}
        >
          <span className="tab-icon">👥</span>
          Public Alert
        </button>
      </div>

      <div className="tab-content">
        <form onSubmit={handleSubmit}>
          {activeTab === "input" && renderInputFields()}
          {activeTab === "controller" && renderControllerDashboard()}
          {activeTab === "government" && renderGovernmentDashboard()}
          {activeTab === "rescue" && renderRescueDashboard()}
          {activeTab === "public" && renderPublicAlert()}

        {activeTab === "input" && (
          <button className="btn-primary" type="submit" style={{marginTop: "20px"}}>
            {isExisting ? "Update Safety Data" : "Save Safety Data"}
          </button>
        )}
        {message && <p className="status-message">{message}</p>}
      </form>
      </div>
      </>
      )}
    </div>
  );
};

export default SafetyAlertPage;
