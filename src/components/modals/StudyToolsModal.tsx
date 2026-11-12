'use client';

import React, { useState, useEffect } from 'react';
import clsx from 'clsx';
import { DeskItem } from '@/types/studyspace';
import { useViToken } from '@/context/ViTokenContext';
import { 
  Sparkles, 
  FileText, 
  HelpCircle, 
  Layers, 
  ListOrdered, 
  X
} from 'lucide-react';
import { SummaryTab } from './study-tools/SummaryTab';
import { QuizTab } from './study-tools/QuizTab';
import { FlashcardTab } from './study-tools/FlashcardTab';
import { RoadmapTab } from './study-tools/RoadmapTab';

interface StudyToolsModalProps {
  item: DeskItem;
  isOpen: boolean;
  onClose: () => void;
  isPaper?: boolean;
  targetPos?: { x: number; y: number };
  totalPages?: number;
  activePageText?: string;
}

export function StudyToolsModal({ 
  item, 
  isOpen, 
  onClose, 
  isPaper = false, 
  targetPos: explicitTargetPos,
  totalPages,
  activePageText 
}: StudyToolsModalProps) {
  const { aiConfig } = useViToken();
  const isOauth = aiConfig.provider === 'oauth_chatgpt' || Boolean(aiConfig.isOauthConnected);
  const targetPos = explicitTargetPos || { x: item.x + (isPaper ? 390 : 1010), y: item.y };
  const [activeTab, setActiveTab] = useState<'summary' | 'quiz' | 'flashcards' | 'roadmap'>('summary');

  // Handle ESC key to dismiss in-situ STudy overlay
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Extract full document text
  const fullText = item.pages.map(p => `${p.title ? p.title + '\n' : ''}${p.text}`).join('\n\n');
  const pageCountDisplay = totalPages || item.pages.length;

  return (
    <div 
      role="dialog"
      data-modal="true"
      data-study-tools="true"
      data-overlay="true"
      data-scrollable="true"
      onWheel={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
      className={clsx(
        "z-30 bg-white rounded-xl border border-slate-300 flex flex-col overflow-hidden shadow-2xl font-sans text-slate-900 animate-fade-in select-none",
        isPaper ? "absolute inset-0 z-40" : "absolute top-2.5 bottom-2.5 left-[34px] right-[34px]"
      )}
    >
      {/* Header Bar: In-situ cockpit header gọn gàng, tinh tế */}
      <div className="px-3.5 py-2 border-b border-slate-200 flex items-center justify-between bg-white text-slate-900 select-none flex-shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-6 h-6 rounded-lg bg-orange-50 flex items-center justify-center text-[#E0562D] border border-orange-200 flex-shrink-0">
            <Sparkles className="w-3.5 h-3.5 text-[#E0562D] stroke-[2.4]" />
          </div>
          <div className="min-w-0 flex items-center gap-2">
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 truncate max-w-[260px] sm:max-w-md">
              {item.title}
            </h3>
            <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200 flex-shrink-0">
              {pageCountDisplay} trang
            </span>
            <span className={clsx(
              "text-[10px] font-bold px-1.5 py-0.5 rounded border flex-shrink-0",
              isOauth 
                ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                : "bg-orange-50 text-[#B8431A] border-orange-200"
            )}>
              {isOauth ? "ChatGPT miễn phí" : "AI ViTudy · 2V"}
            </span>
          </div>
        </div>

        <button
          id="close-study-tools-modal"
          aria-label="Đóng công cụ học"
          onClick={onClose}
          className="w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer flex-shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Tab Navigation: Sentence case & Cam ViT active accent */}
      <div className="flex items-center gap-1 px-3 pt-1 border-b border-slate-200 bg-slate-50 overflow-x-auto no-scrollbar select-none flex-shrink-0">
        <button
          type="button"
          onClick={() => setActiveTab('summary')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'summary'
              ? 'border-[#E0562D] text-[#E0562D] bg-white rounded-t-lg shadow-2xs'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className="w-3.5 h-3.5 stroke-[2.2]" />
          <span>Tóm tắt</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('quiz')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'quiz'
              ? 'border-[#E0562D] text-[#E0562D] bg-white rounded-t-lg shadow-2xs'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <HelpCircle className="w-3.5 h-3.5 stroke-[2.2]" />
          <span>Trắc nghiệm</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('flashcards')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'flashcards'
              ? 'border-[#E0562D] text-[#E0562D] bg-white rounded-t-lg shadow-2xs'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Layers className="w-3.5 h-3.5 stroke-[2.2]" />
          <span>Thẻ ghi nhớ</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('roadmap')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'roadmap'
              ? 'border-[#E0562D] text-[#E0562D] bg-white rounded-t-lg shadow-2xs'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ListOrdered className="w-3.5 h-3.5 stroke-[2.2]" />
          <span>Lộ trình học</span>
        </button>
      </div>

      {/* Tab Body: Giữ các tab luôn mounted với CSS hidden để không bị mất dữ liệu khi chuyển qua lại */}
      <div 
        className="flex-1 min-h-0 flex flex-col overflow-hidden bg-white" 
        data-scrollable="true"
        onWheel={(e) => e.stopPropagation()}
      >
        <div className={clsx("flex-1 min-h-0 flex flex-col overflow-hidden", activeTab !== 'summary' && "hidden")}>
          <SummaryTab fullText={fullText} documentTitle={item.title} targetPos={targetPos} />
        </div>
        <div className={clsx("flex-1 min-h-0 flex flex-col overflow-hidden", activeTab !== 'quiz' && "hidden")}>
          <QuizTab 
            fullText={fullText} 
            documentTitle={item.title} 
            onCloseModal={onClose} 
            targetPos={targetPos}
            activePageText={activePageText}
          />
        </div>
        <div className={clsx("flex-1 min-h-0 flex flex-col overflow-hidden", activeTab !== 'flashcards' && "hidden")}>
          <FlashcardTab fullText={fullText} documentTitle={item.title} />
        </div>
        <div className={clsx("flex-1 min-h-0 flex flex-col overflow-hidden", activeTab !== 'roadmap' && "hidden")}>
          <RoadmapTab pages={item.pages} itemType={item.type} itemId={item.id} />
        </div>
      </div>
    </div>
  );
}
