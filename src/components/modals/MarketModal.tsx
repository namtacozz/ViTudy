'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useStudySpace } from '@/context/StudySpaceContext';
import { useViToken } from '@/context/ViTokenContext';
import { 
  Store, 
  X, 
  Plus, 
  Search, 
  BookOpen, 
  FileText, 
  CheckCircle2, 
  Calendar,
  AlertCircle,
  Eye,
  RotateCcw,
  LayoutGrid,
  List,
  Check,
  HelpCircle,
  Clock,
  Layers,
  ArrowRight
} from 'lucide-react';
import { KnowInheritPublishModal } from './KnowInheritPublishModal';
import { INITIAL_MARKET_ITEMS, MarketItem } from '@/data/marketMockData';

interface MarketModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MarketModal({ isOpen, onClose }: MarketModalProps) {
  const { addUploadedDocument, addExamSheet, activeSpace } = useStudySpace();
  const { purchaseKnowledgeItem, addTokens, wallet } = useViToken();

  const [isPublishOpen, setIsPublishOpen] = useState(false);
  const [selectedDeskItemId, setSelectedDeskItemId] = useState<string>('');
  const [marketItems, setMarketItems] = useState<MarketItem[]>(INITIAL_MARKET_ITEMS);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | 'book' | 'paper' | 'exam'>('all');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'math' | 'ai_ml' | 'cs' | 'software' | 'data'>('all');
  const [minScore, setMinScore] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(0);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'score' | 'price_asc'>('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Preview Modal state
  const [previewItem, setPreviewItem] = useState<MarketItem | null>(null);

  // Keyboard shortcut Esc
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (previewItem) {
          setPreviewItem(null);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, previewItem, onClose]);

