import React from 'react';

const COLORS = [
  { id: 'RED', label: 'RED', bg: 'bg-red-500', shadow: 'shadow-red-500/50' },
  { id: 'BLUE', label: 'BLUE', bg: 'bg-blue-500', shadow: 'shadow-blue-500/50' },
  { id: 'YELLOW', label: 'YELLOW', bg: 'bg-yellow-400', shadow: 'shadow-yellow-400/50' },
  { id: 'GREEN', label: 'GREEN', bg: 'bg-green-500', shadow: 'shadow-green-500/50' }
];

export default function ColorPicker({ onSelect }) {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-slate-900 border-2 border-white/10 p-6 rounded-3xl shadow-2xl flex flex-col items-center animate-in zoom-in-95 duration-300">
        <h3 className="text-2xl font-black italic text-white mb-6 drop-shadow-md tracking-tighter">Choose Color</h3>
        
        <div className="grid grid-cols-2 gap-4">
          {COLORS.map((c) => (
            <button
              key={c.id}
              onClick={() => onSelect(c.id)}
              className={`w-24 h-24 sm:w-32 sm:h-32 ${c.bg} rounded-2xl border-4 border-white shadow-lg ${c.shadow} hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center`}
            >
              <span className="text-white font-black italic text-xl drop-shadow-md">{c.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
