import { GamePackageV2, Piece, Zone } from '../schema/types';

/**
 * Pure data-driven UNO-lite package (Golden Game #3).
 * Demonstrates hidden deck, private owner hands, dealing, drawing, playing cards, and empty-hand win.
 */
export function createUnoPackageV2(): GamePackageV2 {
  const zones: Zone[] = [
    { id: 'deck', name: 'Chồng rút', layout: 'stack', visibility: 'hidden', tags: ['deck'], fields: {} },
    { id: 'discard', name: 'Chồng bỏ', layout: 'stack', visibility: 'public', tags: ['discard'], fields: {} },
    { id: 'hand-p1', name: 'Bài P1', layout: 'list', visibility: 'owner', ownerId: 'p1', tags: ['hand'], fields: {} },
    { id: 'hand-p2', name: 'Bài P2', layout: 'list', visibility: 'owner', ownerId: 'p2', tags: ['hand'], fields: {} },
  ];

  const colors = ['red', 'blue', 'green', 'yellow'];
  const pieces: Piece[] = [];
  let idx = 1;
  for (const color of colors) {
    for (let num = 1; num <= 4; num++) {
      pieces.push({
        id: `uno-${idx++}`,
        name: `${color.toUpperCase()} ${num}`,
        faces: [{ label: `${num}`, color }],
        activeFace: 0,
        rotation: 0,
        zoneId: 'deck',
        tags: ['card', color],
        fields: { color, value: num },
      });
    }
  }

  return {
    schemaVersion: 2,
    id: 'uno-v2',
    title: 'UNO Rút Gọn (v2)',
    description: 'Bộ bài ẩn tay người chơi, chia bài, rút bài và hết bài trên tay là thắng.',
    zones,
    pieces,
    counters: [],
    randomizers: [],
    players: [
      { id: 'p1', name: 'Người chơi 1', seat: 0, handZoneId: 'hand-p1', tags: [], fields: { handZoneId: 'hand-p1' } },
      { id: 'p2', name: 'Người chơi 2', seat: 1, handZoneId: 'hand-p2', tags: [], fields: { handZoneId: 'hand-p2' } },
    ],
    turnConfig: {
      initialPhase: 'play',
      phases: [{ id: 'play', name: 'Đánh bài', allowedButtons: ['btn-draw', 'btn-pass'] }],
    },
    rules: [
      {
        id: 'rule-uno-start',
        name: 'Xáo bài và chia 5 lá mỗi người',
        trigger: 'game_start',
        priority: 20,
        actions: [
          { type: 'shuffle', params: { zoneId: 'deck' } },
          { type: 'deal', params: { fromZoneId: 'deck', count: 5 } },
          { type: 'draw', params: { fromZoneId: 'deck', toZoneId: 'discard', count: 1 } },
        ],
      },
      {
        id: 'rule-uno-draw-btn',
        name: 'Rút 1 lá và qua lượt',
        trigger: 'button_pressed',
        scope: { entityId: 'btn-draw' },
        priority: 10,
        actions: [
          {
            type: 'draw',
            params: {
              fromZoneId: 'deck',
              toZoneId: { fn: 'field', args: [{ ref: '$player' }, 'handZoneId'] },
              count: 1,
            },
          },
          { type: 'next_turn', params: {} },
        ],
      },
      {
        id: 'rule-uno-pass',
        name: 'Qua lượt',
        trigger: 'button_pressed',
        scope: { entityId: 'btn-pass' },
        priority: 10,
        actions: [{ type: 'next_turn', params: {} }],
      },
      {
        id: 'rule-uno-win-empty-hand',
        name: 'Hết bài trên tay là thắng',
        trigger: 'zone_empty',
        scope: { tag: 'hand' },
        priority: 30,
        actions: [
          {
            type: 'end_game',
            params: { winnerId: { fn: 'owner_of', args: [{ ref: '$piece' }] } },
          },
        ],
      },
    ],
    ui: {
      panels: [],
      buttons: [
        { id: 'btn-draw', label: 'Rút bài', phases: ['play'] },
        { id: 'btn-pass', label: 'Qua lượt', phases: ['play'] },
      ],
    },
  };
}
