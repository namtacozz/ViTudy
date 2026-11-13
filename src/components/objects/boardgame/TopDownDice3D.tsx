'use client';

import React, { useState } from 'react';
import { Dices } from 'lucide-react';

interface TopDownDice3DProps {
  diceCount: number;
  lastValues?: number[];
  onRollComplete: (values: number[]) => void;
  size?: number;
}

const DOT_POSITIONS: Record<number, number[]> = {
  1: [4],
  2: [0, 8],
  3: [0, 4, 8],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8],
};

function DieFace({ value, faceSize }: { value: number; faceSize: number }) {
  const dots = DOT_POSITIONS[value] || [4];
  return (
    <div
      style={{ width: faceSize, height: faceSize }}
      className="grid grid-cols-3 grid-rows-3 gap-0.5 p-1.5 bg-white rounded-lg border border-slate-300 shadow-inner"
    >
      {Array.from({ length: 9 }).map((_, idx) => (
        <div key={idx} className="flex items-center justify-center">
          {dots.includes(idx) && (
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                value === 1 ? 'bg-[#E0562D] scale-125' : 'bg-slate-900'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

export function TopDownDice3D({
  diceCount,
  lastValues = [],
  onRollComplete,
}: TopDownDice3DProps) {
  const [isRolling, setIsRolling] = useState(false);
  const [displayValues, setDisplayValues] = useState<number[]>(
    lastValues.length === diceCount ? lastValues : Array.from({ length: diceCount }, () => 1)
  );
  const [rotations, setRotations] = useState<{ rx: number; ry: number; rz: number; scale: number }[]>(
    () => Array.from({ length: diceCount }, () => ({ rx: 0, ry: 0, rz: 0, scale: 1 }))
  );

  const handleRoll = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isRolling) return;
    setIsRolling(true);

    // Hiệu ứng rơi 3D từ phía người nhìn trên cao xuống mặt bàn
    setRotations(
      Array.from({ length: diceCount }, () => ({
        rx: (Math.random() > 0.5 ? 1 : -1) * (360 + Math.random() * 180),
        ry: (Math.random() > 0.5 ? 1 : -1) * (360 + Math.random() * 180),
        rz: Math.round((Math.random() - 0.5) * 60),
        scale: 1.45,
      }))
    );

    const interval = setInterval(() => {
      setDisplayValues(Array.from({ length: diceCount }, () => Math.floor(Math.random() * 6) + 1));
    }, 90);

    setTimeout(() => {
      clearInterval(interval);
      const finalVals = Array.from({ length: diceCount }, () => Math.floor(Math.random() * 6) + 1);
      setDisplayValues(finalVals);
      setRotations(
        Array.from({ length: diceCount }, () => ({
          rx: 0,
          ry: 0,
          rz: Math.round((Math.random() - 0.5) * 24),
          scale: 1,
        }))
      );
      setIsRolling(false);
      onRollComplete(finalVals);
    }, 680);
  };

  const total = displayValues.reduce((a, b) => a + b, 0);

  return (
    <div
      onClick={handleRoll}
      style={{ perspective: '600px' }}
      title="Nhấp để thả xúc xắc 3D từ trên cao xuống"
      className="w-full h-full flex flex-col items-center justify-center gap-2 cursor-pointer select-none group"
    >
      <div className="flex items-center justify-center gap-2.5 flex-wrap">
        {Array.from({ length: diceCount }).map((_, idx) => {
          const r = rotations[idx] || { rx: 0, ry: 0, rz: 0, scale: 1 };
          return (
            <div
              key={idx}
              style={{
                transformStyle: 'preserve-3d',
                transform: `scale(${r.scale}) rotateX(${r.rx}deg) rotateY(${r.ry}deg) rotateZ(${r.rz}deg)`,
                transition: isRolling ? 'transform 320ms cubic-bezier(0.22, 1, 0.36, 1)' : 'transform 260ms ease-out',
                boxShadow: isRolling
                  ? '0 18px 28px rgba(15,23,42,0.28)'
                  : '0 4px 10px rgba(15,23,42,0.18)',
              }}
              className="rounded-lg"
            >
              <DieFace value={displayValues[idx] || 1} faceSize={38} />
            </div>
          );
        })}
      </div>
      <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-900 text-white text-[11px] font-bold shadow-sm group-hover:bg-[#E0562D] transition-colors">
        <Dices className="w-3 h-3" />
        <span>{isRolling ? 'Đang tung...' : `Tổng: ${total} điểm`}</span>
      </div>
    </div>
  );
}
