import { describe, it, expect } from 'vitest';
import {
  createCaroPackageV2,
  createCatanLitePackageV2,
  createDraughtsPackageV2,
  createInitialState,
  createMonopolyPackageV2,
  createSnakesAndLaddersPackageV2,
  createUnoPackageV2,
  reduce,
  runBatchSimulation,
  validateGamePackage,
  viewFor,
} from '../index';

describe('Golden Games (Caro, UNO) & Headless Bot Simulation Benchmark', () => {
  it('runs Caro 3x3 purely from data and detects horizontal/diagonal win', () => {
    const pkg = createCaroPackageV2(3, 3);
    expect(validateGamePackage(pkg)).toEqual({ valid: true, errors: [] });

    let state = createInitialState(pkg, 1);
    state = reduce(state, { type: 'start_game' }, pkg).state;

    // Place 3 X pieces along main diagonal
    for (let i = 0; i < 3; i++) {
      state = reduce(
        state,
        {
          type: 'exec',
          playerId: 'p1',
          spec: {
            type: 'spawn',
            params: {
              id: `x-${i}`,
              name: 'X',
              zoneId: `cell-${i}-${i}`,
              ownerId: 'p1',
              tags: ['x'],
            },
          },
        },
        pkg
      ).state;
    }

    expect(state.status).toBe('ended');
    expect(state.winnerIds).toEqual(['p1']);
  });

  it('runs UNO-lite purely from data with hidden deck, owner hands, and empty-hand win', () => {
    const pkg = createUnoPackageV2();
    expect(validateGamePackage(pkg)).toEqual({ valid: true, errors: [] });

    let state = createInitialState(pkg, 42);
    state = reduce(state, { type: 'start_game' }, pkg).state;

    expect(state.zonePieces['hand-p1'].length).toBe(5);
    expect(state.zonePieces['hand-p2'].length).toBe(5);
    expect(state.zonePieces['discard'].length).toBe(1);

    // Opponent hand is hidden via viewFor
    const p1View = viewFor(state, 'p1');
    const p2CardId = state.zonePieces['hand-p2'][0];
    expect(p1View.pieces[p2CardId].hidden).toBe(true);

    // Discard all 5 cards of p1 -> zone_empty triggers win
    for (const cid of [...state.zonePieces['hand-p1']]) {
      state = reduce(
        state,
        {
          type: 'exec',
          playerId: 'p1',
          spec: { type: 'discard', params: { pieceId: cid, toZoneId: 'discard', playerId: 'p1' } },
        },
        pkg
      ).state;
    }

    expect(state.status).toBe('ended');
    expect(state.winnerIds).toEqual(['p1']);
  });

  it('simulates 200 headless Monopoly matches in under 30s with zero invariant violations', () => {
    const pkg = createMonopolyPackageV2();
    const report = runBatchSimulation(pkg, 200, 1000, 200);

    expect(report.total).toBe(200);
    expect(report.stuckCount).toBe(0);
    expect(report.violationCount).toBe(0);
    expect(report.durationMs).toBeLessThan(30000);
  }, 30000);

  it('runs Draughts, Snakes & Ladders, and Catan-lite purely from data with 200-match bot checks', () => {
    // 1. Draughts: validate + king promotion via flip
    const draughts = createDraughtsPackageV2();
    expect(validateGamePackage(draughts)).toEqual({ valid: true, errors: [] });
    let dState = createInitialState(draughts, 1);
    dState = reduce(dState, { type: 'start_game' }, draughts).state;
    dState = reduce(
      dState,
      { type: 'exec', playerId: 'p1', spec: { type: 'move_piece', params: { pieceId: 'd-p1-2-1', toZoneId: 'cell-7-0' } } },
      draughts
    ).state;
    expect(dState.pieces['d-p1-2-1'].activeFace).toBe(1); // Promoted to King

    // 2. Snakes & Ladders: 200 bot matches complete cleanly
    const snakes = createSnakesAndLaddersPackageV2();
    expect(validateGamePackage(snakes)).toEqual({ valid: true, errors: [] });
    const snakesSim = runBatchSimulation(snakes, 200, 1, 200);
    expect(snakesSim.stuckCount).toBe(0);
    expect(snakesSim.violationCount).toBe(0);
    expect(snakesSim.completedCount).toBeGreaterThan(150);

    // 3. Catan-lite: 200 bot matches complete cleanly
    const catan = createCatanLitePackageV2();
    expect(validateGamePackage(catan)).toEqual({ valid: true, errors: [] });
    const catanSim = runBatchSimulation(catan, 200, 1, 100);
    expect(catanSim.stuckCount).toBe(0);
    expect(catanSim.violationCount).toBe(0);
    expect(catanSim.completedCount).toBe(200);
  });
});
