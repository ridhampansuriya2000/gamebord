import React from 'react';

/**
 * Shared GameHeader for all online games.
 * 
 * @param {string} gameMode - 'local' | 'online'
 * @param {string} roomId - active room ID
 * @param {string} playerSymbol - 'X' | 'O'
 * @param {string} status - current game status
 * @param {object} rtc - result of useWebRTC hook (startVoiceChat, stopVoiceChat, isVoiceActive, ...)
 */
export default function GameHeader({ gameMode, roomId, playerSymbol, status, rtc }) {
  if (gameMode !== 'online') return null;

  // Support both naming conventions from different hooks
  const startVoice = rtc.startVoice ?? rtc.startVoiceChat;
  const stopVoice = rtc.stopVoice ?? rtc.stopVoiceChat;
  const inGame = status === 'playing' || status === 'finished' || status === 'setup';

  return (
    <div className="flex items-center justify-between w-full mb-6 px-2">
      {/* Left: Room Code + Player Badge */}
      <div className="flex flex-col gap-1">
        <span className="text-xs text-slate-400 uppercase tracking-widest font-semibold">Room Code</span>
        <div className="flex items-center gap-2">
          <span className="text-2xl sm:text-3xl font-bold font-mono tracking-widest text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]">
            {roomId}
          </span>
          <button
            onClick={() => navigator.clipboard.writeText(roomId)}
            className="p-1.5 bg-white/5 hover:bg-white/15 rounded-lg border border-white/10 transition-colors"
            title="Copy Room Code"
          >
            📋
          </button>
        </div>
        {playerSymbol && (
          <span className="text-xs text-cyan-200 font-bold bg-cyan-900/40 px-2 py-0.5 rounded-md border border-cyan-800/50 w-max">
            You are Player {playerSymbol}
          </span>
        )}
      </div>

      {/* Right: Voice Controls or Waiting Indicator */}
      {inGame ? (
        <div className="flex items-center gap-2">
          {/* Opponent voice indicator */}
          {rtc.opponentVoiceActive && (
            <span
              className="bg-green-500/20 text-green-300 px-2 py-1.5 rounded-md animate-pulse border border-green-500/30 flex items-center gap-1.5"
              title="Opponent has voice chat enabled"
            >
              <span className="w-2 h-2 bg-green-400 rounded-full shadow-[0_0_8px_rgba(74,222,128,0.8)]"></span>
              <span className="text-sm">🎧</span>
            </span>
          )}

          {/* Error */}
          {rtc.voiceError && (
            <span className="text-xs text-red-400">{rtc.voiceError}</span>
          )}

          {/* Mic toggle button */}
          <button
            onClick={rtc.isVoiceActive ? stopVoice : startVoice}
            className={`p-2 sm:px-4 sm:py-2 rounded-lg font-semibold text-sm transition-all flex items-center gap-2 border ${
              rtc.isVoiceActive
                ? 'bg-red-500/20 text-red-300 border-red-500/50 hover:bg-red-500/30 shadow-[0_0_10px_rgba(239,68,68,0.3)]'
                : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
            }`}
            title={rtc.isVoiceActive ? 'Mute Microphone' : 'Enable Voice Chat'}
          >
            <span>{rtc.isVoiceActive ? '🎙️' : '🎤'}</span>
            <span className="hidden sm:inline">{rtc.isVoiceActive ? 'Disable Mic' : 'Enable Voice'}</span>
          </button>

          {/* Hidden audio element to play remote stream */}
          {rtc.remoteAudioRef && <audio ref={rtc.remoteAudioRef} autoPlay />}
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
