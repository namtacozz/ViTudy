import { getSupabase } from '@/lib/supabase';

export interface ConnectionStatus {
  isOnline: boolean;
  supabaseOk: boolean;
  latencyMs: number;
  message: string;
}

export class ConnectionService {
  /**
   * Kiểm tra nhanh trạng thái kết nối mạng và Supabase Cloud
   */
  static async checkConnection(): Promise<ConnectionStatus> {
    const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
    if (!isOnline) {
      return {
        isOnline: false,
        supabaseOk: false,
        latencyMs: -1,
        message: 'Thiết bị đang ngắt kết nối mạng Internet.',
      };
    }

    const supabase = getSupabase();
    if (!supabase) {
      return {
        isOnline: true,
        supabaseOk: false,
        latencyMs: -1,
        message: 'Chưa cấu hình Supabase Client.',
      };
    }

    const start = Date.now();
    try {
      // Ping nhẹ vào bảng study_spaces với limit 1
      const { error } = await supabase.from('study_spaces').select('id').limit(1);
      const latencyMs = Date.now() - start;

      if (error && !error.message.includes('permission denied')) {
        return {
          isOnline: true,
          supabaseOk: false,
          latencyMs,
          message: `Lỗi kết nối máy chủ CSDL: ${error.message}`,
        };
      }

      return {
        isOnline: true,
        supabaseOk: true,
        latencyMs,
        message: `Kết nối máy chủ Supabase ổn định (${latencyMs}ms).`,
      };
    } catch (err: any) {
      const latencyMs = Date.now() - start;
      return {
        isOnline: true,
        supabaseOk: false,
        latencyMs,
        message: `Không thể kết nối máy chủ CSDL: ${err?.message || 'Timeout'}`,
      };
    }
  }
}
