import { useState, useEffect, useCallback } from 'react';
import io from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';

export const useOnlineBingo = (user) => {
  const [socket, setSocket] = useState(null);
  const [roomId, setRoomId] = useState('');
  const [playerSymbol, setPlayerSymbol] = useState(null); // 'X' or 'O'
  
  const [humanBoard, setHumanBoard] = useState(null);
  const [opponentBoard, setOpponentBoard] = useState(null);
  const [calledNumbers, setCalledNumbers] = useState([]);
  const [currentTurn, setCurrentTurn] = useState('X');
  
  const [winner, setWinner] = useState(null);
  const [status, setStatus] = useState('idle'); // 'idle', 'connecting', 'connected', 'disconnected', 'waiting', 'setup', 'playing', 'finished'
  const [error, setError] = useState('');
  const [opponentReady, setOpponentReady] = useState(false);

  const connect = useCallback(() => {
    if (socket) return;
    
    setStatus('connecting');

    // Use user.id if logged in, else generate a random ID
    const playerId = user?.id || `guest_${Math.random().toString(36).substring(2, 9)}`;
    const newSocket = io(SOCKET_URL, {
      query: { playerId },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    setSocket(newSocket);

    newSocket.on('connect', () => {
      setStatus('connected');
      setError('');
    });

    newSocket.on('connect_error', () => {
      setError(`Could not connect to ${SOCKET_URL}. Check if the backend is running!`);
      setStatus('disconnected');
    });

    newSocket.on('error', ({ message }) => {
      setError(message);
    });

    newSocket.on('room-created', ({ roomId, player, status }) => {
      setRoomId(roomId);
      setPlayerSymbol(player);
      setStatus(status); // 'waiting'
    });

    newSocket.on('player-joined', ({ roomId, player, status }) => {
      setRoomId(roomId);
      setPlayerSymbol(player);
      setStatus(status); // 'playing' for tic-tac-toe, but 'setup' for bingo
      if (status === 'playing') setStatus('setup'); // Bingo specific
    });

    newSocket.on('bingo-opponent-ready', () => {
      setOpponentReady(true);
    });

    newSocket.on('bingo-game-start', ({ currentTurn }) => {
      setCurrentTurn(currentTurn);
      setStatus('playing');
    });

    newSocket.on('bingo-game-state', ({ calledNumbers, currentTurn, winner, status }) => {
      setCalledNumbers(calledNumbers);
      setCurrentTurn(currentTurn);
      setWinner(winner);
      setStatus(status);
    });

    newSocket.on('bingo-game-over', ({ boardX, boardO, winner }) => {
      // Reveal opponent's board
      if (playerSymbol === 'X') setOpponentBoard(boardO);
      else setOpponentBoard(boardX);
      setWinner(winner);
      setStatus('finished');
    });

    newSocket.on('bingo-game-reset', () => {
      setHumanBoard(null);
      setOpponentBoard(null);
      setCalledNumbers([]);
      setCurrentTurn('X');
      setWinner(null);
      setOpponentReady(false);
      setStatus('setup');
    });

    newSocket.on('player-disconnected', () => {
      setError('Opponent disconnected.');
    });

    return () => {
      newSocket.disconnect();
    };
  }, [socket, user?.id, playerSymbol]);

  useEffect(() => {
    connect();
  }, [connect]);

  const createRoom = () => {
    if (!socket) return;
    socket.emit('create-room', { gameType: 'bingo' });
  };

  const joinRoom = (id) => {
    if (!socket) return;
    socket.emit('join-room', { roomId: id });
  };

  const submitBoard = (board) => {
    setHumanBoard(board);
    socket.emit('bingo-board-ready', { roomId, board });
  };

  const callNumber = (number) => {
    if (!socket || status !== 'playing' || currentTurn !== playerSymbol) return;
    socket.emit('bingo-call-number', { roomId, number });
  };

  const requestRestart = () => {
    if (!socket) return;
    socket.emit('bingo-accept-restart', { roomId });
  };

  const leaveRoom = () => {
    if (socket) {
      socket.emit('leave-room');
    }
    setRoomId('');
    setPlayerSymbol(null);
    setHumanBoard(null);
    setOpponentBoard(null);
    setCalledNumbers([]);
    setCurrentTurn('X');
    setWinner(null);
    setStatus('connected');
    setOpponentReady(false);
    setError('');
  };

  return {
    roomId,
    playerSymbol,
    humanBoard,
    opponentBoard,
    calledNumbers,
    currentTurn,
    winner,
    status,
    error,
    opponentReady,
    socket, // Expose for WebRTC
    connect,
    createRoom,
    joinRoom,
    submitBoard,
    callNumber,
    requestRestart,
    leaveRoom
  };
};
