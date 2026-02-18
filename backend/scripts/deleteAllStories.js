import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import Story from "../src/models/story.model.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../.env") });

const deleteStories = async () => {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error("MONGO_URI not found in environment variables");
        }

        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ MongoDB connected");

        const result = await Story.deleteMany({});
        console.log(`🗑️ Deleted ${result.deletedCount} stories`);

        process.exit(0);
    } catch (error) {
        console.error("❌ Error deleting stories:", error.message);
        process.exit(1);
    }
};

deleteStories();
