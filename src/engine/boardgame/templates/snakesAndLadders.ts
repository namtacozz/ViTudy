import { GamePackageV2, Zone } from '../schema/types';

/**
 * Pure data-driven Snakes & Ladders package (Golden Game #5).
 * Demonstrates 5x5 track, dice roll, ladder/snake teleport via Ref fields, and goal win.
 */
export function createSnakesAndLaddersPackageV2(): GamePackageV2 {
  const size = 25;
  const ladders: Record<number, number> = { 4: 14, 9: 19 };
  const snakes: Record<number, number> = { 17: 7, 22: 11 };

  const zones: Zone[] = [];
  for (let i = 1; i <= size; i++) {
    const rowFromBottom = Math.floor((i - 1) / 5);
    const row = 4 - rowFromBottom;
    const rawCol = (i - 1) % 5;
    const col = rowFromBottom % 2 === 0 ? rawCol : 4 - rawCol;

    const tags = ['track'];
    const fields: Zone['fields'] = {};
    if (i < size) {
      fields.nextTileId = { $ref: `tile-${i + 1}` };
    }
    if (i === 1) tags.push('start');
    if (i === size) tags.push('goal');
    if (ladders[i]) {
      tags.push('ladder');
      fields.teleportTo = { $ref: `tile-${ladders[i]}` };
    }
    if (snakes[i]) {
      tags.push('snake');
      fields.teleportTo = { $ref: `tile-${snakes[i]}` };
    }

    zones.push({
      id: `tile-${i}`,
      name: `Ô ${i}`,
      layout: 'grid',
      coords: { row, col },
      visibility: 'public',
      tags,
      fields,
    });
  }

  const currentPawnExpr = { fn: 'piece_of' as const, args: [{ ref: '$player' }, 'pawn'] };
  const currentZoneExpr = { fn: 'zone_of' as const, args: [currentPawnExpr] };

  return {
    schemaVersion: 2,
    id: 'snakes-and-ladders-v2',
    title: 'Rắn Leo Thang (v2)',
    description: 'Đổ xúc xắc tiến bước, leo thang, trượt rắn và về đích ô 25.',
    zones,
    pieces: [
      {
        id: 'pawn-p1',
        name: 'Quân P1',
        faces: [{ label: 'P1', color: '#E0562D' }],
        activeFace: 0,
        rotation: 0,
        zoneId: 'tile-1',
        ownerId: 'p1',
        tags: ['pawn'],
        fields: {},
      },
      {
        id: 'pawn-p2',
        name: 'Quân P2',
        faces: [{ label: 'P2', color: '#2563eb' }],
        activeFace: 0,
        rotation: 0,
        zoneId: 'tile-1',
        ownerId: 'p2',
        tags: ['pawn'],
        fields: {},
      },
    ],
    counters: [],
    randomizers: [
      { id: 'd6', name: 'Xúc xắc 6 mặt', kind: 'dice', sides: [6], tags: [], fields: {} },
    ],
    players: [
      { id: 'p1', name: 'Người chơi 1', seat: 0, tags: [], fields: {} },
      { id: 'p2', name: 'Người chơi 2', seat: 1, tags: [], fields: {} },
    ],
    turnConfig: {
      initialPhase: 'roll',
      phases: [{ id: 'roll', name: 'Đổ xúc xắc', allowedButtons: ['btn-roll'] }],
    },
    rules: [
      {
        id: 'rule-roll-move',
        name: 'Đổ xúc xắc và tiến bước',
        trigger: 'button_pressed',
        scope: { entityId: 'btn-roll' },
        priority: 20,
        actions: [
          { type: 'roll', params: { randomizerId: 'd6' } },
          {
            type: 'move_piece',
            params: {
              pieceId: currentPawnExpr,
              toZoneId: { fn: 'track_step', args: [currentZoneExpr, { ref: '$roll' }] },
            },
          },
          { type: 'next_turn', params: {} },
        ],
      },
      {
        id: 'rule-ladder-teleport',
        name: 'Leo thang',
        trigger: 'piece_enter',
        scope: { tag: 'ladder' },
        priority: 25,
        actions: [
          {
            type: 'move_piece',
            params: {
              pieceId: { ref: '$piece' },
              toZoneId: { fn: 'field', args: [{ ref: '$tile' }, 'teleportTo'] },
            },
          },
        ],
      },
      {
        id: 'rule-snake-teleport',
        name: 'Trượt rắn',
        trigger: 'piece_enter',
        scope: { tag: 'snake' },
        priority: 25,
        actions: [
          {
            type: 'move_piece',
            params: {
              pieceId: { ref: '$piece' },
              toZoneId: { fn: 'field', args: [{ ref: '$tile' }, 'teleportTo'] },
            },
          },
        ],
      },
      {
        id: 'rule-reach-goal',
        name: 'Về đích ô 25 thắng ngay',
        trigger: 'piece_enter',
        scope: { tag: 'goal' },
        priority: 30,
        actions: [{ type: 'end_game', params: { winnerId: { ref: '$player' } } }],
      },
    ],
    ui: {
      panels: [],
      buttons: [{ id: 'btn-roll', label: 'Đổ xúc xắc', phases: ['roll'] }],
    },
  };
}
