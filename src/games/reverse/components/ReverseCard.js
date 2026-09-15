import React from 'react';

const COLORS = {
  RED: 'bg-gradient-to-br from-red-400 to-red-700',
  YELLOW: 'bg-gradient-to-br from-yellow-300 to-amber-600',
  GREEN: 'bg-gradient-to-br from-green-400 to-emerald-700',
  BLUE: 'bg-gradient-to-br from-blue-400 to-blue-700',
  WILD: 'bg-gradient-to-br from-slate-800 to-black',
};

const TEXT_COLORS = {
  RED: 'text-red-600',
  YELLOW: 'text-amber-500',
  GREEN: 'text-emerald-600',
  BLUE: 'text-blue-600',
  WILD: 'text-slate-800',
};

const SYMBOLS = {
  SKIP: 'Ø',
  REVERSE: '⟲',
  DRAW_TWO: '+2',
  WILD: 'WILD',
  WILD_DRAW_FOUR: '+4'
};

export default function ReverseCard({ card, onClick, selectable, selected, disabled, hidden }) {
  if (hidden) {
    return (
      <div className="w-12 h-16 sm:w-16 sm:h-24 bg-gradient-to-br from-slate-800 to-black rounded-lg sm:rounded-xl border-[2px] sm:border-4 border-white shadow-[0_4px_10px_rgba(0,0,0,0.5)] flex items-center justify-center relative overflow-hidden group">
         <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] pointer-events-none mix-blend-overlay"></div>
         <div className="absolute inset-1 sm:inset-1.5 border-2 border-red-500/30 rounded-lg flex items-center justify-center bg-[url('https://www.transparenttextures.com/patterns/black-scales.png')] shadow-inner">
            <span className="text-red-500/70 text-xl sm:text-3xl font-black italic -rotate-12 drop-shadow-md">R</span>
         </div>
      </div>
    );
  }

  const bgColor = COLORS[card.color] || COLORS.WILD;
  const textColor = TEXT_COLORS[card.color] || TEXT_COLORS.WILD;
  const displayValue = SYMBOLS[card.type] || card.value;

  const isWild = card.color === 'WILD';

  return (
    <button
      onClick={() => selectable && onClick && onClick(card)}
      disabled={disabled || !selectable}
      className={`relative w-12 h-16 sm:w-16 sm:h-24 ${bgColor} rounded-lg sm:rounded-xl border-[2px] sm:border-[3px] border-white overflow-hidden transition-all duration-300 transform-gpu
        ${selectable ? 'hover:-translate-y-4 cursor-pointer shadow-[0_10px_20px_rgba(0,0,0,0.4)]' : 'cursor-default shadow-[0_4px_10px_rgba(0,0,0,0.3)]'} 
        ${selected ? '-translate-y-6 sm:-translate-y-8 shadow-[0_20px_30px_rgba(0,0,0,0.6)] ring-4 ring-white/50 max-sm:scale-110 max-sm:z-50' : ''} 
        ${disabled ? 'brightness-50 grayscale-[0.3] cursor-not-allowed hover:-translate-y-0 shadow-sm' : ''}
      `}
    >
      {/* Texture Overlay */}
      <div className="absolute inset-0 opacity-15 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] pointer-events-none mix-blend-overlay"></div>
      
      {/* Inner Ellipse styling typical of Uno cards */}
      <div className="absolute inset-1 sm:inset-1.5 bg-gradient-to-br from-white to-slate-100 rounded-[50%] flex items-center justify-center overflow-hidden transform -skew-y-[12deg] scale-95 shadow-[inset_0_2px_8px_rgba(0,0,0,0.2)]">
        {/* Wild card colors behind the ellipse */}
        {isWild && (
          <div className="absolute inset-0 flex flex-wrap opacity-30 pointer-events-none">
            <div className="w-1/2 h-1/2 bg-red-500"></div>
            <div className="w-1/2 h-1/2 bg-blue-500"></div>
            <div className="w-1/2 h-1/2 bg-yellow-400"></div>
            <div className="w-1/2 h-1/2 bg-green-500"></div>
          </div>
        )}

        <span 
          className={`text-2xl sm:text-4xl font-black italic tracking-tighter ${textColor} drop-shadow-sm transform skew-y-[12deg]`}
          style={{ textShadow: '1px 1px 0 rgba(0,0,0,0.1), -1px -1px 0 rgba(255,255,255,0.8)' }}
        >
          {displayValue}
        </span>
      </div>

      {/* Top Left Corner Index */}
      <div className="absolute top-0.5 left-1 sm:top-1 sm:left-1.5 flex flex-col items-center leading-none text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">
        <span className="text-[10px] sm:text-sm font-black italic" style={{ textShadow: '1px 1px 0 rgba(0,0,0,0.3)' }}>{displayValue}</span>
      </div>

      {/* Bottom Right Corner Index */}
      <div className="absolute bottom-0.5 right-1 sm:bottom-1 sm:right-1.5 flex flex-col items-center leading-none rotate-180 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">
        <span className="text-[10px] sm:text-sm font-black italic" style={{ textShadow: '1px 1px 0 rgba(0,0,0,0.3)' }}>{displayValue}</span>
      </div>
      
    </button>
  );
}
