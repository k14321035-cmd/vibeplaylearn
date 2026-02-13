// backend/src/games/tictactoe/ttt.socket.js

export function initTicTacToe(io, socket) {
  // Shared state held outside the function per connection
  if (!global.tttState) {
    global.tttState = {
      waitingPlayer: null,
      rooms: new Map(),
      rematchRequests: new Map()
    };
  }
  const { rooms, rematchRequests } = global.tttState;

  console.log("🎮 TTT connected:", socket.id);

  /* =========================
     FIND MATCH
     ========================= */
  socket.on("findMatch", () => {
    if (!global.tttState.waitingPlayer) {
      global.tttState.waitingPlayer = socket;
      socket.emit("waiting");
      return;
    }

    const waitingPlayer = global.tttState.waitingPlayer;

    const roomId = `ttt-${waitingPlayer.id}-${socket.id}`;
    const game = createGame();

    rooms.set(roomId, {
      game,
      players: {
        [waitingPlayer.id]: "X",
        [socket.id]: "O"
      }
    });

    waitingPlayer.join(roomId);
    socket.join(roomId);

    io.to(roomId).emit("matchFound", {
      roomId,
      players: rooms.get(roomId).players,
      game
    });

    game
  });

  global.tttState.waitingPlayer = null;
});

/* =========================
   PLAYER MOVE
   ========================= */
socket.on("move", ({ roomId, index }) => {
  const room = rooms.get(roomId);
  if (!room) return;

  const symbol = room.players[socket.id];
  if (!symbol) return;
  if (room.game.currentPlayer !== symbol) return;
  if (room.game.board[index]) return;
  if (room.game.winner) return;

  room.game.board[index] = symbol;
  room.game.winner = checkWinner(room.game.board);
  room.game.currentPlayer = symbol === "X" ? "O" : "X";

  io.to(roomId).emit("gameUpdate", room.game);
});

/* =========================
   REMATCH
   ========================= */
socket.on("requestRematch", ({ roomId }) => {
  if (!rooms.has(roomId)) return;

  if (!rematchRequests.has(roomId)) {
    rematchRequests.set(roomId, new Set());
  }

  rematchRequests.get(roomId).add(socket.id);

  if (rematchRequests.get(roomId).size === 2) {
    const room = rooms.get(roomId);
    room.game = createGame();
    rematchRequests.delete(roomId);

    io.to(roomId).emit("rematchStart", room.game);
  } else {
    socket.emit("rematchWaiting");
  }
});

socket.on("cancelRematch", ({ roomId }) => {
  rematchRequests.delete(roomId);
  socket.to(roomId).emit("rematchCancelled");
});

/* =========================
   DISCONNECT
   ========================= */
socket.on("disconnect", () => {
  for (const [roomId, room] of rooms.entries()) {
    if (room.players[socket.id]) {
      rooms.delete(roomId);
      rematchRequests.delete(roomId);
      socket.to(roomId).emit("opponentLeft");
    }
  }

  if (waitingPlayer?.id === socket.id) {
    waitingPlayer = null;
  }

  console.log("❌ TTT disconnected:", socket.id);
});
  });
}