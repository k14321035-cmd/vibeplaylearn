// DOM Elements
const statusMsg = document.getElementById("status-msg");
const findMatchBtn = document.getElementById("findMatchBtn"); // Kept reference but hidden

// Variables
let board = null;
// Fix for ReferenceError: explicit window access
const ChessClass = window.Chess || Chess;
let game = new ChessClass();
let socket = io();
let roomId = null;
let playerColor = null;
let selectedSquare = null;

// Initialize Board
function onDragStart(source, piece, position, orientation) {
    if (game.game_over()) return false;
    if (game.turn() !== playerColor) return false;
    if ((playerColor === 'w' && piece.search(/^b/) !== -1) ||
        (playerColor === 'b' && piece.search(/^w/) !== -1)) {
        return false;
    }
}

function onDrop(source, target) {
    const move = game.move({
        from: source,
        to: target,
        promotion: 'q'
    });

    if (move === null) return 'snapback';

    socket.emit("chessMove", {
        roomId,
        move: { from: source, to: target, promotion: 'q' }
    });

    updateStatus();
}

function onSnapEnd() {
    board.position(game.fen());
    removeHighlights();
}

function highlightSquare(square) {
    const $square = $('#board .square-' + square);
    $square.addClass('highlight-selected');
}

function removeHighlights() {
    $('#board .square-55d63').removeClass('highlight-selected highlight-move');
}

function highlightMoves(square) {
    const moves = game.moves({
        square: square,
        verbose: true
    });

    if (moves.length === 0) return;

    moves.forEach(function (move) {
        $('#board .square-' + move.to).addClass('highlight-move');
    });
}

function onSquareClick(square) {
    if (game.game_over() || game.turn() !== playerColor) return;

    // 1. If we clicked a piece of our color, select it and show moves
    const piece = game.get(square);
    if (piece && piece.color === playerColor) {
        removeHighlights();
        selectedSquare = square;
        highlightSquare(square);
        highlightMoves(square);
        return;
    }

    // 2. If we already have a selected square, try to move there
    if (selectedSquare) {
        const move = game.move({
            from: selectedSquare,
            to: square,
            promotion: 'q'
        });

        if (move) {
            socket.emit("chessMove", {
                roomId,
                move: { from: selectedSquare, to: square, promotion: 'q' }
            });
            board.position(game.fen());
            updateStatus();
            removeHighlights();
            selectedSquare = null;
        } else {
            // If click was invalid, clear or re-select
            removeHighlights();
            selectedSquare = null;
        }
    }
}

function updateStatus() {
    let status = "";
    let moveColor = game.turn() === 'b' ? 'Black' : 'White';

    if (game.in_checkmate()) {
        status = `Game over, ${moveColor} is in checkmate.`;
    } else if (game.in_draw()) {
        status = 'Game over, drawn position';
    } else {
        status = `${moveColor} to move`;
        if (game.in_check()) {
            status += `, ${moveColor} is in check`;
        }
    }

    statusMsg.innerText = status;
}

const config = {
    draggable: true,
    position: 'start',
    onDragStart: onDragStart,
    onDrop: onDrop,
    onSnapEnd: onSnapEnd,
    pieceTheme: 'https://chessboardjs.com/img/chesspieces/wikipedia/{piece}.png'
};

board = Chessboard('board', config);

// Add click listener to squares
$('#board').on('click', '.square-55d63', function () {
    const square = $(this).attr('data-square');
    onSquareClick(square);
});

$(window).resize(board.resize);

// --- Socket Events ---

socket.on("connect", () => {
    statusMsg.innerText = "Connected. Finding match...";
    // Auto-connect immediately
    socket.emit("findChessMatch");
});

socket.on("chessGameStart", (data) => {
    roomId = data.roomId;
    playerColor = data.color;

    game.reset();
    board.orientation(playerColor === 'w' ? 'white' : 'black');
    board.position(data.fen);

    statusMsg.innerText = `Game Started! You are ${playerColor === 'w' ? 'White' : 'Black'}.`;
    if (findMatchBtn) findMatchBtn.style.display = "none";
});

socket.on("waitingForOpponent", () => {
    statusMsg.innerText = "Waiting for an opponent...";
    if (findMatchBtn) findMatchBtn.style.display = "none";
});

socket.on("chessUpdate", (data) => {
    game.load(data.fen);
    board.position(data.fen);
    updateStatus();
});

socket.on("chessGameOver", ({ status, winner }) => {
    let msg = "";
    if (status === "checkmate") {
        msg = winner === playerColor ? "You Won! 🏆" : "You Lost ❌";
    } else {
        msg = `Game Over: ${status}`;
    }
    statusMsg.innerText = msg;
    // Don't reshow button, maybe auto-reload or just show status
    alert(msg);
});

socket.on("opponentLeft", () => {
    statusMsg.innerText = "Opponent disconnected. You win!";
});

socket.on("error", (err) => {
    alert(err.message);
    board.position(game.fen());
});

updateStatus();
