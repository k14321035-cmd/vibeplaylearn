import express from "express";
import Post from "../models/Post.js";
import {auth} from "../middleware/auth.middleware.js";
import upload from "../middleware/upload.js";
import { adminOnly } from "../middleware/admin.middleware.js";

const router = express.Router();

router.post(
  "/",
  auth,
  upload.single("image"),
  async (req, res) => {
    console.log("POST /api/post HIT");
    console.log("req.user from middleware:", req.user);
    console.log("req.body:", req.body);
    console.log("req.file:", req.file);

    if (!req.user) {
        console.error("CRITICAL: req.user is MISSING in route handler despite auth middleware!");
        return res.status(500).json({ message: "Internal Auth Error" });
    }

    try {
        const post = await Post.create({
          user: req.user._id, // explicit _id
          caption: req.body.caption,
          image: req.file
            ? `/uploads/${req.file.filename}`
            : null
        });

        res.status(201).json(post);
    } catch (error) {
        console.error("POST CREATION ERROR:", error);
        res.status(400).json({ message: error.message });
    }
  }
);

router.get("/", auth, async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("user", "username fullName avatar")
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});

router.delete(
  "/admin/:postId",
  auth,
  adminOnly,
  async (req, res) => {
    try {
      const post = await Post.findById(req.params.postId);
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      await Post.findByIdAndDelete(req.params.postId);
      res.json({ message: "Post deleted successfully" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server Error" });
    }
  }
);

export default router;
