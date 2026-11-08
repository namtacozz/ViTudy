import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { applyDiscordUrlMappings } from './discord/urlMappings';

const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const envKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export function getSupabaseConfig(): { url: string; anonKey: string; isConfigured: boolean } {
  const isConfigured = Boolean(
    envUrl && 
    envKey && 
    envUrl.startsWith('https://') && 
    !envUrl.includes('placeholder')
  );
  return { url: envUrl, anonKey: envKey, isConfigured };
}

let cachedClient: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  const { url, anonKey, isConfigured } = getSupabaseConfig();
  if (!isConfigured) return null;

  if (cachedClient) {
    return cachedClient;
  }

  // Khởi tạo URL mapping nếu đang chạy trong Discord Embedded Activity trước khi gọi mạng
  applyDiscordUrlMappings();

  try {
    cachedClient = createClient(url, anonKey, {
      auth: {
        flowType: 'pkce',
        detectSessionInUrl: true,
        persistSession: true,
        autoRefreshToken: true,
      },
      realtime: {
        params: {
          eventsPerSecond: 20,
        },
      },
    });
    return cachedClient;
  } catch (err) {
    console.warn('Không thể khởi tạo Supabase Client:', err);
    return null;
  }
}

export function saveSupabaseConfig(url: string, anonKey: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('vitudy_supabase_url', url.trim());
    localStorage.setItem('vitudy_supabase_anon_key', anonKey.trim());
    cachedClient = null;
  }
}

export function clearSupabaseConfig() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('vitudy_supabase_url');
    localStorage.removeItem('vitudy_supabase_anon_key');
    cachedClient = null;
  }
}
