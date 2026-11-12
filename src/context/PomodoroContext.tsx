'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { ActivityService } from '@/services/ActivityService';

interface PomodoroState {
  status: 'idle' | 'running' | 'paused' | 'completed';
  mode: 'work' | 'short_break' | 'long_break';
  durationMinutes: number;
  remainingSeconds: number;
  endsAt: number | null; // Mốc timestamp kết thúc phiên
}

interface PomodoroContextType {
  state: PomodoroState;
  startSession: (minutes?: number) => void;
  pauseSession: () => void;
  resumeSession: () => void;
  stopSession: () => void;
  formattedTime: string;
}

const STORAGE_KEY = 'vitudy_pomodoro_state';

const defaultState: PomodoroState = {
  status: 'idle',
  mode: 'work',
  durationMinutes: 25,
  remainingSeconds: 25 * 60,
  endsAt: null,
};

const PomodoroContext = createContext<PomodoroContextType | null>(null);

export function PomodoroProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<PomodoroState>(defaultState);
  const recordedSessionRef = useRef<boolean>(false);

  // Khôi phục trạng thái từ localStorage khi khởi động
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed: PomodoroState = JSON.parse(saved);
        if (parsed.status === 'running' && parsed.endsAt) {
          const now = Date.now();
          const left = Math.max(0, Math.round((parsed.endsAt - now) / 1000));
          if (left > 0) {
            setState({ ...parsed, remainingSeconds: left });
          } else {
            setState({ ...parsed, status: 'completed', remainingSeconds: 0 });
          }
        } else {
          setState(parsed);
        }
      }
    } catch {}
  }, []);

  // Lưu vào localStorage khi trạng thái thay đổi
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {}
  }, [state]);

  // Bộ đếm đếm lùi thời gian thực dựa vào mốc endsAt
  useEffect(() => {
    if (state.status !== 'running' || !state.endsAt) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const left = Math.max(0, Math.round((state.endsAt! - now) / 1000));

      if (left <= 0) {
        clearInterval(interval);
        setState(prev => ({
          ...prev,
          status: 'completed',
          remainingSeconds: 0,
          endsAt: null
        }));

        // Ghi nhận thời gian học vào nhật ký (chỉ ghi 1 lần cho mỗi phiên)
        if (!recordedSessionRef.current) {
          recordedSessionRef.current = true;
          ActivityService.recordHeartbeat(state.durationMinutes).catch(() => {});
          try {
            // Phát âm thanh hoặc thông báo nếu trình duyệt hỗ trợ
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification('ViTudy - Hoàn thành phiên học!', {
                body: `Chúc mừng bạn đã hoàn thành trọn vẹn ${state.durationMinutes} phút tập trung.`,
              });
            }
          } catch {}
        }
      } else {
        setState(prev => ({ ...prev, remainingSeconds: left }));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [state.status, state.endsAt, state.durationMinutes]);

  const startSession = useCallback((minutes = 25) => {
    recordedSessionRef.current = false;
    const durationSec = minutes * 60;
    const endsAt = Date.now() + durationSec * 1000;
    setState({
      status: 'running',
      mode: 'work',
      durationMinutes: minutes,
      remainingSeconds: durationSec,
      endsAt,
    });
  }, []);

  const pauseSession = useCallback(() => {
    if (state.status !== 'running' || !state.endsAt) return;
    const now = Date.now();
    const left = Math.max(0, Math.round((state.endsAt - now) / 1000));
    setState(prev => ({
      ...prev,
      status: 'paused',
      remainingSeconds: left,
      endsAt: null,
    }));
  }, [state.status, state.endsAt]);

  const resumeSession = useCallback(() => {
    if (state.status !== 'paused') return;
    const endsAt = Date.now() + state.remainingSeconds * 1000;
    setState(prev => ({
      ...prev,
      status: 'running',
      endsAt,
    }));
  }, [state.status, state.remainingSeconds]);

  const stopSession = useCallback(() => {
    setState({
      status: 'idle',
      mode: 'work',
      durationMinutes: 25,
      remainingSeconds: 25 * 60,
      endsAt: null,
    });
  }, []);

  const mins = Math.floor(state.remainingSeconds / 60);
  const secs = state.remainingSeconds % 60;
  const formattedTime = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  return (
    <PomodoroContext.Provider
      value={{
        state,
        startSession,
        pauseSession,
        resumeSession,
        stopSession,
        formattedTime,
      }}
    >
      {children}
    </PomodoroContext.Provider>
  );
}

export function usePomodoroContext() {
  const ctx = useContext(PomodoroContext);
  if (!ctx) {
    throw new Error('usePomodoroContext must be used within PomodoroProvider');
  }
  return ctx;
}
