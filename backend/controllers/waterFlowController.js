// backend/controllers/waterFlowController.js
import path from "path";
import fs from "fs/promises";
import State from "../models/State.js";
import River from "../models/River.js";
import Dam from "../models/Dam.js";
import DamStatus from "../models/DamStatus.js";
import WaterUsage from "../models/WaterUsage.js";

// helper: try to parse coordinates stored as "lat,lng" or {lat, lng}
function parseCoords(coordField) {
  if (!coordField) return null;
  if (typeof coordField === "string") {
    const parts = coordField.split(",").map(s => s.trim());
    if (parts.length >= 2) {
      const lat = Number(parts[0]);
      const lng = Number(parts[1]);
      if (!Number.isNaN(lat) && !Number.isNaN(lng)) return [lat, lng];
    }
  } else if (typeof coordField === "object" && coordField.lat != null && coordField.lng != null) {
    return [Number(coordField.lat), Number(coordField.lng)];
  }
  return null;
}

// GET /api/waterflow/states
export const getStates = async (req, res) => {
  try {
    const states = await State.find().sort({ name: 1 });
    res.json(states);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch states" });
  }
};

// GET /api/waterflow/rivers/:stateId
export const getRiversByState = async (req, res) => {
  try {
    const { stateId } = req.params;
    const rivers = await River.find({ state: stateId }).sort({ name: 1 });
    res.json(rivers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch rivers" });
  }
};

// GET /api/waterflow/dams/:riverId
export const getDamsByRiver = async (req, res) => {
  try {
    const { riverId } = req.params;
    const river = await River.findById(riverId);
    if (!river) return res.status(404).json({ message: "River not found" });

    // Dams might store riverName or river; check both
    const dams = await Dam.find({
      $or: [{ riverName: river.name }, { river: river.name }, { river: riverId }]
    }).sort({ name: 1 });

    res.json(dams);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch dams" });
  }
};

// Serve GeoJSON for India or a particular state/river. Files should live in backend/geojson/
export const getIndiaGeoJSON = async (req, res) => {
  try {
    const geoPath = path.join(process.cwd(), "geojson", "india_rivers.geojson");
    const raw = await fs.readFile(geoPath, "utf8");
    res.setHeader("Content-Type", "application/json");
    res.send(raw);
  } catch (err) {
    console.error("Failed to load India geojson:", err);
    res.status(500).json({ message: "GeoJSON not available" });
  }
};

// GET /api/waterflow/stateGeo/:stateId  -> returns state-specific geojson if present, else falls back to india
export const getStateGeoJSON = async (req, res) => {
  try {
    const { stateId } = req.params;
    const state = await State.findById(stateId);
    if (!state) return res.status(404).json({ message: "State not found" });

    const candidate = path.join(process.cwd(), "geojson", "states", `${state.name.replace(/\s+/g, "_")}.geojson`);
    try {
      const raw = await fs.readFile(candidate, "utf8");
      res.setHeader("Content-Type", "application/json");
      return res.send(raw);
    } catch (err) {
      // fallback to India map
      return getIndiaGeoJSON(req, res);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to load state geojson" });
  }
};

// GET /api/waterflow/riverGeo/:riverId -> a small geojson with only that river (backend may filter india geojson)
export const getRiverGeoJSON = async (req, res) => {
  try {
    const { riverId } = req.params;
    const river = await River.findById(riverId);
    if (!river) return res.status(404).json({ message: "River not found" });

    // Option A: If you have per-river GeoJSON files:
    const perPath = path.join(process.cwd(), "geojson", "rivers", `${river.name.replace(/\s+/g, "_")}.geojson`);
    try {
      const raw = await fs.readFile(perPath, "utf8");
      res.setHeader("Content-Type", "application/json");
      return res.send(raw);
    } catch (err) {
      // Option B: fallback: return a tiny FeatureCollection with a property name (frontend can use it to highlight)
      return res.json({
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            properties: { name: river.name },
            geometry: null // geometry not available
          }
        ]
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to load river geojson" });
  }
};

// GET /api/waterflow/damPoints/:riverId -> return array of dam points for that river
export const getDamPointsForRiver = async (req, res) => {
  try {
    const { riverId } = req.params;
    const river = await River.findById(riverId);
    if (!river) return res.status(404).json({ message: "River not found" });

    const dams = await Dam.find({
      $or: [{ riverName: river.name }, { river: river.name }, { river: riverId }]
    }).lean();

    const points = dams.map(d => {
      const coords = parseCoords(d.coordinates);
      return {
        _id: d._id,
        name: d.name,
        coordinates: coords,
        state: d.state || null,
        place: d.place || null
      };
    });

    res.json(points);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch dam points" });
  }
};

// GET /api/waterflow/stateStats/:stateId
export const getStateStats = async (req, res) => {
  try {
    const { stateId } = req.params;
    const state = await State.findById(stateId);
    if (!state) return res.status(404).json({ message: "State not found" });

    const dams = await Dam.find({ state: state.name }).lean();

    // total dams
    const totalDams = dams.length;

    // compute active/inactive from latest DamStatus (assumption: DamStatus has field isActive boolean or status)
    const statuses = await Promise.all(dams.map(d => DamStatus.findOne({ dam: d._id }).sort({ updatedAt: -1 }).lean()));
    let activeDams = 0;
    let inactiveDams = 0;
    for (const s of statuses) {
      if (!s) { inactiveDams++; continue; }
      if (s.isActive === true || s.status === "active" || s.currentWaterLevel > 0) activeDams++;
      else inactiveDams++;
    }

    // rivers in this state
    const rivers = await River.find({ state: stateId }).lean();
    const totalRivers = rivers.length;

    // wet vs dry rivers heuristic: find if any dam on river has currentWaterLevel > threshold (20%) -> wet
    const wetThreshold = 20; // tweak as needed
    let wetRivers = 0;
    let dryRivers = 0;
    for (const r of rivers) {
      const damsOnR = dams.filter(d => (d.riverName === r.name || d.river === r.name));
      let isWet = false;
      for (const d of damsOnR) {
        const latest = await DamStatus.findOne({ dam: d._id }).sort({ updatedAt: -1 }).lean();
        if (latest && typeof latest.currentWaterLevel === "number" && latest.currentWaterLevel >= wetThreshold) {
          isWet = true;
          break;
        }
      }
      if (isWet) wetRivers++;
      else dryRivers++;
    }

    res.json({
      state: state.name,
      totals: {
        totalRivers,
        wetRivers,
        dryRivers,
        totalDams,
        activeDams,
        inactiveDams
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to compute state stats" });
  }
};

// GET /api/waterflow/riverStats/:riverId
export const getRiverStats = async (req, res) => {
  try {
    const { riverId } = req.params;
    const river = await River.findById(riverId);
    if (!river) return res.status(404).json({ message: "River not found" });

    const dams = await Dam.find({
      $or: [{ riverName: river.name }, { river: river.name }, { river: riverId }]
    }).lean();

    const totalDams = dams.length;

    // active/inactive
    const statuses = await Promise.all(dams.map(d => DamStatus.findOne({ dam: d._id }).sort({ updatedAt: -1 }).lean()));
    let activeDams = 0;
    let inactiveDams = 0;
    for (const s of statuses) {
      if (!s) { inactiveDams++; continue; }
      if (s.isActive === true || s.status === "active" || s.currentWaterLevel > 0) activeDams++;
      else inactiveDams++;
    }

    res.json({
      river: river.name,
      totals: {
        totalDams,
        activeDams,
        inactiveDams
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to compute river stats" });
  }
};

// GET /api/waterflow/dam/:damId -> dam details + latest status + usage
export const getDamDetails = async (req, res) => {
  try {
    const { damId } = req.params;
    const dam = await Dam.findById(damId).lean();
    if (!dam) return res.status(404).json({ message: "Dam not found" });

    const latestStatus = await DamStatus.findOne({ dam: dam._id }).sort({ updatedAt: -1 }).lean();
    const usage = await WaterUsage.findOne({ damId: dam._id }).lean();

    res.json({ dam, latestStatus, usage });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch dam details" });
  }
};
// Convert coordinates if stored as string
const formatDamPoints = (dams) => {
  return dams.map(dam => ({
    ...dam._doc,
    coordinates: typeof dam.coordinates === "string" ? JSON.parse(dam.coordinates) : dam.coordinates
  }));
};

// Example endpoint:
export const getDamPoints = async (req, res) => {
  try {
    const { state, river } = req.params;
    const query = { state };
    if (river) query.riverName = river;
    const dams = await Dam.find(query);
    res.json(formatDamPoints(dams));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
