'use client';

import React, { useState } from 'react';
import { Search, X } from 'lucide-react';

export interface StickerPickerItem {
  id: string;
  name: string;
  type: 'emoji' | 'sticker' | 'gif';
  content: string;
  url?: string;
  isSvg?: boolean;
}

// Crisp Vector SVG Emojis matching Image 1
export const EMOJI_ITEMS: StickerPickerItem[] = [
  {
    id: 'em-thumbs-up',
    name: 'Tuyệt vời',
    type: 'emoji',
    isSvg: true,
    content: `<svg viewBox="0 0 36 36" width="36" height="36"><path fill="#FFCC4D" stroke="#000000" stroke-width="1.8" stroke-linejoin="round" d="M12 16v16H6a3 3 0 0 1-3-3V19a3 3 0 0 1 3-3h6zm4 0V9a5 5 0 0 1 5-5c1.5 0 2 1 2 3v5h8a4 4 0 0 1 4 4c0 1-.3 2-.8 2.8.5.8.8 1.8.8 2.8 0 1.2-.5 2.2-1.2 3 .5.8.8 1.8.8 2.8 0 2.2-1.8 4-4 4H16V16z"/></svg>`
  },
  {
    id: 'em-check-box',
    name: 'Đã hoàn thành',
    type: 'emoji',
    isSvg: true,
    content: `<svg viewBox="0 0 36 36" width="36" height="36"><rect x="3" y="3" width="30" height="30" rx="4" fill="#5cbb26" stroke="#000000" stroke-width="2.2"/><polyline points="9 18 16 25 27 11" fill="none" stroke="#000000" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`
  },
  {
    id: 'em-star',
    name: 'Ngôi sao điểm 10',
    type: 'emoji',
    isSvg: true,
    content: `<svg viewBox="0 0 36 36" width="36" height="36"><polygon points="18 2 23 12 34 14 26 22 28 33 18 28 8 33 10 22 2 14 13 12" fill="#FFCC4D" stroke="#000000" stroke-width="2" stroke-linejoin="round"/></svg>`
  },
  {
    id: 'em-checkmark',
    name: 'Tích xanh',
    type: 'emoji',
    isSvg: true,
    content: `<svg viewBox="0 0 36 36" width="36" height="36"><polyline points="6 19 14 27 30 9" fill="none" stroke="#16a34a" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`
  },
  {
    id: 'em-cross',
    name: 'Dấu sai',
    type: 'emoji',
    isSvg: true,
    content: `<svg viewBox="0 0 36 36" width="36" height="36"><line x1="8" y1="8" x2="28" y2="28" stroke="#dc2626" stroke-width="4.5" stroke-linecap="round"/><line x1="28" y1="8" x2="8" y2="28" stroke="#dc2626" stroke-width="4.5" stroke-linecap="round"/></svg>`
  },
  {
    id: 'em-question',
    name: 'Cần giải đáp',
    type: 'emoji',
    isSvg: true,
    content: `<svg viewBox="0 0 36 36" width="36" height="36"><text x="18" y="28" font-size="32" font-family="sans-serif" font-weight="900" fill="#dc2626" stroke="#000000" stroke-width="1.2" text-anchor="middle">?</text></svg>`
  },
  {
    id: 'em-happy',
    name: 'Vui vẻ',
    type: 'emoji',
    isSvg: true,
    content: `<svg viewBox="0 0 36 36" width="36" height="36"><circle cx="18" cy="18" r="15" fill="#FFCC4D" stroke="#000000" stroke-width="1.8"/><circle cx="13" cy="14" r="2" fill="#000"/><circle cx="23" cy="14" r="2" fill="#000"/><path d="M11 20 Q18 28 25 20 Z" fill="#000"/></svg>`
  },
  {
    id: 'em-smirk',
    name: 'Bí ẩn',
    type: 'emoji',
    isSvg: true,
    content: `<svg viewBox="0 0 36 36" width="36" height="36"><circle cx="18" cy="18" r="15" fill="#FFCC4D" stroke="#000000" stroke-width="1.8"/><circle cx="12" cy="14" r="2" fill="#000"/><circle cx="24" cy="14" r="2" fill="#000"/><path d="M14 23 Q20 26 24 21" fill="none" stroke="#000" stroke-width="2" stroke-linecap="round"/></svg>`
  },
  {
    id: 'em-heart',
    name: 'Yêu thích',
    type: 'emoji',
    isSvg: true,
    content: `<svg viewBox="0 0 36 36" width="36" height="36"><path d="M18 31 C8 23 3 17 3 11 A8 8 0 0 1 18 7 A8 8 0 0 1 33 11 C33 17 28 23 18 31 Z" fill="#e11d48" stroke="#000000" stroke-width="1.8"/></svg>`
  },
  {
    id: 'em-thinking',
    name: 'Đang suy nghĩ',
    type: 'emoji',
    isSvg: true,
    content: `<svg viewBox="0 0 36 36" width="36" height="36"><circle cx="18" cy="18" r="15" fill="#FFCC4D" stroke="#000000" stroke-width="1.8"/><ellipse cx="14" cy="13" rx="2" ry="2.5" fill="#000"/><ellipse cx="23" cy="13" rx="2" ry="2.5" fill="#000"/><line x1="12" y1="23" x2="22" y2="22" stroke="#000" stroke-width="2" stroke-linecap="round"/><path d="M10 28 Q18 32 24 26" fill="none" stroke="#d97706" stroke-width="3" stroke-linecap="round"/></svg>`
  },
  {
    id: 'em-heart-eyes',
    name: 'Mê mẩn',
    type: 'emoji',
    isSvg: true,
    content: `<svg viewBox="0 0 36 36" width="36" height="36"><circle cx="18" cy="18" r="15" fill="#FFCC4D" stroke="#000000" stroke-width="1.8"/><path d="M12 15 C8 12 7 8 10 7 A3 3 0 0 1 14 9 A3 3 0 0 1 17 7 C20 8 18 12 14 15 Z" fill="#e11d48"/><path d="M24 15 C20 12 19 8 22 7 A3 3 0 0 1 26 9 A3 3 0 0 1 29 7 C32 8 30 12 26 15 Z" fill="#e11d48"/><path d="M12 22 Q18 29 24 22 Z" fill="#000"/></svg>`
  },
  {
    id: 'em-star-eyes',
    name: 'Hứng khởi',
    type: 'emoji',
    isSvg: true,
    content: `<svg viewBox="0 0 36 36" width="36" height="36"><circle cx="18" cy="18" r="15" fill="#FFCC4D" stroke="#000000" stroke-width="1.8"/><polygon points="13 9 14.5 13 19 13 15.5 15.5 17 19.5 13 17 9 19.5 10.5 15.5 7 13 11.5 13" fill="#e11d48"/><polygon points="23 9 24.5 13 29 13 25.5 15.5 27 19.5 23 17 19 19.5 20.5 15.5 17 13 21.5 13" fill="#e11d48"/><path d="M11 22 Q18 30 25 22 Z" fill="#000"/></svg>`
  },
  {
    id: 'em-cool',
    name: 'Tự tin ngầu',
    type: 'emoji',
    isSvg: true,
    content: `<svg viewBox="0 0 36 36" width="36" height="36"><circle cx="18" cy="18" r="15" fill="#FFCC4D" stroke="#000000" stroke-width="1.8"/><rect x="8" y="11" width="9" height="7" rx="3" fill="#0f172a"/><rect x="19" y="11" width="9" height="7" rx="3" fill="#0f172a"/><line x1="17" y1="13" x2="19" y2="13" stroke="#0f172a" stroke-width="2"/><path d="M12 23 Q18 28 24 23" fill="none" stroke="#000" stroke-width="2" stroke-linecap="round"/></svg>`
  }
];

