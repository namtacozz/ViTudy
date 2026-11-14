'use client';

import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { BoardTile } from '@/types/boardgame';
import { TopDownDice3D } from './TopDownDice3D';
import { SlidersHorizontal, Trash2, X } from 'lucide-react';

interface DiceLayerProps {
  diceTiles: BoardTile[];
  isEditMode: boolean;
  onRollComplete: (tileId: string, values: number[], total: number) => void;
  onDeleteTile: (tileId: string) => void;
  onUpdateDiceConfig?: (tileId: string, config: NonNullable<BoardTile['diceConfig']>) => void;
}

const PRESET_SIDES = [4, 6, 8, 10, 12, 20, 100];
const PRESET_DICE_COLORS = ['#ffffff', '#1e293b', '#E0562D', '#2563eb', '#059669', '#d97706'];
const PRESET_LABEL_COLORS = ['#0f172a', '#ffffff', '#facc15', '#E0562D'];

export const DiceLayer = React.memo(function DiceLayer({
  diceTiles,
  isEditMode,
  onRollComplete,
  onDeleteTile,
  onUpdateDiceConfig,
}: DiceLayerProps) {
  const [mapOverlayEl, setMapOverlayEl] = useState<HTMLDivElement | null>(null);
  const [editingTileId, setEditingTileId] = useState<string | null>(null);

  const editingTile = editingTileId ? diceTiles.find((t) => t.id === editingTileId) : null;

  return (
    <>
      {/* Canvas 3D bao phủ toàn bộ map được chọn (pointer-events-none để không chặn click ô cờ) */}
      <div
        ref={setMapOverlayEl}
        className="absolute inset-0 w-full h-full pointer-events-none z-30"
      />

      {diceTiles.map((tile) => (
        <div
          key={tile.id}
          onMouseDown={(e) => e.stopPropagation()}
          style={{
            position: 'absolute',
            left: tile.relX,
            top: tile.relY,
            width: tile.width,
            height: tile.height,
          }}
          className="interactive-control rounded-full bg-white/85 border-2 border-dashed border-[#E0562D]/50 shadow-inner flex flex-col items-center justify-center p-2 group z-20"
        >
          {/* Nút mở overlay tùy chỉnh xúc xắc */}
          {onUpdateDiceConfig && (
            <button
              type="button"
              title="Tùy chỉnh bộ xúc xắc (màu, số viên, số mặt)"
              onClick={(e) => {
                e.stopPropagation();
                setEditingTileId(tile.id);
              }}
              className="opacity-0 group-hover:opacity-100 absolute -top-2 -left-2 w-6 h-6 rounded-full bg-white border border-slate-200 text-slate-700 hover:text-[#E0562D] flex items-center justify-center shadow cursor-pointer z-40 transition-opacity"
            >
              <SlidersHorizontal className="w-3 h-3" />
            </button>
          )}

          {isEditMode && (
            <button
              type="button"
              title="Xóa ô xúc xắc"
              onClick={(e) => {
                e.stopPropagation();
                onDeleteTile(tile.id);
              }}
              className="opacity-0 group-hover:opacity-100 absolute -top-2 -right-2 w-6 h-6 rounded-full bg-white border border-slate-200 text-rose-600 flex items-center justify-center shadow cursor-pointer z-40 transition-opacity"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          )}

          <TopDownDice3D
            diceCount={tile.diceConfig?.diceCount || 2}
            diceSides={tile.diceConfig?.diceSides || 6}
            perDieSides={tile.diceConfig?.perDieSides}
            diceColor={tile.diceConfig?.diceColor || '#ffffff'}
            labelColor={tile.diceConfig?.labelColor || '#0f172a'}
            lastValues={tile.diceConfig?.lastRollValues}
            overlayContainer={mapOverlayEl}
            dropZone={{
              centerX: tile.relX + tile.width / 2,
              centerY: tile.relY + tile.height / 2,
              width: tile.width,
              height: tile.height,
            }}
            onRollComplete={(values: number[]) => {
              const total = values.reduce((sum, v) => sum + v, 0);
              onRollComplete(tile.id, values, total);
            }}
          />
        </div>
      ))}

      {editingTile && onUpdateDiceConfig && typeof document !== 'undefined' &&
        createPortal(
          <DiceConfigOverlay
            tile={editingTile}
            onClose={() => setEditingTileId(null)}
            onSave={(nextConfig) => {
              onUpdateDiceConfig(editingTile.id, nextConfig);
              setEditingTileId(null);
            }}
          />,
          document.body
        )}
    </>
  );
});

