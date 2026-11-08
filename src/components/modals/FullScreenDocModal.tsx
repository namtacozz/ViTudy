'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { DeskItem } from '@/types/studyspace';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  BookOpen, 
  FileText, 
  Maximize2, 
  Minimize2,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles
} from 'lucide-react';
import { paginateDocument, PaginatedLeaf } from '@/utils/pagination';

interface FullScreenDocModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: DeskItem;
  initialPageIndex?: number;
}

export function FullScreenDocModal({
  isOpen,
  onClose,
  item,
  initialPageIndex = 0
}: FullScreenDocModalProps) {
  const [currentPage, setCurrentPage] = useState(initialPageIndex);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [isTwoPageSpread, setIsTwoPageSpread] = useState(item.type === 'book');
  const [mounted, setMounted] = useState(false);

  const isExam = !!item.isExamSheet && !!item.examData;
  const exam = item.examData;

  // Use dynamic paginated leaves for books and documents
  const leaves: PaginatedLeaf[] = paginateDocument(item.pages);
  const totalLeaves = Math.max(leaves.length, 1);

  const leftIndex = isTwoPageSpread ? (currentPage % 2 === 0 ? currentPage : currentPage - 1) : currentPage;
  const rightIndex = leftIndex + 1;

  const leftLeaf = leaves[leftIndex] || null;
  const rightLeaf = isTwoPageSpread ? (leaves[rightIndex] || null) : null;

  const handlePrev = () => {
    const step = isTwoPageSpread ? 2 : 1;
    setCurrentPage(prev => Math.max(0, prev - step));
  };

  const handleNext = () => {
    const step = isTwoPageSpread ? 2 : 1;
    setCurrentPage(prev => Math.min(totalLeaves - 1, prev + step));
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setCurrentPage(initialPageIndex);
  }, [initialPageIndex, isOpen]);

  // Handle ESC and Arrow keys
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, isTwoPageSpread, currentPage, totalLeaves]);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div 
      data-fullscreen-modal="true"
      className="fixed inset-0 z-[100] bg-slate-950/95 backdrop-blur-md flex flex-col select-none text-slate-100 font-sans animate-fade-in"
      onClick={onClose}
    >
      {/* Top Header Controls Bar */}
      <div 
        className="flex items-center justify-between px-6 py-3 bg-slate-900 border-b border-slate-800 flex-shrink-0 z-20 shadow-md"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left: Document Info */}
        <div className="flex items-center gap-3 overflow-hidden max-w-md">
          <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center flex-shrink-0">
            {isExam ? (
              <FileText className="w-4 h-4 text-slate-300" />
            ) : item.type === 'book' ? (
              <BookOpen className="w-4 h-4 text-slate-300" />
            ) : (
              <FileText className="w-4 h-4 text-slate-300" />
            )}
          </div>
          <div className="overflow-hidden">
            <h2 className="text-sm font-bold text-white truncate" title={item.title}>
              {item.title}
            </h2>
            <div className="flex items-center gap-2 text-[11px] text-slate-400">
              <span className="capitalize">{isExam ? 'Đề thi trắc nghiệm' : item.type === 'book' ? 'Sách mở đôi' : 'Tài liệu học'}</span>
              <span>•</span>
              <span>{isExam ? `${exam?.questions.length || 0} câu hỏi` : `${totalLeaves} trang`}</span>
            </div>
          </div>
        </div>

        {/* Center: Navigation & View Controls */}
        {!isExam && (
          <div className="flex items-center gap-3 bg-slate-800/90 px-3 py-1.5 rounded-full border border-slate-700 shadow-inner">
            <button
              onClick={handlePrev}
              disabled={leftIndex <= 0}
              title="Trang trước (←)"
              className="p-1 rounded-full hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-transparent text-slate-200 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-1.5 text-xs font-mono font-semibold px-2">
              {isTwoPageSpread ? (
                <span>Trang {leftIndex + 1}{rightLeaf ? `-${Math.min(rightIndex + 1, totalLeaves)}` : ''} / {totalLeaves}</span>
              ) : (
                <span>Trang {currentPage + 1} / {totalLeaves}</span>
              )}
            </div>

            <button
              onClick={handleNext}
              disabled={isTwoPageSpread ? rightIndex >= totalLeaves - 1 : currentPage >= totalLeaves - 1}
              title="Trang sau (→)"
              className="p-1 rounded-full hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-transparent text-slate-200 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <div className="w-[1px] h-4 bg-slate-700 mx-1" />

            {/* View Mode Toggle: 2-page spread vs 1-page */}
            {item.type === 'book' && (
              <button
                onClick={() => setIsTwoPageSpread(!isTwoPageSpread)}
                title={isTwoPageSpread ? "Chuyển sang xem 1 trang" : "Chuyển sang xem 2 trang"}
                className={`text-[11px] px-2 py-0.5 rounded font-medium transition-colors ${
                  isTwoPageSpread ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                {isTwoPageSpread ? '2 Trang' : '1 Trang'}
              </button>
            )}

            <div className="w-[1px] h-4 bg-slate-700 mx-1" />

            {/* Zoom Controls */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setZoomLevel(prev => Math.max(60, prev - 10))}
                title="Thu nhỏ"
                className="p-1 rounded hover:bg-slate-700 text-slate-300 transition-colors"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="text-[11px] font-mono text-slate-300 w-9 text-center">
                {zoomLevel}%
              </span>
              <button
                onClick={() => setZoomLevel(prev => Math.min(160, prev + 10))}
                title="Phóng to"
                className="p-1 rounded hover:bg-slate-700 text-slate-300 transition-colors"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setZoomLevel(100)}
                title="Khôi phục 100%"
                className="p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-white transition-colors ml-0.5"
              >
                <RotateCcw className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}

        {/* Right: Exit / Close Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-medium text-xs border border-slate-700 shadow-sm transition-all"
            title="Thoát chế độ toàn màn hình (Phím Esc)"
          >
            <Minimize2 className="w-3.5 h-3.5" />
            <span>Thoát</span>
            <kbd className="text-[10px] text-slate-400 bg-slate-900 px-1 rounded font-mono ml-0.5 border border-slate-700">Esc</kbd>
          </button>
        </div>
      </div>

      {/* Main Document Body Viewer */}
      <div 
        className="flex-1 overflow-auto flex items-center justify-center p-6 bg-slate-950/80 cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        <div 
          style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'center center' }}
          className="transition-transform duration-150 ease-out"
        >
          {isExam && exam ? (
            /* ================= FULL SCREEN EXAM SHEET ================= */
            <div 
              style={{ width: 680, minHeight: 900, backgroundColor: '#ffffff', color: '#0f172a' }}
              className="rounded-sm p-8 shadow-2xl border border-slate-300 font-sans flex flex-col justify-between"
            >
              <div>
                <div className="border-b-2 border-slate-900 pb-3 mb-5 text-center">
                  <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-600 mb-1">
                    <span>VITUDY EDUCATION SYSTEM</span>
                    <span className="flex items-center gap-1 text-slate-900">
                      <Clock className="w-3.5 h-3.5" /> Thời gian: {exam.timeLimitMinutes || 15} phút
                    </span>
                  </div>
                  <h1 className="text-xl font-black text-slate-900 uppercase tracking-wide">
                    {item.title}
                  </h1>
                  <div className="flex items-center justify-between text-xs text-slate-500 mt-2 border-t border-slate-200 pt-2">
                    <span>Tổng số câu: {exam.questions.length} câu</span>
                    <span>Thí sinh: Thí sinh tự do</span>
                    <span className="font-mono font-semibold">Mã đề: 104</span>
                  </div>
                </div>

                {/* Question List */}
                <div className="space-y-6 text-sm">
                  {exam.questions.map((q, qIdx) => {
                    const selectedAns = exam.userAnswers[q.id];
                    const isCorrect = selectedAns === q.correctAnswer;

                    return (
                      <div key={q.id} className="p-4 rounded border border-slate-200 bg-slate-50/50">
                        <div className="font-bold text-slate-900 mb-3 flex items-start gap-2">
                          <span className="text-slate-500 font-mono">Câu {qIdx + 1}:</span>
                          <span>{q.question}</span>
                          {exam.isGraded && (
                            selectedAns !== undefined ? (
                              isCorrect ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 ml-auto" />
                              ) : (
                                <XCircle className="w-4 h-4 text-rose-500 flex-shrink-0 ml-auto" />
                              )
                            ) : null
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs">
                          {q.options.map((opt, optIdx) => {
                            const isSelectedOption = selectedAns === optIdx;
                            const isAnswerCorrect = q.correctAnswer === optIdx;

                            let optClass = "border-slate-200 bg-white hover:border-slate-400 text-slate-800";
                            if (isSelectedOption && !exam.isGraded) {
                              optClass = "border-slate-900 bg-slate-900 text-white font-semibold";
                            } else if (exam.isGraded) {
                              if (isAnswerCorrect) {
                                optClass = "border-emerald-500 bg-emerald-50 text-emerald-900 font-semibold";
                              } else if (isSelectedOption && !isAnswerCorrect) {
                                optClass = "border-rose-400 bg-rose-50 text-rose-900 line-through";
                              }
                            }

                            return (
                              <div
                                key={optIdx}
                                className={`flex items-center gap-2 p-2.5 rounded border transition-colors ${optClass}`}
                              >
                                <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center font-bold text-[10px]">
                                  {String.fromCharCode(65 + optIdx)}
                                </span>
                                <span className="flex-1">{opt}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {exam.isGraded && exam.score !== undefined && (
                <div className="mt-6 p-4 rounded bg-slate-100 border border-slate-300 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-slate-900 text-white font-mono font-bold flex items-center justify-center text-lg">
                      {exam.score}đ
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">KẾT QUẢ ĐÁNH GIÁ</div>
                      <div className="text-xs text-slate-600">{exam.teacherNote}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : isTwoPageSpread ? (
            /* ================= FULL SCREEN 2-PAGE SPREAD ================= */
            <div 
              style={{ width: 1040, minHeight: 700 }}
              className="flex rounded-md shadow-2xl overflow-hidden border border-stone-300 bg-[#fdfbf7] text-slate-900"
            >
              {/* Left Page */}
              <div className="flex-1 p-10 flex flex-col justify-between border-r border-stone-300 relative">
                {leftLeaf ? (
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="pb-2 mb-4 border-b border-stone-200">
                        <span className="text-xs font-bold text-slate-600">
                          {leftLeaf.chapterTitle}
                        </span>
                      </div>
                      <p className="text-[15.5px] leading-[1.8] text-slate-900 whitespace-pre-line font-sans selection:bg-slate-200">
                        {leftLeaf.text}
                      </p>
                    </div>
                    <div className="text-center text-xs font-mono text-slate-500 pt-4 border-t border-stone-200">
                      - {leftLeaf.pageNumber} -
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-stone-400 italic text-sm">
                    Trang trống
                  </div>
                )}
              </div>

              {/* Central Spine Seam Shadow */}
              <div className="w-[2px] bg-gradient-to-r from-stone-400/30 via-stone-500/40 to-stone-400/30 shadow-inner" />

              {/* Right Page */}
              <div className="flex-1 p-10 flex flex-col justify-between relative">
                {rightLeaf ? (
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="pb-2 mb-4 border-b border-stone-200">
                        <span className="text-xs font-bold text-slate-600">
                          {rightLeaf.chapterTitle}
                        </span>
                      </div>
                      <p className="text-[15.5px] leading-[1.8] text-slate-900 whitespace-pre-line font-sans selection:bg-slate-200">
                        {rightLeaf.text}
                      </p>
                    </div>
                    <div className="text-center text-xs font-mono text-slate-500 pt-4 border-t border-stone-200">
                      - {rightLeaf.pageNumber} -
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-stone-400 italic text-sm">
                    (Hết tài liệu)
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* ================= FULL SCREEN SINGLE PAGE ================= */
            <div 
              style={{ width: 620, minHeight: 820 }}
              className="rounded-md shadow-2xl p-10 border border-stone-300 bg-[#fdfbf7] text-slate-900 flex flex-col justify-between"
            >
              {leftLeaf ? (
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="pb-2 mb-4 border-b border-stone-200">
                      <span className="text-xs font-bold text-slate-600">
                        {leftLeaf.chapterTitle}
                      </span>
                    </div>
                    <p className="text-[16px] leading-[1.8] text-slate-900 whitespace-pre-line font-sans selection:bg-slate-200">
                      {leftLeaf.text}
                    </p>
                  </div>
                  <div className="text-center text-xs font-mono text-slate-500 pt-4 border-t border-stone-200">
                    - {leftLeaf.pageNumber} -
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-stone-400 italic text-sm">
                  Trang trống
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
