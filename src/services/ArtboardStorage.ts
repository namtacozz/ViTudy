import { SavedDrawingAsset } from '@/types/studyspace';
import { idbGet, idbSet } from '@/lib/indexeddb';

export const DRAWING_ASSETS_KEY = 'vitudy_drawing_assets_v1';
const MAX_IMAGE_SIDE_PX = 1024;
const memoryFallbackStore = new Map<string, SavedDrawingAsset[]>();

export async function compressImageDataUrl(
  dataUrl: string,
  maxSide: number = MAX_IMAGE_SIDE_PX
): Promise<string> {
  if (
    typeof window === 'undefined' ||
    typeof document === 'undefined' ||
    !dataUrl.startsWith('data:image/') ||
    dataUrl.startsWith('data:image/svg+xml')
  ) {
    return dataUrl;
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const w = img.naturalWidth || img.width;
      const h = img.naturalHeight || img.height;
      if (!w || !h || (w <= maxSide && h <= maxSide)) {
        resolve(dataUrl);
        return;
      }
      const scale = maxSide / Math.max(w, h);
      const targetW = Math.max(1, Math.round(w * scale));
      const targetH = Math.max(1, Math.round(h * scale));
      try {
        const canvas = document.createElement('canvas');
        canvas.width = targetW;
        canvas.height = targetH;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(dataUrl);
          return;
        }
        ctx.drawImage(img, 0, 0, targetW, targetH);
        const compressed = canvas.toDataURL('image/webp', 0.85);
        resolve(compressed.startsWith('data:image/') ? compressed : canvas.toDataURL('image/png'));
      } catch {
        resolve(dataUrl);
      }
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

async function readDrawings(): Promise<SavedDrawingAsset[]> {
  if (typeof window === 'undefined') return [];
  if (typeof indexedDB !== 'undefined') {
    try {
      const idbVal = await idbGet<SavedDrawingAsset[]>(DRAWING_ASSETS_KEY);
      if (Array.isArray(idbVal)) return idbVal;
      const legacyRaw = window.localStorage.getItem(DRAWING_ASSETS_KEY);
      if (legacyRaw) {
        const parsed = JSON.parse(legacyRaw);
        if (Array.isArray(parsed)) {
          await idbSet(DRAWING_ASSETS_KEY, parsed);
          window.localStorage.removeItem(DRAWING_ASSETS_KEY);
          return parsed;
        }
      }
    } catch {
      // fall through
    }
  }
  try {
    const raw = window.localStorage.getItem(DRAWING_ASSETS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // ignore
  }
  return memoryFallbackStore.get(DRAWING_ASSETS_KEY) || [];
}

async function writeDrawings(items: SavedDrawingAsset[]): Promise<{ ok: boolean }> {
  if (typeof window === 'undefined') return { ok: true };
  if (typeof indexedDB !== 'undefined') {
    try {
      await idbSet(DRAWING_ASSETS_KEY, items);
      return { ok: true };
    } catch {
      // fallback
    }
  }
  try {
    window.localStorage.setItem(DRAWING_ASSETS_KEY, JSON.stringify(items));
    return { ok: true };
  } catch {
    memoryFallbackStore.set(DRAWING_ASSETS_KEY, items);
    return { ok: false };
  }
}

export const ArtboardStorage = {
  async listDrawings(): Promise<SavedDrawingAsset[]> {
    return readDrawings();
  },

  async saveDrawing(asset: SavedDrawingAsset): Promise<{ ok: boolean; asset: SavedDrawingAsset }> {
    const compressedDataUrl = await compressImageDataUrl(asset.dataUrl);
    const compressedImages = await Promise.all(
      (asset.images || []).map(async (img) => ({
        ...img,
        url: await compressImageDataUrl(img.url),
      }))
    );
    const normalized: SavedDrawingAsset = {
      ...asset,
      dataUrl: compressedDataUrl,
      images: compressedImages,
      updatedAt: new Date().toISOString(),
    };
    const existing = await readDrawings();
    const idx = existing.findIndex((item) => item.id === normalized.id);
    const next = idx >= 0
      ? existing.map((item, i) => (i === idx ? normalized : item))
      : [normalized, ...existing];
    const res = await writeDrawings(next);
    return { ok: res.ok, asset: normalized };
  },
};
