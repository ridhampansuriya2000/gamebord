import React from 'react';
import { getCompletedLines } from '../models/BingoLogic';

export default function BingoBoard({ board, calledNumbers, isInteractive, onNumberClick, isOpponentBoard = false }) {
  if (!board || board.length !== 25) return null;

  const calledSet = new Set(calledNumbers);
  const { winningCells } = getCompletedLines(board, calledNumbers);
  const winSet = new Set(winningCells);

  return (
    <div className="flex flex-col items-center flex-shrink-0 select-none" style={{ WebkitTouchCallout: 'none' }}>
      <div className={`grid grid-cols-5 gap-1.5 sm:gap-2 p-3 sm:p-4 rounded-xl backdrop-blur-md border shadow-xl flex-shrink-0 min-w-max ${isOpponentBoard ? 'bg-black/20 border-white/5' : 'bg-white/10 border-white/20'}`}>
        {board.map((num, i) => {
          const isCalled = calledSet.has(num);
          const isWinning = winSet.has(i);

          let cellStyle = "bg-white/5 border border-white/10 text-white"; // default

          if (isWinning) {
            cellStyle = "bg-green-500 text-white border-green-400 shadow-[0_0_10px_rgba(74,222,128,0.6)] z-10 scale-105";
          } else if (isCalled) {
            cellStyle = "bg-cyan-500/80 text-white border-cyan-400/50 shadow-[inset_0_2px_10px_rgba(0,0,0,0.2)]";
          } else if (isInteractive) {
            cellStyle += " hover:bg-white/20 cursor-pointer hover:border-white/40 hover:scale-105 transition-all";
          } else {
            cellStyle += " opacity-80 cursor-default";
          }

          return (
            <div
              key={i}
              onClick={() => {
                if (isInteractive && !isCalled) {
                  onNumberClick(num);
                }
              }}
              className={`relative flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-lg text-lg sm:text-xl font-bold transition-all duration-300 ${cellStyle}`}
            >
              {num}
              {isCalled && !isWinning && (
                <div className="absolute inset-0 flex items-center justify-center opacity-40 mix-blend-overlay">
                  <div className="w-full h-[2px] bg-black rotate-45 absolute"></div>
                  <div className="w-full h-[2px] bg-black -rotate-45 absolute"></div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