// Stickers matching Image 1 top row
export const STICKER_ITEMS: StickerPickerItem[] = [
  {
    id: 'st-100',
    name: '100 Điểm',
    type: 'sticker',
    isSvg: true,
    content: `<svg viewBox="0 0 48 48" width="48" height="48"><rect width="44" height="44" x="2" y="2" rx="10" fill="#a855f7" stroke="#7e22ce" stroke-width="2"/><text x="24" y="30" font-size="20" font-family="sans-serif" font-weight="900" fill="#ffffff" text-anchor="middle">100</text></svg>`
  },
  {
    id: 'st-brain',
    name: 'Bộ não tư duy',
    type: 'sticker',
    isSvg: true,
    content: `<svg viewBox="0 0 48 48" width="48" height="48"><path d="M24 10 C18 10 14 14 14 18 C11 19 9 22 9 26 C9 30 12 33 16 34 C16 37 19 40 23 40 L24 40 L25 40 C29 40 32 37 32 34 C36 33 39 30 39 26 C39 22 37 19 34 18 C34 14 30 10 24 10 Z" fill="#22c55e" stroke="#15803d" stroke-width="2.5"/></svg>`
  },
  {
    id: 'st-hat',
    name: 'Mũ cử nhân',
    type: 'sticker',
    isSvg: true,
    content: `<svg viewBox="0 0 48 48" width="48" height="48"><polygon points="24 8 44 18 24 28 4 18" fill="#eab308" stroke="#a16207" stroke-width="2.5"/><path d="M12 23v10c0 4 5 7 12 7s12-3 12-7V23" fill="none" stroke="#a16207" stroke-width="2.5"/></svg>`
  },
  {
    id: 'st-bunny',
    name: 'Tai thỏ chăm học',
    type: 'sticker',
    isSvg: true,
    content: `<svg viewBox="0 0 48 48" width="48" height="48"><path d="M16 38 C14 26 12 12 18 8 C23 5 24 14 22 38 Z" fill="#f472b6" stroke="#db2777" stroke-width="2"/><path d="M32 38 C34 26 36 12 30 8 C25 5 24 14 26 38 Z" fill="#f472b6" stroke="#db2777" stroke-width="2"/></svg>`
  },
  {
    id: 'st-flame',
    name: 'Ngọn lửa quyết tâm',
    type: 'sticker',
    isSvg: true,
    content: `<svg viewBox="0 0 48 48" width="48" height="48"><path d="M24 4 C24 12 34 16 34 26 A10 10 0 0 1 14 26 C14 18 20 14 24 4 Z" fill="#f97316" stroke="#c2410c" stroke-width="2"/><circle cx="24" cy="28" r="4" fill="#fef08a"/></svg>`
  }
];

