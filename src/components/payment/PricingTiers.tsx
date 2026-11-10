'use client';

import React from 'react';
import { PaymentPackage } from '@/services/PaymentService';
import { Check } from 'lucide-react';

interface PricingTiersProps {
  packages: PaymentPackage[];
  selectedPackageId: string;
  onSelectPackage: (pkg: PaymentPackage) => void;
  isLoading?: boolean;
}

const BONUS_MAP: Record<string, string> = {
  semester: '+3 ViToken',
  project: '+15 ViToken',
  team: '+45 ViToken',
};

const USAGE_MAP: Record<string, string> = {
  starter: 'Đủ cho 1 lượt hỏi đáp chuyên sâu',
  midterm: '~5 lượt AI hoặc tải đề thi',
  semester: '15 lượt AI hoặc 2 tài liệu Chợ · Tiết kiệm 10%',
  project: '~50 lượt AI hoặc cả học kỳ',
  team: 'Phù hợp nhóm học và đồ án lớn',
};

export function PricingTiers({
  packages,
  selectedPackageId,
  onSelectPackage,
  isLoading,
}: PricingTiersProps) {
  if (isLoading) {
    return (
      <div className="py-8 text-center text-xs text-slate-500">
        Đang nạp danh sách gói...
      </div>
    );
  }

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      const nextIndex = (index + 1) % packages.length;
      onSelectPackage(packages[nextIndex]);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      const prevIndex = (index - 1 + packages.length) % packages.length;
      onSelectPackage(packages[prevIndex]);
    }
  };

  return (
    <div className="space-y-3">
      <div 
        role="radiogroup" 
        aria-label="Chọn gói nạp ViToken"
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2.5"
      >
        {packages.map((pkg, idx) => {
          const isSelected = selectedPackageId === pkg.id;
          const isPopular = pkg.id === 'semester';
          const bonus = BONUS_MAP[pkg.id];
          const usageDesc = USAGE_MAP[pkg.id] || 'Áp dụng cho mọi tính năng học tập';

          return (
            <div
              key={pkg.id}
              role="radio"
              aria-checked={isSelected}
              tabIndex={isSelected ? 0 : -1}
              aria-label={`Gói ${pkg.label}, ${pkg.priceVnd.toLocaleString('vi-VN')} đồng, nhận ${pkg.tokenAmount} ViToken. ${usageDesc}`}
              onClick={() => onSelectPackage(pkg)}
              onKeyDown={(e) => handleKeyDown(e, idx)}
              className={`relative rounded-xl p-3 bg-white transition-all cursor-pointer flex flex-col justify-between text-left outline-none ${
                isSelected
                  ? 'border-[1.5px] border-[#E0562D]'
                  : 'border border-slate-200 hover:border-slate-300'
              }`}
            >
              {/* Huy hiệu Phổ biến - Chỉ gắn duy nhất gói học kỳ */}
              {isPopular && (
                <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-[#E0562D] text-white text-[9px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
                  Phổ biến
                </div>
              )}

              <div>
                {/* Dòng 1: Tên gói & Nhãn +N ViToken */}
                <div className="flex items-center justify-between gap-1 mb-1 min-h-[20px]">
                  <span className="text-xs font-bold text-slate-900 whitespace-nowrap">{pkg.label}</span>
                  {bonus && (
                    <span className="text-[10px] font-bold text-[#E0562D] whitespace-nowrap">
                      {bonus}
                    </span>
                  )}
                </div>

                {/* Dòng 2 & 3: Giá to nhất & Số ViToken nhận được */}
                <div className="mt-1">
                  <div className="text-lg font-black text-slate-900 leading-none">
                    {pkg.priceVnd.toLocaleString('vi-VN')}{' '}
                    <span className="text-[11px] font-bold text-slate-800">đ</span>
                  </div>
                  <div className="text-[11px] font-medium text-slate-700 mt-1.5 whitespace-nowrap">
                    Nhận {pkg.tokenAmount.toLocaleString('vi-VN')} ViToken
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1 leading-snug min-h-[28px]">
                    {usageDesc}
                  </div>
                </div>
              </div>

              {/* Dấu tích chọn */}
              <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-end text-[11px]">
                <div
                  className={`w-4 h-4 rounded-full flex items-center justify-center transition-all ${
                    isSelected
                      ? 'bg-[#E0562D] text-white'
                      : 'border border-slate-300 text-transparent'
                  }`}
                >
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
