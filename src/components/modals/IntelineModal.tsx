'use client';

import React, { useState } from 'react';
import { DeskItem } from '@/types/studyspace';
import { useStudySpace } from '@/context/StudySpaceContext';
import { useViToken } from '@/context/ViTokenContext';
import { 
  Sparkles, 
  Send, 
  Paperclip, 
  Check, 
  Pin, 
  X, 
  BookOpen, 
  FileText, 
  HelpCircle,
  Link2,
  Cpu
} from 'lucide-react';

interface IntelineModalProps {
  sourceItem: DeskItem;
  pageNumber: number;
  selectedText: string;
  isOpen: boolean;
  onClose: () => void;
}

export function IntelineModal({
  sourceItem,
  pageNumber,
  selectedText,
  isOpen,
  onClose
}: IntelineModalProps) {
  const { activeSpace, addIntelineThread } = useStudySpace();
  const { wallet, aiConfig, spendTokens } = useViToken();

  const [question, setQuestion] = useState('');
  const [attachedDocIds, setAttachedDocIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState<string | null>(null);
  const [isPinned, setIsPinned] = useState(false);

  if (!isOpen) return null;

  // Other documents on the desk available for cross-attachment
  const otherDocs = activeSpace.items.filter(
    i => i.id !== sourceItem.id && (i.type === 'book' || i.type === 'paper')
  );

  const toggleAttachment = (docId: string) => {
    setAttachedDocIds(prev => 
      prev.includes(docId) ? prev.filter(id => id !== docId) : [...prev, docId]
    );
  };

  const quickPrompts = [
    'Giải thích bản chất khái niệm này một cách dễ hiểu nhất',
    'Cho ví dụ thực tế minh hoạ cụ thể',
    'Công thức/đoạn này thường xuất hiện trong câu hỏi thi như thế nào?'
  ];

  const handleAskInteline = async (customQuestion?: string) => {
    const q = customQuestion || question;
    if (!q.trim()) return;

    setLoading(true);
    setAnswer(null);

    // Calculate ViToken deduction
    const tokenCost = 1 + attachedDocIds.length;
    spendTokens(tokenCost, `Inteline: ${q.slice(0, 30)}...`);

    // Prepare contextual bundle (Hybrid RAG)
    let fullContext = `TÀI LIỆU NGUỒN GỐC: [${sourceItem.title} - Trang ${pageNumber}]\nĐOẠN VĂN BẢN ĐANG HỎI: "${selectedText}"\n`;

    if (attachedDocIds.length > 0) {
      fullContext += `\nTÀI LIỆU ĐÍNH KÈM THÊM ĐỐI CHIẾU TRÊN BÀN HỌC:\n`;
      attachedDocIds.forEach(id => {
        const doc = activeSpace.items.find(i => i.id === id);
        if (doc) {
          const sampleText = doc.pages.slice(0, 2).map(p => p.text).join('\n');
          fullContext += `--- Tài liệu: ${doc.title} ---\n${sampleText.slice(0, 600)}...\n\n`;
        }
      });
    }

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: aiConfig.provider,
          model: aiConfig.model,
          prompt: q,
          context: fullContext
        })
      });

      const data = await res.json();
      setAnswer(data.reply || data.error || 'Không nhận được câu trả lời.');
    } catch (err: any) {
      setAnswer(`Lỗi kết nối Inteline: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handlePinToDesk = () => {
    if (!answer) return;

    addIntelineThread({
      sourceItemId: sourceItem.id,
      sourcePageNumber: pageNumber,
      selectedText,
      question: question || 'Giải thích đoạn văn bản',
      answer
    });

    setIsPinned(true);
    setTimeout(() => {
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-cyan-500/40 rounded-2xl w-full max-w-xl shadow-2xl p-6 relative flex flex-col max-h-[90vh]">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-500 to-sky-400 flex items-center justify-center text-slate-950 font-bold shadow-md">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Inteline: Trí Tuệ Từng Dòng</span>
                <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30">
                  {sourceItem.title} (Trang {pageNumber})
                </span>
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Selected Quote Card */}
        <div className="bg-slate-950/90 border-l-4 border-cyan-400 rounded-r-xl p-3 mb-4 text-xs font-serif leading-relaxed text-slate-200 italic shadow-inner max-h-24 overflow-y-auto">
          "{selectedText}"
        </div>

        {/* Cross-Document Attachment Bar */}
        {otherDocs.length > 0 && (
          <div className="mb-4">
            <div className="text-[11px] font-medium text-slate-400 mb-1.5 flex items-center gap-1">
              <Paperclip className="w-3 h-3 text-cyan-400" />
              <span>Đính kèm thêm sách/giấy khác trên bàn để đối chiếu chéo:</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {otherDocs.map(doc => {
                const isAttached = attachedDocIds.includes(doc.id);
                return (
                  <button
                    key={doc.id}
                    onClick={() => toggleAttachment(doc.id)}
                    className={`text-[11px] px-2.5 py-1 rounded-lg border flex items-center gap-1.5 transition-all ${
                      isAttached
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 font-medium'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    {isAttached ? <Check className="w-3 h-3 text-cyan-400" /> : <Paperclip className="w-3 h-3" />}
                    <span className="truncate max-w-[150px]">{doc.title}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Quick Questions Chips */}
        {!answer && (
          <div className="mb-3 space-y-1">
            <div className="text-[10px] text-slate-500 font-mono">GỢI Ý CÂU HỎI NHANH:</div>
            <div className="flex flex-wrap gap-1.5">
              {quickPrompts.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setQuestion(p);
                    handleAskInteline(p);
                  }}
                  className="text-[11px] bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white px-2.5 py-1 rounded-lg border border-slate-700/60 transition-all text-left"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* AI Answer Display */}
        {answer && (
          <div className="flex-1 bg-slate-950/80 border border-slate-800 rounded-xl p-4 mb-4 overflow-y-auto max-h-60 text-xs leading-relaxed text-slate-100 font-serif whitespace-pre-line relative">
            <div className="text-[10px] font-mono text-cyan-400 font-bold mb-1 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              <span>GIẢI ĐÁP TỪ INTELINE AI:</span>
            </div>
            {answer}
          </div>
        )}

        {/* Input Question Form */}
        <div className="mt-auto">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAskInteline();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Hỏi AI về đoạn văn bản này..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-cyan-400 placeholder-slate-500 font-sans"
            />
            <button
              type="submit"
              disabled={loading || !question.trim()}
              className="p-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl disabled:opacity-50 transition-all flex items-center justify-center flex-shrink-0"
            >
              {loading ? (
                <div className="w-4 h-4 rounded-full border-2 border-slate-950 border-t-transparent animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </form>

          {/* Footer Action: Pin to Desk */}
          {answer && (
            <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-800">
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <Link2 className="w-3.5 h-3.5 text-amber-400" />
                <span>Nối dây chỉ thị giác (Bézier Thread) ra mặt bàn</span>
              </span>
              <button
                onClick={handlePinToDesk}
                disabled={isPinned}
                className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-lg transition-all"
              >
                <Pin className="w-3.5 h-3.5" />
                <span>{isPinned ? '✓ Đã Ghim Lên Bàn' : 'Ghim Thành Note Ra Bàn'}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
