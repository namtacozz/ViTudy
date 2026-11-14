'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { DieSpec, DropZoneRect, PhysicsDiceBox } from '@/lib/physicsDiceBox';

interface TopDownDice3DProps {
  diceCount: number;
  diceSides?: number;
  perDieSides?: number[];
  diceColor?: string;
  labelColor?: string;
  lastValues?: number[];
  onRollComplete: (values: number[]) => void;
  size?: number;
  overlayContainer?: HTMLElement | null;
  dropZone?: DropZoneRect;
}

export function TopDownDice3D({
  diceCount,
  diceSides = 6,
  perDieSides,
  diceColor = '#ffffff',
  labelColor = '#0f172a',
  lastValues = [],
  onRollComplete,
  overlayContainer,
  dropZone,
}: TopDownDice3DProps) {
  const localContainerRef = useRef<HTMLDivElement | null>(null);
  const boxRef = useRef<PhysicsDiceBox | null>(null);
  const swipeStartRef = useRef<{ x: number; y: number } | null>(null);

  const [webglReady, setWebglReady] = useState(false);
  const [isRolling, setIsRolling] = useState(false);
  const [displayValues, setDisplayValues] = useState<number[]>(
    lastValues.length === diceCount ? lastValues : Array.from({ length: diceCount }, () => 1)
  );

  const specs: DieSpec[] = useMemo(
    () =>
      Array.from({ length: diceCount }, (_, idx) => ({
        sides: perDieSides?.[idx] ?? diceSides ?? 6,
        diceColor,
        labelColor,
      })),
    [diceCount, diceSides, perDieSides, diceColor, labelColor]
  );

  // Sync external lastValues or style/sides changes
  useEffect(() => {
    const vals =
      lastValues.length === diceCount
        ? lastValues
        : Array.from({ length: diceCount }, (_, i) => displayValues[i] ?? 1);
    if (!isRolling) {
      setDisplayValues(vals);
      boxRef.current?.showStaticValues(vals, specs);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastValues, specs, isRolling]);

  // Update dropZone position/size dynamically when the tile or map resizes
  useEffect(() => {
    if (boxRef.current && dropZone) {
      boxRef.current.setDropZone(dropZone);
      if (!isRolling) {
        boxRef.current.showStaticValues(
          displayValues.length === diceCount ? displayValues : Array.from({ length: diceCount }, () => 1),
          specs
        );
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dropZone?.centerX, dropZone?.centerY, dropZone?.width, dropZone?.height]);

  useEffect(() => {
    const targetEl = overlayContainer || localContainerRef.current;
    if (!targetEl) return;

    let box: PhysicsDiceBox | null = null;
    try {
      box = new PhysicsDiceBox(targetEl, overlayContainer ? dropZone : undefined);
      boxRef.current = box;
      setWebglReady(true);
      const initial =
        lastValues.length === diceCount ? lastValues : Array.from({ length: diceCount }, () => 1);
      box.showStaticValues(initial, specs);
    } catch {
      setWebglReady(false);
    }

    const ro = typeof ResizeObserver !== 'undefined'
      ? new ResizeObserver(() => box?.resize())
      : null;
    ro?.observe(targetEl);

    return () => {
      ro?.disconnect();
      box?.dispose();
      boxRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [diceCount, overlayContainer]);

  const triggerRoll = (swipeVector?: { x: number; y: number }) => {
    if (isRolling) return;
    setIsRolling(true);

    if (boxRef.current && webglReady) {
      boxRef.current.startThrow(
        specs,
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
      const finalVals = specs.map((s) => Math.floor(Math.random() * Math.max(2, s.sides)) + 1);
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

  return (
    <div
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      title="Nhấp hoặc vuốt để tung xúc xắc vật lý 3D"
      className="relative w-full h-full flex items-center justify-center cursor-pointer select-none group overflow-hidden rounded-full"
    >
      {/* Local WebGL fallback container if overlayContainer is not supplied */}
      {!overlayContainer && (
        <div ref={localContainerRef} className="absolute inset-0 w-full h-full" />
      )}

      {/* Fallback badge if WebGL unavailable */}
      {!webglReady && (
        <div
          style={{ backgroundColor: diceColor, color: labelColor }}
          className="relative z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-slate-300 shadow text-xs font-black"
        >
          {displayValues.join(' · ')}
        </div>
      )}
    </div>
  );
}
