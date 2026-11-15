import { describe, it, expect } from 'vitest';
import {
  createInitialState,
  createMonopolyPackageV2,
  getCounterValue,
  makeCounterKey,
  reduce,
  replayLog,
  sumNotes,
  validateGamePackage,
} from '../index';

describe('Cluster B & D: Denominated Ledger & Data-Driven Monopoly v2', () => {
  it('validates Monopoly v2 package cleanly with zero errors', () => {
    const pkg = createMonopolyPackageV2();
    expect(validateGamePackage(pkg)).toEqual({ valid: true, errors: [] });
  });

  it('tracks VND denominated notes accurately on init and transfer, and rejects tampering', () => {
    const pkg = createMonopolyPackageV2({ startingCash: 1800000 });
    let state = createInitialState(pkg, 100);
    state = reduce(state, { type: 'start_game' }, pkg).state;

    const p1Key = makeCounterKey('cash', 'player', 'p1');
    expect(sumNotes(state.denominatedCounters[p1Key])).toBe(1800000);

    // Transfer 350,000 from p1 to p2
    const res = reduce(
      state,
      {
        type: 'exec',
        playerId: 'p1',
        spec: {
          type: 'transfer',
          params: { counterId: 'cash', fromId: 'p1', toId: 'p2', amount: 350000, reason: 'Mua bán' },
        },
      },
      pkg
    );
    expect(res.error).toBeUndefined();
    expect(getCounterValue(res.state, 'cash', 'p1')).toBe(1450000);
    expect(getCounterValue(res.state, 'cash', 'p2')).toBe(2150000);
    expect(sumNotes(res.state.denominatedCounters[p1Key])).toBe(1450000);
    expect(res.state.bankLogs.length).toBe(1);
    expect(res.state.bankLogs[0].notes?.[200000]).toBe(1);
    expect(res.state.bankLogs[0].notes?.[100000]).toBe(1);
    expect(res.state.bankLogs[0].notes?.[50000]).toBe(1);

    // Reject insufficient funds
    const overdraw = reduce(
      res.state,
      {
        type: 'exec',
        playerId: 'p1',
        spec: {
          type: 'transfer',
          params: { counterId: 'cash', fromId: 'p1', toId: 'p2', amount: 9999999 },
        },
      },
      pkg
    );
    expect(overdraw.error).toMatch(/Insufficient/i);

    // Detect accidental state tampering via stateChecksum
    const tampered = {
      ...res.state,
      counters: { ...res.state.counters, [p1Key]: 99999999 },
    };
    const tamperedRes = reduce(tampered, { type: 'press_button', playerId: 'p1', buttonId: 'btn-end-turn' }, pkg);
    expect(tamperedRes.error).toMatch(/checksum mismatch/i);
  });

  it('supports buying property, upgrading houses, collecting rent, and mortgaging', () => {
    const pkg = createMonopolyPackageV2();
    let state = createInitialState(pkg, 7);
    state = reduce(state, { type: 'start_game' }, pkg).state;

    // Move p1 to tile-1 (Hà Nội: price 200k, baseRent 40k, houseCost 100k, rent1 80k, resell 100k)
    state = reduce(
      state,
      { type: 'exec', playerId: 'p1', spec: { type: 'move_piece', params: { pieceId: 'pawn-p1', toZoneId: 'tile-1' } } },
      pkg
    ).state;
    state = reduce(
      state,
      { type: 'exec', playerId: 'p1', spec: { type: 'set_phase', params: { phase: 'action' } } },
      pkg
    ).state;

    // P1 buys tile-1
    state = reduce(state, { type: 'press_button', playerId: 'p1', buttonId: 'btn-buy' }, pkg).state;
    expect(state.zones['tile-1'].ownerId).toBe('p1');
    expect(getCounterValue(state, 'cash', 'p1')).toBe(1600000);

    // P1 upgrades 1 house
    state = reduce(state, { type: 'press_button', playerId: 'p1', buttonId: 'btn-upgrade' }, pkg).state;
    expect(state.zones['tile-1'].fields.houseCount).toBe(1);
    expect(getCounterValue(state, 'cash', 'p1')).toBe(1500000);

    // End P1 turn -> P2 turn
    state = reduce(state, { type: 'press_button', playerId: 'p1', buttonId: 'btn-end-turn' }, pkg).state;
    expect(state.turn.order[state.turn.currentIndex]).toBe('p2');

    // P2 lands on tile-1 -> pays rent1 (80,000) to P1 automatically
    state = reduce(
      state,
      { type: 'exec', playerId: 'p2', spec: { type: 'move_piece', params: { pieceId: 'pawn-p2', toZoneId: 'tile-1' } } },
      pkg
    ).state;
    expect(getCounterValue(state, 'cash', 'p2')).toBe(1720000);
    expect(getCounterValue(state, 'cash', 'p1')).toBe(1580000);

    // P1 mortgages tile-1 -> gets 100k, and P2 landing again pays 0 rent
    state = reduce(
      state,
      { type: 'exec', playerId: 'p1', spec: { type: 'move_piece', params: { pieceId: 'pawn-p1', toZoneId: 'tile-1' } } },
      pkg
    ).state;
    // Switch back to p1 for mortgage test
    state = reduce(state, { type: 'exec', playerId: 'p2', spec: { type: 'set_phase', params: { phase: 'action' } } }, pkg).state;
    state = reduce(state, { type: 'press_button', playerId: 'p2', buttonId: 'btn-end-turn' }, pkg).state;
    state = reduce(state, { type: 'exec', playerId: 'p1', spec: { type: 'set_phase', params: { phase: 'action' } } }, pkg).state;
    state = reduce(state, { type: 'press_button', playerId: 'p1', buttonId: 'btn-mortgage' }, pkg).state;
    expect(state.zones['tile-1'].fields.isMortgaged).toBe(true);
    expect(getCounterValue(state, 'cash', 'p1')).toBe(1680000);

    const p2Before = getCounterValue(state, 'cash', 'p2');
    state = reduce(
      state,
      { type: 'exec', playerId: 'p2', spec: { type: 'move_piece', params: { pieceId: 'pawn-p2', toZoneId: 'tile-1' } } },
      pkg
    ).state;
    expect(getCounterValue(state, 'cash', 'p2')).toBe(p2Before);
  });

  it('handles penalty, draw_card, jail, pass-Start salary, and bankruptcy win condition', () => {
    const pkg = createMonopolyPackageV2();
    let state = createInitialState(pkg, 12);
    state = reduce(state, { type: 'start_game' }, pkg).state;

    // Landing on penalty (tile-6: 100k)
    state = reduce(
      state,
      { type: 'exec', playerId: 'p1', spec: { type: 'move_piece', params: { pieceId: 'pawn-p1', toZoneId: 'tile-6' } } },
      pkg
    ).state;
    expect(getCounterValue(state, 'cash', 'p1')).toBe(1700000);

    // Landing on draw_card (tile-2) draws a chance card
    state = reduce(
      state,
      { type: 'exec', playerId: 'p1', spec: { type: 'move_piece', params: { pieceId: 'pawn-p1', toZoneId: 'tile-2' } } },
      pkg
    ).state;
    expect(state.zonePieces['chance-discard'].length).toBe(1);

    // Landing on jail (tile-4) sets jail_turns = 2
    state = reduce(
      state,
      { type: 'exec', playerId: 'p1', spec: { type: 'move_piece', params: { pieceId: 'pawn-p1', toZoneId: 'tile-4' } } },
      pkg
    ).state;
    expect(getCounterValue(state, 'jail_turns', 'p1')).toBe(2);

    // Roll doubles -> released from jail immediately
    state = reduce(
      state,
      { type: 'exec', playerId: 'p1', spec: { type: 'roll', params: { randomizerId: 'd6', forcedValues: [3, 3] } } },
      pkg
    ).state;
    expect(getCounterValue(state, 'jail_turns', 'p1')).toBe(0);
    expect(state.pieces['pawn-p1'].zoneId).toBe('tile-10'); // tile-4 + 6 = tile-10 (also penalty 150k)
    expect(getCounterValue(state, 'cash', 'p1')).toBe(1550000);

    // Pass Start from tile-10 with roll 4 -> lands on tile-2 and gets +200k salary
    state = reduce(
      state,
      { type: 'exec', playerId: 'p1', spec: { type: 'roll', params: { randomizerId: 'd6', forcedValues: [2, 2] } } },
      pkg
    ).state;
    // Simulate btn-roll flow from tile-10: move_piece 4 steps -> tile-2
    const p1CashBeforePass = getCounterValue(state, 'cash', 'p1');
    state = reduce(
      state,
      { type: 'exec', playerId: 'p1', spec: { type: 'move_piece', params: { pieceId: 'pawn-p1', toZoneId: 'tile-2' } } },
      pkg
    ).state;
    expect(getCounterValue(state, 'cash', 'p1')).toBe(p1CashBeforePass + 200000);

    // P1 declares bankruptcy -> P2 wins
    state = reduce(state, { type: 'press_button', playerId: 'p1', buttonId: 'btn-bankrupt' }, pkg).state;
    expect(state.status).toBe('ended');
    expect(state.winnerIds).toEqual(['p2']);

    // Deterministic replay check
    const replayed = replayLog(
      pkg,
      12,
      state.logs.map((l) => l.action)
    );
    expect(replayed.checksum).toBe(state.stateChecksum);
  });
});
