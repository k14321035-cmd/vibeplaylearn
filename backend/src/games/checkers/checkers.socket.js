import { createGame, makeMove, checkWinner } from "./checkers.game.js";

const games = {};

export const initCheckers = (io, socket) => {
    // Create Room
    socket.on("createRoom", ({ gameType }, callback) => {
        if (gameType !== 'checkers') return;

        const roomId = Math.random().toString(36).substring(7).toUpperCase();

        // createGame returns { board, turn: 'b', winner: null }
        // We need to wrap it in our standard game object
        const coreGame = createGame();

        games[roomId] = {
            roomId,
            gameType,
            players: [{ id: socket.id, symbol: 'b', username: 'Player 1' }], // First player is Black (starts)
            ...coreGame,
            status: 'waiting',
            winner: null
        };

        socket.join(roomId);
        console.log(`[Checkers] Room ${roomId} created by ${socket.id}`);

        if (callback) callback({ roomId, gameType });

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
        game.players.push({ id: socket.id, symbol: 'r', username: 'Player 2' }); // Second player is Red
        game.status = 'playing';

        socket.join(roomId);
        console.log(`[Checkers] ${socket.id} joined room ${roomId}`);

        if (callback) callback({ roomId, gameType: game.gameType });

        io.to(roomId).emit("playerJoined", { players: game.players });
        io.to(roomId).emit("gameUpdate", game);
    });

    // Make Move
    socket.on("makeMove", ({ roomId, move }) => {
        const game = games[roomId];
        if (!game || game.status !== 'playing') return;

        // Validate turn
        if (game.turn === 'b' && game.players[0].id !== socket.id) return; // Black's turn (Player 1)
        if (game.turn === 'r' && game.players[1].id !== socket.id) return; // Red's turn (Player 2)

        // Execute move logic
        // move should be { from: {r, c}, to: {r, c} }
        const result = makeMove(game, move.from, move.to);

        if (result) {
            // Check win
            const winnerColor = checkWinner(game);
            if (winnerColor) {
                game.status = 'finished';
                game.winner = winnerColor === 'b' ? game.players[0].id : game.players[1].id;
            }

            io.to(roomId).emit("gameUpdate", game);
        }
    });
};
