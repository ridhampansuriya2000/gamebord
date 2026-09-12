'use client';
import React, { useState, useEffect } from 'react';
import { useMindiBotGame } from '@/games/mindi/hooks/useMindiBotGame';
import { useOnlineMindi } from '@/games/mindi/hooks/useOnlineMindi';
import { useWebRTC } from '@/shared/hooks/useWebRTC';
import ModeSelection from '@/shared/components/ModeSelection';
import OnlineLobby from '@/shared/components/OnlineLobby';
import GameHeader from '@/shared/components/GameHeader';
import MindiTable from '@/games/mindi/components/MindiTable';

export default function MindiPage() {
  const [gameMode, setGameMode] = useState(null); // 'local' | 'online' | null
  const [joinCode, setJoinCode] = useState('');

  const localGame = useMindiBotGame();
  const onlineGame = useOnlineMindi();

  const rtc = useWebRTC(
    gameMode === 'online' ? onlineGame.socket : null,
    gameMode === 'online' ? onlineGame.roomId : null
  );

  const activeGame = gameMode === 'online' ? onlineGame : localGame;
  const status = gameMode === 'online' ? onlineGame.status : (localGame.gameState?.status || 'idle');

  useEffect(() => {
    if (gameMode === 'local' && !activeGame.gameState) {
      localGame.startGame();
    }
  }, [gameMode, activeGame.gameState, localGame]);

  const handleLeaveOrBack = () => {
    if (gameMode === 'online') {
      onlineGame.leaveRoom();
      rtc.leaveVoiceChat();
    }
    setGameMode(null);
    setJoinCode('');
  };

  const handlePlayAgain = () => {
    if (gameMode === 'local') {
      localGame.resetGame();
    } else {
      onlineGame.requestRestart();
    }
  };

  const isPlaying = activeGame.gameState && (status === 'selecting_trump' || status === 'playing' || status === 'trick_complete' || status === 'finished');

  return (
    <div className={`min-h-screen bg-slate-900 text-white flex flex-col items-center p-4 font-sans overflow-x-hidden relative selection:bg-amber-500/30 ${isPlaying ? 'max-sm:portrait:fixed max-sm:portrait:inset-0 max-sm:portrait:w-[100dvh] max-sm:portrait:h-[100dvw] max-sm:portrait:rotate-90 max-sm:portrait:origin-top-left max-sm:portrait:translate-x-[100dvw] max-sm:portrait:z-[9999]' : ''}`}>
      
      {/* Background decoration */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-green-600/10 blur-[120px] rounded-full mix-blend-screen"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-600/10 blur-[120px] rounded-full mix-blend-screen"></div>
      </div>

      {(gameMode === 'local' || (gameMode === 'online' && onlineGame.roomId)) && (
        <>
          <div className="fixed top-2 sm:top-4 left-2 sm:left-4 z-50 flex items-center gap-2 sm:gap-4">
            <button
              onClick={handleLeaveOrBack}
              className="flex items-center justify-center gap-1 sm:gap-2 w-8 h-8 sm:w-auto sm:h-auto sm:px-4 sm:py-2.5 bg-slate-900/50 sm:bg-slate-900/90 hover:bg-slate-800 backdrop-blur-md text-slate-200 hover:text-white text-sm font-bold rounded-full sm:rounded-xl border border-white/10 shadow-xl transition-all duration-300 hover:scale-105 active:scale-95"
              title={gameMode === 'online' ? 'Leave Room' : 'Go Back'}
            >
              ← <span className="hidden sm:inline">{gameMode === 'online' ? 'Leave' : 'Back'}</span>
            </button>
            
            {status !== 'idle' && status !== 'waiting' && (
              <button
                onClick={handlePlayAgain}
                disabled={gameMode === 'online' && onlineGame.restartRequested}
                className={`flex items-center justify-center gap-1 sm:gap-2 w-8 h-8 sm:w-auto sm:h-auto sm:px-4 sm:py-2.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-sm font-bold rounded-full sm:rounded-xl border border-amber-500/30 shadow-xl transition-all duration-300 ${(gameMode === 'online' && onlineGame.restartRequested) ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95'}`}
                title="Restart Game"
              >
                ↻ <span className="hidden sm:inline">{gameMode === 'online' && onlineGame.restartRequested ? `Waiting (${onlineGame.restartAcceptedCount}/4)` : 'Restart'}</span>
              </button>
            )}
          </div>

          <GameHeader 
            gameMode={gameMode}
            roomId={onlineGame.roomId}
            playerSymbol="M" // Dummy symbol for header
            status={status}
            rtc={rtc}
          />
        </>
      )}

      <main className={`relative z-10 w-full max-w-5xl flex flex-col items-center ${isPlaying ? 'max-sm:h-full max-sm:flex-1 max-sm:justify-center' : 'mt-12 sm:mt-16'}`}>
        
        {/* Title */}
        <div className={`mb-6 text-center animate-in fade-in slide-in-from-top-8 duration-700 ${isPlaying ? 'max-sm:hidden' : ''}`}>
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-widest text-transparent bg-clip-text bg-gradient-to-br from-amber-200 via-yellow-400 to-orange-500 drop-shadow-sm mb-2">
            MINDI COAT
          </h1>
          <p className="text-slate-400 text-sm sm:text-base font-medium tracking-wide">
            Classic 4-Player Strategy
          </p>
        </div>

        {!gameMode && (
          <div className="mt-4 flex justify-center w-full">
            <ModeSelection 
              gameName="Mindi Coat"
              onLocal={() => setGameMode('local')}
              onOnline={() => { setGameMode('online'); onlineGame.connect(); }}
            />
          </div>
        )}
        
        {gameMode === 'online' && !onlineGame.roomId && (
          <OnlineLobby 
            status={onlineGame.status}
            error={onlineGame.error}
            joinCode={joinCode}
            setJoinCode={setJoinCode}
            onCreateRoom={onlineGame.createRoom}
            onJoinRoom={onlineGame.joinRoom}
            onConnectRetry={onlineGame.connect}
            onBack={() => setGameMode(null)}
          />
        )}

        {/* Online Waiting Lobby */}
        {gameMode === 'online' && status === 'waiting' && (
          <div className="flex flex-col items-center gap-4 py-12 w-full max-w-md animate-in slide-in-from-bottom-4 duration-500">
             <div className="text-xl font-semibold mb-2">Players Joined: {onlineGame.players.length} / 4</div>
             <div className="w-full bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col gap-2">
               {[0,1,2,3].map(i => (
                 <div key={i} className="flex items-center gap-3 bg-black/20 p-2 rounded-lg">
                   <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${i < onlineGame.players.length ? 'bg-emerald-500 text-emerald-950' : 'bg-slate-700 text-slate-500'}`}>
                     {i < onlineGame.players.length ? '✓' : '?'}
                   </div>
                   <span className={i < onlineGame.players.length ? 'text-white font-medium' : 'text-slate-500'}>
                     {i < onlineGame.players.length ? (i === 0 ? 'Host (Creator)' : `Player ${i+1}`) : 'Waiting...'}
                   </span>
                 </div>
               ))}
             </div>
             
             {onlineGame.players.length === 4 ? (
               <button 
                 onClick={onlineGame.startGame}
                 disabled={onlineGame.players[0] !== sessionStorage.getItem('gamebord_player_id')} // Only host can start. (Hack for host check without storing socket ID specifically)
                 className="w-full py-3 mt-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 rounded-xl font-bold transition-all disabled:opacity-50"
               >
                 {onlineGame.players[0] === sessionStorage.getItem('gamebord_player_id') ? 'Start Game' : 'Waiting for host to start...'}
               </button>
             ) : (
               <div className="flex items-center gap-2 mt-4 text-amber-400">
                  <div className="w-5 h-5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
                  <span>Waiting for more players...</span>
               </div>
             )}
          </div>
        )}

        {/* Main Game Interface */}
        {activeGame.gameState && (status === 'selecting_trump' || status === 'playing' || status === 'trick_complete' || status === 'finished') && (
          <div className="w-full flex flex-col items-center animate-in slide-in-from-bottom-4 duration-500">
            
            {/* Action Bar */}
            {gameMode === 'local' && localGame.botActionMessage && (
              <div className="mb-2 sm:mb-4 h-6 sm:h-8 flex items-center justify-center w-full">
                <span className="text-amber-300 font-medium animate-pulse text-sm sm:text-base">{localGame.botActionMessage}</span>
              </div>
            )}

            <MindiTable 
              gameState={activeGame.gameState}
              mySeat={gameMode === 'online' ? onlineGame.mySeat : 0}
              onPlayCard={activeGame.playCard}
              onSetTrump={activeGame.setTrump}
              onRevealTrump={activeGame.revealTrump}
            />

            {/* Finished state actions (Restart) */}
            {status === 'finished' && (
              <div className="mt-8 flex flex-col items-center gap-4 animate-in slide-in-from-bottom-4">
                {gameMode === 'local' ? (
                  <button onClick={handlePlayAgain} className="px-8 py-3 bg-amber-500 hover:bg-amber-400 text-amber-950 font-black rounded-xl transition-all shadow-[0_0_15px_rgba(245,158,11,0.4)]">
                    Play Again
                  </button>
                ) : (
                  <>
                    <button onClick={handlePlayAgain} disabled={onlineGame.restartRequested} className="px-8 py-3 bg-amber-500 hover:bg-amber-400 disabled:bg-slate-700 disabled:text-slate-400 text-amber-950 font-black rounded-xl transition-all shadow-[0_0_15px_rgba(245,158,11,0.4)]">
                      {onlineGame.restartRequested ? `Waiting for others (${onlineGame.restartAcceptedCount}/4)...` : 'Request Rematch'}
                    </button>
                  </>
                )}
              </div>
            )}
            
          </div>
        )}
      </main>
    </div>
  );
}
