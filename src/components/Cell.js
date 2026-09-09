import React from 'react';

const Cell = ({ value, onClick, disabled }) => {
  return (
    <button
      className={`h-24 w-24 sm:h-32 sm:w-32 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 flex items-center justify-center text-5xl sm:text-7xl font-bold transition-all duration-300 shadow-lg
        ${!value && !disabled ? 'hover:bg-white/20 hover:scale-[1.02] cursor-pointer' : 'cursor-default'}
        ${value === 'X' ? 'text-rose-400 drop-shadow-[0_0_15px_rgba(251,113,133,0.5)]' : ''}
        ${value === 'O' ? 'text-cyan-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]' : ''}
      `}
      onClick={onClick}
      disabled={disabled || value !== null}
      aria-label={value ? `Cell occupied by ${value}` : 'Empty cell'}
    >
      {value && (
        <span className="animate-in zoom-in duration-300 fade-in">
          {value}
        </span>
      )}
    </button>
  );
};

export default Cell;
