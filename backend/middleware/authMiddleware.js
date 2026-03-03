// backend/middleware/authMiddleware.js
import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        return res.status(401).json({ message: "User not found" });
      }

      next();
    } catch (error) {
      console.error(error);
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }
};

export const admin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({ message: "Admin access only" });
  }
};

// Dam operator middleware - checks if user can access/modify specific dam
export const checkDamAccess = async (req, res, next) => {
  try {
    const user = req.user;
    const damId = req.params.damId || req.body.damId;

    // Admin and govt users have access to all dams
    if (user.role === "admin" || user.role === "govt") {
      return next();
    }

    // Dam operators can only access their assigned dam
    if (user.role === "dam_operator") {
      if (!user.assignedDam) {
        return res.status(403).json({ 
          success: false,
          message: "No dam assigned to your account" 
        });
      }

      if (user.assignedDam.toString() !== damId) {
        return res.status(403).json({ 
          success: false,
          message: "You can only access your assigned dam" 
        });
      }

      return next();
    }

    // Regular users have read-only access
    next();
  } catch (error) {
    console.error("Dam access check error:", error);
    res.status(500).json({ 
      success: false,
      message: "Error checking dam access permissions" 
    });
  }
};
