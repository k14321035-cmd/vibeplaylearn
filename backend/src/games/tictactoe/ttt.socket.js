const games = {};

export const initTicTacToe = (io, socket) => {
  // Create Room
  socket.on("createRoom", ({ gameType }, callback) => {
    if (gameType !== 'tictactoe') return;

    const roomId = Math.random().toString(36).substring(7).toUpperCase();
    games[roomId] = {
      roomId,
      gameType,
      players: [{ id: socket.id, symbol: 'X' }], // First player is X
      board: Array(9).fill(null),
      turn: socket.id,
      status: 'waiting',
      winner: null
    };

    socket.join(roomId);
    console.log(`[TTT] Room ${roomId} created by ${socket.id}`);

    // Return room info to creator
    if (callback) callback({ roomId, gameType });

    // Emit initial state
    io.to(roomId).emit("gameUpdate", games[roomId]);
  });

  // Join Room
  socket.on("joinRoom", ({ roomId }, callback) => {
    const game = games[roomId];

    if (!game) {
      if (callback) callback({ error: "Room not found" });
      return;
    }

    if (game.players.length >= 2) {
      if (callback) callback({ error: "Room is full" });
      return;
    }

    // Add second player
    game.players.push({ id: socket.id, symbol: 'O' }); // Second player is O
    game.status = 'playing';

    socket.join(roomId);
    console.log(`[TTT] ${socket.id} joined room ${roomId}`);

    if (callback) callback({ roomId, gameType: game.gameType });

    // Notify everyone in room
    io.to(roomId).emit("playerJoined", { players: game.players });
    io.to(roomId).emit("gameUpdate", game);
  });

  // Make Move
  socket.on("makeMove", ({ roomId, move }) => {
    const game = games[roomId];
    if (!game || game.status !== 'playing') return;

    // Validate turn
    if (game.turn !== socket.id) return;

    // Validate move
    const { index } = move;
    if (game.board[index] !== null) return;

    // Update board
    const playerSymbol = game.players.find(p => p.id === socket.id)?.symbol;
    game.board[index] = playerSymbol;

    // Check win/draw
    const winner = checkWinner(game.board);
    if (winner) {
      game.winner = socket.id; // Or store symbol
      game.status = 'finished';
    } else if (!game.board.includes(null)) {
      game.winner = 'draw';
      game.status = 'finished';
    } else {
      // Switch turn
      const nextPlayer = game.players.find(p => p.id !== socket.id);
      if (nextPlayer) {
        game.turn = nextPlayer.id;
      }
    }

    io.to(roomId).emit("gameUpdate", game);
  });

  // Disconnect
  socket.on("disconnect", () => {
    // Find games where user is playing and notify/end
    // Implementation omitted for brevity, but should handle cleanup
  });
};

const checkWinner = (board) => {
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Cols
    [0, 4, 8], [2, 4, 6]             // Diagonals
  ];

  for (let [a, b, c] of lines) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }
  return null;
};