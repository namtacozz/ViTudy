'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { DeskItem } from '@/types/studyspace';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  ZoomIn, 
  ZoomOut, 
  RotateCw,
  Maximize2,
  BookOpen, 
  FileText, 
  Clock,
  CheckCircle2,
  XCircle,
  PanelLeft,
  Printer,
  ChevronDown
} from 'lucide-react';
import { paginateDocument, PaginatedLeaf } from '@/utils/pagination';
import { MathRenderer } from '../common/MathRenderer';

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
  const [isTwoPageSpread, setIsTwoPageSpread] = useState(item.type === 'book');
  const [pageRotation, setPageRotation] = useState(0); // 0, 90, 180, 270
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isPrintMenuOpen, setIsPrintMenuOpen] = useState(false);
  const [printScope, setPrintScope] = useState<'all' | 'current'>('all');
  const [mounted, setMounted] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const isExam = !!item.isExamSheet && !!item.examData;
  const exam = item.examData;

  // Use dynamic paginated leaves for books and documents
  const leaves: PaginatedLeaf[] = paginateDocument(item.pages);
  const totalLeaves = Math.max(leaves.length, 1);
  const isImageDoc = leaves.some(l => !!l.image);

  const calculateFitHeightZoom = () => {
    if (typeof window === 'undefined') return 100;
    const availableHeight = window.innerHeight - 140;
    const pageHeight = isTwoPageSpread ? 700 : 840;
    const ratio = Math.min(1.4, Math.max(0.4, availableHeight / pageHeight));
    return Math.round(ratio * 100);
  };

  const calculateFitWidthZoom = () => {
    if (typeof window === 'undefined') return 100;
    const availableWidth = window.innerWidth - (isSidebarOpen ? 260 : 20) - 80;
    const pageWidth = isTwoPageSpread ? 1040 : 640;
    const ratio = Math.min(1.6, Math.max(0.4, availableWidth / pageWidth));
    return Math.round(ratio * 100);
  };

  const [fitMode, setFitMode] = useState<'fit-height' | 'fit-width' | 'custom'>(isImageDoc ? 'fit-height' : 'custom');
  const [zoomLevel, setZoomLevel] = useState(isImageDoc ? calculateFitHeightZoom() : 100);

  useEffect(() => {
    if (isImageDoc) {
      setFitMode('fit-height');
      setZoomLevel(calculateFitHeightZoom());
    }
  }, [isImageDoc, isTwoPageSpread]);

  // Group pages into two-page spreads when in book view
  const spreads: [number, number?][] = [];
  for (let i = 0; i < totalLeaves; i += 2) {
    if (i + 1 < totalLeaves) {
      spreads.push([i, i + 1]);
    } else {
      spreads.push([i]);
    }
  }

  const leftIndex = isTwoPageSpread ? (currentPage % 2 === 0 ? currentPage : currentPage - 1) : currentPage;
  const rightIndex = leftIndex + 1;

  const scrollToPage = (pageIdx: number) => {
    setCurrentPage(pageIdx);
    const elementId = isTwoPageSpread 
      ? `fullscreen-spread-${Math.floor(pageIdx / 2)}`
      : `fullscreen-page-${pageIdx}`;
    const el = document.getElementById(elementId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handlePrev = () => {
    const step = isTwoPageSpread ? 2 : 1;
    const target = Math.max(0, currentPage - step);
    scrollToPage(target);
  };

  const handleNext = () => {
    const step = isTwoPageSpread ? 2 : 1;
    const target = Math.min(totalLeaves - 1, currentPage + step);
    scrollToPage(target);
  };

  const handleScroll = () => {
    if (!scrollContainerRef.current || isExam) return;
    const container = scrollContainerRef.current;
    const containerTop = container.getBoundingClientRect().top;

    if (isTwoPageSpread) {
      for (let sIdx = 0; sIdx < spreads.length; sIdx++) {
        const el = document.getElementById(`fullscreen-spread-${sIdx}`);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.bottom >= containerTop + 140) {
            const pageIndex = spreads[sIdx][0];
            if (pageIndex !== currentPage) {
              setCurrentPage(pageIndex);
            }
            break;
          }
        }
      }
    } else {
      for (let lIdx = 0; lIdx < leaves.length; lIdx++) {
        const el = document.getElementById(`fullscreen-page-${lIdx}`);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.bottom >= containerTop + 140) {
            if (lIdx !== currentPage) {
              setCurrentPage(lIdx);
            }
            break;
          }
        }
      }
    }
  };

  const handleRotatePage = () => {
    setPageRotation(prev => (prev + 90) % 360);
  };

  const handlePrint = (scope: 'all' | 'current' = 'all') => {
    setPrintScope(scope);
    setIsPrintMenuOpen(false);
    setTimeout(() => {
      window.print();
    }, 120);
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setCurrentPage(initialPageIndex);
  }, [initialPageIndex, isOpen]);

  useEffect(() => {
    if (isOpen && mounted) {
      const timer = setTimeout(() => {
        const elementId = isTwoPageSpread 
          ? `fullscreen-spread-${Math.floor(initialPageIndex / 2)}`
          : `fullscreen-page-${initialPageIndex}`;
        const el = document.getElementById(elementId);
        if (el) {
          el.scrollIntoView({ behavior: 'auto', block: 'start' });
        }
      }, 80);
      return () => clearTimeout(timer);
    }
  }, [isOpen, mounted, isTwoPageSpread, initialPageIndex]);

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
      className="fixed inset-0 z-[100] bg-[#e8ebf0] flex flex-col select-none text-slate-900 font-sans animate-fade-in"
      onClick={onClose}
    >
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body {
            background: white !important;
            overflow: visible !important;
          }
          .no-print, [data-fullscreen-modal="true"] > div:first-child, .fullscreen-sidebar {
            display: none !important;
          }
          [data-fullscreen-modal="true"] {
            position: static !important;
            background: white !important;
            inset: auto !important;
            overflow: visible !important;
            display: block !important;
          }
          .fullscreen-canvas {
            padding: 0 !important;
            background: white !important;
            overflow: visible !important;
            display: block !important;
          }
          .fullscreen-page-item {
            box-shadow: none !important;
            border: none !important;
            break-after: page !important;
            page-break-after: always !important;
            margin: 0 auto !important;
            width: 100% !important;
            max-width: 100% !important;
            min-height: auto !important;
          }
          .print-hide {
            display: none !important;
          }
          @page {
            size: A4 portrait;
            margin: 12mm;
          }
        }
      `}} />

      {/* ================= 1. BROWSER PDF VIEWER TOP TOOLBAR (HUD White / Monochromatic) ================= */}
      <div 
        className="flex items-center justify-between px-4 py-2 bg-white border-b border-slate-300 flex-shrink-0 z-30 shadow-xs select-none no-print"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left: Sidebar Toggle & Document Info */}
        <div className="flex items-center gap-3 overflow-hidden max-w-md">
          {/* Sidebar Thumbnails Toggle Button */}
          {!isExam && (
            <button
              onClick={() => setIsSidebarOpen(prev => !prev)}
              title={isSidebarOpen ? "Ẩn danh sách trang thu nhỏ" : "Hiện danh sách trang thu nhỏ"}
              className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                isSidebarOpen 
                  ? 'bg-slate-200 text-slate-900 border-slate-300' 
                  : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
              }`}
            >
              <PanelLeft className="w-4 h-4 stroke-[2.2]" />
            </button>
          )}

          <div className="w-[1px] h-5 bg-slate-200" />

          {/* Doc Title */}
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="w-7 h-7 rounded-lg bg-orange-50 border border-orange-200 flex items-center justify-center flex-shrink-0 text-[#E0562D]">
              {isExam ? (
                <FileText className="w-3.5 h-3.5 stroke-[2.4]" />
              ) : item.type === 'book' ? (
                <BookOpen className="w-3.5 h-3.5 stroke-[2.4]" />
              ) : (
                <FileText className="w-3.5 h-3.5 stroke-[2.4]" />
              )}
            </div>
            <div className="overflow-hidden">
              <h2 className="text-xs font-bold text-slate-900 truncate" title={item.title}>
                {item.title}
              </h2>
              <div className="flex items-center gap-1.5 text-[10.5px] text-slate-500 font-mono">
                <span>{isExam ? `${exam?.questions.length || 0} câu` : `${totalLeaves} trang`}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Center: PDF Navigation & Zoom / View Toolbar */}
        {!isExam && (
          <div className="flex items-center gap-2 bg-slate-50 px-3 py-1 rounded-xl border border-slate-200 shadow-2xs">
            {/* Page Jump: [ < ]  1 / 23  [ > ] */}
            <div className="flex items-center gap-1">
              <button
                onClick={handlePrev}
                disabled={leftIndex <= 0}
                title="Trang trước (←)"
                className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-slate-200 disabled:opacity-30 disabled:hover:bg-transparent text-slate-800 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4 stroke-[2.4]" />
              </button>

              <div className="flex items-center gap-1 text-xs font-mono font-bold px-1.5">
                <span className="text-[#E0562D]">{isTwoPageSpread ? `${leftIndex + 1}${rightIndex < totalLeaves ? `-${Math.min(rightIndex + 1, totalLeaves)}` : ''}` : currentPage + 1}</span>
                <span className="text-slate-400">/</span>
                <span className="text-slate-700">{totalLeaves}</span>
              </div>

              <button
                onClick={handleNext}
                disabled={isTwoPageSpread ? rightIndex >= totalLeaves - 1 : currentPage >= totalLeaves - 1}
                title="Trang sau (→)"
                className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-slate-200 disabled:opacity-30 disabled:hover:bg-transparent text-slate-800 transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4 stroke-[2.4]" />
              </button>
            </div>

            <div className="w-[1px] h-4 bg-slate-300 mx-0.5" />

            {/* Zoom Controls: [ - ] 100% [ + ] */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  setFitMode('custom');
                  setZoomLevel(prev => Math.max(40, prev - 10));
                }}
                title="Thu nhỏ"
                className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
              >
                <ZoomOut className="w-3.5 h-3.5 stroke-[2.4]" />
              </button>

              <span className="text-xs font-mono font-bold text-slate-800 w-11 text-center">
                {zoomLevel}%
              </span>

              <button
                onClick={() => {
                  setFitMode('custom');
                  setZoomLevel(prev => Math.min(180, prev + 10));
                }}
                title="Phóng to"
                className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
              >
                <ZoomIn className="w-3.5 h-3.5 stroke-[2.4]" />
              </button>
            </div>

            {/* Fit Mode Switcher: Vừa khung / Vừa rộng / 100% */}
            <div className="flex items-center bg-slate-200/80 p-0.5 rounded-lg text-[11px] font-semibold text-slate-700">
              <button
                type="button"
                onClick={() => {
                  setFitMode('fit-height');
                  setZoomLevel(calculateFitHeightZoom());
                }}
                className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                  fitMode === 'fit-height'
                    ? 'bg-white text-[#E0562D] font-bold shadow-2xs'
                    : 'hover:text-slate-900'
                }`}
                title="Vừa khung nhìn: Co giãn ảnh để xem trọn trang theo chiều cao"
              >
                Vừa khung
              </button>
              <button
                type="button"
                onClick={() => {
                  setFitMode('fit-width');
                  setZoomLevel(calculateFitWidthZoom());
                }}
                className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                  fitMode === 'fit-width'
                    ? 'bg-white text-[#E0562D] font-bold shadow-2xs'
                    : 'hover:text-slate-900'
                }`}
                title="Vừa chiều rộng màn hình"
              >
                Vừa rộng
              </button>
              <button
                type="button"
                onClick={() => {
                  setFitMode('custom');
                  setZoomLevel(100);
                }}
                className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                  fitMode === 'custom' && zoomLevel === 100
                    ? 'bg-white text-[#E0562D] font-bold shadow-2xs'
                    : 'hover:text-slate-900'
                }`}
                title="Kích thước gốc 100%"
              >
                100%
              </button>
            </div>

            <div className="w-[1px] h-4 bg-slate-300 mx-0.5" />

            {/* Page Rotation (0° / 90° / 180° / 270°) */}
            <button
              onClick={handleRotatePage}
              title={`Xoay trang (${pageRotation}°) • Bấm để xoay tiếp 90°`}
              className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
            >
              <RotateCw className="w-3.5 h-3.5 stroke-[2.4]" />
            </button>

            {/* View Mode Toggle: Segmented Control Một trang / Hai trang */}
            {item.type === 'book' && (
              <>
                <div className="w-[1px] h-4 bg-slate-300 mx-0.5" />
                <div className="flex items-center rounded-lg border border-slate-300 p-0.5 bg-slate-200/80">
                  <button
                    type="button"
                    onClick={() => setIsTwoPageSpread(false)}
                    className={`text-xs px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer ${
                      !isTwoPageSpread 
                        ? 'bg-white text-slate-900 shadow-2xs' 
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Một trang
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsTwoPageSpread(true)}
                    className={`text-xs px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer ${
                      isTwoPageSpread 
                        ? 'bg-white text-slate-900 shadow-2xs' 
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Hai trang
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* Right: Print Menu & Close Buttons */}
        <div className="flex items-center gap-2 relative">
          <div className="relative">
            <button
              onClick={() => setIsPrintMenuOpen(prev => !prev)}
              title="In tài liệu"
              className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 hover:text-slate-900 font-bold text-xs border border-slate-300 shadow-2xs transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
            >
              <Printer className="w-4 h-4 stroke-[2.2]" />
              <span className="hidden sm:inline">In</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {isPrintMenuOpen && (
              <div 
                className="absolute right-0 top-full mt-1.5 w-44 bg-white border border-slate-200 rounded-xl shadow-xl py-1 z-50 text-xs font-semibold text-slate-800 animate-fade-in"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  onClick={() => handlePrint('current')}
                  className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center justify-between cursor-pointer"
                >
                  <span>In trang hiện tại</span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {isTwoPageSpread ? `${leftIndex + 1}-${Math.min(rightIndex + 1, totalLeaves)}` : currentPage + 1}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => handlePrint('all')}
                  className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center justify-between cursor-pointer border-t border-slate-100 text-[#E0562D]"
                >
                  <span>In toàn bộ ({totalLeaves} trang)</span>
                </button>
              </div>
            )}
          </div>

          <button
            onClick={onClose}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 hover:text-slate-900 font-bold text-xs border border-slate-300 shadow-2xs transition-all cursor-pointer active:scale-95"
            title="Đóng chế độ xem (Phím Esc)"
          >
            <X className="w-4 h-4 stroke-[2.4]" />
            <span>Đóng</span>
            <kbd className="text-[10px] text-slate-400 bg-slate-100 px-1 py-0.5 rounded font-mono ml-0.5 border border-slate-200">Esc</kbd>
          </button>
        </div>
      </div>

      {/* ================= 2. MAIN VIEWER LAYOUT: THUMBNAIL SIDEBAR + CENTER READING DESK ================= */}
      <div 
        className="flex-1 flex overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left Thumbnails Sidebar */}
        {!isExam && isSidebarOpen && (
          <div className="fullscreen-sidebar w-52 bg-slate-100/95 border-r border-slate-300 flex flex-col overflow-y-auto p-2.5 gap-2 select-none flex-shrink-0 no-scrollbar shadow-inner animate-fade-in no-print">
            <div className="text-[10px] font-black text-slate-500 uppercase tracking-wider px-1">
              Danh sách trang ({totalLeaves})
            </div>

            {leaves.map((leaf, lIdx) => {
              // Chỉ trang đang xem mới có viền cam 2px
              const isSelectedPage = isTwoPageSpread 
                ? (lIdx === leftIndex || (rightIndex < totalLeaves && lIdx === rightIndex))
                : lIdx === currentPage;

              // Làm sạch text hiển thị trên thumbnail (bỏ ký tự ##, $$, \)
              const cleanPreviewText = leaf.text
                ? leaf.text
                    .replace(/##\s+/g, '')
                    .replace(/###\s+/g, '')
                    .replace(/\$\$[\s\S]+?\$\$/g, '[Công thức toán]')
                    .replace(/\\\[[\s\S]+?\\\]/g, '[Công thức]')
                    .replace(/\\\([\s\S]+?\\\)/g, '')
                    .replace(/\$[^\$\n]+?\$/g, '')
                    .replace(/\\/g, '')
                    .replace(/\*\*/g, '')
                    .trim()
                : '';

              const cleanTitle = (leaf.chapterTitle || `Trang ${leaf.pageNumber}`).replace(/^##\s+/, '');

              return (
                <div 
                  key={leaf.pageNumber || lIdx}
                  onClick={() => scrollToPage(lIdx)}
                  className="flex flex-col items-center group cursor-pointer"
                >
                  {/* Miniature Page Card with height ~92px */}
                  <div 
                    className={`w-full h-24 bg-white rounded-lg p-2 flex flex-col justify-between transition-all overflow-hidden relative ${
                      isSelectedPage
                        ? 'border-2 border-[#E0562D] ring-1 ring-[#E0562D]/50 shadow-md'
                        : 'border border-slate-300 hover:border-slate-400 shadow-2xs hover:shadow-xs'
                    }`}
                  >
                    {/* Số trang ở góc trên bên phải thumbnail */}
                    <div className="absolute top-1.5 right-1.5 text-[9px] font-mono font-bold text-slate-600 bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200">
                      {leaf.pageNumber}
                    </div>

                    {leaf.image ? (
                      <div className="w-full h-full relative flex items-center justify-center overflow-hidden">
                        <img 
                          src={leaf.image} 
                          alt={`Trang ${leaf.pageNumber}`}
                          className="max-w-full max-h-full object-contain pointer-events-none select-none rounded-xs"
                        />
                      </div>
                    ) : (
                      <div className="pr-6">
                        <div className="text-[9px] font-bold text-slate-900 line-clamp-1 border-b border-slate-100 pb-0.5 mb-1 leading-tight text-left">
                          {cleanTitle}
                        </div>
                        <div className="text-[8px] leading-snug text-slate-500 line-clamp-3 select-none pointer-events-none text-left">
                          {cleanPreviewText}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Center Document Canvas Pane */}
        <div 
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="fullscreen-canvas flex-1 overflow-auto flex flex-col items-center p-8 bg-[#e8ebf0] cursor-default relative"
          onClick={(e) => e.stopPropagation()}
        >
          <div 
            style={{ 
              transform: `scale(${zoomLevel / 100}) rotate(${pageRotation}deg)`, 
              transformOrigin: 'top center',
              margin: '0 auto'
            }}
            className="transition-transform duration-200 ease-out flex items-center justify-center shrink-0"
          >
            {isExam && exam ? (
              /* ================= FULL SCREEN EXAM SHEET ================= */
              <div 
                style={{ width: 680, minHeight: 900, backgroundColor: '#ffffff', color: '#0f172a' }}
                className="fullscreen-page-item rounded-sm p-8 shadow-2xl border border-slate-300 font-sans flex flex-col justify-between relative"
              >
                {item.purchased && (
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden z-10 opacity-[0.04] select-none">
                    <span className="text-4xl font-black font-sans uppercase -rotate-45 tracking-widest whitespace-nowrap text-slate-900">
                      Bản quyền ViTudy • {item.author || 'ViTudy Education'}
                    </span>
                  </div>
                )}
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
                        <div key={q.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                          <div className="font-bold text-slate-900 mb-3 flex items-start gap-2">
                            <span className="text-slate-500 font-mono">Câu {qIdx + 1}:</span>
                            <span className="flex-1 text-left">
                              <MathRenderer content={q.question} />
                            </span>
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
                                optClass = "border-[#E0562D] bg-[#FFF7ED] text-[#9A3412] font-semibold";
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
                                  className={`flex items-center gap-2 p-2.5 rounded-lg border transition-colors ${optClass}`}
                                >
                                  <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center font-bold text-[10px]">
                                    {String.fromCharCode(65 + optIdx)}
                                  </span>
                                  <span className="flex-1 text-left">
                                    <MathRenderer content={opt} />
                                  </span>
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
                  <div className="mt-6 p-4 rounded-xl bg-slate-100 border border-slate-300 flex items-center justify-between">
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
              /* ================= FULL SCREEN 2-PAGE SPREADS (CONTINUOUS STREAM) ================= */
              <div className="flex flex-col items-center gap-8 pb-16">
                {spreads.map((spread, sIdx) => {
                  const leftLeafItem = leaves[spread[0]] || null;
                  const rightLeafItem = spread[1] !== undefined ? leaves[spread[1]] : null;
                  const isCurrentSpread = sIdx === Math.floor(currentPage / 2);
                  const printHideClass = printScope === 'current' && !isCurrentSpread ? 'print-hide' : '';

                  return (
                    <div 
                      key={sIdx}
                      id={`fullscreen-spread-${sIdx}`}
                      style={{ width: 1040, minHeight: 700 }}
                      className={`fullscreen-page-item flex rounded-md shadow-2xl overflow-hidden border border-slate-300 bg-white text-slate-900 flex-shrink-0 relative ${printHideClass}`}
                    >
                      {item.purchased && (
                        <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden z-10 opacity-[0.04] select-none">
                          <span className="text-4xl font-black font-sans uppercase -rotate-45 tracking-widest whitespace-nowrap text-slate-900">
                            Bản quyền ViTudy • {item.author || 'ViTudy Education'}
                          </span>
                        </div>
                      )}

                      {/* Left Page */}
                      <div className="flex-1 p-10 flex flex-col justify-between border-r border-slate-200 relative bg-[#fdfbf7]">
                        {leftLeafItem ? (
                          <div className="flex-1 flex flex-col justify-between overflow-hidden">
                            <div className="flex-1 flex flex-col overflow-hidden">
                              <div className="pb-2 mb-4 border-b border-slate-200 flex items-center justify-between flex-shrink-0">
                                <span className="text-xs font-bold text-slate-700 text-left truncate flex-1">
                                  {leftLeafItem.chapterTitle}
                                </span>
                              </div>
                              {leftLeafItem.image ? (
                                <div className="relative flex-1 w-full min-h-0 flex items-center justify-center overflow-hidden bg-white/70 rounded">
                                  <img
                                    src={leftLeafItem.image}
                                    alt={`Trang ${leftLeafItem.pageNumber}`}
                                    className="max-w-full max-h-full object-contain pointer-events-none select-none rounded-xs"
                                  />
                                </div>
                              ) : (
                                <div className="text-[15.5px] leading-[1.6] text-slate-900 font-sans selection:bg-orange-100 flex-1 overflow-y-auto no-scrollbar text-justify pr-2">
                                  <MathRenderer content={leftLeafItem.text} />
                                </div>
                              )}
                            </div>
                            <div className="text-center text-xs font-mono text-slate-500 pt-3 pb-1 border-t border-slate-200 flex-shrink-0">
                              {leftLeafItem.pageNumber}
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center h-full text-slate-400 italic text-sm">
                            Trang trống
                          </div>
                        )}
                      </div>

                      {/* Central Spine Seam Shadow */}
                      <div className="w-[3px] bg-gradient-to-r from-stone-400/30 via-stone-500/40 to-stone-400/30 shadow-inner flex-shrink-0 no-print" />

                      {/* Right Page */}
                      <div className="flex-1 p-10 flex flex-col justify-between relative bg-[#fdfbf7]">
                        {rightLeafItem ? (
                          <div className="flex-1 flex flex-col justify-between overflow-hidden">
                            <div className="flex-1 flex flex-col overflow-hidden">
                              <div className="pb-2 mb-4 border-b border-slate-200 flex items-center justify-between flex-shrink-0">
                                <span className="text-xs font-bold text-slate-700 text-left truncate flex-1">
                                  {rightLeafItem.chapterTitle}
                                </span>
                              </div>
                              {rightLeafItem.image ? (
                                <div className="relative flex-1 w-full min-h-0 flex items-center justify-center overflow-hidden bg-white/70 rounded">
                                  <img
                                    src={rightLeafItem.image}
                                    alt={`Trang ${rightLeafItem.pageNumber}`}
                                    className="max-w-full max-h-full object-contain pointer-events-none select-none rounded-xs"
                                  />
                                </div>
                              ) : (
                                <div className="text-[15.5px] leading-[1.6] text-slate-900 font-sans selection:bg-orange-100 flex-1 overflow-y-auto no-scrollbar text-justify pr-2">
                                  <MathRenderer content={rightLeafItem.text} />
                                </div>
                              )}
                            </div>
                            <div className="text-center text-xs font-mono text-slate-500 pt-3 pb-1 border-t border-slate-200 flex-shrink-0">
                              {rightLeafItem.pageNumber}
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center h-full text-slate-400 italic text-sm">
                            (Hết tài liệu)
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* ================= FULL SCREEN SINGLE PAGES (CONTINUOUS STREAM) ================= */
              <div className="flex flex-col items-center gap-8 pb-16">
                {leaves.map((leafItem, lIdx) => {
                  const isCurrentLeaf = lIdx === currentPage;
                  const printHideClass = printScope === 'current' && !isCurrentLeaf ? 'print-hide' : '';

                  return (
                    <div 
                      key={lIdx}
                      id={`fullscreen-page-${lIdx}`}
                      style={{ width: 640, minHeight: 840 }}
                      className={`fullscreen-page-item rounded-sm shadow-2xl p-10 border border-slate-300 bg-white text-slate-900 flex flex-col justify-between flex-shrink-0 mx-auto relative ${printHideClass}`}
                    >
                      {item.purchased && (
                        <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden z-10 opacity-[0.04] select-none">
                          <span className="text-4xl font-black font-sans uppercase -rotate-45 tracking-widest whitespace-nowrap text-slate-900">
                            Bản quyền ViTudy • {item.author || 'ViTudy Education'}
                          </span>
                        </div>
                      )}

                      <div className="flex-1 flex flex-col justify-between overflow-hidden">
                        <div className="flex-1 flex flex-col overflow-hidden">
                          <div className="pb-2 mb-4 border-b border-slate-200 flex items-center justify-between flex-shrink-0">
                            <span className="text-xs font-bold text-slate-700 text-left truncate flex-1">
                              {leafItem.chapterTitle}
                            </span>
                          </div>
                          {leafItem.image ? (
                            <div className="relative flex-1 w-full min-h-0 flex items-center justify-center overflow-hidden bg-white/70 rounded">
                              <img
                                src={leafItem.image}
                                alt={`Trang ${leafItem.pageNumber}`}
                                className="max-w-full max-h-full object-contain pointer-events-none select-none rounded-xs"
                              />
                            </div>
                          ) : (
                            <div className="text-[16px] leading-[1.6] text-slate-900 font-sans selection:bg-orange-100 flex-1 overflow-y-auto no-scrollbar text-justify pr-2">
                              <MathRenderer content={leafItem.text} />
                            </div>
                          )}
                        </div>
                        <div className="text-center text-xs font-mono text-slate-500 pt-3 pb-1 border-t border-slate-200 flex-shrink-0">
                          {leafItem.pageNumber}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
