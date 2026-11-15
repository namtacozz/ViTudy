import { describe, it, expect } from 'vitest';
import {
  GameAction,
  GamePackageV2,
  computeStateChecksum,
  createInitialState,
  createTimeline,
  dispatchTimeline,
  getCounterValue,
  getDistance,
  getLineOf,
  getNeighbors,
  reduce,
  redoTimeline,
  replayLog,
  undoTimeline,
  validateGamePackage,
  viewFor,
} from '../index';

function makeSamplePackage(): GamePackageV2 {
  const zones: GamePackageV2['zones'] = [];
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      zones.push({
        id: `cell-${r}-${c}`,
        name: `Cell ${r},${c}`,
        layout: 'grid',
        coords: { row: r, col: c },
        visibility: 'public',
        tags: ['board'],
        fields: {},
      });
    }
  }
  zones.push(
    {
      id: 'deck',
      name: 'Deck',
      layout: 'stack',
      visibility: 'hidden',
      tags: ['deck'],
      fields: {},
    },
    {
      id: 'discard',
      name: 'Discard',
      layout: 'stack',
      visibility: 'public',
      tags: ['discard'],
      fields: {},
    },
    {
      id: 'hand-p1',
      name: 'Hand P1',
      layout: 'list',
      visibility: 'owner',
      ownerId: 'p1',
      tags: ['hand'],
      fields: {},
    },
    {
      id: 'hand-p2',
      name: 'Hand P2',
      layout: 'list',
      visibility: 'owner',
      ownerId: 'p2',
      tags: ['hand'],
      fields: {},
    }
  );

  return {
    schemaVersion: 2,
    id: 'pkg-sample',
    title: 'Sample Engine Test Game',
    description: 'Pure data-driven test package',
    zones,
    pieces: [
      {
        id: 'card-1',
        name: 'Card 1',
        faces: [{ label: 'Ace' }, { label: 'Back' }],
        activeFace: 0,
        rotation: 0,
        zoneId: 'deck',
        tags: ['card'],
        fields: { power: 5 },
      },
      {
        id: 'card-2',
        name: 'Card 2',
        faces: [{ label: 'King' }, { label: 'Back' }],
        activeFace: 0,
        rotation: 0,
        zoneId: 'deck',
        tags: ['card'],
        fields: { power: 10 },
      },
      {
        id: 'card-3',
        name: 'Card 3',
        faces: [{ label: 'Queen' }, { label: 'Back' }],
        activeFace: 0,
        rotation: 0,
        zoneId: 'deck',
        tags: ['card'],
        fields: { power: 8 },
      },
      {
        id: 'pawn-p1',
        name: 'Pawn 1',
        faces: [{ label: 'P1', color: '#E0562D' }],
        activeFace: 0,
        rotation: 0,
        zoneId: 'cell-0-0',
        ownerId: 'p1',
        tags: ['pawn', 'x'],
        fields: {},
      },
    ],
    counters: [
      {
        id: 'gold',
        name: 'Gold',
        scope: 'player',
        kind: 'scalar',
        min: 0,
        initial: 100,
        tags: [],
        fields: {},
      },
    ],
    randomizers: [
      {
        id: 'd6',
        name: 'Standard D6',
        kind: 'dice',
        sides: [6, 6],
        tags: [],
        fields: {},
      },
    ],
    players: [
      { id: 'p1', name: 'Player 1', seat: 0, handZoneId: 'hand-p1', tags: [], fields: {} },
      { id: 'p2', name: 'Player 2', seat: 1, handZoneId: 'hand-p2', tags: [], fields: {} },
    ],
    turnConfig: {
      initialPhase: 'main',
      phases: [
        { id: 'main', name: 'Main Phase', allowedButtons: ['btn-roll', 'btn-end'] },
        { id: 'act', name: 'Action Phase' },
      ],
    },
    rules: [
      {
        id: 'rule-roll',
        trigger: 'button_pressed',
        scope: { entityId: 'btn-roll' },
        priority: 10,
        actions: [
          { type: 'roll', params: { randomizerId: 'd6' } },
          { type: 'log', params: { message: 'Rolled dice' } },
        ],
      },
      {
        id: 'rule-end-turn',
        trigger: 'button_pressed',
        scope: { entityId: 'btn-end' },
        priority: 10,
        actions: [{ type: 'next_turn', params: {} }],
      },
      {
        id: 'rule-enter-trap',
        trigger: 'piece_enter',
        scope: { entityId: 'cell-1-1' },
        priority: 5,
        actions: [
          { type: 'transfer', params: { counterId: 'gold', fromId: { ref: '$player' }, amount: 25 } },
        ],
      },
    ],
    ui: {
      panels: [],
      buttons: [
        { id: 'btn-roll', label: 'Roll', phases: ['main'] },
        { id: 'btn-end', label: 'End Turn', phases: ['main'] },
      ],
    },
  };
}

