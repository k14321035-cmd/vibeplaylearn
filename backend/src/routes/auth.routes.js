import express from "express";
import { login, signup, getUserById } from "../controllers/auth.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.get("/users/:id", protect, getUserById);

router.get("/me", protect, (req, res) => {
  res.json(req.user);
});

export default router;
