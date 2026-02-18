import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../.env") });

const testConnection = async () => {
  console.log("Testing connection to:", process.env.MONGO_URI);
  try {
    await mongoose.connect(process.env.MONGO_URI, {
        serverSelectionTimeoutMS: 5000,
    });
    console.log("✅ SUCCESS: MongoDB connected");
    process.exit(0);
  } catch (err) {
    console.error("❌ FAILURE: MongoDB connection failed");
    console.error("Error Name:", err.name);
    console.error("Error Message:", err.message);
    process.exit(1);
  }
};

testConnection();
