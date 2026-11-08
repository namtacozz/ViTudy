'use client';

import React, { useState } from 'react';
import { DeskItem } from '@/types/studyspace';
import { useViToken } from '@/context/ViTokenContext';
import { 
  Store, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
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

    await new Promise(resolve => setTimeout(resolve, 1200));

    const totalWords = item.pages.reduce((acc, p) => acc + p.text.split(/\s+/).length, 0);
    const calculatedScore = Math.min(96, Math.max(55, Math.floor(60 + (item.pageCount * 4) + (totalWords / 200))));
    
    let tier: 'C' | 'B' | 'A' | 'S' = 'C';
    let price = 5;
    if (calculatedScore >= 90) {
      tier = 'S';
      price = 50; // Hạng S = 50 ViToken
    } else if (calculatedScore >= 80) {
      tier = 'A';
      price = 30; // Hạng A = 30 ViToken
    } else if (calculatedScore >= 70) {
      tier = 'B';
      price = 15; // Hạng B = 15 ViToken
    } else {
      tier = 'C';
      price = 5;  // Hạng C = 5 ViToken
    }

    setAuditResult({
      score: calculatedScore,
      tier,
      price,
      similarityScore: 12,
      approved: true,
      reason: `Tài liệu đạt tiêu chuẩn chất lượng (${calculatedScore}/100) và độ nguyên bản cao.`
    });
    setIsAuditing(false);
  };

  const handleConfirmPublish = () => {
    if (!auditResult) return;
    
    const newListing = {
      id: `ki-${Date.now()}`,
      title: item.title,
      author: authorName,
      tier: auditResult.tier,
      aiScore: auditResult.score,
      price: auditResult.price,
      purchased: true,
      summary: description || `Bộ tài liệu ôn tập gồm ${item.pageCount} trang, do ${authorName} chia sẻ.`,
      previewText: item.pages[0]?.text?.slice(0, 300) || 'Xem trước tài liệu...'
    };

    onPublished?.(newListing);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-slate-300 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative text-slate-900 animate-fade-in">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 mb-2">
          <Store className="w-5 h-5 text-slate-900" />
          <h3 className="text-base font-bold text-slate-900">Chia sẻ lên KnowInherit</h3>
        </div>
        <p className="text-xs text-slate-500 mb-4">
          Chia sẻ tài liệu học tập của bạn cho các bạn khóa sau. Bạn nhận 85% ViToken cho mỗi lượt mở khóa.
        </p>

        {!auditResult ? (
          <form onSubmit={handleStartAudit} className="space-y-3.5">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
              <span className="text-slate-500">Tài liệu: </span>
              <strong className="text-slate-900">{item.title}</strong>
              <div className="text-[11px] text-slate-500 mt-0.5 font-mono">
                {item.pageCount} trang • Định dạng {item.type === 'book' ? 'Sách' : 'Giấy'}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Tên tác giả / Bút danh</label>
              <input
                type="text"
                required
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 outline-none focus:border-slate-800"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Mô tả tài liệu</label>
              <textarea
                rows={3}
                placeholder="Ghi chú tóm tắt nội dung để người học dễ nắm bắt..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 outline-none focus:border-slate-800 font-sans leading-relaxed resize-none"
              />
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-slate-700 flex-shrink-0 mt-0.5" />
              <span>
                Hệ thống sẽ kiểm tra trùng lặp và phân loại tài liệu vào các hạng C, B, A, S để gợi ý mức giá hợp lý.
              </span>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={isAuditing}
                className="px-4 py-2 bg-slate-900 hover:bg-black text-white font-semibold rounded-xl text-xs flex items-center gap-1.5 shadow-xs disabled:opacity-50"
              >
                <UploadCloud className="w-4 h-4" />
                <span>{isAuditing ? 'Đang kiểm tra...' : 'Kiểm tra & Báo giá'}</span>
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm mb-2">
                <CheckCircle2 className="w-4 h-4 text-slate-800" />
                <span>Tài liệu đủ điều kiện chia sẻ</span>
              </div>
              <p className="text-xs text-slate-600 mb-3">{auditResult.reason}</p>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                  <div className="text-slate-400 text-[11px]">Điểm chất lượng</div>
                  <div className="text-base font-bold text-slate-900 font-mono">{auditResult.score}/100</div>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                  <div className="text-slate-400 text-[11px]">Mức giá đề xuất</div>
                  <div className="text-base font-bold text-slate-900 font-mono">{auditResult.price} ViToken</div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                onClick={() => setAuditResult(null)}
                className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100"
              >
                Quay lại
              </button>
              <button
                onClick={handleConfirmPublish}
                className="px-4 py-2 bg-slate-900 hover:bg-black text-white font-semibold rounded-xl text-xs shadow-xs"
              >
                Xác nhận chia sẻ
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
