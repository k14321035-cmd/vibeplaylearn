import Post from "../models/post.model.js";

/* =========================
   CREATE POST
   ========================= */
export const createPost = async (req, res) => {
  try {
    const { caption, mediaUrl, mediaType } = req.body;

    if (!mediaUrl || !mediaType) {
      return res.status(400).json({ message: "Media required" });
    }

    const post = await Post.create({
      author: req.user._id,
      caption,
      mediaUrl,
      mediaType
    });

    res.status(201).json(post);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create post" });
  }
};
export const getAllPosts = async (req, res) => {
  try {
    // Fetch posts and populate the author's name/avatar
    const posts = await Post.find()
      .populate("author", "fullName username profilePic")
      .sort({ createdAt: -1 }); // Newest first

    res.status(200).json(posts);
  } catch (err) {
    res.status(500).json({ message: "Error fetching posts" });
  }
};

export const getFeed = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("user", "username fullName")
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: "Failed to load feed" });
  }
};
export const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // 🔒 OWNER CHECK OR ADMIN
    if (post.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: "Not authorized" });
    }

    await post.deleteOne();

    res.json({ message: "Post deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};