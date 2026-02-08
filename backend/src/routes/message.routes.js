import express from "express";
import Message from "../models/message.model.js";
import { auth } from "../middleware/auth.middleware.js";
import { getChatList } from "../controllers/message.controller.js";
import { getMessagesWithUser } from "../controllers/message.controller.js";
import { sendMessage } from "../controllers/message.controller.js";
const router = express.Router();


router.get("/chats", auth, getChatList);
router.get("/:userId", auth, getMessagesWithUser);
router.post("/:userId", auth, sendMessage);

/* SEND MESSAGE */
router.post("/", auth, async (req, res) => {
  const { receiverId, text } = req.body;

  const message = await Message.create({
    sender: req.user._id,
    receiver: receiverId,
    text
  });

  res.status(201).json(message);
});

/* GET CONVERSATION */
router.get("/:userId", auth, async (req, res) => {
  const messages = await Message.find({
    $or: [
      { sender: req.user._id, receiver: req.params.userId },
      { sender: req.params.userId, receiver: req.user._id }
    ]
  })
    .sort({ createdAt: 1 })
    .populate("sender", "username");

  res.json(messages);
});

export default router;
