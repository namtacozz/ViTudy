'use client';

import React, { useState, useEffect } from 'react';
import { generateFlashcardsFromRules, Flashcard } from '@/lib/nonAiEngine';
import { useStudySpace } from '@/context/StudySpaceContext';
import { useAuth } from '@/hooks/useAuth';
import { useViToken } from '@/context/ViTokenContext';
import { askAi } from '@/lib/aiClient';
import { FlashcardService } from '@/services/FlashcardService';
import { ReviewQuality } from '@/lib/sm2';
import { MathRenderer } from '@/components/common/MathRenderer';
import { getStudyCache, setStudyCache } from '@/lib/studyToolsCache';
import { 
  Layers, 
  RotateCw, 
  ChevronLeft, 
  ChevronRight, 
  StickyNote,
  Sparkles,
  CalendarCheck
} from 'lucide-react';

interface FlashcardTabProps {
  fullText: string;
  documentTitle: string;
}

export function FlashcardTab({ fullText, documentTitle }: FlashcardTabProps) {
  const { addStickyNote } = useStudySpace();
  const { user } = useAuth();
  const { wallet, aiConfig, spendTokens, syncBalanceFromServer } = useViToken();

  const cacheKey = documentTitle || 'default-doc';
  const cachedData = getStudyCache(cacheKey);

  const [flashcards, setFlashcards] = useState<Flashcard[]>(cachedData.flashcards || []);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [sm2Notice, setSm2Notice] = useState<string | null>(null);
  const [useAi, setUseAi] = useState(aiConfig.provider === 'oauth_chatgpt' || Boolean(aiConfig.isOauthConnected));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (flashcards.length > 0) {
      setStudyCache(cacheKey, { flashcards });
    }
  }, [flashcards, cacheKey]);

  const handleGenerateFlashcards = async () => {
    if (!fullText) return;

    if (!useAi) {
      const cards = generateFlashcardsFromRules(fullText, 8);
      setFlashcards(cards);
      setCurrentIdx(0);
      setIsFlipped(false);
      setSm2Notice(null);
      return;
    }

    if (aiConfig.provider === 'system' && wallet.balance < 2) {
      alert('Số dư ViToken không đủ để dùng AI Hệ Thống. Chuyển sang trích xuất Non-AI miễn phí.');
      setUseAi(false);
      const cards = generateFlashcardsFromRules(fullText, 8);
      setFlashcards(cards);
      setCurrentIdx(0);
      setIsFlipped(false);
      setSm2Notice(null);
      return;
    }

    setLoading(true);
    try {
      const prompt = `Từ nội dung học tập sau đây, hãy trích xuất 6 đến 8 thẻ ghi nhớ (flashcards) trọng tâm nhất để ôn thi và nắm vững kiến thức.
Mỗi thẻ gồm:
- "front": Thuật ngữ, câu hỏi hoặc khái niệm trọng tâm
- "back": Định nghĩa ngắn gọn, giải thích bản chất, công thức toán/lý (dùng LaTeX chuẩn \\(...\\) hoặc \\[...\\] nếu có)
Trả về dạng JSON array hợp lệ, KHÔNG thêm bất kỳ văn bản nào khác ngoài JSON:
[
  {
    "front": "Thuật ngữ hoặc câu hỏi...",
    "back": "Định nghĩa, bản chất và công thức..."
  }
]`;

      const data = await askAi({
        provider: aiConfig.provider,
        model: aiConfig.model,
        apiKey: aiConfig.apiKey,
        prompt,
        context: fullText.slice(0, 4000),
      });

      if (typeof data.balanceAfter === 'number') {
        syncBalanceFromServer(data.balanceAfter);
      } else if (aiConfig.provider === 'system') {
        spendTokens(2, `Tạo thẻ ghi nhớ AI: ${documentTitle.slice(0, 30)}`);
      }

      const rawText = data.reply || '';
      const match = rawText.match(/\[[\s\S]*\]/);
      if (match) {
        const parsed = JSON.parse(match[0]);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setFlashcards(parsed.map((item: any, idx: number) => ({
            id: `ai-fc-${idx}-${Date.now()}`,
            front: item.front || '',
            back: item.back || ''
          })));
          setCurrentIdx(0);
          setIsFlipped(false);
          setSm2Notice(null);
          return;
        }
      }
      setFlashcards(generateFlashcardsFromRules(fullText, 8));
      setCurrentIdx(0);
      setIsFlipped(false);
      setSm2Notice(null);
    } catch {
      setFlashcards(generateFlashcardsFromRules(fullText, 8));
      setCurrentIdx(0);
      setIsFlipped(false);
      setSm2Notice(null);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadDueCards = async () => {
    if (!user?.id) return;
    const dueReviews = await FlashcardService.getCardsForReview(user.id);
    if (dueReviews.length > 0) {
      setFlashcards(dueReviews.map((r) => ({ id: r.id, front: r.front, back: r.back })));
      setCurrentIdx(0);
      setIsFlipped(false);
      setSm2Notice(`Đã nạp ${dueReviews.length} thẻ đến hạn ôn tập hôm nay`);
    } else {
      setSm2Notice('Không có thẻ nào đến hạn ôn tập hôm nay');
    }
  };

  const handleRateCard = async (quality: ReviewQuality) => {
    if (!currentCard || !user?.id) {
      handleNext();
      return;
    }
    const result = await FlashcardService.submitReview(
      user.id,
      { front: currentCard.front, back: currentCard.back },
      quality
    );
    setSm2Notice(`Lịch ôn tiếp: ${result.interval} ngày nữa (${result.nextReviewDate})`);
    setTimeout(() => {
      setSm2Notice(null);
      handleNext();
    }, 800);
  };

  const handleNext = () => {
    if (currentIdx < flashcards.length - 1) {
      setCurrentIdx(prev => prev + 1);
      setIsFlipped(false);
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx(prev => prev - 1);
      setIsFlipped(false);
    }
  };

  const handleExportCardToDesk = () => {
    if (flashcards.length === 0) return;
    const card = flashcards[currentIdx];
    addStickyNote(`[FLASHCARD: ${documentTitle}]\n\nThuật ngữ: ${card.front}\n\nÝ nghĩa: ${card.back}`, 480, 260);
  };

  const currentCard = flashcards[currentIdx];

  return (
    <div 
      data-scrollable="true"
      className="flex-1 flex flex-col p-3.5 sm:p-4 overflow-y-auto font-sans text-slate-900 bg-white"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-200">
        <div>
          <h4 className="text-xs sm:text-sm font-bold text-slate-900">Thẻ ghi nhớ</h4>
        </div>

        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-full transition-colors border border-slate-300 select-none whitespace-nowrap shrink-0">
            <input 
              type="checkbox"
              checked={useAi}
              onChange={(e) => setUseAi(e.target.checked)}
              className="rounded accent-[#E0562D]"
            />
            <span>Dùng AI chuyên sâu</span>
          </label>

          {user && (
            <button
              onClick={handleLoadDueCards}
              className="px-3 py-1.5 border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-bold transition-colors flex items-center justify-center cursor-pointer whitespace-nowrap shrink-0"
            >
              <span>Ôn tập hôm nay</span>
            </button>
          )}

          <button
            onClick={handleGenerateFlashcards}
            disabled={loading}
            className="px-4 py-1.5 bg-[#E0562D] hover:bg-[#c9451e] text-white rounded-lg text-xs font-bold transition-colors shadow-xs cursor-pointer active:scale-95 disabled:opacity-50 flex items-center justify-center whitespace-nowrap shrink-0"
          >
            <span>{loading ? 'Đang tạo thẻ...' : flashcards.length > 0 ? 'Tạo lại thẻ' : 'Trích xuất thẻ'}</span>
          </button>
        </div>
      </div>

      {sm2Notice && (
        <div className="mt-3 p-2.5 bg-orange-50 border border-orange-200 rounded-xl text-xs text-[#9A3412] font-semibold text-center animate-fade-in">
          {sm2Notice}
        </div>
      )}

      {/* Flashcard Area */}
      <div className="flex-1 flex flex-col items-center justify-center py-6">
        {currentCard ? (
          <div className="w-full max-w-md flex flex-col items-center">
            {/* Card Frame */}
            <div
              onClick={() => setIsFlipped(!isFlipped)}
              className="w-full h-56 bg-white border-2 border-slate-300 hover:border-slate-800 rounded-2xl p-6 shadow-md cursor-pointer flex flex-col justify-between transition-all select-none relative group overflow-y-auto"
            >
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span className="font-bold text-slate-600 uppercase">
                  {isFlipped ? 'Mặt sau (Định nghĩa / Giải thích)' : 'Mặt trước (Khái niệm)'}
                </span>
                <span className="flex items-center gap-1 group-hover:text-slate-900 transition-colors">
                  <RotateCw className="w-3 h-3" /> Lật thẻ
                </span>
              </div>

              <div className="flex-1 flex items-center justify-center text-center px-4 py-2">
                <div className={`text-slate-900 leading-relaxed font-sans ${isFlipped ? 'text-xs md:text-sm' : 'text-sm md:text-base font-bold'}`}>
                  <MathRenderer content={isFlipped ? currentCard.back : currentCard.front} />
                </div>
              </div>

              <div className="text-center text-[10px] text-slate-400 font-mono">
                Thẻ {currentIdx + 1} trên {flashcards.length}
              </div>
            </div>

            {/* SM-2 Spaced Repetition Rating Buttons */}
            {isFlipped && (
              <div className="w-full mt-4 flex items-center justify-center gap-2 animate-fade-in">
                <button
                  type="button"
                  onClick={() => handleRateCard(1)}
                  className="flex-1 py-1.5 px-2 rounded-xl border border-slate-300 bg-slate-50 hover:bg-slate-100 text-[11px] font-bold text-slate-700 cursor-pointer transition-colors shadow-2xs"
                  title="Không nhớ / Lặp lại ngay"
                >
                  Quên (1 ngày)
                </button>
                <button
                  type="button"
                  onClick={() => handleRateCard(3)}
                  className="flex-1 py-1.5 px-2 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-[11px] font-bold text-amber-800 cursor-pointer transition-colors shadow-2xs"
                  title="Nhớ nhưng khó khăn"
                >
                  Khó
                </button>
                <button
                  type="button"
                  onClick={() => handleRateCard(4)}
                  className="flex-1 py-1.5 px-2 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-[11px] font-bold text-emerald-800 cursor-pointer transition-colors shadow-2xs"
                  title="Nhớ tốt"
                >
                  Tốt
                </button>
                <button
                  type="button"
                  onClick={() => handleRateCard(5)}
                  className="flex-1 py-1.5 px-2 rounded-xl border border-orange-300 bg-[#FFF7ED] hover:bg-orange-100 text-[11px] font-bold text-[#E0562D] cursor-pointer transition-colors shadow-2xs"
                  title="Nhớ hoàn hảo"
                >
                  Dễ
                </button>
              </div>
            )}

            {/* Navigation Controls */}
            <div className="flex items-center gap-4 mt-6">
              <button
                onClick={handlePrev}
                disabled={currentIdx === 0}
                className="p-2 rounded-full border border-slate-300 hover:bg-slate-100 disabled:opacity-30 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5 text-slate-700" />
              </button>

              <span className="text-xs font-mono font-semibold text-slate-700">
                {currentIdx + 1} / {flashcards.length}
              </span>

              <button
                onClick={handleNext}
                disabled={currentIdx === flashcards.length - 1}
                className="p-2 rounded-full border border-slate-300 hover:bg-slate-100 disabled:opacity-30 transition-colors cursor-pointer"
              >
                <ChevronRight className="w-5 h-5 text-slate-700" />
              </button>
            </div>
          </div>
        ) : (
          <div className="h-64 w-full flex flex-col items-center justify-center text-slate-600 text-xs text-center border-2 border-dashed border-slate-300 rounded-xl p-6">
            <Layers className="w-8 h-8 mb-2 text-[#E0562D]" />
            <span className="font-bold text-slate-800 text-sm mb-1">Chưa có thẻ ghi nhớ</span>
            <span className="text-slate-500 max-w-sm">
              Nhấn "Trích xuất thẻ" để tạo 6-8 thẻ ôn ngắt quãng SM-2 hai mặt có công thức toán học.
            </span>
          </div>
        )}
      </div>

      {/* Footer */}
      {currentCard && (
        <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={handleExportCardToDesk}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold transition-colors border border-slate-300 cursor-pointer"
          >
            <StickyNote className="w-3.5 h-3.5 text-amber-600" />
            <span>Ghim thẻ lên bàn</span>
          </button>

          <span className="text-[11px] text-slate-400 italic">
            Nhấp trực tiếp vào thẻ hoặc nhấn nút Lật thẻ để xem đáp án
          </span>
        </div>
      )}
    </div>
  );
}
