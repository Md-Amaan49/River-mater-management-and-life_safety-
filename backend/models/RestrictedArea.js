import mongoose from "mongoose";

const restrictedAreaSchema = new mongoose.Schema(
  {
    name: { 
      type: String, 
      required: true 
    },
    type: {
      type: String,
      enum: ["dam_restricted_zone", "flood_prone_area", "construction_zone", "military_area", "environmental_protection", "private_property", "dangerous_area", "other"],
      required: true,
    },
    description: { 
      type: String, 
      required: true 
    },
    location: {
      address: String,
      coordinates: {
        latitude: { type: Number, required: true },
        longitude: { type: Number, required: true },
      },
      boundaryPoints: [{
        latitude: Number,
        longitude: Number,
      }],
      city: String,
      state: String,
    },
    nearbyDams: [{
      dam: { type: mongoose.Schema.Types.ObjectId, ref: "Dam" },
      distance: { type: Number }, // in kilometers
      riskLevel: { 
        type: String, 
        enum: ["low", "medium", "high", "critical"],
        default: "medium" 
      },
    }],
    restrictionLevel: {
      type: String,
      enum: ["no_entry", "restricted_access", "permit_required", "warning_only"],
      required: true,
    },
    dangerType: [{
      type: String,
      enum: ["flood_risk", "structural_collapse", "contamination", "wildlife", "military", "construction", "environmental", "other"],
    }],
    restrictions: {
      noEntry: { type: Boolean, default: false },
      permitRequired: { type: Boolean, default: false },
      timeRestrictions: String, // e.g., "No entry from 6 PM to 6 AM"
      seasonalRestrictions: String,
      vehicleRestrictions: String,
    },
    penalties: {
      fine: { type: Number, default: 0 },
      imprisonment: String,
      other: String,
    },
    contactAuthority: {
      name: String,
      designation: String,
      phone: String,
      email: String,
      office: String,
    },
    signageInfo: {
      hasSignage: { type: Boolean, default: false },
      signageType: String,
      languages: [String],
    },
    emergencyInfo: {
      emergencyContact: String,
      nearestHospital: String,
      evacuationRoute: String,
    },
    isActive: { 
      type: Boolean, 
      default: true 
    },
    createdBy: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User" 
    },
  },
  { timestamps: true }
);

// Index for geospatial queries
restrictedAreaSchema.index({ "location.coordinates": "2dsphere" });
restrictedAreaSchema.index({ type: 1 });
restrictedAreaSchema.index({ restrictionLevel: 1 });
restrictedAreaSchema.index({ "nearbyDams.dam": 1 });

export default mongoose.model("RestrictedArea", restrictedAreaSchema);