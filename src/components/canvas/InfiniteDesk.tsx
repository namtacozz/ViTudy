'use client';

import React, { useRef, useState, useEffect } from 'react';
import { useStudySpace } from '@/context/StudySpaceContext';
import { DeskGrid } from './DeskGrid';
import { PaperSheet } from '../objects/PaperSheet';
import { BookSpread } from '../objects/BookSpread';
import { StickyNoteItem } from '../objects/StickyNoteItem';
import { VisualLinkThreads } from './VisualLinkThreads';

export function InfiniteDesk() {
  const { 
    activeSpace, 
    transform, 
    panBy, 
    zoomBy, 
    selectItem, 
    selectedItemId,
    addUploadedDocument 
  } = useStudySpace();

  const containerRef = useRef<HTMLDivElement>(null);
  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef<{ x: number; y: number } | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  // Wheel zoom handler
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.08 : 0.92;
    zoomBy(factor, e.clientX, e.clientY);
  };

  // Background pointer down (Canvas Pan)
  const handleMouseDown = (e: React.MouseEvent) => {
    // Only pan if clicking on empty desk background (not on an item)
    if (e.target !== containerRef.current && !(e.target as HTMLElement).classList.contains('desk-bg-target')) {
      return;
    }
    // Deselect active item when clicking empty space
    selectItem(null);

    setIsPanning(true);
    panStartRef.current = { x: e.clientX, y: e.clientY };

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!panStartRef.current) return;
      const dx = moveEvent.clientX - panStartRef.current.x;
      const dy = moveEvent.clientY - panStartRef.current.y;
      panStartRef.current = { x: moveEvent.clientX, y: moveEvent.clientY };
      panBy(dx, dy);
    };

    const handleMouseUp = () => {
      setIsPanning(false);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  // Drag and drop external file directly onto desk
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;

    for (const file of files) {
      const fileName = file.name;
      const isText = file.type.includes('text') || fileName.endsWith('.md') || fileName.endsWith('.txt');

      if (isText) {
        const text = await file.text();
        // Break text by paragraph or arbitrary page count
        const paragraphs = text.split('\n\n').filter(p => p.trim().length > 0);
        const pages = paragraphs.length > 0 
          ? paragraphs.map((para, i) => ({ title: `Trang ${i + 1}`, text: para }))
          : [{ title: fileName, text }];
        addUploadedDocument(fileName, pages);
      } else {
        // Fallback demo for PDF / DOCX / Image
        // If file size > 300KB simulate a multi-page book, otherwise paper
        const simulatedPageCount = file.size > 300000 ? 6 : 2;
        const simulatedPages = Array.from({ length: simulatedPageCount }, (_, i) => ({
          title: `Chương ${i + 1}: ${fileName.replace(/\.[^/.]+$/, '')}`,
          text: `Nội dung trích xuất từ file "${fileName}".\n\nĐây là trang số ${i + 1} của tài liệu vừa được ném vào bàn học.\n\nSử dụng công cụ Inteline để bôi đen dòng chữ hoặc dùng STudy để tạo bộ flashcard và đề thi trắc nghiệm ôn tập.`
        }));
        addUploadedDocument(fileName, simulatedPages);
      }
    }
  };

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onWheel={handleWheel}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`relative w-screen h-screen overflow-hidden select-none cursor-default ${
        isPanning ? 'cursor-grabbing' : ''
      }`}
    >
      {/* Visual Desk Grid Background */}
      <DeskGrid />

      {/* Drop Target Overlay Highlight */}
      {isDragOver && (
        <div className="absolute inset-0 z-50 bg-sky-500/10 border-4 border-dashed border-sky-400 pointer-events-none flex items-center justify-center backdrop-blur-[2px]">
          <div className="bg-slate-900/90 text-sky-300 font-bold px-6 py-3 rounded-xl border border-sky-500/50 shadow-2xl flex items-center gap-3">
            <span className="text-xl">📥</span>
            <span>Thả tài liệu vào bàn học (Tự động nhận diện Giấy hoặc Sách)</span>
          </div>
        </div>
      )}

      {/* 2.5D World Transform Container */}
      <div
        className="absolute top-0 left-0 w-full h-full transform-gpu"
        style={{
          transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
          transformOrigin: '0 0'
        }}
      >
        {/* Animated Visual Link Threads connecting Inteline Q&A to Source Text */}
        <VisualLinkThreads />

        {/* Render all Desk Items */}
        {activeSpace.items.map((item) => {
          const isSelected = selectedItemId === item.id;
          if (item.type === 'book') {
            return <BookSpread key={item.id} item={item} isSelected={isSelected} />;
          }
          if (item.type === 'paper') {
            return <PaperSheet key={item.id} item={item} isSelected={isSelected} />;
          }
          if (item.type === 'sticky_note') {
            return <StickyNoteItem key={item.id} item={item} isSelected={isSelected} />;
          }
          return null;
        })}
      </div>
    </div>
  );
}
