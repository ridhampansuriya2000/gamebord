'use client';
import React, { useState } from 'react';

/* ── SVG Icons (no emoji, clean and cross-platform) ── */
const IconCopy = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
  </svg>
);
const IconCheck = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const IconMic = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
    <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
    <line x1="12" y1="19" x2="12" y2="23"/>
    <line x1="8" y1="23" x2="16" y2="23"/>
  </svg>
);
const IconMicOff = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="1" y1="1" x2="23" y2="23"/>
    <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"/>
    <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"/>
    <line x1="12" y1="19" x2="12" y2="23"/>
    <line x1="8" y1="23" x2="16" y2="23"/>
  </svg>
);
const IconVolume = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
    <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/>
  </svg>
);
const IconVolumeOff = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
    <line x1="23" y1="9" x2="17" y2="15"/>
    <line x1="17" y1="9" x2="23" y2="15"/>
  </svg>
);
const IconPhoneOff = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07"/>
    <path d="M14.5 2.5a10 10 0 0 1 7 7"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
    <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55"/>
    <path d="M5 5a10.96 10.96 0 0 0-2.34 6.78 2 2 0 0 0 1.72 2h3a2 2 0 0 0 2-1.72 12.84 12.84 0 0 1 .7-2.81 2 2 0 0 0-.45-2.11L8.09 7.08"/>
  </svg>
);
const IconJoinVoice = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
    <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
    <line x1="12" y1="19" x2="12" y2="23"/>
    <line x1="8" y1="23" x2="16" y2="23"/>
  </svg>
);

/**
 * Compact shared GameHeader — fixed top bar for all online games.
 * Left: [← Back] [RoomCode + copy] [Player badge]
 * Right: voice controls (collapsible on mobile)
 */
