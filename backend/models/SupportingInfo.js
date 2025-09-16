// models/SupportingInfo.js
import mongoose from "mongoose";

const supportingInfoSchema = new mongoose.Schema({
  dam: { type: mongoose.Schema.Types.ObjectId, ref: "Dam", required: true },
  type: { type: String, enum: ["guideline", "publicSpot", "prohibitedRegion"], required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  location: { type: String },
  dangerLevel: { type: String },
}, { timestamps: true });

export default mongoose.model("SupportingInfo", supportingInfoSchema);
