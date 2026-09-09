import { useState, useEffect, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';

export const useOnlineGame = () => {
  const [socket, setSocket] = useState(null);
  const [roomId, setRoomIdState] = useState(null);
  const roomIdRef = useRef(null);
  const [playerSymbol, setPlayerSymbol] = useState(null);
  const [board, setBoard] = useState(Array(9).fill(null));
  const [currentTurn, setCurrentTurn] = useState('X');
  const [winner, setWinner] = useState(null);
  const [draw, setDraw] = useState(false);
  const [status, setStatus] = useState('idle'); // idle, connecting, connected, waiting, playing, finished
  const [error, setError] = useState(null);
  const [opponentDisconnected, setOpponentDisconnected] = useState(false);

  const setRoomId = (id) => {
    roomIdRef.current = id;
    setRoomIdState(id);
  };

  // Generate or retrieve persistent player ID for reconnection
  const getPlayerId = () => {
    if (typeof window !== 'undefined') {
      let pid = localStorage.getItem('suni_chokdi_player_id');
      if (!pid) {
        pid = 'player_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('suni_chokdi_player_id', pid);
      }
      return pid;
    }
    return 'default_id';
  };

  const connect = useCallback(() => {
    if (socket || status === 'connecting' || status === 'connected') return;

    setStatus('connecting');
    setError(null);
    const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';
    
    const newSocket = io(SOCKET_URL, {
      query: { playerId: getPlayerId() },
      reconnectionAttempts: 10,
    });

    setSocket(newSocket);

    newSocket.on('connect', () => {
      setStatus('connected');
      setError(null);
      // Auto-rejoin room if a disconnection dropped us previously
      if (roomIdRef.current) {
        newSocket.emit('join-room', { roomId: roomIdRef.current });
      }
    });

    newSocket.on('connect_error', (err) => {
      setError(`Connection Error: Could not connect to ${SOCKET_URL}. Check if the backend is running!`);
      setStatus('disconnected');
    });

    newSocket.on('disconnect', () => {
      setStatus('disconnected');
    });

    newSocket.on('error', (data) => {
      setError(data.message);
      setTimeout(() => setError(null), 3000);
    });

    newSocket.on('room-created', (data) => {
      setRoomId(data.roomId);
      setPlayerSymbol(data.player);
      setStatus(data.status); // 'waiting'
      setBoard(Array(9).fill(null));
      setWinner(null);
      setDraw(false);
      setOpponentDisconnected(false);
    });

    newSocket.on('player-joined', (data) => {
      setRoomId(data.roomId);
      setPlayerSymbol(data.player);
      setStatus(data.status); // 'playing'
      setBoard(Array(9).fill(null));
      setWinner(null);
      setDraw(false);
      setOpponentDisconnected(false);
    });

    newSocket.on('game-start', (data) => {
      setBoard(data.board);
      setCurrentTurn(data.currentTurn);
      setStatus('playing');
      setWinner(null);
      setDraw(false);
      setOpponentDisconnected(false);
    });

    newSocket.on('game-state', (data) => {
      setBoard(data.board);
      setCurrentTurn(data.currentTurn);
      
      if (data.winner) {
        if (data.winner === 'Draw') {
          setDraw(true);
        } else {
          setWinner(data.winner);
        }
      } else {
        setWinner(null);
        setDraw(false);
      }
      
      if (data.status) {
        setStatus(data.status);
      }
    });

    newSocket.on('game-over', (data) => {
       if (data.winner === 'Draw') {
         setDraw(true);
       } else {
         setWinner(data.winner);
       }
       setStatus('finished');
    });

    newSocket.on('player-disconnected', () => {
      setOpponentDisconnected(true);
    });

    newSocket.on('player-reconnected', () => {
      setOpponentDisconnected(false);
    });

    newSocket.on('room-closed', (data) => {
      if (data.reason === 'timeout') {
        setError('Opponent failed to reconnect. Room closed.');
        leaveRoom();
      }
    });

  }, [socket, status]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (socket) {
        socket.close();
      }
    };
  }, [socket]);

  const createRoom = useCallback(() => {
    if (socket) socket.emit('create-room');
  }, [socket]);

  const joinRoom = useCallback((id) => {
    if (socket && id) socket.emit('join-room', { roomId: id });
  }, [socket]);

  const makeMove = useCallback((index) => {
    if (socket && roomIdRef.current && status === 'playing' && currentTurn === playerSymbol) {
      socket.emit('make-move', { roomId: roomIdRef.current, cellIndex: index });
    }
  }, [socket, status, currentTurn, playerSymbol]);

  const restartGame = useCallback(() => {
    if (socket && roomIdRef.current) {
      socket.emit('restart-game', { roomId: roomIdRef.current });
    }
  }, [socket]);

  const leaveRoom = useCallback(() => {
    if (socket) {
      socket.emit('leave-room');
      setRoomId(null);
      setPlayerSymbol(null);
      setBoard(Array(9).fill(null));
      setWinner(null);
      setDraw(false);
      setStatus('connected');
      setOpponentDisconnected(false);
    }
  }, [socket]);

  return {
    roomId: roomIdRef.current,
    playerSymbol,
    board,
    currentTurn,
    winner,
    draw,
    status,
    error,
    opponentDisconnected,
    connect,
    createRoom,
    joinRoom,
    makeMove,
    restartGame,
    leaveRoom
  };
};
