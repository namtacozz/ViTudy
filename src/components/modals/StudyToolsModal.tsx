'use client';

import React, { useState } from 'react';
import { DeskItem } from '@/types/studyspace';
import { useStudySpace } from '@/context/StudySpaceContext';
import { useViToken } from '@/context/ViTokenContext';
import { 
  summarizeWithTextRank, 
  generateClozeQuestions, 
  generateFlashcardsFromRules, 
  extractOutlineAndRoadmap,
  QuizQuestion,
  Flashcard,
  RoadmapStep 
} from '@/lib/nonAiEngine';
import { 
  Sparkles, 
  BrainCircuit, 
  FileText, 
  HelpCircle, 
  CheckCircle, 
  XCircle, 
  Layers, 
  ListOrdered, 
  Camera, 
  Copy, 
  Check, 
  X,
  ChevronRight,
  ChevronLeft,
  RotateCw,
  ExternalLink,
  BookOpen
} from 'lucide-react';

interface StudyToolsModalProps {
  item: DeskItem;
  isOpen: boolean;
  onClose: () => void;
}

export function StudyToolsModal({ item, isOpen, onClose }: StudyToolsModalProps) {
  const { addStickyNote, addUploadedDocument, setBookPage } = useStudySpace();
  const { aiConfig, spendTokens } = useViToken();

  const [activeTab, setActiveTab] = useState<'summary' | 'quiz' | 'flashcards' | 'roadmap' | 'ocr'>('summary');
  const [useAi, setUseAi] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Full text of the document
  const fullText = item.pages.map(p => `${p.title ? p.title + '\n' : ''}${p.text}`).join('\n\n');

  // State for Summary
  const [summaryResult, setSummaryResult] = useState<string>('');

  // State for Quiz
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({});
  const [showQuizResults, setShowQuizResults] = useState(false);

  // State for Flashcards
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // State for Roadmap
  const [roadmapSteps, setRoadmapSteps] = useState<RoadmapStep[]>(() => 
    extractOutlineAndRoadmap(item.pages)
  );

  // State for OCR
  const [ocrText, setOcrText] = useState('');
  const [ocrFileName, setOcrFileName] = useState('Trang Sách');
  const [ocrProgress, setOcrProgress] = useState<string | null>(null);

  if (!isOpen) return null;

  // 1. Chạy Tóm Tắt (Non-AI vs AI)
  const handleGenerateSummary = async () => {
    setLoading(true);
    if (!useAi) {
      // Non-AI TextRank
      const topSentences = summarizeWithTextRank(fullText, 4);
      setSummaryResult(
        `[TÓM TẮT THỐNG KÊ TEXTRANK (KHÔNG DÙNG AI - MIỄN PHÍ)]\n\n` +
        topSentences.map((s, i) => `${i + 1}. ${s}`).join('\n\n')
      );
      setLoading(false);
    } else {
      // AI Bridge API call
      try {
        spendTokens(2, `Tóm tắt AI tài liệu: ${item.title}`);
        const res = await fetch('/api/ai/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            provider: aiConfig.provider,
            model: aiConfig.model,
            prompt: `Hãy tóm tắt ngắn gọn 4 ý chính quan trọng nhất của tài liệu này dưới dạng bullet point:`,
            context: fullText
          })
        });
        const data = await res.json();
        setSummaryResult(data.reply || data.error || 'Lỗi khi gọi AI');
      } catch (err: any) {
        setSummaryResult(`Lỗi kết nối: ${err.message}`);
      } finally {
        setLoading(false);
      }
    }
  };

  // 2. Chạy Sinh Câu Hỏi Trắc Nghiệm (Non-AI vs AI)
  const handleGenerateQuiz = async () => {
    setLoading(true);
    setUserAnswers({});
    setShowQuizResults(false);

    if (!useAi) {
      // Non-AI Cloze Deletion
      const questions = generateClozeQuestions(fullText, 5);
      setQuizQuestions(questions);
      setLoading(false);
    } else {
      // AI Bridge Call
      try {
        spendTokens(3, `Sinh đề trắc nghiệm AI: ${item.title}`);
        const res = await fetch('/api/ai/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            provider: aiConfig.provider,
            model: aiConfig.model,
            prompt: `Tạo 4 câu hỏi trắc nghiệm ôn tập (gồm 4 lựa chọn A, B, C, D kèm đáp án đúng và giải thích) từ tài liệu:`,
            context: fullText
          })
        });
        const data = await res.json();
        // Fallback cloze questions for structured rendering
        const fallback = generateClozeQuestions(fullText, 4);
        setQuizQuestions(fallback);
      } catch {
        const fallback = generateClozeQuestions(fullText, 4);
        setQuizQuestions(fallback);
      } finally {
        setLoading(false);
      }
    }
  };

  // 3. Chạy Sinh Flashcard
  const handleGenerateFlashcards = () => {
    const cards = generateFlashcardsFromRules(fullText, 6);
    setFlashcards(cards);
    setCurrentCardIndex(0);
    setIsFlipped(false);
  };

  // 4. Chạy OCR từ File Ảnh
  const handleOcrFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setOcrFileName(file.name);
    setLoading(true);
    setOcrProgress('Đang tải mô hình OCR Tesseract.js (vie + eng)...');

    try {
      const { createWorker } = await import('tesseract.js');
      const worker = await createWorker('vie+eng');
      
      setOcrProgress('Đang quét chữ từ ảnh...');
      const ret = await worker.recognize(file);
      await worker.terminate();

      setOcrText(ret.data.text);
      setOcrProgress(null);
    } catch (err: any) {
      setOcrProgress(`Lỗi OCR: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Xuất tóm tắt thành Sticky Note ra bàn học
  const handleExportSummaryToSticky = () => {
    if (!summaryResult) return;
    addStickyNote(summaryResult.slice(0, 300) + '...', item.x + 380, item.y + 20, '#fef08a');
    onClose();
  };

  // Xuất đề thi thành Tờ Giấy Đề Thi (Exam Paper Sheet) trên bàn học
  const handleExportQuizToPaperSheet = () => {
    if (quizQuestions.length === 0) return;
    const examText = quizQuestions.map((q, idx) => 
      `Câu ${idx + 1}: ${q.question}\n` +
      q.options.map((opt, oIdx) => `  ${String.fromCharCode(65 + oIdx)}. ${opt}`).join('\n')
    ).join('\n\n');

    addUploadedDocument(`Tờ Đề Thi: ${item.title}`, [
      { title: `Đề Thi Trắc Nghiệm - ${item.title}`, text: examText }
    ]);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-cyan-500/40 rounded-2xl w-full max-w-3xl h-[85vh] shadow-2xl flex flex-col overflow-hidden relative">
        {/* Header Bar */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white truncate max-w-md">
                  STudy: {item.title}
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                  {item.pageCount} trang
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Trung tâm ôn luyện thông minh: Non-AI Heuristics & AI Gateway
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation & Mode Switcher */}
        <div className="px-4 py-2 bg-slate-950/40 border-b border-slate-800 flex items-center justify-between gap-2 overflow-x-auto">
          <div className="flex items-center gap-1">
            {[
              { id: 'summary', label: 'Tóm Tắt', icon: FileText },
              { id: 'quiz', label: 'Trắc Nghiệm', icon: HelpCircle },
              { id: 'flashcards', label: 'Flashcards', icon: Layers },
              { id: 'roadmap', label: 'Lộ Trình Học', icon: ListOrdered },
              { id: 'ocr', label: 'Quét OCR Ảnh', icon: Camera }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === tab.id
                      ? 'bg-cyan-500 text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* AI vs Non-AI Switcher Toggle */}
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-700/80 px-2.5 py-1 rounded-full text-xs flex-shrink-0">
            <span className={`text-[11px] font-medium ${!useAi ? 'text-emerald-400 font-bold' : 'text-slate-500'}`}>
              Non-AI (Miễn phí)
            </span>
            <button
              onClick={() => setUseAi(!useAi)}
              className={`w-9 h-5 rounded-full p-0.5 transition-colors ${
                useAi ? 'bg-cyan-500' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  useAi ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
            <span className={`text-[11px] font-medium ${useAi ? 'text-cyan-300 font-bold' : 'text-slate-500'}`}>
              AI Model
            </span>
          </div>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 p-5 overflow-y-auto bg-slate-900/60">
          {/* TAB 1: TÓM TẮT */}
          {activeTab === 'summary' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-200">
                    Trích xuất tóm tắt trọng tâm nội dung
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    {useAi ? `Sử dụng ${aiConfig.model} để viết tóm tắt tổng quan.` : 'Thuật toán TextRank phân tích đồ thị câu cốt lõi (Không tốn ViToken/API).'}
                  </p>
                </div>
                <button
                  onClick={handleGenerateSummary}
                  disabled={loading}
                  className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md disabled:opacity-50"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{loading ? 'Đang trích xuất...' : 'Bắt Đầu Tóm Tắt'}</span>
                </button>
              </div>

              {summaryResult ? (
                <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 font-serif text-xs leading-relaxed text-stone-200 relative">
                  <div className="whitespace-pre-line pr-8">
                    {summaryResult}
                  </div>
                  <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-slate-800/80 font-sans">
                    <button
                      onClick={handleExportSummaryToSticky}
                      className="px-3 py-1.5 bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 rounded-lg text-xs font-medium flex items-center gap-1"
                    >
                      <span>Dán thành Note lên bàn học</span>
                    </button>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(summaryResult);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 1500);
                      }}
                      className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs flex items-center gap-1"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="h-52 border-2 border-dashed border-slate-800 rounded-xl flex flex-col items-center justify-center text-slate-500 text-xs">
                  <FileText className="w-8 h-8 mb-2 opacity-40" />
                  <span>Bấm nút "Bắt Đầu Tóm Tắt" để hệ thống tự động bóc tách kiến thức</span>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: TRẮC NGHIỆM */}
          {activeTab === 'quiz' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-200">
                    Bộ câu hỏi trắc nghiệm ôn tập (Quiz Test)
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    {useAi ? 'AI sinh câu hỏi thông minh kèm 4 phương án.' : 'Thuật toán Cloze Deletion đục lỗ từ khoá và sinh phương án nhiễu tự động.'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {quizQuestions.length > 0 && (
                    <button
                      onClick={handleExportQuizToPaperSheet}
                      className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded-xl text-xs font-medium flex items-center gap-1.5"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Xuất Tờ Đề Thi Giấy</span>
                    </button>
                  )}
                  <button
                    onClick={handleGenerateQuiz}
                    disabled={loading}
                    className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md disabled:opacity-50"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>{loading ? 'Đang sinh câu hỏi...' : 'Sinh Đề Trắc Nghiệm'}</span>
                  </button>
                </div>
              </div>

              {quizQuestions.length > 0 ? (
                <div className="space-y-4">
                  {quizQuestions.map((q, qIdx) => {
                    const selectedOpt = userAnswers[q.id];
                    return (
                      <div key={q.id} className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
                        <div className="text-xs font-bold text-white mb-2 whitespace-pre-line">
                          Câu {qIdx + 1}: {q.question}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                          {q.options.map((opt, oIdx) => {
                            const isChosen = selectedOpt === oIdx;
                            const isCorrect = q.correctIndex === oIdx;
                            let btnStyle = 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800';

                            if (showQuizResults) {
                              if (isCorrect) {
                                btnStyle = 'bg-emerald-950/70 border-emerald-500 text-emerald-300 font-bold';
                              } else if (isChosen && !isCorrect) {
                                btnStyle = 'bg-rose-950/70 border-rose-500 text-rose-300';
                              }
                            } else if (isChosen) {
                              btnStyle = 'bg-cyan-500/20 border-cyan-400 text-cyan-300 font-medium';
                            }

                            return (
                              <button
                                key={oIdx}
                                disabled={showQuizResults}
                                onClick={() => setUserAnswers(prev => ({ ...prev, [q.id]: oIdx }))}
                                className={`p-2.5 rounded-lg border text-xs text-left flex items-start gap-2 transition-all ${btnStyle}`}
                              >
                                <span className="font-bold opacity-60">
                                  {String.fromCharCode(65 + oIdx)}.
                                </span>
                                <span>{opt}</span>
                              </button>
                            );
                          })}
                        </div>

                        {showQuizResults && (
                          <div className="p-2.5 bg-slate-900/90 rounded-lg text-[11px] text-slate-300 border border-slate-800">
                            <span className="font-bold text-cyan-400">Giải thích: </span>
                            <span>{q.explanation}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  <div className="flex justify-end pt-2">
                    <button
                      onClick={() => setShowQuizResults(true)}
                      disabled={Object.keys(userAnswers).length === 0}
                      className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-lg disabled:opacity-40"
                    >
                      Chấm Bài & Xem Kết Quả
                    </button>
                  </div>
                </div>
              ) : (
                <div className="h-52 border-2 border-dashed border-slate-800 rounded-xl flex flex-col items-center justify-center text-slate-500 text-xs">
                  <HelpCircle className="w-8 h-8 mb-2 opacity-40" />
                  <span>Bấm nút "Sinh Đề Trắc Nghiệm" để làm bài kiểm tra kiến thức</span>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: FLASHCARDS */}
          {activeTab === 'flashcards' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-200">
                    Flashcards Lặp lại ngắt quãng (Spaced Repetition)
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Tự động nhận diện định nghĩa trọng tâm để tạo thẻ ghi nhớ nhanh.
                  </p>
                </div>
                <button
                  onClick={handleGenerateFlashcards}
                  className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Trích Thẻ Flashcards</span>
                </button>
              </div>

              {flashcards.length > 0 ? (
                <div className="flex flex-col items-center max-w-md mx-auto pt-4">
                  {/* Flip Card Container */}
                  <div
                    onClick={() => setIsFlipped(!isFlipped)}
                    className="w-full h-56 bg-gradient-to-br from-slate-950 to-slate-900 border-2 border-cyan-500/40 rounded-2xl p-6 shadow-2xl flex flex-col justify-between cursor-pointer hover:border-cyan-400 transition-all select-none relative group"
                  >
                    <div className="flex items-center justify-between text-[11px] text-cyan-400 font-mono">
                      <span>{flashcards[currentCardIndex].category || 'Khái niệm'}</span>
                      <span className="text-slate-500">
                        {currentCardIndex + 1} / {flashcards.length}
                      </span>
                    </div>

                    <div className="text-center my-auto">
                      {!isFlipped ? (
                        <div>
                          <div className="text-[11px] text-slate-400 uppercase tracking-widest mb-2 font-mono">
                            MẶT TRƯỚC (THUẬT NGỮ)
                          </div>
                          <div className="text-base font-bold text-white">
                            {flashcards[currentCardIndex].front}
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className="text-[11px] text-emerald-400 uppercase tracking-widest mb-2 font-mono">
                            MẶT SAU (ĐỊNH NGHĨA)
                          </div>
                          <div className="text-xs text-stone-200 font-serif leading-relaxed">
                            {flashcards[currentCardIndex].back}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="text-center text-[10px] text-slate-500 font-mono">
                      (Bấm vào thẻ để lật mặt)
                    </div>
                  </div>

                  {/* Flashcard Controls */}
                  <div className="flex items-center gap-3 mt-4">
                    <button
                      onClick={() => {
                        setIsFlipped(false);
                        setCurrentCardIndex(prev => Math.max(0, prev - 1));
                      }}
                      disabled={currentCardIndex === 0}
                      className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl disabled:opacity-30"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setIsFlipped(!isFlipped)}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded-xl text-xs font-semibold flex items-center gap-1.5"
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                      <span>Lật thẻ</span>
                    </button>
                    <button
                      onClick={() => {
                        setIsFlipped(false);
                        setCurrentCardIndex(prev => Math.min(flashcards.length - 1, prev + 1));
                      }}
                      disabled={currentCardIndex === flashcards.length - 1}
                      className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl disabled:opacity-30"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="h-52 border-2 border-dashed border-slate-800 rounded-xl flex flex-col items-center justify-center text-slate-500 text-xs">
                  <Layers className="w-8 h-8 mb-2 opacity-40" />
                  <span>Bấm nút "Trích Thẻ Flashcards" để luyện trí nhớ phản xạ</span>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: LỘ TRÌNH HỌC */}
          {activeTab === 'roadmap' && (
            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-bold text-slate-200">
                  Lộ trình học theo từng chặng (Interactive Node Roadmap)
                </h4>
                <p className="text-[11px] text-slate-400">
                  Bấm vào từng chặng để tự động mở sách tới trang tương ứng trên bàn học.
                </p>
              </div>

              <div className="space-y-2">
                {roadmapSteps.map((step) => (
                  <div
                    key={step.id}
                    onClick={() => {
                      setBookPage(item.id, step.pageIndex);
                      onClose();
                    }}
                    className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                      step.isCompleted
                        ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-300'
                        : 'bg-slate-950/80 border-slate-800 hover:border-cyan-500/50 text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-mono text-xs font-bold">
                        {step.stepNumber}
                      </div>
                      <div>
                        <div className="text-xs font-bold leading-snug">{step.title}</div>
                        <div className="text-[10px] text-slate-400 line-clamp-1">{step.description}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-right">
                      <span className="text-[11px] font-mono text-slate-400">
                        ~{step.estimatedMinutes} phút
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setRoadmapSteps(prev => prev.map(s => s.id === step.id ? { ...s, isCompleted: !s.isCompleted } : s));
                        }}
                        className={`p-1 rounded ${step.isCompleted ? 'text-emerald-400' : 'text-slate-600 hover:text-slate-400'}`}
                      >
                        <CheckCircle className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: QUÉT OCR TỪ ẢNH */}
          {activeTab === 'ocr' && (
            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-bold text-slate-200">
                  Quét chữ từ hình ảnh bài giảng (OCR Engine)
                </h4>
                <p className="text-[11px] text-slate-400">
                  Chạy Tesseract.js WebAssembly hỗ trợ song ngữ Tiếng Việt & Tiếng Anh.
                </p>
              </div>

              <div className="border-2 border-dashed border-slate-700 hover:border-cyan-400 rounded-xl p-6 text-center cursor-pointer relative bg-slate-950/60">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleOcrFile}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <Camera className="w-8 h-8 text-cyan-400 mx-auto mb-2 opacity-80" />
                <div className="text-xs font-bold text-white mb-1">
                  Chọn hoặc thả ảnh trang sách/vở vào đây
                </div>
                <div className="text-[11px] text-slate-400">
                  Hỗ trợ PNG, JPG, WebP. Chạy cục bộ không tải ảnh lên máy chủ bên ngoài.
                </div>
              </div>

              {ocrProgress && (
                <div className="p-3 bg-cyan-950/40 border border-cyan-500/30 rounded-xl text-cyan-300 text-xs flex items-center gap-2">
                  <div className="w-3.5 h-3.5 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
                  <span>{ocrProgress}</span>
                </div>
              )}

              {ocrText && (
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-serif text-xs leading-relaxed text-stone-200 space-y-3">
                  <div className="text-[10px] text-emerald-400 font-mono font-bold">
                    VĂN BẢN TRÍCH XUẤT ĐƯỢC:
                  </div>
                  <div className="whitespace-pre-line max-h-48 overflow-y-auto">
                    {ocrText}
                  </div>
                  <div className="flex justify-end pt-2 border-t border-slate-800">
                    <button
                      onClick={() => {
                        addUploadedDocument(`OCR: ${ocrFileName}`, [
                          { title: 'Văn bản quét từ ảnh', text: ocrText }
                        ]);
                        onClose();
                      }}
                      className="px-4 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg text-xs"
                    >
                      Tạo Thành Tờ Giấy Lên Bàn
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
