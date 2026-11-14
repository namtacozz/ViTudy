'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Dices } from 'lucide-react';
import { PhysicsDiceBox } from '@/lib/physicsDiceBox';

interface TopDownDice3DProps {
  diceCount: number;
  lastValues?: number[];
  onRollComplete: (values: number[]) => void;
  size?: number;
}

export function TopDownDice3D({
  diceCount,
  lastValues = [],
  onRollComplete,
}: TopDownDice3DProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const boxRef = useRef<PhysicsDiceBox | null>(null);
  const swipeStartRef = useRef<{ x: number; y: number } | null>(null);

  const [webglReady, setWebglReady] = useState(false);
  const [isRolling, setIsRolling] = useState(false);
  const [displayValues, setDisplayValues] = useState<number[]>(
    lastValues.length === diceCount ? lastValues : Array.from({ length: diceCount }, () => 1)
  );

  // Sync external lastValues updates (e.g. from STATE_SYNC in multiplayer)
  useEffect(() => {
    if (lastValues.length === diceCount && !isRolling) {
      setDisplayValues(lastValues);
      boxRef.current?.showStaticValues(lastValues);
    }
  }, [lastValues, diceCount, isRolling]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let box: PhysicsDiceBox | null = null;
    try {
      box = new PhysicsDiceBox(el);
      boxRef.current = box;
      setWebglReady(true);
      const initial =
        lastValues.length === diceCount ? lastValues : Array.from({ length: diceCount }, () => 1);
      box.showStaticValues(initial);
    } catch {
      // Fallback gracefully if WebGL is unavailable in headless/test environments
      setWebglReady(false);
    }

    const ro = typeof ResizeObserver !== 'undefined'
      ? new ResizeObserver(() => box?.resize())
      : null;
    ro?.observe(el);

    return () => {
      ro?.disconnect();
      box?.dispose();
      boxRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [diceCount]);

  const triggerRoll = (swipeVector?: { x: number; y: number }) => {
    if (isRolling) return;
    setIsRolling(true);

    if (boxRef.current && webglReady) {
      boxRef.current.startThrow(
        diceCount,
        (finalVals) => {
          setDisplayValues(finalVals);
          setIsRolling(false);
          onRollComplete(finalVals);
        },
        swipeVector
      );
      return;
    }

    // Fallback when WebGL is unavailable
    setTimeout(() => {
      const finalVals = Array.from({ length: diceCount }, () => Math.floor(Math.random() * 6) + 1);
      setDisplayValues(finalVals);
      setIsRolling(false);
      onRollComplete(finalVals);
    }, 450);
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    swipeStartRef.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    e.stopPropagation();
    const start = swipeStartRef.current;
    swipeStartRef.current = null;
    if (!start) {
      triggerRoll();
      return;
    }
    const dx = e.clientX - start.x;
    const dy = e.clientY - start.y;
    triggerRoll(Math.hypot(dx, dy) > 8 ? { x: dx, y: dy } : undefined);
  };

  const total = displayValues.reduce((a, b) => a + b, 0);

  return (
    <div
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      title="Nhấp hoặc vuốt để tung xúc xắc vật lý 3D"
      className="relative w-full h-full flex items-center justify-center cursor-pointer select-none group overflow-hidden rounded-full"
    >
      {/* WebGL + cannon-es 3D Dice Arena */}
      <div ref={containerRef} className="absolute inset-0 w-full h-full" />

      {/* Fallback badge if WebGL unavailable */}
      {!webglReady && (
        <div className="relative z-10 flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white border border-slate-300 shadow text-xs font-black text-slate-900">
          {displayValues.join(' + ')}
        </div>
      )}

      {/* Total pill */}
      <div className="relative z-10 mt-auto mb-1 flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-900/90 text-white text-[10px] font-bold shadow pointer-events-none">
        <Dices className="w-3 h-3 text-[#E0562D]" />
        <span>{isRolling ? 'Đang lăn...' : `Tổng: ${total} điểm`}</span>
      </div>
    </div>
  );
}
