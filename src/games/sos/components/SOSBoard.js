import React from 'react';
import { getSOSLines } from '../models/SOSLogic';

export default function SOSBoard({ board, isInteractive, onNumberClick, isOpponentBoard = false, currentSymbol }) {
  if (!board || board.length !== 25) return null;

  const lines = getSOSLines(board);
  const winSet = new Set();
  lines.forEach(line => line.forEach(idx => winSet.add(idx)));

  return (
    <div className="flex flex-col items-center flex-shrink-0 relative">
      <div className={`grid grid-cols-5 gap-1.5 sm:gap-2 p-3 sm:p-4 rounded-xl backdrop-blur-md border shadow-xl flex-shrink-0 min-w-max ${isOpponentBoard ? 'bg-black/20 border-white/5' : 'bg-white/10 border-white/20'}`}>
        {board.map((cellValue, i) => {
          const isWinning = winSet.has(i);

          let cellStyle = "bg-white/5 border border-white/10 text-white"; // default

          if (isWinning) {
            cellStyle = "bg-green-500 text-white border-green-400 shadow-[0_0_10px_rgba(74,222,128,0.6)] z-10 scale-105";
          } else if (cellValue) {
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
                if (isInteractive && !cellValue) {
                  onNumberClick(i, currentSymbol);
                }
              }}
              className={`relative flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-lg text-lg sm:text-2xl font-bold transition-all duration-300 ${cellStyle}`}
            >
              {cellValue}
            </div>
          );
        })}
      </div>

      {/* SVG Overlay to draw lines across completed SOS sequences */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-20" style={{ padding: '0.75rem' /* matching p-3 roughly */ }}>
        {lines.map((line, idx) => {
          // Calculate positions
          // Grid is 5x5, we need to map indices to x,y coordinates
          // Since SVG overlay is tricky to align perfectly without exact pixels,
          // CSS grid is uniform. We can use percentages!
          // Each cell takes ~20% of width/height
          // Center of cell = (col * 20%) + 10%
          
          const startCol = line[0] % 5;
          const startRow = Math.floor(line[0] / 5);
          const endCol = line[2] % 5;
          const endRow = Math.floor(line[2] / 5);

          // Calculate percentage coordinates (assuming gap-1.5 to gap-2 distributes evenly enough)
          // 20% isn't perfectly center due to gaps, but it's close enough for a visual line if we use
          // (col / 4) * 100% ? No, (col / 5) * 100% + 10%
          const x1 = `${(startCol * 20) + 10}%`;
          const y1 = `${(startRow * 20) + 10}%`;
          const x2 = `${(endCol * 20) + 10}%`;
          const y2 = `${(endRow * 20) + 10}%`;

          return (
            <line
              key={idx}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="white"
              strokeWidth="4"
              strokeLinecap="round"
              className="drop-shadow-[0_0_5px_rgba(255,255,255,0.8)] opacity-90 animate-in fade-in"
            />
          );
        })}
      </svg>
    </div>
  );
}
