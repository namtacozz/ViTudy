'use client';

import { useState, useEffect, useCallback } from 'react';
import { getAssetPath } from '@/lib/assets';
import { todayKey } from '@/lib/dateVN';
import { calculateStage, calculateDaysToNextStage, PET_STAGES } from '@/components/pet/stages';

export interface PetStatus {
  current_streak: number;
  longest_streak: number;
  checked_in_today: boolean;
  stage: number;
  unlocked_stages: number[];
  days_to_next_stage: number | null;
  server_date?: string;
}

export interface CheckinResult extends PetStatus {
  evolved: boolean;
  new_stage: number;
}

export function usePet() {
  const [status, setStatus] = useState<PetStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [evolutionModalData, setEvolutionModalData] = useState<{
    newStage: number;
  } | null>(null);

  const fetchStatus = useCallback(async () => {
    try {
      let data: PetStatus | null = null;
      try {
        const url = getAssetPath('/api/pet/status');
        const res = await fetch(url, {
          headers: { 'Content-Type': 'application/json' },
        });
        if (res.ok) {
          data = await res.json();
        }
      } catch {}

      // Fallback sang client-side localStorage khi chạy static (GitHub Pages)
      if (!data && typeof window !== 'undefined') {
        const saved = localStorage.getItem('vitudy_pet_streak');
        let currentStreak = 1;
        let longestStreak = 1;
        let lastCheckinDate = '';
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            currentStreak = Number(parsed.current_streak) || 1;
            longestStreak = Number(parsed.longest_streak) || 1;
            lastCheckinDate = parsed.last_checkin_date || '';
          } catch {}
        }
        const today = todayKey();
        const checked_in_today = lastCheckinDate === today;
        const stage = calculateStage(currentStreak);
        const maxUnlockedStage = calculateStage(longestStreak);
        const unlocked_stages = PET_STAGES.filter(s => s.stage <= maxUnlockedStage).map(s => s.stage);
        const days_to_next_stage = calculateDaysToNextStage(currentStreak);
        data = {
          current_streak: currentStreak,
          longest_streak: longestStreak,
          checked_in_today,
          stage,
          unlocked_stages,
          days_to_next_stage,
          server_date: today,
        };
      }

      if (data) {
        setStatus(data);
      }
    } catch (err) {
      console.warn('Lỗi fetch trạng thái pet:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const checkin = useCallback(async (): Promise<CheckinResult | null> => {
    if (isCheckingIn || status?.checked_in_today) return null;
    setIsCheckingIn(true);

    try {
      let result: CheckinResult | null = null;
      try {
        const url = getAssetPath('/api/pet/checkin');
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });
        if (res.ok) {
          result = await res.json();
        }
      } catch {}

      // Fallback sang client-side localStorage khi chạy static (GitHub Pages)
      if (!result && typeof window !== 'undefined') {
        const saved = localStorage.getItem('vitudy_pet_streak');
        let currentStreak = 0;
        let longestStreak = 0;
        let lastCheckinDate = '';
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            currentStreak = Number(parsed.current_streak) || 0;
            longestStreak = Number(parsed.longest_streak) || 0;
            lastCheckinDate = parsed.last_checkin_date || '';
          } catch {}
        }
        const today = todayKey();
        const yesterday = todayKey(new Date(Date.now() - 86400000));
        const oldStage = calculateStage(currentStreak);
        if (lastCheckinDate === yesterday) {
          currentStreak += 1;
        } else if (lastCheckinDate !== today) {
          currentStreak = 1;
        }
        if (currentStreak > longestStreak) {
          longestStreak = currentStreak;
        }
        lastCheckinDate = today;
        const newStage = calculateStage(currentStreak);
        const maxUnlockedStage = calculateStage(longestStreak);
        const unlocked_stages = PET_STAGES.filter(s => s.stage <= maxUnlockedStage).map(s => s.stage);
        const days_to_next_stage = calculateDaysToNextStage(currentStreak);
        const evolved = newStage > oldStage;

        const payload = {
          current_streak: currentStreak,
          longest_streak: longestStreak,
          last_checkin_date: lastCheckinDate,
        };
        localStorage.setItem('vitudy_pet_streak', JSON.stringify(payload));
        result = {
          current_streak: currentStreak,
          longest_streak: longestStreak,
          checked_in_today: true,
          stage: newStage,
          unlocked_stages,
          days_to_next_stage,
          server_date: today,
          evolved,
          new_stage: newStage,
        };
      }

      if (result) {
        setStatus(result);
        if (result.evolved) {
          setEvolutionModalData({ newStage: result.new_stage });
        }
      }

      return result;
    } catch (err) {
      console.error('Lỗi khi điểm danh pet:', err);
      return null;
    } finally {
      setIsCheckingIn(false);
    }
  }, [isCheckingIn, status?.checked_in_today]);

  // Tự động re-fetch khi tab được focus hoặc khi trang hiển thị lại
  useEffect(() => {
    fetchStatus();

    const handleFocus = () => {
      fetchStatus();
    };

    window.addEventListener('focus', handleFocus);
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        fetchStatus();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [fetchStatus]);

  // Hẹn giờ nửa đêm theo giờ Việt Nam để thú cưng tự đi ngủ
  useEffect(() => {
    const scheduleMidnightTimer = () => {
      const now = new Date();
      const utc = now.getTime() + now.getTimezoneOffset() * 60000;
      const vnTime = new Date(utc + 3600000 * 7);

      const nextMidnight = new Date(vnTime);
      nextMidnight.setHours(24, 0, 2, 0); // 00:00:02 ngày tiếp theo

      const msUntilMidnight = Math.max(1000, nextMidnight.getTime() - vnTime.getTime());

      return setTimeout(() => {
        fetchStatus();
        scheduleMidnightTimer();
      }, msUntilMidnight);
    };

    const timerId = scheduleMidnightTimer();
    return () => clearTimeout(timerId);
  }, [fetchStatus]);

  return {
    status,
    loading,
    isCheckingIn,
    evolutionModalData,
    closeEvolutionModal: () => setEvolutionModalData(null),
    checkin,
    fetchStatus,
  };
}
