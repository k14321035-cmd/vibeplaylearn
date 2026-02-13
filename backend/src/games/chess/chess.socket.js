import { createGame, makeMove, getGameStatus } from "./chess.game.js";

const chessRooms = new Map(); // roomId -> { game: ChessInstance, players: { w: socketId, b: socketId } }
let waitingPlayer = null;

export const initChess = (io) => {
    io.on("connection", (socket) => {

        // 1. Find Match
        socket.on("findChessMatch", () => {
            console.log(`♟️ User ${socket.id} looking for chess match...`);

            if (waitingPlayer && waitingPlayer.id !== socket.id) {
                // Match found!
                const roomId = `chess-${waitingPlayer.id}-${socket.id}`;
                const game = createGame();

                const roomData = {
                    game,
                    players: {
                        w: waitingPlayer.id, // White
                        b: socket.id         // Black
                    },
                    spectators: []
                };

                chessRooms.set(roomId, roomData);

                // Join rooms
                socket.join(roomId);
                waitingPlayer.join(roomId);

                // Notify White
                io.to(waitingPlayer.id).emit("chessGameStart", {
                    roomId,
                    color: "w",
                    fen: game.fen()
                });

                // Notify Black
                io.to(socket.id).emit("chessGameStart", {
                    roomId,
                    color: "b",
                    fen: game.fen()
                });

                waitingPlayer = null;
                console.log(`✅ Chess match started: ${roomId}`);

            } else {
                // Wait for opponent
                waitingPlayer = socket;
                socket.emit("waitingForOpponent");
            }
        });

        // 2. Make Move
        socket.on("chessMove", ({ roomId, move }) => {
            const room = chessRooms.get(roomId);
            if (!room) return;

            const { game, players } = room;
            const color = game.turn(); // 'w' or 'b'

            // Validate turn
            if (players[color] !== socket.id) {
                socket.emit("error", { message: "Not your turn!" });
                return;
            }

            // Attempt move
            const result = makeMove(game, move); // move: { from: 'e2', to: 'e4', promotion: 'q' }

            if (result) {
                // Move successful
                io.to(roomId).emit("chessUpdate", {
                    fen: game.fen(),
                    lastMove: result
                });

                // Check Game Over
                const status = getGameStatus(game);
                if (status !== "active") {
                    let winner = null;
                    if (status === "checkmate") {
                        winner = color === "w" ? "w" : "b"; // The one who JUST moved wins
                    }
                    io.to(roomId).emit("chessGameOver", { status, winner });
                    chessRooms.delete(roomId);
                }
            } else {
                socket.emit("error", { message: "Invalid move" });
            }
        });

        // 3. Disconnect
        socket.on("disconnect", () => {
            if (waitingPlayer === socket) {
                waitingPlayer = null;
            }

            // Handle active games
            for (const [roomId, room] of chessRooms) {
                if (room.players.w === socket.id || room.players.b === socket.id) {
                    io.to(roomId).emit("opponentLeft");
                    chessRooms.delete(roomId);
                }
            }
        });
    });
};
