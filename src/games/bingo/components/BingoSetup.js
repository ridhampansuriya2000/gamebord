import React, { useState } from 'react';

export default function BingoSetup({ onComplete }) {
  const [board, setBoard] = useState(Array(25).fill(''));
  const [error, setError] = useState('');

  const usedNumbers = board.filter(v => v !== '');
  const availableNumbers = Array.from({length: 25}, (_, i) => i + 1).filter(n => !usedNumbers.includes(n));
  const nextNumber = availableNumbers.length > 0 ? Math.min(...availableNumbers) : null;

  const handleCellClick = (index) => {
    setError('');
    const newBoard = [...board];

    if (newBoard[index] !== '') {
      // Clear cell
      newBoard[index] = '';
      setBoard(newBoard);
    } else {
      // Fill cell with next available number
      if (nextNumber !== null) {
        newBoard[index] = nextNumber;
        setBoard(newBoard);
      }
    }
  };

  const handleRandomize = () => {
    const numbers = Array.from({ length: 25 }, (_, i) => i + 1);
    for (let i = numbers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
    }
    setBoard(numbers);
    setError('');
  };

  const handleStart = () => {
    if (board.some(v => v === '')) {
      setError('Please fill all 25 cells before starting.');
      return;
    }
    onComplete(board);
  };

  return (
    <div className="flex flex-col items-center animate-in slide-in-from-bottom-4 duration-500 w-full max-w-sm">
      {error && (
        <div className="w-full mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm text-center">
          {error}
        </div>
      )}

      {nextNumber !== null ? (
        <div className="mb-4 text-cyan-300 font-semibold text-lg flex items-center gap-2">
          Next Number to Place: 
          <span className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-400 flex items-center justify-center font-bold text-white shadow-[0_0_10px_rgba(34,211,238,0.4)]">
            {nextNumber}
          </span>
        </div>
      ) : (
        <div className="mb-4 text-green-400 font-semibold text-lg">
          Board Complete! 🎉
        </div>
      )}

      <div className="grid grid-cols-5 gap-1.5 sm:gap-2 mb-6 w-full p-3 sm:p-4 rounded-xl backdrop-blur-md border border-white/20 bg-white/5 shadow-xl">
        {board.map((val, i) => (
          <div 
            key={i} 
            onClick={() => handleCellClick(i)}
            className={`aspect-square relative flex items-center justify-center rounded-lg text-lg sm:text-xl font-bold cursor-pointer transition-all duration-200 select-none ${
              val !== '' 
                ? 'bg-white/20 border border-white/40 text-white shadow-[0_0_10px_rgba(255,255,255,0.1)]' 
                : 'bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/30 text-transparent'
            }`}
          >
            {val}
          </div>
        ))}
      </div>

      <div className="flex gap-4 w-full">
        <button
          onClick={handleRandomize}
          className="flex-1 py-3 px-4 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-xl border border-white/20 transition-all font-semibold shadow-lg"
        >
          Auto Fill 🎲
        </button>
        <button
          onClick={handleStart}
          disabled={nextNumber !== null}
          className="flex-1 py-3 px-4 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 disabled:from-slate-600 disabled:to-slate-700 disabled:text-slate-400 disabled:shadow-none disabled:cursor-not-allowed rounded-xl transition-all font-bold shadow-[0_0_15px_rgba(6,182,212,0.4)] hover:shadow-[0_0_25px_rgba(6,182,212,0.6)]"
        >
          Start Game
        </button>
      </div>
    </div>
  );
}
