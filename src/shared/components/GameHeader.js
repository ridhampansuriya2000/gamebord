'use client';
import React, { useState } from 'react';

/**
 * Compact shared GameHeader for all online games.
 * Shows: [← Leave] [RoomCode 📋] [Player badge] ... [voice controls]
 * All controls are icon-first, minimal text to keep vertical space low.
 */
export default function GameHeader({ gameMode, roomId, playerSymbol, status, rtc, onLeave }) {
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
    <div className="w-full flex items-center justify-between gap-2 px-3 py-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl mb-3">
      
      {/* Left: Room code + player badge */}
      <div className="flex items-center gap-2 min-w-0">
        {/* Room code */}
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 group"
          title="Copy Room Code"
        >
          <span className="font-mono text-sm sm:text-base font-bold tracking-widest text-cyan-400 group-hover:text-cyan-300 transition-colors">
            {roomId}
          </span>
          <span className="text-xs transition-all">
            {copied ? '✅' : '📋'}
          </span>
        </button>

        {/* Divider */}
        <span className="text-white/20 text-xs">|</span>

        {/* Player symbol badge */}
        {playerSymbol && (
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
            playerSymbol === 'X'
              ? 'text-rose-300 bg-rose-500/15 border-rose-500/30'
              : 'text-cyan-300 bg-cyan-500/15 border-cyan-500/30'
          }`}>
            P{playerSymbol}
          </span>
        )}
      </div>

      {/* Right: Voice controls */}
      {inGame ? (
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {/* Opponent voice indicator */}
          {rtc.opponentVoiceActive && (
            <span
              className="w-2 h-2 bg-green-400 rounded-full shadow-[0_0_6px_rgba(74,222,128,0.9)] animate-pulse"
              title="Opponent is in voice"
            />
          )}

          {/* Voice error */}
          {rtc.voiceError && (
            <span className="text-xs text-red-400" title={rtc.voiceError}>⚠️</span>
          )}

          {!rtc.isVoiceActive ? (
            /* Join voice */
            <button
              onClick={startVoice}
              title="Join Voice Chat"
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 transition-all"
            >
              <span>🎤</span>
              <span className="hidden sm:inline">Join Voice</span>
            </button>
          ) : (
            <div className="flex items-center gap-1">
              {/* Mute/Unmute mic */}
              <button
                onClick={rtc.toggleMic ?? rtc.toggleMute}
                title={rtc.isMicMuted ? 'Unmute Mic' : 'Mute Mic'}
                className={`p-1.5 rounded-lg text-sm border transition-all ${
                  rtc.isMicMuted
                    ? 'bg-red-500/30 text-red-300 border-red-500/50 hover:bg-red-500/40'
                    : 'bg-white/10 text-white border-white/20 hover:bg-white/20'
                }`}
              >
                {rtc.isMicMuted ? '🔇' : '🎙️'}
              </button>

              {/* Mute/Unmute speaker */}
              <button
                onClick={rtc.toggleSpeaker}
                title={rtc.isSpeakerMuted ? 'Unmute Speaker' : 'Mute Speaker'}
                className={`p-1.5 rounded-lg text-sm border transition-all ${
                  rtc.isSpeakerMuted
                    ? 'bg-orange-500/30 text-orange-300 border-orange-500/50 hover:bg-orange-500/40'
                    : 'bg-white/10 text-white border-white/20 hover:bg-white/20'
                }`}
              >
                {rtc.isSpeakerMuted ? '🔈' : '🔊'}
              </button>

              {/* Leave voice */}
              <button
                onClick={stopVoice}
                title="Leave Voice Chat"
                className="p-1.5 rounded-lg text-sm border bg-red-500/20 text-red-300 border-red-500/40 hover:bg-red-500/30 transition-all"
              >
                📵
              </button>
            </div>
          )}

          {/* Hidden audio to play opponent voice */}
          {rtc.remoteAudioRef && <audio ref={rtc.remoteAudioRef} autoPlay />}
        </div>
      ) : (
        /* Waiting indicator */
        <div className="flex items-center gap-1.5 text-xs text-yellow-300">
          <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-pulse" />
          <span className="hidden sm:inline">Waiting...</span>
        </div>
      )}
    </div>
  );
}
