import express from "express";
import { auth } from "../middleware/auth.middleware.js";
import { uploadReel } from "../middleware/reelUpload.js";
import { createReel, getReels } from "../controllers/reel.controller.js";

const router = express.Router();

router.post("/", auth, uploadReel.single("video"), createReel);
router.get("/", auth, getReels);

export default router;