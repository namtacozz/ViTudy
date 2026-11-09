'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { MarketItem } from '@/data/marketMockData';
import { MarketService } from '@/services/MarketService';
import { useViToken } from '@/context/ViTokenContext';
import { useAuth } from '@/hooks/useAuth';
import { 
  ArrowLeft, 
  Store, 
  Search, 
  Filter, 
  Sparkles, 
  BookOpen, 
  FileText, 
  Award, 
  Eye, 
  Check, 
  X,
  Star
} from 'lucide-react';

export default function MarketPage() {
  const { wallet, spendTokens } = useViToken();
  const { user } = useAuth();

  const [items, setItems] = useState<MarketItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'score' | 'price_asc' | 'price_desc'>('newest');
  const [isLoading, setIsLoading] = useState(true);

  // Preview modal state
  const [previewItem, setPreviewItem] = useState<MarketItem | null>(null);
  const [purchaseSuccess, setPurchaseSuccess] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    MarketService.getListings({
      category: selectedCategory,
      search: searchQuery,
      sort: sortBy,
    }).then((data) => {
      setItems(data);
      setIsLoading(false);
    });
  }, [selectedCategory, searchQuery, sortBy]);

  const handlePurchase = (item: MarketItem) => {
    if (wallet.balance < item.price) {
      alert(`Số dư ViToken không đủ (${wallet.balance}/${item.price} V). Vui lòng nạp thêm ViToken.`);
      return;
    }
    const success = spendTokens(item.price, `Mua tài liệu Chợ: ${item.title}`);
    if (success) {
      setPurchaseSuccess(`Đã mua thành công "${item.title}". Tài liệu đã sẵn sàng trên bàn học!`);
      setTimeout(() => {
        setPurchaseSuccess(null);
        setPreviewItem(null);
      }, 1500);
    }
  };

  const CATEGORIES = [
    { id: 'all', label: 'Tất cả' },
    { id: 'ai_ml', label: 'Trí tuệ nhân tạo (AI/ML)' },
    { id: 'math', label: 'Toán học & Giải tích' },
    { id: 'cs', label: 'Khoa học máy tính' },
    { id: 'data', label: 'Khoa học dữ liệu' },
    { id: 'software', label: 'Kỹ thuật phần mềm' },
  ];

  return (
    <div className="min-h-screen bg-slate-100 py-8 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between">
          <Link
            href="/?view=desk"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Về Bàn Học</span>
          </Link>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center text-[#E0562D]">
              <Store className="w-4 h-4" />
            </div>
            <h1 className="text-sm font-black text-slate-900">Chợ Tri Thức KnowInherit</h1>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-xl shadow-xs">
            <span className="text-xs text-slate-500 font-medium">Ví:</span>
            <span className="font-mono font-black text-xs text-[#E0562D]">{wallet.balance} V</span>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm kiếm tài liệu, tác giả, bài giải..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:border-slate-800 transition-colors"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <span className="text-xs text-slate-500 font-medium whitespace-nowrap">Sắp xếp:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 outline-none cursor-pointer"
              >
                <option value="newest">Mới nhất</option>
                <option value="score">Điểm AI cao nhất</option>
                <option value="price_asc">Giá tăng dần</option>
                <option value="price_desc">Giá giảm dần</option>
              </select>
            </div>
          </div>

          {/* Category Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                  selectedCategory === cat.id
                    ? 'bg-[#E0562D] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Listing Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {isLoading ? (
            <div className="col-span-full py-16 text-center text-xs text-slate-400">
              Đang tải danh mục tài liệu...
            </div>
          ) : items.length === 0 ? (
            <div className="col-span-full py-16 text-center text-xs text-slate-400 bg-white border border-slate-200 rounded-3xl">
              Không tìm thấy tài liệu phù hợp.
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm flex flex-col justify-between hover:border-slate-300 hover:shadow-md transition-all group"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10.5px] font-bold font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 uppercase">
                      {item.type === 'book' ? 'Sách Mở' : item.type === 'paper' ? 'Tài Liệu Đơn' : 'Bộ Đề Thi'}
                    </span>

                    <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                      <Sparkles className="w-3 h-3 text-emerald-600" />
                      <span>{item.aiScore}/100</span>
                    </div>
                  </div>

                  <h3 className="text-sm font-black text-slate-900 group-hover:text-[#E0562D] transition-colors line-clamp-2 leading-snug mb-1">
                    {item.title}
                  </h3>

                  <p className="text-[11px] text-slate-400 mb-2.5">Tác giả: <strong className="text-slate-600">{item.author}</strong></p>

                  <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed mb-4">
                    {item.summary}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-1 font-mono font-black text-[#E0562D]">
                    <span className="text-base">{item.price}</span>
                    <span className="text-xs">ViToken</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setPreviewItem(item)}
                    className="px-3.5 py-1.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Xem trước</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal Xem Trước Tài Liệu */}
      {previewItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-300 rounded-3xl w-full max-w-lg p-6 shadow-2xl relative text-slate-900 animate-fade-in font-sans">
            <button
              onClick={() => setPreviewItem(null)}
              className="absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-4">
              <span className="text-[10.5px] font-bold font-mono px-2 py-0.5 rounded-full bg-orange-50 text-[#E0562D] border border-orange-200 uppercase">
                Bản xem trước bảo mật
              </span>
              <h2 className="text-base font-black text-slate-900 mt-2 leading-tight">
                {previewItem.title}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">Tác giả: {previewItem.author} • Điểm kiểm định AI: {previewItem.aiScore}/100</p>
            </div>

            {/* Preview Content Area with static blurred teaser */}
            <div className="relative bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs text-slate-700 leading-relaxed max-h-64 overflow-hidden mb-4">
              <div className="font-semibold text-slate-800 mb-2">Đoạn trích dẫn xem trước:</div>
              <p className="whitespace-pre-line">{previewItem.previewText}</p>

              {/* Static blur gradient barrier */}
              <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-slate-100 via-slate-100/80 to-transparent flex items-end justify-center pb-2">
                <span className="text-[11px] font-bold text-slate-500">
                  --- Mở khóa đầy đủ toàn bộ tài liệu sau khi mua ---
                </span>
              </div>
            </div>

            {purchaseSuccess ? (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-bold text-center flex items-center justify-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>{purchaseSuccess}</span>
              </div>
            ) : (
              <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                <div className="flex items-center gap-1 font-mono font-black text-base text-[#E0562D]">
                  <span>{previewItem.price}</span>
                  <span className="text-xs">ViToken</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPreviewItem(null)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                  >
                    Đóng
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePurchase(previewItem)}
                    className="px-5 py-2 rounded-xl bg-[#E0562D] hover:bg-[#c9451e] text-white text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
                  >
                    Mua tài liệu ngay
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
