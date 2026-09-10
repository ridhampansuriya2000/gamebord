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
  const [winningLine, setWinningLine] = useState(null);
  const [draw, setDraw] = useState(false);
  const [status, setStatus] = useState('idle'); // idle, connecting, connected, waiting, playing, finished
  const [error, setError] = useState(null);
  const [opponentDisconnected, setOpponentDisconnected] = useState(false);
  
  // Restart request states
  const [opponentRequestedRestart, setOpponentRequestedRestart] = useState(false);
  const [iRequestedRestart, setIRequestedRestart] = useState(false);
  const [restartDeclined, setRestartDeclined] = useState(false);

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
      // Differentiate between genuine connect errors and custom errors from backend
      if (err.message && err.message !== 'xhr poll error') {
        setError(err.message);
      } else {
        setError(`Connection Error: Could not connect to ${SOCKET_URL}. Check if the backend is running!`);
      }
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
      setWinningLine(null);
      setDraw(false);
      setOpponentDisconnected(false);
      setOpponentRequestedRestart(false);
      setIRequestedRestart(false);
      setRestartDeclined(false);
    });

    newSocket.on('player-joined', (data) => {
      setRoomId(data.roomId);
      setPlayerSymbol(data.player);
      setStatus(data.status); // 'playing'
      setBoard(Array(9).fill(null));
      setWinner(null);
      setWinningLine(null);
      setDraw(false);
      setOpponentDisconnected(false);
      setOpponentRequestedRestart(false);
      setIRequestedRestart(false);
      setRestartDeclined(false);
    });

    newSocket.on('game-start', (data) => {
      setBoard(data.board);
      setCurrentTurn(data.currentTurn);
      
      // The backend may swap playerX and playerO, so we update our symbol
      const pid = getPlayerId();
      if (data.playerX === pid) setPlayerSymbol('X');
      else if (data.playerO === pid) setPlayerSymbol('O');

      setStatus('playing');
      setWinner(null);
      setWinningLine(null);
      setDraw(false);
      setOpponentDisconnected(false);
      setOpponentRequestedRestart(false);
      setIRequestedRestart(false);
      setRestartDeclined(false);
    });

    newSocket.on('game-state', (data) => {
      setBoard(data.board);
      setCurrentTurn(data.currentTurn);
      
      if (data.winner) {
        if (data.winner === 'Draw') {
          setDraw(true);
          setWinningLine(null);
        } else {
          setWinner(data.winner);
          setWinningLine(data.winningLine);
        }
      } else {
        setWinner(null);
        setWinningLine(null);
        setDraw(false);
      }
      
      if (data.status) {
        setStatus(data.status);
      }
    });

    newSocket.on('game-over', (data) => {
       if (data.winner === 'Draw') {
         setDraw(true);
         setWinningLine(null);
       } else {
         setWinner(data.winner);
         setWinningLine(data.winningLine);
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

    // Restart logic
    newSocket.on('restart-requested', () => {
      setOpponentRequestedRestart(true);
    });

    newSocket.on('restart-declined', () => {
      setRestartDeclined(true);
      setIRequestedRestart(false);
      setTimeout(() => setRestartDeclined(false), 3000);
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

  const requestRestart = useCallback(() => {
    if (socket && roomIdRef.current) {
      socket.emit('request-restart', { roomId: roomIdRef.current });
      setIRequestedRestart(true);
      setRestartDeclined(false);
    }
  }, [socket]);

  const acceptRestart = useCallback(() => {
    if (socket && roomIdRef.current) {
      socket.emit('accept-restart', { roomId: roomIdRef.current });
      setOpponentRequestedRestart(false);
    }
  }, [socket]);

  const declineRestart = useCallback(() => {
    if (socket && roomIdRef.current) {
      socket.emit('decline-restart', { roomId: roomIdRef.current });
      setOpponentRequestedRestart(false);
    }
  }, [socket]);

  const leaveRoom = useCallback(() => {
    if (socket) {
      socket.emit('leave-room');
      setRoomId(null);
      setPlayerSymbol(null);
      setBoard(Array(9).fill(null));
      setWinner(null);
      setWinningLine(null);
      setDraw(false);
      setStatus('connected');
      setOpponentDisconnected(false);
      setOpponentRequestedRestart(false);
      setIRequestedRestart(false);
      setRestartDeclined(false);
    }
  }, [socket]);

  return {
    socket, // Exported for WebRTC
    roomId: roomIdRef.current,
    playerSymbol,
    board,
    currentTurn,
    winner,
    winningLine,
    draw,
    status,
    error,
    opponentDisconnected,
    opponentRequestedRestart,
    iRequestedRestart,
    restartDeclined,
    connect,
    createRoom,
    joinRoom,
    makeMove,
    requestRestart,
    acceptRestart,
    declineRestart,
    leaveRoom
  };
};
