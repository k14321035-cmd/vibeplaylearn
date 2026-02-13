import { Chess } from "chess.js";

// Helper to create a new game
export const createGame = () => {
    return new Chess();
};

// Helper to validate and make a move
export const makeMove = (chessInstance, move) => {
    try {
        const result = chessInstance.move(move); // move can be string 'e4' or object { from: 'e2', to: 'e4' }
        return result; // Returns the move object if valid, null if invalid
    } catch (e) {
        return null;
    }
};

// Check game status
export const getGameStatus = (chessInstance) => {
    if (chessInstance.isCheckmate()) return "checkmate";
    if (chessInstance.isDraw()) return "draw";
    if (chessInstance.isStalemate()) return "stalemate";
    if (chessInstance.isThreefoldRepetition()) return "threefold";
    if (chessInstance.isInsufficientMaterial()) return "material";
    return "active";
};
