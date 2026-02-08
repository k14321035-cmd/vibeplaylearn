import tictactoeSocket from "./tictactoe.socket.js";

export default function socketHandler(io) {
  io.on("connection", socket => {
    tictactoeSocket(io, socket);
  });
}