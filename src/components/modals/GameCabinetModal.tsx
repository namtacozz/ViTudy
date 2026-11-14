'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { BoardGamePackage, SavedDrawingAsset } from '@/types/boardgame';
import { GameCabinetStorage } from '@/services/GameCabinetStorage';
import { useStudySpace } from '@/context/StudySpaceContext';
import { X, Gamepad2, Users, Play, Pencil, Trash2, Image as ImageIcon } from 'lucide-react';

interface GameCabinetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GameCabinetModal({ isOpen, onClose }: GameCabinetModalProps) {
  const { addBoardGame, addArtboard } = useStudySpace();
  const [mounted, setMounted] = useState(false);
  const [tab, setTab] = useState<'games' | 'drawings'>('games');
  const [games, setGames] = useState<BoardGamePackage[]>([]);
  const [drawings, setDrawings] = useState<SavedDrawingAsset[]>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    let active = true;
    (async () => {
      const [gList, dList] = await Promise.all([
        GameCabinetStorage.listGames(),
        GameCabinetStorage.listDrawings(),
      ]);
      if (active) {
        setGames(gList);
        setDrawings(dList);
      }
    })();
    return () => {
      active = false;
    };
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  const handleBringToDesk = (pkg: BoardGamePackage, startPlay: boolean) => {
    const cloned: BoardGamePackage = {
      ...JSON.parse(JSON.stringify(pkg)),
      matchState: {
        ...pkg.matchState,
        isPlaying: startPlay,
      },
    };
    addBoardGame(cloned);
    onClose();
  };

  return createPortal(
    <div
      data-modal="true"
      onMouseDown={(e) => e.stopPropagation()}
      className="fixed inset-0 z-[9995] bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4"
    >
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[88vh]">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-orange-50 border border-[#FFEDD5] flex items-center justify-center text-[#E0562D]">
              <Gamepad2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Tủ Trò Chơi & Bản Vẽ Cá Nhân</h3>
              <p className="text-xs text-slate-500">
                Mang các board game đã thiết kế sang bất kỳ bàn học nào để chơi cùng bạn bè hoặc sửa lại.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-2 px-5 pt-3 border-b border-slate-100">
          <button
            type="button"
            onClick={() => setTab('games')}
            className={`px-3.5 py-2 text-xs font-bold rounded-t-lg border-b-2 cursor-pointer ${
              tab === 'games'
                ? 'border-[#E0562D] text-[#E0562D] bg-orange-50/50'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Board Game của tôi ({games.length})
          </button>
          <button
            type="button"
            onClick={() => setTab('drawings')}
            className={`px-3.5 py-2 text-xs font-bold rounded-t-lg border-b-2 cursor-pointer ${
              tab === 'drawings'
                ? 'border-[#E0562D] text-[#E0562D] bg-orange-50/50'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Kho bản vẽ & Quân cờ ({drawings.length})
          </button>
        </div>

        <div className="p-5 overflow-y-auto flex-1">
          {tab === 'games' ? (
            games.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-2xl">
                <Gamepad2 className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-700">Tủ trò chơi đang trống</p>
                <p className="text-xs text-slate-500 mt-1">
                  Hãy dùng Bút Trò Chơi ở thanh công cụ bên trái để thiết kế và đóng gói game đầu tiên!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {games.map((g) => (
                  <div
                    key={g.id}
                    className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all flex flex-col justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-sm font-bold text-slate-900 line-clamp-1">{g.title}</h4>
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-orange-50 text-[#E0562D] border border-[#FFEDD5] flex items-center gap-1 shrink-0">
                          <Users className="w-3 h-3" />
                          {g.minPlayers}–{g.maxPlayers}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">{g.description}</p>
                      <div className="flex flex-wrap gap-1.5 mt-2.5 text-[10px] font-semibold text-slate-600">
                        <span className="px-2 py-0.5 rounded bg-slate-100">
                          Map {g.mapConfig.rows}×{g.mapConfig.cols}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-slate-100">
                          {g.tiles.length} ô
                        </span>
                        <span className="px-2 py-0.5 rounded bg-slate-100">
                          {g.decks.length} bộ thẻ
                        </span>
                        <span className="px-2 py-0.5 rounded bg-slate-100">
                          {g.pawns.length} quân cờ
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => handleBringToDesk(g, true)}
                        className="flex-1 py-1.5 rounded-lg bg-[#E0562D] hover:bg-[#c9451e] text-white text-xs font-bold flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Play className="w-3.5 h-3.5" />
                        <span>Bày ra bàn chơi</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleBringToDesk(g, false)}
                        className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        <span>Sửa</span>
                      </button>
                      <button
                        type="button"
                        title="Xóa khỏi tủ"
                        onClick={async () => {
                          const next = await GameCabinetStorage.deleteGame(g.id);
                          setGames(next);
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : drawings.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-2xl">
              <ImageIcon className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-700">Chưa có bản vẽ nào được lưu</p>
              <p className="text-xs text-slate-500 mt-1">
                Mở Bảng Vẽ 4 Góc để vẽ quân cờ hoặc minh họa và lưu vào đây.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {drawings.map((d) => (
                <div
                  key={d.id}
                  className="p-3 rounded-xl border border-slate-200 bg-white flex flex-col gap-2"
                >
                  <div className="h-28 rounded-lg border border-slate-100 bg-slate-50 flex items-center justify-center overflow-hidden">
                    {d.dataUrl ? (
                      <img src={d.dataUrl} alt={d.name} className="max-h-full max-w-full object-contain" />
                    ) : (
                      <ImageIcon className="w-6 h-6 text-slate-300" />
                    )}
                  </div>
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-bold text-slate-800 truncate">{d.name}</span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          addArtboard(undefined, undefined, d.width, d.height, d);
                          onClose();
                        }}
                        className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-[11px] font-bold text-slate-700 cursor-pointer"
                      >
                        Mở sửa
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          const next = await GameCabinetStorage.deleteDrawing(d.id);
                          setDrawings(next);
                        }}
                        className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
