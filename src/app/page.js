"use client";

import React from 'react';
import { useGame } from '../hooks/useGame';
import Board from '../components/Board';

export default function Home() {
  const { board, isHumanTurn, winner, draw, handleCellClick, resetGame } = useGame();

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-slate-900 via-purple-900 to-slate-900 flex flex-col items-center justify-center p-4 font-sans text-white">


      <main className="flex flex-col items-center max-w-lg w-full">
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight mb-2 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-rose-400 drop-shadow-sm">
            Suni Chokdi
          </h1>
          <p className="text-slate-300 text-lg">Human vs Unbeatable Bot</p>
        </div>

        {/* Game Status */}
        <div className="min-h-[4rem] flex flex-row items-center justify-center gap-6 mb-4 w-full">
          {winner ? (
            <div className={`text-3xl font-bold animate-in slide-in-from-bottom-2 fade-in duration-300 ${winner === 'X' ? 'text-rose-400' : 'text-cyan-400'}`}>
              {winner === 'X' ? 'Bot Wins!' : 'You Win!'}
            </div>
          ) : draw ? (
            <div className="text-3xl font-bold text-slate-300 animate-in slide-in-from-bottom-2 fade-in duration-300">
              It's a Draw!
            </div>
          ) : (
            <div className="text-xl text-slate-200">
              {isHumanTurn ? (
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-cyan-400 animate-pulse"></span>
                  Your Turn (O)
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-rose-400 animate-pulse"></span>
                  Bot is thinking...
                </span>
              )}
            </div>
          )}

          {(winner || draw) && (
            <button
              onClick={resetGame}
              className="group relative px-5 py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white font-semibold rounded-xl border border-white/20 transition-all duration-300 hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] animate-in slide-in-from-right-2 fade-in duration-300"
            >
              <span className="relative z-10 flex items-center gap-2 text-lg">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform duration-500 group-hover:rotate-180">
                  <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
                  <path d="M3 3v5h5"/>
                </svg>
                Play Again
              </span>
            </button>
          )}
        </div>

        {/* Game Board */}
        <div className="mb-10 w-full flex justify-center">
          <Board
            board={board}
            onCellClick={handleCellClick}
            isHumanTurn={isHumanTurn}
            winner={winner}
            draw={draw}
          />
        </div>

        {/* Controls */}
        {!winner && !draw && (
          <button
            onClick={resetGame}
            className="group relative px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white font-semibold rounded-xl border border-white/20 transition-all duration-300 hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)]"
          >
            <span className="relative z-10 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform duration-500">
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
                <path d="M3 3v5h5"/>
              </svg>
              Restart Game
            </span>
          </button>
        )}
      </main>
    </div>
  );
}
