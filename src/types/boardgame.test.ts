import { describe, it, expect, beforeEach } from 'vitest';
import {
  DEFAULT_VND_CURRENCIES,
  breakAmountIntoVndNotes,
  calculateBalanceTotal,
  createDefaultBoardGamePackage,
  generateMapTiles,
} from './boardgame';
import { GameCabinetStorage } from '@/services/GameCabinetStorage';

describe('Board Game Studio Core Logic', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('generates 40 perimeter tiles for an 11x11 Monopoly-style map', () => {
    const tiles = generateMapTiles({
      layoutMode: 'perimeter_ring',
      rows: 11,
      cols: 11,
      totalWidth: 770,
      totalHeight: 770,
    });
    expect(tiles).toHaveLength(40);
    expect(tiles[0].title).toBe('Xuất phát');
  });

  it('generates 64 full grid tiles for an 8x8 Chess-style map', () => {
    const tiles = generateMapTiles({
      layoutMode: 'full_grid',
      rows: 8,
      cols: 8,
      totalWidth: 640,
      totalHeight: 640,
      hasFunction: false,
    });
    expect(tiles).toHaveLength(64);
    expect(tiles.every((t) => t.hasFunction === false)).toBe(true);
  });

  it('includes all 9 Vietnamese currency denominations from 1k to 500k', () => {
    expect(DEFAULT_VND_CURRENCIES.map((c) => c.denomination)).toEqual([
      1000, 2000, 5000, 10000, 20000, 50000, 100000, 200000, 500000,
    ]);
  });

  it('breaks VND amounts into notes and calculates total accurately', () => {
    const notes = breakAmountIntoVndNotes(783000);
    expect(notes[500000]).toBe(1);
    expect(notes[200000]).toBe(1);
    expect(notes[50000]).toBe(1);
    expect(notes[20000]).toBe(1);
    expect(notes[10000]).toBe(1);
    expect(notes[2000]).toBe(1);
    expect(notes[1000]).toBe(1);
    expect(calculateBalanceTotal(notes)).toBe(783000);
  });

  it('saves, lists, and deletes BoardGamePackage in GameCabinetStorage', () => {
    const pkg = createDefaultBoardGamePackage({
      id: 'game-test-1',
      layoutMode: 'perimeter_ring',
      rows: 11,
      cols: 11,
      width: 770,
      height: 770,
    });
    GameCabinetStorage.saveGame(pkg);
    const list = GameCabinetStorage.listGames();
    expect(list).toHaveLength(1);
    expect(list[0].id).toBe('game-test-1');

    GameCabinetStorage.deleteGame('game-test-1');
    expect(GameCabinetStorage.listGames()).toHaveLength(0);
  });
});
