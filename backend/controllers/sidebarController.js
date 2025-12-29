import User from "../models/User.js";
import Dam from "../models/Dam.js";
import Safety from "../models/Safety.js";
import DamHistory from "../models/DamHistory.js";
import PublicSpot from "../models/PublicSpot.js";
import RestrictedArea from "../models/RestrictedArea.js";
import Guideline from "../models/Guideline.js";

// ======================= ALERTS (SAFETY) =======================
export const getAlertsForSavedDams = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("savedDams");
    if (!user) return res.status(404).json({ message: "User not found" });

    const savedDamIds = user.savedDams.map(dam => dam._id);
    
    const alerts = await Safety.find({ dam: { $in: savedDamIds } })
      .populate("dam", "name state river")
      .sort({ updatedAt: -1 });

    // Filter for high-priority alerts
    const criticalAlerts = alerts.filter(alert => 
      alert.floodRiskLevel === "Red" || 
      alert.floodRiskLevel === "Yellow"
    );

    res.json({
      total: alerts.length,
      critical: criticalAlerts.length,
      alerts: alerts.map(alert => ({
        _id: alert._id,
        dam: alert.dam,
        floodRiskLevel: alert.floodRiskLevel,
        seepageReport: alert.seepageReport,
        structuralHealth: alert.structuralHealth,
        earthquakeZone: alert.earthquakeZone,
        emergencyContact: alert.emergencyContact,
        lastInspection: alert.maintenance?.lastInspection,
        nextInspection: alert.maintenance?.nextInspection,
        updatedAt: alert.updatedAt,
      }))
    });
  } catch (err) {
    console.error("Error fetching alerts for saved dams:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ======================= SAVED DAMS =======================
export const getSavedDamsDetails = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: "savedDams",
      select: "name state river coordinates damType height constructionYear operator maxStorage"
    });
    
    if (!user) return res.status(404).json({ message: "User not found" });

    const savedDamsWithDetails = await Promise.all(
      user.savedDams.map(async (dam) => {
        // Get latest safety info
        const safety = await Safety.findOne({ dam: dam._id }).sort({ updatedAt: -1 });
        
        // Get recent history
        const recentHistory = await DamHistory.find({ dam: dam._id })
          .sort({ eventDate: -1 })
          .limit(3);

        return {
          ...dam.toObject(),
          safety: safety ? {
            floodRiskLevel: safety.floodRiskLevel,
            lastInspection: safety.maintenance?.lastInspection,
            nextInspection: safety.maintenance?.nextInspection,
          } : null,
          recentEvents: recentHistory.length,
          lastEventDate: recentHistory[0]?.eventDate || null,
        };
      })
    );

    res.json({
      total: savedDamsWithDetails.length,
      dams: savedDamsWithDetails
    });
  } catch (err) {
    console.error("Error fetching saved dams details:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ======================= GUIDELINES =======================
export const getGuidelinesForSavedDams = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("savedDams");
    if (!user) return res.status(404).json({ message: "User not found" });

    const savedDamIds = user.savedDams.map(dam => dam._id);
    
    // Get guidelines applicable to saved dams or general guidelines
    const guidelines = await Guideline.find({
      $or: [
        { "applicableDams.dam": { $in: savedDamIds } },
        { "applicableDams": { $size: 0 } }, // General guidelines
        { "targetAudience": "public" },
        { "targetAudience": "all" }
      ],
      isActive: true
    })
    .populate("applicableDams.dam", "name")
    .sort({ priority: -1, updatedAt: -1 });

    const categorizedGuidelines = guidelines.reduce((acc, guideline) => {
      if (!acc[guideline.category]) {
        acc[guideline.category] = [];
      }
      acc[guideline.category].push({
        _id: guideline._id,
        title: guideline.title,
        description: guideline.description,
        priority: guideline.priority,
        targetAudience: guideline.targetAudience,
        applicableDams: guideline.applicableDams,
        effectiveDate: guideline.effectiveDate,
        steps: guideline.steps?.length || 0,
      });
      return acc;
    }, {});

    res.json({
      total: guidelines.length,
      categories: Object.keys(categorizedGuidelines),
      guidelines: categorizedGuidelines
    });
  } catch (err) {
    console.error("Error fetching guidelines for saved dams:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ======================= RESTRICTED AREAS =======================
export const getRestrictedAreasForSavedDams = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("savedDams");
    if (!user) return res.status(404).json({ message: "User not found" });

    const savedDamIds = user.savedDams.map(dam => dam._id);
    
    const restrictedAreas = await RestrictedArea.find({
      "nearbyDams.dam": { $in: savedDamIds },
      isActive: true
    })
    .populate("nearbyDams.dam", "name state river")
    .sort({ "nearbyDams.riskLevel": -1, "nearbyDams.distance": 1 });

    const categorizedAreas = restrictedAreas.reduce((acc, area) => {
      if (!acc[area.type]) {
        acc[area.type] = [];
      }
      acc[area.type].push({
        _id: area._id,
        name: area.name,
        description: area.description,
        location: area.location,
        restrictionLevel: area.restrictionLevel,
        dangerType: area.dangerType,
        nearbyDams: area.nearbyDams,
        contactAuthority: area.contactAuthority,
        emergencyInfo: area.emergencyInfo,
      });
      return acc;
    }, {});

    res.json({
      total: restrictedAreas.length,
      types: Object.keys(categorizedAreas),
      areas: categorizedAreas
    });
  } catch (err) {
    console.error("Error fetching restricted areas for saved dams:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ======================= PUBLIC SPOTS =======================
export const getPublicSpotsForSavedDams = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("savedDams");
    if (!user) return res.status(404).json({ message: "User not found" });

    const savedDamIds = user.savedDams.map(dam => dam._id);
    
    const publicSpots = await PublicSpot.find({
      "nearbyDams.dam": { $in: savedDamIds },
      isActive: true
    })
    .populate("nearbyDams.dam", "name state river")
    .sort({ rating: -1, "nearbyDams.distance": 1 });

    const categorizedSpots = publicSpots.reduce((acc, spot) => {
      if (!acc[spot.type]) {
        acc[spot.type] = [];
      }
      acc[spot.type].push({
        _id: spot._id,
        name: spot.name,
        description: spot.description,
        location: spot.location,
        nearbyDams: spot.nearbyDams,
        facilities: spot.facilities,
        openingHours: spot.openingHours,
        contactInfo: spot.contactInfo,
        rating: spot.rating,
        accessibility: spot.accessibility,
      });
      return acc;
    }, {});

    res.json({
      total: publicSpots.length,
      types: Object.keys(categorizedSpots),
      spots: categorizedSpots
    });
  } catch (err) {
    console.error("Error fetching public spots for saved dams:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ======================= HISTORY =======================
export const getHistoryForSavedDams = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("savedDams");
    if (!user) return res.status(404).json({ message: "User not found" });

    const savedDamIds = user.savedDams.map(dam => dam._id);
    
    const history = await DamHistory.find({ dam: { $in: savedDamIds } })
      .populate("dam", "name state river")
      .sort({ eventDate: -1 })
      .limit(100); // Limit to recent 100 events

    const categorizedHistory = history.reduce((acc, event) => {
      const damName = event.dam.name;
      if (!acc[damName]) {
        acc[damName] = {
          dam: event.dam,
          events: []
        };
      }
      acc[damName].events.push({
        _id: event._id,
        eventType: event.eventType,
        title: event.title,
        description: event.description,
        eventDate: event.eventDate,
        severity: event.severity,
        impact: event.impact,
        actionsTaken: event.actionsTaken,
        cost: event.cost,
        duration: event.duration,
        affectedAreas: event.affectedAreas,
        status: event.status,
      });
      return acc;
    }, {});

    // Get summary statistics
    const stats = {
      totalEvents: history.length,
      floods: history.filter(h => h.eventType === "flood").length,
      maintenance: history.filter(h => h.eventType === "maintenance").length,
      emergencies: history.filter(h => h.eventType === "emergency").length,
      criticalEvents: history.filter(h => h.severity === "critical").length,
      recentEvents: history.filter(h => {
        const eventDate = new Date(h.eventDate);
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        return eventDate >= sixMonthsAgo;
      }).length,
    };

    res.json({
      stats,
      dams: Object.keys(categorizedHistory),
      history: categorizedHistory
    });
  } catch (err) {
    console.error("Error fetching history for saved dams:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ======================= HELP =======================
export const getHelpInfo = async (req, res) => {
  try {
    const helpInfo = {
      sections: [
        {
          title: "Getting Started",
          items: [
            {
              question: "How do I save a dam?",
              answer: "Click the star (☆) button on any dam card or page to save it. Saved dams will show a filled star (★)."
            },
            {
              question: "How do I view my saved dams?",
              answer: "Click on 'Saved Dams' in the sidebar to see all your saved dams with their current status and details."
            },
            {
              question: "What are alerts?",
              answer: "Alerts show safety information for your saved dams, including flood risk levels, structural health, and maintenance schedules."
            }
          ]
        },
        {
          title: "Features",
          items: [
            {
              question: "What information is available for each dam?",
              answer: "You can view water levels, flow rates, gate status, safety information, historical data, and nearby facilities."
            },
            {
              question: "How often is the data updated?",
              answer: "Real-time data is updated every few minutes, while safety inspections and historical records are updated as they occur."
            },
            {
              question: "Can I view dams on a map?",
              answer: "Yes, use the Water Flow page to view dams on an interactive map with state and river filtering options."
            }
          ]
        },
        {
          title: "Safety & Guidelines",
          items: [
            {
              question: "What are restricted areas?",
              answer: "Restricted areas are zones near dams where access is limited or prohibited for safety reasons. Always follow posted signs and regulations."
            },
            {
              question: "How do I report an emergency?",
              answer: "Use the emergency contact information provided in the dam's safety section, or call local emergency services immediately."
            },
            {
              question: "Where can I find safety guidelines?",
              answer: "Click on 'Guidelines' in the sidebar to view safety protocols, operational procedures, and visitor guidelines for your saved dams."
            }
          ]
        },
        {
          title: "Technical Support",
          items: [
            {
              question: "The app is not loading properly",
              answer: "Try refreshing the page, clearing your browser cache, or checking your internet connection. Contact support if issues persist."
            },
            {
              question: "I can't save dams",
              answer: "Make sure you're logged in to your account. If you're not registered, create an account first."
            },
            {
              question: "How do I contact support?",
              answer: "Use the contact form in the app or email support@dammanagement.gov for technical assistance."
            }
          ]
        }
      ],
      contacts: {
        technical: "support@dammanagement.gov",
        emergency: "1800-DAM-HELP",
        general: "info@dammanagement.gov"
      },
      version: "2.1.0",
      lastUpdated: new Date().toISOString()
    };

    res.json(helpInfo);
  } catch (err) {
    console.error("Error fetching help info:", err);
    res.status(500).json({ message: "Server error" });
  }
};