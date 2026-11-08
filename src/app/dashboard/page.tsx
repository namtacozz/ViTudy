'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useViToken } from '@/context/ViTokenContext';
import { StatsService, DayStudyTime, ExamStats } from '@/services/StatsService';
import { StudyStats } from '@/components/dashboard/StudyStats';
import { StreakCalendar } from '@/components/dashboard/StreakCalendar';
import { TokenHistory } from '@/components/dashboard/TokenHistory';
import { ArrowLeft, BarChart2, Loader2, LogIn } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { user, status } = useAuth();
  const { wallet } = useViToken();

  const [weeklyData, setWeeklyData] = useState<DayStudyTime[]>([]);
  const [examStats, setExamStats] = useState<ExamStats>({ averageScore: 0, totalExams: 0 });
  const [activityGrid, setActivityGrid] = useState<{ date: string; minutes: number }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      Promise.all([
        StatsService.getWeeklyStudyMinutes(user.id),
        StatsService.getExamPerformance(user.id),
        StatsService.getMonthlyActivityGrid(user.id),
      ]).then(([weekly, exams, grid]) => {
        setWeeklyData(weekly);
        setExamStats(exams);
        setActivityGrid(grid);
        setIsLoading(false);
      });
    } else {
      // Chế độ khách (Guest Mode): Hiển thị dữ liệu cục bộ hoặc mặc định của phiên làm việc
      const now = new Date();
      const today = now.toISOString().split('T')[0];
      const getPastDateStr = (daysAgo: number) => {
        const d = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
        return d.toISOString().split('T')[0];
      };
      setWeeklyData([
        { date: getPastDateStr(6), day: 'T2', minutes: 25 },
        { date: getPastDateStr(5), day: 'T3', minutes: 40 },
        { date: getPastDateStr(4), day: 'T4', minutes: 15 },
        { date: getPastDateStr(3), day: 'T5', minutes: 50 },
        { date: getPastDateStr(2), day: 'T6', minutes: 30 },
        { date: getPastDateStr(1), day: 'T7', minutes: 45 },
        { date: getPastDateStr(0), day: 'CN', minutes: 20 },
      ]);
      setExamStats({ averageScore: 8.5, totalExams: 3 });
      setActivityGrid([
        { date: today, minutes: 45 },
      ]);
      setIsLoading(false);
    }
  }, [user?.id, status]);

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-[#E0562D]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 py-8 px-4 sm:px-6 font-sans">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 transition-colors bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-2xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Về bàn học</span>
          </Link>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center text-[#E0562D]">
              <BarChart2 className="w-4 h-4" />
            </div>
            <h1 className="text-sm font-bold text-slate-900">Nhật ký học tập</h1>
          </div>
        </div>

        {/* Banner dành cho người dùng khách */}
        {status === 'guest' && (
          <div className="p-4 bg-white border border-amber-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
            <div className="text-xs text-slate-700 space-y-0.5">
              <span className="font-bold text-amber-800">Chế độ trải nghiệm khách:</span>
              <p className="text-slate-500">
                Lịch sử học tập hiện chỉ lưu trên trình duyệt này. Đăng nhập để lưu tiến độ lâu dài và đồng bộ lên đám mây.
              </p>
            </div>
            <Link
              href="/auth"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#E0562D] hover:bg-[#c9451e] text-white text-xs font-bold shadow-2xs transition-all flex-shrink-0 self-start sm:self-center"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Đăng nhập ngay</span>
            </Link>
          </div>
        )}

        {/* 1. Main Stat Cards */}
        <StudyStats
          weeklyData={weeklyData}
          examStats={examStats}
          streakDays={wallet.streakDays}
        />

        {/* 2. Monthly Contribution Matrix */}
        <StreakCalendar activityGrid={activityGrid} />

        {/* 3. Token Transaction Ledger */}
        <TokenHistory transactions={wallet.history} balance={wallet.balance} />
      </div>
    </div>
  );
}
