// Test controller to verify alert system without database dependency
export const getTestAlerts = async (req, res) => {
  try {
    // Mock alert data for testing
    const mockAlerts = [
      {
        _id: "test1",
        dam: {
          _id: "dam1",
          name: "Tehri Dam",
          state: "Uttarakhand",
          river: "Bhagirathi"
        },
        floodRiskLevel: "Red",
        seepageReport: "Significant seepage detected in downstream area. Flow rate: 15 L/min. Immediate monitoring required.",
        structuralHealth: {
          cracks: "Minor hairline cracks observed in spillway section",
          vibration: "Normal operational vibrations within acceptable limits",
          tilt: "No structural tilt detected"
        },
        earthquakeZone: "Zone IV - High Risk",
        emergencyContact: {
          authorityName: "Tehri Hydro Development Corporation",
          phone: "+91-1376-233456",
          email: "emergency@thdc.co.in"
        },
        updatedAt: new Date()
      },
      {
        _id: "test2",
        dam: {
          _id: "dam2",
          name: "Sardar Sarovar Dam",
          state: "Gujarat",
          river: "Narmada"
        },
        floodRiskLevel: "Yellow",
        seepageReport: "Minor seepage observed at foundation level. Flow rate: 5 L/min. Under regular monitoring.",
        structuralHealth: {
          cracks: "No significant cracks detected",
          vibration: "Slight increase in vibration levels during peak discharge",
          tilt: "Minimal tilt within design parameters"
        },
        earthquakeZone: "Zone III - Moderate Risk",
        emergencyContact: {
          authorityName: "Sardar Sarovar Narmada Nigam Ltd",
          phone: "+91-2692-230123",
          email: "control@ssnnl.com"
        },
        updatedAt: new Date()
      },
      {
        _id: "test3",
        dam: {
          _id: "dam3",
          name: "Bhakra Dam",
          state: "Himachal Pradesh",
          river: "Sutlej"
        },
        floodRiskLevel: "Green",
        seepageReport: "No significant seepage detected. All parameters within normal range.",
        structuralHealth: {
          cracks: "Routine maintenance cracks sealed during last inspection",
          vibration: "All vibration readings normal",
          tilt: "No structural displacement detected"
        },
        earthquakeZone: "Zone IV - High Risk",
        emergencyContact: {
          authorityName: "Bhakra Beas Management Board",
          phone: "+91-1881-222333",
          email: "emergency@bbmb.gov.in"
        },
        updatedAt: new Date()
      }
    ];

    const criticalAlerts = mockAlerts.filter(alert => 
      alert.floodRiskLevel === "Red" || alert.floodRiskLevel === "Yellow"
    );

    res.json({
      critical: {
        red: mockAlerts.filter(alert => alert.floodRiskLevel === "Red"),
        yellow: mockAlerts.filter(alert => alert.floodRiskLevel === "Yellow")
      },
      summary: {
        totalCritical: criticalAlerts.length,
        redCount: mockAlerts.filter(alert => alert.floodRiskLevel === "Red").length,
        yellowCount: mockAlerts.filter(alert => alert.floodRiskLevel === "Yellow").length
      }
    });
  } catch (error) {
    console.error("Error in test alerts:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getTestDashboard = async (req, res) => {
  try {
    const mockDashboard = {
      overview: {
        totalAlerts: 16,
        riskDistribution: {
          Red: 5,
          Yellow: 7,
          Green: 4
        },
        criticalAlerts: 12
      },
      topStates: [
        { _id: "Uttarakhand", totalAlerts: 3, redAlerts: 1, yellowAlerts: 1 },
        { _id: "Gujarat", totalAlerts: 2, redAlerts: 0, yellowAlerts: 2 },
        { _id: "Himachal Pradesh", totalAlerts: 2, redAlerts: 0, yellowAlerts: 1 },
        { _id: "Maharashtra", totalAlerts: 1, redAlerts: 0, yellowAlerts: 1 },
        { _id: "Karnataka", totalAlerts: 2, redAlerts: 0, yellowAlerts: 0 }
      ],
      maintenanceDue: [
        {
          damName: "Tehri Dam",
          state: "Uttarakhand",
          nextInspection: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
          riskLevel: "Red",
          daysUntilInspection: 15
        },
        {
          damName: "Nagarjuna Sagar Dam",
          state: "Telangana",
          nextInspection: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
          riskLevel: "Red",
          daysUntilInspection: 10
        }
      ]
    };

    res.json(mockDashboard);
  } catch (error) {
    console.error("Error in test dashboard:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};