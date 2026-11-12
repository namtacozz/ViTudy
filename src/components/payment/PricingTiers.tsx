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

const USAGE_MAP: Record<string, string> = {
  light: '~10 lượt AI hoặc tải đề thi.',
  diligent: '~25 lượt AI hoặc vài tài liệu Chợ.',
  tryhard: '~50 lượt AI. Siêu tiết kiệm.',
  group: 'Phù hợp cho học nhóm và đồ án.',
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
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 items-stretch"
      >
        {packages.map((pkg, idx) => {
          const isSelected = selectedPackageId === pkg.id;
          const isPopular = pkg.id === 'diligent' || pkg.id === 'tryhard';
          const usageDesc = USAGE_MAP[pkg.id] || 'Áp dụng cho mọi tính năng học tập.';

          return (
            <div
              key={pkg.id}
              role="radio"
              aria-checked={isSelected}
              tabIndex={isSelected ? 0 : -1}
              aria-label={`Gói ${pkg.label}, ${pkg.priceVnd.toLocaleString('vi-VN')} đồng, nhận ${pkg.tokenAmount} ViToken. ${usageDesc}`}
              onClick={() => onSelectPackage(pkg)}
              onKeyDown={(e) => handleKeyDown(e, idx)}
              className={`relative rounded-xl p-3.5 bg-white transition-all cursor-pointer flex flex-col justify-between text-left outline-none min-h-[160px] ${
                isSelected
                  ? 'border-[1.5px] border-[#E0562D] shadow-2xs'
                  : 'border border-slate-200 hover:border-slate-300'
              }`}
            >
              {isPopular && pkg.id === 'diligent' && (
                <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-[#E0562D] text-white text-[9px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap shadow-2xs">
                  Phổ biến
                </div>
              )}

              <div className="flex-1 flex flex-col">
                {/* 1. Tên gói */}
                <div className="text-xs font-bold text-slate-900 tracking-tight">
                  {pkg.label}
                </div>

                {/* 2. Giá tiền */}
                <div className="text-xl font-black text-slate-900 leading-none mt-1.5">
                  {pkg.priceVnd.toLocaleString('vi-VN')}{' '}
                  <span className="text-xs font-bold text-slate-700">đ</span>
                </div>

                {/* 3. Số ViToken (to lên chút) */}
                <div className="text-sm font-black text-[#E0562D] mt-2 flex items-center gap-1.5">
                  <span className="text-base leading-none">•</span>
                  <span>{pkg.tokenAmount.toLocaleString('vi-VN')} ViToken</span>
                </div>

                {/* 4. Miêu tả */}
                <div className="text-[11px] text-slate-500 mt-2 leading-relaxed">
                  {usageDesc}
                </div>
              </div>

              {/* Dấu tích chọn */}
              <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-end text-[11px]">
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
