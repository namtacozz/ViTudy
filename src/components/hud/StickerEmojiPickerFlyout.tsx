'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  X, 
  Loader2, 
  Clock, 
  Smile, 
  Leaf, 
  Bus, 
  Lightbulb, 
  Flag,
  Sparkles
} from 'lucide-react';
import { 
  EMOJI_CATEGORIES, 
  STICKER_CATEGORIES, 
  SKIN_TONES,
  toTwemojiUrl,
  StickerPickerItem 
} from '@/data/stickersAndEmojis';
import { GiphyService } from '@/services/GiphyService';

export type { StickerPickerItem };

interface StickerEmojiPickerFlyoutProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (item: StickerPickerItem) => void;
}

const QUICK_GIF_TAGS = ['Study', 'Anime', 'Cat', 'Celebration', 'Coffee', 'Mind Blown', 'Work', 'Chill'];

export function StickerEmojiPickerFlyout({ isOpen, onClose, onSelect }: StickerEmojiPickerFlyoutProps) {
  const [activeTab, setActiveTab] = useState<'emojis' | 'stickers' | 'gifs' | 'all'>('emojis');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeEmojiCat, setActiveEmojiCat] = useState<string>('people');
  const [selectedStickerCat, setSelectedStickerCat] = useState<string>('funky_lines');
  
  // Skin tone state
  const [selectedSkinTone, setSelectedSkinTone] = useState<string>('default');
  const [isSkinTonePickerOpen, setIsSkinTonePickerOpen] = useState(false);

  // Recent emojis state (persisted to localStorage)
  const [recentEmojis, setRecentEmojis] = useState<StickerPickerItem[]>([]);

  // GIPHY Live state
  const [giphyGifs, setGiphyGifs] = useState<StickerPickerItem[]>([]);
  const [isLoadingGifs, setIsLoadingGifs] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Refs for category scrolling
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const categoryRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Load recents on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('vitudy:recent-emojis');
      if (saved) {
        setRecentEmojis(JSON.parse(saved));
      }
    } catch {
      // ignore
    }
  }, []);

  // Fetch GIPHY live when GIFs tab is opened or search changes
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
    }, 300);

    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [searchQuery, activeTab, isOpen]);

  if (!isOpen) return null;

  const handleSelectEmoji = (item: StickerPickerItem) => {
    // Save to recents
    const updated = [item, ...recentEmojis.filter((r) => r.id !== item.id)].slice(0, 14);
    setRecentEmojis(updated);
    try {
      localStorage.setItem('vitudy:recent-emojis', JSON.stringify(updated));
    } catch {
      // ignore
    }
    onSelect(item);
  };

  const handleClearRecents = () => {
    setRecentEmojis([]);
    try {
      localStorage.removeItem('vitudy:recent-emojis');
    } catch {
      // ignore
    }
  };

  const scrollToCategory = (catId: string) => {
    setActiveEmojiCat(catId);
    const targetEl = categoryRefs.current[catId];
    if (targetEl && scrollContainerRef.current) {
      targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const matchesSearch = (item: StickerPickerItem) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return item.name.toLowerCase().includes(q) || (item.content && item.content.includes(q));
  };

  const currentSkinToneObj = SKIN_TONES.find((s) => s.id === selectedSkinTone) || SKIN_TONES[0];

  // Apply skin tone modifier to hand/people emoji if applicable
  const getRenderContent = (item: StickerPickerItem) => {
    if (item.type !== 'emoji' || !currentSkinToneObj.code || !['wave', 'thumbs-up', 'thumbs-down', 'clap', 'pray', 'point-up', 'point-down', 'point-left', 'point-right', 'fist', 'peace', 'crossed-fingers', 'love-you'].includes(item.id.replace('em-', ''))) {
      return { content: item.content, url: item.url };
    }
    // Modify URL with skin tone code point
    const baseCode = item.id.replace('em-', '');
    const codePointMap: Record<string, string> = {
      'wave': '1f44b',
      'thumbs-up': '1f44d',
      'thumbs-down': '1f44e',
      'clap': '1f44f',
      'pray': '1f64f',
      'point-up': '261d',
      'point-down': '1f447',
      'point-left': '1f448',
      'point-right': '1f449',
      'fist': '1f44a',
      'peace': '270c',
      'crossed-fingers': '1f91e',
      'love-you': '1f91f'
    };
    const cp = codePointMap[baseCode];
    if (cp) {
      return {
        content: item.content,
        url: `https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/${cp}-${currentSkinToneObj.code}.svg`
      };
    }
    return { content: item.content, url: item.url };
  };

  return (
    <div
      onPointerDown={(e) => e.stopPropagation()}
      className="absolute left-16 top-0 w-[390px] h-[540px] bg-white border border-slate-300 shadow-2xl rounded-2xl flex flex-col z-50 overflow-hidden animate-fade-in select-none text-slate-800"
      style={{
        textRendering: 'geometricPrecision'
      }}
    >
      {/* Search Header */}
      <div className="p-2.5 border-b border-slate-200 flex items-center gap-2 bg-white">
        <div className="flex-1 relative flex items-center">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              activeTab === 'gifs'
                ? 'Tìm kiếm GIF trực tuyến từ GIPHY...'
                : activeTab === 'stickers'
                ? 'Tìm kiếm hình dán vector...'
                : 'Tìm kiếm biểu tượng cảm xúc (emoji)...'
            }
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-indigo-500 focus:bg-white transition-colors"
          />
        </div>
        <button
          onClick={onClose}
          title="Đóng bảng chọn"
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Main Tabs Header: Emojis | Stickers | GIFs | All */}
      <div className="flex items-center px-3 pt-2 pb-1 gap-1 border-b border-slate-100 text-xs font-semibold bg-slate-50/70">
        {(['emojis', 'stickers', 'gifs', 'all'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-1 rounded-lg capitalize transition-colors cursor-pointer ${
              activeTab === tab
                ? 'bg-indigo-600 text-white shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {tab === 'emojis' ? 'Emojis' : tab === 'stickers' ? 'Stickers' : tab === 'gifs' ? 'GIFs (Online)' : 'Tất cả'}
          </button>
        ))}
      </div>

      {/* ================= 1. MIRO 9-CATEGORY ICON SUBBAR FOR EMOJIS ================= */}
      {activeTab === 'emojis' && (
        <div className="flex items-center justify-between px-3 py-1.5 border-b border-slate-100 bg-white">
          {/* 1. Recent */}
          <button
            onClick={() => scrollToCategory('recent')}
            title="Đã dùng gần đây (Recent)"
            className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
              activeEmojiCat === 'recent'
                ? 'bg-blue-100 text-blue-600 ring-1 ring-blue-300 font-bold'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
            }`}
          >
            <Clock className="w-4 h-4" />
          </button>

          {/* 2. Smileys & People */}
          <button
            onClick={() => scrollToCategory('people')}
            title="Biểu cảm & Con người (Smileys & People)"
            className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
              activeEmojiCat === 'people'
                ? 'bg-blue-100 text-blue-600 ring-1 ring-blue-300 font-bold'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
            }`}
          >
            <Smile className="w-4 h-4" />
          </button>

          {/* 3. Animals & Nature */}
          <button
            onClick={() => scrollToCategory('nature')}
            title="Động vật & Tự nhiên (Animals & Nature)"
            className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
              activeEmojiCat === 'nature'
                ? 'bg-blue-100 text-blue-600 ring-1 ring-blue-300 font-bold'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
            }`}
          >
            <Leaf className="w-4 h-4" />
          </button>

          {/* 4. Food & Drink */}
          <button
            onClick={() => scrollToCategory('food')}
            title="Đồ ăn & Thức uống (Food & Drink)"
            className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
              activeEmojiCat === 'food'
                ? 'bg-blue-100 text-blue-600 ring-1 ring-blue-300 font-bold'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
            }`}
          >
            {/* Miro Burger Icon */}
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M19 10C19 6.13 15.87 3 12 3S5 6.13 5 10H19ZM4 12H20V14H4V12ZM5 16H19C19 18.21 16.79 20 14 20H10C7.21 20 5 18.21 5 16Z" />
            </svg>
          </button>

          {/* 5. Activities & Sports */}
          <button
            onClick={() => scrollToCategory('activities')}
            title="Hoạt động & Thể thao (Activities & Sports)"
            className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
              activeEmojiCat === 'activities'
                ? 'bg-blue-100 text-blue-600 ring-1 ring-blue-300 font-bold'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
            }`}
          >
            {/* Soccer ball icon */}
            <svg className="w-4 h-4 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="9" />
              <polygon points="12 8 15 11 14 15 10 15 9 11" fill="currentColor" stroke="none" />
            </svg>
          </button>

          {/* 6. Travel & Places */}
          <button
            onClick={() => scrollToCategory('travel')}
            title="Du lịch & Địa điểm (Travel & Places)"
            className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
              activeEmojiCat === 'travel'
                ? 'bg-blue-100 text-blue-600 ring-1 ring-blue-300 font-bold'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
            }`}
          >
            <Bus className="w-4 h-4" />
          </button>

          {/* 7. Objects */}
          <button
            onClick={() => scrollToCategory('objects')}
            title="Đồ vật & Dụng cụ (Objects & Tools)"
            className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
              activeEmojiCat === 'objects'
                ? 'bg-blue-100 text-blue-600 ring-1 ring-blue-300 font-bold'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
            }`}
          >
            <Lightbulb className="w-4 h-4" />
          </button>

          {/* 8. Symbols */}
          <button
            onClick={() => scrollToCategory('symbols')}
            title="Ký hiệu & Biểu trưng (Symbols)"
            className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
              activeEmojiCat === 'symbols'
                ? 'bg-blue-100 text-blue-600 ring-1 ring-blue-300 font-bold'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
            }`}
          >
            <Sparkles className="w-4 h-4" />
          </button>

          {/* 9. Flags */}
          <button
            onClick={() => scrollToCategory('flags')}
            title="Cờ các quốc gia (Flags)"
            className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
              activeEmojiCat === 'flags'
                ? 'bg-blue-100 text-blue-600 ring-1 ring-blue-300 font-bold'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
            }`}
          >
            <Flag className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ================= 2. CATEGORY SUBBAR FOR STICKERS ================= */}
      {activeTab === 'stickers' && (
        <div className="flex items-center px-3 py-1.5 border-b border-slate-100 bg-white overflow-x-auto gap-1.5 text-xs no-scrollbar">
          {STICKER_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedStickerCat(cat.id)}
              className={`px-2.5 py-1 rounded-full font-medium whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1 ${
                selectedStickerCat === cat.id
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

      {/* ================= 3. QUICK CHIPS FOR GIFS ================= */}
      {activeTab === 'gifs' && (
        <div className="flex items-center px-3 py-1.5 border-b border-slate-100 bg-white overflow-x-auto gap-1.5 text-xs no-scrollbar">
          {QUICK_GIF_TAGS.map((tag) => (
            <button
              key={tag}
              onClick={() => setSearchQuery(tag)}
              className={`px-2.5 py-0.5 rounded-full whitespace-nowrap transition-colors cursor-pointer text-[11px] font-semibold ${
                searchQuery.toLowerCase() === tag.toLowerCase()
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              #{tag}
            </button>
          ))}
        </div>
      )}

      {/* Main Content Area */}
      <div 
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto p-3 space-y-4"
      >
        {/* ================= 1. EMOJIS TAB (MIRO ACCURATE LAYOUT) ================= */}
        {activeTab === 'emojis' && (
          <div className="space-y-4">
            {/* Section A: Recent Emojis */}
            {(recentEmojis.length > 0 || !searchQuery) && (
              <div 
                ref={(el) => { categoryRefs.current['recent'] = el; }}
                className="space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">Recent</span>
                  {recentEmojis.length > 0 && (
                    <button
                      onClick={handleClearRecents}
                      className="text-[11px] text-blue-600 hover:underline font-medium cursor-pointer"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {recentEmojis.length > 0 ? (
                  <div className="grid grid-cols-7 gap-1">
                    {recentEmojis.filter(matchesSearch).map((item) => {
                      const rendered = getRenderContent(item);
                      return (
                        <button
                          key={`rec-${item.id}`}
                          onClick={() => handleSelectEmoji({ ...item, url: rendered.url })}
                          title={item.name}
                          className="w-10 h-10 rounded-lg hover:bg-slate-100 flex items-center justify-center transition-transform hover:scale-120 cursor-pointer active:scale-95"
                        >
                          {rendered.url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={rendered.url}
                              alt={item.name}
                              className="w-7 h-7 object-contain pointer-events-none"
                              loading="lazy"
                            />
                          ) : (
                            <span className="text-2xl">{item.content}</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-[11px] text-slate-400 italic py-1">
                    Chưa có biểu tượng gần đây. Nhấp vào bất kỳ biểu tượng nào để dùng!
                  </div>
                )}
              </div>
            )}

            {/* Section B: All 8 Emoji Categories */}
            {EMOJI_CATEGORIES.map((cat) => {
              const filteredItems = cat.items.filter(matchesSearch);
              if (filteredItems.length === 0) return null;

              return (
                <div
                  key={cat.id}
                  ref={(el) => { categoryRefs.current[cat.id] = el; }}
                  className="space-y-1.5 pt-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">{cat.label}</span>
                    
                    {/* Skin Tone Selector for People Category */}
                    {cat.id === 'people' && (
                      <div className="relative">
                        <button
                          onClick={() => setIsSkinTonePickerOpen(!isSkinTonePickerOpen)}
                          className="flex items-center gap-1 text-[11px] font-medium text-slate-600 hover:text-slate-900 bg-slate-100 px-2 py-0.5 rounded-full cursor-pointer transition-colors"
                        >
                          <span>Skin tone</span>
                          <span>{currentSkinToneObj.icon}</span>
                        </button>

                        {/* Skin Tone Dropdown Popover */}
                        {isSkinTonePickerOpen && (
                          <div className="absolute right-0 top-6 bg-white border border-slate-200 shadow-xl rounded-xl p-1.5 flex gap-1 z-50">
                            {SKIN_TONES.map((tone) => (
                              <button
                                key={tone.id}
                                onClick={() => {
                                  setSelectedSkinTone(tone.id);
                                  setIsSkinTonePickerOpen(false);
                                }}
                                title={tone.label}
                                className={`w-7 h-7 rounded-lg flex items-center justify-center text-lg hover:bg-slate-100 transition-transform hover:scale-120 cursor-pointer ${
                                  selectedSkinTone === tone.id ? 'bg-indigo-50 ring-1 ring-indigo-400' : ''
                                }`}
                              >
                                {tone.icon}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* 7 Columns Grid of Twemoji SVGs (Razor-sharp vector rendering at all zoom levels) */}
                  <div className="grid grid-cols-7 gap-1">
                    {filteredItems.map((item) => {
                      const rendered = getRenderContent(item);
                      return (
                        <button
                          key={item.id}
                          onClick={() => handleSelectEmoji({ ...item, url: rendered.url })}
                          title={item.name}
                          className="w-10 h-10 rounded-lg hover:bg-slate-100 flex items-center justify-center transition-transform hover:scale-120 cursor-pointer active:scale-95"
                        >
                          {rendered.url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={rendered.url}
                              alt={item.name}
                              className="w-7 h-7 object-contain pointer-events-none"
                              loading="lazy"
                            />
                          ) : (
                            <span className="text-2xl">{item.content}</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ================= 2. STICKERS TAB ================= */}
        {activeTab === 'stickers' && (
          <div>
            {(() => {
              const currentCat = STICKER_CATEGORIES.find((c) => c.id === selectedStickerCat) || STICKER_CATEGORIES[0];
              const filtered = currentCat.items.filter(matchesSearch);

              return (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">{currentCat.label}</span>
                    <span className="text-[11px] text-slate-400">{filtered.length} hình dán</span>
                  </div>

                  <div className="grid grid-cols-4 gap-2.5">
                    {filtered.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => onSelect(item)}
                        title={item.name}
                        className="aspect-square p-2 rounded-xl border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/20 flex items-center justify-center transition-all hover:scale-105 cursor-pointer bg-white shadow-2xs"
                      >
                        <div
                          className="w-full h-full flex items-center justify-center pointer-events-none [&>svg]:w-full [&>svg]:h-full"
                          dangerouslySetInnerHTML={{ __html: item.content }}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* ================= 3. GIFS TAB (DIRECT ONLINE GIPHY API) ================= */}
        {activeTab === 'gifs' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-700">
                  {searchQuery.trim() ? `Kết quả cho "${searchQuery}"` : 'Thịnh hành trên GIPHY'}
                </span>
                <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded font-mono font-bold">
                  TRỰC TUYẾN
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-semibold tracking-wider">
                GIPHY
              </span>
            </div>

            {isLoadingGifs && (
              <div className="flex flex-col items-center justify-center py-14 text-slate-400 gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
                <span className="text-xs">Đang tìm kiếm kho GIF trực tuyến...</span>
              </div>
            )}

            {!isLoadingGifs && giphyGifs.length === 0 && (
              <div className="text-center py-14 text-slate-400 text-xs">
                Không tìm thấy GIF nào phù hợp. Hãy thử từ khóa khác!
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

        {/* ================= 4. ALL TAB (COMBO HIGHLIGHTS) ================= */}
        {activeTab === 'all' && (
          <div className="space-y-4">
            {/* Top Stickers */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-700">Hình dán tiêu biểu (Stickers)</span>
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
                    className="aspect-square p-2 rounded-xl border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/20 flex items-center justify-center transition-all hover:scale-105 cursor-pointer bg-white"
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
                <span className="text-xs font-bold text-slate-700">Biểu tượng cảm xúc (Emojis)</span>
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
                    onClick={() => handleSelectEmoji(item)}
                    title={item.name}
                    className="w-10 h-10 rounded-lg hover:bg-slate-100 flex items-center justify-center transition-transform hover:scale-120 cursor-pointer active:scale-95"
                  >
                    {item.url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.url}
                        alt={item.name}
                        className="w-7 h-7 object-contain pointer-events-none"
                        loading="lazy"
                      />
                    ) : (
                      <span className="text-2xl">{item.content}</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Live GIPHY Highlights */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-700">Ảnh GIF động (GIPHY)</span>
                <button
                  onClick={() => setActiveTab('gifs')}
                  className="text-[11px] text-indigo-600 hover:underline font-medium cursor-pointer"
                >
                  Xem tất cả
                </button>
              </div>
              {giphyGifs.length > 0 && (
                <div className="grid grid-cols-2 gap-2">
                  {giphyGifs.slice(0, 4).map((item) => (
                    <button
                      key={item.id}
                      onClick={() => onSelect(item)}
                      title={item.name}
                      className="relative aspect-video rounded-xl overflow-hidden border border-slate-200 hover:border-indigo-500 hover:shadow-md transition-all hover:scale-[1.02] cursor-pointer bg-slate-950"
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
