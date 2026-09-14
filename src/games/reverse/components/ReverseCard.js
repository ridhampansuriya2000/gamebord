import React from 'react';

const COLORS = {
  RED: 'bg-red-500',
  YELLOW: 'bg-yellow-400',
  GREEN: 'bg-green-500',
  BLUE: 'bg-blue-500',
  WILD: 'bg-slate-900',
};

const TEXT_COLORS = {
  RED: 'text-red-500',
  YELLOW: 'text-yellow-500',
  GREEN: 'text-green-500',
  BLUE: 'text-blue-500',
  WILD: 'text-white',
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
      <div className="w-16 h-24 sm:w-24 sm:h-36 bg-slate-900 rounded-xl border-4 border-white shadow-lg flex items-center justify-center relative overflow-hidden">
         <div className="absolute inset-2 border-2 border-red-500/50 rounded-lg flex items-center justify-center bg-[url('https://www.transparenttextures.com/patterns/black-scales.png')]">
            <span className="text-red-500/80 text-3xl font-black italic -rotate-12">R</span>
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
      className={`relative w-16 h-24 sm:w-24 sm:h-36 ${bgColor} rounded-xl border-4 border-white shadow-lg overflow-hidden transition-all duration-200 
        ${selectable ? 'hover:-translate-y-4 cursor-pointer shadow-xl' : 'cursor-default'} 
        ${selected ? '-translate-y-6 shadow-2xl ring-4 ring-white max-sm:scale-110 max-sm:z-50' : ''} 
        ${disabled ? 'opacity-40 grayscale-[0.8] cursor-not-allowed hover:-translate-y-0' : ''}
      `}
    >
      {/* Outer White Border is handled by className */}
      
      {/* Inner Ellipse styling typical of Uno cards */}
      <div className="absolute inset-1 sm:inset-1.5 bg-white rounded-full flex items-center justify-center overflow-hidden transform -skew-y-6 scale-95 shadow-inner">
        {/* Wild card colors behind the ellipse */}
        {isWild && (
          <div className="absolute inset-0 flex flex-wrap opacity-20 pointer-events-none">
            <div className="w-1/2 h-1/2 bg-red-500"></div>
            <div className="w-1/2 h-1/2 bg-blue-500"></div>
            <div className="w-1/2 h-1/2 bg-yellow-400"></div>
            <div className="w-1/2 h-1/2 bg-green-500"></div>
          </div>
        )}

        <span 
          className={`text-3xl sm:text-5xl font-black italic tracking-tighter ${textColor} drop-shadow-sm`}
          style={{ textShadow: '2px 2px 0 rgba(0,0,0,0.1)' }}
        >
          {displayValue}
        </span>
      </div>

      {/* Top Left Corner Index */}
      <div className="absolute top-1 left-1.5 sm:top-2 sm:left-2 flex flex-col items-center leading-none text-white drop-shadow-md">
        <span className="text-xs sm:text-sm font-black italic">{displayValue}</span>
      </div>

      {/* Bottom Right Corner Index */}
      <div className="absolute bottom-1 right-1.5 sm:bottom-2 sm:right-2 flex flex-col items-center leading-none rotate-180 text-white drop-shadow-md">
        <span className="text-xs sm:text-sm font-black italic">{displayValue}</span>
      </div>
      
    </button>
  );
}
