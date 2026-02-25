/**
 * Calculation Engine for Derived Dam Fields
 * Contains all formulas for calculating derived/computed fields
 */

// ==================== CONSTANTS ====================
const GRAVITY = 9.81; // m/s²
const RUNOFF_COEFFICIENT_DEFAULT = 0.7; // Typical runoff coefficient

// ==================== 1. RESERVOIR GEOMETRY CALCULATIONS ====================

/**
 * Calculate river cross-section area
 * Formula: riverWidth × riverDepth
 */
export const calculateRiverCrossSectionArea = (riverWidth, riverDepth) => {
  if (!riverWidth || !riverDepth) return null;
  return riverWidth * riverDepth;
};

/**
 * Calculate hydraulic radius
 * Formula: Area / Wetted Perimeter
 * Approximation for rectangular channel: (width × depth) / (width + 2×depth)
 */
export const calculateHydraulicRadius = (riverWidth, riverDepth) => {
  if (!riverWidth || !riverDepth) return null;
  const area = riverWidth * riverDepth;
  const wettedPerimeter = riverWidth + (2 * riverDepth);
  return area / wettedPerimeter;
};

/**
 * Calculate effective discharge capacity
 * Formula: dischargeCoefficient × gateOpeningPercentage × head
 */
export const calculateEffectiveDischargeCapacity = (dischargeCoefficient, gateOpeningPercentage, head) => {
  if (!dischargeCoefficient || gateOpeningPercentage === null || gateOpeningPercentage === undefined || !head) return null;
  return dischargeCoefficient * (gateOpeningPercentage / 100) * head;
};

// ==================== 2. STORAGE & CAPACITY CALCULATIONS ====================

/**
 * Calculate available capacity
 * Formula: maxStorage − liveStorage
 */
export const calculateAvailableCapacity = (maxStorage, liveStorage) => {
  if (!maxStorage || !liveStorage) return null;
  return maxStorage - liveStorage;
};

/**
 * Calculate storage utilization percentage
 * Formula: (liveStorage / maxStorage) × 100
 */
export const calculateStorageUtilization = (liveStorage, maxStorage) => {
  if (!liveStorage || !maxStorage || maxStorage === 0) return null;
  return (liveStorage / maxStorage) * 100;
};

/**
 * Calculate flood cushion available
 * Formula: floodCushionStorage − currentExcessStorage
 */
export const calculateFloodCushionAvailable = (floodCushionStorage, currentExcessStorage) => {
  if (!floodCushionStorage || currentExcessStorage === null || currentExcessStorage === undefined) return null;
  return floodCushionStorage - currentExcessStorage;
};

/**
 * Calculate basin storage utilization
 * Formula: (basinLiveStorage / basinTotalStorage) × 100
 */
export const calculateBasinStorageUtilization = (basinLiveStorage, basinTotalStorage) => {
  if (!basinLiveStorage || !basinTotalStorage || basinTotalStorage === 0) return null;
  return (basinLiveStorage / basinTotalStorage) * 100;
};

// ==================== 3. REAL-TIME FLOW CALCULATIONS ====================

/**
 * Calculate rainfall contribution
 * Formula: rainfallRate × catchmentArea × runoffCoefficient
 */
export const calculateRainfallContribution = (rainfallRate, catchmentArea, runoffCoefficient = RUNOFF_COEFFICIENT_DEFAULT) => {
  if (!rainfallRate || !catchmentArea) return null;
  return rainfallRate * catchmentArea * runoffCoefficient;
};

/**
 * Calculate total inflow
 * Formula: inflowRate + inflowFromUpstreamDam + rainfallContribution
 */
export const calculateTotalInflow = (inflowRate, inflowFromUpstreamDam, rainfallContribution) => {
  const inflow = inflowRate || 0;
  const upstreamInflow = inflowFromUpstreamDam || 0;
  const rainfall = rainfallContribution || 0;
  return inflow + upstreamInflow + rainfall;
};

/**
 * Calculate evaporation loss
 * Formula: evaporationRate × surfaceArea
 */
export const calculateEvaporationLoss = (evaporationRate, surfaceArea) => {
  if (!evaporationRate || !surfaceArea) return null;
  return evaporationRate * surfaceArea;
};

/**
 * Calculate net flow
 * Formula: totalInflow − (outflowRate + spillwayDischarge + evaporationLoss)
 */
export const calculateNetFlow = (totalInflow, outflowRate, spillwayDischarge, evaporationLoss) => {
  if (totalInflow === null || totalInflow === undefined) return null;
  const outflow = outflowRate || 0;
  const spillway = spillwayDischarge || 0;
  const evaporation = evaporationLoss || 0;
  return totalInflow - (outflow + spillway + evaporation);
};