export default function GameHeader({ gameMode, roomId, playerSymbol, status, rtc, onLeave }) {
  if (gameMode !== 'online') return null;

  const [copied, setCopied] = useState(false);
  const [voiceMenuOpen, setVoiceMenuOpen] = useState(false);

  const startVoice = rtc.startVoice ?? rtc.startVoiceChat;
  const stopVoice = rtc.stopVoice ?? rtc.stopVoiceChat;
  const inGame = status === 'playing' || status === 'finished' || status === 'setup';

  const handleCopy = () => {
    navigator.clipboard.writeText(roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="w-full flex items-center justify-between gap-2 px-3 py-2 bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-xl">
      
      {/* Left: Room code + player badge */}
      <div className="flex items-center gap-2 min-w-0">
        {/* Room code + copy */}
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 group hover:opacity-80 transition-opacity"
          title="Copy Room Code"
        >
          <span className="font-mono text-sm font-bold tracking-widest text-cyan-400">
            {roomId}
          </span>
          <span className={`transition-colors flex-shrink-0 ${copied ? 'text-green-400' : 'text-slate-500 group-hover:text-cyan-400'}`}>
            {copied ? <IconCheck /> : <IconCopy />}
          </span>
        </button>

        {/* Divider */}
        <span className="text-white/15 select-none">|</span>

        {/* Player badge */}
        {playerSymbol && (
          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border flex-shrink-0 ${
            playerSymbol === 'X'
              ? 'text-rose-300 bg-rose-500/15 border-rose-500/30'
              : 'text-cyan-300 bg-cyan-500/15 border-cyan-500/30'
          }`}>
            Player {playerSymbol}
          </span>
        )}
      </div>

      {/* Right: Voice controls */}
      {inGame && (
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {/* Opponent voice dot indicator */}
          {rtc.opponentVoiceActive && (
            <span
              className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_6px_rgba(74,222,128,0.9)] animate-pulse flex-shrink-0"
              title="Opponent is in voice"
            />
          )}

          {/* Voice error indicator */}
          {rtc.voiceError && (
            <span title={rtc.voiceError} className="text-red-400 text-xs flex-shrink-0">⚠</span>
          )}

          {/* ── Desktop voice controls (sm+) ── */}
          {!rtc.isVoiceActive ? (
            <button
              onClick={startVoice}
              title="Join Voice Chat"
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 transition-all"
            >
              <IconJoinVoice />
              <span>Join Voice</span>
            </button>
          ) : (
            <div className="hidden sm:flex items-center gap-1">
              {/* Mic */}
              <button
                onClick={rtc.toggleMic ?? rtc.toggleMute}
                title={rtc.isMicMuted ? 'Unmute Mic' : 'Mute Mic'}
                className={`p-1.5 rounded-lg border transition-all ${
                  rtc.isMicMuted
                    ? 'bg-red-500/25 text-red-300 border-red-500/40 hover:bg-red-500/35'
                    : 'bg-white/8 text-slate-200 border-white/15 hover:bg-white/15'
                }`}
              >
                {rtc.isMicMuted ? <IconMicOff /> : <IconMic />}
              </button>

              {/* Speaker */}
              <button
                onClick={rtc.toggleSpeaker}
                title={rtc.isSpeakerMuted ? 'Unmute Speaker' : 'Mute Speaker'}
                className={`p-1.5 rounded-lg border transition-all ${
                  rtc.isSpeakerMuted
                    ? 'bg-orange-500/25 text-orange-300 border-orange-500/40 hover:bg-orange-500/35'
                    : 'bg-white/8 text-slate-200 border-white/15 hover:bg-white/15'
                }`}
              >
                {rtc.isSpeakerMuted ? <IconVolumeOff /> : <IconVolume />}
              </button>

              {/* End call */}
              <button
                onClick={stopVoice}
                title="Leave Voice"
                className="p-1.5 rounded-lg border bg-red-500/20 text-red-300 border-red-500/30 hover:bg-red-500/30 transition-all"
              >
                <IconPhoneOff />
              </button>
            </div>
          )}

          {/* ── Mobile: hamburger toggle ── */}
          <button
            onClick={() => setVoiceMenuOpen(v => !v)}
            className="sm:hidden p-1.5 rounded-lg border border-white/15 bg-white/5 text-slate-300 hover:bg-white/10 transition-all relative"
            title="Voice options"
          >
            {/* Show active dot when in voice */}
            {rtc.isVoiceActive && (
              <span className="absolute top-0 right-0 w-1.5 h-1.5 bg-green-400 rounded-full -translate-y-0.5 translate-x-0.5" />
            )}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>
            </svg>
          </button>

          {/* Hidden audio */}
          {rtc.remoteAudioRef && <audio ref={rtc.remoteAudioRef} autoPlay />}
        </div>
      )}

      {/* ── Mobile voice dropdown ── */}
      {inGame && voiceMenuOpen && (
        <div className="absolute top-full right-0 mt-1 z-50 bg-slate-900 border border-white/15 rounded-xl shadow-xl p-2 flex flex-col gap-1.5 min-w-[160px] sm:hidden animate-in slide-in-from-top-2 duration-200">
          {!rtc.isVoiceActive ? (
            <button
              onClick={() => { startVoice(); setVoiceMenuOpen(false); }}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 transition-all"
            >
              <IconJoinVoice /> Join Voice
            </button>
          ) : (
            <>
              <button
                onClick={() => { (rtc.toggleMic ?? rtc.toggleMute)(); }}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm border transition-all ${
                  rtc.isMicMuted
                    ? 'bg-red-500/20 text-red-300 border-red-500/40'
                    : 'bg-white/5 text-slate-200 border-white/10'
                }`}
              >
                {rtc.isMicMuted ? <IconMicOff /> : <IconMic />}
                {rtc.isMicMuted ? 'Unmute Mic' : 'Mute Mic'}
              </button>
              <button
                onClick={() => { rtc.toggleSpeaker?.(); }}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm border transition-all ${
                  rtc.isSpeakerMuted
                    ? 'bg-orange-500/20 text-orange-300 border-orange-500/40'
                    : 'bg-white/5 text-slate-200 border-white/10'
                }`}
              >
                {rtc.isSpeakerMuted ? <IconVolumeOff /> : <IconVolume />}
                {rtc.isSpeakerMuted ? 'Unmute Speaker' : 'Mute Speaker'}
              </button>
              <button
                onClick={() => { stopVoice(); setVoiceMenuOpen(false); }}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm border bg-red-500/20 text-red-300 border-red-500/30 hover:bg-red-500/30 transition-all"
              >
                <IconPhoneOff /> Leave Voice
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
