"use client";

import React from 'react';
import Link from 'next/link';

const games = [
  {
    id: 'tictactoe',
    name: 'Suni Chokdi',
    subtitle: 'Tic-Tac-Toe',
    icon: '⭕',
    description: 'Classic strategy game vs unbeatable AI or a friend online with live voice chat.',
    color: 'from-cyan-500/10 to-rose-500/10',
    accent: 'cyan',
    available: true,
  },
  {
    id: 'bingo',
    name: 'Bingo',
    subtitle: '5×5 Number Game',
    icon: '🎯',
    description: 'Fast-paced number calling game. Fill lines before your opponent does.',
    color: 'from-blue-500/10 to-purple-500/10',
    accent: 'blue',
    available: true,
  },
  {
    id: 'sos',
    name: 'SOS',
    subtitle: 'Classic Paper Game',
    icon: '🆘',
    description: 'Coming soon — the classic SOS board game with online multiplayer.',
    color: 'from-orange-500/10 to-amber-500/10',
    accent: 'orange',
    available: false,
  },
];

const accentMap = {
  cyan: {
    border: 'hover:border-cyan-500/50',
    glow: 'hover:shadow-[0_0_30px_rgba(34,211,238,0.12)]',
    badge: 'text-cyan-300 bg-cyan-500/10 border-cyan-500/20',
    arrow: 'group-hover:text-cyan-400',
    btn: 'bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border-cyan-500/30',
  },
  blue: {
    border: 'hover:border-blue-500/50',
    glow: 'hover:shadow-[0_0_30px_rgba(99,102,241,0.12)]',
    badge: 'text-blue-300 bg-blue-500/10 border-blue-500/20',
    arrow: 'group-hover:text-blue-400',
    btn: 'bg-blue-500/15 hover:bg-blue-500/25 text-blue-300 border-blue-500/30',
  },
  orange: {
    border: 'hover:border-orange-500/50',
    glow: 'hover:shadow-[0_0_30px_rgba(249,115,22,0.12)]',
    badge: 'text-orange-300 bg-orange-500/10 border-orange-500/20',
    arrow: 'group-hover:text-orange-400',
    btn: 'bg-orange-500/15 text-orange-300 border-orange-500/30',
  },
};

export default function GameHub() {
  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-slate-900 via-[#12002a] to-slate-900 flex flex-col items-center justify-center p-5 font-sans text-white">
      <main className="flex flex-col items-center max-w-4xl w-full">

        {/* Hero */}
        <div className="text-center mb-12 animate-in slide-in-from-top-8 duration-700">
          <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight mb-3 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-rose-400 drop-shadow-sm">
            GameBord
          </h1>
          <p className="text-slate-400 text-base sm:text-lg max-w-sm mx-auto leading-relaxed">
            Your hub for premium multiplayer games.<br/>
            <span className="text-slate-500 text-sm">Select a game below to begin.</span>
          </p>
        </div>

        {/* Game cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 w-full animate-in zoom-in-95 duration-500">
          {games.map((game) => {
            const ac = accentMap[game.accent];
            const inner = (
              <div
                className={`group relative h-full bg-gradient-to-br ${game.color} border border-white/8 ${ac.border} ${ac.glow} backdrop-blur-md rounded-2xl p-6 flex flex-col transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] ${!game.available ? 'opacity-60 pointer-events-none' : ''}`}
              >
                {/* Icon */}
                <div className="text-4xl mb-4 group-hover:-translate-y-1 transition-transform duration-300 w-fit">
                  {game.icon}
                </div>

                {/* Name + subtitle */}
                <div className="mb-2">
                  <h2 className="text-xl font-bold text-white leading-tight">{game.name}</h2>
                  <span className={`text-[11px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded-full border ${ac.badge} mt-1 inline-block`}>
                    {game.subtitle}
                  </span>
                </div>

                {/* Description */}
                <p className="text-slate-400 text-sm leading-relaxed flex-1 mb-5">{game.description}</p>

                {/* CTA */}
                {game.available ? (
                  <div className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border text-sm font-bold transition-all ${ac.btn}`}>
                    Play Now
                    <svg className={`w-4 h-4 transition-transform group-hover:translate-x-0.5 ${ac.arrow}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                  </div>
                ) : (
                  <div className="flex items-center justify-center py-2.5 px-4 rounded-xl border border-white/10 bg-white/5 text-sm font-semibold text-slate-500">
                    Coming Soon
                  </div>
                )}
              </div>
            );

            return game.available ? (
              <Link key={game.id} href={`/${game.id}`} className="h-full">
                {inner}
              </Link>
            ) : (
              <div key={game.id}>{inner}</div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
