'use client';

import React, { useState, useRef } from 'react';
import { DeskItem } from '@/types/studyspace';
import { useStudySpace } from '@/context/StudySpaceContext';
import { RotateCw, RotateCcw, Trash2, ChevronLeft, ChevronRight, Copy, Layers, Sparkles } from 'lucide-react';
import { StudyToolsModal } from '../modals/StudyToolsModal';
import { IntelineModal } from '../modals/IntelineModal';

interface PaperSheetProps {
  item: DeskItem;
  isSelected: boolean;
}

export function PaperSheet({ item, isSelected }: PaperSheetProps) {
  const { 
    updateItemPosition, 
    updateItemRotation, 
    selectItem, 
    bringToFront, 
    removeDeskItem,
    combineIntoBinder,
    activeSpace
  } = useStudySpace();

  const [isDragging, setIsDragging] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [isStudyOpen, setIsStudyOpen] = useState(false);
  const [intelineState, setIntelineState] = useState<{
    isOpen: boolean;
    pageNumber: number;
    selectedText: string;
  } | null>(null);
  const dragStartRef = useRef<{ mouseX: number; mouseY: number; itemX: number; itemY: number } | null>(null);

  const handleTextSelect = () => {
    const selection = window.getSelection();
    const str = selection ? selection.toString().trim() : '';
    const text = str.length > 3 ? str : activePage.text.slice(0, 200);

    setIntelineState({
      isOpen: true,
      pageNumber: currentPage + 1,
      selectedText: text
    });
  };

  const activePage = item.pages[currentPage] || {
    id: 'empty',
    pageNumber: 1,
    title: item.title,
    text: 'Tài liệu chưa có nội dung...'
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    // Only drag with left mouse button and not on interactive buttons
    if (e.button !== 0) return;
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

    let rafId: number | null = null;
    let latestX = item.x;
    let latestY = item.y;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!dragStartRef.current) return;
      latestX = dragStartRef.current.itemX + (moveEvent.clientX - dragStartRef.current.mouseX);
      latestY = dragStartRef.current.itemY + (moveEvent.clientY - dragStartRef.current.mouseY);

      if (!rafId) {
        rafId = requestAnimationFrame(() => {
          updateItemPosition(item.id, latestX, latestY);
          rafId = null;
        });
      }
    };

    const handleMouseUp = (upEvent: MouseEvent) => {
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
      updateItemPosition(item.id, latestX, latestY);
      setIsDragging(false);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);

      // Check if dropped onto another item (e.g. book or another paper sheet) for binder combine
      const currentTarget = activeSpace.items.find(other => {
        if (other.id === item.id) return false;
        const targetWidth = other.type === 'book' ? 700 : 360;
        const targetHeight = other.type === 'book' ? 520 : 480;
        return (
          latestX >= other.x - 50 &&
          latestX <= other.x + targetWidth &&
          latestY >= other.y - 50 &&
          latestY <= other.y + targetHeight
        );
      });

      if (currentTarget) {
        combineIntoBinder(currentTarget.id, item.id);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <div
      style={{
        transform: `translate3d(${item.x}px, ${item.y}px, 0) rotate(${item.rotation}deg) scale(${item.scale})`,
        zIndex: item.zIndex,
        width: 360,
        height: 500,
        transition: isDragging ? 'none' : 'box-shadow 0.2s',
        willChange: isDragging ? 'transform' : 'auto'
      }}
      className={`absolute select-none group cursor-grab active:cursor-grabbing rounded-sm ${
        isSelected ? 'ring-2 ring-hud-cyan shadow-hud-glow' : ''
      }`}
      onClick={(e) => {
        e.stopPropagation();
        selectItem(item.id);
      }}
    >
      {/* Physical Paper Stack Effect if > 1 page */}
      {item.pageCount > 1 && (
        <>
          <div 
            className="absolute inset-0 bg-stone-200 rounded-sm shadow-md"
            style={{ transform: 'rotate(1.5deg) translate(3px, 3px)', zIndex: -2 }}
          />
          <div 
            className="absolute inset-0 bg-stone-100 rounded-sm shadow-sm"
            style={{ transform: 'rotate(-1deg) translate(-2px, 2px)', zIndex: -1 }}
          />
        </>
      )}

      {/* Main Paper Sheet */}
      <div 
        onMouseDown={handleMouseDown}
        className="w-full h-full bg-[#fdfbf7] text-stone-900 rounded-sm p-6 shadow-paper flex flex-col justify-between border border-stone-300 relative overflow-hidden"
      >
        {/* Subtle Paper Texture Lines */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-5 bg-[radial-gradient(#000_1px,transparent_1px)]"
          style={{ backgroundSize: '16px 16px' }}
        />

        {/* Top Header / Drag Bar */}
        <div>
          <div className="flex items-center justify-between border-b border-stone-200 pb-2 mb-3">
            <div className="flex items-center gap-1.5 overflow-hidden">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 flex-shrink-0" />
              <span className="text-xs font-semibold text-stone-700 uppercase tracking-wider truncate">
                {item.title}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                title="Bôi đen hoặc bấm để hỏi AI Inteline"
                onClick={(e) => {
                  e.stopPropagation();
                  handleTextSelect();
                }}
                className="text-[10px] text-cyan-600 hover:text-cyan-800 flex items-center gap-0.5 font-semibold hover:underline mr-1"
              >
                <Sparkles className="w-2.5 h-2.5 text-cyan-500" />
                <span>Inteline</span>
              </button>
              <div className="flex items-center gap-1 text-[11px] font-mono text-stone-400 bg-stone-100 px-1.5 py-0.5 rounded">
                <span>{currentPage + 1}</span>
                <span>/</span>
                <span>{item.pageCount}</span>
              </div>
            </div>
          </div>

          {activePage.title && (
            <h4 className="text-sm font-bold text-stone-900 mb-2 leading-snug">
              {activePage.title}
            </h4>
          )}

          {/* Reading Text Layer */}
          <div className="text-xs leading-relaxed text-stone-700 whitespace-pre-line font-serif overflow-y-auto max-h-[340px] pr-1">
            {activePage.text}
          </div>
        </div>

        {/* Bottom Pagination for Multi-Page Paper */}
        {item.pageCount > 1 && (
          <div className="flex items-center justify-between pt-2 border-t border-stone-200 mt-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setCurrentPage(prev => Math.max(0, prev - 1));
              }}
              disabled={currentPage === 0}
              className="p-1 rounded hover:bg-stone-200 disabled:opacity-30"
            >
              <ChevronLeft className="w-4 h-4 text-stone-600" />
            </button>
            <span className="text-[11px] text-stone-500 font-medium">
              Trang {currentPage + 1} trên {item.pageCount}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setCurrentPage(prev => Math.min(item.pageCount - 1, prev + 1));
              }}
              disabled={currentPage === item.pageCount - 1}
              className="p-1 rounded hover:bg-stone-200 disabled:opacity-30"
            >
              <ChevronRight className="w-4 h-4 text-stone-600" />
            </button>
          </div>
        )}
      </div>

      {/* Floating Control Toolbar on Hover / Selection */}
      <div 
        className={`absolute -top-10 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-stone-900/90 text-white px-2.5 py-1 rounded-full shadow-lg border border-stone-700 backdrop-blur-sm transition-opacity duration-150 ${
          isSelected ? 'opacity-100 pointer-events-auto' : 'opacity-0 group-hover:opacity-100 pointer-events-auto'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          title="STudy: Tóm tắt, Trắc nghiệm, Flashcard & Lộ trình học"
          onClick={() => setIsStudyOpen(true)}
          className="flex items-center gap-1 px-2 py-0.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-full text-[11px] shadow-md transition-all mr-0.5"
        >
          <Sparkles className="w-3 h-3" />
          <span>STudy</span>
        </button>
        <button
          title="Xoay trái 15°"
          onClick={() => updateItemRotation(item.id, -15)}
          className="p-1 hover:bg-stone-700 rounded-full text-stone-300 hover:text-white"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
        <button
          title="Xoay phải 15°"
          onClick={() => updateItemRotation(item.id, 15)}
          className="p-1 hover:bg-stone-700 rounded-full text-stone-300 hover:text-white"
        >
          <RotateCw className="w-3.5 h-3.5" />
        </button>
        <div className="w-[1px] h-3 bg-stone-700 mx-0.5" />
        <button
          title="Xoá tờ giấy này"
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

      {/* Drag & Merge Hint */}
      <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] text-stone-400 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap bg-black/60 px-2 py-0.5 rounded">
        Kéo thả vào sách để gộp trang
      </div>
    </div>
  );
}