function DiceConfigOverlay({
  tile,
  onClose,
  onSave,
}: {
  tile: BoardTile;
  onClose: () => void;
  onSave: (config: NonNullable<BoardTile['diceConfig']>) => void;
}) {
  const initialCfg = tile.diceConfig || { diceCount: 2 };
  const [diceCount, setDiceCount] = useState<number>(initialCfg.diceCount || 2);
  const [diceSides, setDiceSides] = useState<number>(initialCfg.diceSides || 6);
  const [perDieSides, setPerDieSides] = useState<number[]>(() =>
    Array.from({ length: initialCfg.diceCount || 2 }, (_, i) =>
      initialCfg.perDieSides?.[i] ?? initialCfg.diceSides ?? 6
    )
  );
  const [diceColor, setDiceColor] = useState<string>(initialCfg.diceColor || '#ffffff');
  const [labelColor, setLabelColor] = useState<string>(initialCfg.labelColor || '#0f172a');

  const handleCountChange = (nextCount: number) => {
    const clamped = Math.max(1, Math.min(6, nextCount));
    setDiceCount(clamped);
    setPerDieSides((prev) =>
      Array.from({ length: clamped }, (_, i) => prev[i] ?? diceSides)
    );
  };

  const handleAllSidesChange = (nextSides: number) => {
    const clamped = Math.max(2, Math.min(100, Math.round(nextSides || 6)));
    setDiceSides(clamped);
    setPerDieSides(Array.from({ length: diceCount }, () => clamped));
  };

  const handleSingleDieSidesChange = (idx: number, val: number) => {
    const clamped = Math.max(2, Math.min(100, Math.round(val || 6)));
    setPerDieSides((prev) => prev.map((s, i) => (i === idx ? clamped : s)));
  };

  return (
    <div
      data-overlay="true"
      onMouseDown={(e) => e.stopPropagation()}
      onWheel={(e) => e.stopPropagation()}
      className="fixed inset-0 z-[9995] bg-slate-900/40 backdrop-blur-[2px] flex items-center justify-center p-4"
    >
      <div className="w-full max-w-md bg-white rounded-xl border border-slate-200 shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Tùy chỉnh bộ xúc xắc 3D</h3>
            <p className="text-xs text-slate-500">Đổi số viên, số mặt từng viên và màu sắc</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Số viên xúc xắc */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              Số viên xúc xắc ({diceCount} viên)
            </label>
            <div className="grid grid-cols-6 gap-1.5">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => handleCountChange(n)}
                  className={`py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                    diceCount === n
                      ? 'bg-orange-50 border border-[#E0562D] text-[#E0562D]'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          {/* Số mặt đồng bộ */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-700">Số mặt mặc định</label>
              <input
                type="number"
                min={2}
                max={100}
                value={diceSides}
                onChange={(e) => handleAllSidesChange(Number(e.target.value))}
                className="w-20 px-2 py-1 text-xs font-mono border border-slate-200 rounded-lg text-right focus:outline-none focus:border-[#E0562D]"
              />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_SIDES.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => handleAllSidesChange(s)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                    diceSides === s && perDieSides.every((v) => v === s)
                      ? 'bg-orange-50 border border-[#E0562D] text-[#E0562D]'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  d{s}
                </button>
              ))}
            </div>
          </div>

          {/* Tùy chỉnh số mặt từng viên */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              Số mặt trên từng viên (2–100)
            </label>
            <div className="grid grid-cols-3 gap-2">
              {perDieSides.map((sides, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50"
                >
                  <span className="text-[11px] font-semibold text-slate-600">Viên {idx + 1}</span>
                  <input
                    type="number"
                    min={2}
                    max={100}
                    value={sides}
                    onChange={(e) => handleSingleDieSidesChange(idx, Number(e.target.value))}
                    className="w-12 px-1 py-0.5 text-xs font-mono bg-white border border-slate-200 rounded text-right focus:outline-none focus:border-[#E0562D]"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Màu thân xúc xắc */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-700">Màu thân xúc xắc</label>
              <input
                type="color"
                value={diceColor}
                onChange={(e) => setDiceColor(e.target.value)}
                className="w-7 h-7 rounded cursor-pointer border border-slate-200"
              />
            </div>
            <div className="flex items-center gap-2">
              {PRESET_DICE_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setDiceColor(c)}
                  style={{ backgroundColor: c }}
                  className={`w-7 h-7 rounded-full border cursor-pointer ${
                    diceColor.toLowerCase() === c.toLowerCase()
                      ? 'ring-2 ring-[#E0562D] ring-offset-2 border-slate-400'
                      : 'border-slate-300'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Màu số / chấm */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-700">Màu số / chấm</label>
              <input
                type="color"
                value={labelColor}
                onChange={(e) => setLabelColor(e.target.value)}
                className="w-7 h-7 rounded cursor-pointer border border-slate-200"
              />
            </div>
            <div className="flex items-center gap-2">
              {PRESET_LABEL_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setLabelColor(c)}
                  style={{ backgroundColor: c }}
                  className={`w-7 h-7 rounded-full border cursor-pointer ${
                    labelColor.toLowerCase() === c.toLowerCase()
                      ? 'ring-2 ring-[#E0562D] ring-offset-2 border-slate-400'
                      : 'border-slate-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-slate-100 bg-slate-50">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={() =>
              onSave({
                ...initialCfg,
                diceCount,
                diceSides,
                perDieSides,
                diceColor,
                labelColor,
                lastRollValues: Array.from({ length: diceCount }, () => 1),
              })
            }
            className="px-4 py-1.5 rounded-lg bg-[#E0562D] hover:bg-[#c9451e] text-white text-xs font-bold cursor-pointer"
          >
            Áp dụng
          </button>
        </div>
      </div>
    </div>
  );
}
