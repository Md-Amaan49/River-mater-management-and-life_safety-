import mongoose from "mongoose";

const safetySchema = new mongoose.Schema(
  {
    dam: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Dam",
      required: true,
    },
    floodRiskLevel: {
      type: String,
      enum: ["Green", "Yellow", "Red"],
      default: "Green",
    },
    seepageReport: {
      type: String,
    },
    structuralHealth: {
      cracks: { type: String },
      vibration: { type: String },
      tilt: { type: String },
    },
    earthquakeZone: {
      type: String,
    },
    maintenance: {
      lastInspection: { type: Date },
      nextInspection: { type: Date },
      reportFile: { type: String }, // path to uploaded report
    },
    emergencyContact: {
      authorityName: { type: String },
      phone: { type: String },
      email: { type: String },
      address: { type: String },
    },
  },
  { timestamps: true }
);

const Safety = mongoose.model("Safety", safetySchema);
export default Safety;
