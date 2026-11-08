'use client';

import React, { useState, useMemo } from 'react';
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
  AlertCircle
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

  // Parse DD/MM/YYYY to timestamp
  const parseDateToTime = (dStr: string) => {
    const parts = dStr.split('/');
    if (parts.length === 3) {
      return new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0])).getTime();
    }
    return 0;
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
    if (item.purchased) return;
    setErrorMessage(null);

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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-slate-300 rounded-3xl w-full max-w-4xl p-6 shadow-2xl relative max-h-[90vh] flex flex-col text-slate-900 animate-fade-in font-sans">
        
        {/* Header bar */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs">
              <Store className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 leading-tight">Chợ Tài Liệu</h3>
              <p className="text-xs text-slate-500">
                Tài liệu được chia sẻ hoàn toàn từ mục đích học tập & nghiên cứu.
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
              <span>Chia sẻ</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Warning / Error notice */}
        {errorMessage && (
          <div className="mt-3 bg-red-50 border border-red-200 text-red-700 px-3.5 py-2 rounded-xl text-xs flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-600" />
              <span>{errorMessage}</span>
            </div>
            <button 
              onClick={() => setErrorMessage(null)} 
              className="text-red-500 hover:text-red-800 font-bold text-xs"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Search & Filters Controls */}
        <div className="py-3 space-y-2.5 border-b border-slate-100">
          {/* Row 1: Search bar + Type pills */}
          <div className="flex flex-col sm:flex-row items-center gap-2.5">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Tìm theo tên tài liệu, tác giả, nội dung..."
                className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-400 focus:bg-white transition-all font-medium"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
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
          </div>

          {/* Row 2: Category, Min Score, Max Price & Sort Dropdowns */}
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
                <option value={80}>Điểm ≥ 80</option>
                <option value={90}>Điểm ≥ 90 (Xuất sắc)</option>
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
              <div className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-md">
                {filteredItems.length} tài liệu
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable list of cards */}
        <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 mt-3">
          {filteredItems.length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              <Search className="w-8 h-8 mx-auto mb-2 text-slate-300" />
              <p className="text-sm font-semibold text-slate-600">Không tìm thấy tài liệu phù hợp</p>
              <p className="text-xs text-slate-400 mt-1">Hãy thử xóa bộ lọc hoặc đổi từ khóa tìm kiếm</p>
            </div>
          ) : (
            filteredItems.map(item => (
              <div 
                key={item.id}
                className="bg-white border border-slate-200 rounded-2xl p-4 transition-all hover:border-slate-300 hover:shadow-md flex flex-col sm:flex-row gap-4 relative"
              >
                {/* Cột trái: Khung bìa cuốn sách màu nâu da & Nút mở tài liệu */}
                <div className="w-full sm:w-36 flex flex-col justify-between flex-shrink-0">
                  {/* Khung bìa cuốn sách màu nâu bìa sách sang trọng */}
                  <div 
                    className="w-full h-44 rounded-xl p-3 flex flex-col justify-between shadow-md relative overflow-hidden select-none"
                    style={{
                      background: 'linear-gradient(145deg, #4a2c17 0%, #2e1a0e 100%)',
                      borderLeft: '5px solid #6b3e20'
                    }}
                  >
                    {/* Header bìa: Loại tài liệu, KHÔNG có phân hạng S/A */}
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

                  {/* Nút mua / Mở tài liệu ở góc dưới cùng bên trái */}
                  <button
                    onClick={() => handleBuyMarketItem(item)}
                    disabled={item.purchased}
                    className={`w-full mt-2.5 py-2 px-3 rounded-xl text-xs font-bold transition-all text-center cursor-pointer shadow-xs ${
                      item.purchased
                        ? 'bg-slate-100 text-slate-500 cursor-default border border-slate-200'
                        : 'bg-[#E0562D] hover:bg-[#c9451e] text-white active:scale-95'
                    }`}
                  >
                    {item.purchased ? 'Đã mở tài liệu' : 'Mở tài liệu'}
                  </button>
                </div>

                {/* Cột bên phải: Tác giả, Điểm đánh giá, Thể loại, Giá với V credit badge, Mô tả và Trích đoạn */}
                <div className="flex-1 flex flex-col justify-between overflow-hidden">
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="space-y-1">
                        <div className="text-xs font-bold text-slate-900">
                          Tác giả: <span className="font-semibold text-slate-700">{item.author}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <span className="font-bold text-slate-900">
                            Đánh giá: <span className="font-bold text-[#E0562D] font-mono">{item.aiScore}/100</span>
                          </span>
                          <span className="text-slate-300">•</span>
                          <span className="bg-slate-100 text-slate-700 font-semibold px-2 py-0.5 rounded text-[10.5px]">
                            {getCategoryLabel(item.category)}
                          </span>
                        </div>
                      </div>

                      {/* Góc trên cùng bên phải card: Lượng ViToken với biểu tượng chữ V tròn */}
                      <div className="text-right flex-shrink-0 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-2xs">
                        <span className="text-sm font-black font-mono text-slate-900">{item.price}</span>
                        {/* Biểu tượng credit V tròn thương hiệu */}
                        <div className="w-5 h-5 rounded-full bg-slate-900 text-white font-black text-[11px] flex items-center justify-center shadow-xs">
                          V
                        </div>
                      </div>
                    </div>

                    {/* Mô tả về sách */}
                    <div className="mt-2 text-xs text-slate-600 leading-relaxed">
                      <div className="text-[11px] font-bold text-slate-800 uppercase tracking-wide mb-1">
                        Mô tả về sách:
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
                </div>
              </div>
            ))
          )}
        </div>
      </div>

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
              previewText: newListing.previewText
            };
            setMarketItems(prev => [formattedListing, ...prev]);
            addTokens(2, `Chia sẻ tài liệu lên Chợ: ${newListing.title}`);
          }}
        />
      )}
    </div>
  );
}
