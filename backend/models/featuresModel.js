// backend/models/Feature.js
import mongoose from "mongoose";

const featureSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    category: {
      type: String,
      enum: ["Dam Management", "Monitoring", "Safety & Alerts", "Admin & Reports"],
      required: true,
    },
    status: {
      type: String,
      enum: ["Active", "Planned", "Disabled"],
      default: "Active",
    },
    adminOnly: { type: Boolean, default: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export default mongoose.model("Feature", featureSchema);
