"use client";

import React from 'react';
import Link from 'next/link';

export default function GameHub() {
  const games = [
    {
      id: 'tictactoe',
      name: 'Suni Chokdi (Tic-Tac-Toe)',
      icon: '❌⭕',
      description: 'The classic game with a modern twist, unbeatable bot, and online multiplayer with live voice chat.',
      color: 'from-cyan-500/20 to-rose-500/20',
      border: 'border-cyan-500/30'
    },
    {
      id: 'bingo',
      name: 'Bingo',
      icon: '🎱',
      description: 'Coming soon! A highly interactive multiplayer Bingo experience.',
      color: 'from-blue-500/20 to-indigo-500/20',
      border: 'border-blue-500/30',
      disabled: true
    },
    {
      id: 'sos',
      name: 'SOS',
      icon: '🆘',
      description: 'Coming soon! The classic SOS paper game.',
      color: 'from-orange-500/20 to-amber-500/20',
      border: 'border-orange-500/30',
      disabled: true
    }
  ];

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-slate-900 via-purple-900 to-slate-900 flex flex-col items-center justify-center p-4 font-sans text-white">
      <main className="flex flex-col items-center max-w-4xl w-full relative">
        <div className="text-center mb-12 animate-in slide-in-from-top-8 duration-700">
          <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500 drop-shadow-sm">
            GameBord
          </h1>
          <p className="text-slate-300 text-lg sm:text-xl max-w-lg mx-auto">
            Your hub for premium multiplayer games. Select a game below to begin.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full px-4 animate-in zoom-in-95 duration-500">
          {games.map((game) => (
            game.id === 'bingo' ? (
              <Link href="/bingo" className="group flex flex-col bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 hover:border-cyan-400 rounded-3xl p-8 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]">
                <div className="text-5xl mb-4 group-hover:-translate-y-2 transition-transform duration-300 drop-shadow-[0_0_15px_rgba(6,182,212,0.4)]">🎱</div>
                <h2 className="text-2xl font-bold text-slate-200 mb-2">Bingo</h2>
                <p className="text-slate-400">Classic 5x5 strategy game.</p>
                <div className="mt-6 text-sm font-semibold text-cyan-400 flex items-center gap-2 group-hover:gap-3 transition-all">
                  Play Now <span className="text-lg">→</span>
                </div>
              </Link>
            ) : game.disabled ? (
              <div 
                key={game.id}
                className={`p-6 rounded-2xl bg-gradient-to-br ${game.color} border ${game.border} backdrop-blur-md opacity-60 flex flex-col h-full`}
              >
                <div className="text-5xl mb-4">{game.icon}</div>
                <h2 className="text-2xl font-bold mb-2">{game.name}</h2>
                <p className="text-slate-400 text-sm flex-1">{game.description}</p>
                <div className="mt-6 px-4 py-2 bg-black/20 rounded-lg text-center text-sm font-semibold text-slate-300">
                  Coming Soon
                </div>
              </div>
            ) : (
              <Link 
                key={game.id} 
                href={`/${game.id}`}
                className={`group p-6 rounded-2xl bg-gradient-to-br ${game.color} border ${game.border} backdrop-blur-md transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(255,255,255,0.1)] flex flex-col h-full`}
              >
                <div className="text-5xl mb-4 group-hover:scale-110 transition-transform origin-left">{game.icon}</div>
                <h2 className="text-2xl font-bold mb-2 text-white group-hover:text-cyan-300 transition-colors">{game.name}</h2>
                <p className="text-slate-300 text-sm flex-1">{game.description}</p>
                <div className="mt-6 px-4 py-2 bg-white/10 group-hover:bg-white/20 rounded-lg text-center text-sm font-semibold text-white transition-colors">
                  Play Now ➔
                </div>
              </Link>
            )
          ))}
        </div>
      </main>
    </div>
  );
}
