import { describe, it, expect, vi, beforeEach } from 'vitest';
import { askAi, exchangeOpenAiCode, ensureValidOpenAiSession } from './aiClient';
import { savePendingPkce, saveOpenAiOAuthSession, getOpenAiOAuthSession } from './openaiOAuth';

function createFakeJwt(payloadObj: Record<string, unknown>): string {
  const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(JSON.stringify(payloadObj)).toString('base64url');
  return `${header}.${payload}.fakesignature`;
}

describe('aiClient', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('should return simulated response gracefully when supabase is null or no session', async () => {
    const res = await askAi({
      provider: 'system',
      prompt: 'Giải thích định lý Pythagoras',
      context: 'Tam giác vuông',
    });

    expect(res.reply).toContain('ViTudy');
    expect(res.provider).toBe('system');
  });

  it('should call direct Gemini if BYOK and apiKey is supplied without session', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        candidates: [{ content: { parts: [{ text: 'Định lý Pythagoras là a^2 + b^2 = c^2' }] } }],
      }),
    });
    vi.stubGlobal('fetch', mockFetch);

    const res = await askAi({
      provider: 'byok_gemini',
      apiKey: 'test-gemini-key',
      prompt: 'Pythagoras là gì',
    });

    expect(mockFetch).toHaveBeenCalled();
    expect(res.reply).toBe('Định lý Pythagoras là a^2 + b^2 = c^2');
  });

  it('exchanges OpenAI PKCE callback URL for access_token & refresh_token and stores session', async () => {
    savePendingPkce({ codeVerifier: 'verifier_pkce_secret_123', state: 'st_match_99' });

    const fakeJwt = createFakeJwt({
      exp: Math.floor(Date.now() / 1000) + 3600,
      'https://api.openai.com/auth': { chatgpt_account_id: 'acc_pkce_01', chatgpt_plan_type: 'plus' },
      'https://api.openai.com/profile': { email: 'user@vitudy.edu.vn' },
    });

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        access_token: fakeJwt,
        refresh_token: 'rt_new_999',
        expires_in: 3600,
      }),
    });
    vi.stubGlobal('fetch', mockFetch);

    const session = await exchangeOpenAiCode(
      'http://localhost:1455/auth/callback?code=ac_code_777&state=st_match_99'
    );

    expect(session.accessToken).toBe(fakeJwt);
    expect(session.refreshToken).toBe('rt_new_999');
    expect(session.accountId).toBe('acc_pkce_01');
    expect(session.email).toBe('user@vitudy.edu.vn');
    expect(getOpenAiOAuthSession()?.accountId).toBe('acc_pkce_01');
  });

  it('automatically refreshes expired OpenAI OAuth token via ensureValidOpenAiSession', async () => {
    const expiredJwt = createFakeJwt({
      exp: Math.floor(Date.now() / 1000) - 600, // expired 10 mins ago
      'https://api.openai.com/auth': { chatgpt_account_id: 'acc_refresh_01' },
    });

    const freshJwt = createFakeJwt({
      exp: Math.floor(Date.now() / 1000) + 7200,
      'https://api.openai.com/auth': { chatgpt_account_id: 'acc_refresh_01' },
    });

    saveOpenAiOAuthSession({
      accessToken: expiredJwt,
      refreshToken: 'rt_valid_token',
      expiresAt: Date.now() - 600_000,
      updatedAt: Date.now() - 4000_000,
    });

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        access_token: freshJwt,
        refresh_token: 'rt_rotated_token',
        expires_in: 7200,
      }),
    });
    vi.stubGlobal('fetch', mockFetch);

    const updated = await ensureValidOpenAiSession();
    expect(updated?.accessToken).toBe(freshJwt);
    expect(updated?.refreshToken).toBe('rt_rotated_token');
  });
});
