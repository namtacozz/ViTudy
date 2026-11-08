'use client';

import React from 'react';
import { Clock, Award, BookOpen, Flame } from 'lucide-react';
import { DayStudyTime, ExamStats } from '@/services/StatsService';

interface StudyStatsProps {
  weeklyData: DayStudyTime[];
  examStats: ExamStats;
  streakDays: number;
}

export function StudyStats({ weeklyData, examStats, streakDays }: StudyStatsProps) {
  const totalWeeklyMinutes = weeklyData.reduce((acc, curr) => acc + curr.minutes, 0);
  const hours = Math.floor(totalWeeklyMinutes / 60);
  const remainingMins = totalWeeklyMinutes % 60;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
      {/* 1. Tổng thời gian học tuần */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-slate-500">Thời gian học tuần</span>
          <div className="w-8 h-8 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center text-[#E0562D]">
            <Clock className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-black font-mono text-slate-900">
            {hours > 0 ? `${hours}h ${remainingMins}p` : `${remainingMins} phút`}
          </span>
        </div>
        <p className="text-[11px] text-slate-400 mt-1">7 ngày gần nhất trên bàn học</p>
      </div>

      {/* 2. Chuỗi ngày liên tiếp */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-slate-500">Chuỗi học tập</span>
          <div className="w-8 h-8 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center text-[#E0562D]">
            <Flame className="w-4 h-4 text-[#E0562D] fill-[#E0562D]" />
          </div>
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-black font-mono text-slate-900">
            {streakDays}
          </span>
          <span className="text-xs font-bold text-slate-500">ngày</span>
        </div>
        <p className="text-[11px] text-slate-400 mt-1">Duy trì điểm danh đều đặn</p>
      </div>

      {/* 3. Điểm thi trung bình */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-slate-500">Điểm thi trung bình</span>
          <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
            <Award className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-black font-mono text-slate-900">
            {examStats.totalExams > 0 ? examStats.averageScore : '--'}
          </span>
          <span className="text-xs font-bold text-slate-500">/ 10</span>
        </div>
        <p className="text-[11px] text-slate-400 mt-1">
          {examStats.totalExams > 0
            ? `${examStats.totalExams} bài kiểm tra đã nộp`
            : 'Chưa có bài thi nào'}
        </p>
      </div>

      {/* 4. Biểu đồ cột tuần */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-500">Nhịp độ trong tuần</span>
          <span className="text-[11px] font-bold text-slate-400 font-mono">Phút/ngày</span>
        </div>
        <div className="flex items-end justify-between gap-1 h-16 pt-2">
          {weeklyData.map((item, idx) => {
            const maxMin = Math.max(...weeklyData.map((w) => w.minutes), 60);
            const heightPercent = Math.max(12, Math.min(100, (item.minutes / maxMin) * 100));

            return (
              <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full rounded-md bg-orange-100 hover:bg-[#E0562D] transition-all cursor-pointer relative group"
                  style={{ height: `${heightPercent}%` }}
                >
                  <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[9.5px] font-mono px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap shadow-xs z-10">
                    {item.minutes}p
                  </div>
                </div>
                <span className="text-[10px] font-bold text-slate-400">{item.day}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
