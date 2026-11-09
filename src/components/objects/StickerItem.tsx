'use client';

import React from 'react';
import { DeskItem } from '@/types/studyspace';
import { useStudySpace } from '@/context/StudySpaceContext';
import { useDeskItemInteraction } from '@/hooks/useDeskItemInteraction';
import { Trash2 } from 'lucide-react';
import { RotateTwoWay } from '@/components/icons/RotateTwoWay';

interface StickerItemProps {
  item: DeskItem;
  isSelected: boolean;
}

export const StickerItem = React.memo(function StickerItem({ item, isSelected }: StickerItemProps) {
  const { selectItem, removeDeskItem } = useStudySpace();

  const width = item.width || 100;
  const height = item.height || 100;

  const {
    isDragging,
    handleMouseDown,
    handleRotateMouseDown,
    handleRotateDoubleClick
  } = useDeskItemInteraction({
    itemId: item.id,
    itemX: item.x,
    itemY: item.y,
    rotation: item.rotation,
    width,
    height,
  });

  const sticker = item.stickerData;

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    removeDeskItem(item.id);
  };

  return (
    <div
      data-item-id={item.id}
      data-item-type="sticker"
      onPointerDown={(e) => {
        handleMouseDown(e);
        selectItem(item.id);
      }}
      style={{
        position: 'absolute',
        left: item.x,
        top: item.y,
        transform: `rotate(${item.rotation}deg)`,
        transformOrigin: 'center center',
        zIndex: isSelected ? 50 : item.zIndex || 20,
        width,
        height
      }}
      className={`group select-none flex items-center justify-center ${
        isDragging ? 'cursor-grabbing' : 'cursor-grab'
      }`}
    >
      {/* Action controls appear when hovered or selected */}
      {(isSelected || isDragging) && (
        <div className="absolute -top-9 left-1/2 -translate-x-1/2 flex items-center gap-1 p-1 bg-white border border-slate-200/90 shadow-md rounded-full text-slate-600 text-xs z-50 animate-fade-in select-none">
          <button
            onPointerDown={handleRotateMouseDown}
            onDoubleClick={handleRotateDoubleClick}
            title="Xoay (Kéo để xoay, nhấp đúp về 0°)"
            className="p-1 rounded-full text-slate-500 hover:text-amber-700 hover:bg-slate-100 transition-colors cursor-grab"
          >
            <RotateTwoWay className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleDelete}
            title="Xoá hình dán"
            className="p-1 rounded-full text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Visual outline on hover/select */}
      <div
        className={`w-full h-full flex items-center justify-center p-1 rounded-2xl transition-all ${
          isSelected
            ? 'border-2 border-dashed border-indigo-400 bg-indigo-50/15'
            : 'group-hover:border group-hover:border-dashed group-hover:border-slate-300'
        }`}
      >
        {/* Render Emoji SVG / Image URL / Text Content */}
        {sticker?.url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={sticker.url}
            alt={sticker.name || 'sticker'}
            className="w-full h-full object-contain pointer-events-none drop-shadow-sm select-none"
            draggable={false}
          />
        ) : sticker?.isSvg ? (
          <div
            className="w-full h-full flex items-center justify-center drop-shadow-sm pointer-events-none select-none"
            dangerouslySetInnerHTML={{ __html: sticker.content }}
          />
        ) : (
          <div className="text-5xl select-none filter drop-shadow-sm">
            {sticker?.content || '⭐'}
          </div>
        )}
      </div>
    </div>
  );
});
