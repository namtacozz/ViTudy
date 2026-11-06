'use client';

import React, { useState } from 'react';
import { useStudySpace } from '@/context/StudySpaceContext';
import { useViToken } from '@/context/ViTokenContext';
import { 
  BookOpen, 
  FileText, 
  StickyNote, 
  Store, 
  Coins, 
  ChevronRight, 
  Sparkles,
  Layers,
  ArrowLeft
} from 'lucide-react';

export function MobileCompanionView() {
  const { activeSpace } = useStudySpace();
  const { wallet } = useViToken();

  const [activeTab, setActiveTab] = useState<'docs' | 'market'>('docs');
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);

  const selectedDoc = activeSpace.items.find(i => i.id === selectedDocId);

  return (
    <div className="w-full min-h-screen bg-slate-950 text-white flex flex-col md:hidden pb-16">
      {/* Top Mobile Bar */}
      <header className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-cyan-600 flex items-center justify-center font-black text-xs">
            V
          </div>
          <div>
            <h1 className="text-sm font-bold leading-tight">ViTudy Mobile</h1>
            <p className="text-[10px] text-cyan-400 font-medium">{activeSpace.name}</p>
          </div>
        </div>

        {/* ViToken Badge */}
        <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 rounded-full text-amber-400 text-xs font-mono font-bold">
          <Coins className="w-3.5 h-3.5" />
          <span>{wallet.balance} V</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4">
        {selectedDoc ? (
          /* Document Reader View on Mobile */
          <div className="space-y-4">
            <button
              onClick={() => setSelectedDocId(null)}
              className="flex items-center gap-1.5 text-xs text-cyan-400 hover:underline mb-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Quay lại danh sách tài liệu</span>
            </button>

            <div className="bg-slate-900 rounded-xl p-4 border border-slate-800">
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                  selectedDoc.type === 'book' ? 'bg-sky-500/20 text-sky-400' : 'bg-emerald-500/20 text-emerald-400'
                }`}>
                  {selectedDoc.type === 'book' ? 'SÁCH' : 'TỜ GIẤY'}
                </span>
                <span className="text-xs text-slate-400">{selectedDoc.pageCount} trang</span>
              </div>
              <h2 className="text-base font-bold text-white mb-4">
                {selectedDoc.title}
              </h2>

              {/* Pages List */}
              <div className="space-y-4">
                {selectedDoc.pages.map((p, idx) => (
                  <div key={p.id || idx} className="bg-stone-900/60 rounded-lg p-4 border border-stone-800 font-serif">
                    <div className="text-[10px] font-mono text-cyan-400 mb-1">
                      Trang {p.pageNumber} - {p.title}
                    </div>
                    <p className="text-xs text-stone-200 leading-relaxed whitespace-pre-line">
                      {p.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Documents List on Mobile */
          <div>
            <div className="mb-4">
              <h2 className="text-base font-bold text-white">Tài Liệu Đang Mở</h2>
              <p className="text-xs text-slate-400">
                Chế độ đọc tập trung & ôn luyện đồng bộ từ StudySpace trên máy tính.
              </p>
            </div>

            <div className="space-y-3">
              {activeSpace.items.map(item => (
                <div
                  key={item.id}
                  onClick={() => setSelectedDocId(item.id)}
                  className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between active:bg-slate-850 cursor-pointer"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      item.type === 'book' ? 'bg-sky-500/10 text-sky-400' : 'bg-emerald-500/10 text-emerald-400'
                    }`}>
                      {item.type === 'book' ? <BookOpen className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                    </div>
                    <div className="truncate">
                      <h3 className="text-xs font-bold text-white truncate">{item.title}</h3>
                      <p className="text-[11px] text-slate-400">
                        {item.type === 'book' ? `${item.pageCount} trang (Sách)` : `${item.pageCount} trang (Giấy)`}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
