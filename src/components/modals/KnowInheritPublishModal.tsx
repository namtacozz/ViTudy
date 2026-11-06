'use client';

import React, { useState } from 'react';
import { DeskItem } from '@/types/studyspace';
import { useStudySpace } from '@/context/StudySpaceContext';
import { useViToken } from '@/context/ViTokenContext';
import { 
  Store, 
  ShieldCheck, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2, 
  Coins, 
  UploadCloud, 
  X 
} from 'lucide-react';

interface KnowInheritPublishModalProps {
  item: DeskItem;
  isOpen: boolean;
  onClose: () => void;
  onPublished?: (listing: any) => void;
}

export function KnowInheritPublishModal({
  item,
  isOpen,
  onClose,
  onPublished
}: KnowInheritPublishModalProps) {
  const { addTokens } = useViToken();
  const [authorName, setAuthorName] = useState('Bạn (Người chia sẻ)');
  const [description, setDescription] = useState('');
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditResult, setAuditResult] = useState<{
    score: number;
    tier: 'C' | 'B' | 'A' | 'S';
    price: number;
    similarityScore: number;
    approved: boolean;
    reason: string;
  } | null>(null);

  if (!isOpen) return null;

  const handleStartAudit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuditing(true);
    setAuditResult(null);

    // Simulate AI Semantic & Quality Audit Engine (per SRS Section 5)
    await new Promise(resolve => setTimeout(resolve, 1400));

    // Calculate score based on page count and length
    const totalWords = item.pages.reduce((acc, p) => acc + p.text.split(/\s+/).length, 0);
    const calculatedScore = Math.min(96, Math.max(55, Math.floor(60 + (item.pageCount * 4) + (totalWords / 200))));
    
    // Fixed tier pricing rules
    let tier: 'C' | 'B' | 'A' | 'S' = 'C';
    let price = 5;
    if (calculatedScore >= 90) {
      tier = 'S';
      price = 50;
    } else if (calculatedScore >= 75) {
      tier = 'A';
      price = 30;
    } else if (calculatedScore >= 60) {
      tier = 'B';
      price = 15;
    }

    const result = {
      score: calculatedScore,
      tier,
      price,
      similarityScore: 12.5, // 12.5% similarity (Passes <80% threshold)
      approved: true,
      reason: 'Tài liệu đạt chuẩn học thuật, cấu trúc phân mục rõ ràng, không phát hiện trùng lặp vi phạm bản quyền.'
    };

    setAuditResult(result);
    setIsAuditing(false);
  };

  const handleConfirmPublish = () => {
    if (!auditResult) return;
    
    if (onPublished) {
      onPublished({
        id: `ki-user-${Date.now()}`,
        title: item.title,
        author: authorName,
        tier: auditResult.tier,
        aiScore: auditResult.score,
        price: auditResult.price,
        purchased: false,
        summary: description || `Bộ tài liệu ôn tập ${item.title} gồm ${item.pageCount} trang kiến thức chắt lọc.`,
        previewText: item.pages[0]?.text?.slice(0, 300) || 'Xem trước tài liệu...',
        pages: item.pages
      });
    }

    alert(`Chúc mừng! Tài liệu đã được niêm yết lên Chợ KnowInherit với mức giá định sẵn ${auditResult.price} ViToken (Hạng ${auditResult.tier}). Bạn sẽ nhận 85% doanh thu mỗi khi có người mở khoá!`);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-cyan-500/40 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2.5 mb-2">
          <Store className="w-5 h-5 text-cyan-400" />
          <h3 className="text-base font-bold text-white">Chia Sẻ Lên Chợ KnowInherit</h3>
        </div>
        <p className="text-xs text-slate-400 mb-4">
          Chia sẻ tri thức cho thế hệ đi sau. AI sẽ thẩm định chất lượng và áp khung giá cố định. Bạn nhận <strong className="text-amber-400">85% ViToken</strong> cho mỗi lượt bán!
        </p>

        {!auditResult ? (
          <form onSubmit={handleStartAudit} className="space-y-3.5">
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs">
              <span className="text-slate-400">Tài liệu chia sẻ: </span>
              <strong className="text-white">{item.title}</strong>
              <div className="text-[11px] text-cyan-400 mt-0.5 font-mono">
                {item.pageCount} trang • Định dạng {item.type === 'book' ? 'Sách' : 'Giấy'}
              </div>
            </div>

            <div>
              <label className="text-[11px] text-slate-300 block mb-1">Tên Tác Giả / Bút Danh</label>
              <input
                type="text"
                required
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="text-[11px] text-slate-300 block mb-1">Mô Tả Ngắn Gọn Về Tài Liệu</label>
              <textarea
                rows={3}
                placeholder="Ví dụ: Tóm tắt các dạng bài tập thi giữa kỳ thường gặp..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-white outline-none focus:border-cyan-400 font-serif leading-relaxed"
              />
            </div>

            <div className="p-3 bg-cyan-950/30 border border-cyan-500/20 rounded-xl text-[11px] text-cyan-300 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
              <span>
                Quy tắc kiểm duyệt tự động: AI sẽ quét chống trùng lặp (&lt;80%) và chấm điểm độ sâu nội dung để xếp hạng (Tier C, B, A, S).
              </span>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white"
              >
                Huỷ
              </button>
              <button
                type="submit"
                disabled={isAuditing}
                className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md disabled:opacity-50"
              >
                <UploadCloud className="w-4 h-4" />
                <span>{isAuditing ? 'AI Đang Thẩm Định...' : 'Gửi AI Duyệt & Báo Giá'}</span>
              </button>
            </div>
          </form>
        ) : (
          /* Audit Results Display */
          <div className="space-y-4">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>ĐÃ DUYỆT ĐỦ ĐIỀU KIỆN NIÊM YẾT</span>
                </div>
                <span className={`text-[11px] font-mono font-black px-2 py-0.5 rounded ${
                  auditResult.tier === 'S' ? 'bg-amber-500 text-slate-950' : 'bg-cyan-500 text-slate-950'
                }`}>
                  HẠNG {auditResult.tier}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-slate-900 p-2.5 rounded-lg">
                  <div className="text-[10px] text-slate-400">Điểm Chất Lượng AI</div>
                  <div className="text-lg font-bold text-white font-mono">{auditResult.score}/100</div>
                </div>
                <div className="bg-slate-900 p-2.5 rounded-lg">
                  <div className="text-[10px] text-slate-400">Tỷ Lệ Trùng Lặp</div>
                  <div className="text-lg font-bold text-emerald-400 font-mono">{auditResult.similarityScore}% (An toàn)</div>
                </div>
              </div>

              <div className="bg-slate-900 p-2.5 rounded-lg flex items-center justify-between">
                <span className="text-xs text-slate-300">Giá bán niêm yết cố định:</span>
                <span className="text-base font-black text-amber-400 font-mono">
                  {auditResult.price} ViToken
                </span>
              </div>

              <div className="text-[11px] text-slate-400">
                Khi có người mua: Bạn nhận <strong className="text-amber-300">{Math.round(auditResult.price * 0.85)} ViToken</strong> (85%), nền tảng thu {Math.round(auditResult.price * 0.15)} ViToken (15%).
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setAuditResult(null)}
                className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white"
              >
                Kiểm Tra Lại
              </button>
              <button
                onClick={handleConfirmPublish}
                className="px-5 py-2 bg-gradient-to-r from-cyan-500 to-sky-400 hover:from-cyan-400 hover:to-sky-300 text-slate-950 font-bold rounded-xl text-xs shadow-lg flex items-center gap-1.5"
              >
                <Store className="w-4 h-4" />
                <span>Xác Nhận Đăng Lên Chợ Ngay</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
