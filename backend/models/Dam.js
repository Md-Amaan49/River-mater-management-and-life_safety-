import mongoose from "mongoose";

const damSchema = new mongoose.Schema({
  name: String,
  state: String,
  riverName: String,
  river: String,
  coordinates: {
      lat: Number,
      lng: Number,
    },
  damType: String,
  constructionYear: String,
  operator: String,
  maxStorage: Number,
  liveStorage: Number,
  deadStorage: Number,
  catchmentArea: String,
  surfaceArea: String,
  height: String,
  length: String,
  upstreamDam: String,
  upstreamDamDistance: Number,
  downstreamDam: String,
  downstreamDamDistance: Number,
}, { timestamps: true });

const Dam = mongoose.model("Dam", damSchema);
export default Dam;
