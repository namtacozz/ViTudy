'use client';

import React, { useState } from 'react';
import { useStudySpace } from '@/context/StudySpaceContext';
import { BOARD_SHAPE_OPTIONS, BoardShape, GamePenTool, createBoardGameFromTemplate } from '@/types/boardgame';
import {
  createCaroPackageV2,
  createCatanLitePackageV2,
  createDraughtsPackageV2,
  createMonopolyPackageV2,
  createSnakesAndLaddersPackageV2,
  createUnoPackageV2,
  GamePackageV2,
} from '@/engine/boardgame';
import { BoardGameStudioV2 } from '@/components/boardgame/BoardGameStudioV2';
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
  Sparkles,
  Gamepad2,
  Code2,
  Play,
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
    addBoardGame,
  } = useStudySpace();

  const [mapLayout, setMapLayout] = useState<'perimeter_ring' | 'full_grid'>('perimeter_ring');
  const [mapShape, setMapShape] = useState<BoardShape>('square');
  const [tileShape, setTileShape] = useState<BoardShape>('square');
  const [mapRows, setMapRows] = useState(11);
  const [mapCols, setMapCols] = useState(11);
  const [showMapConfig, setShowMapConfig] = useState(false);

  // V2 UI states
  const [showTemplates, setShowTemplates] = useState(false);
  const [isStudioOpen, setIsStudioOpen] = useState(false);
  const [studioInitialPkg, setStudioInitialPkg] = useState<GamePackageV2 | null>(null);

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

  const goldenTemplates = [
    {
      id: 'monopoly' as const,
      label: 'Cờ Tỷ Phú (Monopoly)',
      desc: '40 ô viền, mua đất, nâng nhà, thẻ Cơ hội & Khí vận, Ngân hàng VNĐ',
      badge: 'Bán chạy',
      buildV2: createMonopolyPackageV2,
      spawnV1: () => createBoardGameFromTemplate('monopoly', `game-${Date.now()}`),
    },
    {
      id: 'caro' as const,
      label: 'Cờ Caro (Gomoku)',
      desc: 'Lưới ô, 5 quân thẳng hàng (ngang, dọc, chéo) giành chiến thắng',
      badge: 'Đối kháng',
      buildV2: () => createCaroPackageV2(5, 5),
      spawnV1: () => {
        const p = createBoardGameFromTemplate('grid_chess', `game-${Date.now()}`);
        p.title = 'Bàn Cờ Caro';
        return p;
      },
    },
    {
      id: 'uno' as const,
      label: 'Bài UNO',
      desc: 'Đánh theo màu/số, thẻ Cấm lượt, Đổi chiều, Rút 2, Đổi màu & Rút 4',
      badge: 'Thẻ bài',
      buildV2: createUnoPackageV2,
      spawnV1: () => {
        const p = createBoardGameFromTemplate('card_table', `game-${Date.now()}`);
        p.title = 'Bàn Bài UNO';
        return p;
      },
    },
    {
      id: 'draughts' as const,
      label: 'Cờ Đam (Draughts)',
      desc: 'Lưới 8×8, quân thường & phong Vua, luật bắt buộc nhảy ăn quân',
      badge: 'Chiến thuật',
      buildV2: createDraughtsPackageV2,
      spawnV1: () => {
        const p = createBoardGameFromTemplate('grid_chess', `game-${Date.now()}`);
        p.title = 'Bàn Cờ Đam (Draughts)';
        return p;
      },
    },
    {
      id: 'snakes' as const,
      label: 'Rắn và Thang (Snakes & Ladders)',
      desc: '100 ô ziczac, leo thang tiến bước, trượt đầu rắn lùi vạch',
      badge: 'May rủi',
      buildV2: createSnakesAndLaddersPackageV2,
      spawnV1: () => {
        const p = createBoardGameFromTemplate('node_track', `game-${Date.now()}`);
        p.title = 'Bàn Rắn và Thang';
        return p;
      },
    },
    {
      id: 'catan' as const,
      label: 'Catan Lite',
      desc: 'Lục giác Hex, khai phá tài nguyên Gỗ/Đá/Lúa, xây đường & nhà',
      badge: 'Khai phá',
      buildV2: createCatanLitePackageV2,
      spawnV1: () => {
        const p = createBoardGameFromTemplate('hex_strategy', `game-${Date.now()}`);
        p.title = 'Bàn Catan Lite';
        return p;
      },
    },
  ];

  const handleSpawnGame = (tpl: typeof goldenTemplates[0]) => {
    const pkg = tpl.spawnV1();
    addBoardGame(pkg);
    setShowTemplates(false);
    setActiveTool('cursor');
  };

  const handleOpenStudioFor = (tpl: typeof goldenTemplates[0]) => {
    setStudioInitialPkg(tpl.buildV2());
    setIsStudioOpen(true);
    setShowTemplates(false);
  };

  const handleOpenStudioNew = () => {
    setStudioInitialPkg(createMonopolyPackageV2());
    setIsStudioOpen(true);
    setShowTemplates(false);
    setShowMapConfig(false);
  };

  const tools: { id: GamePenTool; title: string; icon: React.ReactNode }[] = [
    { id: 'select', title: 'Chọn & Sửa ô cờ (Nhấp vào ô để chỉnh sửa)', icon: <MousePointer className="w-4.5 h-4.5 stroke-[2.2]" /> },
    { id: 'create_draw_tile', title: 'Tạo ô rút thẻ (Cơ hội / Khí vận)', icon: <SquareStack className="w-4.5 h-4.5 stroke-[2.2]" /> },
    { id: 'create_deck', title: 'Tạo bộ thẻ bài (Deck)', icon: <Layers className="w-4.5 h-4.5 stroke-[2.2]" /> },
    { id: 'create_dice', title: 'Tạo khay xúc xắc 3D vật lý', icon: <Dices className="w-4.5 h-4.5 stroke-[2.2]" /> },
    { id: 'create_external_info', title: 'Tạo ô thông tin ngoài map (Nâng nhà, tiền phạt)', icon: <Info className="w-4.5 h-4.5 stroke-[2.2]" /> },
    { id: 'create_bank', title: 'Tạo ô Ngân hàng (Tiền VNĐ 1k–500k)', icon: <Landmark className="w-4.5 h-4.5 stroke-[2.2]" /> },
    { id: 'connect_nodes', title: 'Kéo dây tạo luật nhanh (Quick Rule Linker)', icon: <Link2 className="w-4.5 h-4.5 stroke-[2.2]" /> },
  ];

  return (
    <>
      <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 bg-white border border-slate-300 rounded-2xl p-2 shadow-2xl flex flex-col items-center gap-1.5 z-50 animate-fade-in min-w-[50px] select-none">
        {/* Header Badge Studio v2 */}
        <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-lg bg-orange-50 border border-orange-200 text-[#E0562D] text-[9.5px] font-black tracking-tight uppercase select-none">
          <Gamepad2 className="w-3 h-3 stroke-[2.5]" />
          <span>v2</span>
        </div>

        {/* Nút 1: Thư viện 6 Game Mẫu (Golden Games) */}
        <div className="relative">
          <button
            type="button"
            title="Kho 6 Board Game Mẫu: Cờ Tỷ Phú, Caro, UNO, Cờ Đam, Rắn & Thang, Catan"
            onClick={() => {
              setShowTemplates((v) => !v);
              setShowMapConfig(false);
            }}
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
              showTemplates
                ? 'bg-[#E0562D] text-white shadow-xs'
                : 'bg-orange-50 text-[#E0562D] border border-[#FFEDD5] hover:bg-orange-100'
            }`}
          >
            <Sparkles className="w-4.5 h-4.5 stroke-[2.2]" />
          </button>

          {/* Flyout 6 Golden Games Popover */}
          {showTemplates && (
            <div className="absolute left-full top-0 ml-3 w-84 bg-white border border-slate-300 rounded-2xl shadow-2xl p-3.5 space-y-2.5 z-50 animate-fade-in">
              <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#E0562D]" />
                  <span className="text-xs font-black text-slate-900">Kho Board Game Mẫu v2</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowTemplates(false)}
                  className="text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-1.5 max-h-[60vh] overflow-y-auto no-scrollbar pr-0.5">
                {goldenTemplates.map((tpl) => (
                  <div
                    key={tpl.id}
                    className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white hover:border-orange-200 transition-all flex flex-col gap-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-slate-900">{tpl.label}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-orange-100 text-[#9A3412] font-bold">
                        {tpl.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-snug">{tpl.desc}</p>
                    <div className="flex items-center gap-1.5 pt-0.5">
                      <button
                        type="button"
                        onClick={() => handleSpawnGame(tpl)}
                        className="flex-1 py-1 px-2 rounded-lg bg-[#E0562D] hover:bg-[#c9451e] text-white text-[11px] font-bold flex items-center justify-center gap-1 cursor-pointer transition-all active:scale-95"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        <span>Thả lên bàn học</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenStudioFor(tpl)}
                        className="py-1 px-2.5 rounded-lg bg-white border border-slate-300 hover:border-slate-400 text-slate-700 text-[11px] font-bold flex items-center justify-center gap-1 cursor-pointer transition-all active:scale-95"
                      >
                        <Code2 className="w-3 h-3" />
                        <span>Sửa luật</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Nút 2: Mở Studio v2 & AI Architect Toàn Màn Hình */}
        <button
          type="button"
          title="Mở Board Game Studio v2 (AI Kiến trúc sư, Soạn luật tiếng Việt & Giả lập bot)"
          onClick={handleOpenStudioNew}
          className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-800 hover:text-[#E0562D] hover:bg-orange-50 border border-slate-200 hover:border-[#FFEDD5] transition-all cursor-pointer"
        >
          <Code2 className="w-4.5 h-4.5 stroke-[2.2]" />
        </button>

        <div className="w-7 h-[1px] bg-slate-200 my-0.5" />

        {/* Nút Tạo Map / Zone kèm popover cấu hình bung sang phải */}
        <div className="relative">
          <button
            type="button"
            title="Tạo Vùng Chơi (Zone: Lưới Full ô hoặc Ô viền N×M)"
            onClick={() => {
              setShowMapConfig((v) => !v);
              setShowTemplates(false);
            }}
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
              showMapConfig || activeGamePenTool === 'create_map'
                ? 'bg-[#E0562D] text-white shadow-xs'
                : 'text-slate-800 hover:bg-slate-100'
            }`}
          >
            <Grid className="w-4.5 h-4.5 stroke-[2.2]" />
          </button>

          {showMapConfig && (
            <div className="absolute left-full top-0 ml-3 w-72 bg-white border border-slate-300 rounded-2xl shadow-2xl p-3.5 space-y-3 z-50 animate-fade-in">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-900">Cấu hình Vùng Chơi (Zone)</span>
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
                  <div className="text-[10px] opacity-80">Ô chạy quanh mép</div>
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
                  <div className="text-[10px] opacity-80">Lưới ô ma trận</div>
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

        {/* Các công cụ tạo phần tử v2 */}
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

        {/* Nút Tủ đồ chơi cá nhân */}
        <button
          type="button"
          title="Mở Tủ Trò Chơi Cá Nhân (Lấy game đã lưu ra chơi hoặc sửa lại)"
          onClick={onOpenCabinet}
          className="w-9 h-9 rounded-xl flex items-center justify-center text-[#E0562D] hover:bg-orange-50 transition-all cursor-pointer"
        >
          <Archive className="w-4.5 h-4.5 stroke-[2.2]" />
        </button>

        {/* Nút Đóng */}
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

      {/* Full-screen Board Game Studio v2 */}
      {isStudioOpen && studioInitialPkg && (
        <BoardGameStudioV2
          initialPkg={studioInitialPkg}
          onClose={() => setIsStudioOpen(false)}
        />
      )}
    </>
  );
}
