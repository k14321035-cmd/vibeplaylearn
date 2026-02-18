import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env
const envPath = path.resolve(__dirname, '../.env');
if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
} else {
    console.log("No .env file found at " + envPath);
    process.exit(1);
}

// User Model Schema (Basic version to match DB)
const userSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: "user" },
    isVerified: { type: Boolean, default: false },
    followers: [],
    following: []
});

const User = mongoose.model('User', userSchema);

const createAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to DB");

        const adminEmail = 'vibe@gmail.com';
        const adminUser = await User.findOne({ email: adminEmail });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('vibe123', salt); // Default password

        if (adminUser) {
            console.log("User exists, updating to Admin...");
            adminUser.role = 'admin';
            adminUser.isVerified = true;
            adminUser.password = hashedPassword; // FORCE PASSWORD RESET
            await adminUser.save();
            console.log("User updated to Admin with password reset.");
        } else {
            console.log("Creating new Admin user...");
            const newUser = new User({
                fullName: 'Vibe Admin',
                username: 'vibe_admin',
                email: adminEmail,
                password: hashedPassword,
                role: 'admin',
                isVerified: true
            });
            await newUser.save();
            console.log("Admin user created.");
        }

        process.exit(0);
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
};

createAdmin();
