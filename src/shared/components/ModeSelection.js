'use client';
import React from 'react';
import Link from 'next/link';

export default function ModeSelection({ gameName, onLocal, onOnline }) {
  return (
    <div className="flex flex-col items-center gap-5 animate-in zoom-in-95 duration-500 w-full max-w-xs">
      <h2 className="text-lg font-semibold text-slate-300 tracking-wide uppercase">Select Mode</h2>

      {/* Play vs Bot */}
      <button
        onClick={onLocal}
        className="w-full py-4 px-6 bg-white/5 hover:bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 hover:border-cyan-500/50 shadow-lg transition-all hover:scale-[1.03] active:scale-[0.97] text-left group flex items-center justify-between"
      >
        <div className="flex items-center gap-4">
          <div className="text-2xl group-hover:scale-110 transition-transform">
            🤖
          </div>
          <div>
            <div className="text-base font-bold text-white">Play vs Bot</div>
            <div className="text-xs text-slate-400">Challenge the AI offline</div>
          </div>
        </div>
        <span className="text-slate-500 group-hover:text-cyan-400 transition-colors text-lg">›</span>
      </button>

      {/* Play Online */}
      <button
        onClick={onOnline}
        className="w-full py-4 px-6 bg-white/5 hover:bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 hover:border-rose-500/50 shadow-lg transition-all hover:scale-[1.03] active:scale-[0.97] text-left group flex items-center justify-between"
      >
        <div className="flex items-center gap-4">
          <div className="text-2xl group-hover:scale-110 transition-transform">
            🌐
          </div>
          <div>
            <div className="text-base font-bold text-white">Play Online</div>
            <div className="text-xs text-slate-400">Real-time with a friend + voice</div>
          </div>
        </div>
        <span className="text-slate-500 group-hover:text-rose-400 transition-colors text-lg">›</span>
      </button>

      <Link
        href="/"
        className="mt-4 text-slate-500 hover:text-slate-200 transition-colors text-sm"
      >
        Back to Game Hub
      </Link>
    </div>
  );
}
