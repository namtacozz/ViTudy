'use client';

import React, { useState, useEffect } from 'react';
import { summarizeWithTextRank } from '@/lib/nonAiEngine';
import { useStudySpace } from '@/context/StudySpaceContext';
import { useViToken } from '@/context/ViTokenContext';
import { askAi } from '@/lib/aiClient';
import { Sparkles, Copy, Check, StickyNote } from 'lucide-react';
import { MathRenderer } from '@/components/common/MathRenderer';
import { getStudyCache, setStudyCache } from '@/lib/studyToolsCache';

interface SummaryTabProps {
  fullText: string;
  documentTitle: string;
  isPaper?: boolean;
  targetPos?: { x: number; y: number };
}

export function SummaryTab({ fullText, documentTitle, isPaper, targetPos }: SummaryTabProps) {
  const { addStickyNote } = useStudySpace();
  const { aiConfig, spendTokens } = useViToken();

  const cacheKey = documentTitle || 'default-doc';
  const cachedData = getStudyCache(cacheKey);

  const [summaryResult, setSummaryResult] = useState<string>(cachedData.summaryResult || '');
  const [useAi, setUseAi] = useState(aiConfig.provider === 'oauth_chatgpt' || Boolean(aiConfig.isOauthConnected));
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (summaryResult) {
      setStudyCache(cacheKey, { summaryResult });
    }
  }, [summaryResult, cacheKey]);

  const handleGenerateSummary = async () => {
    if (!fullText) return;

    if (!useAi) {
      // Non-AI TextRank + TF-IDF summarization (Client-side, 0 ViToken)
      const res = summarizeWithTextRank(fullText, 4);
      const text = res.join('\n\n');
      setSummaryResult(text);
      setStudyCache(cacheKey, { summaryResult: text });
      return;
    }

    // AI Enhanced Summarization
    if (aiConfig.provider === 'system') {
      const ok = spendTokens(2, `Tóm tắt chuyên sâu: ${documentTitle.slice(0, 30)}`);
      if (!ok) {
        alert('Số dư ViToken không đủ để dùng AI Hệ Thống. Chuyển sang động cơ Non-AI miễn phí.');
        setUseAi(false);
        const res = summarizeWithTextRank(fullText, 4);
        const text = res.join('\n\n');
        setSummaryResult(text);
        setStudyCache(cacheKey, { summaryResult: text });
        return;
      }
    }

    setLoading(true);
    try {
      const data = await askAi({
        provider: aiConfig.provider,
        model: aiConfig.model,
        apiKey: aiConfig.apiKey,
        prompt: `Hãy tóm tắt văn bản sau thành 3 đến 5 gạch đầu dòng súc tích, làm nổi bật các khái niệm trọng tâm nhất để ôn thi:`,
        context: fullText.slice(0, 4000),
      });

      if (data.reply) {
        setSummaryResult(data.reply);
        setStudyCache(cacheKey, { summaryResult: data.reply });
      } else {
        const text = summarizeWithTextRank(fullText, 4).join('\n\n');
        setSummaryResult(text);
        setStudyCache(cacheKey, { summaryResult: text });
      }
    } catch (err: any) {
      const nonAiFallback = summarizeWithTextRank(fullText, 4).join('\n\n');
      const text = `[Thông báo AI: ${err.message || 'Lỗi kết nối'} - Đã chuyển sang trích xuất TextRank]:\n\n${nonAiFallback}`;
      setSummaryResult(text);
      setStudyCache(cacheKey, { summaryResult: text });
    } finally {
      setLoading(false);
    }
  };

  const handleCopyToClipboard = () => {
    if (!summaryResult) return;
    navigator.clipboard.writeText(summaryResult);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePinSummaryToDesk = () => {
    if (!summaryResult) return;
    const posX = targetPos?.x ?? 450;
    const posY = targetPos?.y ?? 250;
    addStickyNote(`[TÓM TẮT: ${documentTitle}]\n\n${summaryResult}`, posX, posY);
  };

  if (isPaper) {
    return (
      <div className="flex-1 flex flex-col p-4 font-sans text-slate-900 bg-white overflow-hidden select-none">
        {/* Dòng 1: Tiêu đề viết ngang ra không xuống dòng: Tóm tắt nội dung trọng tâm (Bỏ mô tả) */}
        <h4 className="text-xs font-bold text-slate-900 tracking-tight whitespace-nowrap mb-2">
          Tóm tắt nội dung trọng tâm
        </h4>

        {/* Dòng 2: Nổi bật tùy chọn Sử dụng AI */}
        <div className="mb-2.5">
          <label className={`flex items-center justify-between px-3 py-2 rounded-xl border transition-all cursor-pointer ${
            useAi 
              ? 'bg-gradient-to-r from-orange-50 via-amber-50 to-orange-50 border-[#E0562D]/60 shadow-2xs ring-1 ring-[#E0562D]/20' 
              : 'bg-slate-50 border-slate-200 hover:border-slate-300'
          }`}>
            <div className="flex flex-col">
              <span className={`text-xs font-bold ${useAi ? 'text-[#E0562D]' : 'text-slate-700'}`}>
                Dùng AI chuyên sâu
              </span>
              <span className="text-[10px] text-slate-500">
                {useAi ? 'Chắt lọc luận điểm logic · Miễn phí' : 'Nhanh, miễn phí'}
              </span>
            </div>
            <input 
              type="checkbox"
              checked={useAi}
              onChange={(e) => setUseAi(e.target.checked)}
              className="w-4 h-4 rounded accent-[#E0562D] cursor-pointer"
            />
          </label>
        </div>

        {/* Dòng 3: Nút nằm sát bên phải là Tạo tóm tắt màu nền cam ViT chữ trắng */}
        <div className="flex justify-end mb-3">
          <button
            onClick={handleGenerateSummary}
            disabled={loading}
            className="px-4 py-2 bg-[#E0562D] hover:bg-[#c9451e] active:scale-95 text-white rounded-xl text-xs font-bold whitespace-nowrap shadow-xs transition-all flex items-center justify-center cursor-pointer disabled:opacity-50"
          >
            <span>{loading ? 'Đang tóm tắt...' : 'Tạo tóm tắt'}</span>
          </button>
        </div>

        {/* Summary Content Body */}
        <div className="flex-1 min-h-[160px] max-h-[220px] flex flex-col">
          {summaryResult ? (
            <div className="flex-1 bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs leading-relaxed text-slate-800 whitespace-pre-line overflow-y-auto no-scrollbar">
              <MathRenderer content={summaryResult} />
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 text-xs text-center border-2 border-dashed border-slate-200 rounded-xl p-4">
              <Sparkles className="w-6 h-6 mb-1.5 text-slate-300 stroke-[2.4]" />
              <span>Nhấn "Tạo tóm tắt" để trích xuất các ý cốt lõi của tài liệu</span>
            </div>
          )}
        </div>

        {/* Footer thu hẹp độ rộng vừa khít 1 dòng ngắn gọn */}
        {summaryResult && (
          <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2 mt-3">
            <button
              onClick={handlePinSummaryToDesk}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors border border-slate-200 cursor-pointer whitespace-nowrap"
            >
              <StickyNote className="w-3.5 h-3.5 text-amber-600 stroke-[2.4]" />
              <span>Ghim tóm tắt lên bàn</span>
            </button>

            <button
              onClick={handleCopyToClipboard}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold transition-colors shadow-xs cursor-pointer whitespace-nowrap"
            >
              {copied ? <Check className="w-3.5 h-3.5 stroke-[2.4]" /> : <Copy className="w-3.5 h-3.5 stroke-[2.4]" />}
              <span>{copied ? 'Đã sao chép' : 'Sao chép nội dung'}</span>
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div 
      data-scrollable="true"
      className="flex-1 flex flex-col p-4 sm:p-5 overflow-y-auto font-sans text-slate-900 bg-white"
    >
      {/* Controls Bar */}
      <div className="flex items-center justify-between pb-2.5 border-b border-slate-200">
        <div>
          <h4 className="text-xs sm:text-sm font-bold text-slate-900">Tóm tắt trọng tâm</h4>
        </div>

        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-full transition-colors border border-slate-300 whitespace-nowrap select-none">
            <input 
              type="checkbox"
              checked={useAi}
              onChange={(e) => setUseAi(e.target.checked)}
              className="rounded accent-[#E0562D]"
            />
            <span>Dùng AI chuyên sâu</span>
          </label>

          <button
            onClick={handleGenerateSummary}
            disabled={loading}
            className="px-3.5 py-1.5 bg-[#E0562D] hover:bg-[#c9451e] text-white rounded-lg text-xs font-bold shadow-xs transition-colors flex items-center justify-center disabled:opacity-50 cursor-pointer active:scale-95 whitespace-nowrap"
          >
            <span>{loading ? 'Đang trích xuất...' : summaryResult ? 'Cập nhật tóm tắt' : 'Tạo tóm tắt'}</span>
          </button>
        </div>
      </div>

      {/* Summary Content Body */}
      <div className="flex-1 mt-3">
        {summaryResult ? (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs sm:text-sm leading-relaxed text-slate-800 whitespace-pre-line">
            <MathRenderer content={summaryResult} />
          </div>
        ) : (
          <div className="h-56 flex flex-col items-center justify-center text-slate-600 text-xs text-center border-2 border-dashed border-slate-300 rounded-xl p-5">
            <Sparkles className="w-7 h-7 mb-2 text-[#E0562D]" />
            <span className="font-bold text-slate-800 text-sm mb-1">Chưa có bản tóm tắt</span>
            <span className="text-slate-500 max-w-sm">
              Nhấn "Tạo tóm tắt" để trích xuất 4-5 luận điểm cốt lõi của tài liệu.
            </span>
          </div>
        )}
      </div>

      {/* Action Footer */}
      {summaryResult && (
        <div className="pt-3 border-t border-slate-200 flex items-center justify-between mt-3 flex-shrink-0">
          <button
            onClick={handlePinSummaryToDesk}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold transition-colors border border-slate-300 cursor-pointer"
          >
            <StickyNote className="w-3.5 h-3.5 text-amber-600" />
            <span>Ghim tóm tắt lên bàn</span>
          </button>

          <button
            onClick={handleCopyToClipboard}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-black text-white rounded-lg text-xs font-semibold transition-colors shadow-xs cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Đã sao chép' : 'Sao chép nội dung'}</span>
          </button>
        </div>
      )}
    </div>
  );
}