describe('BoardGame Engine v2 Core (Cluster A)', () => {
  it('validates valid package and catches orphan references', () => {
    const validPkg = makeSamplePackage();
    expect(validateGamePackage(validPkg)).toEqual({ valid: true, errors: [] });

    const broken = makeSamplePackage();
    broken.pieces[0].zoneId = 'non-existent-zone';
    broken.zones[0].fields = { target: { $ref: 'missing-entity' } };
    const res = validateGamePackage(broken);
    expect(res.valid).toBe(false);
    expect(res.errors.length).toBeGreaterThanOrEqual(2);
  });

  it('produces bit-identical state and checksum when replaying with same seed and log', () => {
    const pkg = makeSamplePackage();
    const actions: GameAction[] = [
      { type: 'start_game' },
      { type: 'exec', playerId: 'p1', spec: { type: 'shuffle', params: { zoneId: 'deck' } } },
      { type: 'press_button', playerId: 'p1', buttonId: 'btn-roll' },
      { type: 'exec', playerId: 'p1', spec: { type: 'draw', params: { fromZoneId: 'deck', toZoneId: 'hand-p1', count: 1 } } },
      { type: 'exec', playerId: 'p1', spec: { type: 'move_piece', params: { pieceId: 'pawn-p1', toZoneId: 'cell-1-1' } } },
      { type: 'press_button', playerId: 'p1', buttonId: 'btn-end' },
    ];

    const run1 = replayLog(pkg, 424242, actions);
    const run2 = replayLog(pkg, 424242, actions);
    expect(run1.error).toBeUndefined();
    expect(run1.checksum).toBe(run2.checksum);
    expect(run1.state.lastRoll).toEqual(run2.state.lastRoll);
    expect(getCounterValue(run1.state, 'gold', 'p1')).toBe(75);
    expect(run1.state.turn.order[run1.state.turn.currentIndex]).toBe('p2');
  });

  it('computes spatial neighbors, distance, and line_of for grid/caro', () => {
    const pkg = makeSamplePackage();
    pkg.pieces.push(
      {
        id: 'x2',
        name: 'X2',
        faces: [{ label: 'X' }],
        activeFace: 0,
        rotation: 0,
        zoneId: 'cell-0-1',
        tags: ['x'],
        fields: {},
      },
      {
        id: 'x3',
        name: 'X3',
        faces: [{ label: 'X' }],
        activeFace: 0,
        rotation: 0,
        zoneId: 'cell-0-2',
        tags: ['x'],
        fields: {},
      }
    );
    const state = createInitialState(pkg, 1);
    expect(getNeighbors(state, 'cell-0-0').sort()).toEqual(['cell-0-1', 'cell-1-0']);
    expect(getDistance(state, 'cell-0-0', 'cell-2-2')).toBe(4);
    const lines = getLineOf(state, 'cell-0-1', 'x', 3);
    expect(lines).toEqual([['cell-0-0', 'cell-0-1', 'cell-0-2']]);
  });

  it('handles pending input and resumes remaining queue cleanly', () => {
    const pkg = makeSamplePackage();
    pkg.turnConfig.phases[0].allowedButtons?.push('btn-choice');
    pkg.rules.push({
      id: 'rule-choice',
      trigger: 'button_pressed',
      scope: { entityId: 'btn-choice' },
      priority: 10,
      actions: [
        {
          type: 'prompt_choice',
          params: {
            prompt: 'Pick bonus',
            targetKey: 'bonus',
            options: [
              { id: 'small', label: '+10', value: 10 },
              { id: 'big', label: '+50', value: 50 },
            ],
          },
        },
        {
          type: 'transfer',
          params: { counterId: 'gold', toId: 'p1', amount: { var: 'bonus' } },
        },
      ],
    });

    let state = createInitialState(pkg, 99);
    state = reduce(state, { type: 'start_game' }, pkg).state;
    const paused = reduce(state, { type: 'press_button', playerId: 'p1', buttonId: 'btn-choice' }, pkg);
    expect(paused.state.pending).not.toBeNull();
    expect(paused.state.pending?.options.length).toBe(2);

    // Reject wrong action while pending
    const blocked = reduce(paused.state, { type: 'press_button', playerId: 'p1', buttonId: 'btn-end' }, pkg);
    expect(blocked.error).toBeDefined();

    // Reject wrong player
    const wrongPlayer = reduce(
      paused.state,
      { type: 'resolve_input', playerId: 'p2', choiceId: 'big' },
      pkg
    );
    expect(wrongPlayer.error).toBeDefined();

    // Resolve properly and resume queue
    const resumed = reduce(
      paused.state,
      { type: 'resolve_input', playerId: 'p1', choiceId: 'big' },
      pkg
    );
    expect(resumed.error).toBeUndefined();
    expect(resumed.state.pending).toBeNull();
    expect(getCounterValue(resumed.state, 'gold', 'p1')).toBe(150);
  });

  it('detects and halts infinite rule loops cleanly without hanging', () => {
    const pkg = makeSamplePackage();
    pkg.rules.push({
      id: 'loop-rule',
      trigger: 'rule_fired',
      scope: { entityId: 'loop-rule' },
      priority: 1,
      actions: [{ type: 'run_rule', params: { ruleId: 'loop-rule' } }],
    });

    let state = createInitialState(pkg, 1);
    state = reduce(state, { type: 'start_game' }, pkg).state;
    const res = reduce(
      state,
      { type: 'exec', playerId: 'p1', spec: { type: 'run_rule', params: { ruleId: 'loop-rule' } } },
      pkg
    );
    expect(res.error).toMatch(/max queue depth/i);
  });

  it('redacts hidden and opponent-owned zones in viewFor', () => {
    const pkg = makeSamplePackage();
    let state = createInitialState(pkg, 7);
    state = reduce(state, { type: 'start_game' }, pkg).state;
    state = reduce(
      state,
      { type: 'exec', playerId: 'p1', spec: { type: 'draw', params: { fromZoneId: 'deck', toZoneId: 'hand-p1', count: 1 } } },
      pkg
    ).state;

    const p1View = viewFor(state, 'p1');
    const p2View = viewFor(state, 'p2');

    // card-3 was top of deck -> moved to hand-p1
    expect(p1View.pieces['card-3'].hidden).toBeUndefined();
    expect(p1View.pieces['card-3'].faces[0].label).toBe('Queen');
    expect(p2View.pieces['card-3'].hidden).toBe(true);
    expect(p2View.pieces['card-3'].faces[0].label).toBe('?');

    // card-1 still in hidden deck -> hidden to both
    expect(p1View.pieces['card-1'].hidden).toBe(true);
    expect(p2View.pieces['card-1'].hidden).toBe(true);
  });

  it('supports undo and redo preserving exact state checksum', () => {
    const pkg = makeSamplePackage();
    let tl = createTimeline(pkg, 123);
    tl = dispatchTimeline(tl, { type: 'start_game' }).timeline;
    tl = dispatchTimeline(tl, {
      type: 'exec',
      playerId: 'p1',
      spec: { type: 'transfer', params: { counterId: 'gold', fromId: 'p1', toId: 'p2', amount: 40 } },
    }).timeline;

    const afterTransferChecksum = computeStateChecksum(tl.present);
    expect(getCounterValue(tl.present, 'gold', 'p1')).toBe(60);
    expect(getCounterValue(tl.present, 'gold', 'p2')).toBe(140);

    tl = undoTimeline(tl);
    expect(getCounterValue(tl.present, 'gold', 'p1')).toBe(100);
    tl = redoTimeline(tl);
    expect(computeStateChecksum(tl.present)).toBe(afterTransferChecksum);
  });
});
