"use client";

import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { useGame } from '../../games/tictactoe/hooks/useGame';
import { useOnlineGame } from '../../games/tictactoe/hooks/useOnlineGame';
import { useWebRTC } from '../../shared/hooks/useWebRTC';
import Board from '../../games/tictactoe/components/Board';
import OnlineLobby from '../../shared/components/OnlineLobby';
import GameHeader from '../../shared/components/GameHeader';
import ModeSelection from '../../shared/components/ModeSelection';

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
  const getStatusDisplay = () => {
    if (gameMode === 'online' && onlineGame.opponentDisconnected) {
      return (
        <div className="text-xl text-orange-400 animate-pulse text-center">
          ⚠️ Opponent disconnected.<br/>
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
        winnerText = winner === 'X' ? 'You Lose! 💀' : 'You Win! 🎉';
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
        <div className="text-2xl sm:text-3xl font-bold text-slate-300 animate-in slide-in-from-bottom-2 fade-in duration-300 text-center">
          Oops! Better luck next time! 🍀<br/>
          <span className="text-lg text-slate-400">Try again!</span>
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
        {!gameMode && (
          <div className="mt-8 flex justify-center w-full">
            <ModeSelection 
              gameName="Suni Chokdi"
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

        {(gameMode === 'local' || (gameMode === 'online' && onlineGame.roomId)) && (
          <div className="w-full flex flex-col items-center animate-in slide-in-from-bottom-4 duration-500 mt-10">
            {/* Top Bar Fixed Controls */}
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

            {/* Controls (Moved to top) */}

          </div>
        )}
      </main>
    </div>
  );
}
