export type ByokProvider = 'openai' | 'gemini' | 'claude' | 'chatgpt_oauth';

const STORAGE_PREFIX = 'vitudy_byok_';
const OBFUSCATED_PREFIX = 'vtd_k1:';

function obfuscate(raw: string): string {
  try {
    const bytes = new TextEncoder().encode(raw);
    const masked = bytes.map((b, i) => b ^ ((0x5a + i * 17) & 0xff));
    let bin = '';
    masked.forEach((b) => { bin += String.fromCharCode(b); });
    return OBFUSCATED_PREFIX + btoa(bin);
  } catch {
    return raw;
  }
}

function deobfuscate(stored: string): string {
  if (!stored.startsWith(OBFUSCATED_PREFIX)) return stored;
  try {
    const bin = atob(stored.slice(OBFUSCATED_PREFIX.length));
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) {
      bytes[i] = bin.charCodeAt(i) ^ ((0x5a + i * 17) & 0xff);
    }
    return new TextDecoder().decode(bytes);
  } catch {
    return stored;
  }
}

export class ByokStore {
  static get(provider: ByokProvider): string | null {
    if (typeof window === 'undefined') return null;
    try {
      const raw =
        sessionStorage.getItem(`${STORAGE_PREFIX}${provider}`) ||
        localStorage.getItem(`${STORAGE_PREFIX}${provider}`);
      return raw ? deobfuscate(raw) : null;
    } catch {
      return null;
    }
  }

  static set(provider: ByokProvider, key: string, persist = true): void {
    if (typeof window === 'undefined') return;
    try {
      if (key && key.trim()) {
        const encoded = obfuscate(key.trim());
        sessionStorage.setItem(`${STORAGE_PREFIX}${provider}`, encoded);
        if (persist) {
          localStorage.setItem(`${STORAGE_PREFIX}${provider}`, encoded);
        } else {
          localStorage.removeItem(`${STORAGE_PREFIX}${provider}`);
        }
      } else {
        this.clear(provider);
      }
    } catch {}
  }

  static clear(provider: ByokProvider): void {
    if (typeof window === 'undefined') return;
    try {
      sessionStorage.removeItem(`${STORAGE_PREFIX}${provider}`);
      localStorage.removeItem(`${STORAGE_PREFIX}${provider}`);
    } catch {}
  }

  static has(provider: ByokProvider): boolean {
    const val = this.get(provider);
    return Boolean(val && val.trim().length > 0);
  }
}
