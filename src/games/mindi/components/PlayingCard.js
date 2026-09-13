import React from 'react';

const suitSymbols = {
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣',
  spades: '♠'
};

const suitColors = {
  hearts: 'text-red-500',
  diamonds: 'text-red-500',
  clubs: 'text-slate-900',
  spades: 'text-slate-900'
};

export default function PlayingCard({ card, onClick, selectable, selected, hidden, disabled }) {
  if (hidden) {
    return (
      <div className="w-12 h-16 sm:w-20 sm:h-32 bg-blue-800 rounded-xl border-2 border-white/20 shadow-lg flex items-center justify-center relative overflow-hidden">
         <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/argyle.png')]"></div>
         <div className="w-10 h-16 border-2 border-white/30 rounded-lg flex items-center justify-center">
            <span className="text-white/30 text-2xl">?</span>
         </div>
      </div>
    );
  }

  const isRed = card.suit === 'hearts' || card.suit === 'diamonds';
  const colorClass = isRed ? 'text-red-500' : 'text-slate-800';

  const pipLayouts = {
    2: ['t-c', 'b-c'],
    3: ['t-c', 'm-c', 'b-c'],
    4: ['t-l', 't-r', 'b-l', 'b-r'],
    5: ['t-l', 't-r', 'b-l', 'b-r', 'm-c'],
    6: ['t-l', 't-r', 'b-l', 'b-r', 'm-l', 'm-r'],
    7: ['t-l', 't-r', 'b-l', 'b-r', 'm-l', 'm-r', 'tm-c'],
    8: ['t-l', 't-r', 'b-l', 'b-r', 'm-l', 'm-r', 'tm-c', 'bm-c'],
    9: ['t-l', 't-r', 'b-l', 'b-r', 'tm-l', 'tm-r', 'bm-l', 'bm-r', 'm-c'],
    10: ['t-l', 't-r', 'b-l', 'b-r', 'tm-l', 'tm-r', 'bm-l', 'bm-r', 'tm-c', 'bm-c']
  };

  const pipPos = {
    't-c': 'top-0 left-1/2 -translate-x-1/2',
    'b-c': 'bottom-0 left-1/2 -translate-x-1/2 rotate-180',
    'm-c': 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
    't-l': 'top-0 left-0',
    't-r': 'top-0 right-0',
    'b-l': 'bottom-0 left-0 rotate-180',
    'b-r': 'bottom-0 right-0 rotate-180',
    'm-l': 'top-1/2 left-0 -translate-y-1/2',
    'm-r': 'top-1/2 right-0 -translate-y-1/2',
    'tm-c': 'top-[25%] left-1/2 -translate-x-1/2',
    'bm-c': 'bottom-[25%] left-1/2 -translate-x-1/2 rotate-180',
    'tm-l': 'top-[33%] left-0 -translate-y-1/2',
    'tm-r': 'top-[33%] right-0 -translate-y-1/2',
    'bm-l': 'bottom-[33%] left-0 translate-y-1/2 rotate-180',
    'bm-r': 'bottom-[33%] right-0 translate-y-1/2 rotate-180',
  };

  const isFaceCard = ['J', 'Q', 'K', 'A'].includes(card.rank);
  const num = parseInt(card.rank, 10);
  const pips = pipLayouts[num] || [];


  return (
    <button
      onClick={() => selectable && onClick && onClick(card)}
      disabled={disabled || !selectable}
      className={`relative w-12 h-16 sm:w-20 sm:h-32 bg-white rounded-xl border shadow-lg overflow-hidden transition-all duration-200 
        ${selectable ? 'hover:-translate-y-2 cursor-pointer shadow-cyan-500/20 hover:shadow-cyan-500/40' : 'cursor-default'} 
        ${selected ? '-translate-y-4 shadow-cyan-500/50 ring-2 ring-cyan-400 max-sm:scale-125 max-sm:z-50' : ''} 
        ${disabled ? 'opacity-50 grayscale cursor-not-allowed' : ''}
      `}
    >
      {/* Big Light Background Symbol (On every card) */}
      <div className={`absolute inset-0 flex items-center justify-center opacity-10 text-5xl sm:text-8xl pointer-events-none ${colorClass}`}>
        {suitSymbols[card.suit]}
      </div>

      {/* Top Left Corner */}
      <div className={`absolute top-1 left-1 sm:top-1.5 sm:left-1.5 flex flex-col items-center leading-none ${colorClass}`}>
        <span className="text-[10px] sm:text-[14px] font-black">{card.rank}</span>
        <span className="text-[8px] sm:text-[12px]">{suitSymbols[card.suit]}</span>
      </div>
      
      {/* Center Display */}
      {isFaceCard ? (
        <div className={`absolute inset-0 flex items-center justify-center pointer-events-none opacity-100 ${colorClass}`}>
          <div className="text-sm sm:text-xl leading-none">{suitSymbols[card.suit]}</div>
        </div>
      ) : (
        <div className="absolute top-[22%] bottom-[22%] left-[25%] right-[25%] opacity-100 pointer-events-none">
          {pips.map((pos, i) => (
            <div key={i} className={`absolute ${pipPos[pos]} text-sm sm:text-xl leading-none ${colorClass}`}>
              {suitSymbols[card.suit]}
            </div>
          ))}
        </div>
      )}
      
      {/* Bottom Right Corner */}
      <div className={`hidden sm:flex absolute bottom-1 right-1 sm:bottom-1.5 sm:right-1.5 flex-col items-center leading-none rotate-180 ${colorClass}`}>
        <span className="text-[10px] sm:text-[14px] font-black">{card.rank}</span>
        <span className="text-[8px] sm:text-[12px]">{suitSymbols[card.suit]}</span>
      </div>
    </button>
  );
}
