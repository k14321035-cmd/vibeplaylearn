import { renderBoard, updateStatus } from "./ui.js";
import { socket } from "../../../socket.js";

let roomId = null;
let mySymbol = null;
let game = null;
let waitingRematch = false;

const rematchBtn = document.getElementById("rematchBtn");

socket.emit("findMatch");
updateStatus("Finding opponent...");

socket.on("waiting", () => {
  updateStatus("Waiting for opponent...");
});

socket.on("matchFound", data => {
  roomId = data.roomId;
  mySymbol = data.players[socket.id];
  game = data.game;

  renderBoard(game.board, handleMove);
  updateStatus(
    game.currentPlayer === mySymbol ? "Your turn" : "Opponent’s turn"
  );
});

socket.on("gameUpdate", gameState => {
  game = gameState;
  renderBoard(game.board, handleMove);

  if (game.winner) {
    updateStatus(
      game.winner === "draw"
        ? "Draw 🤝"
        : game.winner === mySymbol
        ? "You win 🎉"
        : "You lose 💔"
    );
    rematchBtn.style.display = "block";
  } else {
    updateStatus(
      game.currentPlayer === mySymbol ? "Your turn" : "Opponent’s turn"
    );
  }
});

socket.on("rematchStart", newGame => {
  game = newGame;
  waitingRematch = false;
  rematchBtn.style.display = "none";
  rematchBtn.textContent = "REMATCH";
  renderBoard(game.board, handleMove);
  updateStatus(
    game.currentPlayer === mySymbol ? "Your turn" : "Opponent’s turn"
  );
});

socket.on("rematchWaiting", () => {
  updateStatus("Waiting for opponent to accept rematch...");
});

socket.on("rematchCancelled", () => {
  waitingRematch = false;
  rematchBtn.textContent = "REMATCH";
  updateStatus("Rematch cancelled");
});

socket.on("opponentLeft", () => {
  updateStatus("Opponent left 😢");
  rematchBtn.style.display = "none";
});

function handleMove(index) {
  if (!game) return;
  if (game.currentPlayer !== mySymbol) return;

  socket.emit("move", { roomId, index });
}

rematchBtn.onclick = () => {
  if (!waitingRematch) {
    waitingRematch = true;
    rematchBtn.textContent = "Waiting… (cancel)";
    socket.emit("requestRematch", { roomId });
  } else {
    waitingRematch = false;
    rematchBtn.textContent = "REMATCH";
    socket.emit("cancelRematch", { roomId });
  }
};