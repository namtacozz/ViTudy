'use client';

import React, { useState } from 'react';
import { generateFlashcardsFromRules, Flashcard } from '@/lib/nonAiEngine';
import { useStudySpace } from '@/context/StudySpaceContext';
import { 
  Layers, 
  RotateCw, 
  ChevronLeft, 
  ChevronRight, 
  StickyNote,
  Sparkles
} from 'lucide-react';

interface FlashcardTabProps {
  fullText: string;
  documentTitle: string;
}

export function FlashcardTab({ fullText, documentTitle }: FlashcardTabProps) {
  const { addStickyNote } = useStudySpace();

  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const handleGenerateFlashcards = () => {
    if (!fullText) return;
    const cards = generateFlashcardsFromRules(fullText, 8);
    setFlashcards(cards);
    setCurrentIdx(0);
    setIsFlipped(false);
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
    <div className="flex-1 flex flex-col p-6 overflow-y-auto no-scrollbar font-sans text-slate-900 bg-white">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div>
          <h4 className="text-sm font-bold text-slate-900">Thẻ Ghi Nhớ Lặp Lại Ngắt Quãng (Spaced Repetition)</h4>
          <p className="text-xs text-slate-500">
            Tự động phát hiện các cấu trúc định nghĩa "là", "gồm có", "tập trung vào" để tạo thẻ ôn tập.
          </p>
        </div>

        <button
          onClick={handleGenerateFlashcards}
          className="px-4 py-1.5 bg-slate-900 hover:bg-black text-white rounded-lg text-xs font-bold transition-colors shadow-xs"
        >
          {flashcards.length > 0 ? 'Tạo Lại Thẻ' : 'Trích Xuất Flashcards'}
        </button>
      </div>

      {/* Flashcard Area */}
      <div className="flex-1 flex flex-col items-center justify-center py-6">
        {currentCard ? (
          <div className="w-full max-w-md flex flex-col items-center">
            {/* Card Frame */}
            <div
              onClick={() => setIsFlipped(!isFlipped)}
              className="w-full h-56 bg-white border-2 border-slate-300 hover:border-slate-800 rounded-2xl p-6 shadow-md cursor-pointer flex flex-col justify-between transition-all select-none relative group"
            >
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span className="font-bold text-slate-600 uppercase">
                  {isFlipped ? 'Mặt Sau (Định Nghĩa / Giải Thích)' : 'Mặt Trước (Thuật Ngữ)'}
                </span>
                <span className="flex items-center gap-1 group-hover:text-slate-900 transition-colors">
                  <RotateCw className="w-3 h-3" /> Lật thẻ
                </span>
              </div>

              <div className="flex-1 flex items-center justify-center text-center px-4">
                <p className={`text-slate-900 leading-relaxed font-sans ${isFlipped ? 'text-sm' : 'text-base font-bold'}`}>
                  {isFlipped ? currentCard.back : currentCard.front}
                </p>
              </div>

              <div className="text-center text-[10px] text-slate-400 font-mono">
                Thẻ {currentIdx + 1} trên {flashcards.length}
              </div>
            </div>

            {/* Navigation Controls */}
            <div className="flex items-center gap-4 mt-6">
              <button
                onClick={handlePrev}
                disabled={currentIdx === 0}
                className="p-2 rounded-full border border-slate-300 hover:bg-slate-100 disabled:opacity-30 transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-slate-700" />
              </button>

              <span className="text-xs font-mono font-semibold text-slate-700">
                {currentIdx + 1} / {flashcards.length}
              </span>

              <button
                onClick={handleNext}
                disabled={currentIdx === flashcards.length - 1}
                className="p-2 rounded-full border border-slate-300 hover:bg-slate-100 disabled:opacity-30 transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-slate-700" />
              </button>
            </div>
          </div>
        ) : (
          <div className="h-64 w-full flex flex-col items-center justify-center text-slate-400 text-xs text-center border-2 border-dashed border-slate-200 rounded-xl">
            <Layers className="w-8 h-8 mb-2 text-slate-300" />
            <span>Nhấn "Trích Xuất Flashcards" để tạo bộ thẻ ghi nhớ thông minh</span>
          </div>
        )}
      </div>

      {/* Footer */}
      {currentCard && (
        <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={handleExportCardToDesk}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold transition-colors border border-slate-300"
          >
            <StickyNote className="w-3.5 h-3.5 text-amber-600" />
            <span>Ghim Thẻ Này Lên Bàn Học</span>
          </button>

          <span className="text-[11px] text-slate-400 italic">
            Nhấp trực tiếp vào thẻ hoặc nhấn nút Lật để xem đáp án
          </span>
        </div>
      )}
    </div>
  );
}
