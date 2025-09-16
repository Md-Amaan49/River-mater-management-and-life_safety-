import mongoose from "mongoose";

const waterUsageSchema = new mongoose.Schema(
  {
    damId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Dam",
      required: true,
    },
    irrigation: { type: Number, default: 0 },   // million cubic meters or %
    drinking: { type: Number, default: 0 },
    industrial: { type: Number, default: 0 },
    hydropower: { type: Number, default: 0 },   // MW or water equivalent
    evaporationLoss: { type: Number, default: 0 },
    environmentalFlow: { type: Number, default: 0 },
    farmingSupport: { type: Number, default: 0 }, // hectares supported
  },
  { timestamps: true }
);

// ✅ Prevent OverwriteModelError
const WaterUsage =
  mongoose.models.WaterUsage || mongoose.model("WaterUsage", waterUsageSchema);

export default WaterUsage;
