"use client";

import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { useBingoGame } from '../../games/bingo/hooks/useBingoGame';
import { useOnlineBingo } from '../../games/bingo/hooks/useOnlineBingo';
import { useWebRTC } from '../../shared/hooks/useWebRTC';
import BingoBoard from '../../games/bingo/components/BingoBoard';
import BingoSetup from '../../games/bingo/components/BingoSetup';
import { getCompletedLines } from '../../games/bingo/models/BingoLogic';
import OnlineLobby from '../../shared/components/OnlineLobby';
import GameHeader from '../../shared/components/GameHeader';
import ModeSelection from '../../shared/components/ModeSelection';

export default function BingoHome() {
  const [gameMode, setGameMode] = useState(null); // 'local' or 'online'
  const [joinCode, setJoinCode] = useState('');

  // Local Game Hook
  const localGame = useBingoGame();
  
  // Online Game Hook
  const onlineGame = useOnlineBingo();

  // WebRTC Voice Chat Hook
  const rtc = useWebRTC(onlineGame.socket, onlineGame.roomId);

  // Determine which hook to use based on mode
  const activeGame = gameMode === 'online' ? onlineGame : localGame;

  // Trigger confetti when a player wins
  useEffect(() => {
    if (activeGame.winner && activeGame.winner !== 'Draw') {
      let isWinner = false;
      if (gameMode === 'local') {
        isWinner = activeGame.winner === 'human'; 
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

  const handleLeaveOrBack = () => {
    if (gameMode === 'online') {
      onlineGame.leaveRoom();
      rtc.stopVoiceChat?.();
    } else {
      localGame.resetGame();
    }
    setGameMode(null);
  };

  // Determine game states
  let status = activeGame.status;
  if (gameMode === 'online' && status === 'waiting') status = 'setup';

  let turnMessage = '';
  let isMyTurn = false;
  if (status === 'playing') {
    if (gameMode === 'local') {
      isMyTurn = activeGame.isHumanTurn;
      turnMessage = isMyTurn ? 'Your Turn' : "Bot's Turn";
    } else {
      isMyTurn = activeGame.currentTurn === activeGame.playerSymbol;
      turnMessage = isMyTurn ? 'Your Turn' : "Opponent's Turn";
    }
  }

  const renderRestartControls = () => {
    if (status !== 'finished') return null;

    if (gameMode === 'local') {
      return (
        <button
          onClick={activeGame.resetGame}
          className="group relative px-8 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 rounded-xl font-bold shadow-[0_0_20px_rgba(34,211,238,0.3)] hover:shadow-[0_0_30px_rgba(34,211,238,0.5)] transition-all duration-300 hover:scale-105 active:scale-95 overflow-hidden"
        >
          <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
          <span className="relative z-10 flex items-center gap-2">
            🔄 Play Again
          </span>
        </button>
      );
    }

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
        className="group relative px-8 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 rounded-xl font-bold shadow-[0_0_20px_rgba(34,211,238,0.3)] hover:shadow-[0_0_30px_rgba(34,211,238,0.5)] transition-all duration-300 hover:scale-105 active:scale-95 overflow-hidden"
      >
        <span className="relative z-10 flex items-center gap-2">
          Request Restart
        </span>
      </button>
    );
  };

  // Render logic
  const renderBingoWord = (board, isLitFn) => (
    <div className="flex flex-col items-center gap-1 sm:gap-2">
      <span className="hidden sm:block text-[11px] font-semibold text-transparent select-none uppercase tracking-widest">BINGO</span>
      <div className="flex flex-row sm:flex-col gap-1.5 sm:gap-2 sm:p-3 sm:p-4 sm:rounded-xl sm:border sm:border-transparent sm:h-full sm:justify-between w-full justify-center">
        {['B', 'I', 'N', 'G', 'O'].map((letter, index) => {
          const linesCount = board ? getCompletedLines(board, activeGame.calledNumbers).count : 0;
          const isLit = isLitFn ? isLitFn(linesCount, index) : linesCount > index;
          return (
            <div 
              key={index} 
              className={`w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 flex items-center justify-center rounded-md font-black text-sm sm:text-base transition-all duration-500 ${
                isLit 
                  ? (isLitFn ? 'bg-red-500 text-white shadow-[0_0_12px_rgba(239,68,68,0.8)] scale-110' : 'bg-yellow-400 text-slate-900 shadow-[0_0_12px_rgba(250,204,21,0.8)] scale-110')
                  : 'bg-white/5 text-slate-500 border border-white/10'
              }`}
            >
              {letter}
            </div>
          );
        })}
      </div>
    </div>
  );

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
        
        {/* Title — ALWAYS VISIBLE as requested */}
        <div className="mb-6 text-center animate-in fade-in slide-in-from-top-8 duration-700">
          <div className="inline-block relative">
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-cyan-300 via-blue-500 to-purple-600 drop-shadow-sm mb-1">
              BINGO
            </h1>
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400 to-blue-500 blur opacity-20 -z-10 rounded-full"></div>
          </div>
          <p className="text-slate-400 text-base sm:text-lg font-medium tracking-wide">
            Classic 5x5 Strategy Game
          </p>
        </div>

        {/* Dynamic Content */}
        {!gameMode && (
          <div className="mt-4 flex justify-center w-full">
            <ModeSelection 
              gameName="Bingo"
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

        {/* Setup / Waiting / Playing / Finished Screens */}
        {(status === 'waiting' || status === 'setup' || status === 'playing' || status === 'finished') && (
          <div className="w-full flex flex-col items-center animate-in slide-in-from-bottom-4 duration-500">

            {/* Waiting State */}
            {gameMode === 'online' && status === 'waiting' && (
              <div className="flex flex-col items-center gap-3 py-12">
                <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-slate-300 text-lg font-semibold">Waiting for opponent to join...</p>
                <p className="text-slate-500 text-sm">Share your Room Code with a friend</p>
              </div>
            )}

            {/* Setup State */}
            {gameMode && status === 'setup' && (
              <div className="w-full flex flex-col items-center mt-4">
                {/* Opponent status messages */}
                {gameMode === 'online' && onlineGame.opponentLeft && (
                  <div className="mb-4 w-full p-2.5 bg-red-500/20 border border-red-500/40 rounded-lg text-red-200 text-sm text-center">
                    ⚠️ Opponent left the room.
                  </div>
                )}
                {gameMode === 'online' && !onlineGame.opponentJoined && !onlineGame.opponentLeft && (
                  <div className="mb-4 text-yellow-300 animate-pulse text-sm text-center">Waiting for opponent to join...</div>
                )}
                {gameMode === 'online' && onlineGame.opponentJoined && !onlineGame.opponentReady && onlineGame.humanBoard && (
                  <div className="mb-4 text-cyan-300 animate-pulse text-sm text-center">Opponent is setting up their board...</div>
                )}
                {gameMode === 'online' && onlineGame.opponentJoined && !onlineGame.humanBoard && (
                  <div className="mb-4 text-green-300 text-sm text-center">✅ Opponent joined! Create your board below.</div>
                )}
                
                {!(gameMode === 'online' && onlineGame.humanBoard) && (
                  <BingoSetup onComplete={(board) => {
                    if (gameMode === 'local') localGame.startGame(board);
                    else onlineGame.submitBoard(board);
                  }} />
                )}
              </div>
            )}

            {/* Playing / Finished State */}
            {(status === 'playing' || status === 'finished') && (
              <div className="w-full flex flex-col items-center mt-4">
                
                {/* ── Status Banner (Not Full Width) ── */}
                <div className="flex justify-center mb-8">
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
                          ? "Oops! Try once more 🍀"
                          : (gameMode === 'local'
                              ? (activeGame.winner === 'human' ? 'You Win! 🎉' : 'You Lose! 💀')
                              : (activeGame.winner === activeGame.playerSymbol ? 'You Win! 🎉' : 'You Lose! 💀')
                            )
                        }
                      </span>
                    )}
                  </div>
                </div>

                {/* ── Boards Layout ── */}
                <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-center justify-center w-full">
                  
                  {/* Your Area (Left side) */}
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 md:gap-6 items-center sm:items-start">
                    {/* 3. Your BINGO Word (Top on mobile, Right on Desktop) */}
                    <div className="sm:hidden">{renderBingoWord(activeGame.humanBoard, null)}</div>

                    {/* 4. Your Board */}
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">Your Board</span>
                      <BingoBoard 
                        board={activeGame.humanBoard} 
                        calledNumbers={activeGame.calledNumbers}
                        isInteractive={isMyTurn && status === 'playing'}
                        onNumberClick={(num) => activeGame.callNumber(num)}
                        isOpponentBoard={false}
                      />
                    </div>

                    <div className="hidden sm:block">{renderBingoWord(activeGame.humanBoard, null)}</div>
                  </div>

                  {/* Opponent Area (Right side, Finished Only) */}
                  {status === 'finished' && (
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 md:gap-6 items-center sm:items-start">
                      {/* 2. Bot/Opponent BINGO Word (Top on mobile, Left on Desktop) */}
                      {renderBingoWord(gameMode === 'local' ? activeGame.botBoard : activeGame.opponentBoard, (lines, idx) => lines > idx)}

                      {/* 1. Opponent Board */}
                      <div className="flex flex-col items-center gap-2">
                        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">
                          {gameMode === 'local' ? "Bot's Board" : "Opponent's Board"}
                        </span>
                        <BingoBoard 
                          board={gameMode === 'local' ? activeGame.botBoard : activeGame.opponentBoard} 
                          calledNumbers={activeGame.calledNumbers}
                          isInteractive={false}
                          onNumberClick={() => {}}
                          isOpponentBoard={true}
                        />
                      </div>
                    </div>
                  )}

                </div>

                {/* Post-Game Controls */}
                {status === 'finished' && (
                  <div className="mt-10 flex gap-4 animate-in slide-in-from-bottom-4 duration-500">
                    {renderRestartControls()}
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
