import multer from "multer";
import path from "path";

import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. Configure Storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Use __dirname to reliably locate the uploads folder in valid source structure
    // We want backend/src/uploads
    const uploadPath = path.join(__dirname, "../uploads");
    cb(null, uploadPath);
  },
  filename: (_, file, cb) => {
    // Unique filename: timestamp + original extension
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// 2. File Filter (Security)
const fileFilter = (req, file, cb) => {
  console.log("Upload Middleware - Processing file:", {
    originalname: file.originalname,
    mimetype: file.mimetype,
    extname: path.extname(file.originalname)
  });

  const allowedTypes = /jpeg|jpg|png|webp|mp4|mov/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error("Only images (jpeg, jpg, png, webp) and videos (mp4, mov) are allowed!"));
  }
};

// 3. Export with Limits
export default multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit (good for high-quality stories/reels)
  }
});