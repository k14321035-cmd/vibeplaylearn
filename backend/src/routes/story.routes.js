import express from "express";
import { uploadStory, getFeedStories } from "../controllers/story.controller.js";
import { protect } from "../middleware/auth.middleware.js"; // Use your existing auth
import upload from "../middleware/upload.js"; // Use the multer config we created
const router = express.Router();

router.post("/", protect, uploadStory);
router.get("/feed", protect, getFeedStories);
router.post("/", protect, upload.single("image"), uploadStory);

export default router;