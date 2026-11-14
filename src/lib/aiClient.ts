import { getSupabase } from './supabase';
import { AiProvider } from '@/types/vitoken';
import { ByokStore } from './byokStore';
import {
  OPENAI_OAUTH_CLIENT_ID,
  OPENAI_OAUTH_REDIRECT_URI,
  OPENAI_TOKEN_URL,
  OpenAiOAuthSession,
  parseOpenAiCallbackInput,
  getPendingPkce,
  clearPendingPkce,
  saveOpenAiOAuthSession,
  getOpenAiOAuthSession,
  isOpenAiSessionExpired,
} from './openaiOAuth';

export interface AskAiRequest {
  provider: AiProvider;
  model?: string;
  prompt: string;
  context?: string;
  apiKey?: string;
  accessToken?: string;
  maxTokens?: number;
  requestId?: string;
}

export interface AskAiResult {
  reply: string;
  provider: string;
  balanceAfter?: number;
}

async function getSupabaseAuthHeader(): Promise<string> {
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        return session.access_token;
      }
    } catch {}
  }
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
}

export async function refreshOpenAiSession(refreshToken: string): Promise<OpenAiOAuthSession> {
  const cleanRefresh = refreshToken.trim();
  const existing = getOpenAiOAuthSession();

  // 1. Direct call to auth.openai.com/oauth/token (supports CORS *)
  try {
    const res = await fetch(OPENAI_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        grant_type: 'refresh_token',
        client_id: OPENAI_OAUTH_CLIENT_ID,
        refresh_token: cleanRefresh,
      }),
    });

    const data = await res.json().catch(() => ({}));
    if (res.ok && data.access_token) {
      const expiresAt =
        typeof data.expires_in === 'number'
          ? Date.now() + data.expires_in * 1000
          : undefined;
      return saveOpenAiOAuthSession({
        accessToken: data.access_token,
        refreshToken: data.refresh_token || cleanRefresh,
        accountId: existing?.accountId,
        email: existing?.email,
        planType: existing?.planType,
        expiresAt,
        updatedAt: Date.now(),
      });
    }
  } catch {
    // Fall through to Edge Function proxy
  }

  // 2. Fallback via Supabase Edge Function
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const authHeader = await getSupabaseAuthHeader();
  if (supabaseUrl && authHeader) {
    const edgeRes = await fetch(`${supabaseUrl}/functions/v1/ai-chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authHeader}`,
      },
      body: JSON.stringify({
        action: 'refresh_openai_token',
        refreshToken: cleanRefresh,
      }),
    });
    const edgeData = await edgeRes.json().catch(() => ({}));
    if (edgeRes.ok && edgeData.access_token) {
      const expiresAt =
        typeof edgeData.expires_in === 'number'
          ? Date.now() + edgeData.expires_in * 1000
          : undefined;
      return saveOpenAiOAuthSession({
        accessToken: edgeData.access_token,
        refreshToken: edgeData.refresh_token || cleanRefresh,
        accountId: edgeData.account_id || existing?.accountId,
        email: existing?.email,
        planType: existing?.planType,
        expiresAt,
        updatedAt: Date.now(),
      });
    }
    throw new Error(edgeData.message || 'Không thể gia hạn phiên ChatGPT OAuth.');
  }

  throw new Error('Phiên đăng nhập ChatGPT đã hết hạn. Vui lòng kết nối lại.');
}

