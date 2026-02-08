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
    const stories = await Story.find().populate("owner", "username profilePic");
    res.status(200).json(stories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};