import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "../styles/AdminDataForms.css";

const API_BASE = "https://river-water-management-and-life-safety.onrender.com/api";

export default function AdminDataForms() {
  const { damId } = useParams();
  const [activeTab, setActiveTab] = useState("history");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // History Form State
  const [historyForm, setHistoryForm] = useState({
    eventType: "maintenance",
    title: "",
    description: "",
    eventDate: "",
    severity: "medium",
    impact: "",
    actionsTaken: "",
    cost: "",
    duration: "",
    affectedAreas: "",
    status: "closed",
    reportedBy: {
      name: "",
      designation: "",
      contact: ""
    }
  });

  // Public Spot Form State
  const [publicSpotForm, setPublicSpotForm] = useState({
    name: "",
    type: "temple",
    description: "",
    location: {
      address: "",
      coordinates: {
        latitude: "",
        longitude: ""
      },
      city: "",
      state: "",
      pincode: ""
    },
    distance: "",
    facilities: "",
    openingHours: "24/7",
    contactInfo: {
      phone: "",
      email: "",
      website: ""
    },
    rating: 3,
    accessibility: {
      wheelchairAccessible: false,
      publicTransport: false,
      parking: false
    }
  });

  // Restricted Area Form State
  const [restrictedAreaForm, setRestrictedAreaForm] = useState({
    name: "",
    type: "dam_restricted_zone",
    description: "",
    location: {
      address: "",
      coordinates: {
        latitude: "",
        longitude: ""
      },
      city: "",
      state: ""
    },
    distance: "",
    riskLevel: "medium"
  });
  // Guideline Form State
  const [guidelineForm, setGuidelineForm] = useState({
    title: "",
    category: "safety",
    subcategory: "",
    description: "",
    content: "",
    priority: "medium",
    targetAudience: ["public"],
    steps: [{ stepNumber: 1, title: "", description: "", isRequired: true }],
    compliance: {
      isRegulatory: false,
      authority: "",
      regulationNumber: ""
    },
    effectiveDate: "",
    version: "1.0",
    approvedBy: {
      name: "",
      designation: "",
      date: ""
    }
  });

  const [existingData, setExistingData] = useState({
    history: [],
    publicSpots: [],
    restrictedAreas: [],
    guidelines: []
  });

  useEffect(() => {
    fetchExistingData();
  }, [damId]);

  const fetchExistingData = async () => {
    try {
      setLoading(true);
      // Fetch existing data for display
      const [historyRes, publicSpotsRes, restrictedAreasRes, guidelinesRes] = await Promise.all([
        axios.get(`${API_BASE}/sidebar/history`).catch(() => ({ data: { history: {} } })),
        axios.get(`${API_BASE}/sidebar/public-spots`).catch(() => ({ data: { spots: {} } })),
        axios.get(`${API_BASE}/sidebar/restricted-areas`).catch(() => ({ data: { areas: {} } })),
        axios.get(`${API_BASE}/sidebar/guidelines`).catch(() => ({ data: { guidelines: {} } }))
      ]);

      setExistingData({
        history: Object.values(historyRes.data.history || {}).flatMap(d => d.events || []),
        publicSpots: Object.values(publicSpotsRes.data.spots || {}).flat(),
        restrictedAreas: Object.values(restrictedAreasRes.data.areas || {}).flat(),
        guidelines: Object.values(guidelinesRes.data.guidelines || {}).flat()
      });
    } catch (error) {
      console.error("Error fetching existing data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleHistorySubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const payload = {
        ...historyForm,
        dam: damId,
        affectedAreas: historyForm.affectedAreas.split(',').map(area => area.trim()).filter(Boolean),
        cost: historyForm.cost ? parseFloat(historyForm.cost) : 0,
        eventDate: new Date(historyForm.eventDate)
      };

      await axios.post(`${API_BASE}/dam-history`, payload);
      setMessage("✅ History event added successfully!");
      
      // Reset form
      setHistoryForm({
        eventType: "maintenance",
        title: "",
        description: "",
        eventDate: "",
        severity: "medium",
        impact: "",
        actionsTaken: "",
        cost: "",
        duration: "",
        affectedAreas: "",
        status: "closed",
        reportedBy: { name: "", designation: "", contact: "" }
      });
      
      fetchExistingData();
    } catch (error) {
      setMessage("❌ Failed to add history event: " + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };
  const handlePublicSpotSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const payload = {
        ...publicSpotForm,
        nearbyDams: [{
          dam: damId,
          distance: parseFloat(publicSpotForm.distance) || 0
        }],
        facilities: publicSpotForm.facilities.split(',').map(f => f.trim()).filter(Boolean),
        location: {
          ...publicSpotForm.location,
          coordinates: {
            latitude: parseFloat(publicSpotForm.location.coordinates.latitude),
            longitude: parseFloat(publicSpotForm.location.coordinates.longitude)
          }
        }
      };

      await axios.post(`${API_BASE}/public-spots`, payload);
      setMessage("✅ Public spot added successfully!");
      
      // Reset form
      setPublicSpotForm({
        name: "",
        type: "temple",
        description: "",
        location: {
          address: "",
          coordinates: { latitude: "", longitude: "" },
          city: "",
          state: "",
          pincode: ""
        },
        distance: "",
        facilities: "",
        openingHours: "24/7",
        contactInfo: { phone: "", email: "", website: "" },
        rating: 3,
        accessibility: {
          wheelchairAccessible: false,
          publicTransport: false,
          parking: false
        }
      });
      
      fetchExistingData();
    } catch (error) {
      setMessage("❌ Failed to add public spot: " + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleRestrictedAreaSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const payload = {
        ...restrictedAreaForm,
        nearbyDams: [{
          dam: damId,
          distance: parseFloat(restrictedAreaForm.distance) || 0,
          riskLevel: restrictedAreaForm.riskLevel
        }],
        location: {
          ...restrictedAreaForm.location,
          coordinates: {
            latitude: parseFloat(restrictedAreaForm.location.coordinates.latitude),
            longitude: parseFloat(restrictedAreaForm.location.coordinates.longitude)
          }
        }
      };

      await axios.post(`${API_BASE}/restricted-areas`, payload);
      setMessage("✅ Restricted area added successfully!");
      
      // Reset form
      setRestrictedAreaForm({
        name: "",
        type: "dam_restricted_zone",
        description: "",
        location: {
          address: "",
          coordinates: { latitude: "", longitude: "" },
          city: "",
          state: ""
        },
        distance: "",
        riskLevel: "medium"
      });
      
      fetchExistingData();
    } catch (error) {
      setMessage("❌ Failed to add restricted area: " + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };
  const handleGuidelineSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const payload = {
        ...guidelineForm,
        applicableDams: [{
          dam: damId,
          isSpecific: true
        }],
        effectiveDate: new Date(guidelineForm.effectiveDate),
        approvedBy: {
          ...guidelineForm.approvedBy,
          date: guidelineForm.approvedBy.date ? new Date(guidelineForm.approvedBy.date) : null
        }
      };

      await axios.post(`${API_BASE}/guidelines`, payload);
      setMessage("✅ Guideline added successfully!");
      
      // Reset form
      setGuidelineForm({
        title: "",
        category: "safety",
        subcategory: "",
        description: "",
        content: "",
        priority: "medium",
        targetAudience: ["public"],
        steps: [{ stepNumber: 1, title: "", description: "", isRequired: true }],
        compliance: {
          isRegulatory: false,
          authority: "",
          regulationNumber: ""
        },
        effectiveDate: "",
        version: "1.0",
        approvedBy: { name: "", designation: "", date: "" }
      });
      
      fetchExistingData();
    } catch (error) {
      setMessage("❌ Failed to add guideline: " + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const addStep = () => {
    setGuidelineForm(prev => ({
      ...prev,
      steps: [...prev.steps, {
        stepNumber: prev.steps.length + 1,
        title: "",
        description: "",
        isRequired: true
      }]
    }));
  };

  const removeStep = (index) => {
    setGuidelineForm(prev => ({
      ...prev,
      steps: prev.steps.filter((_, i) => i !== index)
    }));
  };

  const updateStep = (index, field, value) => {
    setGuidelineForm(prev => ({
      ...prev,
      steps: prev.steps.map((step, i) => 
        i === index ? { ...step, [field]: value } : step
      )
    }));
  };

  const renderHistoryForm = () => (
    <form onSubmit={handleHistorySubmit} className="admin-form">
      <h3>Add Historical Event</h3>
      
      <div className="form-row">
        <label>Event Type</label>
        <select 
          value={historyForm.eventType} 
          onChange={(e) => setHistoryForm({...historyForm, eventType: e.target.value})}
          required
        >
          <option value="flood">Flood</option>
          <option value="maintenance">Maintenance</option>
          <option value="inspection">Inspection</option>
          <option value="repair">Repair</option>
          <option value="upgrade">Upgrade</option>
          <option value="incident">Incident</option>
          <option value="emergency">Emergency</option>
        </select>
      </div>

      <div className="form-row">
        <label>Title</label>
        <input 
          type="text" 
          value={historyForm.title}
          onChange={(e) => setHistoryForm({...historyForm, title: e.target.value})}
          required 
        />
      </div>

      <div className="form-row">
        <label>Description</label>
        <textarea 
          value={historyForm.description}
          onChange={(e) => setHistoryForm({...historyForm, description: e.target.value})}
          rows="4"
          required
        />
      </div>

      <div className="form-row">
        <label>Event Date</label>
        <input 
          type="date" 
          value={historyForm.eventDate}
          onChange={(e) => setHistoryForm({...historyForm, eventDate: e.target.value})}
          required 
        />
      </div>

      <div className="form-row">
        <label>Severity</label>
        <select 
          value={historyForm.severity} 
          onChange={(e) => setHistoryForm({...historyForm, severity: e.target.value})}
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="critical">Critical</option>
        </select>
      </div>

      <div className="form-row">
        <label>Impact</label>
        <textarea 
          value={historyForm.impact}
          onChange={(e) => setHistoryForm({...historyForm, impact: e.target.value})}
          rows="3"
        />
      </div>

      <div className="form-row">
        <label>Actions Taken</label>
        <textarea 
          value={historyForm.actionsTaken}
          onChange={(e) => setHistoryForm({...historyForm, actionsTaken: e.target.value})}
          rows="3"
        />
      </div>

      <div className="form-row">
        <label>Cost (₹)</label>
        <input 
          type="number" 
          value={historyForm.cost}
          onChange={(e) => setHistoryForm({...historyForm, cost: e.target.value})}
        />
      </div>

      <div className="form-row">
        <label>Duration</label>
        <input 
          type="text" 
          value={historyForm.duration}
          onChange={(e) => setHistoryForm({...historyForm, duration: e.target.value})}
          placeholder="e.g., 3 days, 2 weeks"
        />
      </div>

      <div className="form-row">
        <label>Affected Areas (comma-separated)</label>
        <input 
          type="text" 
          value={historyForm.affectedAreas}
          onChange={(e) => setHistoryForm({...historyForm, affectedAreas: e.target.value})}
          placeholder="Area1, Area2, Area3"
        />
      </div>

      <div className="form-row">
        <label>Status</label>
        <select 
          value={historyForm.status} 
          onChange={(e) => setHistoryForm({...historyForm, status: e.target.value})}
        >
          <option value="ongoing">Ongoing</option>
          <option value="resolved">Resolved</option>
          <option value="monitoring">Monitoring</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      <div className="form-section">
        <h4>Reported By</h4>
        <div className="form-row">
          <label>Name</label>
          <input 
            type="text" 
            value={historyForm.reportedBy.name}
            onChange={(e) => setHistoryForm({
              ...historyForm, 
              reportedBy: {...historyForm.reportedBy, name: e.target.value}
            })}
          />
        </div>
        <div className="form-row">
          <label>Designation</label>
          <input 
            type="text" 
            value={historyForm.reportedBy.designation}
            onChange={(e) => setHistoryForm({
              ...historyForm, 
              reportedBy: {...historyForm.reportedBy, designation: e.target.value}
            })}
          />
        </div>
        <div className="form-row">
          <label>Contact</label>
          <input 
            type="text" 
            value={historyForm.reportedBy.contact}
            onChange={(e) => setHistoryForm({
              ...historyForm, 
              reportedBy: {...historyForm.reportedBy, contact: e.target.value}
            })}
          />
        </div>
      </div>

      <button type="submit" disabled={loading} className="submit-btn">
        {loading ? "Adding..." : "Add History Event"}
      </button>
    </form>
  );
  const renderPublicSpotForm = () => (
    <form onSubmit={handlePublicSpotSubmit} className="admin-form">
      <h3>Add Public Spot</h3>
      
      <div className="form-row">
        <label>Name</label>
        <input 
          type="text" 
          value={publicSpotForm.name}
          onChange={(e) => setPublicSpotForm({...publicSpotForm, name: e.target.value})}
          required 
        />
      </div>

      <div className="form-row">
        <label>Type</label>
        <select 
          value={publicSpotForm.type} 
          onChange={(e) => setPublicSpotForm({...publicSpotForm, type: e.target.value})}
        >
          <option value="temple">Temple</option>
          <option value="dargah">Dargah</option>
          <option value="mosque">Mosque</option>
          <option value="church">Church</option>
          <option value="gurudwara">Gurudwara</option>
          <option value="sitting_area">Sitting Area</option>
          <option value="tourist_spot">Tourist Spot</option>
          <option value="park">Park</option>
          <option value="viewpoint">Viewpoint</option>
          <option value="restaurant">Restaurant</option>
          <option value="hotel">Hotel</option>
          <option value="market">Market</option>
          <option value="hospital">Hospital</option>
          <option value="school">School</option>
          <option value="government_office">Government Office</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div className="form-row">
        <label>Description</label>
        <textarea 
          value={publicSpotForm.description}
          onChange={(e) => setPublicSpotForm({...publicSpotForm, description: e.target.value})}
          rows="3"
        />
      </div>

      <div className="form-section">
        <h4>Location</h4>
        <div className="form-row">
          <label>Address</label>
          <input 
            type="text" 
            value={publicSpotForm.location.address}
            onChange={(e) => setPublicSpotForm({
              ...publicSpotForm, 
              location: {...publicSpotForm.location, address: e.target.value}
            })}
          />
        </div>
        <div className="form-row">
          <label>Latitude</label>
          <input 
            type="number" 
            step="any"
            value={publicSpotForm.location.coordinates.latitude}
            onChange={(e) => setPublicSpotForm({
              ...publicSpotForm, 
              location: {
                ...publicSpotForm.location, 
                coordinates: {...publicSpotForm.location.coordinates, latitude: e.target.value}
              }
            })}
            required
          />
        </div>
        <div className="form-row">
          <label>Longitude</label>
          <input 
            type="number" 
            step="any"
            value={publicSpotForm.location.coordinates.longitude}
            onChange={(e) => setPublicSpotForm({
              ...publicSpotForm, 
              location: {
                ...publicSpotForm.location, 
                coordinates: {...publicSpotForm.location.coordinates, longitude: e.target.value}
              }
            })}
            required
          />
        </div>
        <div className="form-row">
          <label>City</label>
          <input 
            type="text" 
            value={publicSpotForm.location.city}
            onChange={(e) => setPublicSpotForm({
              ...publicSpotForm, 
              location: {...publicSpotForm.location, city: e.target.value}
            })}
          />
        </div>
        <div className="form-row">
          <label>State</label>
          <input 
            type="text" 
            value={publicSpotForm.location.state}
            onChange={(e) => setPublicSpotForm({
              ...publicSpotForm, 
              location: {...publicSpotForm.location, state: e.target.value}
            })}
          />
        </div>
        <div className="form-row">
          <label>Pincode</label>
          <input 
            type="text" 
            value={publicSpotForm.location.pincode}
            onChange={(e) => setPublicSpotForm({
              ...publicSpotForm, 
              location: {...publicSpotForm.location, pincode: e.target.value}
            })}
          />
        </div>
      </div>

      <div className="form-row">
        <label>Distance from Dam (km)</label>
        <input 
          type="number" 
          step="0.1"
          value={publicSpotForm.distance}
          onChange={(e) => setPublicSpotForm({...publicSpotForm, distance: e.target.value})}
          required
        />
      </div>

      <div className="form-row">
        <label>Facilities (comma-separated)</label>
        <input 
          type="text" 
          value={publicSpotForm.facilities}
          onChange={(e) => setPublicSpotForm({...publicSpotForm, facilities: e.target.value})}
          placeholder="parking, restroom, food, accommodation"
        />
      </div>

      <div className="form-row">
        <label>Opening Hours</label>
        <input 
          type="text" 
          value={publicSpotForm.openingHours}
          onChange={(e) => setPublicSpotForm({...publicSpotForm, openingHours: e.target.value})}
        />
      </div>

      <div className="form-section">
        <h4>Contact Information</h4>
        <div className="form-row">
          <label>Phone</label>
          <input 
            type="text" 
            value={publicSpotForm.contactInfo.phone}
            onChange={(e) => setPublicSpotForm({
              ...publicSpotForm, 
              contactInfo: {...publicSpotForm.contactInfo, phone: e.target.value}
            })}
          />
        </div>
        <div className="form-row">
          <label>Email</label>
          <input 
            type="email" 
            value={publicSpotForm.contactInfo.email}
            onChange={(e) => setPublicSpotForm({
              ...publicSpotForm, 
              contactInfo: {...publicSpotForm.contactInfo, email: e.target.value}
            })}
          />
        </div>
        <div className="form-row">
          <label>Website</label>
          <input 
            type="url" 
            value={publicSpotForm.contactInfo.website}
            onChange={(e) => setPublicSpotForm({
              ...publicSpotForm, 
              contactInfo: {...publicSpotForm.contactInfo, website: e.target.value}
            })}
          />
        </div>
      </div>

      <div className="form-row">
        <label>Rating (1-5)</label>
        <select 
          value={publicSpotForm.rating} 
          onChange={(e) => setPublicSpotForm({...publicSpotForm, rating: parseInt(e.target.value)})}
        >
          <option value={1}>1 Star</option>
          <option value={2}>2 Stars</option>
          <option value={3}>3 Stars</option>
          <option value={4}>4 Stars</option>
          <option value={5}>5 Stars</option>
        </select>
      </div>

      <div className="form-section">
        <h4>Accessibility</h4>
        <div className="checkbox-group">
          <label>
            <input 
              type="checkbox" 
              checked={publicSpotForm.accessibility.wheelchairAccessible}
              onChange={(e) => setPublicSpotForm({
                ...publicSpotForm, 
                accessibility: {...publicSpotForm.accessibility, wheelchairAccessible: e.target.checked}
              })}
            />
            Wheelchair Accessible
          </label>
          <label>
            <input 
              type="checkbox" 
              checked={publicSpotForm.accessibility.publicTransport}
              onChange={(e) => setPublicSpotForm({
                ...publicSpotForm, 
                accessibility: {...publicSpotForm.accessibility, publicTransport: e.target.checked}
              })}
            />
            Public Transport Available
          </label>
          <label>
            <input 
              type="checkbox" 
              checked={publicSpotForm.accessibility.parking}
              onChange={(e) => setPublicSpotForm({
                ...publicSpotForm, 
                accessibility: {...publicSpotForm.accessibility, parking: e.target.checked}
              })}
            />
            Parking Available
          </label>
        </div>
      </div>

      <button type="submit" disabled={loading} className="submit-btn">
        {loading ? "Adding..." : "Add Public Spot"}
      </button>
    </form>
  );
  const renderRestrictedAreaForm = () => (
    <form onSubmit={handleRestrictedAreaSubmit} className="admin-form">
      <h3>Add Restricted Area</h3>
      
      <div className="form-row">
        <label>Name</label>
        <input 
          type="text" 
          value={restrictedAreaForm.name}
          onChange={(e) => setRestrictedAreaForm({...restrictedAreaForm, name: e.target.value})}
          required 
        />
      </div>

      <div className="form-row">
        <label>Type</label>
        <select 
          value={restrictedAreaForm.type} 
          onChange={(e) => setRestrictedAreaForm({...restrictedAreaForm, type: e.target.value})}
        >
          <option value="dam_restricted_zone">Dam Restricted Zone</option>
          <option value="flood_prone_area">Flood Prone Area</option>
          <option value="construction_zone">Construction Zone</option>
          <option value="military_area">Military Area</option>
          <option value="environmental_protection">Environmental Protection</option>
          <option value="private_property">Private Property</option>
          <option value="dangerous_area">Dangerous Area</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div className="form-row">
        <label>Description</label>
        <textarea 
          value={restrictedAreaForm.description}
          onChange={(e) => setRestrictedAreaForm({...restrictedAreaForm, description: e.target.value})}
          rows="4"
          required
        />
      </div>

      <div className="form-section">
        <h4>Location</h4>
        <div className="form-row">
          <label>Address</label>
          <input 
            type="text" 
            value={restrictedAreaForm.location.address}
            onChange={(e) => setRestrictedAreaForm({
              ...restrictedAreaForm, 
              location: {...restrictedAreaForm.location, address: e.target.value}
            })}
          />
        </div>
        <div className="form-row">
          <label>Latitude</label>
          <input 
            type="number" 
            step="any"
            value={restrictedAreaForm.location.coordinates.latitude}
            onChange={(e) => setRestrictedAreaForm({
              ...restrictedAreaForm, 
              location: {
                ...restrictedAreaForm.location, 
                coordinates: {...restrictedAreaForm.location.coordinates, latitude: e.target.value}
              }
            })}
            required
          />
        </div>
        <div className="form-row">
          <label>Longitude</label>
          <input 
            type="number" 
            step="any"
            value={restrictedAreaForm.location.coordinates.longitude}
            onChange={(e) => setRestrictedAreaForm({
              ...restrictedAreaForm, 
              location: {
                ...restrictedAreaForm.location, 
                coordinates: {...restrictedAreaForm.location.coordinates, longitude: e.target.value}
              }
            })}
            required
          />
        </div>
        <div className="form-row">
          <label>City</label>
          <input 
            type="text" 
            value={restrictedAreaForm.location.city}
            onChange={(e) => setRestrictedAreaForm({
              ...restrictedAreaForm, 
              location: {...restrictedAreaForm.location, city: e.target.value}
            })}
          />
        </div>
        <div className="form-row">
          <label>State</label>
          <input 
            type="text" 
            value={restrictedAreaForm.location.state}
            onChange={(e) => setRestrictedAreaForm({
              ...restrictedAreaForm, 
              location: {...restrictedAreaForm.location, state: e.target.value}
            })}
          />
        </div>
      </div>

      <div className="form-row">
        <label>Distance from Dam (km)</label>
        <input 
          type="number" 
          step="0.1"
          value={restrictedAreaForm.distance}
          onChange={(e) => setRestrictedAreaForm({...restrictedAreaForm, distance: e.target.value})}
          required
        />
      </div>

      <div className="form-row">
        <label>Risk Level</label>
        <select 
          value={restrictedAreaForm.riskLevel} 
          onChange={(e) => setRestrictedAreaForm({...restrictedAreaForm, riskLevel: e.target.value})}
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="critical">Critical</option>
        </select>
      </div>

      <button type="submit" disabled={loading} className="submit-btn">
        {loading ? "Adding..." : "Add Restricted Area"}
      </button>
    </form>
  );
  const renderGuidelineForm = () => (
    <form onSubmit={handleGuidelineSubmit} className="admin-form">
      <h3>Add Guideline</h3>
      
      <div className="form-row">
        <label>Title</label>
        <input 
          type="text" 
          value={guidelineForm.title}
          onChange={(e) => setGuidelineForm({...guidelineForm, title: e.target.value})}
          required 
        />
      </div>

      <div className="form-row">
        <label>Category</label>
        <select 
          value={guidelineForm.category} 
          onChange={(e) => setGuidelineForm({...guidelineForm, category: e.target.value})}
        >
          <option value="safety">Safety</option>
          <option value="maintenance">Maintenance</option>
          <option value="operation">Operation</option>
          <option value="emergency">Emergency</option>
          <option value="environmental">Environmental</option>
          <option value="visitor">Visitor</option>
          <option value="construction">Construction</option>
          <option value="monitoring">Monitoring</option>
          <option value="general">General</option>
        </select>
      </div>

      <div className="form-row">
        <label>Subcategory</label>
        <input 
          type="text" 
          value={guidelineForm.subcategory}
          onChange={(e) => setGuidelineForm({...guidelineForm, subcategory: e.target.value})}
        />
      </div>

      <div className="form-row">
        <label>Description</label>
        <textarea 
          value={guidelineForm.description}
          onChange={(e) => setGuidelineForm({...guidelineForm, description: e.target.value})}
          rows="3"
          required
        />
      </div>

      <div className="form-row">
        <label>Content</label>
        <textarea 
          value={guidelineForm.content}
          onChange={(e) => setGuidelineForm({...guidelineForm, content: e.target.value})}
          rows="6"
          required
        />
      </div>

      <div className="form-row">
        <label>Priority</label>
        <select 
          value={guidelineForm.priority} 
          onChange={(e) => setGuidelineForm({...guidelineForm, priority: e.target.value})}
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="critical">Critical</option>
        </select>
      </div>

      <div className="form-row">
        <label>Target Audience</label>
        <select 
          multiple
          value={guidelineForm.targetAudience} 
          onChange={(e) => setGuidelineForm({
            ...guidelineForm, 
            targetAudience: Array.from(e.target.selectedOptions, option => option.value)
          })}
        >
          <option value="public">Public</option>
          <option value="operators">Operators</option>
          <option value="maintenance_staff">Maintenance Staff</option>
          <option value="emergency_responders">Emergency Responders</option>
          <option value="visitors">Visitors</option>
          <option value="contractors">Contractors</option>
          <option value="government">Government</option>
          <option value="all">All</option>
        </select>
        <small>Hold Ctrl/Cmd to select multiple</small>
      </div>

      <div className="form-section">
        <h4>Steps</h4>
        {guidelineForm.steps.map((step, index) => (
          <div key={index} className="step-item">
            <div className="form-row">
              <label>Step {step.stepNumber} Title</label>
              <input 
                type="text" 
                value={step.title}
                onChange={(e) => updateStep(index, 'title', e.target.value)}
              />
            </div>
            <div className="form-row">
              <label>Step {step.stepNumber} Description</label>
              <textarea 
                value={step.description}
                onChange={(e) => updateStep(index, 'description', e.target.value)}
                rows="2"
              />
            </div>
            <div className="form-row">
              <label>
                <input 
                  type="checkbox" 
                  checked={step.isRequired}
                  onChange={(e) => updateStep(index, 'isRequired', e.target.checked)}
                />
                Required Step
              </label>
            </div>
            {guidelineForm.steps.length > 1 && (
              <button type="button" onClick={() => removeStep(index)} className="remove-btn">
                Remove Step
              </button>
            )}
          </div>
        ))}
        <button type="button" onClick={addStep} className="add-btn">
          Add Step
        </button>
      </div>

      <div className="form-section">
        <h4>Compliance</h4>
        <div className="form-row">
          <label>
            <input 
              type="checkbox" 
              checked={guidelineForm.compliance.isRegulatory}
              onChange={(e) => setGuidelineForm({
                ...guidelineForm, 
                compliance: {...guidelineForm.compliance, isRegulatory: e.target.checked}
              })}
            />
            Is Regulatory
          </label>
        </div>
        <div className="form-row">
          <label>Authority</label>
          <input 
            type="text" 
            value={guidelineForm.compliance.authority}
            onChange={(e) => setGuidelineForm({
              ...guidelineForm, 
              compliance: {...guidelineForm.compliance, authority: e.target.value}
            })}
          />
        </div>
        <div className="form-row">
          <label>Regulation Number</label>
          <input 
            type="text" 
            value={guidelineForm.compliance.regulationNumber}
            onChange={(e) => setGuidelineForm({
              ...guidelineForm, 
              compliance: {...guidelineForm.compliance, regulationNumber: e.target.value}
            })}
          />
        </div>
      </div>

      <div className="form-row">
        <label>Effective Date</label>
        <input 
          type="date" 
          value={guidelineForm.effectiveDate}
          onChange={(e) => setGuidelineForm({...guidelineForm, effectiveDate: e.target.value})}
        />
      </div>

      <div className="form-row">
        <label>Version</label>
        <input 
          type="text" 
          value={guidelineForm.version}
          onChange={(e) => setGuidelineForm({...guidelineForm, version: e.target.value})}
        />
      </div>

      <div className="form-section">
        <h4>Approved By</h4>
        <div className="form-row">
          <label>Name</label>
          <input 
            type="text" 
            value={guidelineForm.approvedBy.name}
            onChange={(e) => setGuidelineForm({
              ...guidelineForm, 
              approvedBy: {...guidelineForm.approvedBy, name: e.target.value}
            })}
          />
        </div>
        <div className="form-row">
          <label>Designation</label>
          <input 
            type="text" 
            value={guidelineForm.approvedBy.designation}
            onChange={(e) => setGuidelineForm({
              ...guidelineForm, 
              approvedBy: {...guidelineForm.approvedBy, designation: e.target.value}
            })}
          />
        </div>
        <div className="form-row">
          <label>Date</label>
          <input 
            type="date" 
            value={guidelineForm.approvedBy.date}
            onChange={(e) => setGuidelineForm({
              ...guidelineForm, 
              approvedBy: {...guidelineForm.approvedBy, date: e.target.value}
            })}
          />
        </div>
      </div>

      <button type="submit" disabled={loading} className="submit-btn">
        {loading ? "Adding..." : "Add Guideline"}
      </button>
    </form>
  );
  return (
    <div className="admin-data-forms">
      <div className="admin-header">
        <h2>📊 Admin Data Management</h2>
        <p>Add comprehensive data for dam: {damId}</p>
      </div>

      {message && (
        <div className={`message ${message.includes('✅') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}

      <div className="tabs">
        <button 
          className={activeTab === 'history' ? 'active' : ''} 
          onClick={() => setActiveTab('history')}
        >
          📜 History
        </button>
        <button 
          className={activeTab === 'publicSpots' ? 'active' : ''} 
          onClick={() => setActiveTab('publicSpots')}
        >
          📍 Public Spots
        </button>
        <button 
          className={activeTab === 'restrictedAreas' ? 'active' : ''} 
          onClick={() => setActiveTab('restrictedAreas')}
        >
          ⛔ Restricted Areas
        </button>
        <button 
          className={activeTab === 'guidelines' ? 'active' : ''} 
          onClick={() => setActiveTab('guidelines')}
        >
          📄 Guidelines
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'history' && renderHistoryForm()}
        {activeTab === 'publicSpots' && renderPublicSpotForm()}
        {activeTab === 'restrictedAreas' && renderRestrictedAreaForm()}
        {activeTab === 'guidelines' && renderGuidelineForm()}
      </div>

      <div className="existing-data">
        <h3>Existing Data Summary</h3>
        <div className="data-stats">
          <div className="stat-item">
            <span className="stat-number">{existingData.history.length}</span>
            <span className="stat-label">History Events</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{existingData.publicSpots.length}</span>
            <span className="stat-label">Public Spots</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{existingData.restrictedAreas.length}</span>
            <span className="stat-label">Restricted Areas</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{existingData.guidelines.length}</span>
            <span className="stat-label">Guidelines</span>
          </div>
        </div>
      </div>
    </div>
  );
}