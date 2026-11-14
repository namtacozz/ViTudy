import { StudySpace } from '@/types/studyspace';
import { INITIAL_SPACES } from '@/data/mockSpaces';
import { StudySpaceService } from './StudySpaceService';
import {
  BOARD_GAMES_KEY,
  DRAWING_ASSETS_KEY,
  GameCabinetStorage,
} from './GameCabinetStorage';
import { idbSet } from '@/lib/indexeddb';

export interface MigrationResult {
  migrated: number;
  idMap: Record<string, string>;
  errors: string[];
}

export class SyncService {
  static hasPendingLocalData(userId: string): boolean {
    if (typeof window === 'undefined' || !userId) return false;

    // Check if already migrated or dismissed for this user
    const flag = localStorage.getItem(`vitudy_migrated_${userId}`);
    if (flag === 'true' || flag === 'dismissed') return false;

    // Only inspect guest-created spaces (not demo template spaces)
    const userPrefix = `user_${userId}_`;
    const userRaw = localStorage.getItem(`${userPrefix}vitudy_spaces`);
    if (userRaw) {
      // User already has specific storage initialized, no migration needed
      return false;
    }

    const raw = localStorage.getItem('vitudy_spaces');
    const hasCabinetLocal =
      Boolean(localStorage.getItem(DRAWING_ASSETS_KEY)) ||
      Boolean(localStorage.getItem(BOARD_GAMES_KEY));

    if (!raw) return hasCabinetLocal;

    try {
      const spaces: StudySpace[] = JSON.parse(raw);
      if (!Array.isArray(spaces) || spaces.length === 0) return hasCabinetLocal;

      // Ignore pure initial demo spaces
      const demoIds = new Set(INITIAL_SPACES.map(s => s.id));
      const userCreatedSpaces = spaces.filter(s => !demoIds.has(s.id));
      if (userCreatedSpaces.length > 0) return true;

      // Check if user has added custom items beyond the initial mock items
      const initialTotalItems = INITIAL_SPACES.reduce((sum, s) => sum + (s.items?.length || 0), 0);
      const currentTotalItems = spaces.reduce((sum, s) => sum + (s.items?.length || 0), 0);
      return currentTotalItems > initialTotalItems || hasCabinetLocal;
    } catch {
      return hasCabinetLocal;
    }
  }

  static async migrateToCloud(userId: string): Promise<MigrationResult> {
    const result: MigrationResult = {
      migrated: 0,
      idMap: {},
      errors: [],
    };

    if (typeof window === 'undefined' || !userId) {
      return result;
    }

    if (localStorage.getItem(`vitudy_migrated_${userId}`) === 'true') {
      return result;
    }

    const raw = localStorage.getItem('vitudy_spaces');
    if (!raw) return result;

    try {
      const localSpaces: StudySpace[] = JSON.parse(raw);
      if (!Array.isArray(localSpaces)) return result;

      // 1. Check if user already has cloud spaces to prevent unintentional overwrite
      const cloudSpaces = await StudySpaceService.loadSpaces(userId);
      const isCloudEmpty = cloudSpaces.length === 0;

      for (const space of localSpaces) {
        // Generate new space UUID if old format
        const newSpaceId = space.id.length === 36 && space.id.includes('-') 
          ? space.id 
          : crypto.randomUUID();
        result.idMap[space.id] = newSpaceId;

        // Save space
        await StudySpaceService.saveSpace({
          ...space,
          id: newSpaceId,
        }, userId);

        // Remap item IDs (giữ nguyên artboardData, boardGameData và cập nhật drawingAssetId nếu có)
        const remappedItems = space.items.map(item => {
          const newItemId = item.id.length === 36 && item.id.includes('-')
            ? item.id
            : crypto.randomUUID();
          result.idMap[item.id] = newItemId;
          return {
            ...item,
            id: newItemId,
          };
        }).map(item => {
          if (item.type === 'board_game' && item.boardGameData) {
            return {
              ...item,
              boardGameData: {
                ...item.boardGameData,
                pawns: item.boardGameData.pawns.map(p => ({
                  ...p,
                  drawingAssetId: p.drawingAssetId
                    ? (result.idMap[p.drawingAssetId] || p.drawingAssetId)
                    : undefined,
                })),
              },
            };
          }
          return item;
        });

        // Remap threads targets and source items
        const remappedThreads = (space.threads || []).map(thread => ({
          ...thread,
          id: crypto.randomUUID(),
          sourceItemId: result.idMap[thread.sourceItemId] || thread.sourceItemId,
          targetStickyId: result.idMap[thread.targetStickyId] || thread.targetStickyId,
        }));

        // Upsert items, threads & strokes to cloud
        await StudySpaceService.upsertItems(newSpaceId, remappedItems);
        if (remappedThreads.length > 0) {
          await StudySpaceService.saveThreads(newSpaceId, remappedThreads);
        }

        try {
          const rawStrokes = localStorage.getItem(`vitudy_strokes_${space.id}`);
          if (rawStrokes) {
            const parsedStrokes = JSON.parse(rawStrokes);
            if (Array.isArray(parsedStrokes) && parsedStrokes.length > 0) {
              const remappedStrokes = parsedStrokes.map((st: any) => ({
                ...st,
                attachedToItemId: st.attachedToItemId
                  ? (result.idMap[st.attachedToItemId] || st.attachedToItemId)
                  : undefined,
              }));
              await StudySpaceService.saveStrokes(newSpaceId, remappedStrokes);
            }
          }
        } catch {}

        result.migrated += remappedItems.length;
      }

      // Migrate Kho bản vẽ & Tủ Game từ Guest sang tài khoản đăng nhập
      try {
        const [drawings, games] = await Promise.all([
          GameCabinetStorage.listDrawings(),
          GameCabinetStorage.listGames(),
        ]);

        if (drawings.length > 0) {
          if (typeof indexedDB !== 'undefined') {
            await idbSet(`user_${userId}_${DRAWING_ASSETS_KEY}`, drawings);
          }
          for (const d of drawings) {
            await GameCabinetStorage.saveDrawing(d);
          }
          result.migrated += drawings.length;
        }

        if (games.length > 0) {
          if (typeof indexedDB !== 'undefined') {
            await idbSet(`user_${userId}_${BOARD_GAMES_KEY}`, games);
          }
          for (const g of games) {
            await GameCabinetStorage.saveGame(g);
          }
          result.migrated += games.length;
        }
      } catch (cabinetErr: any) {
        result.errors.push(cabinetErr?.message || 'Lỗi di chuyển Kho bản vẽ / Tủ Game');
      }

      // Mark user as migrated
      localStorage.setItem(`vitudy_migrated_${userId}`, 'true');

    } catch (err: any) {
      result.errors.push(err.message || 'Lỗi trong quá trình di chuyển dữ liệu');
    }

    return result;
  }
}
