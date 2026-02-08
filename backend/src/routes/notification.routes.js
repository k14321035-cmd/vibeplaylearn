import express from "express";
import { protect } from "../middleware/auth.middleware.js"; // Your auth middleware
import Notification from "../models/notification.model.js";

const router = express.Router();

// GET all notifications for the logged-in user
router.get("/", protect, async (req, res) => {
  try {
    const notifications = await Notification.find({ receiver: req.user._id })
      .populate("actor", "username profilePic")
      .sort({ createdAt: -1 }); // Newest first

    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: "Server error fetching notifications" });
  }
});

// Optional: Mark as read
router.put("/read", protect, async (req, res) => {
  await Notification.updateMany({ receiver: req.user._id }, { isRead: true });
  res.json({ message: "Notifications marked as read" });
});

export default router;