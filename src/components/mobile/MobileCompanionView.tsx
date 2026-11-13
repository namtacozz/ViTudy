'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useStudySpace } from '@/context/StudySpaceContext';
import { useViToken } from '@/context/ViTokenContext';
import { useAuth } from '@/context/AuthContext';
import {
  BookOpen,
  FileText,
  ChevronRight,
  ArrowLeft,
  LayoutGrid,
  Layers,
  CheckCircle2,
  StickyNote,
  RotateCw,
} from 'lucide-react';
import Link from 'next/link';
import { getAssetPath } from '@/lib/assets';
import { FlashcardService, FlashcardReview } from '@/services/FlashcardService';
import { generateClozeQuestions, generateFlashcardsFromRules, QuizQuestion } from '@/lib/nonAiEngine';
import { MathRenderer } from '@/components/common/MathRenderer';

interface MobileCompanionViewProps {
  onSwitchToCanvas?: () => void;
}

type MobileTab = 'docs' | 'flashcards' | 'quiz' | 'notes';

export function MobileCompanionView({ onSwitchToCanvas }: MobileCompanionViewProps) {
  const { activeSpace } = useStudySpace();
  const { wallet } = useViToken();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<MobileTab>('docs');
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);

  // Flashcard state (SM-2)
  const [dueCards, setDueCards] = useState<FlashcardReview[]>([]);
  const [cardIdx, setCardIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Quick Quiz state
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [quizGraded, setQuizGraded] = useState(false);

  const docItems = useMemo(
    () => activeSpace.items.filter(i => i.type === 'book' || i.type === 'paper'),
    [activeSpace.items]
  );

  const noteItems = useMemo(
    () => activeSpace.items.filter(i => i.type === 'sticky_note'),
    [activeSpace.items]
  );

  const selectedDoc = activeSpace.items.find(i => i.id === selectedDocId);

  const combinedText = useMemo(
    () => docItems.flatMap(d => d.pages.map(p => p.text)).filter(Boolean).join('\n\n'),
    [docItems]
  );

  useEffect(() => {
    if (activeTab !== 'flashcards') return;
    let cancelled = false;
    if (user?.id) {
      FlashcardService.getCardsForReview(user.id).then(cards => {
        if (cancelled) return;
        if (cards.length > 0) {
          setDueCards(cards);
          return;
        }
        if (combinedText) {
          const generated = generateFlashcardsFromRules(combinedText, 6);
          setDueCards(
            generated.map((g, idx) => ({
              id: `local-${idx}`,
              userId: user.id,
              cardHash: `local-${idx}`,
              front: g.front,
              back: g.back,
              easinessFactor: 2.5,
              intervalDays: 1,
              repetitions: 0,
              nextReviewDate: new Date().toISOString().split('T')[0],
              lastReviewedAt: null,
            }))
          );
        }
      });
    } else if (combinedText) {
      const generated = generateFlashcardsFromRules(combinedText, 6);
      setDueCards(
        generated.map((g, idx) => ({
          id: `guest-${idx}`,
          userId: 'guest',
          cardHash: `guest-${idx}`,
          front: g.front,
          back: g.back,
          easinessFactor: 2.5,
          intervalDays: 1,
          repetitions: 0,
          nextReviewDate: new Date().toISOString().split('T')[0],
          lastReviewedAt: null,
        }))
      );
    }
    return () => {
      cancelled = true;
    };
  }, [activeTab, user?.id, combinedText]);

  const handleRateCard = async (quality: 1 | 3 | 4 | 5) => {
    const current = dueCards[cardIdx];
    if (current && user?.id && !current.id.startsWith('local-')) {
      await FlashcardService.submitReview(
        user.id,
        { front: current.front, back: current.back, documentId: current.documentId },
        quality
      );
    }
    setIsFlipped(false);
    setCardIdx(prev => (prev + 1 < dueCards.length ? prev + 1 : 0));
  };

  const handleGenerateMobileQuiz = () => {
    if (!combinedText) return;
    setQuizQuestions(generateClozeQuestions(combinedText, 5));
    setQuizAnswers({});
    setQuizGraded(false);
  };

  return (
    <div className="w-full min-h-screen bg-stone-50 text-stone-800 flex flex-col md:hidden pb-20 font-sans">
      {/* Top Mobile Bar */}
      <header className="px-4 py-3 bg-white border-b border-stone-200 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
        <div className="flex items-center gap-2.5 min-w-0">
          <Link href="/?view=home" className="flex items-center gap-1.5 flex-shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={getAssetPath('/icons/vitudy.png')}
              alt="ViTudy"
              width={24}
              height={24}
              className="w-6 h-6 rounded-md object-contain"
            />
            <span className="text-sm font-black tracking-tight text-[#E0562D]">ViTudy</span>
          </Link>
          <span className="text-stone-300">/</span>
          <span className="text-xs font-bold text-stone-800 truncate">{activeSpace.name}</span>
        </div>

        {/* Action Controls: Switch to Canvas & ViToken */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {onSwitchToCanvas && (
            <button
              type="button"
              onClick={onSwitchToCanvas}
              className="px-2.5 py-1 bg-orange-50 hover:bg-orange-100 border border-orange-200 text-[#B8431A] text-[11px] font-bold rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
            >
              <LayoutGrid className="w-3 h-3 text-[#E0562D]" />
              <span>Bàn học 2.5D</span>
            </button>
          )}

          {/* ViToken Badge */}
          <div className="flex items-center gap-1 bg-stone-100 border border-stone-200 px-2 py-1 rounded-full text-stone-800 text-xs font-mono font-bold">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={getAssetPath('/icons/vitoken.svg')}
              alt="ViToken"
              width={14}
              height={14}
              className="w-3.5 h-3.5 object-contain"
            />
            <span>{wallet?.balance ?? 0}</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4">
        {activeTab === 'docs' && (
          selectedDoc ? (
            <div className="space-y-4">
              <button
                onClick={() => setSelectedDocId(null)}
                className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 font-medium mb-2 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Quay lại danh sách tài liệu</span>
              </button>

              <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                    {selectedDoc.type === 'book' ? 'Sách' : 'Tờ giấy'}
                  </span>
                  <span className="text-xs text-slate-500">{selectedDoc.pageCount} trang</span>
                </div>
                <h2 className="text-base font-bold text-slate-900 mb-4">{selectedDoc.title}</h2>
                <div className="space-y-4">
                  {selectedDoc.pages.map((p, idx) => (
                    <div key={p.id || idx} className="bg-slate-50/70 rounded-lg p-4 border border-slate-200">
                      <div className="text-[11px] font-mono font-semibold text-slate-500 mb-1.5">
                        Trang {p.pageNumber} {p.title ? `— ${p.title}` : ''}
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line font-sans">
                        {p.text}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div>
              <div className="mb-4">
                <h2 className="text-base font-bold text-slate-900">Tài liệu đang mở</h2>
                <p className="text-xs text-slate-500">
                  Đồng bộ trực tiếp với bàn học StudySpace.
                </p>
              </div>
              {docItems.length === 0 ? (
                <div className="bg-white border border-dashed border-slate-300 rounded-xl p-6 text-center text-xs text-slate-500">
                  Chưa có tài liệu nào trên bàn học này.
                </div>
              ) : (
                <div className="space-y-3">
                  {docItems.map(item => (
                    <div
                      key={item.id}
                      onClick={() => setSelectedDocId(item.id)}
                      className="bg-white border border-slate-200 hover:border-slate-300 rounded-xl p-3.5 flex items-center justify-between active:bg-slate-50 cursor-pointer shadow-2xs transition-all"
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-9 h-9 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center flex-shrink-0 text-slate-700">
                          {item.type === 'book' ? <BookOpen className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                        </div>
                        <div className="truncate">
                          <h3 className="text-xs font-bold text-slate-900 truncate">{item.title}</h3>
                          <p className="text-[11px] text-slate-500">
                            {item.type === 'book' ? `${item.pageCount} trang (Sách)` : `${item.pageCount} trang (Tờ giấy)`}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        )}

        {activeTab === 'flashcards' && (
          <div className="space-y-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Ôn tập thẻ ghi nhớ</h2>
              <p className="text-xs text-slate-500">Lịch ôn lặp lại ngắt quãng SM-2.</p>
            </div>
            {dueCards.length === 0 ? (
              <div className="bg-white border border-dashed border-slate-300 rounded-xl p-6 text-center text-xs text-slate-500">
                Chưa có thẻ ghi nhớ nào. Hãy mở tài liệu có chữ để hệ thống trích xuất thẻ ôn tập.
              </div>
            ) : (
              <div className="space-y-3">
                <div className="text-[11px] font-mono text-slate-500 text-right">
                  Thẻ {cardIdx + 1} / {dueCards.length}
                </div>
                <div
                  onClick={() => setIsFlipped(f => !f)}
                  className="bg-white border border-slate-200 rounded-2xl p-6 min-h-[200px] flex flex-col items-center justify-center text-center shadow-xs cursor-pointer"
                >
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                    {isFlipped ? 'Mặt sau · Đáp án' : 'Mặt trước · Chạm để lật'}
                  </span>
                  <div className="text-sm font-semibold text-slate-900 leading-relaxed">
                    <MathRenderer content={isFlipped ? dueCards[cardIdx].back : dueCards[cardIdx].front} />
                  </div>
                </div>
                {isFlipped && (
                  <div className="grid grid-cols-4 gap-2">
                    <button onClick={() => handleRateCard(1)} className="py-2 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-700">Quên</button>
                    <button onClick={() => handleRateCard(3)} className="py-2 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-700">Khó</button>
                    <button onClick={() => handleRateCard(4)} className="py-2 rounded-lg bg-orange-50 border border-orange-200 text-xs font-bold text-[#E0562D]">Tốt</button>
                    <button onClick={() => handleRateCard(5)} className="py-2 rounded-lg bg-[#E0562D] text-xs font-bold text-white">Dễ</button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'quiz' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">Trắc nghiệm nhanh</h2>
                <p className="text-xs text-slate-500">Tạo từ nội dung tài liệu trên bàn.</p>
              </div>
              <button
                onClick={handleGenerateMobileQuiz}
                disabled={!combinedText}
                className="px-3 py-1.5 bg-[#E0562D] hover:bg-[#c9451e] text-white text-xs font-bold rounded-lg disabled:opacity-50 flex items-center gap-1"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>Tạo đề</span>
              </button>
            </div>
            {quizQuestions.length === 0 ? (
              <div className="bg-white border border-dashed border-slate-300 rounded-xl p-6 text-center text-xs text-slate-500">
                Nhấn "Tạo đề" để sinh nhanh 5 câu hỏi trắc nghiệm miễn phí.
              </div>
            ) : (
              <div className="space-y-3">
                {quizQuestions.map((q, idx) => (
                  <div key={q.id} className="bg-white border border-slate-200 rounded-xl p-4 space-y-2">
                    <div className="text-xs font-bold text-slate-900">
                      Câu {idx + 1}: <MathRenderer content={q.question} />
                    </div>
                    <div className="space-y-1.5">
                      {q.options.map((opt, oIdx) => {
                        const chosen = quizAnswers[q.id] === oIdx;
                        const isRight = oIdx === q.correctIndex;
                        let cls = 'border-slate-200 bg-slate-50 text-slate-700';
                        if (quizGraded) {
                          if (isRight) cls = 'border-emerald-500 bg-emerald-50 text-emerald-800';
                          else if (chosen) cls = 'border-rose-400 bg-rose-50 text-rose-800';
                        } else if (chosen) {
                          cls = 'border-[#E0562D] bg-orange-50 text-[#9A3412]';
                        }
                        return (
                          <button
                            key={oIdx}
                            disabled={quizGraded}
                            onClick={() => setQuizAnswers(prev => ({ ...prev, [q.id]: oIdx }))}
                            className={`w-full text-left px-3 py-2 rounded-lg border text-xs font-medium ${cls}`}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
                {!quizGraded && (
                  <button
                    onClick={() => setQuizGraded(true)}
                    className="w-full py-2.5 rounded-xl bg-[#E0562D] text-white text-xs font-bold"
                  >
                    Chấm điểm ngay
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'notes' && (
          <div className="space-y-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Ghi chú trên bàn</h2>
              <p className="text-xs text-slate-500">Các giấy nhớ và ghi chú đã ghim.</p>
            </div>
            {noteItems.length === 0 ? (
              <div className="bg-white border border-dashed border-slate-300 rounded-xl p-6 text-center text-xs text-slate-500">
                Chưa có ghi chú nào trên bàn học này.
              </div>
            ) : (
              <div className="space-y-3">
                {noteItems.map(n => (
                  <div key={n.id} className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-xs text-slate-800 whitespace-pre-line">
                    <div className="font-bold text-slate-900 mb-1">{n.title || 'Ghi chú'}</div>
                    {n.pages?.[0]?.text || ''}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Bottom Mobile Navigation */}
      <nav className="fixed bottom-0 inset-x-0 bg-white border-t border-slate-200 px-2 py-1.5 grid grid-cols-4 gap-1 z-30">
        {[
          { id: 'docs' as const, label: 'Tài liệu', Icon: BookOpen },
          { id: 'flashcards' as const, label: 'Thẻ ghi nhớ', Icon: Layers },
          { id: 'quiz' as const, label: 'Trắc nghiệm', Icon: CheckCircle2 },
          { id: 'notes' as const, label: 'Ghi chú', Icon: StickyNote },
        ].map(({ id, label, Icon }) => {
          const active = activeTab === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id)}
              className={`flex flex-col items-center justify-center py-1 rounded-lg text-[10px] font-bold transition-colors ${
                active ? 'text-[#E0562D] bg-orange-50/70' : 'text-slate-500'
              }`}
            >
              <Icon className="w-4 h-4 mb-0.5" />
              <span>{label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
