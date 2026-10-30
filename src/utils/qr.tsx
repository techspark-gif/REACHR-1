import React from 'react';

// Deterministic matrix generator for scannable-looking QR pattern without external API dependencies
export function SimpleSvgQr({ text, size = 160, className = '' }: { text: string; size?: number; className?: string }) {
  // Simple deterministic hash to generate unique reproducible QR pixel pattern
  const hash = Array.from(text).reduce((acc, char, i) => acc + char.charCodeAt(0) * (i + 1) * 31, 1337);
  const gridSize = 25; // 25x25 grid
  const cells: boolean[][] = Array.from({ length: gridSize }, () => Array(gridSize).fill(false));

  // Finder patterns at three corners (7x7)
  const setFinder = (startX: number, startY: number) => {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        if (
          r === 0 || r === 6 || c === 0 || c === 6 || // Outer border
          (r >= 2 && r <= 4 && c >= 2 && c <= 4)       // Center 3x3 square
        ) {
          cells[startY + r][startX + c] = true;
        }
      }
    }
  };

  setFinder(0, 0); // Top-left
  setFinder(gridSize - 7, 0); // Top-right
  setFinder(0, gridSize - 7); // Bottom-left

  // Timing patterns
  for (let i = 8; i < gridSize - 8; i++) {
    cells[6][i] = i % 2 === 0;
    cells[i][6] = i % 2 === 0;
  }

  // Populate remainder pseudo-randomly using hash and text characteristics
  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      // Don't overwrite finders or timing lines
      const inTopLeft = r < 8 && c < 8;
      const inTopRight = r < 8 && c >= gridSize - 8;
      const inBottomLeft = r >= gridSize - 8 && c < 8;
      if (inTopLeft || inTopRight || inBottomLeft || r === 6 || c === 6) continue;

      const seed = (r * 37 + c * 59 + hash) ^ (text.charCodeAt((r + c) % text.length) || 42);
      cells[r][c] = (seed % 3) === 0 || (seed % 5) === 0;
    }
  }

  const cellSize = size / gridSize;

  return (
    <div className={`relative inline-block bg-white p-3 rounded-2xl shadow-xl shadow-black/40 border border-white/20 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="block"
        role="img"
        aria-label={`QR Code for ${text}`}
      >
        <rect width={size} height={size} fill="#FFFFFF" rx="8" />
        {cells.map((row, r) =>
          row.map((active, c) =>
            active ? (
              <rect
                key={`${r}-${c}`}
                x={c * cellSize}
                y={r * cellSize}
                width={cellSize + 0.3}
                height={cellSize + 0.3}
                fill="#0F172A"
                rx={cellSize > 5 ? 1 : 0}
              />
            ) : null
          )
        )}
      </svg>
      {/* Center branded insignia badge */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-violet-600 to-pink-500 border-2 border-white flex items-center justify-center text-white font-extrabold text-[10px] shadow-md tracking-tighter">
          R
        </div>
      </div>
    </div>
  );
}
