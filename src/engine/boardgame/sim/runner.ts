import {
  EngineState,
  EntityId,
  GameAction,
  GamePackageV2,
} from '../schema/types';
import { getActivePlayerId } from '../core/counterHelpers';
import { evaluateExpr } from '../core/expressions';
import { createInitialState, reduce } from '../core/reducer';
import { nextInt } from '../core/rng';

export interface SimulationMatchResult {
  seed: number;
  ended: boolean;
  winnerIds: EntityId[];
  steps: number;
  round: number;
  error?: string;
  invariantViolations: string[];
  finalState: EngineState;
}

export interface BatchSimulationReport {
  total: number;
  completedCount: number;
  stuckCount: number;
  violationCount: number;
  violations: string[];
  winCounts: Record<string, number>;
  durationMs: number;
}

function checkInvariants(state: EngineState): string[] {
  const violations: string[] = [];
  for (const [key, val] of Object.entries(state.counters)) {
    const parts = key.split(':');
    const counterId = parts[parts.length - 1];
    const def = state.counterDefs[counterId];
    if (def?.min !== undefined && val < def.min) {
      violations.push(`Counter ${key} fell below min (${val} < ${def.min})`);
    }
    if (def?.max !== undefined && val > def.max) {
      violations.push(`Counter ${key} exceeded max (${val} > ${def.max})`);
    }
  }
  return violations;
}

export function runHeadlessMatch(
  pkg: GamePackageV2,
  seed: number,
  maxSteps = 400
): SimulationMatchResult {
  let state = createInitialState(pkg, seed);
  let botRng = (seed ^ 0x9e3779b9) | 0;
  const invariantViolations: string[] = [];

  const startRes = reduce(state, { type: 'start_game' }, pkg, { skipChecksum: true });
  if (startRes.error) {
    return {
      seed,
      ended: false,
      winnerIds: [],
      steps: 0,
      round: state.turn.round,
      error: startRes.error,
      invariantViolations: [startRes.error],
      finalState: startRes.state,
    };
  }
  state = startRes.state;

  let steps = 0;
  while (state.status === 'playing' && steps < maxSteps) {
    steps++;
    let action: GameAction | null = null;

    if (state.pending) {
      const opts = state.pending.options;
      if (opts.length === 0) {
        invariantViolations.push(`Pending input "${state.pending.id}" has 0 options`);
        break;
      }
      const r = nextInt(botRng, 0, opts.length - 1);
      botRng = r.nextState;
      action = {
        type: 'resolve_input',
        playerId: state.pending.playerId,
        choiceId: opts[r.value].id,
      };
    } else {
      const activePlayer = getActivePlayerId(state);
      if (!activePlayer) break;

      const phase = state.turn.phase;
      const validButtons = pkg.ui.buttons.filter((btn) => {
        if (btn.phases && btn.phases.length > 0 && !btn.phases.includes(phase)) {
          return false;
        }
        if (btn.condition !== undefined) {
          return Boolean(
            evaluateExpr(btn.condition, state, { playerId: activePlayer })
          );
        }
        return true;
      });

      if (validButtons.length === 0) {
        invariantViolations.push(`No valid buttons available in phase "${phase}"`);
        break;
      }

      // Avoid instant self-bankruptcy when other actions exist
      const nonBankrupt = validButtons.filter((b) => !b.id.includes('bankrupt'));
      const pool = nonBankrupt.length > 0 ? nonBankrupt : validButtons;
      const r = nextInt(botRng, 0, pool.length - 1);
      botRng = r.nextState;

      action = {
        type: 'press_button',
        playerId: activePlayer,
        buttonId: pool[r.value].id,
      };
    }

    const res = reduce(state, action, pkg, { skipChecksum: true });
    if (res.error) {
      // If a button's rule condition wasn't met (e.g. insufficient funds to buy), try end-turn button
      const activePlayer = getActivePlayerId(state);
      const endBtn = pkg.ui.buttons.find(
        (b) =>
          (b.id.includes('end') || b.id.includes('pass')) &&
          (!b.phases || b.phases.includes(state.turn.phase))
      );
      if (activePlayer && endBtn && action.type === 'press_button' && action.buttonId !== endBtn.id) {
        const fallback = reduce(
          state,
          { type: 'press_button', playerId: activePlayer, buttonId: endBtn.id },
          pkg,
          { skipChecksum: true }
        );
        if (!fallback.error) {
          state = fallback.state;
          invariantViolations.push(...checkInvariants(state));
          continue;
        }
      }
      invariantViolations.push(res.error);
      return {
        seed,
        ended: false,
        winnerIds: [],
        steps,
        round: state.turn.round,
        error: res.error,
        invariantViolations,
        finalState: state,
      };
    }

    state = res.state;
    invariantViolations.push(...checkInvariants(state));
  }

  return {
    seed,
    ended: state.status === 'ended',
    winnerIds: state.winnerIds,
    steps,
    round: state.turn.round,
    invariantViolations: Array.from(new Set(invariantViolations)),
    finalState: state,
  };
}

export function runBatchSimulation(
  pkg: GamePackageV2,
  count = 200,
  baseSeed = 1,
  maxSteps = 400
): BatchSimulationReport {
  const t0 = typeof performance !== 'undefined' ? performance.now() : Date.now();
  let completedCount = 0;
  let stuckCount = 0;
  const allViolations = new Set<string>();
  const winCounts: Record<string, number> = {};

  for (let i = 0; i < count; i++) {
    const res = runHeadlessMatch(pkg, baseSeed + i, maxSteps);
    if (res.ended) {
      completedCount++;
      for (const w of res.winnerIds) {
        winCounts[w] = (winCounts[w] || 0) + 1;
      }
    } else if (res.error) {
      stuckCount++;
    }
    for (const v of res.invariantViolations) {
      allViolations.add(v);
    }
  }

  const t1 = typeof performance !== 'undefined' ? performance.now() : Date.now();
  return {
    total: count,
    completedCount,
    stuckCount,
    violationCount: allViolations.size,
    violations: Array.from(allViolations),
    winCounts,
    durationMs: Math.round((t1 - t0) * 100) / 100,
  };
}
