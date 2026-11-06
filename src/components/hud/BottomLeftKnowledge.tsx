'use client';

import React, { useState } from 'react';
import { useStudySpace } from '@/context/StudySpaceContext';
import { useViToken } from '@/context/ViTokenContext';
import { 
  FolderArchive, 
  Store, 
  Upload, 
  Sparkles, 
  FileText, 
  Lock, 
  Check, 
  X,
  Star,
  ShieldCheck,
  Plus
} from 'lucide-react';
import { KnowInheritPublishModal } from '../modals/KnowInheritPublishModal';

export function BottomLeftKnowledge() {
  const { addUploadedDocument, activeSpace } = useStudySpace();
  const { wallet, spendTokens, addTokens } = useViToken();

  const [isMarketOpen, setIsMarketOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isPublishOpen, setIsPublishOpen] = useState(false);
  const [selectedDeskItemId, setSelectedDeskItemId] = useState<string>('');

  // Upload modal inputs
  const [docTitle, setDocTitle] = useState('');
  const [docContent, setDocContent] = useState('');

  // Mock KnowInherit Listings
  const [marketItems, setMarketItems] = useState([
    {
      id: 'ki-1',
      title: 'Tuyển tập 100 Câu Hỏi Tối Ưu Giải Tích & Đại Số (Thầy Nguyễn Văn A)',
      author: 'Lê Hoàng (Thủ khoa K64)',
      tier: 'S',
      aiScore: 94,
      price: 25,
      purchased: false,
      summary: 'Tóm lược trọng tâm giải tích hàm nhiều biến, đạo hàm ma trận, ứng dụng trong lan truyền ngược mạng nơ-ron.',
      previewText: `CHƯƠNG 1: ĐẠO HÀM MA TRẬN & TỐI ƯU HOÁ KHÔNG RÀNG BUỘC
1.1 Khái niệm vi phân toàn phần trong Rn...
1.2 Ma trận Hessian và quy tắc kiểm tra cực trị địa phương:
- Nếu H(x*) là ma trận xác định dương -> Điểm cực tiểu ngặt.
- Nếu H(x*) là ma trận xác định âm -> Điểm cực đại ngặt.`
    },
    {
      id: 'ki-2',
      title: 'Sổ Tay Cheat-Sheet Phân Tích Dữ Liệu & Thống Kê Xác Suất',
      author: 'Trần Minh Đức (Data Engineer)',
      tier: 'A',
      aiScore: 88,
      price: 15,
      purchased: false,
      summary: 'Các phân phối xác suất quan trọng (Gaussian, Poisson, Bernoulli), định lý giới hạn trung tâm, kiểm định giả thuyết.',
      previewText: `PHẦN 1: CÁC PHÂN PHỐI XÁC SUẤT CỐT LÕI
- Phân phối Chuẩn (Normal / Gaussian Distribution):
  N(mu, sigma^2) = (1 / sqrt(2*pi*sigma^2)) * exp(-(x-mu)^2 / (2*sigma^2))
- Định lý Giới hạn Trung tâm (CLT):
  Tổng của các biến ngẫu nhiên độc lập có cùng phân phối sẽ tiến dần về phân phối chuẩn.`
    }
  ]);

  const handleBuyMarketItem = (item: typeof marketItems[0]) => {
    if (wallet.balance < item.price) {
      alert('Số dư ViToken không đủ! Hãy duy trì điểm danh mỗi ngày hoặc nạp thêm ViToken.');
      return;
    }

    const success = spendTokens(item.price, `Mở khoá tài liệu KnowInherit: ${item.title}`);
    if (success) {
      // Mark as purchased
      setMarketItems(prev => prev.map(m => m.id === item.id ? { ...m, purchased: true } : m));
      
      // Spawn directly onto desk as a verified Book / Paper!
      const pages = [
        { title: 'Trang Bìa: ' + item.title, text: `${item.title}\nTác giả chia sẻ: ${item.author}\nĐánh giá AI: ${item.aiScore}/100 (Hạng ${item.tier})\n\n${item.summary}` },
        { title: 'Nội dung cốt lõi', text: item.previewText },
        { title: 'Chương 2: Bài tập vận dụng', text: '1. Tính đạo hàm riêng của hàm số f(x, y) = x^2 * y + sin(xy) tại điểm (1, pi).\n2. Tìm các điểm dừng và xác định cực trị bằng ma trận Hessian.' },
        { title: 'Chương 3: Giải chi tiết & Đáp án', text: 'Bước 1: Tính fx = 2xy + y*cos(xy), fy = x^2 + x*cos(xy).\nBước 2: Thay toạ độ (1, pi)...' },
        { title: 'Lời khuyên từ người đi trước', text: 'Nên nắm vững phương pháp nhân tử Lagrange trước khi bước vào phòng thi!' }
      ];
      addUploadedDocument(`[KnowInherit] ${item.title}`, pages);
      setIsMarketOpen(false);
      alert(`Đã mở khoá thành công! Cuốn sách đã bay thẳng vào Bàn Học StudySpace của bạn.`);
    }
  };

  const handleManualUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docTitle.trim() || !docContent.trim()) return;

    const paras = docContent.split('\n\n').filter(p => p.trim().length > 0);
    const pages = paras.length > 0 
      ? paras.map((p, idx) => ({ title: `Trang ${idx + 1}`, text: p }))
      : [{ title: docTitle, text: docContent }];

    addUploadedDocument(docTitle.trim(), pages);
    setDocTitle('');
    setDocContent('');
    setIsUploadModalOpen(false);
  };

  return (
    <div className="absolute bottom-4 left-4 z-40 flex items-center gap-2 pointer-events-auto">
      {/* Upload Manual Document Button */}
      <button
        onClick={() => setIsUploadModalOpen(true)}
        className="flex items-center gap-1.5 bg-slate-950/80 border border-slate-700/80 rounded-xl px-3 py-2 shadow-lg backdrop-blur-md text-slate-300 hover:text-cyan-300 hover:border-cyan-500/50 transition-all text-xs font-medium"
      >
        <Upload className="w-3.5 h-3.5 text-cyan-400" />
        <span>Tải Tài Liệu Lên Bàn</span>
      </button>

      {/* KnowInherit Marketplace Launcher Button */}
      <button
        onClick={() => setIsMarketOpen(true)}
        className="flex items-center gap-1.5 bg-gradient-to-r from-cyan-950/80 to-slate-950/90 border border-cyan-500/40 rounded-xl px-3 py-2 shadow-hud-glow backdrop-blur-md text-cyan-300 hover:border-cyan-400 transition-all text-xs font-semibold"
      >
        <Store className="w-3.5 h-3.5 text-cyan-400" />
        <span>Chợ KnowInherit</span>
        <span className="bg-cyan-500/20 text-cyan-300 text-[10px] px-1.5 py-0.2 rounded-full border border-cyan-500/30">
          85/15
        </span>
      </button>

      {/* MODAL: Chợ KnowInherit */}
      {isMarketOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-cyan-500/40 rounded-2xl w-full max-w-2xl p-6 shadow-2xl relative max-h-[85vh] flex flex-col">
            <button
              onClick={() => setIsMarketOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2.5">
                <Store className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold text-white">Chợ Tri Thức KnowInherit</h3>
              </div>

              {/* Publish Button */}
              {activeSpace.items.length > 0 && (
                <button
                  onClick={() => {
                    const firstDoc = activeSpace.items.find(i => i.type === 'book' || i.type === 'paper');
                    if (firstDoc) {
                      setSelectedDeskItemId(firstDoc.id);
                      setIsPublishOpen(true);
                    } else {
                      alert('Hãy tạo hoặc tải một cuốn sách/tờ giấy lên bàn trước khi đăng bán!');
                    }
                  }}
                  className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1 shadow-md mr-6"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Đăng Bán Tài Liệu (85%)</span>
                </button>
              )}
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Tài liệu được người đi trước chia sẻ đã qua AI kiểm duyệt chống trùng lặp & thẩm định chất lượng. <strong>85% ViToken</strong> sẽ được chuyển trực tiếp cho tác giả.
            </p>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {marketItems.map(item => (
                <div 
                  key={item.id}
                  className="bg-slate-950/80 border border-slate-800 hover:border-cyan-500/40 rounded-xl p-4 transition-all"
                >
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded font-mono ${
                          item.tier === 'S' ? 'bg-amber-500 text-slate-950' : 'bg-sky-500 text-slate-950'
                        }`}>
                          HẠNG {item.tier}
                        </span>
                        <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>AI Thẩm định: {item.aiScore}/100</span>
                        </div>
                      </div>
                      <h4 className="text-sm font-bold text-white leading-snug">
                        {item.title}
                      </h4>
                      <div className="text-[11px] text-slate-400">
                        Chia sẻ bởi: <span className="text-slate-200">{item.author}</span>
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <div className="text-base font-black text-amber-400 font-mono">
                        {item.price} <span className="text-xs">ViToken</span>
                      </div>
                      <button
                        onClick={() => handleBuyMarketItem(item)}
                        disabled={item.purchased}
                        className={`mt-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          item.purchased
                            ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/30 cursor-default'
                            : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md'
                        }`}
                      >
                        {item.purchased ? '✓ Đã Mở Khoá' : 'Mở Khoá Ngay'}
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 mb-2">
                    {item.summary}
                  </p>

                  <div className="bg-slate-900/90 rounded-lg p-2.5 text-[11px] text-stone-300 font-serif border border-slate-800">
                    <div className="text-[10px] text-cyan-400 font-mono mb-1 font-bold">
                      TRÍCH ĐOẠN XEM TRƯỚC (PREVIEW 15%):
                    </div>
                    <div className="whitespace-pre-line line-clamp-3">
                      {item.previewText}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Nhập văn bản hoặc tạo tài liệu thủ công */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-cyan-500/30 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative">
            <button
              onClick={() => setIsUploadModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2 mb-2">
              <Upload className="w-5 h-5 text-cyan-400" />
              <h3 className="text-sm font-bold text-white">Thêm Tài Liệu Mới Vào Bàn Học</h3>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Nhập tiêu đề và nội dung. Hệ thống sẽ tự động tách thành <strong className="text-emerald-400">Tờ Giấy rời (&lt;5 trang)</strong> hoặc <strong className="text-sky-400">Cuốn Sách (&ge;5 trang)</strong>.
            </p>

            <form onSubmit={handleManualUpload} className="space-y-3">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Tên tài liệu / bài học</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Tóm tắt Giải tích chương 3"
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">
                  Nội dung tài liệu (Cách nhau 2 dòng trống để chia thành từng trang)
                </label>
                <textarea
                  required
                  rows={8}
                  placeholder="Nhập nội dung bài học..."
                  value={docContent}
                  onChange={(e) => setDocContent(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-xs text-white outline-none focus:border-cyan-400 font-serif leading-relaxed"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white"
                >
                  Huỷ
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-cyan-500 hover:bg-cyan-400 text-slate-950"
                >
                  Đặt Lên Bàn Học
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* MODAL: Đăng bán tài liệu lên KnowInherit */}
      {isPublishOpen && (
        <KnowInheritPublishModal
          item={activeSpace.items.find(i => i.id === selectedDeskItemId) || activeSpace.items[0]}
          isOpen={isPublishOpen}
          onClose={() => setIsPublishOpen(false)}
          onPublished={(newListing) => {
            setMarketItems(prev => [newListing, ...prev]);
            // Reward publishing bonus: author gets tokens for publishing
            addTokens(2, `Thưởng đăng tài liệu lên KnowInherit: ${newListing.title}`);
          }}
        />
      )}
    </div>
  );
}
