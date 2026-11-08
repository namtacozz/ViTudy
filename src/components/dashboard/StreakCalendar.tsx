'use client';

import React from 'react';
import { Calendar } from 'lucide-react';

interface StreakCalendarProps {
  activityGrid: { date: string; minutes: number }[];
}

export function StreakCalendar({ activityGrid }: StreakCalendarProps) {
  const getColorClass = (minutes: number) => {
    if (minutes === 0) return 'bg-slate-100 border-slate-200';
    if (minutes < 15) return 'bg-orange-200 border-orange-300';
    if (minutes < 45) return 'bg-orange-400 border-orange-500';
    return 'bg-[#E0562D] border-[#c9451e]';
  };

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center text-[#E0562D]">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-900">Ma trận học tập (28 ngày)</h3>
            <p className="text-xs text-slate-500">Mức độ tương tác học tập thực tế mỗi ngày</p>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
          <span>Ít</span>
          <div className="w-3 h-3 rounded-xs bg-slate-100 border border-slate-200" />
          <div className="w-3 h-3 rounded-xs bg-orange-200 border border-orange-300" />
          <div className="w-3 h-3 rounded-xs bg-orange-400 border border-orange-500" />
          <div className="w-3 h-3 rounded-xs bg-[#E0562D] border-[#c9451e]" />
          <span>Nhiều</span>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2 pt-2">
        {activityGrid.map((item, idx) => (
          <div
            key={idx}
            className={`h-11 rounded-xl border flex flex-col items-center justify-center transition-all cursor-pointer relative group ${getColorClass(
              item.minutes
            )}`}
          >
            <span
              className={`text-[10px] font-bold font-mono ${
                item.minutes > 30 ? 'text-white' : 'text-slate-700'
              }`}
            >
              {item.date.slice(8)}
            </span>
            {item.minutes > 0 && (
              <span
                className={`text-[9px] font-mono leading-none ${
                  item.minutes > 30 ? 'text-white/90' : 'text-slate-500'
                }`}
              >
                {item.minutes}p
              </span>
            )}

            {/* Tooltip */}
            <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[9.5px] font-mono px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap shadow-xs z-10">
              {item.date}: {item.minutes} phút
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
