import { useState, useEffect } from 'react';
import { chooseBotMove, getNewSOSCount } from '../models/SOSLogic';

export const useSOSGame = () => {
  const [board, setBoard] = useState(Array(25).fill(null));
  const [scores, setScores] = useState({ human: 0, bot: 0 });
  const [isHumanTurn, setIsHumanTurn] = useState(true);
  const [humanStartedLast, setHumanStartedLast] = useState(true);
  const [winner, setWinner] = useState(null);
  const [status, setStatus] = useState('setup'); // 'setup', 'playing', 'finished'

  const startGame = () => {
    setBoard(Array(25).fill(null));
    setScores({ human: 0, bot: 0 });
    
    const nextGameHumanStarts = !humanStartedLast;
    setHumanStartedLast(nextGameHumanStarts);
    setIsHumanTurn(nextGameHumanStarts);
    
    setWinner(null);
    setStatus('playing');
  };

  const makeMove = (cellIndex, symbol) => {
    if (status !== 'playing') return;
    if (board[cellIndex] !== null) return;

    const newBoard = [...board];
    newBoard[cellIndex] = symbol;
    
    const newCount = getNewSOSCount(board, newBoard);
    
    let newScores = { ...scores };
    let newIsHumanTurn = isHumanTurn;

    if (newCount > 0) {
      if (isHumanTurn) newScores.human += newCount;
      else newScores.bot += newCount;
      // Turn stays the same
    } else {
      newIsHumanTurn = !isHumanTurn;
    }

    setBoard(newBoard);
    setScores(newScores);
    setIsHumanTurn(newIsHumanTurn);

    // Check if board full
    if (!newBoard.includes(null)) {
      setStatus('finished');
      if (newScores.human > newScores.bot) setWinner('human');
      else if (newScores.bot > newScores.human) setWinner('bot');
      else setWinner('Draw');
    }
  };

  // Bot Turn Logic
  useEffect(() => {
    if (status === 'playing' && !isHumanTurn && !winner) {
      const timer = setTimeout(() => {
        const botMove = chooseBotMove(board);
        if (botMove !== null) {
          makeMove(botMove.cellIndex, botMove.symbol);
        }
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [isHumanTurn, status, winner, board]);

  const resetGame = () => {
    setBoard(Array(25).fill(null));
    setScores({ human: 0, bot: 0 });
    setWinner(null);
    setStatus('setup');
  };

  return {
    board,
    scores,
    isHumanTurn,
    winner,
    status,
    startGame,
    makeMove,
    resetGame
  };
};
