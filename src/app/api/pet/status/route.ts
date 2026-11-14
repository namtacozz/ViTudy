import { NextResponse } from 'next/server';
import { todayKey } from '@/lib/dateVN';
import { calculateStage, calculateDaysToNextStage, PET_STAGES } from '@/components/pet/stages';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const today = todayKey();
    const cookieHeader = request.headers.get('cookie') || '';
    
    // Parse cookie lưu trạng thái pet (hoặc từ Supabase session nếu có)
    const petDataMatch = cookieHeader.match(/vitudy_pet_streak=([^;]+)/);
    let petData = {
      current_streak: 1,
      longest_streak: 1,
      last_checkin_date: '', // Mặc định chưa checkin hôm nay để thú cưng ngủ
    };

    if (petDataMatch) {
      try {
        petData = JSON.parse(decodeURIComponent(petDataMatch[1]));
      } catch {
        // use default
      }
    }

    const checked_in_today = petData.last_checkin_date === today;
    const stage = calculateStage(petData.current_streak);
    const maxUnlockedStage = calculateStage(petData.longest_streak);
    const unlocked_stages = PET_STAGES.filter(s => s.stage <= maxUnlockedStage).map(s => s.stage);
    const days_to_next_stage = calculateDaysToNextStage(petData.current_streak);

    return NextResponse.json({
      current_streak: petData.current_streak,
      longest_streak: petData.longest_streak,
      checked_in_today,
      stage,
      unlocked_stages,
      days_to_next_stage,
      server_date: today,
    });
  } catch (error) {
    console.error('Lỗi API GET /api/pet/status:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
