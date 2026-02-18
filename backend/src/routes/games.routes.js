import express from "express";
import { getGames, getGameByIdentifier } from "../controllers/game.controller.js";
import { auth } from "../middleware/auth.middleware.js";

const router = express.Router();

// Public routes (or authenticated depending on requirement)
router.get("/", auth, getGames);
router.get("/:identifier", auth, getGameByIdentifier);

export default router;
