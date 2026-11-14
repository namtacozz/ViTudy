import { BoardGamePackage, SavedDrawingAsset } from '@/types/boardgame';
import { idbGet, idbSet } from '@/lib/indexeddb';

export const DRAWING_ASSETS_KEY = 'vitudy_drawing_assets_v1';
export const BOARD_GAMES_KEY = 'vitudy_board_game_cabinet_v1';
const MAX_IMAGE_SIDE_PX = 1024;

const memoryFallbackStore = new Map<string, unknown>();

function isQuotaError(err: unknown): boolean {
  if (!err || typeof err !== 'object') return false;
  const e = err as { name?: string; message?: string; code?: number };
  return (
    e.name === 'QuotaExceededError' ||
    e.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
    e.code === 22 ||
    e.code === 1014 ||
    Boolean(e.message && /quota/i.test(e.message))
  );
}

/**
 * Nén / giới hạn kích thước ảnh (cạnh dài nhất tối đa 1024px) trước khi lưu.
 */
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

async function readStore<T>(key: string): Promise<T[]> {
  if (typeof window === 'undefined') return [];

  if (typeof indexedDB !== 'undefined') {
    try {
      const idbVal = await idbGet<T[]>(key);
      if (Array.isArray(idbVal)) return idbVal;

      // Di trú dữ liệu cũ từ localStorage sang IndexedDB nếu có
      try {
        const legacyRaw = window.localStorage.getItem(key);
        if (legacyRaw) {
          const parsed = JSON.parse(legacyRaw);
          if (Array.isArray(parsed)) {
            await idbSet(key, parsed);
            const verified = await idbGet<T[]>(key);
            if (Array.isArray(verified) && verified.length === parsed.length) {
              window.localStorage.removeItem(key);
            }
            return parsed as T[];
          }
        }
      } catch {}

      return [];
    } catch {
      // Fallback xuống memory / localStorage nếu IDB bị chặn
    }
  }

  if (memoryFallbackStore.has(key)) {
    return (memoryFallbackStore.get(key) as T[]) || [];
  }

  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

async function writeStore<T>(
  key: string,
  items: T[]
): Promise<{ ok: boolean; error?: string }> {
  if (typeof window === 'undefined') return { ok: true };

  if (typeof indexedDB !== 'undefined') {
    try {
      await idbSet(key, items);
      return { ok: true };
    } catch (err) {
      if (isQuotaError(err)) {
        return {
          ok: false,
          error:
            'Bộ nhớ IndexedDB đã đầy (QuotaExceeded). Vui lòng xóa bớt bản vẽ hoặc game cũ rồi thử lại.',
        };
      }
    }
  }

  try {
    memoryFallbackStore.set(key, items);
    window.localStorage.setItem(key, JSON.stringify(items));
    return { ok: true };
  } catch (err) {
    if (isQuotaError(err)) {
      return {
        ok: false,
        error:
          'Bộ nhớ trình duyệt đã đầy (QuotaExceeded). Vui lòng xóa bớt bản vẽ hoặc game cũ.',
      };
    }
    return { ok: false, error: 'Không thể lưu dữ liệu vào bộ nhớ trình duyệt.' };
  }
}

export interface StorageSaveResult<T> {
  ok: boolean;
  items: T[];
  error?: string;
}

export const GameCabinetStorage = {
  async listDrawings(): Promise<SavedDrawingAsset[]> {
    return readStore<SavedDrawingAsset>(DRAWING_ASSETS_KEY);
  },

  async saveDrawing(asset: SavedDrawingAsset): Promise<StorageSaveResult<SavedDrawingAsset>> {
    const compressedDataUrl = await compressImageDataUrl(asset.dataUrl, MAX_IMAGE_SIDE_PX);
    const compressedImages = await Promise.all(
      (asset.images || []).map(async (img) => ({
        ...img,
        url: await compressImageDataUrl(img.url, MAX_IMAGE_SIDE_PX),
      }))
    );

    const sanitizedAsset: SavedDrawingAsset = {
      ...asset,
      dataUrl: compressedDataUrl,
      images: compressedImages,
      updatedAt: new Date().toISOString(),
    };

    const list = await this.listDrawings();
    const idx = list.findIndex((x) => x.id === sanitizedAsset.id);
    const next = [...list];
    if (idx >= 0) {
      next[idx] = sanitizedAsset;
    } else {
      next.unshift(sanitizedAsset);
    }

    const writeRes = await writeStore(DRAWING_ASSETS_KEY, next);
    if (!writeRes.ok) {
      return { ok: false, items: list, error: writeRes.error };
    }
    return { ok: true, items: next };
  },

  async deleteDrawing(id: string): Promise<SavedDrawingAsset[]> {
    const list = await this.listDrawings();
    const next = list.filter((x) => x.id !== id);
    await writeStore(DRAWING_ASSETS_KEY, next);
    return next;
  },

  async listGames(): Promise<BoardGamePackage[]> {
    return readStore<BoardGamePackage>(BOARD_GAMES_KEY);
  },

  async saveGame(pkg: BoardGamePackage): Promise<StorageSaveResult<BoardGamePackage>> {
    const compressedTiles = await Promise.all(
      pkg.tiles.map(async (t) =>
        t.imageUrl ? { ...t, imageUrl: await compressImageDataUrl(t.imageUrl, MAX_IMAGE_SIDE_PX) } : t
      )
    );
    const compressedPawns = await Promise.all(
      pkg.pawns.map(async (p) =>
        p.imageUrl ? { ...p, imageUrl: await compressImageDataUrl(p.imageUrl, MAX_IMAGE_SIDE_PX) } : p
      )
    );

    const sanitizedPkg: BoardGamePackage = {
      ...pkg,
      tiles: compressedTiles,
      pawns: compressedPawns,
      updatedAt: new Date().toISOString(),
    };

    const list = await this.listGames();
    const idx = list.findIndex((x) => x.id === sanitizedPkg.id);
    const next = [...list];
    if (idx >= 0) {
      next[idx] = sanitizedPkg;
    } else {
      next.unshift(sanitizedPkg);
    }

    const writeRes = await writeStore(BOARD_GAMES_KEY, next);
    if (!writeRes.ok) {
      return { ok: false, items: list, error: writeRes.error };
    }
    return { ok: true, items: next };
  },

  async deleteGame(id: string): Promise<BoardGamePackage[]> {
    const list = await this.listGames();
    const next = list.filter((x) => x.id !== id);
    await writeStore(BOARD_GAMES_KEY, next);
    return next;
  },
};
