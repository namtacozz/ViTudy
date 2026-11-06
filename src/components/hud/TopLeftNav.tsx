'use client';

import React, { useState } from 'react';
import { useStudySpace } from '@/context/StudySpaceContext';
import { 
  Compass, 
  Search, 
  Plus, 
  Users, 
  Radio, 
  ChevronDown,
  BookMarked
} from 'lucide-react';

export function TopLeftNav() {
  const { 
    spaces, 
    activeSpaceId, 
    activeSpace, 
    switchSpace, 
    createSpace,
    searchQuery,
    setSearchQuery 
  } = useStudySpace();

  const [isSpaceMenuOpen, setIsSpaceMenuOpen] = useState(false);
  const [isNewSpaceModalOpen, setIsNewSpaceModalOpen] = useState(false);
  const [newSpaceName, setNewSpaceName] = useState('');
  const [newSpaceSubject, setNewSpaceSubject] = useState('');
  const [isFollowMeActive, setIsFollowMeActive] = useState(false);

  const handleCreateNewSpace = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSpaceName.trim()) return;
    createSpace(newSpaceName.trim(), newSpaceSubject.trim() || 'Học tập');
    setNewSpaceName('');
    setNewSpaceSubject('');
    setIsNewSpaceModalOpen(false);
    setIsSpaceMenuOpen(false);
  };

  return (
    <div className="absolute top-4 left-4 z-40 flex flex-col gap-2 pointer-events-auto">
      {/* HUD Pill: Brand & Space Selector */}
      <div className="flex items-center gap-2 bg-slate-950/80 border border-cyan-500/30 rounded-xl px-3 py-2 shadow-hud-glow backdrop-blur-md">
        {/* Brand Logo / VR indicator */}
        <div className="flex items-center gap-1.5 pr-2 border-r border-slate-800">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-cyan-600 to-sky-400 flex items-center justify-center text-white shadow-sm">
            <Compass className="w-3.5 h-3.5 animate-spin-slow" />
          </div>
          <span className="text-xs font-black tracking-wider bg-gradient-to-r from-cyan-300 via-sky-200 to-white bg-clip-text text-transparent">
            ViTudy
          </span>
        </div>

        {/* Space Dropdown Button */}
        <div className="relative">
          <button
            onClick={() => setIsSpaceMenuOpen(!isSpaceMenuOpen)}
            className="flex items-center gap-1.5 text-xs font-medium text-slate-200 hover:text-cyan-300 transition-colors px-1 py-0.5 rounded"
          >
            <BookMarked className="w-3.5 h-3.5 text-cyan-400" />
            <span className="max-w-[140px] truncate">{activeSpace.name}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {/* Spaces Menu */}
          {isSpaceMenuOpen && (
            <div className="absolute top-full left-0 mt-2 w-64 bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl p-2 z-50 backdrop-blur-lg">
              <div className="text-[10px] uppercase font-bold text-slate-400 px-2 py-1">
                Danh sách Bàn học
              </div>
              <div className="space-y-1 max-h-48 overflow-y-auto my-1">
                {spaces.map(s => (
                  <button
                    key={s.id}
                    onClick={() => {
                      switchSpace(s.id);
                      setIsSpaceMenuOpen(false);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between ${
                      s.id === activeSpaceId 
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-medium' 
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span className="truncate">{s.name}</span>
                    <span className="text-[10px] text-slate-500">{s.items.length} món</span>
                  </button>
                ))}
              </div>

              <div className="pt-2 border-t border-slate-800">
                <button
                  onClick={() => {
                    setIsSpaceMenuOpen(false);
                    setIsNewSpaceModalOpen(true);
                  }}
                  className="w-full flex items-center justify-center gap-1.5 px-2 py-1.5 bg-slate-800 hover:bg-cyan-600/30 text-cyan-300 hover:text-white rounded-lg text-xs font-medium transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tạo Bàn Học Mới</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Global Desk Search Bar (Ctrl+F) */}
        <div className="relative pl-2 border-l border-slate-800 flex items-center">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm tài liệu..."
            className="w-36 focus:w-48 transition-all bg-slate-900/60 border border-slate-700/50 rounded-lg pl-6 pr-2 py-1 text-xs text-slate-200 placeholder-slate-500 outline-none focus:border-cyan-400"
          />
        </div>

        {/* Multiplayer Presence & Follow Me Sync Pill */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
          <div 
            title="Đang có 1 người trên bàn học này"
            className="flex items-center gap-1 bg-slate-900/80 px-2 py-1 rounded-lg text-[11px] text-emerald-400 font-mono border border-emerald-500/20"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <Users className="w-3 h-3 text-emerald-400" />
            <span>Host</span>
          </div>

          <button
            title="Đồng bộ góc nhìn bàn học (Follow Me)"
            onClick={() => setIsFollowMeActive(!isFollowMeActive)}
            className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium transition-all ${
              isFollowMeActive
                ? 'bg-cyan-500 text-slate-950 shadow-sm'
                : 'bg-slate-900 text-slate-400 hover:text-cyan-300 hover:bg-slate-800'
            }`}
          >
            <Radio className="w-3 h-3" />
            <span className="hidden sm:inline">Follow Me</span>
          </button>
        </div>
      </div>

      {/* Modal Tạo Space Mới */}
      {isNewSpaceModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-cyan-500/30 rounded-2xl w-full max-w-sm p-5 shadow-2xl">
            <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <Plus className="w-4 h-4 text-cyan-400" />
              <span>Tạo Không Gian Học Thức Mới</span>
            </h3>
            <form onSubmit={handleCreateNewSpace} className="space-y-3">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Tên Bàn Học</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Ôn thi Đại số Tuyến tính"
                  value={newSpaceName}
                  onChange={(e) => setNewSpaceName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white outline-none focus:border-cyan-400"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Bộ Môn / Lĩnh Vực</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Toán học, Lập trình..."
                  value={newSpaceSubject}
                  onChange={(e) => setNewSpaceSubject(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white outline-none focus:border-cyan-400"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewSpaceModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-cyan-500 hover:bg-cyan-400 text-slate-950"
                >
                  Khởi Tạo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
