import { getSupabase } from '@/lib/supabase';

export interface ExamAttemptPayload {
  documentId?: string;
  score: number;
  total: number;
  correct: number;
}

export class ActivityService {
  /**
   * Ghi nhận nhịp tim học tập an toàn vào CSDL Supabase
   * @param seconds Số giây học tập (tối đa 30s)
   */
  static async recordHeartbeat(seconds = 20): Promise<number> {
    const supabase = getSupabase();
    if (!supabase) return seconds;

    try {
      const { data, error } = await supabase.rpc('record_heartbeat', {
        p_seconds: seconds,
      });
      if (error) throw error;
      return typeof data === 'number' ? data : seconds;
    } catch {
      return seconds;
    }
  }

  /**
   * Lưu kết quả làm bài thi trắc nghiệm hoặc bài kiểm tra
   */
  static async submitExamAttempt(payload: ExamAttemptPayload): Promise<string | null> {
    const supabase = getSupabase();
    if (!supabase) return null;

    try {
      const { data, error } = await supabase.rpc('submit_exam_attempt', {
        p_document_id: payload.documentId || null,
        p_score: payload.score,
        p_total: payload.total,
        p_correct: payload.correct,
      });
      if (error) throw error;
      return data;
    } catch {
      return null;
    }
  }

  /**
   * Khởi động chu kỳ gửi heartbeat tự động mỗi 20 giây
   * Chỉ gửi khi tab đang mở (document.visibilityState === 'visible') và người dùng có tương tác
   */
  static startHeartbeat(isActive: () => boolean): () => void {
    if (typeof window === 'undefined') return () => {};

    let lastSentAt = Date.now();

    const flushRemaining = () => {
      if (!isActive()) {
        lastSentAt = Date.now();
        return;
      }
      const elapsedSec = Math.floor((Date.now() - lastSentAt) / 1000);
      if (elapsedSec >= 3) {
        lastSentAt = Date.now();
        void ActivityService.recordHeartbeat(Math.min(elapsedSec, 30));
      }
    };

    const timer = setInterval(async () => {
      if (document.visibilityState === 'visible' && isActive()) {
        lastSentAt = Date.now();
        await ActivityService.recordHeartbeat(20);
      } else {
        lastSentAt = Date.now();
      }
    }, 20000);

    const handleVisibility = () => {
      if (document.visibilityState === 'hidden') {
        flushRemaining();
      } else {
        lastSentAt = Date.now();
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('pagehide', flushRemaining);

    return () => {
      flushRemaining();
      clearInterval(timer);
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('pagehide', flushRemaining);
    };
  }
}
