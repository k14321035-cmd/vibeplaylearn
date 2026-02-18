import mongoose from "mongoose";

const gameSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            unique: true
        },
        identifier: { // e.g. 'tictactoe', 'chess'
            type: String,
            required: true,
            unique: true,
            lowercase: true
        },
        description: String,
        icon: {
            type: String, // Ionicons name
            required: true
        },
        colors: [String], // Array of hex colors for gradient
        isComingSoon: {
            type: Boolean,
            default: false
        },
        isFeatured: {
            type: Boolean,
            default: false
        },
        category: {
            type: String,
            enum: ['Strategy', 'Board', 'Card', 'Puzzle', 'Action', 'Other'],
            default: 'Other'
        },
        playCount: {
            type: Number,
            default: 0
        }
    },
    { timestamps: true }
);

export default mongoose.model("Game", gameSchema);
