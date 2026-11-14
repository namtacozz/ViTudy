import { getSupabase } from '@/lib/supabase';
import { getLast28DaysGrid, todayKey } from '@/lib/dateVN';

export interface DayStudyTime {
  day: string; // e.g. "T2", "T3"
  date: string; // "YYYY-MM-DD"
  minutes: number;
}

export interface ExamStats {
  averageScore: number;
  totalExams: number;
}

export class StatsService {
  static async getWeeklyStudyMinutes(userId: string): Promise<DayStudyTime[]> {
    const supabase = getSupabase();
    const result: DayStudyTime[] = [];
    const daysLabel = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

    const today = new Date();
    const vnFormatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Ho_Chi_Minh',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    // 7 days ending today (in Asia/Ho_Chi_Minh to match record_heartbeat)
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = vnFormatter.format(d);
      const dayLabel = daysLabel[d.getDay()];
      result.push({
        day: dayLabel,
        date: dateStr,
        minutes: 0,
      });
    }

    if (!supabase) return result;

    try {
      const startDate = result[0].date;
      const { data, error } = await supabase
        .from('study_sessions')
        .select('day, seconds')
        .eq('user_id', userId)
        .gte('day', startDate);

      if (!error && data) {
        data.forEach((row) => {
          const matched = result.find((r) => r.date === row.day);
          if (matched) {
            matched.minutes = Math.round(row.seconds / 60);
          }
        });
      }
    } catch {}

    return result;
  }

  static async getExamPerformance(userId: string): Promise<ExamStats> {
    const supabase = getSupabase();
    if (!supabase) {
      return { averageScore: 0, totalExams: 0 };
    }

    try {
      const { data, error } = await supabase
        .from('exam_attempts')
        .select('score')
        .eq('user_id', userId);

      if (error || !data || data.length === 0) {
        return { averageScore: 0, totalExams: 0 };
      }

      const total = data.length;
      const sum = data.reduce((acc, curr) => acc + Number(curr.score), 0);
      return {
        averageScore: Math.round((sum / total) * 10) / 10,
        totalExams: total,
      };
    } catch {
      return { averageScore: 0, totalExams: 0 };
    }
  }

  static async getMonthlyActivityGrid(userId: string): Promise<{ date: string; minutes: number; isToday?: boolean; isMonthStart?: boolean; monthLabel?: string; leadingEmpty?: number }[]> {
    const supabase = getSupabase();
    const activityMap: Record<string, number> = {};

    if (supabase) {
      try {
        const { days } = getLast28DaysGrid();
        const startDate = days[0].dateStr;
        const { data, error } = await supabase
          .from('study_sessions')
          .select('day, seconds')
          .eq('user_id', userId)
          .gte('day', startDate);

        if (!error && data) {
          data.forEach((row) => {
            activityMap[row.day] = Math.round(row.seconds / 60);
          });
        }
      } catch {}
    }

    const { days, leadingEmptyCells } = getLast28DaysGrid(activityMap);

    return days.map((d, idx) => ({
      date: d.dateStr,
      minutes: d.minutes,
      isToday: d.isToday,
      isMonthStart: d.dayNumber === 1 || idx === 0,
      monthLabel: d.dayNumber === 1 ? `Th${parseInt(d.dateStr.slice(5, 7), 10)}` : undefined,
      leadingEmpty: idx === 0 ? leadingEmptyCells : 0,
    }));
  }
}
