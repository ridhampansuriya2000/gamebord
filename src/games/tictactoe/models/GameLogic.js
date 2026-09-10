export const WIN_SCORE = 10;
export const LOSE_SCORE = -10;
export const DRAW_SCORE = 0;

export const checkWinner = (board) => {
  const winLines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // cols
    [0, 4, 8], [2, 4, 6]             // diagonals
  ];
  for (let i = 0; i < winLines.length; i++) {
    const [a, b, c] = winLines[i];
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }
  return null;
};

export const getWinningLine = (board) => {
  const winLines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // cols
    [0, 4, 8], [2, 4, 6]             // diagonals
  ];
  for (let i = 0; i < winLines.length; i++) {
    const [a, b, c] = winLines[i];
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return [a, b, c];
    }
  }
  return null;
};

export const isDraw = (board) => {
  return board.every((cell) => cell !== null);
};

export const getAvailableMoves = (board) => {
  return board.reduce((acc, cell, index) => {
    if (cell === null) acc.push(index);
    return acc;
  }, []);
};

// Bot is 'X', Human is 'O'
// We want to maximize for Bot ('X')
export const minimax = (board, depth, isMaximizing) => {
  const winner = checkWinner(board);
  if (winner === 'X') return WIN_SCORE - depth; // Prefer faster wins
  if (winner === 'O') return LOSE_SCORE + depth; // Delay losing
  if (isDraw(board)) return DRAW_SCORE;

  const availableMoves = getAvailableMoves(board);

  if (isMaximizing) {
    let bestScore = -Infinity;
    for (let i = 0; i < availableMoves.length; i++) {
      const move = availableMoves[i];
      board[move] = 'X';
      const score = minimax(board, depth + 1, false);
      board[move] = null;
      bestScore = Math.max(score, bestScore);
    }
    return bestScore;
  } else {
    let bestScore = Infinity;
    for (let i = 0; i < availableMoves.length; i++) {
      const move = availableMoves[i];
      board[move] = 'O';
      const score = minimax(board, depth + 1, true);
      board[move] = null;
      bestScore = Math.min(score, bestScore);
    }
    return bestScore;
  }
};

export const getBestMove = (board) => {
  const availableMoves = getAvailableMoves(board);
  if (availableMoves.length === 0) return null;

  // Small optimization for the first move if Bot starts, center is best.
  // Although not strictly necessary since minimax will find it, it speeds up the first move.
  if (availableMoves.length === 9) return 4; 

  let bestScore = -Infinity;
  let bestMove = null;

  for (let i = 0; i < availableMoves.length; i++) {
    const move = availableMoves[i];
    board[move] = 'X';
    const score = minimax(board, 0, false);
    board[move] = null;

    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }
  return bestMove;
};
