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

// Combinatorics helper
const getCombinations = (arr, k) => {
  const result = [];
  const combine = (start, path) => {
    if (path.length === k) {
      result.push(path);
      return;
    }
    for (let i = start; i < arr.length; i++) {
      combine(i + 1, [...path, arr[i]]);
    }
  };
  combine(0, []);
  return result;
};

// Calculate the absolute minimum numbers needed to reach 5 lines
const getDistanceToWin = (lines) => {
  const completeLinesCount = lines.filter(l => l.neededCount === 0).length;
  const neededToWin = Math.max(0, 5 - completeLinesCount);

  if (neededToWin === 0) return 0;
  
  const incompleteLines = lines.filter(l => l.neededCount > 0);
  if (incompleteLines.length < neededToWin) return Infinity; // Should not happen on a 5x5

  const combos = getCombinations(incompleteLines, neededToWin);
  
  let minCost = Infinity;

  for (const combo of combos) {
    const missingSet = new Set();
    for (const line of combo) {
      for (const num of line.missingNumbers) {
        missingSet.add(num);
      }
    }
    if (missingSet.size < minCost) {
      minCost = missingSet.size;
    }
  }

  return minCost;
};

// Choose the best number for the Bot to call
export const chooseBotNumber = (humanBoard, botBoard, calledNumbers) => {
  const allNumbers = getValidNumbers();
  const calledSet = new Set(calledNumbers);
  const available = allNumbers.filter(n => !calledSet.has(n));

  if (available.length === 0) return null;

  // Evaluate current state distance
  const currentBotLines = evaluateLines(botBoard, calledNumbers);
  const currentHumanLines = evaluateLines(humanBoard, calledNumbers);
  
  const currentBotDistance = getDistanceToWin(currentBotLines);
  const currentHumanDistance = getDistanceToWin(currentHumanLines);

  let bestNumber = available[0];
  let bestScore = -Infinity;

  for (const num of available) {
    const newCalled = [...calledNumbers, num];
    
    const newBotLines = evaluateLines(botBoard, newCalled);
    const newHumanLines = evaluateLines(humanBoard, newCalled);
    
    const newBotDistance = getDistanceToWin(newBotLines);
    const newHumanDistance = getDistanceToWin(newHumanLines);

    let score = 0;

    // 1. If this number gives the bot a win, take it instantly.
    if (newBotDistance === 0) {
      return num;
    }

    // 2. If this number gives the human a win, avoid it at all costs.
    if (newHumanDistance === 0) {
      score -= 10000000;
    } else {
      // 3. Mathematical distance scoring
      // We want to MINIMIZE bot distance, and MAXIMIZE human distance.
      // Progressing the bot's distance is slightly more valuable than blocking human.
      
      const botProgress = currentBotDistance - newBotDistance; // positive if we got closer
      const humanProgress = currentHumanDistance - newHumanDistance; // positive if they got closer
      
      score += botProgress * 1000;
      score -= humanProgress * 800;
      
      // Secondary heuristic: if distance didn't change, we still want to progress lines
      // that are already close to completion to create intersections.
      if (botProgress === 0) {
        const botImpact = newBotLines.filter(l => l.missingNumbers.includes(num)); // wait, the missing numbers won't include it anymore
        const currentBotImpact = currentBotLines.filter(l => l.missingNumbers.includes(num));
        for (const line of currentBotImpact) {
          if (line.neededCount === 2) score += 50;
          else if (line.neededCount === 3) score += 10;
          else score += 1;
        }
      }
      
      // Secondary heuristic: heavily avoid lines the human is close to completing
      if (humanProgress === 0) {
        const currentHumanImpact = currentHumanLines.filter(l => l.missingNumbers.includes(num));
        for (const line of currentHumanImpact) {
          if (line.neededCount === 1) score -= 500; // Almost a line!
          else if (line.neededCount === 2) score -= 50;
          else score -= 1;
        }
      }
    }

    // Tie-breaker: random noise
    score += Math.random();

    if (score > bestScore) {
      bestScore = score;
      bestNumber = num;
    }
  }

  return bestNumber;
};
