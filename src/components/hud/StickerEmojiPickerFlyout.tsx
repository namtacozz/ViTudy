'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Loader2, Sparkles } from 'lucide-react';
import { 
  EMOJI_CATEGORIES, 
  STICKER_CATEGORIES, 
  StickerPickerItem 
} from '@/data/stickersAndEmojis';
import { GiphyService } from '@/services/GiphyService';

export type { StickerPickerItem };

interface StickerEmojiPickerFlyoutProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (item: StickerPickerItem) => void;
}

export function StickerEmojiPickerFlyout({ isOpen, onClose, onSelect }: StickerEmojiPickerFlyoutProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'stickers' | 'emojis' | 'gifs'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEmojiCategory, setSelectedEmojiCategory] = useState<string>('people');
  const [selectedStickerCategory, setSelectedStickerCategory] = useState<string>('funky_lines');

  // GIPHY Live state
  const [giphyGifs, setGiphyGifs] = useState<StickerPickerItem[]>([]);
  const [isLoadingGifs, setIsLoadingGifs] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch GIPHY when entering GIFs tab or search query changes
  useEffect(() => {
    if (!isOpen) return;
    if (activeTab !== 'gifs' && activeTab !== 'all') return;

    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    searchTimeoutRef.current = setTimeout(async () => {
      setIsLoadingGifs(true);
      try {
        const results = await GiphyService.search(searchQuery, 24);
        setGiphyGifs(results);
      } finally {
        setIsLoadingGifs(false);
      }
    }, 350);

    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [searchQuery, activeTab, isOpen]);

  if (!isOpen) return null;

  const matchesSearch = (item: StickerPickerItem) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return item.name.toLowerCase().includes(q) || (item.content && item.content.includes(q));
  };

  const currentEmojiCat = EMOJI_CATEGORIES.find(c => c.id === selectedEmojiCategory) || EMOJI_CATEGORIES[0];
  const currentStickerCat = STICKER_CATEGORIES.find(c => c.id === selectedStickerCategory) || STICKER_CATEGORIES[0];

  return (
    <div
      onPointerDown={(e) => e.stopPropagation()}
      className="absolute left-16 top-0 w-[380px] h-[520px] bg-white border border-slate-200 shadow-2xl rounded-2xl flex flex-col z-50 overflow-hidden animate-fade-in select-none text-slate-800"
      style={{
        textRendering: 'geometricPrecision',
        WebkitFontSmoothing: 'antialiased'
      }}
    >
      {/* Search Header */}
      <div className="p-3 border-b border-slate-100 flex items-center gap-2 bg-white">
        <div className="flex-1 relative flex items-center">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={activeTab === 'gifs' ? 'Tìm GIF trực tuyến từ GIPHY...' : 'Tìm kiếm emoji, sticker, gif...'}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-indigo-500 focus:bg-white transition-colors"
          />
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Main Tabs Header: All | Stickers | Emojis | GIFs */}
      <div className="flex items-center px-3 pt-2 pb-1 gap-1 border-b border-slate-100 text-xs font-semibold bg-slate-50/50">
        {(['all', 'stickers', 'emojis', 'gifs'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-1 rounded-lg capitalize transition-colors cursor-pointer ${
              activeTab === tab
                ? 'bg-indigo-600 text-white shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {tab === 'all' ? 'All' : tab === 'stickers' ? 'Stickers' : tab === 'emojis' ? 'Emojis' : 'GIFs'}
          </button>
        ))}
      </div>

      {/* Secondary Category Subbar for Emojis (Miro Style - Image 1) */}
      {activeTab === 'emojis' && (
        <div className="flex items-center justify-between px-3 py-1.5 border-b border-slate-100 bg-white overflow-x-auto gap-1 text-base no-scrollbar">
          {EMOJI_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedEmojiCategory(cat.id)}
              title={cat.label}
              className={`w-7 h-7 rounded-lg flex items-center justify-center transition-transform cursor-pointer ${
                selectedEmojiCategory === cat.id
                  ? 'bg-indigo-50 scale-110 text-indigo-600 ring-1 ring-indigo-300'
                  : 'hover:bg-slate-100 text-slate-600'
              }`}
            >
              <span>{cat.icon}</span>
            </button>
          ))}
        </div>
      )}

      {/* Secondary Category Subbar for Stickers (Miro Style - Image 2) */}
      {activeTab === 'stickers' && (
        <div className="flex items-center px-3 py-1.5 border-b border-slate-100 bg-white overflow-x-auto gap-1.5 text-xs no-scrollbar">
          {STICKER_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedStickerCategory(cat.id)}
              className={`px-2.5 py-1 rounded-full font-medium whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1 ${
                selectedStickerCategory === cat.id
                  ? 'bg-slate-900 text-white font-bold shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {/* ================= 1. EMOJIS TAB ================= */}
        {activeTab === 'emojis' && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700">{currentEmojiCat.label}</span>
              <span className="text-[11px] text-slate-400">
                {currentEmojiCat.items.filter(matchesSearch).length} biểu tượng
              </span>
            </div>
            <div className="grid grid-cols-7 gap-1">
              {currentEmojiCat.items.filter(matchesSearch).map((item) => (
                <button
                  key={item.id}
                  onClick={() => onSelect(item)}
                  title={item.name}
                  className="w-10 h-10 rounded-lg hover:bg-slate-100 flex items-center justify-center text-2xl transition-transform hover:scale-125 cursor-pointer active:scale-95"
                >
                  <span style={{ textRendering: 'geometricPrecision' }}>{item.content}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ================= 2. STICKERS TAB ================= */}
        {activeTab === 'stickers' && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700">{currentStickerCat.label}</span>
              <span className="text-[11px] text-slate-400">
                {currentStickerCat.items.filter(matchesSearch).length} hình dán
              </span>
            </div>
            <div className="grid grid-cols-4 gap-2.5">
              {currentStickerCat.items.filter(matchesSearch).map((item) => (
                <button
                  key={item.id}
                  onClick={() => onSelect(item)}
                  title={item.name}
                  className="aspect-square p-2 rounded-xl border border-slate-100 hover:border-indigo-300 hover:bg-indigo-50/30 flex items-center justify-center transition-all hover:scale-105 cursor-pointer"
                >
                  <div 
                    className="w-full h-full flex items-center justify-center pointer-events-none [&>svg]:w-full [&>svg]:h-full"
                    dangerouslySetInnerHTML={{ __html: item.content }} 
                  />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ================= 3. GIFS TAB (LIVE GIPHY ONLINE) ================= */}
        {activeTab === 'gifs' && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-700">
                  {searchQuery.trim() ? `Kết quả cho "${searchQuery}"` : 'Thịnh hành trên GIPHY'}
                </span>
                <span className="text-[10px] bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded font-mono font-bold">
                  LIVE
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-semibold tracking-wider">
                GIPHY
              </span>
            </div>

            {isLoadingGifs && (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400 gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
                <span className="text-xs">Đang tải kho GIF trực tuyến...</span>
              </div>
            )}

            {!isLoadingGifs && giphyGifs.length === 0 && (
              <div className="text-center py-12 text-slate-400 text-xs">
                Không tìm thấy ảnh GIF nào phù hợp. Hãy thử từ khóa khác!
              </div>
            )}

            {!isLoadingGifs && giphyGifs.length > 0 && (
              <div className="grid grid-cols-2 gap-2">
                {giphyGifs.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => onSelect(item)}
                    title={item.name}
                    className="group/gif relative aspect-video rounded-xl overflow-hidden border border-slate-200 hover:border-indigo-500 hover:shadow-lg transition-all hover:scale-[1.02] cursor-pointer bg-slate-950 flex items-center justify-center"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.url}
                      alt={item.name}
                      loading="lazy"
                      className="w-full h-full object-cover pointer-events-none group-hover/gif:opacity-95"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover/gif:opacity-100 transition-opacity flex items-end p-1.5">
                      <span className="text-[10px] text-white font-medium truncate w-full">
                        {item.name}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ================= 4. ALL TAB (HIGHLIGHTS) ================= */}
        {activeTab === 'all' && (
          <div className="space-y-4">
            {/* Top Funky Stickers */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-700">Funky Lines Stickers</span>
                <button
                  onClick={() => setActiveTab('stickers')}
                  className="text-[11px] text-indigo-600 hover:underline font-medium cursor-pointer"
                >
                  Xem tất cả
                </button>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {STICKER_CATEGORIES[0].items.slice(0, 8).map((item) => (
                  <button
                    key={item.id}
                    onClick={() => onSelect(item)}
                    title={item.name}
                    className="p-1.5 rounded-xl border border-slate-100 hover:border-indigo-300 hover:bg-indigo-50/30 flex items-center justify-center transition-transform hover:scale-105 cursor-pointer"
                  >
                    <div 
                      className="w-full h-full flex items-center justify-center pointer-events-none [&>svg]:w-full [&>svg]:h-full"
                      dangerouslySetInnerHTML={{ __html: item.content }} 
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Popular Emojis */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-700">Popular Emojis</span>
                <button
                  onClick={() => setActiveTab('emojis')}
                  className="text-[11px] text-indigo-600 hover:underline font-medium cursor-pointer"
                >
                  Xem tất cả
                </button>
              </div>
              <div className="grid grid-cols-7 gap-1">
                {EMOJI_CATEGORIES[0].items.slice(0, 14).map((item) => (
                  <button
                    key={item.id}
                    onClick={() => onSelect(item)}
                    title={item.name}
                    className="w-10 h-10 rounded-lg hover:bg-slate-100 flex items-center justify-center text-2xl transition-transform hover:scale-125 cursor-pointer"
                  >
                    <span>{item.content}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* GIPHY Highlights */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-700">GIPHY Trending</span>
                <button
                  onClick={() => setActiveTab('gifs')}
                  className="text-[11px] text-indigo-600 hover:underline font-medium cursor-pointer"
                >
                  Tìm kiếm trực tuyến
                </button>
              </div>
              {isLoadingGifs ? (
                <div className="flex justify-center py-6">
                  <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {giphyGifs.slice(0, 4).map((item) => (
                    <button
                      key={item.id}
                      onClick={() => onSelect(item)}
                      title={item.name}
                      className="aspect-video rounded-xl overflow-hidden border border-slate-200 hover:border-indigo-500 hover:shadow-md transition-all hover:scale-[1.02] cursor-pointer bg-slate-900"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.url}
                        alt={item.name}
                        loading="lazy"
                        className="w-full h-full object-cover pointer-events-none"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
