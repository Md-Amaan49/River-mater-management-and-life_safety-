import User from "../models/User.js";
import jwt from "jsonwebtoken";

// Generate JWT
const generateToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "15m",
  });
};

// Generate long-lived refresh token
const generateRefreshToken = (user) => {
  return jwt.sign({ id: user._id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRE || "7d",
  });
};

// REGISTER
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, mobile, place, state, role, damId, damName } = req.body;

    // Enhanced validation
    if (!name || !email || !password || !mobile || !place || !state) {
      return res
        .status(400)
        .json({ success: false, message: "Please fill all required fields" });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res
        .status(400)
        .json({ success: false, message: "Please enter a valid email address" });
    }

    // Password strength validation
    if (password.length < 6) {
      return res
        .status(400)
        .json({ success: false, message: "Password must be at least 6 characters long" });
    }

    // Mobile number validation (Indian format)
    const mobileRegex = /^[6-9]\d{9}$/;
    if (!mobileRegex.test(mobile)) {
      return res
        .status(400)
        .json({ success: false, message: "Please enter a valid 10-digit mobile number" });
    }

    // Name validation (no numbers or special characters)
    const nameRegex = /^[a-zA-Z\s]+$/;
    if (!nameRegex.test(name)) {
      return res
        .status(400)
        .json({ success: false, message: "Name should contain only letters and spaces" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists with this email" });
    }

    // Check if mobile number already exists
    const existingMobile = await User.findOne({ mobile });
    if (existingMobile) {
      return res
        .status(400)
        .json({ success: false, message: "Mobile number already registered" });
    }

    // Dam Operator specific validation
    let assignedDamId = null;
    let damVerified = false;
    
    if (role === "dam_operator") {
      if (!damId) {
        return res
          .status(400)
          .json({ success: false, message: "Dam ID is required for Dam Operator role" });
      }

      // Import Dam model
      const Dam = (await import("../models/Dam.js")).default;
      
      // Verify dam exists
      const dam = await Dam.findById(damId);
      
      if (!dam) {
        return res
          .status(400)
          .json({ success: false, message: "Dam not found with the provided ID" });
      }

      // Optional: Verify dam name matches if provided
      if (damName && dam.name.toLowerCase() !== damName.toLowerCase()) {
        return res
          .status(400)
          .json({ 
            success: false, 
            message: `Dam name mismatch. Expected: ${dam.name}` 
          });
      }

      // Check if another operator is already assigned to this dam
      const existingOperator = await User.findOne({ 
        assignedDam: damId, 
        role: "dam_operator" 
      });
      
      if (existingOperator) {
        return res
          .status(400)
          .json({ 
            success: false, 
            message: `This dam already has an assigned operator (${existingOperator.email})` 
          });
      }

      assignedDamId = dam._id;
      damVerified = true;
    }

    const profileImagePath = req.file ? `/uploads/${req.file.filename}` : null;

    const newUser = await User.create({
      name,
      email,
      password,
      mobile,
      place,
      state,
      role: role || "user", // user, admin, govt, dam_operator
      profileImage: profileImagePath,
      assignedDam: assignedDamId,
      damVerified: damVerified,
    });

    const token = generateToken(newUser);

    // Populate dam info if dam operator
    let damInfo = null;
    if (role === "dam_operator" && assignedDamId) {
      const Dam = (await import("../models/Dam.js")).default;
      const dam = await Dam.findById(assignedDamId).select("name state river");
      damInfo = dam;
    }

    res.status(201).json({
      success: true,
      message: role === "dam_operator" 
        ? `Registration successful! You are now assigned to ${damInfo?.name}` 
        : "Registration successful",
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        mobile: newUser.mobile,
        place: newUser.place,
        state: newUser.state,
        profileImage: newUser.profileImage,
        assignedDam: damInfo,
        damVerified: newUser.damVerified,
      },
    });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// LOGIN
export const login = async (req, res) => {
  const { email, password } = req.body;
  
  try {
    // Input validation
    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Please provide email and password" });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res
        .status(400)
        .json({ success: false, message: "Please enter a valid email address" });
    }

    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid email or password" });
    }

    const accessToken = generateToken(user);
    const refreshToken = generateRefreshToken(user);

    res.json({
      success: true,
      message: "Login successful",
      token: accessToken,
      refreshToken: refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        mobile: user.mobile,
        place: user.place,
        state: user.state,
        profileImage: user.profileImage,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ success: false, message: "Server error during login" });
  }
};

// REFRESH TOKEN
export const refreshToken = (req, res) => {
  const { token } = req.body;
  if (!token) {
    return res.status(401).json({ success: false, message: "No refresh token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const accessToken = jwt.sign(
      { id: decoded.id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || "15m" }
    );

    res.json({ success: true, accessToken });
  } catch (err) {
    res.status(403).json({ success: false, message: "Invalid or expired refresh token" });
  }
};


// GET PROFILE (protected route)
export const getProfile = async (req, res) => {
  try {
    // req.user is already set in protect middleware
    const user = await User.findById(req.user._id)
      .select("-password")
      .populate({
        path: "assignedDam",
        select: "name state river"
      });

    if (user) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        place: user.place,
        state: user.state,
        role: user.role, // admin | govt | user | dam_operator
        profileImage: user.profileImage || null,
        assignedDam: user.assignedDam || null, // populated dam info for dam operators
        damVerified: user.damVerified || false,
        createdAt: user.createdAt,
      });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    console.error("Error in getProfile:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// GET USER STATISTICS (protected route)
export const getUserStats = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Get user with populated saved dams (same as sidebar)
    const user = await User.findById(userId).populate({
      path: "savedDams",
      select: "name state river"
    });
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found",
        stats: {
          savedDams: 0,
          alertsSubscribed: 0,
          recentActivity: 0,
          customAlerts: 0
        }
      });
    }
    
    // Get actual saved dams count (same logic as sidebar)
    const savedDamsCount = user.savedDams ? user.savedDams.length : 0;
    
    // For now, we'll use placeholder values for other stats
    // These can be implemented when the respective features are added
    const stats = {
      savedDams: savedDamsCount,
      alertsSubscribed: 0, // Placeholder - implement when alert subscription feature is added
      recentActivity: 0,   // Placeholder - implement when activity tracking is added
      customAlerts: 0      // Placeholder - implement when custom alerts feature is added
    };

    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error("Error in getUserStats:", error.message);
    res.status(500).json({ 
      success: false, 
      message: "Server error",
      stats: {
        savedDams: 0,
        alertsSubscribed: 0,
        recentActivity: 0,
        customAlerts: 0
      }
    });
  }
};
