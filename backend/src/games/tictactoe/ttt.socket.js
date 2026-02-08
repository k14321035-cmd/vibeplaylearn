// backend/src/games/tictactoe/ttt.socket.js

export function initTicTacToe(io) {
  let waitingPlayer = null;
  const rooms = new Map();
  const rematchRequests = new Map();

  function createGame() {
    return {
      board: Array(9).fill(null),
      currentPlayer: "X",
      winner: null
    };
  }

  function checkWinner(board) {
    const wins = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6]
    ];

    for (const [a, b, c] of wins) {
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return board[a];
      }
    }

    if (board.every(Boolean)) return "draw";
    return null;
  }

  io.on("connection", socket => {
    console.log("🎮 TTT connected:", socket.id);

    /* =========================
       FIND MATCH
       ========================= */
    socket.on("findMatch", () => {
      if (!waitingPlayer) {
        waitingPlayer = socket;
        socket.emit("waiting");
        return;
      }

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

      waitingPlayer = null;
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