export async function exchangeOpenAiCode(rawInput: string): Promise<OpenAiOAuthSession> {
  const parsed = parseOpenAiCallbackInput(rawInput);

  if (parsed.kind === 'error') {
    throw new Error(parsed.message);
  }

  if (parsed.kind === 'session') {
    clearPendingPkce();
    return saveOpenAiOAuthSession({
      accessToken: parsed.accessToken,
      refreshToken: parsed.refreshToken,
      accountId: parsed.accountId,
      updatedAt: Date.now(),
    });
  }

  if (parsed.kind === 'jwt') {
    clearPendingPkce();
    return saveOpenAiOAuthSession({
      accessToken: parsed.accessToken,
      updatedAt: Date.now(),
    });
  }

  // parsed.kind === 'code'
  const pending = getPendingPkce();
  if (!pending || !pending.codeVerifier) {
    throw new Error(
      'Chưa tìm thấy phiên khởi tạo PKCE. Vui lòng bấm "1. Mở trang Đăng nhập ChatGPT" trước, rồi dán lại đường dẫn Callback URL.'
    );
  }

  if (parsed.state && pending.state && parsed.state !== pending.state) {
    throw new Error(
      'Mã bảo mật (state) trong URL không khớp với lần mở đăng nhập gần nhất. Vui lòng bấm lại "1. Mở trang Đăng nhập ChatGPT".'
    );
  }

  // 1. Direct PKCE token exchange with auth.openai.com/oauth/token
  let tokenErrorMsg = '';
  try {
    const res = await fetch(OPENAI_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        client_id: OPENAI_OAUTH_CLIENT_ID,
        code: parsed.code,
        redirect_uri: OPENAI_OAUTH_REDIRECT_URI,
        code_verifier: pending.codeVerifier,
      }),
    });

    const data = await res.json().catch(() => ({}));
    if (res.ok && data.access_token) {
      clearPendingPkce();
      const expiresAt =
        typeof data.expires_in === 'number'
          ? Date.now() + data.expires_in * 1000
          : undefined;
      return saveOpenAiOAuthSession({
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresAt,
        updatedAt: Date.now(),
      });
    }
    tokenErrorMsg =
      data.error_description || data.error?.message || data.error || `HTTP ${res.status}`;
  } catch (err: any) {
    tokenErrorMsg = err?.message || 'Lỗi kết nối máy chủ OpenAI Auth';
  }

  // 2. Fallback via Supabase Edge Function
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const authHeader = await getSupabaseAuthHeader();
  if (supabaseUrl && authHeader) {
    const edgeRes = await fetch(`${supabaseUrl}/functions/v1/ai-chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authHeader}`,
      },
      body: JSON.stringify({
        action: 'exchange_openai_code',
        code: parsed.code,
        codeVerifier: pending.codeVerifier,
        redirectUri: OPENAI_OAUTH_REDIRECT_URI,
      }),
    });

    const edgeData = await edgeRes.json().catch(() => ({}));
    if (edgeRes.ok && edgeData.access_token) {
      clearPendingPkce();
      const expiresAt =
        typeof edgeData.expires_in === 'number'
          ? Date.now() + edgeData.expires_in * 1000
          : undefined;
      return saveOpenAiOAuthSession({
        accessToken: edgeData.access_token,
        refreshToken: edgeData.refresh_token,
        accountId: edgeData.account_id,
        expiresAt,
        updatedAt: Date.now(),
      });
    }
    if (edgeData.message) {
      tokenErrorMsg = edgeData.message;
    }
  }

  throw new Error(
    `Không thể đổi mã ủy quyền OpenAI (${tokenErrorMsg || 'Mã code đã hết hạn hoặc đã được sử dụng'}). Vui lòng bấm mở lại trang đăng nhập.`
  );
}

export async function ensureValidOpenAiSession(): Promise<OpenAiOAuthSession | null> {
  const session = getOpenAiOAuthSession();
  if (!session) return null;

  if (isOpenAiSessionExpired(session)) {
    if (session.refreshToken) {
      try {
        return await refreshOpenAiSession(session.refreshToken);
      } catch {
        return session;
      }
    }
  }
  return session;
}

