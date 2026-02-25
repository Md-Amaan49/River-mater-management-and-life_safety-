import mongoose from "mongoose";
import {
  calculateAvailableCapacity,
  calculateStorageUtilization,
  calculateFloodCushionAvailable
} from "../utils/calculationEngine.js";

const storageCapacitySchema = new mongoose.Schema({
  dam: { type: mongoose.Schema.Types.ObjectId, ref: "Dam", required: true, unique: true },
  
  // Input fields
  maxStorage: Number, // m³
  grossStorage: Number, // m³
  liveStorage: Number, // m³
  deadStorage: Number, // m³
  floodCushionStorage: Number, // m³
  dynamicFloodCushion: Number, // m³
  conservationStorage: Number, // m³
  inactiveStorage: Number, // m³
  currentExcessStorage: Number, // m³
  
  // Calculated fields
  availableCapacity: Number, // m³ - calculated
  storageUtilizationPercentage: Number, // % - calculated
  floodCushionAvailable: Number, // m³ - calculated
  
}, { timestamps: true });

// Pre-save hook to calculate derived fields
storageCapacitySchema.pre('save', function(next) {
  // Calculate available capacity
  if (this.maxStorage && this.liveStorage) {
    this.availableCapacity = calculateAvailableCapacity(this.maxStorage, this.liveStorage);
  }
  
  // Calculate storage utilization percentage
  if (this.liveStorage && this.maxStorage) {
    this.storageUtilizationPercentage = calculateStorageUtilization(this.liveStorage, this.maxStorage);
  }
  
  // Calculate flood cushion available
  if (this.floodCushionStorage && (this.currentExcessStorage !== null && this.currentExcessStorage !== undefined)) {
    this.floodCushionAvailable = calculateFloodCushionAvailable(this.floodCushionStorage, this.currentExcessStorage);
  }
  
  next();
});

export default mongoose.model("StorageCapacity", storageCapacitySchema);
