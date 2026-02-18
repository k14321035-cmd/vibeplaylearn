import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import {
  getChatList,
  getMessagesWithUser,
  sendMessage
} from "../controllers/message.controller.js";

const router = express.Router();

// Static routes BEFORE dynamic routes
router.get("/conversations", protect, getChatList); // Mapped /conversations to getChatList
router.get("/chatlist", protect, getChatList); // Keep original just in case

// Dynamic routes
router.get("/:userId", protect, getMessagesWithUser);
router.post("/:userId", protect, sendMessage);
// If app uses /send/:id, we need a route for that, or update app to use /:id
router.post("/send/:userId", protect, sendMessage);

export default router;
