import express from "express";
import http from "http";
import cors from "cors";
import { Server } from "socket.io";
import dotenv from "dotenv";

import path from "path";
import { fileURLToPath } from "url";

import { connectDB } from "./config/db.js";

import authRoutes from "./routes/auth.routes.js";
import postRoutes from "./routes/post.routes.js";
import reelRoutes from "./routes/reel.routes.js";
import messageRoutes from "./routes/message.routes.js";
import storyRoutes from "./routes/story.routes.js";
import Message from "./models/message.model.js";
import notificationRoutes from "./routes/notification.routes.js";
import { initTicTacToe } from "./games/tictactoe/ttt.socket.js";
import { initChess } from "./games/chess/chess.socket.js";
import { initCheckers } from "./games/checkers/checkers.socket.js";

// ... (existing code)



const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../.env") });

const app = express();

/* =========================
   MIDDLEWARE
   ========================= */
app.use(cors({ origin: "*" }));
app.use(express.json());

/* =========================
   ROUTES
   ========================= */
app.use("/api/auth", authRoutes);
app.use("/api/post", postRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/reels", reelRoutes);
app.use("/api/messages", messageRoutes);
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));
app.use("/api/stories", storyRoutes);
app.use("/api/notifications", notificationRoutes);

// SERVE FRONTEND (STATIC FILES)
// Go up two levels from "backend/src" to "f:/website/zimig" then into "frontend"
app.use(express.static(path.join(__dirname, "../../frontend")));

// REDIRECT ROOT TO LOGIN
app.get("/", (req, res) => {
  res.redirect("/pages/login.html");
});

/* =========================
   SERVER + SOCKET
   ========================= */
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*" }
});

/* =========================
   SOCKET (ONE CONNECTION ONLY)
   ========================= */
io.on("connection", socket => {
  console.log("🔌 Socket connected:", socket.id);

  // CHAT
  socket.on("join", userId => socket.join(userId));

  socket.on("sendMessage", async ({ senderId, receiverId, text }) => {
    if (!senderId || !receiverId || !text) return;

    const message = await Message.create({ sender: senderId, receiver: receiverId, text });
    const populated = await message.populate("sender", "username");

    io.to(receiverId).emit("newMessage", populated);
    io.to(senderId).emit("newMessage", populated);
  });

  // GAMES
  initTicTacToe(io, socket);
  initChess(io, socket);
  initCheckers(io, socket);

  socket.on("disconnect", () => {
    console.log("❌ Socket disconnected:", socket.id);
  });
});

/* =========================
   START
   ========================= */
await connectDB();

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});