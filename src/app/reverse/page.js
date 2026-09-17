'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import ModeSelection from '../../shared/components/ModeSelection';
import OnlineLobby from '../../shared/components/OnlineLobby';
import GameHeader from '../../shared/components/GameHeader';
import useOnlineReverse from '../../games/reverse/hooks/useOnlineReverse';
import ReverseTable from '../../games/reverse/components/ReverseTable';
import { useWebRTC } from '../../shared/hooks/useWebRTC';

export default function ReversePage() {
  const [mode, setMode] = useState(null); // 'bots' | 'online'
  
  // Bot Config State
  const [botCount, setBotCount] = useState(3);
  const [botDifficulty, setBotDifficulty] = useState('medium');
  
  // Online Config State
  const [maxPlayers, setMaxPlayers] = useState(4);

  const {
    socket,
    gameState,
    status,
    error,
    joinCode,
    setJoinCode,
    players,
    playerNames,
    maxPlayers: roomMaxPlayers,
    createRoom,
    joinRoom,
    startGame,
    playCard,
    drawCard,
    chooseColor,
    callUno,
    challengeUno,
    resetConnection,
    connect,
    mySeat,
    requestRestart,
    restartRequested,
    restartAcceptedCount
  } = useOnlineReverse();

  const rtc = useWebRTC(
    mode === 'online' ? socket : null,
    mode === 'online' ? joinCode : null
  );

  useEffect(() => {
    // Auto-start if we are in bot mode and waiting
    if (mode === 'bots' && status === 'waiting') {
      startGame();
    }
  }, [mode, status, startGame]);

  const handleBackToMode = () => {
    if (mode === 'online') {
      rtc.stopVoiceChat?.();
    }
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

  const isPlaying = gameState && (status === 'playing' || status === 'finished' || status === 'choosing_color');

  return (
    <div className={`min-h-screen bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-slate-900 via-green-950/20 to-slate-900 flex flex-col items-center font-sans text-white overflow-x-hidden relative ${isPlaying ? 'max-sm:portrait:fixed max-sm:portrait:inset-0 max-sm:portrait:w-[100dvh] max-sm:portrait:h-[100dvw] max-sm:portrait:rotate-90 max-sm:portrait:origin-top-left max-sm:portrait:translate-x-[100dvw] max-sm:portrait:z-[9999]' : ''}`}>
      {mode && (
        <>
          <div className="fixed top-2 sm:top-4 left-2 sm:left-4 z-50 flex items-center gap-2 sm:gap-4">
            <button
              onClick={handleBackToMode}
              className="flex items-center justify-center gap-1 sm:gap-2 w-8 h-8 sm:w-auto sm:h-auto sm:px-4 sm:py-2.5 bg-slate-900/50 sm:bg-slate-900/90 hover:bg-slate-800 backdrop-blur-md text-slate-200 hover:text-white text-sm font-bold rounded-full sm:rounded-xl border border-white/10 shadow-xl transition-all duration-300 hover:scale-105 active:scale-95"
              title={mode === 'online' ? 'Leave Room' : 'Go Back'}
            >
              ← <span className="hidden sm:inline">{mode === 'online' ? 'Leave' : 'Back'}</span>
            </button>
            
            {status !== 'idle' && status !== 'waiting' && (
              <button
                onClick={requestRestart}
                disabled={mode === 'online' && restartRequested}
                className={`flex items-center justify-center gap-1 sm:gap-2 w-8 h-8 sm:w-auto sm:h-auto sm:px-4 sm:py-2.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-sm font-bold rounded-full sm:rounded-xl border border-emerald-500/30 shadow-xl transition-all duration-300 ${(mode === 'online' && restartRequested) ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95'}`}
                title="Restart Game"
              >
                ↻ <span className="hidden sm:inline">{mode === 'online' && restartRequested ? `Waiting (${restartAcceptedCount}/${players.filter(p => !p.startsWith('bot_')).length})` : 'Restart'}</span>
              </button>
            )}
          </div>

          <GameHeader 
            gameMode={mode === 'bots' ? 'local' : 'online'}
            roomId={mode === 'online' ? joinCode : null}
            playerSymbol="UNO"
            status={status}
            rtc={rtc}
          />
        </>
      )}

      <main className={`relative z-10 w-full max-w-5xl flex flex-col items-center ${isPlaying ? 'max-sm:h-[calc(100dvw-48px)] max-sm:mt-[48px] max-sm:px-4 max-sm:pb-4 max-sm:overflow-hidden flex-1 justify-center' : 'mt-12 sm:mt-16 p-4 flex-1 justify-center'}`}>
        
        {/* Title */}
        <div className={`mb-6 text-center animate-in fade-in slide-in-from-top-8 duration-700 ${isPlaying ? 'max-sm:hidden' : ''}`}>
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400 drop-shadow-[0_2px_10px_rgba(52,211,153,0.5)] uppercase italic mb-2">
            REVERSE RUSH
          </h1>
          <p className="text-slate-400 text-sm sm:text-base font-medium tracking-wide">
            Fast-Paced Card Action
          </p>
        </div>

        {!gameState && !mode && (
          <div className="mt-4 flex justify-center w-full">
            <ModeSelection onLocal={() => setMode('bots')} onOnline={() => { setMode('online'); connect(); }} />
          </div>
        )}

        {!gameState && mode === 'bots' && renderBotConfig()}

        {status !== 'waiting' && !gameState && mode === 'online' && (
          <OnlineLobby
            status={status}
            error={error}
            joinCode={joinCode}
            setJoinCode={setJoinCode}
            onCreateRoom={(playerName) => createRoom({ maxPlayers }, playerName)}
            onJoinRoom={joinRoom}
            onConnectRetry={resetConnection}
            onBack={handleBackToMode}
            renderCreateOptions={renderOnlineCreateOptions}
          />
        )}

        {/* Online Waiting Lobby */}
        {mode === 'online' && status === 'waiting' && (
          <div className="flex flex-col items-center gap-4 py-12 w-full max-w-md animate-in slide-in-from-bottom-4 duration-500">
             <div className="text-xl font-semibold mb-2">Players Joined: {players.length} / {roomMaxPlayers || 2}</div>
             <div className="w-full bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col gap-2">
               {Array.from({ length: roomMaxPlayers || 2 }).map((_, i) => (
                 <div key={i} className="flex items-center gap-3 bg-black/20 p-2 rounded-lg">
                   <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${i < players.length ? 'bg-emerald-500 text-emerald-950' : 'bg-slate-700 text-slate-500'}`}>
                     {i < players.length ? '✓' : '?'}
                   </div>
                   <span className={i < players.length ? 'text-white font-medium' : 'text-slate-500'}>
                     {i < players.length ? (playerNames?.[players[i]] || (i === 0 ? 'Host (Creator)' : `Player ${i+1}`)) : 'Waiting...'}
                   </span>
                 </div>
               ))}
             </div>
             
             {players.length === (roomMaxPlayers || 2) ? (
               <button 
                 onClick={startGame}
                 disabled={players[0] !== (typeof window !== 'undefined' ? sessionStorage.getItem('reverse_player_id') : '')}
                 className="w-full py-3 mt-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 rounded-xl font-bold transition-all disabled:opacity-50"
               >
                 {players[0] === (typeof window !== 'undefined' ? sessionStorage.getItem('reverse_player_id') : '') ? 'Start Game' : 'Waiting for host to start...'}
               </button>
             ) : (
               <div className="flex items-center gap-2 mt-4 text-emerald-400">
                  <div className="w-5 h-5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin"></div>
                  <span>Waiting for more players...</span>
               </div>
             )}
          </div>
        )}

        {gameState && (
          <div className="w-full h-full flex flex-col items-center animate-in slide-in-from-bottom-4 duration-500 max-sm:overflow-hidden">
            <ReverseTable 
              gameState={gameState} 
              mySeat={mySeat}
              players={players}
              playerNames={playerNames}
              onPlayCard={playCard}
              onDrawCard={drawCard}
              onChooseColor={chooseColor}
              onCallUno={callUno}
              onChallengeUno={challengeUno}
              onRestart={requestRestart}
              onLeave={handleBackToMode}
              restartRequested={restartRequested}
              restartAcceptedCount={restartAcceptedCount}
              mode={mode}
            />

          </div>
        )}
      </main>
    </div>
  );
}
