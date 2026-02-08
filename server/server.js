import express from "express";
import http from "http";
import { Server } from "socket.io";
import { createGame, makeMove } from "./games/tictactoeEngine.js";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

let waitingPlayer = null;
const rooms = new Map();

io.on("connection", socket => {
  console.log("Connected:", socket.id);

  socket.on("findMatch", () => {
    if (waitingPlayer) {
      const roomId = `room-${waitingPlayer.id}-${socket.id}`;

      const game = createGame();

      rooms.set(roomId, {
        game,
        players: {
          [waitingPlayer.id]: "❌",
          [socket.id]: "⭕"
        }
      });

      waitingPlayer.join(roomId);
      socket.join(roomId);

      io.to(roomId).emit("matchFound", {
        roomId,
        players: rooms.get(roomId).players,
        game
      });

      waitingPlayer = null;
    } else {
      waitingPlayer = socket;
    }
  });

  socket.on("move", ({ roomId, index }) => {
    const room = rooms.get(roomId);
    if (!room) return;

    const player = room.players[socket.id];
    if (!player) return;
    if (room.game.currentPlayer !== player) return;

    room.game = makeMove(room.game, index);

    io.to(roomId).emit("gameUpdate", room.game);
  });

  socket.on("disconnect", () => {
    if (waitingPlayer?.id === socket.id) {
      waitingPlayer = null;
    }

    for (const [roomId, room] of rooms) {
      if (room.players[socket.id]) {
        io.to(roomId).emit("opponentLeft");
        rooms.delete(roomId);
      }
    }
  });
});

server.listen(3000, () =>
  console.log("✅ Server running on http://localhost:3000")
);
