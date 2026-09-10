import React, { useState } from 'react';

export default function BingoSetup({ onComplete }) {
  const [board, setBoard] = useState(Array(25).fill(''));
  const [error, setError] = useState('');

  const handleChange = (index, value) => {
    setError('');
    // Allow empty or numeric
    if (value === '') {
      const newBoard = [...board];
      newBoard[index] = '';
      setBoard(newBoard);
      return;
    }

    const num = parseInt(value, 10);
    if (isNaN(num)) return; // Don't allow non-numbers

    // Limit to 2 digits max
    if (value.length > 2) return;

    const newBoard = [...board];
    newBoard[index] = num;
    setBoard(newBoard);
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
    // Validate
    if (board.some(v => v === '')) {
      setError('Please fill in all 25 cells.');
      return;
    }

    const set = new Set();
    for (let i = 0; i < 25; i++) {
      const num = board[i];
      if (num < 1 || num > 25) {
        setError(`All numbers must be between 1 and 25 (found ${num}).`);
        return;
      }
      if (set.has(num)) {
        setError(`Duplicate number found: ${num}. All 25 numbers must be unique.`);
        return;
      }
      set.add(num);
    }

    // All valid!
    onComplete(board);
  };

  return (
    <div className="flex flex-col items-center animate-in slide-in-from-bottom-4 duration-500 w-full max-w-sm">
      <h2 className="text-2xl font-semibold text-slate-200 mb-2 text-center">Create Your Board</h2>
      <p className="text-slate-400 text-sm mb-6 text-center">Enter numbers 1 to 25. No duplicates.</p>

      {error && (
        <div className="w-full mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm text-center">
          {error}
        </div>
      )}

      <div className="grid grid-cols-5 gap-1.5 sm:gap-2 mb-6 w-full">
        {board.map((val, i) => (
          <div key={i} className="aspect-square relative">
            <input
              type="text"
              inputMode="numeric"
              value={val}
              onChange={(e) => handleChange(i, e.target.value)}
              className="w-full h-full absolute inset-0 bg-white/5 border border-white/20 rounded-lg text-center text-lg sm:text-xl font-bold text-white focus:outline-none focus:bg-cyan-500/20 focus:border-cyan-400 transition-colors"
            />
          </div>
        ))}
      </div>

      <div className="flex gap-4 w-full">
        <button
          onClick={handleRandomize}
          className="flex-1 py-3 px-4 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-xl border border-white/20 transition-all font-semibold"
        >
          Randomize
        </button>
        <button
          onClick={handleStart}
          className="flex-1 py-3 px-4 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 rounded-xl transition-all font-bold shadow-[0_0_15px_rgba(6,182,212,0.4)] hover:shadow-[0_0_25px_rgba(6,182,212,0.6)]"
        >
          Ready
        </button>
      </div>
    </div>
  );
}
