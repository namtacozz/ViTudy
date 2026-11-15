import { GamePackageV2, Zone } from '../schema/types';

/**
 * Pure data-driven Catan-lite package (Golden Game #6).
 * Demonstrates hex layout, resource counters, dice-driven resource harvest, and VP victory.
 */
export function createCatanLitePackageV2(): GamePackageV2 {
  const hexCoords: [number, number][] = [
    [0, 1], [0, 2],
    [1, 0], [1, 1], [1, 2],
    [2, 1], [2, 2],
  ];
  const hexZones: Zone[] = hexCoords.map(([row, col], idx) => ({
    id: `hex-${idx}`,
    name: idx % 2 === 0 ? 'Rừng Gỗ' : 'Mỏ Gạch',
    layout: 'hex',
    coords: { row, col },
    visibility: 'public',
    tags: ['hex_tile', idx % 2 === 0 ? 'wood_hex' : 'brick_hex'],
    fields: { resource: idx % 2 === 0 ? 'wood' : 'brick', diceNumber: (idx % 6) + 1 },
  }));

  return {
    schemaVersion: 2,
    id: 'catan-lite-v2',
    title: 'Catan Rút Gọn (v2)',
    description: 'Bản đồ lục giác thu hoạch tài nguyên Gỗ/Gạch và xây nhà đạt 3 điểm chiến thắng.',
    zones: hexZones,
    pieces: [
      {
        id: 'settlement-p1',
        name: 'Nhà P1',
        faces: [{ label: '⌂', color: '#E0562D' }],
        activeFace: 0,
        rotation: 0,
        zoneId: 'hex-0',
        ownerId: 'p1',
        tags: ['settlement'],
        fields: {},
      },
      {
        id: 'settlement-p2',
        name: 'Nhà P2',
        faces: [{ label: '⌂', color: '#2563eb' }],
        activeFace: 0,
        rotation: 0,
        zoneId: 'hex-1',
        ownerId: 'p2',
        tags: ['settlement'],
        fields: {},
      },
    ],
    counters: [
      { id: 'wood', name: 'Gỗ', scope: 'player', kind: 'scalar', min: 0, initial: 1, tags: ['resource'], fields: {} },
      { id: 'brick', name: 'Gạch', scope: 'player', kind: 'scalar', min: 0, initial: 1, tags: ['resource'], fields: {} },
      { id: 'vp', name: 'Điểm (VP)', scope: 'player', kind: 'scalar', min: 0, initial: 1, tags: ['score'], fields: {} },
    ],
    randomizers: [
      { id: 'd6', name: 'Xúc xắc tài nguyên', kind: 'dice', sides: [6], tags: [], fields: {} },
    ],
    players: [
      { id: 'p1', name: 'Người chơi 1', seat: 0, tags: [], fields: {} },
      { id: 'p2', name: 'Người chơi 2', seat: 1, tags: [], fields: {} },
    ],
    turnConfig: {
      initialPhase: 'harvest',
      phases: [
        { id: 'harvest', name: 'Thu hoạch', allowedButtons: ['btn-harvest'] },
        { id: 'build', name: 'Xây dựng', allowedButtons: ['btn-build', 'btn-end'] },
      ],
    },
    rules: [
      {
        id: 'rule-harvest',
        name: 'Đổ xúc xắc thu hoạch tài nguyên',
        trigger: 'button_pressed',
        scope: { entityId: 'btn-harvest' },
        priority: 20,
        actions: [
          { type: 'roll', params: { randomizerId: 'd6' } },
          { type: 'set_counter', params: { counterId: 'wood', targetId: { ref: '$player' }, delta: 1 } },
          { type: 'set_counter', params: { counterId: 'brick', targetId: { ref: '$player' }, delta: 1 } },
          { type: 'set_phase', params: { phase: 'build' } },
        ],
      },
      {
        id: 'rule-build',
        name: 'Xây công trình (+1 VP)',
        trigger: 'button_pressed',
        scope: { entityId: 'btn-build' },
        priority: 20,
        condition: {
          op: 'and',
          args: [
            { op: '>=', args: [{ fn: 'counter', args: ['wood', { ref: '$player' }] }, 1] },
            { op: '>=', args: [{ fn: 'counter', args: ['brick', { ref: '$player' }] }, 1] },
          ],
        },
        actions: [
          { type: 'transfer', params: { counterId: 'wood', fromId: { ref: '$player' }, toId: 'bank', amount: 1, reason: 'Xây nhà' } },
          { type: 'transfer', params: { counterId: 'brick', fromId: { ref: '$player' }, toId: 'bank', amount: 1, reason: 'Xây nhà' } },
          { type: 'set_counter', params: { counterId: 'vp', targetId: { ref: '$player' }, delta: 1 } },
        ],
      },
      {
        id: 'rule-vp-win',
        name: 'Đạt 3 VP thắng ngay',
        trigger: 'counter_changed',
        scope: { entityId: 'vp' },
        priority: 30,
        condition: { op: '>=', args: [{ fn: 'counter', args: ['vp', { ref: '$player' }] }, 3] },
        actions: [{ type: 'end_game', params: { winnerId: { ref: '$player' } } }],
      },
      {
        id: 'rule-end',
        name: 'Kết lượt',
        trigger: 'button_pressed',
        scope: { entityId: 'btn-end' },
        priority: 10,
        actions: [{ type: 'next_turn', params: {} }],
      },
    ],
    ui: {
      panels: [],
      buttons: [
        { id: 'btn-harvest', label: 'Thu hoạch', phases: ['harvest'] },
        { id: 'btn-build', label: 'Xây công trình (1 Gỗ + 1 Gạch)', phases: ['build'] },
        { id: 'btn-end', label: 'Kết lượt', phases: ['build'] },
      ],
    },
    winConfig: { scoreCounterId: 'vp', tieBreaker: 'highest' },
  };
}
