// Helper to get 1-25 range
export const getValidNumbers = () => Array.from({ length: 25 }, (_, i) => i + 1);

// Generate a random valid board
export const generateBotBoard = () => {
  const numbers = getValidNumbers();
  // Fisher-Yates shuffle
  for (let i = numbers.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
  }
  return numbers;
};

// Check completed lines for a specific board
// Returns the number of completed lines and the indices of the completed cells (for highlighting)
export const getCompletedLines = (board, calledNumbers) => {
  if (!board || board.length !== 25) return { count: 0, winningCells: [] };

  const calledSet = new Set(calledNumbers);
  let count = 0;
  const winningCells = new Set();

  const isCalled = (val) => calledSet.has(val);

  // Rows
  for (let r = 0; r < 5; r++) {
    let rowComplete = true;
    for (let c = 0; c < 5; c++) {
      if (!isCalled(board[r * 5 + c])) {
        rowComplete = false;
        break;
      }
    }
    if (rowComplete) {
      count++;
      for (let c = 0; c < 5; c++) winningCells.add(r * 5 + c);
    }
  }

  // Columns
  for (let c = 0; c < 5; c++) {
    let colComplete = true;
    for (let r = 0; r < 5; r++) {
      if (!isCalled(board[r * 5 + c])) {
        colComplete = false;
        break;
      }
    }
    if (colComplete) {
      count++;
      for (let r = 0; r < 5; r++) winningCells.add(r * 5 + c);
    }
  }

  // Diagonal 1
  let diag1Complete = true;
  for (let i = 0; i < 5; i++) {
    if (!isCalled(board[i * 5 + i])) {
      diag1Complete = false;
      break;
    }
  }
  if (diag1Complete) {
    count++;
    for (let i = 0; i < 5; i++) winningCells.add(i * 5 + i);
  }

  // Diagonal 2
  let diag2Complete = true;
  for (let i = 0; i < 5; i++) {
    if (!isCalled(board[i * 5 + (4 - i)])) {
      diag2Complete = false;
      break;
    }
  }
  if (diag2Complete) {
    count++;
    for (let i = 0; i < 5; i++) winningCells.add(i * 5 + (4 - i));
  }

  return { count, winningCells: Array.from(winningCells) };
};

// Calculate how many numbers are needed to complete each line
const evaluateLines = (board, calledNumbers) => {
  const calledSet = new Set(calledNumbers);
  const lines = []; // array of { type, neededCount, missingNumbers[] }

  const addLine = (indices) => {
    const missing = [];
    for (let idx of indices) {
      if (!calledSet.has(board[idx])) {
        missing.push(board[idx]);
      }
    }
    lines.push({ neededCount: missing.length, missingNumbers: missing });
  };

  for (let r = 0; r < 5; r++) addLine([r*5, r*5+1, r*5+2, r*5+3, r*5+4]);
  for (let c = 0; c < 5; c++) addLine([c, c+5, c+10, c+15, c+20]);
  addLine([0, 6, 12, 18, 24]);
  addLine([4, 8, 12, 16, 20]);

  return lines;
};

// Choose the best number for the Bot to call
export const chooseBotNumber = (humanBoard, botBoard, calledNumbers) => {
  const allNumbers = getValidNumbers();
  const calledSet = new Set(calledNumbers);
  const available = allNumbers.filter(n => !calledSet.has(n));

  if (available.length === 0) return null;

  // Evaluate current state
  const botLines = evaluateLines(botBoard, calledNumbers);
  const humanLines = evaluateLines(humanBoard, calledNumbers);

  const botCompletedCount = botLines.filter(l => l.neededCount === 0).length;
  const humanCompletedCount = humanLines.filter(l => l.neededCount === 0).length;

  let bestNumber = available[0];
  let bestScore = -Infinity;

  for (const num of available) {
    let score = 0;

    // Evaluate impact on Bot's board
    const botImpact = botLines.filter(l => l.missingNumbers.includes(num));
    const linesBotWillGet = botImpact.filter(l => l.neededCount === 1).length;
    
    // Evaluate impact on Human's board
    const humanImpact = humanLines.filter(l => l.missingNumbers.includes(num));
    const linesHumanWillGet = humanImpact.filter(l => l.neededCount === 1).length;

    // 1. If this number gives the bot a win, take it instantly.
    if (botCompletedCount + linesBotWillGet >= 5) {
      return num;
    }

    // 2. If this number gives the human a win, avoid it at all costs.
    if (humanCompletedCount + linesHumanWillGet >= 5) {
      score -= 10000000;
    } else {
      // 3. Score calculation
      
      // Reward bot progress
      for (const line of botImpact) {
        if (line.neededCount === 1) score += 10000; // Gives bot a line
        else if (line.neededCount === 2) score += 500; // Progress
        else if (line.neededCount === 3) score += 50;
        else score += 5;
      }

      // Heavily penalize helping human
      // The penalty is intentionally higher than the reward to starve the human of progress.
      for (const line of humanImpact) {
        if (line.neededCount === 1) score -= 20000; // NEVER give human a line unless forced
        else if (line.neededCount === 2) score -= 1000; // Avoid setting up a line
        else if (line.neededCount === 3) score -= 100;
        else score -= 10;
      }
    }

    // Add a tiny random factor to make it less predictable when scores are identical
    score += Math.random();

    if (score > bestScore) {
      bestScore = score;
      bestNumber = num;
    }
  }

  return bestNumber;
};
