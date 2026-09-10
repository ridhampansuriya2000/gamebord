'use client';
import React, { useState } from 'react';

/**
 * Compact shared GameHeader — fixed top-right bar for all online games.
 * Shows: [RoomCode 📋] [Player badge] ... [voice controls]
 */
export default function GameHeader({ gameMode, roomId, playerSymbol, status, rtc }) {
  if (gameMode !== 'online') return null;

  const [copied, setCopied] = useState(false);

  const startVoice = rtc.startVoice ?? rtc.startVoiceChat;
  const stopVoice = rtc.stopVoice ?? rtc.stopVoiceChat;
  const inGame = status === 'playing' || status === 'finished' || status === 'setup';

  const handleCopy = () => {
    navigator.clipboard.writeText(roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-2.5 bg-slate-900/90 backdrop-blur-md border border-white/10 rounded-xl shadow-xl">
      
      {/* Left: Room code + player badge */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={handleCopy}
          className="flex items-center gap-2 group hover:opacity-80 transition-opacity"
          title="Copy Room Code"
        >
          <span className="font-mono text-base font-bold tracking-widest text-cyan-400">
            {roomId}
          </span>
          <span className="text-lg">
            {copied ? '✅' : '📋'}
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
                className={`w-9 h-9 flex items-center justify-center rounded-lg border transition-all text-lg ${
                  rtc.isMicMuted
                    ? 'bg-red-500/25 text-red-300 border-red-500/40 hover:bg-red-500/35'
                    : 'bg-white/8 text-slate-200 border-white/15 hover:bg-white/15'
                }`}
              >
                {rtc.isMicMuted ? '🔇' : '🎙️'}
              </button>

              <button
                onClick={rtc.toggleSpeaker}
                title={rtc.isSpeakerMuted ? 'Unmute Speaker' : 'Mute Speaker'}
                className={`w-9 h-9 flex items-center justify-center rounded-lg border transition-all text-lg ${
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
                className="w-9 h-9 flex items-center justify-center rounded-lg border bg-red-500/20 text-red-300 border-red-500/30 hover:bg-red-500/30 transition-all text-lg"
              >
                📵
              </button>
            </div>
          )}

          {rtc.remoteAudioRef && <audio ref={rtc.remoteAudioRef} autoPlay />}
        </div>
      )}
    </div>
  );
}
