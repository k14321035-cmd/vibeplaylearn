import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";
// Ensure this path matches your Reel model location
import Reel from "../models/Reel.js"; 

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from backend root
dotenv.config({ path: path.join(__dirname, "../../.env") });

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
        throw new Error("MONGO_URI not found in environment variables");
    }
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB Connected");
  } catch (err) {
    console.error("❌ MongoDB Error:", err.message);
    process.exit(1);
  }
};

import fs from "fs";

const deleteReelsData = async () => {
    await connectDB();
    try {
        const reels = await Reel.find({});
        console.log(`Found ${reels.length} reels to delete.`);

        for (const reel of reels) {
            // 1. Delete associated video file
            if (reel.video) {
                // reel.video is likely stored as "/uploads/filename.ext"
                const filename = path.basename(reel.video);
                const filePath = path.join(__dirname, "../../uploads", filename);
                
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                    console.log(`Deleted file: ${filename}`);
                }
            }

            // 2. Delete the reel (comments are embedded, so they go with it)
            await reel.deleteOne();
        }

        console.log(`✅ All reels and associated files deleted successfully.`);
    } catch (err) {
        console.error("❌ Error deleting reels:", err);
    } finally {
        mongoose.connection.close();
        process.exit();
    }
};

deleteReelsData();