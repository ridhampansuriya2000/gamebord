import { useState, useEffect } from 'react';
import { generateBotBoard, getCompletedLines, chooseBotNumber } from '../models/BingoLogic';

export const useBingoGame = () => {
  const [humanBoard, setHumanBoard] = useState(null);
  const [botBoard, setBotBoard] = useState(null);
  const [calledNumbers, setCalledNumbers] = useState([]);
  
  const [isHumanTurn, setIsHumanTurn] = useState(true);
  const [humanStartedLast, setHumanStartedLast] = useState(true);
  
  const [winner, setWinner] = useState(null);
  const [status, setStatus] = useState('setup'); // 'setup', 'playing', 'finished'

  const startGame = (board) => {
    setHumanBoard(board);
    setBotBoard(generateBotBoard());
    setCalledNumbers([]);
    
    const nextGameHumanStarts = !humanStartedLast;
    setHumanStartedLast(nextGameHumanStarts);
    setIsHumanTurn(nextGameHumanStarts);
    
    setWinner(null);
    setStatus('playing');
  };

  const callNumber = (num) => {
    if (status !== 'playing') return;
    if (calledNumbers.includes(num)) return; // Already called

    const newCalled = [...calledNumbers, num];
    setCalledNumbers(newCalled);

    // Check for win
    const humanLines = getCompletedLines(humanBoard, newCalled).count;
    const botLines = getCompletedLines(botBoard, newCalled).count;

    if (humanLines >= 5 && botLines >= 5) {
      setWinner('Draw');
      setStatus('finished');
    } else if (humanLines >= 5) {
      setWinner('human');
      setStatus('finished');
    } else if (botLines >= 5) {
      setWinner('bot');
      setStatus('finished');
    } else {
      // Game continues
      setIsHumanTurn(!isHumanTurn);
    }
  };

  // Bot Turn Logic
  useEffect(() => {
    if (status === 'playing' && !isHumanTurn && !winner) {
      // Add a slight delay for realism
      const timer = setTimeout(() => {
        const botChoice = chooseBotNumber(humanBoard, botBoard, calledNumbers);
        if (botChoice !== null) {
          callNumber(botChoice);
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isHumanTurn, status, winner, calledNumbers, humanBoard, botBoard]);

  const resetGame = () => {
    setHumanBoard(null);
    setBotBoard(null);
    setCalledNumbers([]);
    setWinner(null);
    setStatus('setup');
  };

  return {
    humanBoard,
    botBoard,
    calledNumbers,
    isHumanTurn,
    winner,
    status,
    startGame,
    callNumber,
    resetGame
  };
};
