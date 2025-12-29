import Safety from "../models/Safety.js";
import Dam from "../models/Dam.js";
import User from "../models/User.js";

// Get all alerts with filtering and sorting
export const getAllAlerts = async (req, res) => {
  try {
    const { riskLevel, state, river, sortBy = 'updatedAt', sortOrder = 'desc' } = req.query;
    
    // Build filter query
    let matchQuery = {};
    if (riskLevel) {
      matchQuery.floodRiskLevel = riskLevel;
    }

    // Create aggregation pipeline
    const pipeline = [
      { $match: matchQuery },
      {
        $lookup: {
          from: 'dams',
          localField: 'dam',
          foreignField: '_id',
          as: 'damInfo'
        }
      },
      { $unwind: '$damInfo' },
      {
        $match: {
          ...(state && { 'damInfo.state': { $regex: state, $options: 'i' } }),
          ...(river && { 'damInfo.river': { $regex: river, $options: 'i' } })
        }
      },
      {
        $sort: { [sortBy]: sortOrder === 'desc' ? -1 : 1 }
      }
    ];

    const alerts = await Safety.aggregate(pipeline);
    
    // Get statistics
    const stats = await Safety.aggregate([
      {
        $group: {
          _id: '$floodRiskLevel',
          count: { $sum: 1 }
        }
      }
    ]);

    const statsMap = stats.reduce((acc, stat) => {
      acc[stat._id] = stat.count;
      return acc;
    }, {});

    res.json({
      alerts,
      statistics: {
        total: alerts.length,
        red: statsMap.Red || 0,
        yellow: statsMap.Yellow || 0,
        green: statsMap.Green || 0
      }
    });
  } catch (error) {
    console.error("Error fetching alerts:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get critical alerts (Red and Yellow only)
export const getCriticalAlerts = async (req, res) => {
  try {
    const criticalAlerts = await Safety.find({
      floodRiskLevel: { $in: ['Red', 'Yellow'] }
    })
    .populate('dam', 'name state river riverName')
    .sort({ updatedAt: -1 })
    .limit(20);

    // Categorize alerts by urgency
    const redAlerts = criticalAlerts.filter(alert => alert.floodRiskLevel === 'Red');
    const yellowAlerts = criticalAlerts.filter(alert => alert.floodRiskLevel === 'Yellow');

    res.json({
      critical: {
        red: redAlerts,
        yellow: yellowAlerts
      },
      summary: {
        totalCritical: criticalAlerts.length,
        redCount: redAlerts.length,
        yellowCount: yellowAlerts.length
      }
    });
  } catch (error) {
    console.error("Error fetching critical alerts:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get alerts by geographic region
export const getAlertsByRegion = async (req, res) => {
  try {
    const alerts = await Safety.aggregate([
      {
        $lookup: {
          from: 'dams',
          localField: 'dam',
          foreignField: '_id',
          as: 'damInfo'
        }
      },
      { $unwind: '$damInfo' },
      {
        $group: {
          _id: '$damInfo.state',
          alerts: {
            $push: {
              damName: '$damInfo.name',
              river: '$damInfo.river',
              floodRiskLevel: '$floodRiskLevel',
              seepageReport: '$seepageReport',
              lastUpdated: '$updatedAt'
            }
          },
          totalAlerts: { $sum: 1 },
          redAlerts: {
            $sum: { $cond: [{ $eq: ['$floodRiskLevel', 'Red'] }, 1, 0] }
          },
          yellowAlerts: {
            $sum: { $cond: [{ $eq: ['$floodRiskLevel', 'Yellow'] }, 1, 0] }
          },
          greenAlerts: {
            $sum: { $cond: [{ $eq: ['$floodRiskLevel', 'Green'] }, 1, 0] }
          }
        }
      },
      {
        $sort: { redAlerts: -1, yellowAlerts: -1 }
      }
    ]);

    res.json({
      regions: alerts,
      summary: {
        totalStates: alerts.length,
        totalAlerts: alerts.reduce((sum, region) => sum + region.totalAlerts, 0)
      }
    });
  } catch (error) {
    console.error("Error fetching alerts by region:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get recent alert activity
export const getRecentAlertActivity = async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const recentAlerts = await Safety.find({
      updatedAt: { $gte: startDate }
    })
    .populate('dam', 'name state river')
    .sort({ updatedAt: -1 });

    // Group by date
    const activityByDate = recentAlerts.reduce((acc, alert) => {
      const date = alert.updatedAt.toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = { red: 0, yellow: 0, green: 0, alerts: [] };
      }
      acc[date][alert.floodRiskLevel.toLowerCase()]++;
      acc[date].alerts.push({
        damName: alert.dam.name,
        state: alert.dam.state,
        river: alert.dam.river,
        riskLevel: alert.floodRiskLevel,
        time: alert.updatedAt
      });
      return acc;
    }, {});

    res.json({
      period: `Last ${days} days`,
      activity: activityByDate,
      summary: {
        totalUpdates: recentAlerts.length,
        datesWithActivity: Object.keys(activityByDate).length
      }
    });
  } catch (error) {
    console.error("Error fetching recent alert activity:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update alert status (for admin use)
export const updateAlertStatus = async (req, res) => {
  try {
    const { alertId } = req.params;
    const updateData = req.body;

    const updatedAlert = await Safety.findByIdAndUpdate(
      alertId,
      { ...updateData, updatedAt: new Date() },
      { new: true }
    ).populate('dam', 'name state river');

    if (!updatedAlert) {
      return res.status(404).json({ message: "Alert not found" });
    }

    res.json({
      message: "Alert updated successfully",
      alert: updatedAlert
    });
  } catch (error) {
    console.error("Error updating alert:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get alert statistics dashboard
export const getAlertDashboard = async (req, res) => {
  try {
    // Overall statistics
    const totalAlerts = await Safety.countDocuments();
    const riskDistribution = await Safety.aggregate([
      { $group: { _id: '$floodRiskLevel', count: { $sum: 1 } } }
    ]);

    // Recent trends (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentTrends = await Safety.aggregate([
      { $match: { updatedAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: "%Y-%m-%d", date: "$updatedAt" } },
            riskLevel: "$floodRiskLevel"
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.date": 1 } }
    ]);

    // Top states with most alerts
    const stateAlerts = await Safety.aggregate([
      {
        $lookup: {
          from: 'dams',
          localField: 'dam',
          foreignField: '_id',
          as: 'damInfo'
        }
      },
      { $unwind: '$damInfo' },
      {
        $group: {
          _id: '$damInfo.state',
          totalAlerts: { $sum: 1 },
          redAlerts: { $sum: { $cond: [{ $eq: ['$floodRiskLevel', 'Red'] }, 1, 0] } },
          yellowAlerts: { $sum: { $cond: [{ $eq: ['$floodRiskLevel', 'Yellow'] }, 1, 0] } }
        }
      },
      { $sort: { redAlerts: -1, yellowAlerts: -1 } },
      { $limit: 10 }
    ]);

    // Maintenance due alerts
    const maintenanceDue = await Safety.find({
      'maintenance.nextInspection': { $lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) }
    })
    .populate('dam', 'name state')
    .sort({ 'maintenance.nextInspection': 1 });

    res.json({
      overview: {
        totalAlerts,
        riskDistribution: riskDistribution.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        criticalAlerts: (riskDistribution.find(r => r._id === 'Red')?.count || 0) + 
                       (riskDistribution.find(r => r._id === 'Yellow')?.count || 0)
      },
      trends: recentTrends,
      topStates: stateAlerts,
      maintenanceDue: maintenanceDue.map(alert => ({
        damName: alert.dam.name,
        state: alert.dam.state,
        nextInspection: alert.maintenance.nextInspection,
        riskLevel: alert.floodRiskLevel,
        daysUntilInspection: Math.ceil((alert.maintenance.nextInspection - new Date()) / (1000 * 60 * 60 * 24))
      }))
    });
  } catch (error) {
    console.error("Error fetching alert dashboard:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};