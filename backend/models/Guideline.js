import mongoose from "mongoose";

const guidelineSchema = new mongoose.Schema(
  {
    title: { 
      type: String, 
      required: true 
    },
    category: {
      type: String,
      enum: ["safety", "maintenance", "operation", "emergency", "environmental", "visitor", "construction", "monitoring", "general"],
      required: true,
    },
    subcategory: {
      type: String,
      default: "",
    },
    description: { 
      type: String, 
      required: true 
    },
    content: { 
      type: String, 
      required: true 
    },
    applicableDams: [{
      dam: { type: mongoose.Schema.Types.ObjectId, ref: "Dam" },
      isSpecific: { type: Boolean, default: false }, // true if guideline is specific to this dam
    }],
    priority: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium",
    },
    targetAudience: [{
      type: String,
      enum: ["public", "operators", "maintenance_staff", "emergency_responders", "visitors", "contractors", "government", "all"],
    }],
    steps: [{
      stepNumber: Number,
      title: String,
      description: String,
      isRequired: { type: Boolean, default: true },
    }],
    documents: [{
      filename: String,
      path: String,
      type: String, // pdf, doc, image, etc.
      uploadDate: { type: Date, default: Date.now },
    }],
    relatedGuidelines: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Guideline",
    }],
    compliance: {
      isRegulatory: { type: Boolean, default: false },
      authority: String, // which authority mandates this
      regulationNumber: String,
      lastUpdated: Date,
    },
    effectiveDate: {
      type: Date,
      default: Date.now,
    },
    expiryDate: {
      type: Date,
    },
    version: {
      type: String,
      default: "1.0",
    },
    approvedBy: {
      name: String,
      designation: String,
      date: Date,
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

// Indexes for efficient queries
guidelineSchema.index({ category: 1 });
guidelineSchema.index({ priority: 1 });
guidelineSchema.index({ "applicableDams.dam": 1 });
guidelineSchema.index({ targetAudience: 1 });
guidelineSchema.index({ isActive: 1 });

export default mongoose.model("Guideline", guidelineSchema);