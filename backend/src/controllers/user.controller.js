import User from "../models/user.model.js";
import Post from "../models/post.model.js"; // Assuming you have a Post model

// Get user profile by username
export const getUserProfile = async (req, res) => {
    try {
        const { username } = req.params;
        const user = await User.findOne({ username }).select("-password");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Optional: Get post count, followers count if not stored in user object
        const postsCount = await Post.countDocuments({ user: user._id });

        res.status(200).json({
            ...user.toObject(),
            postsCount
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update user profile
export const updateProfile = async (req, res) => {
    try {
        const userId = req.user._id;
        const { bio, fullname, avatar } = req.body;
        let updateData = {};

        if (bio !== undefined) updateData.bio = bio;
        if (fullname !== undefined) updateData.fullName = fullname; // Note: model uses fullName

        // If file uploaded via middleware (add logic in route to handle file)
        if (req.file) {
            updateData.avatar = `/uploads/avatars/${req.file.filename}`;
        } else if (avatar) {
            // If passing avatar as a string (e.g. from frontend state if not re-uploading)
            // Usually you'd only update avatar if a new file is sent
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $set: updateData },
            { new: true, runValidators: true }
        ).select("-password");

        res.status(200).json(updatedUser);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
