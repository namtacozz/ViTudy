import { BoardGamePackage, SavedDrawingAsset } from '@/types/boardgame';

const DRAWINGS_KEY = 'vitudy_drawing_assets_v1';
const GAMES_KEY = 'vitudy_board_game_cabinet_v1';

function safeReadJson<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function safeWriteJson<T>(key: string, value: T): boolean {
  if (typeof window === 'undefined') return false;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export const GameCabinetStorage = {
  // === KHO BẢN VẼ & QUÂN CỜ ===
  listDrawings(): SavedDrawingAsset[] {
    return safeReadJson<SavedDrawingAsset[]>(DRAWINGS_KEY, []);
  },

  saveDrawing(asset: SavedDrawingAsset): SavedDrawingAsset[] {
    const list = this.listDrawings();
    const idx = list.findIndex((d) => d.id === asset.id);
    const updated =
      idx >= 0
        ? list.map((d, i) => (i === idx ? { ...asset, updatedAt: new Date().toISOString() } : d))
        : [{ ...asset, updatedAt: new Date().toISOString() }, ...list];
    safeWriteJson(DRAWINGS_KEY, updated);
    return updated;
  },

  deleteDrawing(id: string): SavedDrawingAsset[] {
    const updated = this.listDrawings().filter((d) => d.id !== id);
    safeWriteJson(DRAWINGS_KEY, updated);
    return updated;
  },

  // === TỦ BOARD GAME CÁ NHÂN ===
  listGames(): BoardGamePackage[] {
    return safeReadJson<BoardGamePackage[]>(GAMES_KEY, []);
  },

  getGameById(id: string): BoardGamePackage | null {
    return this.listGames().find((g) => g.id === id) || null;
  },

  saveGame(pkg: BoardGamePackage): BoardGamePackage[] {
    const list = this.listGames();
    const cleanPkg: BoardGamePackage = {
      ...pkg,
      updatedAt: new Date().toISOString(),
    };
    const idx = list.findIndex((g) => g.id === cleanPkg.id);
    const updated =
      idx >= 0
        ? list.map((g, i) => (i === idx ? cleanPkg : g))
        : [cleanPkg, ...list];
    safeWriteJson(GAMES_KEY, updated);
    return updated;
  },

  deleteGame(id: string): BoardGamePackage[] {
    const updated = this.listGames().filter((g) => g.id !== id);
    safeWriteJson(GAMES_KEY, updated);
    return updated;
  },
};