export async function askAi(req: AskAiRequest): Promise<AskAiResult> {
  const supabase = getSupabase();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  // Tự động nạp API key từ ByokStore nếu chưa truyền
  const resolvedApiKey =
    req.apiKey ||
    (req.provider === 'byok_openai'
      ? ByokStore.get('openai')
      : req.provider === 'byok_gemini'
      ? ByokStore.get('gemini')
      : req.provider === 'byok_claude'
      ? ByokStore.get('claude')
      : undefined) ||
    undefined;

  // Nếu là oauth_chatgpt, tự động đảm bảo token còn hạn (auto-refresh nếu cần)
  let resolvedOAuthToken = req.accessToken || '';
  let resolvedAccountId = '';
  if (req.provider === 'oauth_chatgpt') {
    const oauthSession = await ensureValidOpenAiSession();
    if (oauthSession) {
      resolvedOAuthToken = oauthSession.accessToken;
      resolvedAccountId = oauthSession.accountId || '';
    }
  }

  // Lấy access token hiện tại của người dùng (hoặc anon key cho chế độ BYOK / OAuth)
  let jwtToken = '';
  if (supabase) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      jwtToken = session?.access_token || '';
    } catch {}
  }

  if (req.provider === 'byok_gemini' && resolvedApiKey && (!supabaseUrl || !jwtToken)) {
    return callDirectGemini({ ...req, apiKey: resolvedApiKey });
  }

  if (req.provider === 'byok_openai' && resolvedApiKey && (!supabaseUrl || !jwtToken)) {
    return callDirectOpenAi({ ...req, apiKey: resolvedApiKey });
  }

  if (req.provider === 'byok_claude' && resolvedApiKey && (!supabaseUrl || !jwtToken)) {
    return callDirectClaude({ ...req, apiKey: resolvedApiKey });
  }

  const authBearer = jwtToken || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  // Nếu chưa đăng nhập và đang ở chế độ system (hoặc chưa cấu hình Supabase)
  if (!supabaseUrl || (!jwtToken && req.provider === 'system')) {
    return {
      reply: `[ViTudy Trợ Lý Học Tập - Chế độ Trải nghiệm]
Dựa trên tài liệu bạn đang học:
${req.context ? `"${req.context.slice(0, 150)}..."` : 'Chủ đề: ' + req.prompt}

Giải đáp:
1. Trọng tâm: Đây là kiến thức cốt lõi. Hãy chú ý ghi chú các khái niệm định nghĩa và công thức chính.
2. Lời khuyên: Đăng nhập để sử dụng toàn bộ tính năng phân tích chuyên sâu của AI và nhận 50 ViToken miễn phí!`,
      provider: req.provider,
    };
  }

  const endpoint = `${supabaseUrl}/functions/v1/ai-chat`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authBearer}`,
    },
    body: JSON.stringify({
      provider: req.provider,
      model: req.model || 'gpt-4o-mini',
      prompt: req.prompt,
      context: req.context || '',
      apiKey: resolvedApiKey || '',
      accessToken: resolvedOAuthToken,
      accountId: resolvedAccountId,
      maxTokens: req.maxTokens,
      requestId: req.requestId,
    }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (response.status === 429) {
      throw new Error(data.message || 'Bạn đã dùng hết hạn mức AI trong giờ này. Vui lòng thử lại sau.');
    }
    if (response.status === 402) {
      throw new Error('Số dư ViToken không đủ để thực hiện yêu cầu này. Vui lòng nạp thêm ViToken.');
    }
    const errorMsg = data.details
      ? `${data.message || 'Lỗi AI Gateway'} (${data.details})`
      : data.message || data.error || `Lỗi AI Gateway (${response.status})`;
    throw new Error(errorMsg);
  }

  return {
    reply: data.reply || 'Không nhận được câu trả lời từ AI.',
    provider: data.provider || req.provider,
    balanceAfter: data.balanceAfter,
  };
}

export async function refundAiRequest(
  requestId: string
): Promise<{ refunded: boolean; balanceAfter?: number }> {
  const supabase = getSupabase();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl || !requestId) return { refunded: false };

  let jwtToken = '';
  if (supabase) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      jwtToken = session?.access_token || '';
    } catch {}
  }
  if (!jwtToken) return { refunded: false };

  try {
    const res = await fetch(`${supabaseUrl}/functions/v1/ai-chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwtToken}`,
      },
      body: JSON.stringify({
        action: 'refund_ai_request',
        requestId,
      }),
    });
    const data = await res.json().catch(() => ({}));
    return {
      refunded: Boolean(data.refunded),
      balanceAfter: typeof data.balanceAfter === 'number' ? data.balanceAfter : undefined,
    };
  } catch {
    return { refunded: false };
  }
}

async function callDirectGemini(req: AskAiRequest): Promise<AskAiResult> {
  const model = req.model?.includes('gemini') ? req.model : 'gemini-1.5-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${req.apiKey}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [{ text: `${req.context ? `NGỮ CẢNH:\n${req.context}\n\n` : ''}CÂU HỎI:\n${req.prompt}` }],
        },
      ],
      generationConfig: { maxOutputTokens: 800 },
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Google Gemini lỗi (${res.status}): ${errText.slice(0, 150)}`);
  }

  const data = await res.json();
  const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Không có phản hồi từ Gemini.';
  return { reply, provider: 'byok_gemini' };
}

