import React from 'react';
import Cell from './Cell';

const Board = ({ board, onCellClick, isHumanTurn, winner, draw }) => {
  // If game over or bot's turn, disable interaction
  const isBoardDisabled = !isHumanTurn || winner !== null || draw;

  return (
    <div className="grid grid-cols-3 gap-3 sm:gap-4 p-4 sm:p-6 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)]">
      {board.map((cellValue, index) => (
        <Cell
          key={index}
          value={cellValue}
          onClick={() => onCellClick(index)}
          disabled={isBoardDisabled}
        />
      ))}
    </div>
  );
};

export default Board;
