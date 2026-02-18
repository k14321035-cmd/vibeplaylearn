import express from "express";
import { auth } from "../middleware/auth.middleware.js";
import { adminOnly } from "../middleware/admin.middleware.js";
import {
    createTournament,
    getTournaments,
    getTournament,
    joinTournament,
    startTournament
} from "../controllers/tournament.controller.js";

const router = express.Router();

// Public/User routes
router.get("/", auth, getTournaments);
router.get("/:id", auth, getTournament);
router.put("/:id/join", auth, joinTournament);

// Admin routes
router.post("/", auth, adminOnly, createTournament);
router.put("/:id/start", auth, adminOnly, startTournament);

export default router;
