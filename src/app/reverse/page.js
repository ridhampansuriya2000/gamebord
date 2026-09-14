'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import ModeSelection from '../../shared/components/ModeSelection';
import OnlineLobby from '../../shared/components/OnlineLobby';
import GameHeader from '../../shared/components/GameHeader';
import useOnlineReverse from '../../games/reverse/hooks/useOnlineReverse';
import ReverseTable from '../../games/reverse/components/ReverseTable';

export default function ReversePage() {
  const [mode, setMode] = useState(null); // 'bots' | 'online'
  
  // Bot Config State
  const [botCount, setBotCount] = useState(3);
  const [botDifficulty, setBotDifficulty] = useState('medium');
  
  // Online Config State
  const [maxPlayers, setMaxPlayers] = useState(4);

  const {
    gameState,
    status,
    error,
    joinCode,
    setJoinCode,
    createRoom,
    joinRoom,
    playCard,
    drawCard,
    chooseColor,
    callUno,
    challengeUno,
    resetConnection,
    connect,
    mySeat
  } = useOnlineReverse();

  const handleBackToMode = () => {
    setMode(null);
    resetConnection();
  };

  const handleStartBotGame = () => {
    createRoom({ mode: 'bots', botCount, botDifficulty });
  };

  const renderBotConfig = () => (
    <div className="flex flex-col items-center gap-6 animate-in slide-in-from-bottom-4 duration-500 w-full max-w-sm mt-8">
      <h2 className="text-2xl font-bold text-white">Bot Match Setup</h2>
      
      <div className="w-full bg-white/5 border border-white/10 rounded-xl p-5 flex flex-col gap-4">
        <div>
          <label className="text-sm font-semibold text-slate-300 block mb-2">Number of Bots ({botCount})</label>
          <input 
            type="range" 
            min="1" 
            max="9" 
            value={botCount} 
            onChange={(e) => setBotCount(parseInt(e.target.value))}
            className="w-full accent-green-500"
          />
          <div className="flex justify-between text-xs text-slate-400 mt-1">
            <span>1</span>
            <span>9</span>
          </div>
        </div>

        <div>
          <label className="text-sm font-semibold text-slate-300 block mb-2">Difficulty</label>
          <div className="flex gap-2">
            {['easy', 'medium', 'hard'].map((diff) => (
              <button
                key={diff}
                onClick={() => setBotDifficulty(diff)}
                className={`flex-1 py-2 rounded-lg text-sm font-bold uppercase transition-all ${
                  botDifficulty === diff
                    ? 'bg-green-500/20 text-green-300 border border-green-500/50'
                    : 'bg-white/5 text-slate-400 border border-transparent hover:bg-white/10'
                }`}
              >
                {diff}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex w-full gap-3">
        <button
          onClick={handleBackToMode}
          className="flex-1 py-3 px-4 bg-white/5 hover:bg-white/10 rounded-xl transition-all font-semibold text-slate-300"
        >
          Cancel
        </button>
        <button
          onClick={handleStartBotGame}
          className="flex-1 py-3 px-4 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 rounded-xl transition-all font-bold text-white shadow-[0_0_15px_rgba(34,197,94,0.4)]"
        >
          Start Game
        </button>
      </div>
    </div>
  );

  const renderOnlineCreateOptions = () => (
    <div className="mb-4">
      <label className="text-sm font-semibold text-slate-300 block mb-2">Max Players (2-10)</label>
      <div className="flex items-center gap-4 bg-white/5 p-2 rounded-xl border border-white/10">
         <input 
            type="range" 
            min="2" 
            max="10" 
            value={maxPlayers} 
            onChange={(e) => setMaxPlayers(parseInt(e.target.value))}
            className="flex-1 accent-emerald-500"
          />
          <span className="text-xl font-bold w-6 text-center text-emerald-400">{maxPlayers}</span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-slate-900 via-green-950/20 to-slate-900 flex flex-col font-sans text-white">
      <GameHeader title="Reverse Rush" />

      <main className="flex-1 flex flex-col items-center justify-center p-4">
        {!gameState && !mode && (
          <ModeSelection onLocal={() => setMode('bots')} onOnline={() => { setMode('online'); connect(); }} />
        )}

        {!gameState && mode === 'bots' && renderBotConfig()}

        {!gameState && mode === 'online' && (
          <OnlineLobby
            status={status}
            error={error}
            joinCode={joinCode}
            setJoinCode={setJoinCode}
            onCreateRoom={() => createRoom({ maxPlayers })}
            onJoinRoom={joinRoom}
            onConnectRetry={resetConnection}
            onBack={handleBackToMode}
            renderCreateOptions={renderOnlineCreateOptions}
          />
        )}

        {gameState && (
          <ReverseTable 
            gameState={gameState} 
            mySeat={mySeat} 
            onPlayCard={playCard}
            onDrawCard={drawCard}
            onChooseColor={chooseColor}
            onCallUno={callUno}
            onChallengeUno={challengeUno}
          />
        )}
      </main>
    </div>
  );
}