async function callDirectOpenAi(req: AskAiRequest): Promise<AskAiResult> {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${req.apiKey}`,
    },
    body: JSON.stringify({
      model: req.model || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'Bạn là trợ lý học tập ViTudy thông minh, giải thích ngắn gọn, chính xác.' },
        { role: 'user', content: req.context ? `NGỮ CẢNH:\n${req.context}\n\nCÂU HỎI:\n${req.prompt}` : req.prompt },
      ],
      max_tokens: 800,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`OpenAI lỗi (${res.status}): ${errText.slice(0, 150)}`);
  }

  const data = await res.json();
  const reply = data.choices?.[0]?.message?.content || 'Không có phản hồi từ OpenAI.';
  return { reply, provider: 'byok_openai' };
}

async function callDirectClaude(req: AskAiRequest): Promise<AskAiResult> {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': req.apiKey || '',
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: req.model || 'claude-3-5-sonnet-latest',
      max_tokens: req.maxTokens || 1024,
      system: 'Bạn là trợ lý học tập ViTudy thông minh, giải thích ngắn gọn, chính xác.',
      messages: [
        { role: 'user', content: req.context ? `NGỮ CẢNH:\n${req.context}\n\nCÂU HỎI:\n${req.prompt}` : req.prompt },
      ],
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Anthropic Claude lỗi (${res.status}): ${errText.slice(0, 150)}`);
  }

  const data = await res.json();
  const reply = data.content?.[0]?.text || 'Không có phản hồi từ Claude.';
  return { reply, provider: 'byok_claude' };
}

