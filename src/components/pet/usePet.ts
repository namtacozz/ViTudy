'use client';

import { useState, useEffect, useCallback } from 'react';
import { getAssetPath } from '@/lib/assets';

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
      const url = getAssetPath('/api/pet/status');
      const res = await fetch(url, {
        headers: { 'Content-Type': 'application/json' },
      });
      if (res.ok) {
        const data: PetStatus = await res.json();
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
      const url = getAssetPath('/api/pet/checkin');
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!res.ok) throw new Error('Check-in failed');

      const result: CheckinResult = await res.json();
      setStatus(result);

      if (result.evolved) {
        setEvolutionModalData({ newStage: result.new_stage });
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
