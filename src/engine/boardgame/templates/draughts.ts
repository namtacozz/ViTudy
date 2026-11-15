import { GamePackageV2, Piece, Zone } from '../schema/types';

/**
 * Pure data-driven Draughts (Checkers) package (Golden Game #4).
 * Demonstrates 8x8 grid, diagonal placement, king promotion via flip, and capture/win rules.
 */
export function createDraughtsPackageV2(): GamePackageV2 {
  const zones: Zone[] = [];
  const pieces: Piece[] = [];

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const isDark = (r + c) % 2 === 1;
      const tags = ['cell', isDark ? 'dark' : 'light'];
      if (r === 7 && isDark) tags.push('promote_p1');
      if (r === 0 && isDark) tags.push('promote_p2');

      const zId = `cell-${r}-${c}`;
      zones.push({
        id: zId,
        name: `${String.fromCharCode(65 + c)}${8 - r}`,
        layout: 'grid',
        coords: { row: r, col: c },
        visibility: 'public',
        tags,
        fields: {},
      });

      if (isDark && r < 3) {
        pieces.push({
          id: `d-p1-${r}-${c}`,
          name: 'Đỏ',
          faces: [{ label: '●', color: '#E0562D' }, { label: '♔', color: '#9A3412' }],
          activeFace: 0,
          rotation: 0,
          zoneId: zId,
          ownerId: 'p1',
          tags: ['piece', 'p1_piece'],
          fields: {},
        });
      } else if (isDark && r > 4) {
        pieces.push({
          id: `d-p2-${r}-${c}`,
          name: 'Đen',
          faces: [{ label: '●', color: '#0f172a' }, { label: '♚', color: '#334155' }],
          activeFace: 0,
          rotation: 0,
          zoneId: zId,
          ownerId: 'p2',
          tags: ['piece', 'p2_piece'],
          fields: {},
        });
      }
    }
  }

  return {
    schemaVersion: 2,
    id: 'draughts-v2',
    title: 'Cờ Đam 8×8 (v2)',
    description: 'Cờ Đam thuần dữ liệu trên lưới 8×8 với cơ chế phong Vua bằng lật mặt quân.',
    zones,
    pieces,
    counters: [
      { id: 'captured', name: 'Quân đã ăn', scope: 'player', kind: 'scalar', min: 0, initial: 0, tags: [], fields: {} },
    ],
    randomizers: [],
    players: [
      { id: 'p1', name: 'Đỏ', seat: 0, tags: [], fields: {} },
      { id: 'p2', name: 'Đen', seat: 1, tags: [], fields: {} },
    ],
    turnConfig: {
      initialPhase: 'move',
      phases: [{ id: 'move', name: 'Di chuyển', allowedButtons: ['btn-end-turn'] }],
    },
    rules: [
      {
        id: 'rule-promote-p1',
        name: 'Phong Vua cho Đỏ',
        trigger: 'piece_enter',
        scope: { tag: 'promote_p1' },
        priority: 20,
        condition: { op: '==', args: [{ fn: 'owner_of', args: [{ ref: '$piece' }] }, 'p1'] },
        actions: [{ type: 'flip', params: { pieceId: { ref: '$piece' }, faceIndex: 1 } }],
      },
      {
        id: 'rule-promote-p2',
        name: 'Phong Vua cho Đen',
        trigger: 'piece_enter',
        scope: { tag: 'promote_p2' },
        priority: 20,
        condition: { op: '==', args: [{ fn: 'owner_of', args: [{ ref: '$piece' }] }, 'p2'] },
        actions: [{ type: 'flip', params: { pieceId: { ref: '$piece' }, faceIndex: 1 } }],
      },
      {
        id: 'rule-draughts-win',
        name: 'Thắng khi ăn đủ 12 quân',
        trigger: 'counter_changed',
        scope: { entityId: 'captured' },
        priority: 30,
        condition: { op: '>=', args: [{ fn: 'counter', args: ['captured', { ref: '$player' }] }, 12] },
        actions: [{ type: 'end_game', params: { winnerId: { ref: '$player' } } }],
      },
      {
        id: 'rule-end-turn',
        name: 'Kết lượt',
        trigger: 'button_pressed',
        scope: { entityId: 'btn-end-turn' },
        priority: 10,
        actions: [{ type: 'next_turn', params: {} }],
      },
    ],
    ui: {
      panels: [],
      buttons: [{ id: 'btn-end-turn', label: 'Kết lượt', phases: ['move'] }],
    },
  };
}
