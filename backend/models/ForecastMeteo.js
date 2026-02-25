import mongoose from "mongoose";
import {
  calculatePredictedRainfallContribution,
  calculateRunoffVolumeForecast,
  calculateCatchmentRunoffIndex,
  calculateStormRiskIndex
} from "../utils/calculationEngine.js";

const forecastMeteoSchema = new mongoose.Schema({
  dam: { type: mongoose.Schema.Types.ObjectId, ref: "Dam", required: true, unique: true },
  
  // Input fields
  rainfallForecastNext6hr: Number, // mm
  rainfallForecastNext12hr: Number, // mm
  rainfallForecastNext24hr: Number, // mm
  rainfallForecastNext48hr: Number, // mm
  temperatureForecast: Number, // °C
  windSpeedForecast: Number, // km/h
  humidityForecast: Number, // %
  evaporationForecast: Number, // mm/day
  soilMoistureIndex: Number, // 0-100
  weatherSystemSeverityIndex: Number, // 0-100
  stormProbability: Number, // %
  catchmentArea: Number, // km²
  runoffCoefficient: Number, // 0-1
  
  // Calculated fields
  predictedRainfallContribution: Number, // m³/s - calculated
  runoffVolumeForecast: Number, // m³ - calculated
  catchmentRunoffIndex: Number, // 0-100 - calculated
  stormRiskIndex: Number, // 0-100 - calculated
  
}, { timestamps: true });

// Pre-save hook to calculate derived fields
forecastMeteoSchema.pre('save', function(next) {
  // Calculate predicted rainfall contribution
  if (this.rainfallForecastNext24hr && this.catchmentArea) {
    this.predictedRainfallContribution = calculatePredictedRainfallContribution(
      this.rainfallForecastNext24hr,
      this.catchmentArea,
      this.runoffCoefficient
    );
  }
  
  // Calculate runoff volume forecast
  if (this.rainfallForecastNext24hr) {
    this.runoffVolumeForecast = calculateRunoffVolumeForecast(
      this.rainfallForecastNext24hr,
      this.runoffCoefficient
    );
  }
  
  // Calculate catchment runoff index
  if (this.soilMoistureIndex !== null && this.soilMoistureIndex !== undefined && this.rainfallForecastNext24hr) {
    this.catchmentRunoffIndex = calculateCatchmentRunoffIndex(
      this.soilMoistureIndex,
      this.rainfallForecastNext24hr
    );
  }
  
  // Calculate storm risk index
  if (this.weatherSystemSeverityIndex !== null && this.weatherSystemSeverityIndex !== undefined && this.windSpeedForecast) {
    this.stormRiskIndex = calculateStormRiskIndex(
      this.weatherSystemSeverityIndex,
      this.windSpeedForecast
    );
  }
  
  next();
});

export default mongoose.model("ForecastMeteo", forecastMeteoSchema);
