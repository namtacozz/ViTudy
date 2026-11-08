import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Default / fallback keys from environment variables
const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const envKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// In-memory or local storage config support for effortless testing & production deployment
export function getSupabaseConfig(): { url: string; anonKey: string; isConfigured: boolean } {
  if (typeof window !== 'undefined') {
    const savedUrl = localStorage.getItem('vitudy_supabase_url') || envUrl;
    const savedKey = localStorage.getItem('vitudy_supabase_anon_key') || envKey;
    const isConfigured = Boolean(
      savedUrl && 
      savedKey && 
      savedUrl.startsWith('https://') && 
      !savedUrl.includes('placeholder')
    );
    return { url: savedUrl, anonKey: savedKey, isConfigured };
  }
  const isConfigured = Boolean(envUrl && envKey && envUrl.startsWith('https://'));
  return { url: envUrl, anonKey: envKey, isConfigured };
}

let cachedClient: SupabaseClient | null = null;
let lastUrl = '';
let lastKey = '';

export function getSupabase(): SupabaseClient | null {
  const { url, anonKey, isConfigured } = getSupabaseConfig();
  if (!isConfigured) return null;

  if (cachedClient && lastUrl === url && lastKey === anonKey) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(url, anonKey, {
      realtime: {
        params: {
          eventsPerSecond: 20
        }
      }
    });
    lastUrl = url;
    lastKey = anonKey;
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
    cachedClient = null; // reset cached instance
  }
}

export function clearSupabaseConfig() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('vitudy_supabase_url');
    localStorage.removeItem('vitudy_supabase_anon_key');
    cachedClient = null;
  }
}
