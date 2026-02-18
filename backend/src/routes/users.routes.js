import express from "express";
import { getUserProfile, updateProfile } from "../controllers/user.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import upload from "../middleware/upload.js"; // Using generic upload middleware

const router = express.Router();

// Public routes
router.get("/:username", getUserProfile);

// Protected routes
router.put("/update", protect, upload.single("avatar"), updateProfile);

export default router;
