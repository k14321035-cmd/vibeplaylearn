import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import {
  getChatList,
  getMessagesWithUser,
  sendMessage
} from "../controllers/message.controller.js";

const router = express.Router();

// Defined BEFORE parametric routes to avoid conflict
router.get("/chatlist", protect, getChatList);

router.get("/:userId", protect, getMessagesWithUser);
router.post("/:userId", protect, sendMessage);

export default router;
