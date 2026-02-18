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
  try {
    let reels = await Reel.find()
      .populate("user", "username avatar")
      .sort({ createdAt: -1 });

    if (reels.length === 0) {
      // Return sample data if no reels exist
      reels = [
        {
          _id: "1",
          video: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
          user: { username: "pixel_artist" },
          caption: "Amazing digital art process! 🎨 #art #digital",
          likes: [],
          comments: []
        },
        {
          _id: "2",
          video: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
          user: { username: "travel_vibe" },
          caption: "Sunset in Bali 🌅 #travel #bali",
          likes: [],
          comments: []
        },
        {
          _id: "3",
          video: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
          user: { username: "tech_guru" },
          caption: "New gadget review coming soon! 📱",
          likes: [],
          comments: []
        }
      ];
    }

    res.json(reels);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteReel = async (req, res) => {
  try {
    const reel = await Reel.findById(req.params.id);

    if (!reel) {
      return res.status(404).json({ message: "Reel not found" });
    }

    // 🔒 OWNER CHECK OR ADMIN
    if (reel.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: "Not authorized" });
    }

    await reel.deleteOne();

    res.json({ message: "Reel deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};