/**
 * Calculate river velocity using Manning's equation
 * Formula: (1/n) × R^(2/3) × S^(1/2)
 * where n = Manning's roughness coefficient, R = hydraulic radius, S = slope
 */
export const calculateRiverVelocity = (hydraulicRadius, slope, manningCoefficient = 0.03) => {
  if (!hydraulicRadius || !slope) return null;
  return (1 / manningCoefficient) * Math.pow(hydraulicRadius, 2/3) * Math.pow(slope, 1/2);
};

/**
 * Calculate safe outflow margin
 * Formula: downstreamSafeDischargeLimit − currentDischarge
 */
export const calculateSafeOutflowMargin = (downstreamSafeDischargeLimit, currentDischarge) => {
  if (!downstreamSafeDischargeLimit || currentDischarge === null || currentDischarge === undefined) return null;
  return downstreamSafeDischargeLimit - currentDischarge;
};

// ==================== 4. FORECAST & METEOROLOGICAL CALCULATIONS ====================

/**
 * Calculate predicted rainfall contribution
 * Formula: rainfallForecast × catchmentArea × runoffCoefficient
 */
export const calculatePredictedRainfallContribution = (rainfallForecast, catchmentArea, runoffCoefficient = RUNOFF_COEFFICIENT_DEFAULT) => {
  if (!rainfallForecast || !catchmentArea) return null;
  return rainfallForecast * catchmentArea * runoffCoefficient;
};

/**
 * Calculate runoff volume forecast
 * Formula: rainfallForecastNext24hr × runoffCoefficient
 */
export const calculateRunoffVolumeForecast = (rainfallForecastNext24hr, runoffCoefficient = RUNOFF_COEFFICIENT_DEFAULT) => {
  if (!rainfallForecastNext24hr) return null;
  return rainfallForecastNext24hr * runoffCoefficient;
};

/**
 * Calculate catchment runoff index
 * Formula: f(soilMoistureIndex, rainfallForecast)
 * Simplified: weighted average
 */
export const calculateCatchmentRunoffIndex = (soilMoistureIndex, rainfallForecast) => {
  if (soilMoistureIndex === null || soilMoistureIndex === undefined || !rainfallForecast) return null;
  // Weighted formula: 60% soil moisture + 40% rainfall forecast
  return (0.6 * soilMoistureIndex) + (0.4 * rainfallForecast);
};

/**
 * Calculate storm risk index
 * Formula: f(weatherSystemSeverityIndex, windSpeed)
 * Simplified: weighted combination
 */
export const calculateStormRiskIndex = (weatherSystemSeverityIndex, windSpeed) => {
  if (weatherSystemSeverityIndex === null || weatherSystemSeverityIndex === undefined || !windSpeed) return null;
  // Weighted formula: 70% severity + 30% wind speed normalized
  const windFactor = Math.min(windSpeed / 100, 1); // Normalize wind speed to 0-1
  return (0.7 * weatherSystemSeverityIndex) + (0.3 * windFactor * 100);
};

// ==================== 5. PREDICTIVE & SIMULATION CALCULATIONS ====================

/**
 * Calculate arrival time from upstream
 * Formula: upstreamDamDistance / upstreamRiverVelocity
 * Returns time in hours
 */
export const calculateArrivalTimeFromUpstream = (upstreamDamDistance, upstreamRiverVelocity) => {
  if (!upstreamDamDistance || !upstreamRiverVelocity || upstreamRiverVelocity === 0) return null;
  // Convert from seconds to hours
  return (upstreamDamDistance * 1000) / (upstreamRiverVelocity * 3600);
};

/**
 * Calculate downstream arrival time
 * Formula: downstreamDamDistance / downstreamRiverVelocity
 * Returns time in hours
 */
export const calculateDownstreamArrivalTime = (downstreamDamDistance, downstreamRiverVelocity) => {
  if (!downstreamDamDistance || !downstreamRiverVelocity || downstreamRiverVelocity === 0) return null;
  return (downstreamDamDistance * 1000) / (downstreamRiverVelocity * 3600);
};

/**
 * Calculate predicted storage
 * Formula: currentStorage + (netFlow × time)
 */
export const calculatePredictedStorage = (currentStorage, netFlow, timeHours) => {
  if (currentStorage === null || currentStorage === undefined || !netFlow || !timeHours) return null;
  // Convert time to seconds and calculate volume change
  const volumeChange = netFlow * timeHours * 3600;
  return currentStorage + volumeChange;
};

