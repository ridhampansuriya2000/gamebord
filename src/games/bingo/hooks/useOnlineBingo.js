import { useState, useEffect, useCallback, useRef } from 'react';
import io from 'socket.io-client';

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

export const useOnlineBingo = () => {
  const [socket, setSocket] = useState(null);
  const [roomId, setRoomId] = useState('');
  const roomIdRef = useRef('');
  const playerSymbolRef = useRef(null);
  const [playerSymbol, setPlayerSymbol] = useState(null); // 'X' or 'O'

  const [humanBoard, setHumanBoard] = useState(null);
  const [opponentBoard, setOpponentBoard] = useState(null);
  const [calledNumbers, setCalledNumbers] = useState([]);
  const [currentTurn, setCurrentTurn] = useState('X');
  const [opponentJoined, setOpponentJoined] = useState(false); // opponent in room but board not ready
  
  const [winner, setWinner] = useState(null);
  // statuses: 'idle' | 'connecting' | 'connected' | 'disconnected' | 'waiting' | 'setup' | 'playing' | 'finished'
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');
  const [opponentReady, setOpponentReady] = useState(false);
  const [opponentLeft, setOpponentLeft] = useState(false);
  
  // Restart states
  const [opponentRequestedRestart, setOpponentRequestedRestart] = useState(false);
  const [iRequestedRestart, setIRequestedRestart] = useState(false);
  const [restartDeclined, setRestartDeclined] = useState(false);

  const setRoom = (id) => {
    roomIdRef.current = id;
    setRoomId(id);
  };

  const setSymbol = (sym) => {
    playerSymbolRef.current = sym;
    setPlayerSymbol(sym);
  };

  const connect = useCallback(() => {
    if (socket) return;

    setStatus('connecting');

    const playerId = getPlayerId();
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
      setError(`Could not connect to server. Check your connection!`);
      setStatus('disconnected');
    });

    newSocket.on('error', ({ message }) => {
      setError(message);
      setStatus('connected');
      setRoom('');
      setTimeout(() => setError(''), 3000);
    });

    // Room creator: their room was made
    newSocket.on('room-created', ({ roomId, player }) => {
      setRoom(roomId);
      setSymbol(player);
      setStatus('waiting'); // waiting for opponent
      setOpponentJoined(false);
      setOpponentLeft(false);
    });

    // Joiner: they successfully joined
    newSocket.on('player-joined', ({ roomId, player }) => {
      setRoom(roomId);
      setSymbol(player);
      setStatus('setup'); // immediately go to board setup
      setOpponentJoined(true); // creator is already here
      setOpponentLeft(false);
    });

    // Creator: opponent just joined — go to setup
    newSocket.on('opponent-joined', () => {
      setStatus('setup');
      setOpponentJoined(true);
    });

    // Opponent finished setting up their board
    newSocket.on('bingo-opponent-ready', () => {
      setOpponentReady(true);
    });

    // Both boards ready — game starts
    newSocket.on('bingo-game-start', ({ currentTurn }) => {
      setCurrentTurn(currentTurn);
      setStatus('playing');
    });

    newSocket.on('bingo-game-state', ({ calledNumbers, currentTurn, winner, status }) => {
      setCalledNumbers(calledNumbers);
      setCurrentTurn(currentTurn);
      setWinner(winner);
      if (status) setStatus(status);
    });

    newSocket.on('bingo-game-over', ({ boardX, boardO, winner }) => {
      // Reveal opponent's board at game end
      const sym = playerSymbolRef.current;
      if (sym === 'X') setOpponentBoard(boardO);
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
      setOpponentLeft(false);
      setOpponentRequestedRestart(false);
      setIRequestedRestart(false);
      setRestartDeclined(false);
      setStatus('setup');
    });

    newSocket.on('bingo-restart-requested', () => {
      setOpponentRequestedRestart(true);
    });

    newSocket.on('bingo-restart-declined', () => {
      setRestartDeclined(true);
      setIRequestedRestart(false);
    });

    // Opponent reconnected after a disconnect
    newSocket.on('player-reconnected', () => {
      setOpponentLeft(false);
      setError('');
    });

    // Opponent left or lost connection
    newSocket.on('player-disconnected', () => {
      setOpponentLeft(true);
      setOpponentJoined(false);
      setError('Opponent left the room.');
    });

    // Room was closed (e.g. timeout after disconnect)
    newSocket.on('room-closed', () => {
      setError('Room closed. Opponent did not reconnect.');
      setStatus('connected');
      setRoom('');
      setSymbol(null);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [socket]);

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
    socket.emit('bingo-board-ready', { roomId: roomIdRef.current, board });
  };

  const callNumber = (number) => {
    if (!socket || status !== 'playing' || currentTurn !== playerSymbolRef.current) return;
    socket.emit('bingo-call-number', { roomId: roomIdRef.current, number });
  };

  const requestRestart = () => {
      if (!socket) return;
      setIRequestedRestart(true);
      socket.emit('bingo-request-restart', { roomId: roomIdRef.current });
  };

  const acceptRestart = () => {
      if (!socket) return;
      socket.emit('bingo-accept-restart', { roomId: roomIdRef.current });
  };

  const declineRestart = () => {
      if (!socket) return;
      setOpponentRequestedRestart(false);
      socket.emit('bingo-decline-restart', { roomId: roomIdRef.current });
  };

  const leaveRoom = () => {
    if (socket) {
      socket.emit('leave-room');
    }
    setRoom('');
    setSymbol(null);
    setHumanBoard(null);
    setOpponentBoard(null);
    setCalledNumbers([]);
    setCurrentTurn('X');
    setWinner(null);
    setStatus('connected');
    setOpponentReady(false);
    setOpponentJoined(false);
    setOpponentLeft(false);
    setOpponentRequestedRestart(false);
    setIRequestedRestart(false);
    setRestartDeclined(false);
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
    opponentJoined,
    opponentLeft,
    opponentRequestedRestart,
    iRequestedRestart,
    restartDeclined,
    socket, // Expose for WebRTC
    connect,
    createRoom,
    joinRoom,
    submitBoard,
    callNumber,
    requestRestart,
    acceptRestart,
    declineRestart,
    leaveRoom
  };
};
