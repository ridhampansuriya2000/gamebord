"use client";

import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { useGame } from '../hooks/useGame';
import { useOnlineGame } from '../hooks/useOnlineGame';
import { useWebRTC } from '../hooks/useWebRTC';
import Board from '../components/Board';

export default function Home() {
  const [gameMode, setGameMode] = useState(null); // 'local' or 'online'
  const [joinCode, setJoinCode] = useState('');

  // Local Game Hook
  const localGame = useGame();
  
  // Online Game Hook
  const onlineGame = useOnlineGame();

  // WebRTC Voice Chat Hook
  const rtc = useWebRTC(onlineGame.socket, onlineGame.roomId);

  // Determine which hook to use based on mode
  const activeGame = gameMode === 'online' ? onlineGame : localGame;

  // Trigger confetti when a player wins
  useEffect(() => {
    if (activeGame.winner && activeGame.winner !== 'Draw') {
      let isWinner = false;
      if (gameMode === 'local') {
        isWinner = activeGame.winner === 'O'; // Human is O
      } else {
        isWinner = activeGame.winner === activeGame.playerSymbol;
      }

      if (isWinner) {
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#34D399', '#38BDF8', '#FBBF24', '#F472B6']
        });
      }
    }
  }, [activeGame.winner, gameMode, activeGame.playerSymbol]);

  // Render Helpers
  const renderModeSelection = () => (
    <div className="flex flex-col items-center gap-6 animate-in zoom-in-95 duration-500">
      <h2 className="text-2xl font-semibold text-slate-200 mb-4">Select Game Mode</h2>
      <button
        onClick={() => setGameMode('local')}
        className="w-64 py-4 px-6 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-xl border border-white/20 shadow-lg transition-all hover:scale-105 active:scale-95 text-xl font-bold flex items-center justify-center gap-3 group"
      >
        <span className="text-cyan-400 group-hover:drop-shadow-[0_0_10px_rgba(34,211,238,0.8)] transition-all">👤</span> 
        Play vs Bot
      </button>
      <button
        onClick={() => {
          setGameMode('online');
          onlineGame.connect();
        }}
        className="w-64 py-4 px-6 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-xl border border-white/20 shadow-lg transition-all hover:scale-105 active:scale-95 text-xl font-bold flex items-center justify-center gap-3 group"
      >
        <span className="text-rose-400 group-hover:drop-shadow-[0_0_10px_rgba(251,113,133,0.8)] transition-all">🌐</span>
        Play Online
      </button>
    </div>
  );

  const renderOnlineLobby = () => {
    const isConnecting = onlineGame.status === 'idle' || onlineGame.status === 'connecting';
    const isDisconnected = onlineGame.status === 'disconnected';

    return (
      <div className="flex flex-col items-center gap-6 animate-in slide-in-from-bottom-4 duration-500 w-full max-w-sm">
        <div className="flex w-full justify-between items-center mb-2">
          <h2 className="text-2xl font-semibold text-slate-200">Online Lobby</h2>
          <button onClick={() => setGameMode(null)} className="text-slate-400 hover:text-white transition-colors">
            ← Back
          </button>
        </div>

        {onlineGame.error && (
          <div className="w-full p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-center animate-in shake flex flex-col gap-2">
            <span className="font-bold">Connection Failed</span>
            <span className="text-sm">{onlineGame.error}</span>
            <span className="text-xs mt-2 text-red-300">Did you add NEXT_PUBLIC_SOCKET_URL in your hosting platform (Vercel)?</span>
            <button onClick={onlineGame.connect} className="mt-2 px-4 py-2 bg-red-500/30 hover:bg-red-500/50 rounded-md text-sm transition-all">
              Retry Connection
            </button>
          </div>
        )}

        {isConnecting && !onlineGame.error ? (
          <div className="text-slate-400 animate-pulse my-8 flex flex-col items-center gap-3">
            <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
            Connecting to Multiplayer Server...
          </div>
        ) : isDisconnected && !onlineGame.error ? (
          <div className="text-orange-400 animate-pulse my-8">Disconnected from server.</div>
        ) : !onlineGame.error && (
          <>
            <button
              onClick={onlineGame.createRoom}
              className="w-full py-4 px-6 bg-gradient-to-r from-rose-500/20 to-orange-500/20 hover:from-rose-500/30 hover:to-orange-500/30 backdrop-blur-md rounded-xl border border-rose-500/30 shadow-lg transition-all hover:scale-[1.02] active:scale-95 text-lg font-bold"
            >
              Create New Room
            </button>

            <div className="flex items-center w-full gap-4 my-2">
              <div className="h-px bg-white/10 flex-1"></div>
              <span className="text-slate-400 text-sm">OR</span>
              <div className="h-px bg-white/10 flex-1"></div>
            </div>

            <div className="w-full flex flex-col gap-3">
              <input
                type="text"
                placeholder="Enter Room Code"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                maxLength={6}
                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-center text-xl tracking-[0.25em] font-mono text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50 transition-colors uppercase"
              />
              <button
                onClick={() => onlineGame.joinRoom(joinCode)}
                disabled={joinCode.length < 3}
                className="w-full py-3 px-6 bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:hover:bg-white/10 backdrop-blur-md rounded-xl border border-white/20 shadow-lg transition-all active:scale-95 text-lg font-bold"
              >
                Join Room
              </button>
            </div>
          </>
        )}
      </div>
    );
  };

  const renderGameHeader = () => {
    if (gameMode === 'online') {
      return (
        <div className="flex items-center justify-between w-full mb-6 px-2">
          <div className="flex flex-col">
            <span className="text-xs text-slate-400 uppercase tracking-wider">Room Code</span>
            <span className="font-mono text-xl text-cyan-400 font-bold tracking-widest">{onlineGame.roomId}</span>
          </div>

          {/* Voice Chat Controls */}
          {onlineGame.status === 'playing' || onlineGame.status === 'finished' ? (
             <div className="flex items-center gap-2">
               {rtc.voiceError && <span className="text-xs text-red-400 mr-2">{rtc.voiceError}</span>}
               
               {!rtc.isVoiceActive ? (
                 <button 
                   onClick={rtc.startVoiceChat}
                   className="px-3 py-1.5 bg-green-500/20 border border-green-500/50 rounded-lg text-sm font-medium hover:bg-green-500/30 transition-colors flex items-center gap-2"
                 >
                   <span>🎤</span> Join Voice
                 </button>
               ) : (
                 <div className="flex items-center gap-2 bg-black/20 rounded-lg p-1 border border-white/10">
                   <button 
                     onClick={rtc.toggleMute}
                     className={`p-2 rounded-md transition-colors ${rtc.isMuted ? 'bg-red-500/50 hover:bg-red-500/70' : 'bg-white/10 hover:bg-white/20'}`}
                   >
                     {rtc.isMuted ? '🔇' : '🎙️'}
                   </button>
                   <button 
                     onClick={rtc.stopVoiceChat}
                     className="p-2 bg-red-500/20 hover:bg-red-500/40 rounded-md transition-colors text-xs font-bold"
                   >
                     Disconnect
                   </button>
                 </div>
               )}
               {/* Hidden audio element to play remote voice */}
               <audio ref={rtc.remoteAudioRef} autoPlay />
             </div>
          ) : null}

          <div className="flex flex-col items-end">
            <span className="text-xs text-slate-400 uppercase tracking-wider">You are</span>
            <span className={`text-xl font-bold ${onlineGame.playerSymbol === 'X' ? 'text-rose-400' : 'text-cyan-400'}`}>
              Player {onlineGame.playerSymbol}
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  const getStatusDisplay = () => {
    if (gameMode === 'online' && onlineGame.status === 'waiting') {
      return (
        <div className="text-xl text-slate-300 animate-pulse text-center">
          Waiting for opponent to join...<br/>
          <span className="text-sm text-slate-500">Share your room code: {onlineGame.roomId}</span>
        </div>
      );
    }

    if (gameMode === 'online' && onlineGame.opponentDisconnected) {
      return (
        <div className="text-xl text-orange-400 animate-pulse text-center">
          Opponent disconnected.<br/>
          <span className="text-sm">Waiting for reconnection...</span>
        </div>
      );
    }

    const winner = activeGame.winner;
    const draw = activeGame.draw;
    
    if (winner) {
      let winnerText = '';
      let isWin = false;
      
      if (gameMode === 'local') {
        isWin = winner === 'O'; // Human is O
        winnerText = winner === 'X' ? 'Bot Wins!' : 'You Win! 🎉';
      } else {
        isWin = winner === activeGame.playerSymbol;
        winnerText = isWin ? 'You Win! 🎉' : 'Opponent Wins! 💀';
      }
      
      return (
        <div className={`text-3xl sm:text-4xl font-black animate-in zoom-in-110 fade-in duration-500 ${isWin ? 'text-green-400 drop-shadow-[0_0_15px_rgba(74,222,128,0.8)]' : 'text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.8)]'}`}>
          {winnerText}
        </div>
      );
    }
    
    if (draw) {
      return (
        <div className="text-3xl font-bold text-slate-300 animate-in slide-in-from-bottom-2 fade-in duration-300">
          It's a Draw! 🤝
        </div>
      );
    }

    // Ongoing game
    let turnText = '';
    let isMyTurn = false;
    let symbol = '';

    if (gameMode === 'local') {
      isMyTurn = activeGame.isHumanTurn;
      turnText = isMyTurn ? 'Your Turn (O)' : 'Bot is thinking...';
      symbol = isMyTurn ? 'O' : 'X';
    } else {
      isMyTurn = activeGame.currentTurn === activeGame.playerSymbol;
      turnText = isMyTurn ? 'Your Turn' : "Opponent's Turn";
      symbol = activeGame.currentTurn;
    }

    return (
      <div className="text-xl text-slate-200">
        <span className="flex items-center justify-center gap-2">
          <span className={`w-3 h-3 rounded-full animate-pulse ${symbol === 'X' ? 'bg-rose-400' : 'bg-cyan-400'}`}></span>
          {turnText}
        </span>
      </div>
    );
  };

  const renderRestartControls = () => {
    if (!activeGame.winner && !activeGame.draw) return null;

    if (gameMode === 'local') {
      return (
        <button
          onClick={activeGame.resetGame}
          className="group relative px-5 py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white font-semibold rounded-xl border border-white/20 transition-all duration-300 hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] animate-in slide-in-from-right-2 fade-in duration-300"
        >
          <span className="relative z-10 flex items-center gap-2 whitespace-nowrap">
            Play Again
          </span>
        </button>
      );
    }

    // Online Mode Restart Logic
    if (onlineGame.opponentRequestedRestart) {
      return (
        <div className="flex flex-col items-center gap-2 animate-in slide-in-from-bottom-2 fade-in duration-300">
          <span className="text-sm text-yellow-300 animate-pulse">Opponent wants to play again!</span>
          <div className="flex gap-2">
            <button
              onClick={onlineGame.acceptRestart}
              className="px-4 py-2 bg-green-500/20 hover:bg-green-500/40 border border-green-500/50 text-white rounded-lg transition-all"
            >
              Accept
            </button>
            <button
              onClick={onlineGame.declineRestart}
              className="px-4 py-2 bg-red-500/20 hover:bg-red-500/40 border border-red-500/50 text-white rounded-lg transition-all"
            >
              Decline
            </button>
          </div>
        </div>
      );
    }

    if (onlineGame.restartDeclined) {
      return (
        <div className="px-5 py-2.5 bg-red-500/20 border border-red-500/50 text-red-200 rounded-xl">
          Opponent declined.
        </div>
      );
    }

    if (onlineGame.iRequestedRestart) {
      return (
        <div className="px-5 py-2.5 bg-white/5 border border-white/10 text-slate-300 rounded-xl animate-pulse">
          Waiting for opponent to accept...
        </div>
      );
    }

    return (
      <button
        onClick={onlineGame.requestRestart}
        className="group relative px-5 py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white font-semibold rounded-xl border border-white/20 transition-all duration-300 hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)]"
      >
        <span className="relative z-10 flex items-center gap-2 whitespace-nowrap">
          Request Restart
        </span>
      </button>
    );
  };

  const handleLeaveOrBack = () => {
    if (gameMode === 'online') {
      rtc.stopVoiceChat();
      onlineGame.leaveRoom();
    } else {
      activeGame.resetGame();
      setGameMode(null);
    }
  };

  // Determine if board interaction is allowed
  let isBoardDisabled = false;
  if (gameMode === 'local') {
    isBoardDisabled = !activeGame.isHumanTurn;
  } else {
    isBoardDisabled = activeGame.status !== 'playing' || activeGame.currentTurn !== activeGame.playerSymbol || activeGame.opponentDisconnected;
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-slate-900 via-purple-900 to-slate-900 flex flex-col items-center justify-center p-4 font-sans text-white">

      <main className="flex flex-col items-center max-w-lg w-full relative">
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight mb-2 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-rose-400 drop-shadow-sm">
            Suni Chokdi
          </h1>
          {gameMode === 'online' ? (
             <p className="text-slate-300 text-lg">Online Multiplayer</p>
          ) : gameMode === 'local' ? (
             <p className="text-slate-300 text-lg">Human vs Unbeatable Bot</p>
          ) : (
             <p className="text-slate-400 text-sm">Select a mode to begin</p>
          )}
        </div>

        {/* View Routing */}
        {!gameMode && renderModeSelection()}
        
        {gameMode === 'online' && !onlineGame.roomId && renderOnlineLobby()}

        {(gameMode === 'local' || (gameMode === 'online' && onlineGame.roomId)) && (
          <div className="w-full flex flex-col items-center animate-in slide-in-from-bottom-4 duration-500">
            {renderGameHeader()}

            {/* Game Status */}
            <div className="min-h-[4rem] flex flex-col items-center justify-center gap-4 mb-4 w-full">
              {getStatusDisplay()}
              {renderRestartControls()}
            </div>

            {/* Game Board */}
            <div className={`mb-10 w-full flex justify-center transition-opacity duration-300 ${onlineGame.opponentDisconnected ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
              <Board
                board={activeGame.board}
                onCellClick={gameMode === 'online' ? activeGame.makeMove : activeGame.handleCellClick}
                isHumanTurn={!isBoardDisabled} 
                winner={activeGame.winner}
                winningLine={activeGame.winningLine}
                draw={activeGame.draw}
              />
            </div>

            {/* Controls */}
            <div className="flex gap-4">
              <button
                onClick={handleLeaveOrBack}
                className="group relative px-6 py-3 bg-black/20 hover:bg-black/40 backdrop-blur-md text-slate-300 hover:text-white font-semibold rounded-xl border border-white/10 transition-all duration-300 hover:scale-105 active:scale-95"
              >
                {gameMode === 'online' ? 'Leave Room' : 'Back to Menu'}
              </button>
            </div>

          </div>
        )}
      </main>
    </div>
  );
}
