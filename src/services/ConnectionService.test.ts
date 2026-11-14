import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ConnectionService } from './ConnectionService';

vi.mock('@/lib/supabase', () => ({
  getSupabase: vi.fn(),
}));

describe('ConnectionService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('detects online status and reports success when Supabase responds', async () => {
    const { getSupabase } = await import('@/lib/supabase');
    (getSupabase as any).mockReturnValue({
      from: () => ({
        select: () => ({
          limit: vi.fn().mockResolvedValue({ error: null }),
        }),
      }),
    });

    const status = await ConnectionService.checkConnection();
    expect(status.isOnline).toBe(true);
    expect(status.supabaseOk).toBe(true);
    expect(status.latencyMs).toBeGreaterThanOrEqual(0);
    expect(status.message).toContain('ổn định');
  });

  it('handles Supabase connection errors gracefully', async () => {
    const { getSupabase } = await import('@/lib/supabase');
    (getSupabase as any).mockReturnValue({
      from: () => ({
        select: () => ({
          limit: vi.fn().mockRejectedValue(new Error('Network timeout')),
        }),
      }),
    });

    const status = await ConnectionService.checkConnection();
    expect(status.isOnline).toBe(true);
    expect(status.supabaseOk).toBe(false);
    expect(status.message).toContain('Không thể kết nối máy chủ CSDL');
  });
});
