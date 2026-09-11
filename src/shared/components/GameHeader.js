'use client';
import React, { useState } from 'react';

/**
 * Compact shared GameHeader — fixed top-right bar for all online games.
 * Shows: [RoomCode 📋] [Player badge] ... [voice controls]
 */
export default function GameHeader({ gameMode, roomId, playerSymbol, status, rtc }) {
  if (gameMode !== 'online') return null;

  const [copied, setCopied] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const startVoice = rtc.startVoice ?? rtc.startVoiceChat;
  const stopVoice = rtc.stopVoice ?? rtc.stopVoiceChat;
  const inGame = status === 'playing' || status === 'finished' || status === 'setup';

  const handleCopy = () => {
    navigator.clipboard.writeText(roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      <button 
        onClick={() => setMenuOpen(!menuOpen)}
        className="sm:hidden fixed top-3 right-3 z-[110] p-2 bg-slate-800/90 backdrop-blur-md rounded-lg border border-white/10 shadow-xl text-white"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          {menuOpen ? (
            <><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></>
          ) : (
            <><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></>
          )}
        </svg>
      </button>

      <div className={`fixed top-14 sm:top-4 right-3 sm:right-4 z-[100] flex flex-col sm:flex-row items-end sm:items-center justify-end gap-2 sm:gap-3 px-3 py-2 sm:px-4 sm:py-2.5 bg-slate-900/95 sm:bg-slate-900/90 backdrop-blur-md border border-white/10 rounded-xl shadow-xl max-w-[calc(100vw-1.5rem)] sm:max-w-none transition-all duration-300 origin-top-right ${menuOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none sm:scale-100 sm:opacity-100 sm:pointer-events-auto'}`}>
      
      {/* Left: Room code + player badge */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <button
          onClick={handleCopy}
          className="flex items-center gap-2 group hover:opacity-80 transition-opacity"
          title="Copy Room Code"
        >
          <span className="font-mono text-sm sm:text-base font-bold tracking-widest text-cyan-400">
            {roomId}
          </span>
          <span className="text-slate-400 group-hover:text-cyan-300 transition-colors">
            {copied ? (
              <span className="text-sm">✅</span>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
            )}
          </span>
        </button>

        <span className="text-white/15 select-none">|</span>

        {playerSymbol && (
          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border flex-shrink-0 ${
            playerSymbol === 'X'
              ? 'text-rose-300 bg-rose-500/15 border-rose-500/30'
              : 'text-cyan-300 bg-cyan-500/15 border-cyan-500/30'
          }`}>
            PO {playerSymbol}
          </span>
        )}
      </div>

      {/* Right: Voice controls */}
      {inGame && (
        <div className="flex items-center gap-2 flex-shrink-0 ml-1">
          {rtc.opponentVoiceActive && (
            <span className="text-lg animate-pulse drop-shadow-[0_0_8px_rgba(74,222,128,0.8)]" title="Opponent is in voice">🎧</span>
          )}

          {rtc.voiceError && (
            <span title={rtc.voiceError} className="text-red-400 text-sm flex-shrink-0">⚠️</span>
          )}

          {!rtc.isVoiceActive ? (
            <button
              onClick={startVoice}
              title="Join Voice Chat"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 transition-all"
            >
              <span className="text-base">🎤</span>
              <span className="hidden sm:inline">Join Voice</span>
            </button>
          ) : (
            <div className="flex items-center gap-1.5">
              <button
                onClick={rtc.toggleMic ?? rtc.toggleMute}
                title={rtc.isMicMuted ? 'Unmute Mic' : 'Mute Mic'}
                className={`w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-lg border transition-all text-base sm:text-lg ${
                  rtc.isMicMuted
                    ? 'bg-red-500/25 text-red-300 border-red-500/40 hover:bg-red-500/35'
                    : 'bg-white/8 text-slate-200 border-white/15 hover:bg-white/15'
                }`}
              >
                {rtc.isMicMuted ? (
                  <div className="relative inline-flex items-center justify-center">
                    🎙️
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-[3px] bg-red-400 -rotate-45 shadow-sm rounded-full"></div>
                  </div>
                ) : '🎙️'}
              </button>

              <button
                onClick={rtc.toggleSpeaker}
                title={rtc.isSpeakerMuted ? 'Unmute Speaker' : 'Mute Speaker'}
                className={`w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-lg border transition-all text-base sm:text-lg ${
                  rtc.isSpeakerMuted
                    ? 'bg-orange-500/25 text-orange-300 border-orange-500/40 hover:bg-orange-500/35'
                    : 'bg-white/8 text-slate-200 border-white/15 hover:bg-white/15'
                }`}
              >
                {rtc.isSpeakerMuted ? '🔇' : '🔊'}
              </button>

              <button
                onClick={stopVoice}
                title="Leave Voice"
                className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-lg border bg-red-500/20 text-red-300 border-red-500/30 hover:bg-red-500/30 transition-all text-base sm:text-lg"
              >
                📵
              </button>
            </div>
          )}

          {rtc.remoteAudioRef && <audio ref={rtc.remoteAudioRef} autoPlay />}
        </div>
      )}
      </div>
    </>
  );
}
