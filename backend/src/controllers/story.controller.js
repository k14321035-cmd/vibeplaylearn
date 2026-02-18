import Story from "../models/story.model.js";

// backend/src/controllers/story.controller.js


export const uploadStory = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const mediaUrl = `/uploads/${req.file.filename}`;
    const mediaType = req.file.mimetype.startsWith("video") ? "video" : "image";

    // ENSURE THIS IS "new Story" AND NOT "new Post"
    const newStory = new Story({
      owner: req.user._id,
      mediaUrl,
      mediaType
    });

    await newStory.save();
    res.status(201).json({ message: "Story shared!", story: newStory });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getFeedStories = async (req, res) => {
  try {
    // Logic: Fetch stories from the user and their following list
    // For now, let's fetch all active stories to test
    const stories = await Story.find().populate("owner", "username avatar");
    res.status(200).json(stories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteAllStories = async (req, res) => {
  try {
    await Story.deleteMany({});
    res.status(200).json({ message: "All stories deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteStory = async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);

    if (!story) {
      return res.status(404).json({ message: "Story not found" });
    }

    // 🔒 OWNER CHECK OR ADMIN
    if (story.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: "Not authorized" });
    }

    await story.deleteOne();

    res.status(200).json({ message: "Story deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};