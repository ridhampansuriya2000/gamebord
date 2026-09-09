import { useState, useEffect, useCallback } from 'react';
import { checkWinner, isDraw, getBestMove, getWinningLine } from '../models/GameLogic';

export const useGame = () => {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [isHumanTurn, setIsHumanTurn] = useState(true); // Human plays first by default
  const [winner, setWinner] = useState(null); // 'X' or 'O'
  const [winningLine, setWinningLine] = useState(null);
  const [draw, setDraw] = useState(false);

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setIsHumanTurn(true);
    setWinner(null);
    setWinningLine(null);
    setDraw(false);
  };

  const handleCellClick = useCallback((index) => {
    if (board[index] || winner || draw || !isHumanTurn) return;

    const newBoard = [...board];
    newBoard[index] = 'O'; // Human is 'O'
    setBoard(newBoard);
    setIsHumanTurn(false);
  }, [board, winner, draw, isHumanTurn]);

  // Effect to check game state after every board change
  useEffect(() => {
    const currentWinner = checkWinner(board);
    if (currentWinner) {
      setWinner(currentWinner);
      setWinningLine(getWinningLine(board));
      return;
    }

    if (isDraw(board)) {
      setDraw(true);
      return;
    }

    // If it's Bot's turn and game is not over
    if (!isHumanTurn && !currentWinner && !draw) {
      // Small timeout to make the bot feel more "human" and let UI update
      const timer = setTimeout(() => {
        const bestMoveIndex = getBestMove([...board]);
        if (bestMoveIndex !== null) {
          const newBoard = [...board];
          newBoard[bestMoveIndex] = 'X'; // Bot is 'X'
          setBoard(newBoard);
          setIsHumanTurn(true);
        }
      }, 300); // 300ms delay

      return () => clearTimeout(timer);
    }
  }, [board, isHumanTurn, draw]);

  return {
    board,
    isHumanTurn,
    winner,
    winningLine,
    draw,
    handleCellClick,
    resetGame,
  };
};
