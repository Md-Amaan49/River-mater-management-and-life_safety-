import Sensor from "../models/Sensor.js";

// ➕ Add a new sensor
export const addSensor = async (req, res) => {
  try {
    const sensor = new Sensor(req.body);
    await sensor.save();
    res.status(201).json(sensor);
  } catch (error) {
    res.status(400).json({ message: "Failed to add sensor", error });
  }
};

// 📋 Get all sensors (or filter by dam)
export const getSensors = async (req, res) => {
  try {
    const { damId } = req.query;
    const sensors = damId ? await Sensor.find({ damId }) : await Sensor.find();
    res.status(200).json(sensors);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch sensors", error });
  }
};

// ✏️ Update sensor info
export const updateSensor = async (req, res) => {
  try {
    const sensor = await Sensor.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!sensor) return res.status(404).json({ message: "Sensor not found" });
    res.status(200).json(sensor);
  } catch (error) {
    res.status(400).json({ message: "Failed to update sensor", error });
  }
};

// ❌ Delete sensor
export const deleteSensor = async (req, res) => {
  try {
    const sensor = await Sensor.findByIdAndDelete(req.params.id);
    if (!sensor) return res.status(404).json({ message: "Sensor not found" });
    res.status(200).json({ message: "Sensor deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete sensor", error });
  }
};
