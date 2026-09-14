import React, { useState, useEffect } from 'react';
import ReverseCard from './ReverseCard';
import ColorPicker from './ColorPicker';

export default function ReverseTable({ gameState, mySeat, onPlayCard, onDrawCard, onChooseColor, onCallUno, onChallengeUno }) {
  const [selectedCard, setSelectedCard] = useState(null);

  if (!gameState) return null;

  const { status, hands, discardPile, currentTurn, direction, activeColor, winner, scores, unoCallers, deckCount, actionLog, pendingWildPlayer } = gameState;
  const myHand = Array.isArray(hands[mySeat]) ? hands[mySeat] : [];
  const isMyTurn = status === 'playing' && currentTurn === mySeat;
  const isChoosingColor = status === 'color_selection' && pendingWildPlayer === mySeat;

  // Derive opponent seats (skip mySeat)
  const numPlayers = hands.length;
  const oppSeats = [];
  for (let i = 1; i < numPlayers; i++) {
    oppSeats.push((mySeat + i) % numPlayers);
  }

  const topCard = discardPile[discardPile.length - 1];

  // Logic to determine if a card is valid in UI
  const isCardValid = (card) => {
    if (card.type === 'WILD' || card.type === 'WILD_DRAW_FOUR') return true;
    if (card.color === activeColor) return true;
    if (topCard && card.type === topCard.type && card.value === topCard.value) return true;
    return false;
  };

  const getPosClass = (idx, totalOpponents) => {
    // Distribute opponents around top and sides based on totalOpponents
    // For simplicity, just render them in a flex row at the top for now, or grid
    return '';
  };

  const renderPlayerBadge = (seatIndex) => {
    const isMe = seatIndex === mySeat;
    const isTurn = currentTurn === seatIndex;
    const cardCount = isMe ? myHand.length : hands[seatIndex];
    const isUno = cardCount === 1;
    const hasCalledUno = unoCallers.includes(seatIndex);

    return (
      <div key={seatIndex} className={`flex flex-col items-center transition-all ${isTurn ? 'scale-110' : 'opacity-80'}`}>
        <div className={`relative w-12 h-12 sm:w-16 sm:h-16 rounded-full border-4 flex flex-col items-center justify-center font-bold text-sm sm:text-lg shadow-lg
          ${isTurn ? 'border-emerald-400 bg-emerald-900/80 animate-pulse ring-4 ring-emerald-500/30' : 'border-white/20 bg-slate-800'}
        `}>
          <span className="text-white text-xs">{isMe ? 'YOU' : `P${seatIndex + 1}`}</span>
          {isUno && hasCalledUno && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[9px] font-black italic px-1 rounded transform rotate-12 shadow">UNO!</span>
          )}
        </div>
        
        {!isMe && (
          <div className="flex items-center gap-1 mt-2 bg-slate-900/80 px-2 py-0.5 rounded-full border border-white/10">
            <div className="w-3 h-4 bg-slate-200 rounded-sm border border-slate-400"></div>
            <span className="text-xs font-bold">{cardCount}</span>
          </div>
        )}

        {/* Challenge UNO button if they have 1 card but haven't called it */}
        {!isMe && isUno && !hasCalledUno && (
          <button 
            onClick={() => onChallengeUno(seatIndex)}
            className="mt-1 bg-red-500 hover:bg-red-400 text-white text-[10px] font-bold px-2 py-1 rounded shadow-lg animate-bounce"
          >
            CHALLENGE
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="w-full h-[100dvh] sm:h-[85vh] max-w-6xl mx-auto bg-green-900/60 sm:rounded-[3rem] border-0 sm:border-8 border-green-950/80 shadow-2xl relative overflow-hidden flex flex-col">
      {/* Felt Texture */}
      <div className="absolute inset-0 opacity-30 mix-blend-overlay bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] pointer-events-none"></div>

      {isChoosingColor && <ColorPicker onSelect={onChooseColor} />}

      {/* Opponents Area (Top / Sides) */}
      <div className="relative w-full p-4 pt-12 sm:p-8 flex justify-center gap-4 sm:gap-8 flex-wrap z-10">
        {oppSeats.map(seat => renderPlayerBadge(seat))}
      </div>

      {/* Center Table */}
      <div className="flex-1 relative flex items-center justify-center z-10 -mt-10 sm:mt-0">
        {/* Draw Pile */}
        <button 
          onClick={() => isMyTurn && onDrawCard()}
          disabled={!isMyTurn}
          className={`absolute left-[15%] sm:left-[30%] -translate-x-1/2 transition-all ${isMyTurn ? 'hover:scale-105 hover:-translate-y-2 cursor-pointer shadow-emerald-500/50 drop-shadow-[0_0_15px_rgba(16,185,129,0.8)] animate-pulse' : 'opacity-80 grayscale-[0.5] cursor-not-allowed'}`}
        >
          <ReverseCard hidden={true} />
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-white font-bold text-xs whitespace-nowrap bg-black/50 px-2 rounded-full backdrop-blur-sm">
            {deckCount} Cards
          </div>
          {isMyTurn && (
             <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-emerald-300 font-black italic text-sm whitespace-nowrap">
                DRAW
             </div>
          )}
        </button>

        {/* Discard Pile */}
        <div className="absolute right-[15%] sm:right-[30%] translate-x-1/2">
          {topCard ? <ReverseCard card={topCard} /> : <div className="w-16 h-24 sm:w-24 sm:h-36 border-4 border-dashed border-white/20 rounded-xl"></div>}
        </div>
        
        {/* Game Info Status */}
        <div className="absolute top-0 sm:top-1/4 left-1/2 -translate-x-1/2 flex flex-col items-center">
            {/* Direction Arrow */}
            <div className={`text-4xl text-white/50 transition-transform duration-500 ${direction === 1 ? 'rotate-0' : '-scale-x-100'}`}>
              ↻
            </div>
            {/* Active Color Info (important when wild is played) */}
            {activeColor && (
              <div className="mt-2 flex items-center gap-2 bg-black/50 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                 <div className={`w-4 h-4 rounded-full shadow-inner border border-white/30 
                    ${activeColor === 'RED' ? 'bg-red-500' : activeColor === 'BLUE' ? 'bg-blue-500' : activeColor === 'GREEN' ? 'bg-green-500' : 'bg-yellow-400'}`}>
                 </div>
                 <span className="text-white text-xs font-bold tracking-wider">{activeColor}</span>
              </div>
            )}
        </div>
        
        {/* Recent Action Log */}
        {actionLog && actionLog.length > 0 && (
           <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center w-full px-4 pointer-events-none">
              <span className="bg-black/60 backdrop-blur-sm text-slate-200 text-xs sm:text-sm px-4 py-1.5 rounded-full border border-white/10 shadow-lg">
                 {actionLog[actionLog.length - 1]}
              </span>
           </div>
        )}
      </div>

      {/* User Hand */}
      <div className="relative w-full pb-6 pt-12 sm:pb-8 flex flex-col items-center z-20">
        
        {/* UNO Button */}
        <div className="absolute -top-4 right-4 sm:right-10 z-30">
          <button 
            onClick={onCallUno}
            disabled={myHand.length > 2}
            className={`w-14 h-14 sm:w-20 sm:h-20 rounded-full font-black italic border-4 shadow-2xl transition-all
              ${myHand.length <= 2 ? 'bg-red-500 hover:bg-red-400 text-white border-white scale-110 animate-pulse cursor-pointer hover:shadow-[0_0_30px_rgba(239,68,68,0.8)]' : 'bg-slate-800 text-slate-500 border-slate-600 opacity-50 cursor-not-allowed'}
            `}
          >
            UNO
          </button>
        </div>

        <div className="flex -space-x-8 sm:-space-x-10 hover:-space-x-4 sm:hover:-space-x-6 transition-all duration-300 px-4 max-w-full overflow-x-auto pb-4 pt-8 custom-scrollbar justify-center">
          {myHand.map((card) => {
            const isValid = isCardValid(card);
            return (
              <ReverseCard 
                key={card.id} 
                card={card} 
                selectable={isMyTurn}
                selected={selectedCard === card.id}
                disabled={isMyTurn && !isValid}
                onClick={() => {
                  if (isMyTurn && isValid) {
                    if (selectedCard === card.id) {
                      onPlayCard(card.id);
                      setSelectedCard(null);
                    } else {
                      setSelectedCard(card.id);
                    }
                  }
                }}
              />
            );
          })}
        </div>
      </div>
      
      {/* Game Over Overlay */}
      {status === 'finished' && (
        <div className="absolute inset-0 bg-black/80 z-50 flex flex-col items-center justify-center backdrop-blur-md animate-in fade-in zoom-in duration-500">
           <div className="text-5xl sm:text-7xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-tr from-yellow-300 to-amber-600 mb-2 drop-shadow-lg">
              WINNER!
           </div>
           <div className="text-3xl text-white font-bold mb-8">
              {winner}
           </div>
           
           <div className="bg-white/10 p-6 rounded-2xl border border-white/20 w-80 max-w-[90%]">
             <h3 className="text-xl text-center text-emerald-400 font-bold mb-4 border-b border-white/10 pb-2">Scores</h3>
             {Object.entries(scores).map(([name, score]) => (
               <div key={name} className="flex justify-between items-center py-2">
                 <span className="text-slate-200">{name}</span>
                 <span className="text-white font-black">{score}</span>
               </div>
             ))}
           </div>
        </div>
      )}
    </div>
  );
}
