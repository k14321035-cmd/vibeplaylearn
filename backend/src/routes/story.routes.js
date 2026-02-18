import express from "express";
import { uploadStory, getFeedStories, deleteAllStories, deleteStory } from "../controllers/story.controller.js";
import { auth } from "../middleware/auth.middleware.js";
import upload from "../middleware/upload.js";

const router = express.Router();

router.get("/feed", auth, getFeedStories);
router.post("/", auth, upload.single("image"), uploadStory);
router.delete("/all", auth, deleteAllStories);
router.delete("/:id", auth, deleteStory);

export default router;