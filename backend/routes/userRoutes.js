// backend/routes/userRoutes.js
import express from "express";
import multer from "multer";
import { registerUser, login, getProfile,refreshToken } from "../controllers/userController.js";
import { protect, admin } from "../middleware/authMiddleware.js"; // ✅ path fix (middleware not middlewares)
import uploadMiddleware from "../middleware/uploadMiddleware.js"; // ✅ keep if you already use it
import { getSavedDams, toggleSavedDam } from "../controllers/userSavedDamsController.js";


const router = express.Router();

// Storage for profile image uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Routes
router.post("/register", uploadMiddleware.single("profileImage"), registerUser);
router.post("/login", login);
router.get("/profile", protect, getProfile); // ✅ only logged-in users can see profile
router.post("/refresh", refreshToken);

// ✅ saved dams
router.get("/saved-dams", protect, getSavedDams);
router.patch("/saved-dams/:damId", protect, toggleSavedDam);

export default router;