/**
 * Calculate predicted water level
 * Formula: predictedStorage ÷ surfaceArea
 */
export const calculatePredictedWaterLevel = (predictedStorage, surfaceArea) => {
  if (!predictedStorage || !surfaceArea || surfaceArea === 0) return null;
  return predictedStorage / surfaceArea;
};

/**
 * Calculate time to overflow
 * Formula: availableCapacity ÷ netFlow
 * Returns time in hours
 */
export const calculateTimeToOverflow = (availableCapacity, netFlow) => {
  if (!availableCapacity || !netFlow || netFlow <= 0) return null;
  // Convert from seconds to hours
  return availableCapacity / (netFlow * 3600);
};

/**
 * Calculate flood risk score (0-100%)
 * Weighted combination of multiple factors
 */
export const calculateFloodRiskScore = (storageUtilization, rainfallForecast, timeToOverflow, downstreamRisk) => {
  if (storageUtilization === null || storageUtilization === undefined) return null;
  
  let score = 0;
  
  // Storage utilization (40% weight)
  score += (storageUtilization / 100) * 40;
  
  // Rainfall forecast (30% weight) - normalized to 0-100
  if (rainfallForecast) {
    const rainfallFactor = Math.min(rainfallForecast / 100, 1);
    score += rainfallFactor * 30;
  }
  
  // Time to overflow (20% weight) - inverse relationship
  if (timeToOverflow) {
    const timeFactor = Math.max(0, 1 - (timeToOverflow / 48)); // 48 hours as reference
    score += timeFactor * 20;
  }
  
  // Downstream risk (10% weight)
  if (downstreamRisk) {
    score += (downstreamRisk / 100) * 10;
  }
  
  return Math.min(Math.max(score, 0), 100); // Clamp between 0-100
};

// ==================== 6. STRUCTURAL HEALTH CALCULATIONS ====================

/**
 * Calculate dam health score (0-100)
 * Weighted function of multiple structural parameters
 */
export const calculateDamHealthScore = (structuralStressIndex, seepageRate, vibrationLevel, crackSensorStatus, upliftPressure) => {
  let score = 100; // Start with perfect score
  
  // Structural stress (30% weight)
  if (structuralStressIndex) {
    score -= (structuralStressIndex / 10) * 30; // Assuming index 0-10
  }
  
  // Seepage rate (25% weight) - higher is worse
  if (seepageRate) {
    const seepageFactor = Math.min(seepageRate / 100, 1); // Normalize
    score -= seepageFactor * 25;
  }
  
  // Vibration level (20% weight)
  if (vibrationLevel) {
    const vibrationFactor = Math.min(vibrationLevel / 10, 1); // Normalize
    score -= vibrationFactor * 20;
  }
  
  // Crack sensor status (15% weight)
  if (crackSensorStatus) {
    const statusPenalty = {
      'Normal': 0,
      'Warning': 5,
      'Critical': 12,
      'Offline': 15
    };
    score -= statusPenalty[crackSensorStatus] || 0;
  }
  
  // Uplift pressure (10% weight)
  if (upliftPressure) {
    const pressureFactor = Math.min(upliftPressure / 1000, 1); // Normalize to kPa
    score -= pressureFactor * 10;
  }
  
  return Math.min(Math.max(score, 0), 100); // Clamp between 0-100
};

// ==================== 7. GATE & SPILLWAY CALCULATIONS ====================

/**
 * Calculate actual discharge
 * Formula: dischargeCoefficient × gateOpening × √(2 × g × head)
 */
export const calculateActualDischarge = (dischargeCoefficient, gateOpening, head) => {
  if (!dischargeCoefficient || gateOpening === null || gateOpening === undefined || !head) return null;
  return dischargeCoefficient * gateOpening * Math.sqrt(2 * GRAVITY * head);
};

/**
 * Calculate gate efficiency index
 * Formula: actualDischarge / maxGateDischargeCapacity
 */
export const calculateGateEfficiencyIndex = (actualDischarge, maxGateDischargeCapacity) => {
  if (!actualDischarge || !maxGateDischargeCapacity || maxGateDischargeCapacity === 0) return null;
  return (actualDischarge / maxGateDischargeCapacity) * 100;
};

// ==================== 8. DOWNSTREAM RISK CALCULATIONS ====================

/**
 * Calculate downstream flood impact score
 * Formula: f(population, infrastructure, discharge)
 */
