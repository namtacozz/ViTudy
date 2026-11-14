'use client';

import React, { useState } from 'react';
import { useStudySpace } from '@/context/StudySpaceContext';
import { BOARD_SHAPE_OPTIONS, BoardShape, GamePenTool } from '@/types/boardgame';
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
  const [mapShape, setMapShape] = useState<BoardShape>('square');
  const [tileShape, setTileShape] = useState<BoardShape>('square');
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
      typeLabel: `Map ${mapRows}×${mapCols}`,
      text: JSON.stringify({ layoutMode: mapLayout, rows: mapRows, cols: mapCols, mapShape, tileShape }),
    });
    setActiveTool('create_note');
  };

  const tools: { id: GamePenTool; title: string; icon: React.ReactNode }[] = [
    { id: 'select', title: 'Chọn & Sửa ô cờ (Nhấp vào ô để thiết kế form)', icon: <MousePointer className="w-4.5 h-4.5 stroke-[2.2]" /> },
    { id: 'create_draw_tile', title: 'Tạo ô rút thẻ (Cơ hội / Khí vận)', icon: <SquareStack className="w-4.5 h-4.5 stroke-[2.2]" /> },
    { id: 'create_deck', title: 'Tạo bộ thẻ / Sổ đỏ (AI thu thập dữ liệu tạo thẻ)', icon: <Layers className="w-4.5 h-4.5 stroke-[2.2]" /> },
    { id: 'create_dice', title: 'Tạo ô tròn thả xúc xắc 3D (Từ trên cao xuống)', icon: <Dices className="w-4.5 h-4.5 stroke-[2.2]" /> },
    { id: 'create_external_info', title: 'Tạo ô thông tin ngoài map (Nâng nhà, tiền phạt, bán lại)', icon: <Info className="w-4.5 h-4.5 stroke-[2.2]" /> },
    { id: 'create_bank', title: 'Tạo ô Ngân hàng (Tiền Việt Nam 1k–500k)', icon: <Landmark className="w-4.5 h-4.5 stroke-[2.2]" /> },
    { id: 'connect_nodes', title: 'Kéo dây kết nối (Nối ô đất với ô thông tin / bộ thẻ)', icon: <Link2 className="w-4.5 h-4.5 stroke-[2.2]" /> },
  ];

  return (
    <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 bg-white border border-slate-300 rounded-2xl p-2 shadow-2xl flex flex-col items-center gap-1.5 z-50 animate-fade-in min-w-[46px] select-none">
      {/* Nút Tạo Map kèm popover cấu hình bung sang phải */}
      <div className="relative">
        <button
          type="button"
          title="Tạo Map Board Game (Kéo thả lưới Full ô hoặc Ô viền N×M)"
          onClick={() => setShowMapConfig((v) => !v)}
          className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
            showMapConfig || activeGamePenTool === 'create_map'
              ? 'bg-[#E0562D] text-white shadow-xs'
              : 'bg-orange-50 text-[#E0562D] border border-[#FFEDD5] hover:bg-orange-100'
          }`}
        >
          <Grid className="w-4.5 h-4.5 stroke-[2.2]" />
        </button>

        {showMapConfig && (
          <div className="absolute left-full top-0 ml-3 w-72 bg-white border border-slate-300 rounded-2xl shadow-2xl p-3.5 space-y-3 z-50">
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
                <div className="text-[11px] font-bold">Vòng viền</div>
                <div className="text-[10px] opacity-80">Các ô chạy viền</div>
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
                <div className="text-[11px] font-bold">Lưới đầy đủ</div>
                <div className="text-[10px] opacity-80">Full ô trắng</div>
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Hình dạng bàn</label>
                <select
                  value={mapShape}
                  onChange={(e) => setMapShape(e.target.value as BoardShape)}
                  className="w-full px-2 py-1 text-[11px] rounded-lg border border-slate-200 font-semibold bg-white"
                >
                  {BOARD_SHAPE_OPTIONS.map((opt) => (
                    <option key={opt.id} value={opt.id}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Hình dạng ô</label>
                <select
                  value={tileShape}
                  onChange={(e) => setTileShape(e.target.value as BoardShape)}
                  className="w-full px-2 py-1 text-[11px] rounded-lg border border-slate-200 font-semibold bg-white"
                >
                  {BOARD_SHAPE_OPTIONS.map((opt) => (
                    <option key={opt.id} value={opt.id}>{opt.label}</option>
                  ))}
                </select>
              </div>
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

      <div className="w-7 h-[1px] bg-slate-200 my-0.5" />

      {tools.map((t) => (
        <button
          key={t.id}
          type="button"
          title={t.title}
          onClick={() => setActiveGamePenTool(t.id)}
          className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
            activeGamePenTool === t.id
              ? 'bg-slate-200 text-slate-900 font-bold border border-slate-300'
              : 'text-slate-900 hover:bg-slate-100'
          }`}
        >
          {t.icon}
        </button>
      ))}

      <div className="w-7 h-[1px] bg-slate-200 my-0.5" />

      <button
        type="button"
        title="Mở Tủ Trò Chơi Cá Nhân (Lấy game đã lưu ra chơi hoặc sửa lại)"
        onClick={onOpenCabinet}
        className="w-9 h-9 rounded-xl flex items-center justify-center text-[#E0562D] hover:bg-orange-50 transition-all cursor-pointer"
      >
        <Archive className="w-4.5 h-4.5 stroke-[2.2]" />
      </button>

      <button
        type="button"
        title="Đóng Bút Trò Chơi"
        onClick={() => {
          setActiveGamePenTool('select');
          setActiveTool('cursor');
        }}
        className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
      >
        <X className="w-4 h-4 stroke-[2.2]" />
      </button>
    </div>
  );
}
