/**
 * Simple Checkers Game Logic
 */

export function createGame() {
    const board = Array(8).fill(null).map(() => Array(8).fill(null));

    // Initialize pieces
    // Red (r) on top, Black (b) on bottom
    for (let r = 0; r < 3; r++) {
        for (let c = (r % 2 === 0 ? 1 : 0); c < 8; c += 2) {
            board[r][c] = { color: 'r', king: false };
        }
    }

    for (let r = 5; r < 8; r++) {
        for (let c = (r % 2 === 0 ? 1 : 0); c < 8; c += 2) {
            board[r][c] = { color: 'b', king: false };
        }
    }

    return {
        board,
        turn: 'b', // Black starts
        winner: null
    };
}

export function makeMove(game, from, to) {
    const { r: r1, c: c1 } = from;
    const { r: r2, c: c2 } = to;

    const piece = game.board[r1][c1];
    if (!piece || piece.color !== game.turn) return null;

    const dr = r2 - r1;
    const dc = c2 - c1;
    const absDr = Math.abs(dr);
    const absDc = Math.abs(dc);

    // Basic diagonal move check
    if (absDr !== absDc) return null;

    // Check direction (unless king)
    if (!piece.king) {
        if (piece.color === 'r' && dr <= 0) return null;
        if (piece.color === 'b' && dr >= 0) return null;
    }

    // Regular move
    if (absDr === 1) {
        if (game.board[r2][c2]) return null;

        // Execute move
        game.board[r2][c2] = piece;
        game.board[r1][c1] = null;

        // Promotion
        if ((piece.color === 'r' && r2 === 7) || (piece.color === 'b' && r2 === 0)) {
            piece.king = true;
        }

        game.turn = game.turn === 'b' ? 'r' : 'b';
        return { type: 'move' };
    }

    // Jump move
    if (absDr === 2) {
        if (game.board[r2][c2]) return null;

        const midR = r1 + dr / 2;
        const midC = c1 + dc / 2;
        const midPiece = game.board[midR][midC];

        if (!midPiece || midPiece.color === piece.color) return null;

        // Execute jump
        game.board[r2][c2] = piece;
        game.board[r1][c1] = null;
        game.board[midR][midC] = null;

        // Promotion
        if ((piece.color === 'r' && r2 === 7) || (piece.color === 'b' && r2 === 0)) {
            piece.king = true;
        }

        // Check for multi-jump (simplified for now: always switch turn)
        game.turn = game.turn === 'b' ? 'r' : 'b';
        return { type: 'jump', jumped: { r: midR, c: midC } };
    }

    return null;
}

export function checkWinner(game) {
    let rCount = 0;
    let bCount = 0;

    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            if (game.board[r][c]?.color === 'r') rCount++;
            if (game.board[r][c]?.color === 'b') bCount++;
        }
    }

    if (rCount === 0) return 'b';
    if (bCount === 0) return 'r';

    // Also check if current player has any moves left (simplified: return null)
    return null;
}
