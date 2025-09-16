// backend/controllers/userSavedDamsController.js
import User from "../models/User.js";
import Dam from "../models/Dam.js";
import DamStatus from "../models/DamStatus.js";
import WaterUsage from "../models/WaterUsage.js";

// ======================= GET SAVED DAMS =======================
export const getSavedDams = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("savedDams");
    if (!user) return res.status(404).json({ message: "User not found" });

    const dams = user.savedDams || [];

    const withDetails = await Promise.all(
      dams.map(async (dam) => {
        // get latest status
        const latestStatus = await DamStatus.findOne({ dam: dam._id })
          .sort({ updatedAt: -1, createdAt: -1 })
          .lean();

        // get water usage
        const usage = await WaterUsage.findOne({ damId: dam._id }).lean();

        return {
          dam,
          latestStatus: latestStatus || null,
          usage: usage || null,
        };
      })
    );

    res.json(withDetails);
  } catch (err) {
    console.error("getSavedDams error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ======================= TOGGLE SAVED DAM =======================
export const toggleSavedDam = async (req, res) => {
  try {
    const { damId } = req.params;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const alreadySaved = user.savedDams.some(
      (saved) => saved.toString() === damId
    );

    if (alreadySaved) {
      // remove dam
      user.savedDams = user.savedDams.filter(
        (saved) => saved.toString() !== damId
      );
    } else {
      // add dam
      user.savedDams.push(damId);
    }

    await user.save();

    const updatedUser = await User.findById(req.user._id).populate("savedDams");
    res.json(updatedUser.savedDams);
  } catch (error) {
    console.error("Error toggling saved dam:", error);
    res.status(500).json({ message: "Error updating saved dams" });
  }
};
