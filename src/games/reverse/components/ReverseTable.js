import React, { useState, useEffect } from 'react';
import ReverseCard from './ReverseCard';
import ColorPicker from './ColorPicker';

export default function ReverseTable({ 
  gameState, 
  mySeat, 
  players = [],
  playerNames = {},
  onPlayCard, 
  onDrawCard, 
  onChooseColor, 
  onCallUno, 
  onChallengeUno,
  onRestart,
  onLeave,
  restartRequested,
  restartAcceptedCount,
  mode
}) {
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
  const recentDiscards = discardPile.slice(Math.max(0, discardPile.length - 6));

  // Deterministic random-like values based on string id
  const getCardTransform = (id) => {
    let hash = 0;
    for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash);
    const rotate = (hash % 20) - 10; // -10 to 10 degrees
    const offsetX = (hash % 10) - 5; // -5 to 5 px
    const offsetY = ((hash >> 2) % 10) - 5;
    return `translate(${offsetX}px, ${offsetY}px) rotate(${rotate}deg)`;
  };

  // Logic to determine if a card is valid in UI
  const isCardValid = (card) => {
    if (card.type === 'WILD' || card.type === 'WILD_DRAW_FOUR') return true;
    if (card.color === activeColor) return true;
    if (topCard && card.type === topCard.type && card.value === topCard.value) return true;
    return false;
  };

  const hasValidCard = myHand.some(isCardValid);

  const getPlayerName = (id) => {
    if (!id) return '';
    if (id === players[mySeat]) return 'You';
    if (id.startsWith('bot_')) return `Bot ${id.split('_')[1]}`;
    return playerNames?.[id] || 'Opponent';
  };

  const getPlayerPosition = (index, totalOpponents) => {
    if (totalOpponents === 0) return {};
    
    let angle;
    if (totalOpponents === 1) {
       angle = Math.PI / 2; // 90 degrees (Top Center)
    } else {
       // Distribute from 170 degrees (Left) to 10 degrees (Right)
       const startAngle = Math.PI - 0.15; // slightly less than 180
       const endAngle = 0.15; // slightly more than 0
       angle = startAngle - (index / (totalOpponents - 1)) * (startAngle - endAngle);
    }

    // Elliptical distribution
    // Radius X: 42% (to keep them inside bounds)
    // Radius Y: 38%
    // Center offset: Y is around 45% down the screen
    const x = 50 + Math.cos(angle) * 40;
    const y = 45 - Math.sin(angle) * 35;

    return {
      left: `${x}%`,
      top: `${y}%`,
      transform: 'translate(-50%, -50%)',
      position: 'absolute'
    };
  };

  const renderPlayerBadge = (seatIndex, index, totalOpponents) => {
    const isMe = seatIndex === mySeat;
    const isTurn = currentTurn === seatIndex;
    const cardCount = isMe ? myHand.length : hands[seatIndex];
    const isUno = cardCount === 1;
    const hasCalledUno = Array.isArray(unoCallers) && unoCallers.includes(seatIndex);

    const posStyle = getPlayerPosition(index, totalOpponents);
    const oppId = players[seatIndex];
    const oppName = (oppId && playerNames?.[oppId]) || `Player ${seatIndex + 1}`;

    return (
      <div key={seatIndex} style={posStyle} className={`flex flex-col items-center transition-all duration-500 z-20 ${isTurn ? 'scale-125' : 'opacity-90'}`}>
        <div className={`relative w-12 h-12 sm:w-16 sm:h-16 rounded-full border-4 flex flex-col items-center justify-center font-bold text-sm sm:text-lg shadow-lg
          ${isTurn ? 'border-emerald-400 bg-emerald-900/80 animate-pulse ring-4 ring-emerald-500/30' : 'border-white/20 bg-slate-800'}
        `}>
          {oppName.substring(0, 2).toUpperCase()}
          {hasCalledUno && (
            <div className="absolute -top-3 -right-3 bg-red-500 text-white text-[10px] sm:text-xs font-black px-1.5 py-0.5 rounded-full border-2 border-white shadow-lg rotate-12">
              UNO!
            </div>
          )}
        </div>
        <span className="mt-2 text-xs sm:text-sm font-bold bg-black/60 px-2 py-0.5 rounded-full backdrop-blur-sm text-slate-200 shadow-md">
          {oppName} ({cardCount})
        </span>

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
    <div className="w-full h-full max-h-full sm:max-h-none sm:h-auto max-w-5xl sm:aspect-video bg-green-900/60 rounded-2xl sm:rounded-[3rem] border-0 sm:border-[12px] border-green-950/90 shadow-[0_30px_60px_rgba(0,0,0,0.6)] relative overflow-hidden flex flex-col items-center justify-center font-sans">
      {/* Premium Felt Texture */}
      <div className="absolute inset-0 opacity-100 mix-blend-overlay bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] pointer-events-none"></div>

      {isChoosingColor && <ColorPicker onSelect={onChooseColor} />}

      {/* Opponents Area (Dynamically placed via absolute positioning) */}
      <div className="absolute inset-0 pointer-events-none z-10">
        {oppSeats.map((seat, idx) => (
          <div key={seat} className="pointer-events-auto">
            {renderPlayerBadge(seat, idx, oppSeats.length)}
          </div>
        ))}
      </div>

      {/* Game Info HUD (Top Right) */}
      <div className="absolute top-4 sm:top-8 right-4 sm:right-8 flex flex-col items-center z-20 pointer-events-none bg-slate-900/80 p-3 sm:p-4 rounded-xl border border-white/10 shadow-lg">
          {/* Direction Arrow */}
          <div className={`text-2xl sm:text-3xl text-white/70 transition-transform duration-500 ${direction === 1 ? 'rotate-0' : '-scale-x-100'}`}>
            ↻
          </div>
          {/* Active Color Info */}
          {activeColor && (
            <div className="mt-1 sm:mt-2 flex items-center gap-1.5 sm:gap-2">
               <div className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full shadow-inner border border-white/30 
                  ${activeColor === 'RED' ? 'bg-red-500' : activeColor === 'BLUE' ? 'bg-blue-500' : activeColor === 'GREEN' ? 'bg-green-500' : 'bg-yellow-400'}`}>
               </div>
               <span className="text-white text-[9px] sm:text-[10px] font-black uppercase tracking-widest">{activeColor}</span>
            </div>
          )}
      </div>

      {/* Center Trick Area */}
      <div className="absolute top-[45%] sm:top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 sm:w-56 sm:h-56 rounded-full border border-white/10 flex items-center justify-center bg-black/10 z-10 shadow-inner mt-8 sm:mt-0">
        
        {/* Discard Pile (Messy Stack) */}
        <div className="relative z-10 pointer-events-auto">
          {recentDiscards.length > 0 ? (
            recentDiscards.map((card, idx) => {
              const isTop = idx === recentDiscards.length - 1;
              return (
                <div 
                  key={card.id} 
                  className={`absolute top-0 left-0 transition-transform ${isTop ? 'animate-in fade-in zoom-in-50 duration-500 ease-out' : ''}`}
                  style={{ 
                    transform: getCardTransform(card.id),
                    zIndex: idx,
                    position: isTop ? 'relative' : 'absolute'
                  }}
                >
                  <ReverseCard card={card} />
                </div>
              );
            })
          ) : (
            <div className="w-16 h-24 sm:w-24 sm:h-36 border-[4px] border-dashed border-white/20 rounded-xl bg-black/10"></div>
          )}
        </div>

        {/* Recent Action Log */}
        {actionLog && actionLog.length > 0 && (
           <div className="absolute top-[-25%] left-1/2 -translate-x-1/2 text-center w-max max-w-sm px-4 pointer-events-none z-30 whitespace-nowrap">
              <span className="bg-black/60 backdrop-blur-md text-slate-200 text-xs sm:text-sm px-4 sm:px-6 py-1.5 sm:py-2 rounded-full border border-white/10 shadow-[0_10px_20px_rgba(0,0,0,0.5)] inline-block">
                 {actionLog[actionLog.length - 1]}
              </span>
           </div>
        )}
      </div>

      {/* User Hand */}
      <div className="absolute bottom-2 sm:bottom-4 left-0 right-0 w-full flex flex-col items-center justify-center z-20">
        
        {/* Draw Pile (Left side of cards) */}
        <div className="absolute bottom-6 sm:bottom-10 left-4 sm:left-12 z-30 pointer-events-auto">
          <button 
            onClick={() => isMyTurn && !hasValidCard && onDrawCard()}
            disabled={!isMyTurn || hasValidCard}
            className={`relative transition-all duration-300 ${isMyTurn && !hasValidCard ? 'hover:scale-105 hover:-translate-y-2 cursor-pointer shadow-[0_0_15px_rgba(16,185,129,0.6)] animate-pulse' : 'opacity-80 grayscale-[0.3] cursor-not-allowed'}`}
          >
            <ReverseCard hidden={true} />
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-white font-bold text-[10px] sm:text-xs whitespace-nowrap bg-black/60 px-2 py-0.5 rounded-full backdrop-blur-sm border border-white/10 shadow-lg">
              {deckCount} Cards
            </div>
            {isMyTurn && !hasValidCard && (
               <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-emerald-400 font-black italic text-[10px] sm:text-xs whitespace-nowrap drop-shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse">
                  DRAW
               </div>
            )}
          </button>
        </div>

        {/* UNO Button (Right side of cards) */}
        <div className="absolute bottom-6 sm:bottom-10 right-4 sm:right-12 z-30 pointer-events-auto">
          <button 
            onClick={onCallUno}
            disabled={myHand.length > 2}
            className={`w-16 h-16 sm:w-24 sm:h-24 rounded-full font-black italic border-4 shadow-2xl transition-all flex items-center justify-center text-sm sm:text-xl
              ${myHand.length <= 2 ? 'bg-red-500 hover:bg-red-400 text-white border-white scale-110 animate-pulse cursor-pointer hover:shadow-[0_0_30px_rgba(239,68,68,0.8)]' : 'bg-slate-800 text-slate-500 border-slate-600 opacity-50 cursor-not-allowed'}
            `}
          >
            UNO
          </button>
        </div>

        <div className="flex -space-x-8 sm:-space-x-10 hover:-space-x-2 sm:hover:-space-x-4 transition-all duration-300 px-4 max-w-full overflow-x-auto pt-4 sm:pt-8 custom-scrollbar justify-center">
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
              {winner === players[mySeat] ? 'YOU WIN!' : 'WINNER!'}
           </div>
           <div className="text-3xl text-white font-bold mb-8">
              {getPlayerName(winner)}
           </div>
           
           <div className="bg-white/10 p-6 rounded-2xl border border-white/20 w-80 max-w-[90%] mb-8">
             <h3 className="text-xl text-center text-emerald-400 font-bold mb-4 border-b border-white/10 pb-2">Scores</h3>
             {Object.entries(scores).map(([id, score]) => (
               <div key={id} className="flex justify-between items-center py-2">
                 <span className="text-slate-200">{getPlayerName(id)}</span>
                 <span className="text-white font-black">{score}</span>
               </div>
             ))}
           </div>

         </div>
      )}
    </div>
  );
}
