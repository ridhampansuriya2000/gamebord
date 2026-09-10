import React from 'react';

export default function OnlineLobby({
  status,
  error,
  joinCode,
  setJoinCode,
  onCreateRoom,
  onJoinRoom,
  onConnectRetry,
  onBack
}) {
  const isConnecting = status === 'idle' || status === 'connecting';
  const isDisconnected = status === 'disconnected';

  return (
    <div className="flex flex-col items-center gap-6 animate-in slide-in-from-bottom-4 duration-500 w-full max-w-sm">
      <div className="flex w-full justify-between items-center mb-2">
        <h2 className="text-2xl font-semibold text-slate-200">Online Lobby</h2>
        <button onClick={onBack} className="text-slate-400 hover:text-white transition-colors">
          ← Back
        </button>
      </div>

      {error && (
        <div className="w-full p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-center animate-in shake flex flex-col gap-2">
          <span className="font-bold">Connection Failed</span>
          <span className="text-sm">{error}</span>
          {error.includes('Could not connect to') && onConnectRetry && (
            <button onClick={onConnectRetry} className="mt-2 px-4 py-2 bg-red-500/30 hover:bg-red-500/50 rounded-md text-sm transition-all">
              Retry Connection
            </button>
          )}
        </div>
      )}

      {isConnecting && !error ? (
        <div className="text-slate-400 animate-pulse my-8 flex flex-col items-center gap-3">
          <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
          Connecting to Multiplayer Server...
        </div>
      ) : !isDisconnected ? (
        <div className="flex flex-col w-full gap-4">
          <button
            onClick={onCreateRoom}
            className="w-full py-3 px-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 rounded-xl transition-all font-bold shadow-[0_0_15px_rgba(16,185,129,0.4)] hover:shadow-[0_0_25px_rgba(16,185,129,0.6)]"
          >
            Create New Room
          </button>
          
          <div className="flex items-center gap-3 my-2 opacity-50">
            <div className="flex-1 h-px bg-white"></div>
            <span className="text-sm uppercase tracking-widest">or</span>
            <div className="flex-1 h-px bg-white"></div>
          </div>

          <div className="flex flex-col gap-3">
            <input
              type="text"
              placeholder="Enter Room Code"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-center text-xl tracking-[0.25em] font-mono text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 uppercase transition-colors"
              maxLength={6}
            />
            <button
              onClick={() => onJoinRoom(joinCode)}
              disabled={!joinCode || joinCode.length < 6}
              className="w-full py-3 px-6 bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-md rounded-xl border border-white/20 transition-all font-semibold shadow-lg active:scale-95 text-lg"
            >
              Join Room
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
