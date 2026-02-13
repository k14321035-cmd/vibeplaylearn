const socket = io();
const gameBoard = document.getElementById("game-board");
const statusMsg = document.getElementById("status-msg");
const playerColorEl = document.getElementById("player-color");
const playerNameEl = document.getElementById("player-name");

let roomId = null;
let playerColor = null; // 'b' or 'r'
let selectedSquare = null;
let game = null;

// Audio for moves
const moveAudio = new Audio('https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3');

function initBoard() {
    gameBoard.innerHTML = "";
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const square = document.createElement("div");
            square.className = `square ${(r + c) % 2 === 0 ? "light" : "dark"}`;
            square.dataset.r = r;
            square.dataset.c = c;
            square.onclick = () => handleSquareClick(r, c);
            gameBoard.appendChild(square);
        }
    }
}

function getValidMoves(r, c) {
    if (!game) return [];
    const piece = game.board[r][c];
    if (!piece) return [];

    const moves = [];
    const directions = piece.king ? [-1, 1] : (piece.color === 'r' ? [1] : [-1]);
    const cols = [-1, 1];

    // Check regular moves
    for (const dr of directions) {
        for (const dc of cols) {
            const nr = r + dr;
            const nc = c + dc;
            if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8 && !game.board[nr][nc]) {
                moves.push({ r: nr, c: nc });
            }
        }
    }

    // Check jump moves
    for (const dr of [-2, 2]) {
        for (const dc of [-2, 2]) {
            const nr = r + dr;
            const nc = c + dc;
            const mr = r + dr / 2;
            const mc = c + dc / 2;

            if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
                const midPiece = game.board[mr][mc];
                if (!game.board[nr][nc] && midPiece && midPiece.color !== piece.color) {
                    // If not king, must respect single direction unless jumping
                    if (!piece.king) {
                        if (piece.color === 'r' && dr < 0) continue;
                        if (piece.color === 'b' && dr > 0) continue;
                    }
                    moves.push({ r: nr, c: nc });
                }
            }
        }
    }

    return moves;
}

function clearHighlights() {
    document.querySelectorAll(".square").forEach(s => {
        s.classList.remove("selected", "suggested-move");
    });
}

function highlightMoves(moves) {
    moves.forEach(m => {
        document.querySelector(`[data-r="${m.r}"][data-c="${m.c}"]`).classList.add("suggested-move");
    });
}

function handleSquareClick(r, c) {
    if (!game || game.winner || game.turn !== playerColor) return;

    const piece = game.board[r][c];

    // Select piece
    if (piece && piece.color === playerColor) {
        clearHighlights();
        selectedSquare = { r, c };
        document.querySelector(`[data-r="${r}"][data-c="${c}"]`).classList.add("selected");
        highlightMoves(getValidMoves(r, c));
        return;
    }

    // Make move
    if (selectedSquare) {
        const validMoves = getValidMoves(selectedSquare.r, selectedSquare.c);
        const isValid = validMoves.some(m => m.r === r && m.c === c);

        if (isValid) {
            socket.emit("checkersMove", {
                roomId,
                from: selectedSquare,
                to: { r, c }
            });
            clearHighlights();
            selectedSquare = null;
        } else {
            // Re-select if clicking another piece or clear if clicking empty invalid
            if (piece && piece.color === playerColor) {
                handleSquareClick(r, c);
            } else {
                clearHighlights();
                selectedSquare = null;
            }
        }
    }
}

function updateUI() {
    if (!game) return;

    // Clear existing pieces
    document.querySelectorAll(".piece").forEach(p => p.remove());

    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const pieceData = game.board[r][c];
            if (pieceData) {
                const piece = document.createElement("div");
                piece.className = `piece ${pieceData.color === 'r' ? "red" : "black"} ${pieceData.king ? "king" : ""}`;
                const square = document.querySelector(`[data-r="${r}"][data-c="${c}"]`);
                square.appendChild(piece);
            }
        }
    }

    if (game.winner) {
        statusMsg.innerText = game.winner === playerColor ? "YOU WIN! 🏆" : "YOU LOSE ❌";
    } else {
        statusMsg.innerText = game.turn === playerColor ? "YOUR TURN" : "OPPONENT'S TURN";
    }
}

socket.on("connect", () => {
    statusMsg.innerText = "Finding match...";
    socket.emit("findCheckersMatch");
});

socket.on("waitingForOpponent", () => {
    statusMsg.innerText = "Waiting for opponent...";
});

socket.on("checkersStart", (data) => {
    roomId = data.roomId;
    playerColor = data.color;
    game = data.game;

    playerColorEl.className = `color-indicator ${playerColor === 'r' ? "red" : "black"}`;
    playerNameEl.innerText = `You are ${playerColor === 'r' ? "Red" : "Green/Black"}`;

    if (playerColor === 'r') {
        gameBoard.classList.add("flipped");
    } else {
        gameBoard.classList.remove("flipped");
    }

    initBoard();
    updateUI();
});

socket.on("checkersUpdate", (updatedGame) => {
    game = updatedGame;
    updateUI();
    moveAudio.play().catch(() => { });
});

socket.on("opponentLeft", () => {
    statusMsg.innerText = "Opponent left. You win!";
});

initBoard();
