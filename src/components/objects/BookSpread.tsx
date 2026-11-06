'use client';

import React, { useState, useRef } from 'react';
import { DeskItem } from '@/types/studyspace';
import { useStudySpace } from '@/context/StudySpaceContext';
import { 
  RotateCw, 
  RotateCcw, 
  Trash2, 
  ChevronLeft, 
  ChevronRight, 
  BookOpen, 
  Layers, 
  ExternalLink,
  Bookmark,
  Sparkles
} from 'lucide-react';
import { StudyToolsModal } from '../modals/StudyToolsModal';
import { IntelineModal } from '../modals/IntelineModal';

interface BookSpreadProps {
  item: DeskItem;
  isSelected: boolean;
}

export function BookSpread({ item, isSelected }: BookSpreadProps) {
  const { 
    updateItemPosition, 
    updateItemRotation, 
    selectItem, 
    bringToFront, 
    removeDeskItem,
    turnBookPage,
    setBookPage,
    detachPageFromBinder
  } = useStudySpace();

  const [isDragging, setIsDragging] = useState(false);
  const [isStudyOpen, setIsStudyOpen] = useState(false);
  const [intelineState, setIntelineState] = useState<{
    isOpen: boolean;
    pageNumber: number;
    selectedText: string;
  } | null>(null);
  const dragStartRef = useRef<{ mouseX: number; mouseY: number; itemX: number; itemY: number } | null>(null);

  const handleTextSelect = (pageNumber: number, fallbackText: string) => {
    const selection = window.getSelection();
    const str = selection ? selection.toString().trim() : '';
    const text = str.length > 3 ? str : fallbackText.slice(0, 200);

    setIntelineState({
      isOpen: true,
      pageNumber,
      selectedText: text
    });
  };

  // Even index on left page, odd index on right page
  const leftPageIndex = item.currentPageIndex % 2 === 0 ? item.currentPageIndex : item.currentPageIndex - 1;
  const rightPageIndex = leftPageIndex + 1;

  const leftPage = item.pages[leftPageIndex];
  const rightPage = item.pages[rightPageIndex];

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    // Don't drag if clicking buttons, inputs or scrollable content
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('input')) return;

    e.stopPropagation();
    bringToFront(item.id);
    selectItem(item.id);

    setIsDragging(true);
    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      itemX: item.x,
      itemY: item.y
    };

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!dragStartRef.current) return;
      const dx = moveEvent.clientX - dragStartRef.current.mouseX;
      const dy = moveEvent.clientY - dragStartRef.current.mouseY;
      updateItemPosition(item.id, dragStartRef.current.itemX + dx, dragStartRef.current.itemY + dy);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <div
      style={{
        transform: `translate(${item.x}px, ${item.y}px) rotate(${item.rotation}deg) scale(${item.scale})`,
        zIndex: item.zIndex,
        width: 720,
        height: 520,
        transition: isDragging ? 'none' : 'box-shadow 0.2s, transform 0.1s'
      }}
      className={`absolute select-none group cursor-grab active:cursor-grabbing ${
        isSelected ? 'ring-2 ring-hud-cyan shadow-hud-glow' : ''
      }`}
      onClick={(e) => {
        e.stopPropagation();
        selectItem(item.id);
      }}
    >
      {/* 3D Book Cover Base (Hardcover Backing) */}
      <div 
        onMouseDown={handleMouseDown}
        className="w-full h-full rounded-md shadow-book p-3 flex flex-col justify-between relative border border-slate-700/80"
        style={{
          background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)'
        }}
      >
        {/* Binder / Multi-Document Indicator Ribbon */}
        {item.isBinder && (
          <div className="absolute -top-3 left-6 bg-amber-500 text-stone-950 text-[10px] font-bold px-2 py-0.5 rounded shadow-md flex items-center gap-1 z-30">
            <Layers className="w-3 h-3" />
            <span>SỔ TỔNG HỢP (BINDER)</span>
          </div>
        )}

        {/* Top Header / Book Title Bar */}
        <div className="flex items-center justify-between px-2 pt-1 pb-2 border-b border-slate-700/60 z-10">
          <div className="flex items-center gap-2 overflow-hidden">
            <BookOpen className="w-4 h-4 text-sky-400 flex-shrink-0" />
            <h3 className="text-xs font-semibold text-slate-200 truncate">
              {item.title}
            </h3>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
            <span>Trang {leftPageIndex + 1}-{Math.min(rightPageIndex + 1, item.pageCount)}</span>
            <span className="text-slate-600">/</span>
            <span>{item.pageCount} trang</span>
          </div>
        </div>

        {/* The Two Pages Spread (Left & Right) */}
        <div className="flex-1 flex gap-2 pt-2 relative overflow-hidden">
          {/* Central Book Spine Shadow Effect */}
          <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-8 pointer-events-none z-20 bg-gradient-to-r from-black/25 via-black/40 to-black/25" />
          <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-[1px] bg-stone-300 z-20 opacity-40" />

          {/* LEFT PAGE */}
          <div className="flex-1 bg-[#fcfaf4] rounded-l-sm p-5 flex flex-col justify-between shadow-inner relative border-r border-stone-300/80 overflow-hidden">
            {leftPage ? (
              <>
                <div className="overflow-y-auto max-h-[380px] pr-1">
                  <div className="flex items-center justify-between pb-1 mb-2 border-b border-stone-200">
                    <span className="text-[10px] font-semibold tracking-wider text-stone-400 uppercase">
                      {leftPage.title || `Trang ${leftPage.pageNumber}`}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        title="Bôi đen hoặc bấm để hỏi AI Inteline"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTextSelect(leftPage.pageNumber, leftPage.text);
                        }}
                        className="text-[10px] text-cyan-600 hover:text-cyan-800 flex items-center gap-0.5 font-semibold hover:underline"
                      >
                        <Sparkles className="w-2.5 h-2.5 text-cyan-500" />
                        <span>Inteline</span>
                      </button>
                      <button
                        title="Rút trang này ra mặt bàn"
                        onClick={(e) => {
                          e.stopPropagation();
                          detachPageFromBinder(item.id, leftPageIndex);
                        }}
                        className="text-[10px] text-stone-400 hover:text-emerald-700 flex items-center gap-0.5 hover:underline"
                      >
                        <ExternalLink className="w-2.5 h-2.5" />
                        <span>Rút ra bàn</span>
                      </button>
                    </div>
                  </div>
                  <h4 className="text-sm font-bold text-stone-900 mb-2 leading-tight">
                    {leftPage.title}
                  </h4>
                  <p className="text-xs leading-relaxed text-stone-800 whitespace-pre-line font-serif">
                    {leftPage.text}
                  </p>
                </div>
                <div className="text-center text-[10px] font-mono text-stone-400 pt-2 border-t border-stone-200">
                  - {leftPage.pageNumber} -
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-stone-400 text-xs italic font-serif">
                Trang trống
              </div>
            )}
          </div>

          {/* RIGHT PAGE */}
          <div className="flex-1 bg-[#fcfaf4] rounded-r-sm p-5 flex flex-col justify-between shadow-inner relative border-l border-stone-300/80 overflow-hidden">
            {rightPage ? (
              <>
                <div className="overflow-y-auto max-h-[380px] pr-1">
                  <div className="flex items-center justify-between pb-1 mb-2 border-b border-stone-200">
                    <span className="text-[10px] font-semibold tracking-wider text-stone-400 uppercase">
                      {rightPage.title || `Trang ${rightPage.pageNumber}`}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        title="Bôi đen hoặc bấm để hỏi AI Inteline"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTextSelect(rightPage.pageNumber, rightPage.text);
                        }}
                        className="text-[10px] text-cyan-600 hover:text-cyan-800 flex items-center gap-0.5 font-semibold hover:underline"
                      >
                        <Sparkles className="w-2.5 h-2.5 text-cyan-500" />
                        <span>Inteline</span>
                      </button>
                      <button
                        title="Rút trang này ra mặt bàn"
                        onClick={(e) => {
                          e.stopPropagation();
                          detachPageFromBinder(item.id, rightPageIndex);
                        }}
                        className="text-[10px] text-stone-400 hover:text-emerald-700 flex items-center gap-0.5 hover:underline"
                      >
                        <ExternalLink className="w-2.5 h-2.5" />
                        <span>Rút ra bàn</span>
                      </button>
                    </div>
                  </div>
                  <h4 className="text-sm font-bold text-stone-900 mb-2 leading-tight">
                    {rightPage.title}
                  </h4>
                  <p className="text-xs leading-relaxed text-stone-800 whitespace-pre-line font-serif">
                    {rightPage.text}
                  </p>
                </div>
                <div className="text-center text-[10px] font-mono text-stone-400 pt-2 border-t border-stone-200">
                  - {rightPage.pageNumber} -
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-stone-400 text-xs italic font-serif">
                (Hết cuốn sách)
              </div>
            )}
          </div>
        </div>

        {/* Bottom Page Navigation Controls & Scrubber */}
        <div className="flex items-center justify-between px-3 pt-2 border-t border-slate-700/60 z-10">
          <button
            onClick={(e) => {
              e.stopPropagation();
              turnBookPage(item.id, 'prev');
            }}
            disabled={leftPageIndex <= 0}
            className="flex items-center gap-1 text-xs text-slate-300 hover:text-white px-2 py-1 rounded bg-slate-800/80 hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-slate-800/80"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Trang trước</span>
          </button>

          {/* Quick Page Slider */}
          <div className="flex-1 mx-4 flex items-center gap-2">
            <input
              type="range"
              min={0}
              max={Math.max(0, item.pageCount - 1)}
              step={2}
              value={leftPageIndex}
              onChange={(e) => {
                e.stopPropagation();
                setBookPage(item.id, parseInt(e.target.value));
              }}
              className="w-full accent-sky-400 cursor-pointer h-1.5 bg-slate-700 rounded-lg"
            />
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              turnBookPage(item.id, 'next');
            }}
            disabled={rightPageIndex >= item.pageCount - 1}
            className="flex items-center gap-1 text-xs text-slate-300 hover:text-white px-2 py-1 rounded bg-slate-800/80 hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-slate-800/80"
          >
            <span>Trang sau</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Floating Control Toolbar */}
      <div 
        className={`absolute -top-11 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-slate-900/90 text-white px-2.5 py-1 rounded-full shadow-xl border border-slate-700 backdrop-blur-sm transition-opacity duration-150 z-40 ${
          isSelected ? 'opacity-100 pointer-events-auto' : 'opacity-0 group-hover:opacity-100 pointer-events-auto'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          title="STudy: Tóm tắt, Trắc nghiệm, Flashcard & Lộ trình học"
          onClick={() => setIsStudyOpen(true)}
          className="flex items-center gap-1 px-2.5 py-0.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-full text-xs shadow-md transition-all mr-1"
        >
          <Sparkles className="w-3 h-3" />
          <span>STudy</span>
        </button>
        <button
          title="Xoay trái 15°"
          onClick={() => updateItemRotation(item.id, -15)}
          className="p-1 hover:bg-slate-800 rounded-full text-slate-300 hover:text-white"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
        <button
          title="Xoay phải 15°"
          onClick={() => updateItemRotation(item.id, 15)}
          className="p-1 hover:bg-slate-800 rounded-full text-slate-300 hover:text-white"
        >
          <RotateCw className="w-3.5 h-3.5" />
        </button>
        <div className="w-[1px] h-3 bg-slate-700 mx-0.5" />
        <button
          title="Đóng & Xoá cuốn sách này"
          onClick={() => removeDeskItem(item.id)}
          className="p-1 hover:bg-red-900/60 rounded-full text-red-400 hover:text-red-300"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* STudy Tools Modal */}
      <StudyToolsModal
        item={item}
        isOpen={isStudyOpen}
        onClose={() => setIsStudyOpen(false)}
      />

      {/* Inteline Modal */}
      {intelineState && (
        <IntelineModal
          sourceItem={item}
          pageNumber={intelineState.pageNumber}
          selectedText={intelineState.selectedText}
          isOpen={intelineState.isOpen}
          onClose={() => setIntelineState(null)}
        />
      )}
    </div>
  );
}
