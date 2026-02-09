import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";
import Post from "../models/Post.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from backend root (../../.env from src/scripts)
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

const deleteData = async () => {
    await connectDB();
    try {
        const result = await Post.deleteMany({});
        console.log(`✅ ${result.deletedCount} posts deleted successfully.`);
    } catch (err) {
        console.error("❌ Error deleting posts:", err);
    } finally {
        mongoose.connection.close();
        process.exit();
    }
};

deleteData();