export async function testAiConnection(params: {
  provider: AiProvider;
  model: string;
  apiKey?: string;
  accessToken?: string;
}): Promise<{ success: boolean; latencyMs: number; message: string }> {
  const startTime = Date.now();
  try {
    if (params.provider === 'byok_claude') {
      if (!params.apiKey || !params.apiKey.trim()) {
        throw new Error('Vui lòng nhập Anthropic Claude API Key trước khi kiểm tra.');
      }
      await callDirectClaude({
        provider: 'byok_claude',
        model: params.model,
        apiKey: params.apiKey.trim(),
        prompt: 'Kiểm tra kết nối. Trả lời đúng 1 từ: OK',
        maxTokens: 16,
      });
      const latency = Date.now() - startTime;
      return {
        success: true,
        latencyMs: latency,
        message: `Anthropic Claude sẵn sàng! Mô hình ${params.model} phản hồi sau ${latency}ms.`,
      };
    }

    if (params.provider === 'system') {
      const res = await askAi({
        provider: 'system',
        model: params.model,
        prompt: 'Kiểm tra hệ thống ViTudy. Trả lời đúng 1 từ: OK',
      });
      const latency = Date.now() - startTime;
      return {
        success: true,
        latencyMs: latency,
        message: `Hệ thống ViTudy sẵn sàng! Mô hình ${params.model} phản hồi sau ${latency}ms.`,
      };
    }

    if (params.provider === 'byok_gemini') {
      if (!params.apiKey || !params.apiKey.trim()) {
        throw new Error('Vui lòng nhập Google Gemini API Key trước khi kiểm tra.');
      }
      const model = params.model?.includes('gemini') ? params.model : 'gemini-2.5-flash';
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${params.apiKey.trim()}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: 'Trả lời ngắn: OK' }] }],
          generationConfig: { maxOutputTokens: 10 },
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        const msg = err.error?.message || `Lỗi HTTP ${res.status}`;
        throw new Error(`Gemini API: ${msg}`);
      }
      return {
        success: true,
        latencyMs: Date.now() - startTime,
        message: `Kết nối thành công! Gemini (${model}) phản hồi sau ${Date.now() - startTime}ms.`,
      };
    }

    if (params.provider === 'byok_openai') {
      if (!params.apiKey || !params.apiKey.trim()) {
        throw new Error('Vui lòng nhập OpenAI API Key trước khi kiểm tra.');
      }
      const model = params.model || 'gpt-4o-mini';
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${params.apiKey.trim()}`,
        },
        body: JSON.stringify({
          model,
          messages: [{ role: 'user', content: 'Trả lời: OK' }],
          max_tokens: 5,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        const msg = err.error?.message || `Lỗi HTTP ${res.status}`;
        throw new Error(`OpenAI API: ${msg}`);
      }
      return {
        success: true,
        latencyMs: Date.now() - startTime,
        message: `Kết nối thành công! OpenAI (${model}) phản hồi sau ${Date.now() - startTime}ms.`,
      };
    }

    if (params.provider === 'oauth_chatgpt') {
      const candidateInput = (params.accessToken || params.apiKey || '').trim();
      let session = getOpenAiOAuthSession();

      // Nếu người dùng vừa dán Callback URL hoặc mã mới vào ô input, thực hiện đổi sang session ngay
      if (candidateInput && (!session || candidateInput !== session.accessToken)) {
        const parsed = parseOpenAiCallbackInput(candidateInput);
        if (parsed.kind === 'code' || parsed.kind === 'session' || parsed.kind === 'jwt') {
          session = await exchangeOpenAiCode(candidateInput);
        }
      }

      session = await ensureValidOpenAiSession();
      if (!session || !session.accessToken) {
        throw new Error(
          'Chưa kết nối tài khoản ChatGPT. Vui lòng thực hiện Bước 1 (Mở trang đăng nhập) và Bước 2 (Dán URL Callback).'
        );
      }

      // Gửi truy vấn thực tế qua askAi để đo độ trễ thực và kiểm tra mô hình ChatGPT
      await askAi({
        provider: 'oauth_chatgpt',
        model: params.model,
        prompt: 'Kiểm tra kết nối mô hình. Trả lời đúng 1 từ: OK',
      });

      const accountLabel = session.email
        ? session.email
        : session.accountId
        ? `ID: ${session.accountId.slice(0, 8)}...`
        : 'Đã xác thực';
      const planBadge = session.planType ? ` (${session.planType.toUpperCase()})` : '';
      const latency = Date.now() - startTime;
      const latencySec = (latency / 1000).toFixed(1);

      return {
        success: true,
        latencyMs: latency,
        message: `Hoạt động tốt · Phản hồi trong ${latencySec}s (${params.model} - ${accountLabel}${planBadge})`,
      };
    }

    return {
      success: true,
      latencyMs: Date.now() - startTime,
      message: 'Cấu hình hợp lệ.',
    };
  } catch (err: any) {
    return {
      success: false,
      latencyMs: Date.now() - startTime,
      message: err.message || 'Kiểm tra thất bại.',
    };
  }
}

/**
 * Trích xuất an toàn mảng câu hỏi JSON từ chuỗi kết quả AI,
 * hỗ trợ khôi phục các câu hỏi hoàn chỉnh kể cả khi đầu ra bị cắt ngắn (partial JSON)
 */
export function parseQuizJsonSafely(rawText: string): any[] {
  if (!rawText) return [];

  // 1. Thử parse toàn bộ khối [ ... ]
  const match = rawText.match(/\[[\s\S]*\]/);
  if (match) {
    try {
      const parsed = JSON.parse(match[0]);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    } catch {}
  }

  // 2. Nếu chuỗi bị cắt cụt (partial JSON), trích xuất từng object {...} hoàn chỉnh
  const questionObjects: any[] = [];
  let depth = 0;
  let startIndex = -1;
  let inString = false;
  let escapeNext = false;

  for (let i = 0; i < rawText.length; i++) {
    const ch = rawText[i];
    if (escapeNext) {
      escapeNext = false;
      continue;
    }
    if (ch === '\\') {
      escapeNext = true;
      continue;
    }
    if (ch === '"') {
      inString = !inString;
      continue;
    }
    if (inString) continue;

    if (ch === '{') {
      if (depth === 0) startIndex = i;
      depth++;
    } else if (ch === '}') {
      depth--;
      if (depth === 0 && startIndex !== -1) {
        const jsonBlock = rawText.slice(startIndex, i + 1);
        try {
          const candidate = JSON.parse(jsonBlock);
          if (candidate.question && Array.isArray(candidate.options)) {
            questionObjects.push(candidate);
          }
        } catch {}
        startIndex = -1;
      }
    }
  }

  return questionObjects;
}
