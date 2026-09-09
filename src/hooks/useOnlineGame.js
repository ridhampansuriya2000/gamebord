import { useState, useEffect, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';

export const useOnlineGame = () => {
  const [socket, setSocket] = useState(null);
  const [roomId, setRoomId] = useState(null);
  const [playerSymbol, setPlayerSymbol] = useState(null);
  const [board, setBoard] = useState(Array(9).fill(null));
  const [currentTurn, setCurrentTurn] = useState('X');
  const [winner, setWinner] = useState(null);
  const [draw, setDraw] = useState(false);
  const [status, setStatus] = useState('disconnected'); // disconnected, connected, waiting, playing, finished
  const [error, setError] = useState(null);
  const [opponentDisconnected, setOpponentDisconnected] = useState(false);

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

  useEffect(() => {
    const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';
    
    const newSocket = io(SOCKET_URL, {
      query: { playerId: getPlayerId() }
    });

    setSocket(newSocket);

    newSocket.on('connect', () => {
      setStatus('connected');
      setError(null);
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

    return () => newSocket.close();
  }, []);

  const createRoom = useCallback(() => {
    if (socket) socket.emit('create-room');
  }, [socket]);

  const joinRoom = useCallback((id) => {
    if (socket && id) socket.emit('join-room', { roomId: id });
  }, [socket]);

  const makeMove = useCallback((index) => {
    if (socket && roomId && status === 'playing' && currentTurn === playerSymbol) {
      socket.emit('make-move', { roomId, cellIndex: index });
    }
  }, [socket, roomId, status, currentTurn, playerSymbol]);

  const restartGame = useCallback(() => {
    if (socket && roomId) {
      socket.emit('restart-game', { roomId });
    }
  }, [socket, roomId]);

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
    roomId,
    playerSymbol,
    board,
    currentTurn,
    winner,
    draw,
    status,
    error,
    opponentDisconnected,
    createRoom,
    joinRoom,
    makeMove,
    restartGame,
    leaveRoom
  };
};
