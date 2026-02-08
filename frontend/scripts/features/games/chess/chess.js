// chess.js - Improved version with error handling
import { socket } from "../../../socket.js";

// Game state
let board = null;
let game = null;
let roomId = null;
let myColor = null;

// DOM elements
const statusEl = document.getElementById("status");
const errorEl = document.getElementById("error-message");
const boardEl = document.getElementById("board");
socket.on("chess:start", data => {
  try {
    roomId = data.roomId;
    myColor = data.players[socket.id];

    game = new Chess(data.fen);

    board = Chessboard("board", {
      draggable: true,
      position: data.fen,
      orientation: myColor === "w" ? "white" : "black",
      onDrop,
      onSnapEnd
    });

    updateStatus();
    clearError();
  } catch (err) {
    console.error(err);
    showError("Failed to start game. Please refresh.");
  }
});
// Initialize game
function initGame() {
  try {
    // Check if Chess.js is loaded
    if (typeof Chess === 'undefined') {
      showError("Chess library failed to load. Please refresh the page.");
      return;
    }

    // Check if Chessboard is loaded
    if (typeof Chessboard === 'undefined') {
      showError("Chessboard library failed to load. Please refresh the page.");
      return;
    }

    // Check if socket is connected
    if (!socket || !socket.connected) {
      showError("Connection failed. Please check your internet and refresh.");
      return;
    }

    // Initialize chess game
    game = new Chess();
    
    // Request to find a match
    updateStatus("Looking for opponent...");
    socket.emit("chess:findMatch");
    
  } catch (error) {
    console.error("Failed to initialize game:", error);
    showError("Failed to initialize game. Please refresh the page.");
  }
}

// Socket event handlers
socket.on("connect", () => {
  console.log("Socket connected");
  socket.emit("chess:findMatch");
  clearError();
});

socket.on("disconnect", () => {
  console.log("Socket disconnected");
  updateStatus("Disconnected from server");
  showError("Connection lost. Attempting to reconnect...");
});

socket.on("chess:waiting", () => {
  updateStatus("Waiting for opponent...");
});

socket.on("chess:start", (data) => {
  try {
    console.log("Game started:", data);
    
    roomId = data.roomId;
    myColor = data.players[socket.id];

    // Ensure game is initialized
    if (!game) game = new Chess();

    // Load the position
    game.load(data.fen);

    // Initialize or update board
    if (board === null) {
      board = Chessboard("board", {
        draggable: true,
        position: data.fen,
        orientation: myColor === "w" ? "white" : "black",
        onDrop: onDrop,
        onSnapEnd: onSnapEnd
      });
    } else {
      board.position(data.fen);
      board.orientation(myColor === "w" ? "white" : "black");
    }

    updateStatus(data.turn);
    clearError();
    
  } catch (error) {
    console.error("Error starting game:", error);
    showError("Failed to start game. Please refresh.");
  }
});

socket.on("chess:update", (data) => {
  try {
    console.log("Game updated:", data);
    
    // Load new position
    game.load(data.fen);
    board.position(data.fen);

    // Check for game end
    if (data.winner) {
      handleGameEnd(data.winner);
    } else {
      updateStatus(data.turn);
    }
    
  } catch (error) {
    console.error("Error updating game:", error);
    showError("Failed to update board. Please refresh.");
  }
});

socket.on("chess:invalidMove", (data) => {
  console.warn("Invalid move:", data);
  showError("Invalid move! Try again.");
  
  // Reset board to current position
  if (board && game) {
    board.position(game.fen());
  }
  
  // Clear error after 2 seconds
  setTimeout(clearError, 2000);
});

socket.on("chess:opponentLeft", () => {
  updateStatus("Opponent left the game 😢");
  showError("Your opponent has disconnected.");
  
  // Disable board interaction
  if (board) {
    board.destroy();
    board = Chessboard("board", {
      position: game.fen(),
      draggable: false
    });
  }
});

socket.on("chess:error", (data) => {
  console.error("Chess error:", data);
  showError(data.message || "An error occurred");
});

// Move handlers
function onDrop(source, target) {
  // Check if it's player's turn
  if (game.turn() !== myColor) {
    updateStatus("Not your turn!");
    return "snapback";
  }

  // Try to make the move
  const move = game.move({
    from: source,
    to: target,
    promotion: 'q' // Always promote to queen for simplicity
  });

  // If move is illegal, snap back
  if (move === null) {
    return "snapback";
  }

  // Send move to server
  socket.emit("chess:move", {
    roomId,
    from: source,
    to: target,
    promotion: move.promotion
  });

  // Update status
  updateStatus("Waiting for opponent...");
}

function onSnapEnd() {
  // Update board position after piece snap animation
  if (board && game) {
    board.position(game.fen());
  }
}

// Game end handler
function handleGameEnd(winner) {
  let message = "";
  
  if (winner === "draw") {
    message = "Game Over - Draw 🤝";
  } else if (winner === myColor) {
    message = "You Win! 🎉";
  } else {
    message = "You Lose 💔";
  }
  
  updateStatus(message);
  
  // Disable board interaction
  if (board) {
    const currentPosition = game.fen();
    board.destroy();
    board = Chessboard("board", {
      position: currentPosition,
      draggable: false
    });
  }
}

// UI helpers
function updateStatus(turn) {
  if (typeof turn === 'string') {
    statusEl.textContent = turn;
    return;
  }
  
  statusEl.textContent = turn === myColor 
    ? "Your turn ♟️" 
    : "Opponent's turn...";
}

function showError(message) {
  errorEl.textContent = message;
  errorEl.style.display = "block";
}

function clearError() {
  errorEl.textContent = "";
  errorEl.style.display = "none";
}

// Handle page visibility (pause/resume)
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    console.log("Page hidden - game paused");
  } else {
    console.log("Page visible - game resumed");
    // Reconnect if needed
    if (!socket.connected) {
      socket.connect();
    }
  }
});

// Handle window unload
window.addEventListener("beforeunload", () => {
  if (roomId) {
    socket.emit("chess:leave", { roomId });
  }
});

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initGame);
} else {
  initGame();
}

// Export for debugging
window.chessDebug = {
  game: () => game,
  board: () => board,
  roomId: () => roomId,
  myColor: () => myColor,
  fen: () => game ? game.fen() : null
};