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
      <div className="w-16 h-24 sm:w-20 sm:h-32 bg-blue-800 rounded-xl border-2 border-white/20 shadow-lg flex items-center justify-center relative overflow-hidden">
         <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/argyle.png')]"></div>
         <div className="w-10 h-16 border-2 border-white/30 rounded-lg"></div>
      </div>
    );
  }

  const isRed = card.suit === 'hearts' || card.suit === 'diamonds';
  const colorClass = isRed ? 'text-red-500' : 'text-slate-800';

  return (
    <button
      onClick={() => selectable && onClick && onClick(card)}
      disabled={disabled || !selectable}
      className={`relative w-16 h-24 sm:w-20 sm:h-32 bg-white rounded-xl border shadow-lg flex flex-col justify-between p-1 sm:p-2 transition-all duration-200 
        ${selectable ? 'hover:-translate-y-2 cursor-pointer shadow-cyan-500/20 hover:shadow-cyan-500/40' : 'cursor-default'} 
        ${selected ? '-translate-y-4 shadow-cyan-500/50 ring-2 ring-cyan-400' : ''} 
        ${disabled ? 'opacity-50 grayscale cursor-not-allowed' : ''}
      `}
    >
      {/* Top Left */}
      <div className={`flex flex-col items-center leading-none ${colorClass}`}>
        <span className="text-sm sm:text-lg font-black">{card.rank}</span>
        <span className="text-sm sm:text-xl">{suitSymbols[card.suit]}</span>
      </div>
      
      {/* Center Big */}
      <div className={`absolute inset-0 flex items-center justify-center opacity-20 text-4xl sm:text-6xl ${colorClass}`}>
        {suitSymbols[card.suit]}
      </div>
      
      {/* Bottom Right */}
      <div className={`flex flex-col items-center leading-none rotate-180 ${colorClass}`}>
        <span className="text-sm sm:text-lg font-black">{card.rank}</span>
        <span className="text-sm sm:text-xl">{suitSymbols[card.suit]}</span>
      </div>
    </button>
  );
}
