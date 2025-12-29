import mongoose from "mongoose";

const publicSpotSchema = new mongoose.Schema(
  {
    name: { 
      type: String, 
      required: true 
    },
    type: {
      type: String,
      enum: ["temple", "dargah", "mosque", "church", "gurudwara", "sitting_area", "tourist_spot", "park", "viewpoint", "restaurant", "hotel", "market", "hospital", "school", "government_office", "other"],
      required: true,
    },
    description: { 
      type: String, 
      default: "" 
    },
    location: {
      address: String,
      coordinates: {
        latitude: { type: Number, required: true },
        longitude: { type: Number, required: true },
      },
      city: String,
      state: String,
      pincode: String,
    },
    nearbyDams: [{
      dam: { type: mongoose.Schema.Types.ObjectId, ref: "Dam" },
      distance: { type: Number }, // in kilometers
    }],
    facilities: [{
      type: String, // parking, restroom, food, accommodation, etc.
    }],
    openingHours: {
      type: String,
      default: "24/7",
    },
    contactInfo: {
      phone: String,
      email: String,
      website: String,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: 3,
    },
    images: [{
      filename: String,
      path: String,
      uploadDate: { type: Date, default: Date.now },
    }],
    accessibility: {
      wheelchairAccessible: { type: Boolean, default: false },
      publicTransport: { type: Boolean, default: false },
      parking: { type: Boolean, default: false },
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
publicSpotSchema.index({ "location.coordinates": "2dsphere" });
publicSpotSchema.index({ type: 1 });
publicSpotSchema.index({ "nearbyDams.dam": 1 });

export default mongoose.model("PublicSpot", publicSpotSchema);