import Reel from "../models/Reel.js";

export const createReel = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Video required" });
    }

    const reel = await Reel.create({
      user: req.user._id,
      video: `/uploads/reels/${req.file.filename}`,
      caption: req.body.caption || ""
    });

    res.status(201).json(reel);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getReels = async (req, res) => {
  const reels = await Reel.find()
    .populate("user", "username avatar")
    .sort({ createdAt: -1 });

  res.json(reels);
};