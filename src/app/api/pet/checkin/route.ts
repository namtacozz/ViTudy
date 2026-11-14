import { NextResponse } from 'next/server';
import { todayKey } from '@/lib/dateVN';
import { calculateStage, calculateDaysToNextStage, PET_STAGES } from '@/components/pet/stages';

export const dynamic = 'force-dynamic';

const RESET_STREAK_DEFAULT = 1;

export async function POST(request: Request) {
  try {
    const today = todayKey();
    const yesterdayDate = new Date(Date.now() - 86400000);
    const yesterday = todayKey(yesterdayDate);

    const cookieHeader = request.headers.get('cookie') || '';
    const petDataMatch = cookieHeader.match(/vitudy_pet_streak=([^;]+)/);
    
    let currentStreak = 0;
    let longestStreak = 0;
    let lastCheckinDate = '';

    if (petDataMatch) {
      try {
        const parsed = JSON.parse(decodeURIComponent(petDataMatch[1]));
        currentStreak = Number(parsed.current_streak) || 0;
        longestStreak = Number(parsed.longest_streak) || 0;
        lastCheckinDate = parsed.last_checkin_date || '';
      } catch {
        // use default
      }
    }

    // 1. Idempotent: Nếu đã điểm danh hôm nay rồi thì không tăng streak
    if (lastCheckinDate === today) {
      const curStage = calculateStage(currentStreak);
      const maxUnlockedStage = calculateStage(longestStreak);
      const unlockedStages = PET_STAGES.filter(s => s.stage <= maxUnlockedStage).map(s => s.stage);

      return NextResponse.json({
        current_streak: currentStreak,
        longest_streak: longestStreak,
        checked_in_today: true,
        stage: curStage,
        unlocked_stages: unlockedStages,
        days_to_next_stage: calculateDaysToNextStage(currentStreak),
        evolved: false,
        new_stage: curStage,
      });
    }

    const oldStage = calculateStage(currentStreak);

    // 2. Kiểm tra chuỗi: nếu hôm qua có điểm danh thì streak + 1, nếu đứt thì reset về RESET_STREAK_DEFAULT
    if (lastCheckinDate === yesterday) {
      currentStreak += 1;
    } else {
      currentStreak = RESET_STREAK_DEFAULT;
    }

    if (currentStreak > longestStreak) {
      longestStreak = currentStreak;
    }

    lastCheckinDate = today;

    const newStage = calculateStage(currentStreak);
    const evolved = newStage > oldStage;
    const maxUnlockedStage = calculateStage(longestStreak);
    const unlockedStages = PET_STAGES.filter(s => s.stage <= maxUnlockedStage).map(s => s.stage);

    const updatedData = {
      current_streak: currentStreak,
      longest_streak: longestStreak,
      last_checkin_date: lastCheckinDate,
    };

    const response = NextResponse.json({
      current_streak: currentStreak,
      longest_streak: longestStreak,
      checked_in_today: true,
      stage: newStage,
      unlocked_stages: unlockedStages,
      days_to_next_stage: calculateDaysToNextStage(currentStreak),
      evolved,
      new_stage: newStage,
    });

    // Lưu trạng thái vào cookie 30 ngày
    response.cookies.set('vitudy_pet_streak', encodeURIComponent(JSON.stringify(updatedData)), {
      path: '/',
      maxAge: 30 * 24 * 60 * 60,
      sameSite: 'lax',
    });

    return response;
  } catch (error) {
    console.error('Lỗi API POST /api/pet/checkin:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
