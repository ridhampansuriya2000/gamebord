import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';

const getPlayerId = () => {
  if (typeof window !== 'undefined') {
    let pid = localStorage.getItem('gamebord_player_id');
    if (!pid) {
      pid = 'player_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('gamebord_player_id', pid);
    }
    return pid;
  }
  return 'default_id';
};

export const useOnlineMindi = () => {
  const [socket, setSocket] = useState(null);
  const [roomId, setRoomId] = useState(null);
  const [mySeat, setMySeat] = useState(null);
  const [players, setPlayers] = useState([]);
  
  const [gameState, setGameState] = useState(null);
  
  const [status, setStatus] = useState('idle'); // idle, connecting, connected, waiting, playing, finished
  const [error, setError] = useState(null);
  
  const [restartRequested, setRestartRequested] = useState(false);
  const [restartAcceptedCount, setRestartAcceptedCount] = useState(0);

  const socketRef = useRef(null);

  const connect = () => {
    if (!socketRef.current) {
      setStatus('connecting');
      const playerId = getPlayerId();
      const newSocket = io(SOCKET_URL, {
        query: { playerId },
        reconnection: true,
      });
      setSocket(newSocket);
      socketRef.current = newSocket;
      setupListeners(newSocket);
    }
  };

  const setupListeners = (socket) => {
    socket.on('connect', () => {
      setStatus('connected');
      setError(null);
    });

    socket.on('connect_error', () => {
      setError(`Could not connect to server.`);
      setStatus('disconnected');
    });

    socket.on('room-created', ({ roomId }) => {
      setRoomId(roomId);
      setStatus('waiting');
      setPlayers([getPlayerId()]); // Creator is first
    });

    socket.on('player-joined', ({ roomId, players }) => {
      setRoomId(roomId);
      setStatus('waiting');
      setPlayers(players);
    });

    socket.on('opponent-joined', ({ players }) => {
      setPlayers(players);
    });

    socket.on('mindi-game-state', (state) => {
      setGameState(state);
      setMySeat(state.mySeat);
      if (state.status) {
        setStatus(state.status === 'selecting_trump' || state.status === 'playing' || state.status === 'trick_complete' ? 'playing' : state.status);
      }
      setRestartRequested(false);
      setRestartAcceptedCount(0);
    });
    
    socket.on('mindi-trump-revealed', ({ suit }) => {
       // Optional: play sound or show toast
    });

    socket.on('mindi-restart-requested', ({ accepted, total }) => {
      setRestartRequested(true);
      setRestartAcceptedCount(accepted);
    });

    socket.on('error', ({ message }) => {
      setError(message);
      setTimeout(() => setError(null), 3000);
    });
  };

  const createRoom = () => {
    if (socket) socket.emit('create-room', { gameType: 'mindi' });
  };

  const joinRoom = (id) => {
    if (socket) socket.emit('join-room', { roomId: id });
  };

  const startGame = () => {
    if (socket && roomId) socket.emit('mindi-start-game', { roomId });
  };

  const setTrump = (cardId) => {
    if (socket && roomId) socket.emit('mindi-set-trump', { roomId, cardId });
  };
  
  const revealTrump = () => {
    if (socket && roomId) socket.emit('mindi-reveal-trump', { roomId });
  };

  const playCard = (cardId) => {
    if (socket && roomId) socket.emit('mindi-play-card', { roomId, cardId });
  };

  const requestRestart = () => {
    if (socket && roomId) {
      socket.emit('mindi-request-restart', { roomId });
      setRestartRequested(true);
    }
  };

  const leaveRoom = () => {
    if (socket && roomId) socket.emit('leave-room', { roomId });
    setRoomId(null);
    setStatus('connected');
    setGameState(null);
    setPlayers([]);
  };

  useEffect(() => {
    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, []);

  return {
    roomId,
    players,
    mySeat,
    gameState,
    status,
    error,
    restartRequested,
    restartAcceptedCount,
    socket,
    connect,
    createRoom,
    joinRoom,
    startGame,
    setTrump,
    revealTrump,
    playCard,
    requestRestart,
    leaveRoom
  };
};
