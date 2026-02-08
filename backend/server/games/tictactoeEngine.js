const PLAYER_X = "❌";
const PLAYER_O = "⭕";

const WIN_PATTERNS = [
  [0,1,2],[3,4,5],[6,7,8],
  [0,3,6],[1,4,7],[2,5,8],
  [0,4,8],[2,4,6]
];

export function createGame() {
  return {
    board: Array(9).fill(""),
    currentPlayer: PLAYER_X,
    winner: null
  };
}

export function makeMove(game, index) {
  if (game.winner) return game;
  if (game.board[index]) return game;

  const board = [...game.board];
  board[index] = game.currentPlayer;

  const winner = checkWinner(board);

  return {
    board,
    currentPlayer:
      winner ? game.currentPlayer :
      game.currentPlayer === PLAYER_X ? PLAYER_O : PLAYER_X,
    winner
  };
}

function checkWinner(board) {
  for (const [a,b,c] of WIN_PATTERNS) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }
  return board.includes("") ? null : "draw";
}
