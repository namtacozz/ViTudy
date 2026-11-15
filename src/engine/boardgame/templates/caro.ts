import { GamePackageV2, Zone } from '../schema/types';

/**
 * Pure data-driven Caro / Tic-Tac-Toe package (Golden Game #2).
 */
export function createCaroPackageV2(size = 3, winLength = 3): GamePackageV2 {
  const zones: Zone[] = [];
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      zones.push({
        id: `cell-${r}-${c}`,
        name: `(${r + 1},${c + 1})`,
        layout: 'grid',
        coords: { row: r, col: c },
        visibility: 'public',
        tags: ['cell'],
        fields: {},
      });
    }
  }

  const emptyCellsExpr = {
    fn: 'count' as const,
    args: [{ fn: 'zone_pieces' as const, args: ['cell-0-0'] }],
  };
  void emptyCellsExpr;

  return {
    schemaVersion: 2,
    id: `caro-${size}x${size}`,
    title: `Caro ${size}×${size}`,
    description: `Cờ Caro ${size}×${size} thắng khi xếp đủ ${winLength} quân liên tiếp.`,
    zones,
    pieces: [],
    counters: [],
    randomizers: [],
    players: [
      { id: 'p1', name: 'Quân X', seat: 0, tags: ['x'], fields: { mark: 'x' } },
      { id: 'p2', name: 'Quân O', seat: 1, tags: ['o'], fields: { mark: 'o' } },
    ],
    turnConfig: {
      initialPhase: 'place',
      phases: [{ id: 'place', name: 'Đánh cờ', allowedButtons: ['btn-place-x', 'btn-place-o'] }],
    },
    rules: [
      {
        id: 'rule-win-x',
        name: 'X thắng khi đủ hàng',
        trigger: 'piece_enter',
        scope: { tag: 'cell' },
        priority: 20,
        condition: {
          op: '>',
          args: [{ fn: 'len', args: [{ fn: 'line_of', args: ['x', winLength, { ref: '$tile' }] }] }, 0],
        },
        actions: [{ type: 'end_game', params: { winnerId: 'p1' } }],
      },
      {
        id: 'rule-win-o',
        name: 'O thắng khi đủ hàng',
        trigger: 'piece_enter',
        scope: { tag: 'cell' },
        priority: 20,
        condition: {
          op: '>',
          args: [{ fn: 'len', args: [{ fn: 'line_of', args: ['o', winLength, { ref: '$tile' }] }] }, 0],
        },
        actions: [{ type: 'end_game', params: { winnerId: 'p2' } }],
      },
    ],
    ui: {
      panels: [],
      buttons: [],
    },
  };
}
