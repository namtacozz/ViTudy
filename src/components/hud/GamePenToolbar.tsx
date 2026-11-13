'use client';

import React, { useState } from 'react';
import { useStudySpace } from '@/context/StudySpaceContext';
import { GamePenTool } from '@/types/boardgame';
import {
  Grid,
  Dices,
  Layers,
  SquareStack,
  Info,
  Landmark,
  Link2,
  MousePointer,
  Archive,
  X,
} from 'lucide-react';

interface GamePenToolbarProps {
  onOpenCabinet: () => void;
}

export function GamePenToolbar({ onOpenCabinet }: GamePenToolbarProps) {
  const {
    activeTool,
    setActiveTool,
    activeGamePenTool,
    setActiveGamePenTool,
    setStickyCreationTemplate,
  } = useStudySpace();

  const [mapLayout, setMapLayout] = useState<'perimeter_ring' | 'full_grid'>('perimeter_ring');
  const [mapRows, setMapRows] = useState(11);
  const [mapCols, setMapCols] = useState(11);
  const [showMapConfig, setShowMapConfig] = useState(false);

  if (activeTool !== 'game_pen') return null;

  const handleStartDragMap = () => {
    setShowMapConfig(false);
    setActiveGamePenTool('create_map');
    setStickyCreationTemplate({
      itemType: 'board_game',
      width: mapCols * 70,
      height: mapRows * 70,
      typeLabel: `Map ${mapRows}×${mapCols} (${mapLayout === 'perimeter_ring' ? 'Ô viền' : 'Full ô'})`,
      text: JSON.stringify({ layoutMode: mapLayout, rows: mapRows, cols: mapCols }),
    });
    setActiveTool('create_note');
  };

  const tools: { id: GamePenTool; label: string; desc: string; icon: React.ReactNode }[] = [
    { id: 'select', label: 'Chọn / Sửa', desc: 'Nhấp vào ô để sửa form', icon: <MousePointer className="w-4 h-4" /> },
    { id: 'create_draw_tile', label: 'Ô Rút Thẻ', desc: 'Cơ hội / Khí vận', icon: <SquareStack className="w-4 h-4" /> },
    { id: 'create_deck', label: 'Bộ Thẻ / Sổ Đỏ', desc: 'Xấp bài & AI sinh thẻ', icon: <Layers className="w-4 h-4" /> },
    { id: 'create_dice', label: 'Ô Xúc Xắc 3D', desc: 'Ô tròn thả 3D từ trên cao', icon: <Dices className="w-4 h-4" /> },
    { id: 'create_external_info', label: 'Ô Ngoài Map', desc: 'Nâng nhà, tiền phạt, bán lại', icon: <Info className="w-4 h-4" /> },
    { id: 'create_bank', label: 'Ô Ngân Hàng', desc: 'Quầy tiền VNĐ 1k–500k', icon: <Landmark className="w-4 h-4" /> },
    { id: 'connect_nodes', label: 'Kéo Dây Nối', desc: 'Nối ô đất với ô thông tin / thẻ', icon: <Link2 className="w-4 h-4" /> },
  ];

  return (
    <div className="fixed bottom-16 left-1/2 -translate-x-1/2 z-45 bg-white/95 backdrop-blur-md border border-slate-300 rounded-2xl p-2 shadow-2xl flex items-center gap-1.5 pointer-events-auto select-none">
      {/* Nút Tạo Map kèm popover cấu hình */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setShowMapConfig((v) => !v)}
          className={`px-3 py-2 rounded-xl flex items-center gap-1.5 text-xs font-bold cursor-pointer transition-all ${
            showMapConfig || activeGamePenTool === 'create_map'
              ? 'bg-[#E0562D] text-white shadow-sm'
              : 'bg-orange-50 text-[#E0562D] border border-[#FFEDD5] hover:bg-orange-100'
          }`}
        >
          <Grid className="w-4 h-4" />
          <span>Tạo Map</span>
        </button>

        {showMapConfig && (
          <div className="absolute bottom-full left-0 mb-3 w-72 bg-white border border-slate-300 rounded-2xl shadow-2xl p-3.5 space-y-3 z-50">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-900">Cấu hình Map Board Game</span>
              <button
                type="button"
                onClick={() => setShowMapConfig(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => setMapLayout('perimeter_ring')}
                className={`p-2 rounded-xl border text-left cursor-pointer ${
                  mapLayout === 'perimeter_ring'
                    ? 'bg-orange-50 border-[#E0562D] text-[#E0562D]'
                    : 'bg-white border-slate-200 text-slate-700'
                }`}
              >
                <div className="text-[11px] font-bold">Ô vuông viền</div>
                <div className="text-[10px] opacity-80">Kiểu Cờ Tỷ Phú</div>
              </button>
              <button
                type="button"
                onClick={() => setMapLayout('full_grid')}
                className={`p-2 rounded-xl border text-left cursor-pointer ${
                  mapLayout === 'full_grid'
                    ? 'bg-orange-50 border-[#E0562D] text-[#E0562D]'
                    : 'bg-white border-slate-200 text-slate-700'
                }`}
              >
                <div className="text-[11px] font-bold">Full ô vuông</div>
                <div className="text-[10px] opacity-80">Cờ Vua / Caro</div>
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Số hàng</label>
                <input
                  type="number"
                  min={2}
                  max={20}
                  value={mapRows}
                  onChange={(e) => setMapRows(Math.max(2, Math.min(20, Number(e.target.value) || 11)))}
                  className="w-full px-2.5 py-1 text-xs rounded-lg border border-slate-200 font-bold"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Số cột</label>
                <input
                  type="number"
                  min={2}
                  max={20}
                  value={mapCols}
                  onChange={(e) => setMapCols(Math.max(2, Math.min(20, Number(e.target.value) || 11)))}
                  className="w-full px-2.5 py-1 text-xs rounded-lg border border-slate-200 font-bold"
                />
              </div>
            </div>
            <button
              type="button"
              onClick={handleStartDragMap}
              className="w-full py-2 rounded-xl bg-[#E0562D] hover:bg-[#c9451e] text-white text-xs font-bold cursor-pointer"
            >
              Kéo thả Map {mapRows}×{mapCols} lên bàn
            </button>
          </div>
        )}
      </div>

      <div className="w-px h-7 bg-slate-200 mx-0.5" />

      {tools.map((t) => (
        <button
          key={t.id}
          type="button"
          title={t.desc}
          onClick={() => setActiveGamePenTool(t.id)}
          className={`px-2.5 py-2 rounded-xl flex items-center gap-1.5 text-xs font-bold cursor-pointer transition-all ${
            activeGamePenTool === t.id
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-700 hover:bg-slate-100'
          }`}
        >
          {t.icon}
          <span className="hidden lg:inline">{t.label}</span>
        </button>
      ))}

      <div className="w-px h-7 bg-slate-200 mx-0.5" />

      <button
        type="button"
        onClick={onOpenCabinet}
        className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
      >
        <Archive className="w-4 h-4 text-[#E0562D]" />
        <span>Tủ Game</span>
      </button>

      <button
        type="button"
        title="Thoát Bút Trò Chơi"
        onClick={() => {
          setActiveGamePenTool('select');
          setActiveTool('cursor');
        }}
        className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