export const calculateDownstreamFloodImpactScore = (population, infrastructureCount, discharge) => {
  if (!population) return null;
  
  let score = 0;
  
  // Population factor (50% weight)
  const popFactor = Math.min(population / 100000, 1); // Normalize to 100k
  score += popFactor * 50;
  
  // Infrastructure factor (30% weight)
  if (infrastructureCount) {
    const infraFactor = Math.min(infrastructureCount / 20, 1); // Normalize to 20 facilities
    score += infraFactor * 30;
  }
  
  // Discharge factor (20% weight)
  if (discharge) {
    const dischargeFactor = Math.min(discharge / 1000, 1); // Normalize to 1000 m³/s
    score += dischargeFactor * 20;
  }
  
  return Math.min(score, 100);
};

/**
 * Calculate evacuation time remaining
 * Formula: predictedRiverBankOverflowTime − evacuationTimeRequired
 */
export const calculateEvacuationTimeRemaining = (predictedOverflowTime, evacuationTimeRequired) => {
  if (!predictedOverflowTime || !evacuationTimeRequired) return null;
  return predictedOverflowTime - evacuationTimeRequired;
};

/**
 * Calculate human risk index
 * Formula: f(population, floodProbability)
 */
export const calculateHumanRiskIndex = (population, floodProbability) => {
  if (!population || floodProbability === null || floodProbability === undefined) return null;
  const popFactor = Math.min(population / 100000, 1);
  const probFactor = floodProbability / 100;
  return popFactor * probFactor * 100;
};

// ==================== 9. BASIN-LEVEL CALCULATIONS ====================

/**
 * Calculate cascading failure probability
 * Based on upstream and downstream stress levels
 */
export const calculateCascadingFailureProbability = (upstreamStress, downstreamStress, damHealthScore) => {
  if (upstreamStress === null || upstreamStress === undefined || 
      downstreamStress === null || downstreamStress === undefined || 
      !damHealthScore) return null;
  
  const stressFactor = ((upstreamStress + downstreamStress) / 2) / 100;
  const healthFactor = (100 - damHealthScore) / 100;
  
  return Math.min((stressFactor * 0.6 + healthFactor * 0.4) * 100, 100);
};

/**
 * Calculate multi-dam optimization score
 * Composite score based on coordination efficiency
 */
export const calculateMultiDamOptimizationScore = (coordinationStatus, storageUtilization, flowBalance) => {
  let score = 0;
  
  // Coordination status (40% weight)
  const coordScore = {
    'Not Coordinated': 0,
    'Partially Coordinated': 40,
    'Fully Coordinated': 80,
    'Optimized': 100
  };
  score += (coordScore[coordinationStatus] || 0) * 0.4;
  
  // Storage utilization balance (30% weight) - optimal around 70%
  if (storageUtilization !== null && storageUtilization !== undefined) {
    const utilOptimal = 100 - Math.abs(storageUtilization - 70);
    score += utilOptimal * 0.3;
  }
  
  // Flow balance (30% weight)
  if (flowBalance !== null && flowBalance !== undefined) {
    score += flowBalance * 0.3;
  }
  
  return Math.min(Math.max(score, 0), 100);
};

// ==================== EXPORT ALL CALCULATIONS ====================
export default {
  // Geometry
  calculateRiverCrossSectionArea,
  calculateHydraulicRadius,
  calculateEffectiveDischargeCapacity,
  
  // Storage
  calculateAvailableCapacity,
  calculateStorageUtilization,
  calculateFloodCushionAvailable,
  calculateBasinStorageUtilization,
  
  // Flow
  calculateRainfallContribution,
  calculateTotalInflow,
  calculateEvaporationLoss,
  calculateNetFlow,
  calculateRiverVelocity,
  calculateSafeOutflowMargin,
  
  // Forecast
  calculatePredictedRainfallContribution,
  calculateRunoffVolumeForecast,
  calculateCatchmentRunoffIndex,
  calculateStormRiskIndex,
  
  // Predictive
  calculateArrivalTimeFromUpstream,
  calculateDownstreamArrivalTime,
  calculatePredictedStorage,
  calculatePredictedWaterLevel,
  calculateTimeToOverflow,
  calculateFloodRiskScore,
  
  // Structural
  calculateDamHealthScore,
  
  // Gate & Spillway
  calculateActualDischarge,
  calculateGateEfficiencyIndex,
  
  // Downstream Risk
  calculateDownstreamFloodImpactScore,
  calculateEvacuationTimeRemaining,
  calculateHumanRiskIndex,
  
  // Basin Level
  calculateCascadingFailureProbability,
  calculateMultiDamOptimizationScore
};
