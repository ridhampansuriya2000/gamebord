'use client';
import React from 'react';
import Link from 'next/link';

/**
 * Shared mode selection screen used by all games.
 * Shows "Play vs Bot" and "Play Online" centered on page.
 * gameName: string — e.g. "BINGO" or "Suni Chokdi"
 * onLocal: () => void
 * onOnline: () => void
 */
export default function ModeSelection({ gameName, onLocal, onOnline }) {
  return (
    <div className="flex flex-col items-center gap-5 animate-in zoom-in-95 duration-500 w-full max-w-xs">
      <h2 className="text-lg font-semibold text-slate-300 tracking-wide uppercase">Select Mode</h2>

      {/* Play vs Bot */}
      <button
        onClick={onLocal}
        className="w-full py-4 px-6 bg-white/5 hover:bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 hover:border-cyan-500/50 shadow-lg transition-all hover:scale-[1.03] active:scale-[0.97] text-left group"
      >
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
            🤖
          </div>
          <div>
            <div className="text-base font-bold text-white">Play vs Bot</div>
            <div className="text-xs text-slate-400">Challenge the AI offline</div>
          </div>
          <span className="ml-auto text-slate-500 group-hover:text-cyan-400 transition-colors text-lg">›</span>
        </div>
      </button>

      {/* Play Online */}
      <button
        onClick={onOnline}
        className="w-full py-4 px-6 bg-white/5 hover:bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 hover:border-rose-500/50 shadow-lg transition-all hover:scale-[1.03] active:scale-[0.97] text-left group"
      >
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
            🌐
          </div>
          <div>
            <div className="text-base font-bold text-white">Play Online</div>
            <div className="text-xs text-slate-400">Real-time with a friend + voice</div>
          </div>
          <span className="ml-auto text-slate-500 group-hover:text-rose-400 transition-colors text-lg">›</span>
        </div>
      </button>

      <Link
        href="/"
        className="mt-2 text-slate-500 hover:text-slate-200 transition-colors text-sm flex items-center gap-1.5"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        Back to Game Hub
      </Link>
    </div>
  );
}
