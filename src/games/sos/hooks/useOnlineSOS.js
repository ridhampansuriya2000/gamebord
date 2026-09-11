import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

export const useOnlineSOS = () => {
  const [socket, setSocket] = useState(null);
  const [roomId, setRoomId] = useState(null);
  const [playerSymbol, setPlayerSymbol] = useState(null); // 'X' or 'O'
  
  const [board, setBoard] = useState(Array(25).fill(null));
  const [scores, setScores] = useState({ X: 0, O: 0 });
  const [currentTurn, setCurrentTurn] = useState(null);
  const [winner, setWinner] = useState(null);
  
  const [status, setStatus] = useState('idle'); // idle, waiting, playing, finished
  const [error, setError] = useState(null);
  
  const [opponentJoined, setOpponentJoined] = useState(false);
  const [opponentLeft, setOpponentLeft] = useState(false);
  
  const [opponentRequestedRestart, setOpponentRequestedRestart] = useState(false);
  const [iRequestedRestart, setIRequestedRestart] = useState(false);
  const [restartDeclined, setRestartDeclined] = useState(false);

  const socketRef = useRef(null);

  const connect = () => {
    if (!socketRef.current) {
      const newSocket = io(BACKEND_URL);
      setSocket(newSocket);
      socketRef.current = newSocket;
      setupListeners(newSocket);
    }
  };

  const setupListeners = (socket) => {
    socket.on('connect', () => {
      setStatus('connected');
    });

    socket.on('room-created', ({ roomId }) => {
      setRoomId(roomId);
      setStatus('waiting');
      setError(null);
      setPlayerSymbol('X'); // Creator is X
      setOpponentJoined(false);
      setOpponentLeft(false);
    });

    socket.on('room-joined', ({ roomId }) => {
      setRoomId(roomId);
      setStatus('waiting');
      setError(null);
      setPlayerSymbol('O'); // Joiner is O
      setOpponentJoined(true);
      setOpponentLeft(false);
    });

    socket.on('opponent-joined', () => {
      setOpponentJoined(true);
      setOpponentLeft(false);
    });

    socket.on('opponent-left', () => {
      setOpponentLeft(true);
      setStatus('finished');
    });

    socket.on('sos-game-start', (state) => {
      setBoard(state.board);
      setScores(state.scores);
      setCurrentTurn(state.currentTurn);
      setWinner(null);
      setStatus('playing');
      setOpponentRequestedRestart(false);
      setIRequestedRestart(false);
      setRestartDeclined(false);
    });

    socket.on('sos-game-state', (state) => {
      setBoard(state.board);
      setScores(state.scores);
      setCurrentTurn(state.currentTurn);
      if (state.status) setStatus(state.status);
      if (state.winner) setWinner(state.winner);
    });

    socket.on('sos-game-over', ({ winner, scores }) => {
      setWinner(winner);
      setScores(scores);
      setStatus('finished');
    });

    socket.on('sos-restart-requested', () => {
      setOpponentRequestedRestart(true);
      setRestartDeclined(false);
    });

    socket.on('sos-restart-declined', () => {
      setRestartDeclined(true);
      setOpponentRequestedRestart(false);
      setIRequestedRestart(false);
    });

    socket.on('error', ({ message }) => {
      setError(message);
      setRoomId(null);
      setStatus('idle');
    });
  };

  const createRoom = () => {
    if (socket) socket.emit('create-room', { gameType: 'sos' });
  };

  const joinRoom = (id) => {
    if (socket) socket.emit('join-room', { roomId: id });
  };

  const startGame = () => {
    if (socket && roomId) {
      socket.emit('sos-start-game', { roomId });
    }
  };

  const makeMove = (cellIndex, symbol) => {
    if (socket && roomId && status === 'playing' && currentTurn === playerSymbol) {
      socket.emit('sos-make-move', { roomId, cellIndex, symbol });
    }
  };

  const requestRestart = () => {
    if (socket && roomId) {
      socket.emit('sos-request-restart', { roomId });
      setIRequestedRestart(true);
      setRestartDeclined(false);
    }
  };

  const acceptRestart = () => {
    if (socket && roomId) {
      socket.emit('sos-accept-restart', { roomId });
    }
  };

  const declineRestart = () => {
    if (socket && roomId) {
      socket.emit('sos-decline-restart', { roomId });
      setOpponentRequestedRestart(false);
    }
  };

  const leaveRoom = () => {
    if (socket && roomId) {
      socket.emit('leave-room', { roomId });
      setRoomId(null);
      setStatus('idle');
      setBoard(Array(25).fill(null));
      setOpponentJoined(false);
    }
  };

  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  return {
    roomId,
    playerSymbol,
    board,
    scores,
    currentTurn,
    winner,
    status,
    error,
    opponentJoined,
    opponentLeft,
    opponentRequestedRestart,
    iRequestedRestart,
    restartDeclined,
    connect,
    createRoom,
    joinRoom,
    startGame,
    makeMove,
    requestRestart,
    acceptRestart,
    declineRestart,
    leaveRoom
  };
};
