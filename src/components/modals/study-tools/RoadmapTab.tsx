'use client';

import React, { useState, useEffect } from 'react';
import { extractOutlineAndRoadmap, RoadmapStep } from '@/lib/nonAiEngine';
import { useStudySpace } from '@/context/StudySpaceContext';
import { useViToken } from '@/context/ViTokenContext';
import { askAi } from '@/lib/aiClient';
import { MathRenderer } from '@/components/common/MathRenderer';
import { getStudyCache, setStudyCache } from '@/lib/studyToolsCache';
import { 
  ListOrdered, 
  Clock, 
  ChevronRight, 
  CheckCircle,
  ExternalLink,
  Sparkles
} from 'lucide-react';

interface RoadmapTabProps {
  pages: { title?: string; text: string }[];
  itemType: string;
  itemId: string;
  onJumpToPage?: (pageIdx: number) => void;
}

export function RoadmapTab({ pages, itemType, itemId, onJumpToPage }: RoadmapTabProps) {
  const { setBookPage } = useStudySpace();
  const { aiConfig, spendTokens } = useViToken();

  const cacheKey = itemId || 'default-doc';
  const cachedData = getStudyCache(cacheKey);

  const [roadmap, setRoadmap] = useState<RoadmapStep[]>(cachedData.roadmap || []);
  const [useAi, setUseAi] = useState(aiConfig.provider === 'oauth_chatgpt' || Boolean(aiConfig.isOauthConnected));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (roadmap.length > 0) {
      setStudyCache(cacheKey, { roadmap });
    }
  }, [roadmap, cacheKey]);

  const handleGenerateRoadmap = async () => {
    if (!pages || pages.length === 0) return;

    if (!useAi) {
      const steps = extractOutlineAndRoadmap(pages);
      setRoadmap(steps);
      return;
    }

    if (aiConfig.provider === 'system') {
      const ok = spendTokens(2, 'Dựng lộ trình học AI');
      if (!ok) {
        alert('Số dư ViToken không đủ để dùng AI Hệ Thống. Chuyển sang dựng lộ trình Non-AI.');
        setUseAi(false);
        setRoadmap(extractOutlineAndRoadmap(pages));
        return;
      }
    }

    setLoading(true);
    try {
      const fullContext = pages.map((p, idx) => `[Trang ${idx + 1}: ${p.title || 'Mục ' + (idx + 1)}]\n${p.text.slice(0, 500)}`).join('\n\n');
      const prompt = `Từ cấu trúc và nội dung các trang tài liệu sau đây, hãy xây dựng một lộ trình học tập cá nhân hóa (4 đến 6 chặng) giúp người học nắm vững kiến thức từ cơ bản đến chuyên sâu.
Mỗi chặng gồm:
- "title": Tên chặng học súc tích và hành động cụ thể (ví dụ: "Chặng 1: Nền tảng khái niệm ...")
- "description": Mục tiêu cốt lõi cần đạt và cách ôn tập
- "estimatedMinutes": Thời gian hoàn thành dự kiến (số nguyên phút)
- "pageIndex": Số thứ tự trang bắt đầu tương ứng (0-indexed)
Trả về dạng JSON array hợp lệ, KHÔNG thêm bất kỳ văn bản nào khác ngoài JSON:
[
  {
    "title": "Chặng 1: ...",
    "description": "...",
    "estimatedMinutes": 20,
    "pageIndex": 0
  }
]`;

      const data = await askAi({
        provider: aiConfig.provider,
        model: aiConfig.model,
        apiKey: aiConfig.apiKey,
        prompt,
        context: fullContext.slice(0, 4000),
      });

      const rawText = data.reply || '';
      const match = rawText.match(/\[[\s\S]*\]/);
      if (match) {
        const parsed = JSON.parse(match[0]);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setRoadmap(parsed.map((item: any, idx: number) => ({
            id: `ai-rm-${idx}-${Date.now()}`,
            stepNumber: idx + 1,
            title: item.title || `Chặng ${idx + 1}`,
            description: item.description || '',
            estimatedMinutes: typeof item.estimatedMinutes === 'number' ? item.estimatedMinutes : 15,
            pageIndex: typeof item.pageIndex === 'number' ? item.pageIndex : idx,
            isCompleted: false,
          })));
          return;
        }
      }
      setRoadmap(extractOutlineAndRoadmap(pages));
    } catch {
      setRoadmap(extractOutlineAndRoadmap(pages));
    } finally {
      setLoading(false);
    }
  };

  const totalReadingMinutes = roadmap.reduce((acc, cur) => acc + (cur.estimatedMinutes || 2), 0);

  return (
    <div 
      data-scrollable="true"
      className="flex-1 flex flex-col p-3.5 sm:p-4 overflow-y-auto font-sans text-slate-900 bg-white"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-200">
        <div>
          <h4 className="text-xs sm:text-sm font-bold text-slate-900">Lộ trình học tập</h4>
        </div>

        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-full transition-colors border border-slate-300 select-none whitespace-nowrap shrink-0">
            <input 
              type="checkbox"
              checked={useAi}
              onChange={(e) => setUseAi(e.target.checked)}
              className="rounded accent-[#E0562D]"
            />
            <span>Dùng AI chuyên sâu</span>
          </label>

          <button
            onClick={handleGenerateRoadmap}
            disabled={loading}
            className="px-3.5 py-1.5 bg-[#E0562D] hover:bg-[#c9451e] text-white rounded-lg text-xs font-bold transition-colors shadow-xs flex items-center justify-center disabled:opacity-50 cursor-pointer active:scale-95 whitespace-nowrap shrink-0"
          >
            <span>{loading ? 'Đang dựng...' : roadmap.length > 0 ? 'Cập nhật lộ trình' : 'Dựng lộ trình'}</span>
          </button>
        </div>
      </div>

      {/* Roadmap Content */}
      <div className="flex-1 mt-4">
        {roadmap.length > 0 ? (
          <div>
            {/* Total Stat Badge */}
            <div className="flex items-center gap-2 mb-4 bg-slate-100 p-3 rounded-xl border border-slate-200 text-xs text-slate-700">
              <Clock className="w-4 h-4 text-slate-900" />
              <span>Tổng thời gian học ước tính: <strong>{totalReadingMinutes} phút</strong> ({roadmap.length} chặng học)</span>
            </div>

            <div className="space-y-3">
              {roadmap.map((step, idx) => (
                <div 
                  key={step.id || idx}
                  className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center justify-between hover:border-slate-300 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold font-mono shrink-0">
                      {idx + 1}
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-slate-900">
                        <MathRenderer content={step.title} />
                      </h5>
                      <div className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">
                        <MathRenderer content={step.description} />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0 ml-2">
                    <span className="text-[11px] text-slate-500 font-mono">
                      ~{step.estimatedMinutes} phút
                    </span>

                    {itemType === 'book' && (
                      <button
                        title="Mở đến trang này"
                        onClick={() => {
                          if (step.pageIndex !== undefined) {
                            setBookPage(itemId, step.pageIndex);
                          }
                        }}
                        className="p-1 hover:bg-slate-200 rounded-lg text-slate-700 transition-colors cursor-pointer"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="h-64 flex flex-col items-center justify-center text-slate-600 text-xs text-center border-2 border-dashed border-slate-300 rounded-xl p-6">
            <ListOrdered className="w-8 h-8 mb-2 text-[#E0562D]" />
            <span className="font-bold text-slate-800 text-sm mb-1">Chưa có lộ trình học</span>
            <span className="text-slate-500 max-w-sm">
              Nhấn "Dựng lộ trình" để lập kế hoạch học tập theo từng chặng và ước tính thời gian ôn tập.
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
