import React from 'react';
import PlayingCard from './PlayingCard';
import { getValidCards } from '../engine/trumpRules';

export default function MindiTable({ gameState, mySeat, onPlayCard, onSetTrump, onRevealTrump }) {
  if (!gameState) return null;

  const { status, currentTurn, currentTrick, trumpRevealed, trumpSuit, hands, playedCards, tricksWon, capturedMindis, winner } = gameState;

  const isMyTurn = status === 'playing' && currentTurn === mySeat;
  const isSelectingTrump = status === 'selecting_trump' && currentTurn === mySeat;
  
  const myHand = hands[mySeat] || [];
  
  // Sort hand by suit and rank for better UX
  const sortedHand = [...myHand].sort((a, b) => {
    if (a.suit !== b.suit) return a.suit.localeCompare(b.suit);
    return a.value - b.value;
  });

  const validCards = status === 'playing' ? getValidCards(myHand, currentTrick) : myHand;

  // Render player avatars
  const renderPlayerBadge = (seatIndex, position) => {
    const isTurn = currentTurn === seatIndex;
    const team = seatIndex % 2 === 0 ? 'Team A' : 'Team B';
    const isMe = seatIndex === mySeat;
    
    // Position classes
    let posClass = '';
    if (position === 'top') posClass = 'top-4 left-1/2 -translate-x-1/2 flex-col';
    if (position === 'bottom') posClass = 'bottom-32 left-1/2 -translate-x-1/2 flex-col-reverse';
    if (position === 'left') posClass = 'left-4 top-1/2 -translate-y-1/2 flex-row';
    if (position === 'right') posClass = 'right-4 top-1/2 -translate-y-1/2 flex-row-reverse';

    return (
      <div className={`absolute ${posClass} flex items-center z-10 transition-all ${isTurn ? 'scale-110' : 'opacity-80'}`}>
        <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 flex items-center justify-center font-bold text-sm sm:text-lg shadow-lg
          ${isTurn ? 'border-cyan-400 bg-cyan-900/80 animate-pulse ring-4 ring-cyan-500/30' : 'border-white/20 bg-slate-800'}
        `}>
          P{seatIndex + 1}
        </div>
        <div className={`flex flex-col ${position === 'bottom' ? 'items-center mt-2' : ''} ${position === 'top' ? 'items-center mb-2' : ''} ${position === 'left' ? 'items-start ml-2' : ''} ${position === 'right' ? 'items-end mr-2' : ''}`}>
           <span className="text-white font-semibold whitespace-nowrap text-xs sm:text-base">{isMe ? 'YOU' : `Player ${seatIndex + 1}`}</span>
           <span className={`text-[10px] sm:text-xs font-bold ${team === 'Team A' ? 'text-blue-400' : 'text-rose-400'}`}>{team}</span>
           {status === 'selecting_trump' && isTurn && !isMe && (
             <span className="mt-1 text-[9px] sm:text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full animate-pulse whitespace-nowrap">
               Selecting Trump...
             </span>
           )}
        </div>
      </div>
    );
  };

  const getRelativeSeat = (seatIndex) => {
    const diff = (seatIndex - mySeat + 4) % 4;
    if (diff === 0) return 'bottom';
    if (diff === 1) return 'left'; // Counter-clockwise? usually right is next. 
    // If standard play is counter-clockwise, next turn is right. If clockwise, next is left.
    // Assuming standard play (incrementing seat index) goes counter-clockwise in UI: left. Let's make 1 = left, 2 = top, 3 = right.
    if (diff === 2) return 'top';
    if (diff === 3) return 'right';
  };

  return (
    <div className="w-full h-full max-h-[95dvw] sm:max-h-none sm:h-auto max-w-5xl sm:aspect-video bg-green-900/60 rounded-3xl sm:rounded-[3rem] border-4 sm:border-8 border-amber-900/80 shadow-2xl relative overflow-hidden flex items-center justify-center">
      
      {/* Felt Texture */}
      <div className="absolute inset-0 opacity-40 mix-blend-overlay bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] pointer-events-none"></div>

      {/* Players */}
      {[0,1,2,3].map(seat => renderPlayerBadge(seat, getRelativeSeat(seat)))}

      {/* Center Trick Area */}
      <div className="relative w-36 h-36 sm:w-64 sm:h-64 rounded-full border border-white/10 flex items-center justify-center bg-black/10 mt-8 sm:mt-0">
         {currentTrick.map((play, idx) => {
           const rel = getRelativeSeat(play.seatIndex);
           let transform = '';
           if (rel === 'bottom') transform = 'translate-y-4 sm:translate-y-6';
           if (rel === 'top') transform = '-translate-y-4 sm:-translate-y-6';
           if (rel === 'left') transform = '-translate-x-6 sm:-translate-x-8 -rotate-12';
           if (rel === 'right') transform = 'translate-x-6 sm:translate-x-8 rotate-12';

           return (
             <div key={idx} className={`absolute transition-all duration-300 ${transform} z-${idx}`}>
               <PlayingCard card={play.card} disabled={false} />
             </div>
           );
         })}
      </div>

      {/* Trump Info */}
      <div className="absolute top-4 right-4 bg-slate-900/80 p-3 rounded-xl border border-white/10 flex flex-col items-center gap-1 z-20">
         <span className="text-xs text-slate-400 uppercase font-bold tracking-widest">Trump</span>
         {trumpRevealed ? (
           <span className="text-2xl">{trumpSuit === 'hearts' || trumpSuit === 'diamonds' ? <span className="text-red-500">{trumpSuit === 'hearts' ? '♥' : '♦'}</span> : <span className="text-slate-200">{trumpSuit === 'clubs' ? '♣' : '♠'}</span>}</span>
         ) : (
           <span className="text-xl">❓</span>
         )}
         {status === 'playing' && !trumpRevealed && currentTrick.length > 0 && isMyTurn && (
           <button 
             onClick={onRevealTrump}
             className="mt-2 text-xs bg-amber-500/20 hover:bg-amber-500/40 text-amber-300 border border-amber-500/50 px-2 py-1 rounded"
           >
             Reveal Trump
           </button>
         )}
      </div>

      {/* Scores Info */}
      <div className="absolute top-4 left-4 flex gap-4 z-20">
         <div className="bg-blue-900/60 p-2 rounded-lg border border-blue-500/30 text-center min-w-[4rem]">
            <div className="text-[10px] text-blue-200 font-bold uppercase">Team A</div>
            <div className="text-xl font-black text-white">{tricksWon['Team A']}</div>
            <div className="text-xs text-blue-300">{capturedMindis['Team A'].length} 10s</div>
         </div>
         <div className="bg-rose-900/60 p-2 rounded-lg border border-rose-500/30 text-center min-w-[4rem]">
            <div className="text-[10px] text-rose-200 font-bold uppercase">Team B</div>
            <div className="text-xl font-black text-white">{tricksWon['Team B']}</div>
            <div className="text-xs text-rose-300">{capturedMindis['Team B'].length} 10s</div>
         </div>
      </div>

      {/* User Hand at Bottom */}
      <div className="absolute bottom-2 sm:bottom-4 left-0 right-0 flex justify-center z-30">
        <div className="flex -space-x-10 sm:-space-x-6 hover:-space-x-2 sm:hover:space-x-1 transition-all duration-300 px-4 max-w-full overflow-x-auto pb-4 pt-8">
          {sortedHand.map((card, idx) => {
            const isValid = validCards.some(c => c.id === card.id);
            return (
              <PlayingCard 
                key={card.id} 
                card={card} 
                selectable={isMyTurn || isSelectingTrump}
                disabled={(isMyTurn && !isValid) && !isSelectingTrump}
                onClick={() => {
                  if (isSelectingTrump) onSetTrump(card.id);
                  else if (isMyTurn && isValid) onPlayCard(card.id);
                }}
              />
            );
          })}
        </div>
      </div>

      {/* Center Status Overlay */}
      {status === 'selecting_trump' && isSelectingTrump && (
        <div className="absolute top-[25%] left-1/2 -translate-x-1/2 z-40 pointer-events-none">
           <div className="text-sm sm:text-xl font-bold text-amber-400 bg-black/80 px-4 py-2 sm:px-6 sm:py-3 rounded-2xl border border-amber-500/30 shadow-2xl animate-bounce">
              Select a card to hide as Trump! ↓
           </div>
        </div>
      )}

      {status === 'finished' && (
        <div className="absolute inset-0 bg-black/80 z-50 flex flex-col items-center justify-center backdrop-blur-md">
           <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-yellow-600 mb-4 animate-bounce">
              {winner === 'Draw' ? "It's a Draw!" : `${winner} Wins!`}
           </div>
           <div className="flex gap-8 mt-4">
              <div className="text-center">
                 <div className="text-blue-400 font-bold text-xl mb-2">Team A</div>
                 <div className="text-slate-300">Tricks: {tricksWon['Team A']}</div>
                 <div className="text-amber-400 font-bold">10s: {capturedMindis['Team A'].length}</div>
              </div>
              <div className="text-center">
                 <div className="text-rose-400 font-bold text-xl mb-2">Team B</div>
                 <div className="text-slate-300">Tricks: {tricksWon['Team B']}</div>
                 <div className="text-amber-400 font-bold">10s: {capturedMindis['Team B'].length}</div>
              </div>
           </div>
        </div>
      )}

    </div>
  );
}
