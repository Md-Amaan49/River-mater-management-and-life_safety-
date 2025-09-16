import mongoose from "mongoose";

const sensorSchema = new mongoose.Schema(
  {
    damId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Dam",
      required: true,
    },
    sensorId: { type: String, required: true, unique: true },
    type: { 
      type: String, 
      enum: ["level", "flow", "seepage", "vibration", "weather"], 
      required: true 
    },
    status: { type: String, enum: ["active", "inactive", "faulty"], default: "active" },
    batteryStatus: { type: String, enum: ["good", "low", "critical"], default: "good" },
    lastSync: { type: Date, default: Date.now },
    lastReading: { type: Number, default: 0 }, // e.g., water level (m), flow rate (m³/s)
    unit: { type: String, default: "" }, // e.g., "m", "m³/s", "MW"
  },
  { timestamps: true }
);

const Sensor = mongoose.model("Sensor", sensorSchema);

export default Sensor;
