'use client';

import React, { useState, useRef } from 'react';
import { DeskItem } from '@/types/studyspace';
import { useStudySpace } from '@/context/StudySpaceContext';
import { RotateCw, RotateCcw, Trash2 } from 'lucide-react';

interface StickyNoteItemProps {
  item: DeskItem;
  isSelected: boolean;
}

export function StickyNoteItem({ item, isSelected }: StickyNoteItemProps) {
  const { 
    updateItemPosition, 
    updateItemRotation, 
    selectItem, 
    bringToFront, 
    removeDeskItem,
    activeSpace
  } = useStudySpace();

  const [isDragging, setIsDragging] = useState(false);
  const [text, setText] = useState(item.stickyText || 'Ghi chú...');
  const dragStartRef = useRef<{ mouseX: number; mouseY: number; itemX: number; itemY: number } | null>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    const target = e.target as HTMLElement;
    if (target.tagName.toLowerCase() === 'textarea' || target.closest('button')) return;

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
        width: 220,
        height: 200,
        transition: isDragging ? 'none' : 'box-shadow 0.2s, transform 0.1s'
      }}
      className={`absolute select-none group cursor-grab active:cursor-grabbing rounded-sm ${
        isSelected ? 'ring-2 ring-hud-cyan shadow-hud-glow' : ''
      }`}
      onClick={(e) => {
        e.stopPropagation();
        selectItem(item.id);
      }}
    >
      {/* Tape Strip at Top */}
      <div 
        className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-16 h-5 bg-amber-100/70 border border-amber-200/50 shadow-sm backdrop-blur-[1px] rotate-1 z-20"
        style={{ transform: 'translateX(-50%) rotate(-2deg)' }}
      />

      {/* Note Body */}
      <div 
        onMouseDown={handleMouseDown}
        style={{ backgroundColor: item.stickyColor || '#fef08a' }}
        className="w-full h-full p-4 pt-5 rounded-sm shadow-md text-stone-800 flex flex-col justify-between border-b-2 border-r-2 border-black/10"
      >
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Viết ghi chú..."
          className="w-full h-full bg-transparent resize-none border-none outline-none text-xs font-serif leading-relaxed text-stone-800 placeholder-stone-500 cursor-text"
        />
        <div className="text-[10px] text-stone-500 font-mono text-right opacity-70">
          Note
        </div>
      </div>

      {/* Floating Toolbar */}
      <div 
        className={`absolute -top-10 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-stone-900/90 text-white px-2 py-1 rounded-full shadow-lg border border-stone-700 backdrop-blur-sm transition-opacity duration-150 ${
          isSelected ? 'opacity-100 pointer-events-auto' : 'opacity-0 group-hover:opacity-100 pointer-events-auto'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
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
          title="Xoá ghi chú"
          onClick={() => removeDeskItem(item.id)}
          className="p-1 hover:bg-red-900/60 rounded-full text-red-400 hover:text-red-300"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