// GIFs matching Image 1 bottom row (Study / Meme Reactions)
export const GIF_ITEMS: StickerPickerItem[] = [
  {
    id: 'gif-study-cat',
    name: 'Mèo học bài',
    type: 'gif',
    content: '',
    url: 'https://media.giphy.com/media/unQ3IJU2RG7DO/giphy.gif'
  },
  {
    id: 'gif-typing',
    name: 'Lập trình viên gõ code',
    type: 'gif',
    content: '',
    url: 'https://media.giphy.com/media/LmN8OYiY4m0X85al0A/giphy.gif'
  },
  {
    id: 'gif-clap',
    name: 'Vỗ tay tán thưởng',
    type: 'gif',
    content: '',
    url: 'https://media.giphy.com/media/nbvFVPiEiJH6JOGIok/giphy.gif'
  },
  {
    id: 'gif-mindblown',
    name: 'Não nở hoa',
    type: 'gif',
    content: '',
    url: 'https://media.giphy.com/media/26ufdipQqU2lhNA4g/giphy.gif'
  }
];

interface StickerEmojiPickerFlyoutProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (item: StickerPickerItem) => void;
}

export function StickerEmojiPickerFlyout({ isOpen, onClose, onSelect }: StickerEmojiPickerFlyoutProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'stickers' | 'emojis' | 'gifs'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const matchesSearch = (item: StickerPickerItem) => {
    if (!searchQuery.trim()) return true;
    return item.name.toLowerCase().includes(searchQuery.toLowerCase());
  };

  const filteredEmojis = EMOJI_ITEMS.filter(matchesSearch);
  const filteredStickers = STICKER_ITEMS.filter(matchesSearch);
  const filteredGifs = GIF_ITEMS.filter(matchesSearch);

  return (
    <div
      onPointerDown={(e) => e.stopPropagation()}
      className="absolute left-16 top-0 w-80 max-h-[460px] bg-white border border-slate-200/90 shadow-2xl rounded-2xl flex flex-col z-50 overflow-hidden animate-fade-in select-none"
    >
      {/* Search Header: Matches Image 1 */}
      <div className="p-3 border-b border-slate-100 flex items-center gap-2">
        <div className="flex-1 relative flex items-center">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search"
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-indigo-400 focus:bg-white transition-all"
          />
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Tabs Filter: All | Stickers | Emojis | GIFs */}
      <div className="flex items-center px-3 pt-2 pb-1 gap-1 border-b border-slate-100 text-xs font-semibold">
        {(['all', 'stickers', 'emojis', 'gifs'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-1 rounded-lg capitalize transition-colors ${
              activeTab === tab
                ? 'bg-indigo-50 text-indigo-600 font-bold'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
            }`}
          >
            {tab === 'all' ? 'All' : tab === 'stickers' ? 'Stickers' : tab === 'emojis' ? 'Emojis' : 'GIFs'}
          </button>
        ))}
      </div>

      {/* Content Scroll View */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {/* Top Stickers Section */}
        {(activeTab === 'all' || activeTab === 'stickers') && filteredStickers.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700">Stickers</span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {filteredStickers.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onSelect(item)}
                  title={item.name}
                  className="p-2 rounded-xl border border-slate-100 hover:border-indigo-300 hover:bg-indigo-50/40 flex items-center justify-center transition-all hover:scale-105 cursor-pointer"
                >
                  <div dangerouslySetInnerHTML={{ __html: item.content }} />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Emojis Section: Matches Image 1 */}
        {(activeTab === 'all' || activeTab === 'emojis') && filteredEmojis.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700">Emojis</span>
              <span className="text-[11px] text-slate-400 font-medium">Show all</span>
            </div>
            <div className="grid grid-cols-6 gap-1.5">
              {filteredEmojis.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onSelect(item)}
                  title={item.name}
                  className="p-1.5 rounded-lg hover:bg-slate-100 flex items-center justify-center transition-transform hover:scale-115 cursor-pointer"
                >
                  <div dangerouslySetInnerHTML={{ __html: item.content }} />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* GIPHY / GIFs Section: Matches Image 1 */}
        {(activeTab === 'all' || activeTab === 'gifs') && filteredGifs.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700">GIPHY</span>
              <span className="text-[11px] text-slate-400 font-medium">Show all</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {filteredGifs.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onSelect(item)}
                  title={item.name}
                  className="rounded-xl overflow-hidden border border-slate-200 hover:border-indigo-400 hover:shadow-md transition-all hover:scale-102 cursor-pointer h-20 bg-slate-900"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.url}
                    alt={item.name}
                    className="w-full h-full object-cover pointer-events-none"
                    loading="lazy"
                  />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