  // Parse DD/MM/YYYY to timestamp
  const parseDateToTime = (dStr: string) => {
    const parts = dStr.split('/');
    if (parts.length === 3) {
      return new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0])).getTime();
    }
    return 0;
  };

  // Check if any filter is active
  const hasActiveFilters = searchQuery.trim() !== '' || 
    selectedType !== 'all' || 
    selectedCategory !== 'all' || 
    minScore > 0 || 
    maxPrice > 0;

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedType('all');
    setSelectedCategory('all');
    setMinScore(0);
    setMaxPrice(0);
    setSortBy('newest');
  };

  // Filtered & sorted items
  const filteredItems = useMemo(() => {
    return marketItems.filter(item => {
      // Search query (title, author, summary)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesTitle = item.title.toLowerCase().includes(query);
        const matchesAuthor = item.author.toLowerCase().includes(query);
        const matchesSummary = item.summary.toLowerCase().includes(query);
        if (!matchesTitle && !matchesAuthor && !matchesSummary) return false;
      }

      // Type filter
      if (selectedType !== 'all' && item.type !== selectedType) {
        return false;
      }

      // Category filter
      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false;
      }

      // Min score filter
      if (minScore > 0 && item.aiScore < minScore) {
        return false;
      }

      // Max price filter
      if (maxPrice > 0 && item.price > maxPrice) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'newest') {
        return parseDateToTime(b.date) - parseDateToTime(a.date);
      }
      if (sortBy === 'oldest') {
        return parseDateToTime(a.date) - parseDateToTime(b.date);
      }
      if (sortBy === 'score') {
        return b.aiScore - a.aiScore;
      }
      if (sortBy === 'price_asc') {
        return a.price - b.price;
      }
      return 0;
    });
  }, [marketItems, searchQuery, selectedType, selectedCategory, minScore, maxPrice, sortBy]);

  const handleBuyMarketItem = (item: MarketItem) => {
    setErrorMessage(null);

    // If already purchased, just open it on the desk
    if (item.purchased) {
      if (item.type === 'exam' && item.examQuestions && item.examQuestions.length > 0) {
        addExamSheet(item.title, item.examQuestions, 20);
      } else {
        const rawPages = item.pages && item.pages.length > 0
          ? item.pages
          : [
              {
                title: item.title,
                text: `${item.summary}\n\n${item.previewText}\n\n[Tài liệu đã mở từ tác giả ${item.author}]`
              }
            ];
        addUploadedDocument(item.title, rawPages);
      }
      onClose();
      return;
    }

    if (wallet.balance < item.price) {
      setErrorMessage(`Số dư không đủ! Bạn có ${wallet.balance} ViToken, tài liệu này cần ${item.price} ViToken. Hãy điểm danh hàng ngày để nhận thêm.`);
      return;
    }

    const success = purchaseKnowledgeItem(item.price, item.title, item.author);
    if (success) {
      setMarketItems(items =>
        items.map(i => (i.id === item.id ? { ...i, purchased: true } : i))
      );

      // Mount to desk depending on type
      if (item.type === 'exam' && item.examQuestions && item.examQuestions.length > 0) {
        addExamSheet(item.title, item.examQuestions, 20);
      } else {
        const rawPages = item.pages && item.pages.length > 0
          ? item.pages
          : [
              {
                title: item.title,
                text: `${item.summary}\n\n${item.previewText}\n\n[Tài liệu đã mở khoá thành công từ tác giả ${item.author}]`
              }
            ];
        addUploadedDocument(item.title, rawPages);
      }

      onClose();
    } else {
      setErrorMessage('Giao dịch không thành công. Vui lòng kiểm tra lại số dư ví.');
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'math': return 'Toán học';
      case 'ai_ml': return 'Trí tuệ nhân tạo';
      case 'cs': return 'Khoa học máy tính';
      case 'software': return 'Kỹ thuật phần mềm';
      case 'data': return 'Khoa học dữ liệu';
      default: return category;
    }
  };

  const getTypeLabel = (type: 'book' | 'paper' | 'exam') => {
    switch (type) {
      case 'book': return 'Sách';
      case 'paper': return 'Tờ tóm tắt';
      case 'exam': return 'Đề thi';
    }
  };

  const getDescriptionLabel = (type: 'book' | 'paper' | 'exam') => {
    switch (type) {
      case 'book': return 'MÔ TẢ SÁCH / GIÁO TRÌNH:';
      case 'paper': return 'MÔ TẢ TÀI LIỆU TÓM TẮT:';
      case 'exam': return 'MÔ TẢ BỘ ĐỀ TRẮC NGHIỆM:';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-slate-300 rounded-3xl w-full max-w-5xl p-6 shadow-2xl relative max-h-[92vh] flex flex-col text-slate-900 animate-fade-in font-sans">
        
        {/* Header bar */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs">
              <Store className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 leading-tight">Chợ Tài Liệu</h3>
              <p className="text-xs text-slate-500">
                Kho tri thức mở ViTudy — Học hỏi và trao đổi tài liệu học tập cùng cộng đồng.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setSelectedDeskItemId(activeSpace.items[0]?.id || '');
                setIsPublishOpen(true);
              }}
              className="flex items-center gap-1.5 text-xs bg-slate-900 hover:bg-black text-white px-3.5 py-2 rounded-xl font-bold transition-all shadow-xs cursor-pointer active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Chia sẻ tài liệu</span>
            </button>
            <button
              onClick={onClose}
              aria-label="Đóng chợ tài liệu"
              className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* User Balance Banner & Unit Explanation */}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 bg-slate-50 border border-slate-200/80 rounded-2xl px-4 py-2.5 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-full bg-slate-900 text-white font-black text-xs flex items-center justify-center shadow-xs">
              V
            </div>
            <span className="text-slate-600 font-medium">
              Số dư của bạn: <strong className="text-slate-900 font-mono font-black text-sm">{wallet.balance} ViToken</strong>
            </span>
            <span className="text-slate-400 text-[11px] font-mono">• (1 V = 1 ViToken)</span>
          </div>
          <div className="text-slate-500 text-[11.5px] flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>Điểm danh hằng ngày hoặc chia sẻ tài liệu hữu ích để nhận thêm ViToken</span>
          </div>
        </div>

        {/* Warning / Error notice */}
        {errorMessage && (
          <div className="mt-2.5 bg-red-50 border border-red-200 text-red-700 px-3.5 py-2 rounded-xl text-xs flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-600" />
              <span>{errorMessage}</span>
            </div>
            <button 
              onClick={() => setErrorMessage(null)} 
              className="text-red-500 hover:text-red-800 font-bold text-xs cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Search & Filters Controls */}
        <div className="py-3 space-y-2.5 border-b border-slate-100">
          {/* Row 1: Search bar + Type pills + View Mode */}
          <div className="flex flex-col sm:flex-row items-center gap-2.5">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Tìm theo tên tài liệu, tác giả, nội dung trọng tâm..."
                className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-400 focus:bg-white transition-all font-medium"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Type selector tabs */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl w-full sm:w-auto">
              {[
                { id: 'all', label: 'Tất cả' },
                { id: 'book', label: 'Sách' },
                { id: 'paper', label: 'Tờ tóm tắt' },
                { id: 'exam', label: 'Đề thi' },
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setSelectedType(t.id as any)}
                  className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    selectedType === t.id
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* View Mode Toggle (Grid vs List) */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setViewMode('grid')}
                title="Dạng lưới thẻ"
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                  viewMode === 'grid' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                title="Dạng danh sách gọn"
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                  viewMode === 'list' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Row 2: Category, Min Score, Max Price, Sort & Reset Button */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              {/* Category dropdown */}
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value as any)}
                className="bg-slate-50 border border-slate-200 text-slate-800 py-1.5 px-2.5 rounded-lg text-xs font-medium focus:outline-none focus:border-slate-400 cursor-pointer"
              >
                <option value="all">Tất cả môn học</option>
                <option value="math">Toán học</option>
                <option value="ai_ml">Trí tuệ nhân tạo (AI/ML)</option>
                <option value="cs">Khoa học máy tính</option>
                <option value="software">Kỹ thuật phần mềm</option>
                <option value="data">Khoa học dữ liệu</option>
              </select>

              {/* Min Score filter */}
              <select
                value={minScore}
                onChange={e => setMinScore(Number(e.target.value))}
                className="bg-slate-50 border border-slate-200 text-slate-800 py-1.5 px-2.5 rounded-lg text-xs font-medium focus:outline-none focus:border-slate-400 cursor-pointer"
              >
                <option value={0}>Tất cả điểm AI</option>
                <option value={80}>Điểm AI ≥ 80</option>
                <option value={90}>Điểm AI ≥ 90 (Xuất sắc)</option>
              </select>

              {/* Max Price filter */}
              <select
                value={maxPrice}
                onChange={e => setMaxPrice(Number(e.target.value))}
                className="bg-slate-50 border border-slate-200 text-slate-800 py-1.5 px-2.5 rounded-lg text-xs font-medium focus:outline-none focus:border-slate-400 cursor-pointer"
              >
                <option value={0}>Tất cả mức giá</option>
                <option value={15}>≤ 15 ViToken</option>
                <option value={30}>≤ 30 ViToken</option>
                <option value={50}>≤ 50 ViToken</option>
              </select>

              {/* Active Filter Chips & Reset Button */}
              {hasActiveFilters && (
                <button
                  onClick={handleResetFilters}
                  className="flex items-center gap-1 text-[11.5px] font-bold text-[#E0562D] hover:text-[#c9451e] bg-orange-50 hover:bg-orange-100 border border-orange-200/70 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Đặt lại</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-3">
              {/* Sort by */}
              <div className="flex items-center gap-1.5 text-slate-500 font-medium">
                <span>Sắp xếp:</span>
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value as any)}
                  className="bg-slate-50 border border-slate-200 text-slate-900 py-1.5 px-2.5 rounded-lg text-xs font-semibold focus:outline-none focus:border-slate-400 cursor-pointer"
                >
                  <option value="newest">Mới nhất</option>
                  <option value="oldest">Cũ nhất</option>
                  <option value="score">Điểm cao nhất</option>
                  <option value="price_asc">Giá rẻ nhất</option>
                </select>
              </div>

              {/* Results count */}
              <div className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
                {filteredItems.length} tài liệu
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable list of cards / list view */}
        <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 mt-3">
          {filteredItems.length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              <Search className="w-8 h-8 mx-auto mb-2 text-slate-300" />
              <p className="text-sm font-semibold text-slate-600">Không tìm thấy tài liệu phù hợp</p>
              <p className="text-xs text-slate-400 mt-1">Hãy thử xóa bộ lọc hoặc đổi từ khóa tìm kiếm</p>
              {hasActiveFilters && (
                <button
                  onClick={handleResetFilters}
                  className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-[#E0562D] bg-orange-50 hover:bg-orange-100 border border-orange-200 px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Đặt lại tất cả bộ lọc</span>
                </button>
              )}
            </div>
          ) : viewMode === 'list' ? (
            /* COMPACT LIST VIEW */
            <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-2xs">
              {filteredItems.map(item => {
                const pageCount = item.pageCount || (item.pages ? item.pages.length : (item.type === 'book' ? 48 : (item.type === 'exam' ? 4 : 1)));
                const downloadsCount = item.downloadsCount || (item.aiScore * 3 + 12);
                const updatedDate = item.updatedDate || item.date;

                return (
                  <div 
                    key={item.id}
                    className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                          {getTypeLabel(item.type)}
                        </span>
                        <h4 className="text-xs font-black text-slate-900 truncate">
                          {item.title}
                        </h4>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
                        <span className="flex items-center gap-1 font-medium text-slate-700">
                          {item.author}
                          <span title="Tác giả xác thực">
                            <CheckCircle2 className="w-3 h-3 text-sky-600" />
                          </span>
                        </span>
                        <span>•</span>
                        <span>{pageCount} trang</span>
                        <span>•</span>
                        <span>{downloadsCount} lượt mua</span>
                        <span>•</span>
                        <span>Cập nhật {updatedDate}</span>
                        <span>•</span>
                        {/* Điểm AI with tooltip */}
                        <div className="relative group/score inline-flex items-center gap-1 cursor-help">
                          <span className="font-semibold text-slate-700">Điểm AI:</span>
                          <span className="font-bold text-[#E0562D] font-mono">
                            {item.aiScore}/100
                          </span>
                          <div className="absolute left-0 bottom-full mb-1 hidden group-hover/score:flex flex-col w-56 p-2 bg-slate-900 text-white text-[10px] rounded-lg shadow-xl z-50 pointer-events-none">
                            <span className="font-bold text-amber-300 mb-0.5">Tiêu chí chấm điểm tự động AI</span>
                            <span>• Độ chuẩn xác kiến thức: 40%</span>
                            <span>• Cấu trúc sư phạm: 35%</span>
                            <span>• Tính ứng dụng: 25%</span>
                            <span className="text-slate-400 text-[9px] mt-1 pt-1 border-t border-slate-700">
                              Dựa trên {item.aiReviewCount || 24} lượt đánh giá
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions and Price side-by-side */}
                    <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-center">
                      <div className="flex items-center gap-1 bg-slate-100 px-2.5 py-1.5 rounded-xl">
                        <span className="text-xs font-black font-mono text-slate-900">{item.price}</span>
                        <div className="w-4 h-4 rounded-full bg-slate-900 text-white font-black text-[9px] flex items-center justify-center">
                          V
                        </div>
                      </div>
                      <button
                        onClick={() => setPreviewItem(item)}
                        className="px-2.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5 text-slate-600" />
                        <span>Xem thử</span>
                      </button>
                      <button
                        onClick={() => handleBuyMarketItem(item)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shadow-xs ${
                          item.purchased
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                            : 'bg-[#E0562D] hover:bg-[#c9451e] text-white active:scale-95'
                        }`}
                      >
                        {item.purchased ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Mở</span>
                          </>
                        ) : (
                          <span>Mua {item.price} V</span>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* DETAILED GRID/CARD VIEW */
            filteredItems.map(item => {
              const pageCount = item.pageCount || (item.pages ? item.pages.length : (item.type === 'book' ? 48 : (item.type === 'exam' ? 4 : 1)));
              const downloadsCount = item.downloadsCount || (item.aiScore * 3 + 12);
              const updatedDate = item.updatedDate || item.date;

              return (
                <div 
                  key={item.id}
                  className="bg-white border border-slate-200 rounded-2xl p-4 transition-all hover:border-slate-300 hover:shadow-md flex flex-col sm:flex-row gap-4 relative"
                >
                  {/* Cột trái: Khung bìa cuốn sách màu nâu da sang trọng */}
                  <div className="w-full sm:w-40 flex flex-col justify-between flex-shrink-0">
                    <div 
                      className="w-full h-44 rounded-xl p-3 flex flex-col justify-between shadow-md relative overflow-hidden select-none"
                      style={{
                        background: 'linear-gradient(145deg, #4a2c17 0%, #2e1a0e 100%)',
                        borderLeft: '5px solid #6b3e20'
                      }}
                    >
                      {/* Header bìa */}
                      <div className="flex items-center justify-between text-[9px] text-amber-200/80 font-mono tracking-wider uppercase border-b border-amber-900/60 pb-1">
                        <span>ViTudy</span>
                        <span className="font-bold text-amber-300">{getTypeLabel(item.type)}</span>
                      </div>

                      {/* Tên tài liệu trên bìa sách */}
                      <div className="my-auto">
                        <h5 className="text-xs font-black text-amber-50 leading-snug line-clamp-4 break-words">
                          {item.title}
                        </h5>
                      </div>

                      {/* Footer bìa sách: Hiển thị Ngày chia sẻ */}
                      <div className="flex items-center gap-1 text-[9px] text-amber-200/70 pt-1 border-t border-amber-900/60 font-mono">
                        <Calendar className="w-2.5 h-2.5 text-amber-300/80" />
                        <span>{item.date}</span>
                      </div>
                    </div>

                    <div className="mt-2 text-center text-[10.5px] text-slate-500 font-medium">
                      {pageCount} trang • {getCategoryLabel(item.category)}
                    </div>
                  </div>

                  {/* Cột bên phải: Tiêu đề prominent, Tác giả, Metadata, Điểm AI, Mô tả theo loại và Nút hành động */}
                  <div className="flex-1 flex flex-col justify-between overflow-hidden">
                    <div>
                      {/* Tiêu đề tài liệu đưa ra khung nội dung */}
                      <h4 className="text-sm font-black text-slate-900 leading-snug mb-1.5 hover:text-[#E0562D] transition-colors">
                        {item.title}
                      </h4>

                      {/* Author + Verified Badge + Metadata */}
                      <div className="flex flex-wrap items-center gap-2.5 text-xs mb-2.5">
                        <div className="flex items-center gap-1 font-bold text-slate-800">
                          <span>Tác giả:</span>
                          <span className="font-semibold text-slate-700">{item.author}</span>
                          <span title="Tác giả xác thực">
                            <CheckCircle2 className="w-3.5 h-3.5 text-sky-600 inline ml-0.5" />
                          </span>
                        </div>
                        <span className="text-slate-300">•</span>
                        <span className="text-slate-500">{downloadsCount} lượt mua</span>
                        <span className="text-slate-300">•</span>
                        <span className="text-slate-500">Cập nhật {updatedDate}</span>
                        <span className="text-slate-300">•</span>
                        
                        {/* Điểm AI with tooltip giải thích tiêu chí */}
                        <div className="relative group/score inline-flex items-center gap-1 cursor-help">
                          <span className="font-bold text-slate-800">Điểm AI:</span>
                          <span className="font-bold text-[#E0562D] font-mono px-1.5 py-0.5 rounded bg-orange-50 border border-orange-200/60">
                            {item.aiScore}/100
                          </span>
                          {/* Tooltip */}
                          <div className="absolute left-0 bottom-full mb-1.5 hidden group-hover/score:flex flex-col w-60 p-2.5 bg-slate-900 text-white text-[10.5px] rounded-xl shadow-xl z-50 pointer-events-none">
                            <div className="font-bold text-amber-300 mb-1 border-b border-slate-700 pb-1">
                              Tiêu chí chấm điểm tự động AI
                            </div>
                            <div className="space-y-0.5 text-slate-300">
                              <div>• Độ chuẩn xác kiến thức: 40%</div>
                              <div>• Cấu trúc & tính mạch lạc: 35%</div>
                              <div>• Tính ứng dụng & thực tiễn: 25%</div>
                            </div>
                            <div className="mt-1.5 pt-1 border-t border-slate-700 text-slate-400 text-[9.5px]">
                              Dựa trên {item.aiReviewCount || 24} lượt phản hồi từ người học
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Mô tả theo loại tài liệu */}
                      <div className="text-xs text-slate-600 leading-relaxed">
                        <div className="text-[11px] font-bold text-slate-800 uppercase tracking-wide mb-1">
                          {getDescriptionLabel(item.type)}
                        </div>
                        <p className="line-clamp-2">
                          {item.summary}
                        </p>
                      </div>

                      {/* Trích đoạn xem trước */}
                      <div className="mt-2.5 bg-slate-50 rounded-xl p-2.5 text-[11px] text-slate-700 border border-slate-200">
                        <div className="text-[10px] text-slate-400 font-mono font-bold mb-1">
                          TRÍCH ĐOẠN XEM TRƯỚC:
                        </div>
                        <div className="whitespace-pre-line line-clamp-2 font-mono text-[10.5px] text-slate-600">
                          {item.previewText}
                        </div>
                      </div>
                    </div>

                    {/* Hàng dưới cùng: Đặt giá và các nút hành động (Xem thử, Mua/Mở) cạnh nhau */}
                    <div className="mt-3.5 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                      {/* Đơn vị giá V cạnh nút hành động */}
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl shadow-2xs">
                          <span className="text-sm font-black font-mono text-slate-900">{item.price}</span>
                          <div className="w-5 h-5 rounded-full bg-slate-900 text-white font-black text-[11px] flex items-center justify-center shadow-xs">
                            V
                          </div>
                        </div>
                        <span className="text-[11.5px] text-slate-500">
                          {item.purchased ? 'Đã trong bộ sưu tập' : 'Giá sở hữu vĩnh viễn'}
                        </span>
                      </div>

                      {/* Nút hành động: Xem thử + Mua/Mở */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setPreviewItem(item)}
                          className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
                        >
                          <Eye className="w-3.5 h-3.5 text-slate-600" />
                          <span>Xem thử</span>
                        </button>

                        <button
                          onClick={() => handleBuyMarketItem(item)}
                          className={`py-2 px-4 rounded-xl text-xs font-bold transition-all text-center cursor-pointer shadow-xs flex items-center gap-1.5 ${
                            item.purchased
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                              : 'bg-[#E0562D] hover:bg-[#c9451e] text-white active:scale-95'
                          }`}
                        >
                          {item.purchased ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Mở</span>
                            </>
                          ) : (
                            <span>Mua {item.price} V</span>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* MODAL: Xem thử trích đoạn chi tiết */}
      {previewItem && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-60 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-300 rounded-3xl w-full max-w-2xl p-6 shadow-2xl relative text-slate-900 animate-fade-in font-sans flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-[#E0562D]" />
                <h3 className="text-base font-black text-slate-900">Xem thử tài liệu</h3>
              </div>
              <button
                onClick={() => setPreviewItem(null)}
                aria-label="Đóng xem thử"
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 space-y-3.5 pr-1">
              <div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 uppercase">
                  {getTypeLabel(previewItem.type)}
                </span>
                <h4 className="text-sm font-black text-slate-900 mt-1">
                  {previewItem.title}
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Tác giả: {previewItem.author} • Điểm AI: <strong className="text-[#E0562D] font-mono">{previewItem.aiScore}/100</strong>
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-700 leading-relaxed">
                <div className="font-bold text-slate-800 text-[11px] mb-1 uppercase tracking-wide">
                  Tóm tắt nội dung:
                </div>
                <p>{previewItem.summary}</p>
              </div>

              <div className="border border-slate-200 rounded-xl p-3.5 bg-white space-y-2">
                <div className="font-bold text-slate-800 text-[11px] uppercase tracking-wide flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-slate-500" />
                  <span>Trích đoạn nội dung thực tế:</span>
                </div>
                <div className="whitespace-pre-line font-mono text-xs text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-200 leading-relaxed">
                  {previewItem.previewText}
                </div>
              </div>

              {previewItem.pages && previewItem.pages.length > 0 && (
                <div className="border border-slate-200 rounded-xl p-3.5 bg-white space-y-2">
                  <div className="font-bold text-slate-800 text-[11px] uppercase tracking-wide flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-slate-500" />
                    <span>Mục lục các chương ({previewItem.pages.length} phần):</span>
                  </div>
                  <ul className="space-y-1 text-xs text-slate-600 list-disc list-inside">
                    {previewItem.pages.map((p, idx) => (
                      <li key={idx} className="font-medium text-slate-700">
                        {p.title || `Trang ${idx + 1}`}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-slate-500">Giá mở tài liệu:</span>
                <span className="text-sm font-black font-mono text-slate-900">{previewItem.price} ViToken</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPreviewItem(null)}
                  className="px-3.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold cursor-pointer"
                >
                  Đóng xem thử
                </button>
                <button
                  onClick={() => {
                    const item = previewItem;
                    setPreviewItem(null);
                    handleBuyMarketItem(item);
                  }}
                  className={`px-4 py-1.5 rounded-xl text-xs font-bold cursor-pointer shadow-xs flex items-center gap-1.5 ${
                    previewItem.purchased
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                      : 'bg-[#E0562D] hover:bg-[#c9451e] text-white active:scale-95'
                  }`}
                >
                  {previewItem.purchased ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Mở ngay</span>
                    </>
                  ) : (
                    <span>Mua ngay ({previewItem.price} V)</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Đăng tài liệu lên Chợ */}
      {isPublishOpen && (
        <KnowInheritPublishModal
          item={activeSpace.items.find(i => i.id === selectedDeskItemId) || activeSpace.items[0]}
          isOpen={isPublishOpen}
          onClose={() => setIsPublishOpen(false)}
          onPublished={(newListing) => {
            const formattedListing: MarketItem = {
              id: newListing.id,
              title: newListing.title,
              author: newListing.author,
              aiScore: newListing.aiScore,
              price: newListing.price,
              type: 'paper',
              category: 'cs',
              date: new Date().toLocaleDateString('vi-VN'),
              purchased: true,
              summary: newListing.summary,
              previewText: newListing.previewText,
              pageCount: 1,
              downloadsCount: 1,
              updatedDate: new Date().toLocaleDateString('vi-VN'),
              isAuthorVerified: true,
              aiReviewCount: 1
            };
            setMarketItems(prev => [formattedListing, ...prev]);
            addTokens(2, `Chia sẻ tài liệu lên Chợ: ${newListing.title}`);
          }}
        />
      )}
    </div>
  );
}
