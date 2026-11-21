import crypto from 'crypto';

export interface PetStreakCookieData {
  current_streak: number;
  longest_streak: number;
  last_checkin_date: string;
}

function getPetCookieSecret(): string {
  return (
    process.env.PET_COOKIE_SECRET ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    'vitudy-pet-dev-secret'
  );
}

function signPayload(payloadB64: string): string {
  return crypto
    .createHmac('sha256', getPetCookieSecret())
    .update(payloadB64)
    .digest('base64url');
}

export function encodeSignedPetCookie(data: PetStreakCookieData): string {
  const payloadB64 = Buffer.from(JSON.stringify(data), 'utf8').toString('base64url');
  const sig = signPayload(payloadB64);
  return `${payloadB64}.${sig}`;
}

export function decodeSignedPetCookie(rawCookieHeader: string): PetStreakCookieData | null {
  const match = rawCookieHeader.match(/vitudy_pet_streak=([^;]+)/);
  if (!match) return null;
  const raw = decodeURIComponent(match[1]);
  const dotIdx = raw.indexOf('.');
  if (dotIdx <= 0) return null;

  const payloadB64 = raw.slice(0, dotIdx);
  const sig = raw.slice(dotIdx + 1);
  const expectedSig = signPayload(payloadB64);

  const sigBuf = Buffer.from(sig, 'utf8');
  const expectedBuf = Buffer.from(expectedSig, 'utf8');
  if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) {
    return null;
  }

  try {
    const parsed = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8'));
    return {
      current_streak: Math.max(0, Number(parsed.current_streak) || 0),
      longest_streak: Math.max(0, Number(parsed.longest_streak) || 0),
      last_checkin_date: typeof parsed.last_checkin_date === 'string' ? parsed.last_checkin_date : '',
    };
  } catch {
    return null;
  }
}
