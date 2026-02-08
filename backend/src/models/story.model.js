import mongoose from "mongoose";

const storySchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    mediaUrl: {
      type: String,
      required: true
    },
    mediaType: {
      type: String,
      enum: ["image", "video"],
      required: true
    },
    views: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    // This index automatically deletes the document after 24 hours (86400 seconds)
    createdAt: { 
      type: Date, 
      default: Date.now, 
      expires: 86400 
    }
  },
  { timestamps: true }
);

export default mongoose.model("Story", storySchema);