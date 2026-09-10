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
import Link from 'next/link';

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
      <Link href="/" className="mt-8 text-slate-400 hover:text-white transition-colors flex items-center gap-2">
        ← Back to Game Hub
      </Link>
    </div>
  );

  const handleLeaveOrBack = () => {
    if (gameMode === 'online') {
      onlineGame.leaveRoom();
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

  // Render logic
  // When game is active, shrink the hero title to save space
  const isInGame = status === 'playing' || status === 'finished';

  return (
    <div className="min-h-screen bg-[#0f172a] text-white flex flex-col items-center p-3 sm:p-4 font-sans overflow-x-hidden relative selection:bg-cyan-500/30">
      
      {/* Background decoration */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-cyan-600/20 blur-[120px] rounded-full mix-blend-screen"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-600/20 blur-[120px] rounded-full mix-blend-screen"></div>
        <div className="absolute top-[20%] right-[20%] w-[30%] h-[30%] bg-purple-600/10 blur-[100px] rounded-full mix-blend-screen"></div>
      </div>

      <div className="relative z-10 w-full max-w-2xl flex flex-col items-center">
        
        {/* Header — small during game, big when on menu */}
        {!isInGame && (
          <div className="mb-8 text-center animate-in fade-in slide-in-from-top-8 duration-700">
            <div className="inline-block relative">
              <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-cyan-300 via-blue-500 to-purple-600 drop-shadow-sm mb-2">
                BINGO
              </h1>
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400 to-blue-500 blur opacity-20 -z-10 rounded-full"></div>
            </div>
            <p className="text-slate-400 text-lg sm:text-xl font-medium tracking-wide">
              Classic 5x5 Strategy Game
            </p>
          </div>
        )}

        {/* Dynamic Content */}
        {!gameMode && renderModeSelection()}
        
        {gameMode === 'online' && ['lobby', 'disconnected', 'connected', 'connecting', 'idle'].includes(status) && (
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

        {/* Waiting for opponent to join (room creator) */}
        {gameMode === 'online' && status === 'waiting' && (
          <div className="flex flex-col items-center gap-4 animate-in slide-in-from-bottom-4 duration-500 w-full">
            {/* Compact top bar */}
            <div className="w-full flex items-center justify-between gap-2">
              <button onClick={handleLeaveOrBack} className="text-slate-400 hover:text-white transition-colors text-sm flex items-center gap-1">
                ← Leave
              </button>
              <GameHeader 
                gameMode={gameMode}
                roomId={onlineGame.roomId}
                playerSymbol={onlineGame.playerSymbol}
                status="setup"
                rtc={rtc}
              />
            </div>
            <div className="flex flex-col items-center gap-3 py-12">
              <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-slate-300 text-lg font-semibold">Waiting for opponent to join...</p>
              <p className="text-slate-500 text-sm">Share your Room Code with a friend</p>
            </div>
          </div>
        )}

        {/* Board Setup */}
        {gameMode && status === 'setup' && (
          <div className="w-full flex flex-col items-center animate-in slide-in-from-bottom-4 duration-500">
            {/* Compact top bar */}
            <div className="w-full flex items-center gap-2 mb-3">
              <button
                onClick={handleLeaveOrBack}
                className="flex items-center gap-1 px-3 py-1.5 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-semibold rounded-lg border border-white/10 transition-all flex-shrink-0"
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
            </div>

            {/* Opponent status messages */}
            {gameMode === 'online' && onlineGame.opponentLeft && (
              <div className="mb-3 w-full p-2.5 bg-red-500/20 border border-red-500/40 rounded-lg text-red-200 text-sm text-center">
                ⚠️ Opponent left the room.
              </div>
            )}
            {gameMode === 'online' && !onlineGame.opponentJoined && !onlineGame.opponentLeft && (
              <div className="mb-3 text-yellow-300 animate-pulse text-sm text-center">Waiting for opponent to join...</div>
            )}
            {gameMode === 'online' && onlineGame.opponentJoined && !onlineGame.opponentReady && onlineGame.humanBoard && (
              <div className="mb-3 text-cyan-300 animate-pulse text-sm text-center">Opponent is setting up their board...</div>
            )}
            {gameMode === 'online' && onlineGame.opponentJoined && !onlineGame.humanBoard && (
              <div className="mb-3 text-green-300 text-sm text-center">✅ Opponent joined! Create your board below.</div>
            )}
            
            {!(gameMode === 'online' && onlineGame.humanBoard) && (
              <BingoSetup onComplete={(board) => {
                if (gameMode === 'local') localGame.startGame(board);
                else onlineGame.submitBoard(board);
              }} />
            )}
          </div>
        )}

        {/* ===== PLAYING / FINISHED ===== */}
        {(status === 'playing' || status === 'finished') && (
          <div className="w-full flex flex-col items-center animate-in slide-in-from-bottom-4 duration-500">

            {/* ── Compact top bar ── */}
            <div className="w-full flex items-center gap-2 mb-2">
              <button
                onClick={handleLeaveOrBack}
                className="flex items-center gap-1 px-3 py-1.5 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-semibold rounded-lg border border-white/10 transition-all flex-shrink-0"
              >
                ← {gameMode === 'online' ? 'Leave' : 'Back'}
              </button>
              <GameHeader 
                gameMode={gameMode}
                roomId={onlineGame.roomId}
                playerSymbol={activeGame.playerSymbol}
                status={onlineGame.status}
                rtc={rtc}
              />
            </div>

            {/* ── Status + Last Called Number row ── */}
            <div className="w-full flex items-center justify-between gap-3 mb-3">
              {/* Turn status pill */}
              <div className={`flex-1 text-center py-1.5 rounded-full text-sm font-bold border transition-all duration-300 ${
                status === 'playing'
                  ? (isMyTurn
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-[0_0_12px_rgba(34,211,238,0.3)] animate-pulse'
                      : 'bg-white/5 text-slate-400 border-white/10')
                  : 'bg-transparent border-transparent'
              }`}>
                {status === 'playing' ? turnMessage : (
                  <span className={`text-lg font-black ${
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

              {/* Last called number bubble */}
              {activeGame.calledNumbers?.length > 0 && (
                <div className="flex flex-col items-center flex-shrink-0">
                  <span className="text-[10px] text-slate-500 uppercase tracking-widest mb-0.5">Last</span>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-lg font-black text-white shadow-[0_0_14px_rgba(34,211,238,0.6)] animate-in zoom-in duration-300">
                    {activeGame.calledNumbers[activeGame.calledNumbers.length - 1]}
                  </div>
                </div>
              )}
            </div>

            {/* ── Boards ── */}
            <div className="flex flex-col md:flex-row gap-6 items-start w-full justify-center">
              {/* Your Board */}
              <div className="flex flex-col items-center">
                <span className="text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-widest">Your Board</span>
                
                {/* B I N G O indicator */}
                <div className="flex gap-1.5 mb-2">
                  {['B', 'I', 'N', 'G', 'O'].map((letter, index) => {
                    const myLines = activeGame.humanBoard ? getCompletedLines(activeGame.humanBoard, activeGame.calledNumbers).count : 0;
                    const isLit = myLines > index;
                    return (
                      <div 
                        key={index} 
                        className={`w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-md font-black text-sm sm:text-base transition-all duration-500 ${
                          isLit 
                            ? 'bg-yellow-400 text-slate-900 shadow-[0_0_12px_rgba(250,204,21,0.8)] scale-110' 
                            : 'bg-white/5 text-slate-500 border border-white/10'
                        }`}
                      >
                        {letter}
                      </div>
                    );
                  })}
                </div>

                <BingoBoard 
                  board={activeGame.humanBoard} 
                  calledNumbers={activeGame.calledNumbers}
                  isInteractive={isMyTurn && status === 'playing'}
                  onNumberClick={(num) => activeGame.callNumber(num)}
                  isOpponentBoard={false}
                />
              </div>

              {/* Opponent Board — only at game end */}
              {status === 'finished' && (
                <div className="flex flex-col items-center animate-in fade-in duration-700">
                  <span className="text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-widest">
                    {gameMode === 'local' ? "Bot's Board" : "Opponent's Board"}
                  </span>

                  <div className="flex gap-1.5 mb-2">
                    {['B', 'I', 'N', 'G', 'O'].map((letter, index) => {
                      const oppBoard = gameMode === 'local' ? activeGame.botBoard : activeGame.opponentBoard;
                      const oppLines = oppBoard ? getCompletedLines(oppBoard, activeGame.calledNumbers).count : 0;
                      const isLit = oppLines > index;
                      return (
                        <div 
                          key={index} 
                          className={`w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-md font-black text-sm sm:text-base transition-all duration-500 ${
                            isLit 
                              ? 'bg-red-500 text-white shadow-[0_0_12px_rgba(239,68,68,0.8)] scale-110' 
                              : 'bg-black/20 text-slate-600 border border-white/5'
                          }`}
                        >
                          {letter}
                        </div>
                      );
                    })}
                  </div>

                  <BingoBoard 
                    board={gameMode === 'local' ? activeGame.botBoard : activeGame.opponentBoard} 
                    calledNumbers={activeGame.calledNumbers}
                    isInteractive={false}
                    onNumberClick={() => {}}
                    isOpponentBoard={true}
                  />
                </div>
              )}
            </div>

            {/* Post-Game Controls */}
            {status === 'finished' && (
              <div className="mt-6 flex gap-4 animate-in slide-in-from-bottom-4 duration-500">
                <button
                  onClick={() => {
                    if (gameMode === 'local') activeGame.resetGame();
                    else activeGame.requestRestart();
                  }}
                  className="group relative px-8 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 rounded-xl font-bold shadow-[0_0_20px_rgba(34,211,238,0.3)] hover:shadow-[0_0_30px_rgba(34,211,238,0.5)] transition-all duration-300 hover:scale-105 active:scale-95 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
                  <span className="relative z-10 flex items-center gap-2">
                    🔄 Play Again
                  </span>
                </button>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}

