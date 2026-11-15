'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Sparkles, Moon, Sun, Lock } from 'lucide-react';
import { PET_STAGES, PetStageConfig } from './stages';
import { PetStatus } from './usePet';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  status: PetStatus;
}

export const PetGalleryModal: React.FC<Props> = ({ isOpen, onClose, status }) => {
  const [previewSleepStage, setPreviewSleepStage] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lắng nghe phím tắt Esc để đóng modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[99999] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-fade-in font-sans"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90dvh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#E0562D]" />
              <h3 className="text-lg font-bold text-slate-900">Bộ Sưu Tập Thú Cưng</h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Kỷ lục chuỗi bền bỉ nhất: <strong className="text-[#E0562D] font-bold">{status.longest_streak} ngày</strong>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Đóng (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress bar to next stage */}
        {status.days_to_next_stage !== null ? (
          <div className="bg-[#FFF7ED] px-6 py-2.5 border-b border-[#FFEDD5] flex items-center justify-between text-xs text-[#9A3412] font-medium">
            <span>🔥 Chuỗi hiện tại: <strong className="font-bold">{status.current_streak} ngày</strong></span>
            <span className="bg-[#E0562D] text-white px-2.5 py-0.5 rounded-full font-bold text-[11px] shadow-xs">
              Còn {status.days_to_next_stage} ngày để tiến hóa
            </span>
          </div>
        ) : (
          <div className="bg-emerald-50 px-6 py-2 border-b border-emerald-100 text-center text-xs font-bold text-emerald-800">
            🎉 Đã mở khóa cấp độ Trưởng thành tối cao!
          </div>
        )}

        {/* Stages list */}
        <div className="p-6 overflow-y-auto space-y-4 no-scrollbar">
          {PET_STAGES.map((stageItem: PetStageConfig) => {
            const isUnlocked = status.unlocked_stages.includes(stageItem.stage);
            const isCurrent = status.stage === stageItem.stage;
            const isPreviewingSleep = previewSleepStage === stageItem.stage;

            return (
              <div
                key={stageItem.stage}
                className={`flex items-center gap-4 p-3.5 rounded-xl border transition-all ${
                  isCurrent
                    ? 'border-[#E0562D] bg-[#FFF7ED]/30 ring-2 ring-[#E0562D]/20 shadow-xs'
                    : isUnlocked
                    ? 'border-slate-200 bg-white hover:border-slate-300'
                    : 'border-slate-100 bg-slate-50/70'
                }`}
              >
                {/* Pet Image / Silhouette Container */}
                <div className="relative w-20 h-20 shrink-0 flex items-center justify-center rounded-xl bg-slate-100/80 overflow-hidden border border-slate-200/50">
                  <img
                    src={
                      !isUnlocked
                        ? stageItem.awakeSrc
                        : isPreviewingSleep
                        ? stageItem.sleepSrc
                        : stageItem.awakeSrc
                    }
                    alt={isUnlocked ? stageItem.name : 'Locked stage'}
                    className="w-16 h-16 object-contain select-none transition-all duration-300"
                    style={{
                      filter: !isUnlocked ? 'brightness(0) opacity(0.28)' : undefined,
                    }}
                  />
                  {!isUnlocked && (
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-900/10">
                      <Lock className="w-6 h-6 text-slate-500" />
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-sm text-slate-800">
                      {isUnlocked ? `Cấp ${stageItem.stage}: ${stageItem.name}` : `Cấp ${stageItem.stage}: ???`}
                    </h4>
                    {isCurrent && (
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-[#E0562D] text-white rounded-full">
                        Đang chọn
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-500 mt-0.5">
                    {stageItem.maxStreak === null
                      ? `Chuỗi từ ${stageItem.minStreak} ngày trở lên`
                      : `Chuỗi ${stageItem.minStreak} - ${stageItem.maxStreak} ngày`}
                  </p>

                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                    {isUnlocked ? stageItem.description : `Mở khóa ở mốc chuỗi ${stageItem.minStreak} ngày.`}
                  </p>

                  {/* Nút xem bản lúc ngủ */}
                  {isUnlocked && (
                    <button
                      type="button"
                      onMouseEnter={() => setPreviewSleepStage(stageItem.stage)}
                      onMouseLeave={() => setPreviewSleepStage(null)}
                      onClick={() =>
                        setPreviewSleepStage((prev) => (prev === stageItem.stage ? null : stageItem.stage))
                      }
                      className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 hover:text-[#E0562D] transition-colors cursor-pointer"
                    >
                      {isPreviewingSleep ? (
                        <>
                          <Sun className="w-3.5 h-3.5 text-amber-500" />
                          <span>Xem lúc thức</span>
                        </>
                      ) : (
                        <>
                          <Moon className="w-3.5 h-3.5 text-indigo-400" />
                          <span>Xem lúc ngủ (Zzz)</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>,
    document.body
  );
};
