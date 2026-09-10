"use client";

import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { useBingoGame } from '../../games/bingo/hooks/useBingoGame';
import { useOnlineBingo } from '../../games/bingo/hooks/useOnlineBingo';
import { useWebRTC } from '../../shared/hooks/useWebRTC';
import BingoBoard from '../../games/bingo/components/BingoBoard';
import BingoSetup from '../../games/bingo/components/BingoSetup';
import { getCompletedLines } from '../../games/bingo/models/BingoLogic';
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
            {onlineGame.error.includes('Could not connect to') && (
              <button onClick={onlineGame.connect} className="mt-2 px-4 py-2 bg-red-500/30 hover:bg-red-500/50 rounded-md text-sm transition-all">
                Retry Connection
              </button>
            )}
          </div>
        )}

        {isConnecting && !onlineGame.error ? (
          <div className="text-slate-400 animate-pulse my-8 flex flex-col items-center gap-3">
            <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
            Connecting to Multiplayer Server...
          </div>
        ) : !isDisconnected ? (
          <div className="flex flex-col w-full gap-4">
            <button
              onClick={onlineGame.createRoom}
              className="w-full py-3 px-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 rounded-xl transition-all font-bold shadow-[0_0_15px_rgba(16,185,129,0.4)] hover:shadow-[0_0_25px_rgba(16,185,129,0.6)]"
            >
              Create New Room
            </button>
            
            <div className="flex items-center gap-3 my-2 opacity-50">
              <div className="flex-1 h-px bg-white"></div>
              <span className="text-sm uppercase tracking-widest">or</span>
              <div className="flex-1 h-px bg-white"></div>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter Room Code"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                className="flex-1 bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 uppercase tracking-widest"
                maxLength={6}
              />
              <button
                onClick={() => onlineGame.joinRoom(joinCode)}
                disabled={!joinCode || joinCode.length < 6}
                className="py-3 px-6 bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-md rounded-xl border border-white/20 transition-all font-semibold"
              >
                Join
              </button>
            </div>
          </div>
        ) : null}
      </div>
    );
  };

  const renderGameHeader = () => {
    if (gameMode === 'online') {
      return (
        <div className="flex items-center justify-between w-full mb-6 px-2">
          <div className="flex flex-col">
            <span className="text-xs text-slate-400 uppercase tracking-widest font-semibold mb-1">Room Code</span>
            <div className="flex items-center gap-3">
              <span className="text-3xl font-bold font-mono tracking-widest text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]">
                {onlineGame.roomId}
              </span>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(onlineGame.roomId);
                  // Optional: add a tiny toast here
                }}
                className="p-2 bg-white/5 hover:bg-white/15 rounded-lg border border-white/10 transition-colors"
                title="Copy Room Code"
              >
                📋
              </button>
            </div>
            <span className="text-xs text-slate-400 mt-2">
              Share this code with your friend to play!
            </span>
          </div>

          {/* WebRTC Voice Controls */}
          {(onlineGame.status === 'playing' || onlineGame.status === 'finished' || onlineGame.status === 'setup') ? (
             <div className="flex items-center gap-2">
               {rtc.opponentVoiceActive && (
                 <span className="bg-green-500/20 text-green-300 px-2 py-1.5 rounded-md animate-pulse border border-green-500/30 flex items-center gap-1.5 mr-2" title="Opponent has voice chat enabled">
                   <span className="w-2 h-2 bg-green-400 rounded-full shadow-[0_0_8px_rgba(74,222,128,0.8)]"></span>
                   <span className="text-sm">🎧</span>
                 </span>
               )}
               {rtc.voiceError && <span className="text-xs text-red-400 mr-2">{rtc.voiceError}</span>}
               <button
                 onClick={rtc.isVoiceActive ? rtc.stopVoice : rtc.startVoice}
                 className={`p-2 sm:px-4 sm:py-2 rounded-lg font-semibold text-sm transition-all flex items-center gap-2 border ${
                   rtc.isVoiceActive 
                     ? 'bg-red-500/20 text-red-300 border-red-500/50 hover:bg-red-500/30 shadow-[0_0_10px_rgba(239,68,68,0.3)]' 
                     : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
                 }`}
                 title={rtc.isVoiceActive ? "Mute Microphone" : "Enable Voice Chat"}
               >
                 <span>{rtc.isVoiceActive ? '🎙️' : '🎤'}</span>
                 <span className="hidden sm:inline">{rtc.isVoiceActive ? 'Disable Mic' : 'Enable Voice'}</span>
               </button>
             </div>
          ) : (
             <div className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg">
               <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
               <span className="text-sm text-yellow-200">Waiting for opponent...</span>
             </div>
          )}
        </div>
      );
    }
    return null;
  };

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
  if (gameMode === 'online' && status === 'waiting') status = 'lobby';

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
  return (
    <div className="min-h-screen bg-[#0f172a] text-white flex flex-col items-center justify-center p-4 sm:p-8 font-sans overflow-hidden relative selection:bg-cyan-500/30">
      
      {/* Background decoration */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-cyan-600/20 blur-[120px] rounded-full mix-blend-screen"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-600/20 blur-[120px] rounded-full mix-blend-screen"></div>
        <div className="absolute top-[20%] right-[20%] w-[30%] h-[30%] bg-purple-600/10 blur-[100px] rounded-full mix-blend-screen"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03]"></div>
      </div>

      <div className="relative z-10 w-full max-w-2xl flex flex-col items-center">
        
        {/* Header */}
        <div className="mb-10 sm:mb-16 text-center animate-in fade-in slide-in-from-top-8 duration-700">
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

        {/* Dynamic Content */}
        {!gameMode && renderModeSelection()}
        
        {status === 'lobby' && renderOnlineLobby()}

        {gameMode && status === 'setup' && (
          <div className="w-full flex flex-col items-center animate-in slide-in-from-bottom-4 duration-500">
            {/* Top Back/Leave Button */}
            <div className="w-full flex justify-start mb-4">
              <button
                onClick={handleLeaveOrBack}
                className="group flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 backdrop-blur-md text-slate-300 hover:text-white text-sm font-semibold rounded-lg border border-white/10 transition-all duration-300 hover:scale-105 active:scale-95"
              >
                ← {gameMode === 'online' ? 'Leave Room' : 'Back to Menu'}
              </button>
            </div>
            {renderGameHeader()}
            
            {gameMode === 'online' && onlineGame.humanBoard && !onlineGame.opponentReady && (
              <div className="mb-4 text-yellow-300 animate-pulse">Waiting for opponent to create their board...</div>
            )}
            
            {!(gameMode === 'online' && onlineGame.humanBoard) && (
              <BingoSetup onComplete={(board) => {
                if (gameMode === 'local') localGame.startGame(board);
                else onlineGame.submitBoard(board);
              }} />
            )}
          </div>
        )}

        {(status === 'playing' || status === 'finished') && (
          <div className="w-full flex flex-col items-center animate-in slide-in-from-bottom-4 duration-500">
            {/* Top Back/Leave Button */}
            <div className="w-full flex justify-start mb-4">
              <button
                onClick={handleLeaveOrBack}
                className="group flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 backdrop-blur-md text-slate-300 hover:text-white text-sm font-semibold rounded-lg border border-white/10 transition-all duration-300 hover:scale-105 active:scale-95"
              >
                ← {gameMode === 'online' ? 'Leave Room' : 'Back to Menu'}
              </button>
            </div>

            {renderGameHeader()}

            {/* Game Status */}
            <div className="mb-6 h-12 flex items-center justify-center">
              {status === 'playing' ? (
                <div className={`px-6 py-2 rounded-full font-bold text-lg border transition-all duration-300 ${
                  isMyTurn 
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-[0_0_15px_rgba(34,211,238,0.3)] animate-pulse' 
                    : 'bg-white/5 text-slate-400 border-white/10'
                }`}>
                  {turnMessage}
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-600 animate-in zoom-in spin-in-12 duration-500 drop-shadow-lg">
                    {activeGame.winner === 'Draw' 
                      ? "It's a Draw! 🤝" 
                      : (gameMode === 'local' 
                          ? (activeGame.winner === 'human' ? 'You Win! 🎉' : 'Bot Wins! 💀') 
                          : (activeGame.winner === activeGame.playerSymbol ? 'You Win! 🎉' : 'Opponent Wins! 💀')
                        )
                    }
                  </span>
                </div>
              )}
            </div>

            {/* Last Called Number */}
            {activeGame.calledNumbers.length > 0 && (
              <div className="mb-6 flex flex-col items-center">
                <span className="text-xs text-slate-400 uppercase tracking-widest font-bold mb-1">Called Number</span>
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-3xl font-black text-white shadow-[0_0_20px_rgba(34,211,238,0.6)] animate-in zoom-in duration-300">
                  {activeGame.calledNumbers[activeGame.calledNumbers.length - 1]}
                </div>
              </div>
            )}

            {/* Boards */}
            <div className="flex flex-col md:flex-row gap-8 items-start w-full justify-center">
              <div className="flex flex-col items-center">
                <span className="text-sm font-semibold text-slate-300 mb-2">Your Board</span>
                
                {/* B I N G O Word Indicator */}
                <div className="flex gap-2 mb-3">
                  {['B', 'I', 'N', 'G', 'O'].map((letter, index) => {
                    const myLines = activeGame.humanBoard ? getCompletedLines(activeGame.humanBoard, activeGame.calledNumbers).count : 0;
                    const isLit = myLines > index;
                    return (
                      <div 
                        key={index} 
                        className={`w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg font-black text-xl transition-all duration-500 ${
                          isLit 
                            ? 'bg-yellow-400 text-slate-900 shadow-[0_0_15px_rgba(250,204,21,0.8)] scale-110' 
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

              {/* Only show opponent/bot board when game is finished */}
              {status === 'finished' && (
                <div className="flex flex-col items-center animate-in fade-in duration-700">
                  <span className="text-sm font-semibold text-slate-300 mb-2">
                    {gameMode === 'local' ? "Bot's Board" : "Opponent's Board"}
                  </span>

                  <div className="flex gap-2 mb-3">
                    {['B', 'I', 'N', 'G', 'O'].map((letter, index) => {
                      const oppLines = (gameMode === 'local' ? activeGame.botBoard : activeGame.opponentBoard) 
                        ? getCompletedLines(gameMode === 'local' ? activeGame.botBoard : activeGame.opponentBoard, activeGame.calledNumbers).count 
                        : 0;
                      const isLit = oppLines > index;
                      return (
                        <div 
                          key={index} 
                          className={`w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg font-black text-xl transition-all duration-500 ${
                            isLit 
                              ? 'bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.8)] scale-110' 
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
              <div className="mt-8 flex gap-4 animate-in slide-in-from-bottom-4 duration-500">
                <button
                  onClick={() => {
                    if (gameMode === 'local') activeGame.resetGame();
                    else activeGame.requestRestart();
                  }}
                  className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 rounded-xl font-bold text-lg shadow-[0_0_20px_rgba(34,211,238,0.3)] hover:shadow-[0_0_30px_rgba(34,211,238,0.5)] transition-all duration-300 hover:scale-105 active:scale-95 overflow-hidden"
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
