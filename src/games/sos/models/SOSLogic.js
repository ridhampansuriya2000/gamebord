export const getSOSLines = (board) => {
  if (!board || board.length !== 25) return [];

  const lines = [];
  const addLine = (i1, i2, i3) => {
    if (board[i1] === 'S' && board[i2] === 'O' && board[i3] === 'S') {
      lines.push([i1, i2, i3]);
    }
  };

  // Rows
  for (let r = 0; r < 5; r++) {
    for (let c = 0; c < 3; c++) {
      addLine(r * 5 + c, r * 5 + c + 1, r * 5 + c + 2);
    }
  }

  // Columns
  for (let c = 0; c < 5; c++) {
    for (let r = 0; r < 3; r++) {
      addLine(r * 5 + c, (r + 1) * 5 + c, (r + 2) * 5 + c);
    }
  }

  // Diagonals (Top-Left to Bottom-Right)
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      addLine(r * 5 + c, (r + 1) * 5 + c + 1, (r + 2) * 5 + c + 2);
    }
  }

  // Diagonals (Top-Right to Bottom-Left)
  for (let r = 0; r < 3; r++) {
    for (let c = 2; c < 5; c++) {
      addLine(r * 5 + c, (r + 1) * 5 + c - 1, (r + 2) * 5 + c - 2);
    }
  }

  return lines;
};

export const getNewSOSCount = (oldBoard, newBoard) => {
  return getSOSLines(newBoard).length - getSOSLines(oldBoard).length;
};

// Unbeatable SOS Bot AI
export const chooseBotMove = (board) => {
  const emptyCells = [];
  board.forEach((val, i) => { if (!val) emptyCells.push(i); });
  if (emptyCells.length === 0) return null;

  let bestMove = null;
  let bestScore = -Infinity;

  for (const cell of emptyCells) {
    for (const symbol of ['S', 'O']) {
      const simulatedBoard = [...board];
      simulatedBoard[cell] = symbol;
      
      const newSOSCount = getNewSOSCount(board, simulatedBoard);
      
      let score = 0;

      if (newSOSCount > 0) {
        // Huge reward for getting an SOS (and getting an extra turn!)
        score += newSOSCount * 10000;
      } else {
        // Look ahead: Did we just give the human a free SOS?
        const remainingEmpty = emptyCells.filter(c => c !== cell);
        let givesOpponentSOS = 0;

        for (const oppCell of remainingEmpty) {
          for (const oppSymbol of ['S', 'O']) {
            const oppBoard = [...simulatedBoard];
            oppBoard[oppCell] = oppSymbol;
            const oppSOSCount = getNewSOSCount(simulatedBoard, oppBoard);
            if (oppSOSCount > givesOpponentSOS) {
              givesOpponentSOS = oppSOSCount;
            }
          }
        }

        if (givesOpponentSOS > 0) {
          score -= givesOpponentSOS * 5000;
        } else {
          score += Math.random(); // Safe move, pick somewhat randomly to be unpredictable
        }
      }

      if (score > bestScore) {
        bestScore = score;
        bestMove = { cellIndex: cell, symbol };
      }
    }
  }

  return bestMove;
};
