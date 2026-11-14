import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  validateAiDeckCards,
  validateAiTileItems,
  generateBoardDeckWithAi,
  generateTilesContentWithAi,
} from './BoardGameAiService';
import * as aiClient from '@/lib/aiClient';
import { SyncService } from './SyncService';
import { StudySpaceService } from './StudySpaceService';
import { GameCabinetStorage } from './GameCabinetStorage';
import { createDefaultBoardGamePackage } from '@/types/boardgame';

describe('BoardGameAiService Validation, Retry & Billing', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('accepts valid AI deck cards', () => {
    const res = validateAiDeckCards([
      { title: 'Thưởng', description: 'Nhận tiền', effectType: 'money_delta', effectValue: 100000 },
      { title: 'Tiến', description: 'Đi 3 bước', effectType: 'move_steps', effectValue: 3 },
    ]);
    expect(res.valid).toBe(true);
    expect(res.cards).toHaveLength(2);
  });

  it('rejects AI deck cards with out-of-bounds money_delta or zero move_steps', () => {
    expect(
      validateAiDeckCards([
        { title: 'Hack', description: 'Quá lớn', effectType: 'money_delta', effectValue: 99999999 },
      ]).valid
    ).toBe(false);
    expect(
      validateAiDeckCards([
        { title: 'Đứng im', description: '0 bước', effectType: 'move_steps', effectValue: 0 },
      ]).valid
    ).toBe(false);
  });

  it('accepts valid AI tile items', () => {
    const res = validateAiTileItems([
      { title: 'Hà Nội', price: 200000, headerColor: '#E0562D', baseRent: 30000, houseCost: 100000 },
    ]);
    expect(res.valid).toBe(true);
  });

  it('rejects AI tile items with negative price, baseRent > price, or invalid hex', () => {
    expect(
      validateAiTileItems([
        { title: 'Lỗi', price: -5000, headerColor: '#E0562D', baseRent: 1000, houseCost: 1000 },
      ]).valid
    ).toBe(false);
    expect(
      validateAiTileItems([
        { title: 'Lỗi', price: 50000, headerColor: '#E0562D', baseRent: 90000, houseCost: 10000 },
      ]).valid
    ).toBe(false);
    expect(
      validateAiTileItems([
        { title: 'Lỗi', price: 50000, headerColor: 'red', baseRent: 10000, houseCost: 10000 },
      ]).valid
    ).toBe(false);
  });

  it('passes idempotent requestId, retries on malformed JSON without extra charge, and updates balance from server', async () => {
    const askAiSpy = vi
      .spyOn(aiClient, 'askAi')
      .mockResolvedValueOnce({ reply: 'invalid json {{{', provider: 'system', balanceAfter: 9 })
      .mockResolvedValueOnce({
        reply: JSON.stringify([
          { title: 'Cơ hội 1', description: 'Thưởng 50k', effectType: 'money_delta', effectValue: 50000 },
          { title: 'Cơ hội 2', description: 'Tiến 2 bước', effectType: 'move_steps', effectValue: 2 },
        ]),
        provider: 'system',
        balanceAfter: 9,
      });
    const refundSpy = vi.spyOn(aiClient, 'refundAiRequest').mockResolvedValue({ refunded: true });

    const balanceSpy = vi.fn();
    const res = await generateBoardDeckWithAi({
      deckName: 'Cơ hội',
      topicPrompt: 'Kinh doanh',
      count: 4,
      aiConfig: { provider: 'system', model: 'gpt-4o-mini' } as any,
      onBalanceUpdate: balanceSpy,
    });

    expect(askAiSpy).toHaveBeenCalledTimes(2);
    const reqId1 = askAiSpy.mock.calls[0][0].requestId;
    const reqId2 = askAiSpy.mock.calls[1][0].requestId;
    expect(reqId1).toBeTruthy();
    expect(reqId2).toBe(reqId1); // Idempotent p_reference prevents double-debit on retry
    expect(res.usedFallback).toBe(false);
    expect(balanceSpy).toHaveBeenCalledWith(9);
    expect(refundSpy).not.toHaveBeenCalled();
  });

  it('retries on invalid tile schema with same requestId and updates balance only from server', async () => {
    const askAiSpy = vi
      .spyOn(aiClient, 'askAi')
      .mockResolvedValueOnce({
        reply: JSON.stringify([{ title: 'Bad', price: -100, headerColor: '#E0562D', baseRent: 0, houseCost: 0 }]),
        provider: 'system',
        balanceAfter: 8,
      })
      .mockResolvedValueOnce({
        reply: JSON.stringify([{ title: 'Đà Lạt', price: 120000, headerColor: '#16a34a', baseRent: 18000, houseCost: 60000 }]),
        provider: 'system',
        balanceAfter: 8,
      });
    const refundSpy = vi.spyOn(aiClient, 'refundAiRequest').mockResolvedValue({ refunded: true });

    const balanceSpy = vi.fn();
    const res = await generateTilesContentWithAi({
      tileCount: 2,
      themePrompt: 'Du lịch VN',
      aiConfig: { provider: 'system', model: 'gpt-4o-mini' } as any,
      onBalanceUpdate: balanceSpy,
    });

    expect(askAiSpy).toHaveBeenCalledTimes(2);
    expect(askAiSpy.mock.calls[0][0].requestId).toBe(askAiSpy.mock.calls[1][0].requestId);
    expect(res.usedFallback).toBe(false);
    expect(res.items[0].title).toBe('Đà Lạt');
    expect(balanceSpy).toHaveBeenCalledWith(8);
    expect(refundSpy).not.toHaveBeenCalled();
  });

  it('calls idempotent refundAiRequest when AI fails completely under system provider', async () => {
    const askAiSpy = vi
      .spyOn(aiClient, 'askAi')
      .mockResolvedValue({ reply: 'still malformed {{{', provider: 'system', balanceAfter: 7 });
    const refundSpy = vi
      .spyOn(aiClient, 'refundAiRequest')
      .mockResolvedValue({ refunded: true, balanceAfter: 8 });
    const balanceSpy = vi.fn();

    const res = await generateBoardDeckWithAi({
      deckName: 'Khí vận',
      topicPrompt: 'Test',
      count: 4,
      aiConfig: { provider: 'system', model: 'gpt-4o-mini' } as any,
      onBalanceUpdate: balanceSpy,
    });

    expect(askAiSpy).toHaveBeenCalledTimes(2);
    expect(res.usedFallback).toBe(true);
    expect(res.cards).toHaveLength(4);
    expect(refundSpy).toHaveBeenCalledTimes(1);
    expect(refundSpy).toHaveBeenCalledWith(askAiSpy.mock.calls[0][0].requestId);
    expect(balanceSpy).toHaveBeenLastCalledWith(8);
  });

  it('handles QuotaExceededError gracefully in GameCabinetStorage', async () => {
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      const err = new Error('QuotaExceededError');
      err.name = 'QuotaExceededError';
      throw err;
    });

    const pkg = createDefaultBoardGamePackage({
      id: 'quota-test',
      layoutMode: 'perimeter_ring',
      rows: 5,
      cols: 5,
      width: 350,
      height: 350,
    });
    const res = await GameCabinetStorage.saveGame(pkg);
    expect(res.ok).toBe(false);
    expect(res.error).toContain('QuotaExceeded');
    setItemSpy.mockRestore();
  });

  it('preserves artboard, board_game, and cabinets during guest -> account migration', async () => {
    const pkg = createDefaultBoardGamePackage({
      id: 'guest-game-1',
      layoutMode: 'perimeter_ring',
      rows: 5,
      cols: 5,
      width: 350,
      height: 350,
    });
    pkg.pawns = [
      {
        id: 'pawn-g1',
        name: 'Quân khách',
        drawingAssetId: 'guest-art-1',
        imageUrl: '',
        color: '#E0562D',
        width: 30,
        height: 30,
        relX: 10,
        relY: 10,
      },
    ];

    localStorage.setItem(
      'vitudy_spaces',
      JSON.stringify([
        {
          id: 'guest-space-1',
          name: 'Bàn Guest',
          subject: 'Toán',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          items: [
            { id: 'guest-art-1', type: 'artboard', title: 'Bảng vẽ', x: 0, y: 0, rotation: 0, zIndex: 1 },
            { id: 'guest-bg-1', type: 'board_game', title: 'Cờ', x: 500, y: 0, rotation: 0, zIndex: 2, boardGameData: pkg },
          ],
          threads: [],
        },
      ])
    );

    await GameCabinetStorage.saveGame(pkg);
    vi.spyOn(StudySpaceService, 'saveSpace').mockResolvedValue(undefined as any);
    const upsertItemsSpy = vi.spyOn(StudySpaceService, 'upsertItems').mockResolvedValue(undefined as any);

    expect(SyncService.hasPendingLocalData('user-uuid-123')).toBe(true);
    const mig = await SyncService.migrateToCloud('user-uuid-123');
    expect(mig.errors).toHaveLength(0);
    expect(mig.migrated).toBeGreaterThanOrEqual(2);
    expect(mig.idMap['guest-art-1']).toBeDefined();
    expect(mig.idMap['guest-bg-1']).toBeDefined();
    expect(localStorage.getItem('vitudy_migrated_user-uuid-123')).toBe('true');

    // Verify drawingAssetId inside board_game pawns was remapped to the new UUID passed to cloud
    expect(upsertItemsSpy).toHaveBeenCalledTimes(1);
    const uploadedItems = upsertItemsSpy.mock.calls[0][1] as any[];
    const migratedBg = uploadedItems.find((i) => i.type === 'board_game');
    expect(migratedBg?.boardGameData?.pawns?.[0]?.drawingAssetId).toBe(mig.idMap['guest-art-1']);

    // Calling migrateToCloud a 2nd time consecutively must be idempotent and create zero duplicates
    const mig2 = await SyncService.migrateToCloud('user-uuid-123');
    expect(mig2.migrated).toBe(0);
    expect(Object.keys(mig2.idMap)).toHaveLength(0);
    expect(upsertItemsSpy).toHaveBeenCalledTimes(1);
  });

  it('falls back safely in GameCabinetStorage when IndexedDB is blocked', async () => {
    const origIdb = (globalThis as any).indexedDB;
    Object.defineProperty(globalThis, 'indexedDB', {
      value: {
        open: () => {
          throw new Error('SecurityError: IDB blocked');
        },
      },
      configurable: true,
    });

    const pkg = createDefaultBoardGamePackage({
      id: 'idb-blocked-game',
      layoutMode: 'perimeter_ring',
      rows: 5,
      cols: 5,
      width: 350,
      height: 350,
    });
    const saveRes = await GameCabinetStorage.saveGame(pkg);
    expect(saveRes.ok).toBe(true);
    const games = await GameCabinetStorage.listGames();
    expect(games.some((g) => g.id === 'idb-blocked-game')).toBe(true);

    Object.defineProperty(globalThis, 'indexedDB', { value: origIdb, configurable: true });
  });
});
