import { createGame, makeMove, checkWinner } from "./checkers.game.js";

const checkersRooms = new Map();
let waitingPlayer = null;

export const initCheckers = (io) => {
    io.on("connection", (socket) => {
        socket.on("findCheckersMatch", () => {
            if (waitingPlayer && waitingPlayer.id !== socket.id) {
                const roomId = `checkers-${waitingPlayer.id}-${socket.id}`;
                const game = createGame();

                const roomData = {
                    game,
                    players: {
                        b: waitingPlayer.id, // Black starts
                        r: socket.id
                    }
                };

                checkersRooms.set(roomId, roomData);
                socket.join(roomId);
                waitingPlayer.join(roomId);

                io.to(waitingPlayer.id).emit("checkersStart", {
                    roomId,
                    color: 'b',
                    game
                });

                io.to(socket.id).emit("checkersStart", {
                    roomId,
                    color: 'r',
                    game
                });

                waitingPlayer = null;
            } else {
                waitingPlayer = socket;
                socket.emit("waitingForOpponent");
            }
        });

        socket.on("checkersMove", ({ roomId, from, to }) => {
            const room = checkersRooms.get(roomId);
            if (!room) return;

            if (room.players[room.game.turn] !== socket.id) return;

            const moveResult = makeMove(room.game, from, to);
            if (moveResult) {
                room.game.winner = checkWinner(room.game);
                io.to(roomId).emit("checkersUpdate", room.game);

                if (room.game.winner) {
                    checkersRooms.delete(roomId);
                }
            }
        });

        socket.on("disconnect", () => {
            if (waitingPlayer === socket) waitingPlayer = null;
            for (const [roomId, room] of checkersRooms) {
                if (room.players.b === socket.id || room.players.r === socket.id) {
                    io.to(roomId).emit("opponentLeft");
                    checkersRooms.delete(roomId);
                }
            }
        });
    });
};
