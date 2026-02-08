import { io } from "https://cdn.socket.io/4.7.5/socket.io.esm.min.js";
import { BACKEND_URL } from "./core/config.js";

export const socket = io(BACKEND_URL, {
  transports: ["websocket"]
});
function updateStatus() {
  if (!game) return;

  if (game.isCheckmate()) {
    statusEl.textContent = "Checkmate!";
    return;
  }

  if (game.isDraw()) {
    statusEl.textContent = "Draw 🤝";
    return;
  }

  statusEl.textContent =
    game.turn() === myColor
      ? "Your turn ♟️"
      : "Opponent's turn...";
}