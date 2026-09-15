import { useState, useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';

export default function useOnlineReverse() {
  const [socket, setSocket] = useState(null);
  const [status, setStatus] = useState('idle'); // idle, connecting, connected, disconnected
  const [error, setError] = useState(null);
  
  const [gameState, setGameState] = useState(null);
  const [mySeat, setMySeat] = useState(null);
  const [joinCode, setJoinCode] = useState('');
  const [players, setPlayers] = useState([]);
  const [playerNames, setPlayerNames] = useState({});
  const [maxPlayers, setMaxPlayers] = useState(4);
  const [restartRequested, setRestartRequested] = useState(false);
  const [restartAcceptedCount, setRestartAcceptedCount] = useState(0);
  
  const currentRoomId = useRef(null);
  
  // Use a stored player ID or generate a temporary one
  const getPlayerId = () => {
    if (typeof window !== 'undefined') {
      let pid = sessionStorage.getItem('reverse_player_id');
      if (!pid) {
        pid = crypto.randomUUID();
        sessionStorage.setItem('reverse_player_id', pid);
      }
      return pid;
    }
    return 'temp-id';
  };

  const initSocket = () => {
    if (socket) return socket;
    
    setStatus('connecting');
    setError(null);
    
    // Attempt connection
    const newSocket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001', {
      query: { playerId: getPlayerId() },
      reconnectionAttempts: 5,
      timeout: 10000,
    });
    
    newSocket.on('connect', () => {
      setStatus('connected');
      setError(null);
      // Attempt reconnect if we were in a room
      if (currentRoomId.current) {
         newSocket.emit('join-room', { roomId: currentRoomId.current });
      }
    });
    
    newSocket.on('connect_error', (err) => {
      setStatus('disconnected');
      setError('Could not connect to server. Ensure backend is running.');
    });
    
    newSocket.on('disconnect', () => {
      setStatus('disconnected');
    });
    
    newSocket.on('error', (err) => {
      setError(err.message || 'An error occurred');
    });

    newSocket.on('room-created', ({ roomId, maxPlayers, playerNames }) => {
      currentRoomId.current = roomId;
      setJoinCode(roomId);
      setStatus('waiting');
      setPlayers([getPlayerId()]);
      if (maxPlayers) setMaxPlayers(maxPlayers);
      if (playerNames) setPlayerNames(playerNames);
    });
    
    newSocket.on('player-joined', ({ roomId, players, maxPlayers, playerNames }) => {
      currentRoomId.current = roomId;
      setJoinCode(roomId);
      setStatus('waiting');
      setPlayers(players);
      if (maxPlayers) setMaxPlayers(maxPlayers);
      if (playerNames) setPlayerNames(playerNames);
    });

    newSocket.on('opponent-joined', ({ players, maxPlayers, playerNames }) => {
      setPlayers(players);
      if (maxPlayers) setMaxPlayers(maxPlayers);
      if (playerNames) setPlayerNames(playerNames);
    });

    newSocket.on('reverse-game-state', (state) => {
      setGameState(state);
      setMySeat(state.mySeat);
      setRestartRequested(false);
      setRestartAcceptedCount(0);
      if (state.status) {
         setStatus(state.status === 'playing' || state.status === 'color_selection' ? 'playing' : state.status);
      }
    });

    newSocket.on('reverse-restart-requested', ({ accepted, total }) => {
      setRestartAcceptedCount(accepted);
    });
    
    setSocket(newSocket);
    return newSocket;
  };
  
  const resetConnection = () => {
    if (socket) {
      socket.disconnect();
    }
    setSocket(null);
    setStatus('idle');
    setGameState(null);
    setJoinCode('');
    setPlayers([]);
    setPlayerNames({});
    currentRoomId.current = null;
    initSocket();
  };

  useEffect(() => {
    // Only init automatically if we want to
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, []);

  const createRoom = (config, playerName) => {
    const s = initSocket();
    s.emit('create-room', { gameType: 'reverse', config, playerName });
  };
  
  const joinRoom = (code, playerName) => {
    const s = initSocket();
    s.emit('join-room', { roomId: code, playerName });
  };

  const startGame = useCallback(() => {
    if (!socket || !currentRoomId.current) return;
    socket.emit('reverse-start-game', { roomId: currentRoomId.current });
  }, [socket]);
  
  const playCard = (cardId) => {
    if (!socket || !currentRoomId.current) return;
    socket.emit('reverse-play-card', { roomId: currentRoomId.current, cardId });
  };
  
  const drawCard = () => {
    if (!socket || !currentRoomId.current) return;
    socket.emit('reverse-draw-card', { roomId: currentRoomId.current });
  };

  const chooseColor = (color) => {
    if (!socket || !currentRoomId.current) return;
    socket.emit('reverse-choose-color', { roomId: currentRoomId.current, color });
  };
  
  const callUno = () => {
    if (!socket || !currentRoomId.current) return;
    socket.emit('reverse-call-uno', { roomId: currentRoomId.current });
  };
  
  const challengeUno = (targetSeat) => {
    if (!socket || !currentRoomId.current) return;
    socket.emit('reverse-challenge-uno', { roomId: currentRoomId.current, targetSeat });
  };
  
  const requestRestart = () => {
    if (!socket || !currentRoomId.current) return;
    setRestartRequested(true);
    socket.emit('reverse-request-restart', { roomId: currentRoomId.current });
  };

  return {
    socket,
    status,
    error,
    gameState,
    joinCode,
    setJoinCode,
    players,
    playerNames,
    maxPlayers,
    createRoom,
    joinRoom,
    startGame,
    resetConnection,
    connect: initSocket,
    mySeat,
    playCard,
    drawCard,
    chooseColor,
    callUno,
    challengeUno,
    requestRestart,
    restartRequested,
    restartAcceptedCount
  };
}
