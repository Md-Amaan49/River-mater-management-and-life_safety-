import mongoose from "mongoose";

const damHistorySchema = new mongoose.Schema(
  {
    dam: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Dam", 
      required: true 
    },
    eventType: {
      type: String,
      enum: ["flood", "maintenance", "inspection", "repair", "upgrade", "incident", "emergency"],
      required: true,
    },
    title: { 
      type: String, 
      required: true 
    },
    description: { 
      type: String, 
      required: true 
    },
    eventDate: { 
      type: Date, 
      required: true 
    },
    severity: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium",
    },
    impact: {
      type: String,
      default: "",
    },
    actionsTaken: {
      type: String,
      default: "",
    },
    cost: {
      type: Number,
      default: 0,
    },
    duration: {
      type: String, // e.g., "3 days", "2 weeks"
      default: "",
    },
    affectedAreas: [{
      type: String,
    }],
    documents: [{
      filename: String,
      path: String,
      uploadDate: { type: Date, default: Date.now },
    }],
    reportedBy: {
      name: String,
      designation: String,
      contact: String,
    },
    status: {
      type: String,
      enum: ["ongoing", "resolved", "monitoring", "closed"],
      default: "closed",
    },
    createdBy: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User" 
    },
  },
  { timestamps: true }
);

// Index for efficient queries
damHistorySchema.index({ dam: 1, eventDate: -1 });
damHistorySchema.index({ eventType: 1 });
damHistorySchema.index({ severity: 1 });

export default mongoose.model("DamHistory", damHistorySchema);