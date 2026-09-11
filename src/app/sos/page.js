'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';

import { useSOSGame } from '@/games/sos/hooks/useSOSGame';
import { useOnlineSOS } from '@/games/sos/hooks/useOnlineSOS';
import { useWebRTC } from '@/shared/hooks/useWebRTC';

import ModeSelection from '@/shared/components/ModeSelection';
import OnlineLobby from '@/shared/components/OnlineLobby';
import GameHeader from '@/shared/components/GameHeader';
import SOSBoard from '@/games/sos/components/SOSBoard';

export default function SOSPage() {
  const [gameMode, setGameMode] = useState(null); // 'local' | 'online' | null
  const [joinCode, setJoinCode] = useState('');
  const [currentSymbol, setCurrentSymbol] = useState('S'); // For the user to select 'S' or 'O'

  const localGame = useSOSGame();
  const onlineGame = useOnlineSOS();

  const rtc = useWebRTC(
    gameMode === 'online' ? onlineGame.roomId : null,
    gameMode === 'online' ? onlineGame.playerSymbol : null
  );

  const activeGame = gameMode === 'online' ? onlineGame : localGame;
  const status = activeGame.status;

  // Local game starts automatically when mode is selected
  useEffect(() => {
    if (gameMode === 'local' && status === 'setup') {
      localGame.startGame();
    }
  }, [gameMode, status, localGame]);

  const handleLeaveOrBack = () => {
    if (gameMode === 'online') {
      onlineGame.leaveRoom();
      rtc.leaveVoiceChat();
    } else {
      localGame.resetGame();
    }
    setGameMode(null);
    setJoinCode('');
  };

  const handleCellClick = (index) => {
    activeGame.makeMove(index, currentSymbol);
  };

  // Determine whose turn it is textually
  let turnMessage = '';
  let isMyTurn = false;
  if (gameMode === 'local') {
    isMyTurn = activeGame.isHumanTurn;
    turnMessage = isMyTurn ? "Your Turn" : "Bot's Turn";
  } else if (gameMode === 'online') {
    isMyTurn = activeGame.currentTurn === activeGame.playerSymbol;
    turnMessage = isMyTurn ? "Your Turn" : "Opponent's Turn";
  }

  // Handle Play Again logic
  const handlePlayAgain = () => {
    if (gameMode === 'local') {
      localGame.startGame();
    } else {
      onlineGame.requestRestart();
    }
  };

  const renderSymbolSelector = () => {
    if (status !== 'playing' || !isMyTurn) return null;
    return (
      <div className="flex flex-col items-center gap-2 mb-4 animate-in fade-in zoom-in duration-300">
        <span className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Select Symbol</span>
        <div className="flex bg-slate-800/50 p-1 rounded-xl border border-white/10 shadow-lg">
          <button
            onClick={() => setCurrentSymbol('S')}
            className={`w-14 h-12 rounded-lg font-black text-xl transition-all ${
              currentSymbol === 'S' 
                ? 'bg-cyan-500 text-white shadow-[0_0_15px_rgba(34,211,238,0.5)]' 
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            S
          </button>
          <button
            onClick={() => setCurrentSymbol('O')}
            className={`w-14 h-12 rounded-lg font-black text-xl transition-all ${
              currentSymbol === 'O' 
                ? 'bg-rose-500 text-white shadow-[0_0_15px_rgba(244,63,94,0.5)]' 
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            O
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-white flex flex-col items-center justify-center p-4 font-sans overflow-x-hidden relative selection:bg-cyan-500/30">
      
      {/* Background decoration */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-cyan-600/20 blur-[120px] rounded-full mix-blend-screen"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-600/20 blur-[120px] rounded-full mix-blend-screen"></div>
        <div className="absolute top-[20%] right-[20%] w-[30%] h-[30%] bg-purple-600/10 blur-[100px] rounded-full mix-blend-screen"></div>
      </div>

      {/* Fixed UI elements across the screen top */}
      {(gameMode === 'local' || (gameMode === 'online' && onlineGame.roomId)) && (
        <>
          <button
            onClick={handleLeaveOrBack}
            className="fixed top-4 left-4 z-50 flex items-center gap-2 px-4 py-2.5 bg-slate-900/90 hover:bg-slate-800 backdrop-blur-md text-slate-200 hover:text-white text-sm font-bold rounded-xl border border-white/10 shadow-xl transition-all duration-300 hover:scale-105 active:scale-95"
          >
            ← {gameMode === 'online' ? 'Leave' : 'Back'}
          </button>
          <GameHeader 
            gameMode={gameMode}
            roomId={onlineGame.roomId}
            playerSymbol={onlineGame.playerSymbol}
            status={onlineGame.status}
            rtc={rtc}
          />
        </>
      )}

      <main className="relative z-10 w-full max-w-4xl flex flex-col items-center">
        
        {/* Title */}
        <div className="mb-6 text-center animate-in fade-in slide-in-from-top-8 duration-700">
          <div className="inline-block relative">
            <h1 className="text-5xl sm:text-7xl font-extrabold tracking-widest text-transparent bg-clip-text bg-gradient-to-br from-rose-400 via-fuchsia-500 to-indigo-500 drop-shadow-sm mb-2">
              S-O-S
            </h1>
            <div className="absolute -inset-1 bg-gradient-to-r from-rose-400 to-indigo-500 blur opacity-20 -z-10 rounded-full"></div>
          </div>
          <p className="text-slate-400 text-base sm:text-lg font-medium tracking-wide">
            Classic Line Strategy Game
          </p>
        </div>

        {/* Dynamic Content */}
        {!gameMode && (
          <div className="mt-4 flex justify-center w-full">
            <ModeSelection 
              gameName="SOS"
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

        {(status === 'waiting' || status === 'playing' || status === 'finished') && (
          <div className="w-full flex flex-col items-center animate-in slide-in-from-bottom-4 duration-500">

            {/* Waiting State */}
            {gameMode === 'online' && status === 'waiting' && (
              <div className="flex flex-col items-center gap-3 py-12">
                <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-slate-300 text-lg font-semibold">Waiting for opponent to join...</p>
                <p className="text-slate-500 text-sm">Share your Room Code with a friend</p>
              </div>
            )}

            {/* Playing / Finished State */}
            {(status === 'playing' || status === 'finished') && (
              <div className="w-full flex flex-col items-center mt-4">
                
                {/* Scoreboard */}
                <div className="flex items-center gap-8 mb-8 bg-slate-800/40 p-4 rounded-2xl border border-white/5 shadow-xl">
                   <div className="flex flex-col items-center">
                      <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest mb-1">You</span>
                      <span className="text-4xl font-black text-white">{gameMode === 'local' ? localGame.scores.human : onlineGame.scores[onlineGame.playerSymbol]}</span>
                   </div>
                   <div className="w-px h-12 bg-white/10"></div>
                   <div className="flex flex-col items-center">
                      <span className="text-xs font-bold text-rose-400 uppercase tracking-widest mb-1">{gameMode === 'local' ? 'Bot' : 'Opponent'}</span>
                      <span className="text-4xl font-black text-white">{gameMode === 'local' ? localGame.scores.bot : onlineGame.scores[onlineGame.playerSymbol === 'X' ? 'O' : 'X']}</span>
                   </div>
                </div>

                {/* Status Banner */}
                <div className="flex justify-center mb-6">
                  <div className={`px-6 py-2.5 rounded-full text-base font-bold border transition-all duration-300 inline-block ${
                    status === 'playing'
                      ? (isMyTurn
                          ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-[0_0_12px_rgba(34,211,238,0.3)] animate-pulse'
                          : 'bg-white/5 text-slate-400 border-white/10')
                      : 'bg-transparent border-transparent'
                  }`}>
                    {status === 'playing' ? turnMessage : (
                      <span className={`text-xl font-black ${
                        activeGame.winner === (gameMode === 'local' ? 'human' : activeGame.playerSymbol)
                          ? 'text-green-400 drop-shadow-[0_0_12px_rgba(74,222,128,0.8)]'
                          : activeGame.winner === 'Draw'
                            ? 'text-slate-300'
                            : 'text-red-400 drop-shadow-[0_0_12px_rgba(239,68,68,0.8)]'
                      }`}>
                        {activeGame.winner === 'Draw'
                          ? "It's a Draw!"
                          : activeGame.winner === (gameMode === 'local' ? 'human' : activeGame.playerSymbol)
                            ? 'You Won!'
                            : 'You Lost!'}
                      </span>
                    )}
                  </div>
                </div>

                {/* Main Game Area */}
                <div className="flex flex-col items-center justify-center w-full">
                  
                  {renderSymbolSelector()}

                  <div className="flex flex-col items-center gap-2">
                    <SOSBoard 
                      board={activeGame.board} 
                      isInteractive={isMyTurn && status === 'playing'}
                      onNumberClick={handleCellClick}
                      currentSymbol={currentSymbol}
                    />
                  </div>
                </div>

                {/* Finished State Controls */}
                {status === 'finished' && (
                  <div className="mt-10 animate-in slide-in-from-bottom-4 duration-500 w-full max-w-sm flex flex-col items-center gap-4">
                    
                    {gameMode === 'online' && onlineGame.opponentRequestedRestart && !onlineGame.iRequestedRestart && (
                      <div className="bg-cyan-900/40 border border-cyan-500/30 p-4 rounded-xl text-center w-full shadow-[0_0_15px_rgba(6,182,212,0.15)] animate-pulse">
                        <p className="text-cyan-100 font-medium mb-3">Opponent wants to play again!</p>
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={onlineGame.acceptRestart}
                            className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-cyan-950 font-bold rounded-lg transition-colors"
                          >
                            Accept
                          </button>
                          <button
                            onClick={onlineGame.declineRestart}
                            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition-colors"
                          >
                            Decline
                          </button>
                        </div>
                      </div>
                    )}

                    {gameMode === 'online' && onlineGame.iRequestedRestart && !onlineGame.opponentRequestedRestart && !onlineGame.restartDeclined && (
                      <div className="text-slate-400 text-sm font-medium animate-pulse bg-white/5 px-4 py-2 rounded-full">
                        Waiting for opponent to accept...
                      </div>
                    )}

                    {gameMode === 'online' && onlineGame.restartDeclined && (
                      <div className="text-rose-400 text-sm font-medium bg-rose-500/10 px-4 py-2 rounded-full border border-rose-500/20">
                        Opponent declined to play again.
                      </div>
                    )}

                    {(!onlineGame.iRequestedRestart || gameMode === 'local') && !(gameMode === 'online' && onlineGame.opponentRequestedRestart) && (
                      <button
                        onClick={handlePlayAgain}
                        className="w-full py-3.5 px-6 rounded-xl font-black text-lg bg-gradient-to-r from-emerald-400 to-teal-500 text-emerald-950 hover:from-emerald-300 hover:to-teal-400 hover:scale-[1.02] active:scale-95 transition-all shadow-[0_0_20px_rgba(52,211,153,0.3)]"
                      >
                        {gameMode === 'online' ? 'Request Play Again' : 'Play Again'}
                      </button>
                    )}

                    <button
                      onClick={handleLeaveOrBack}
                      className="text-slate-400 hover:text-white font-medium text-sm transition-colors mt-2"
                    >
                      Return to Game Hub
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
