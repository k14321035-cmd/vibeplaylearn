import { Chess } from 'chess.js';

const games = {};

export const initChess = (io, socket) => {
    // Create Room
    socket.on("createRoom", ({ gameType }, callback) => {
        if (gameType !== 'chess') return;

        const roomId = Math.random().toString(36).substring(7).toUpperCase();
        const chess = new Chess();

        games[roomId] = {
            roomId,
            gameType,
            players: [{ id: socket.id, symbol: 'w', username: 'Player 1' }], // First player is White
            board: chess.fen(),
            turn: socket.id,
            status: 'waiting',
            winner: null,
            chessInstance: chess // Store instance for logic
        };

        socket.join(roomId);
        console.log(`[Chess] Room ${roomId} created by ${socket.id}`);

        if (callback) callback({ roomId, gameType });

        io.to(roomId).emit("gameUpdate", sanitizeGame(games[roomId]));
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
        game.players.push({ id: socket.id, symbol: 'b', username: 'Player 2' }); // Second player is Black
        game.status = 'playing';

        socket.join(roomId);
        console.log(`[Chess] ${socket.id} joined room ${roomId}`);

        if (callback) callback({ roomId, gameType: game.gameType });

        io.to(roomId).emit("playerJoined", { players: game.players });
        io.to(roomId).emit("gameUpdate", sanitizeGame(game));
    });

    // Make Move
    socket.on("makeMove", ({ roomId, move }) => {
        const game = games[roomId];
        if (!game || game.status !== 'playing') return;

        // Validate turn
        if (game.turn !== socket.id) return;

        const chess = game.chessInstance;

        try {
            const result = chess.move(move); // move: { from: 'e2', to: 'e4' } or 'e4' (SAN)

            if (result) {
                // Update board state
                game.board = chess.fen();

                // Check game over conditions
                if (chess.isGameOver()) {
                    game.status = 'finished';
                    if (chess.isCheckmate()) {
                        game.winner = socket.id;
                    } else {
                        game.winner = 'draw';
                    }
                } else {
                    // Switch turn
                    const nextPlayer = game.players.find(p => p.id !== socket.id);
                    if (nextPlayer) {
                        game.turn = nextPlayer.id;
                    }
                }

                io.to(roomId).emit("gameUpdate", sanitizeGame(game));
            }
        } catch (e) {
            console.log('Invalid move:', e.message);
        }
    });
};

const sanitizeGame = (game) => {
    // Return game state without the complex chessInstance object
    const { chessInstance, ...rest } = game;
    return rest;
};
