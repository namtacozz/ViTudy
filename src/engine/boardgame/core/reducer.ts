import {
  ActionLogEntry,
  EngineEvent,
  EngineState,
  GameAction,
  GamePackageV2,
  QueuedItem,
  ReduceResult,
} from '../schema/types';
import { ACTION_REGISTRY } from '../actions';
import { buildRuleIndex, matchRules, RuleIndex } from '../triggers';
import { getActivePlayerId, makeCounterKey } from './counterHelpers';
import { computeStateChecksum, verifyStateChecksum } from './checksum';
import { breakAmountIntoNotes, DEFAULT_VND_DENOMINATIONS } from './denomination';
import { EvalContext } from './expressions';

export const MAX_QUEUE_DEPTH = 64;

const ruleIndexCache = new WeakMap<GamePackageV2, RuleIndex>();

function getRuleIndex(pkg: GamePackageV2): RuleIndex {
  let cached = ruleIndexCache.get(pkg);
  if (!cached) {
    cached = buildRuleIndex(pkg.rules);
    ruleIndexCache.set(pkg, cached);
  }
  return cached;
}

export function createInitialState(pkg: GamePackageV2, seed = 1337): EngineState {
  const zones: EngineState['zones'] = {};
  const zonePieces: EngineState['zonePieces'] = {};
  for (const z of pkg.zones) {
    zones[z.id] = { ...z, tags: [...z.tags], fields: { ...z.fields } };
    zonePieces[z.id] = [];
  }

  const pieces: EngineState['pieces'] = {};
  for (const p of pkg.pieces) {
    pieces[p.id] = {
      ...p,
      faces: p.faces.map((f) => ({ ...f })),
      tags: [...p.tags],
      fields: { ...p.fields },
    };
    if (p.zoneId && zonePieces[p.zoneId]) {
      zonePieces[p.zoneId].push(p.id);
    }
  }

  const players: EngineState['players'] = {};
  const sortedPlayers = [...pkg.players].sort((a, b) => a.seat - b.seat);
  const order: string[] = [];
  for (const pl of sortedPlayers) {
    players[pl.id] = { ...pl, tags: [...pl.tags], fields: { ...pl.fields } };
    order.push(pl.id);
  }

  const counterDefs: EngineState['counterDefs'] = {};
  const counters: Record<string, number> = {};
  const denominatedCounters: Record<string, Record<number, number>> = {};
  for (const c of pkg.counters) {
    counterDefs[c.id] = { ...c, tags: [...c.tags], fields: { ...c.fields } };
    const denoms = c.denominations?.length ? c.denominations : DEFAULT_VND_DENOMINATIONS;
    if (c.scope === 'global') {
      const key = makeCounterKey(c.id, 'global');
      counters[key] = c.initial;
      if (c.kind === 'denominated') {
        denominatedCounters[key] = breakAmountIntoNotes(c.initial, denoms);
      }
    } else if (c.scope === 'player') {
      for (const pid of order) {
        const key = makeCounterKey(c.id, 'player', pid);
        counters[key] = c.initial;
        if (c.kind === 'denominated') {
          denominatedCounters[key] = breakAmountIntoNotes(c.initial, denoms);
        }
      }
    }
  }

  const randomizers: EngineState['randomizers'] = {};
  for (const r of pkg.randomizers) {
    randomizers[r.id] = { ...r, tags: [...r.tags], fields: { ...r.fields } };
  }

  const initial: EngineState = {
    schemaVersion: 2,
    packageId: pkg.id,
    seed,
    rngState: seed | 0,
    tick: 0,
    status: 'idle',
    winnerIds: [],
    turn: {
      order,
      currentIndex: 0,
      direction: 1,
      phase: pkg.turnConfig.initialPhase,
      round: 1,
      skippedPlayers: {},
      extraTurns: {},
    },
    zones,
    pieces,
    zonePieces,
    counters,
    counterDefs,
    denominatedCounters,
    randomizers,
    players,
    pending: null,
    vars: {},
    panels: [],
    messages: [],
    bankLogs: [],
    lastRoll: null,
    logs: [],
  };
  return { ...initial, stateChecksum: computeStateChecksum(initial) };
}

function enqueueRulesForEvent(
  event: EngineEvent,
  state: EngineState,
  ruleIndex: RuleIndex,
  depth: number,
  queue: QueuedItem[],
  emittedEvents: EngineEvent[]
) {
  const matched = matchRules(ruleIndex, event, state);
  const newItems: QueuedItem[] = [];
  for (const rule of matched) {
    if (event.type !== 'rule_fired') {
      emittedEvents.push({
        type: 'rule_fired',
        actorId: event.actorId ?? null,
        entityId: rule.id,
      });
    }
    for (const spec of rule.actions) {
      newItems.push({
        kind: 'action',
        spec,
        eventContext: event,
        depth: depth + 1,
      });
    }
  }
  if (newItems.length > 0) {
    queue.unshift(...newItems);
  }
}

function runQueue(
  initialState: EngineState,
  initialQueue: QueuedItem[],
  pkg: GamePackageV2,
  ruleIndex: RuleIndex,
  initialEvents: EngineEvent[] = []
): ReduceResult {
  let state = initialState;
  const queue = [...initialQueue];
  const allEvents: EngineEvent[] = [...initialEvents];
  let steps = 0;

  // Dispatch rules for initial events before draining action queue
  for (const ev of initialEvents) {
    enqueueRulesForEvent(ev, state, ruleIndex, 0, queue, allEvents);
  }

  while (queue.length > 0) {
    if (state.status === 'ended') break;

    const item = queue.shift()!;
    steps++;
    if (item.depth > MAX_QUEUE_DEPTH || steps > MAX_QUEUE_DEPTH * 4) {
      return {
        state,
        events: allEvents,
        error: `Rule execution exceeded max queue depth (${MAX_QUEUE_DEPTH}). Possible infinite loop.`,
      };
    }

    const handler = ACTION_REGISTRY[item.spec.type];
    if (!handler) {
      return {
        state,
        events: allEvents,
        error: `Unknown action type "${item.spec.type}"`,
      };
    }

    const ctx: EvalContext = {
      event: item.eventContext,
      playerId: item.eventContext?.actorId ?? getActivePlayerId(state),
      tileId: item.eventContext?.targetId ?? item.eventContext?.entityId ?? null,
      pieceId: item.eventContext?.entityId ?? null,
      targetId: item.eventContext?.targetId ?? null,
    };

    const res = handler(state, item.spec.params || {}, ctx, pkg);
    if (res.error) {
      return { state: res.state, events: allEvents, error: res.error };
    }
    state = res.state;

    if (res.enqueue && res.enqueue.length > 0) {
      const childItems: QueuedItem[] = res.enqueue.map((spec) => ({
        kind: 'action',
        spec,
        eventContext: item.eventContext,
        depth: item.depth + 1,
      }));
      queue.unshift(...childItems);
    }

    if (res.pauseForInput) {
      state = {
        ...state,
        pending: {
          ...res.pauseForInput,
          resumeQueue: queue,
        },
      };
      return { state, events: allEvents };
    }

    if (res.events.length > 0) {
      allEvents.push(...res.events);
      // Enqueue triggered rules in reverse order so higher-priority rules stay at front
      for (let i = res.events.length - 1; i >= 0; i--) {
        enqueueRulesForEvent(res.events[i], state, ruleIndex, item.depth, queue, allEvents);
      }
    }
  }

  return { state, events: allEvents };
}

function finalizeLoggedState(
  result: ReduceResult,
  playerId: string | null,
  action: GameAction,
  skipChecksum = false
): ReduceResult {
  const entry: ActionLogEntry = {
    seq: result.state.logs.length + 1,
    tick: result.state.tick,
    playerId,
    action,
  };
  const withLog = { ...result.state, logs: [...result.state.logs, entry] };
  if (skipChecksum) {
    return { ...result, state: withLog };
  }
  const checksum = computeStateChecksum(withLog);
  entry.checksumAfter = checksum;
  return { ...result, state: { ...withLog, stateChecksum: checksum } };
}

export function reduce(
  state: EngineState,
  action: GameAction,
  pkg: GamePackageV2,
  options?: { skipChecksum?: boolean }
): ReduceResult {
  const skipChecksum = Boolean(options?.skipChecksum);
  if (!skipChecksum) {
    const integrity = verifyStateChecksum(state);
    if (!integrity.valid) {
      return {
        state,
        events: [],
        error: `State checksum mismatch (expected ${integrity.expected}, got ${integrity.actual})`,
      };
    }
  }
  if (state.status === 'ended') {
    return { state, events: [], error: 'Game has already ended' };
  }

  // When waiting for player choice, only resolve_input from that player is accepted
  if (state.pending) {
    if (action.type !== 'resolve_input') {
      return {
        state,
        events: [],
        error: `Waiting for pending input from player "${state.pending.playerId}"`,
      };
    }
    if (action.playerId !== state.pending.playerId) {
      return {
        state,
        events: [],
        error: `Only player "${state.pending.playerId}" can resolve pending input`,
      };
    }

    const chosen = state.pending.options.find((o) => o.id === action.choiceId);
    if (!chosen) {
      return {
        state,
        events: [],
        error: `Invalid choiceId "${action.choiceId}"`,
      };
    }

    const resumeQueue = state.pending.resumeQueue;
    const targetKey = state.pending.targetKey;
    const nextState: EngineState = {
      ...state,
      tick: state.tick + 1,
      pending: null,
      vars: { ...state.vars, [targetKey]: chosen.value },
    };

    const ruleIndex = getRuleIndex(pkg);
    const result = runQueue(nextState, resumeQueue, pkg, ruleIndex);
    if (!result.error) {
      return finalizeLoggedState(result, action.playerId, action, skipChecksum);
    }
    return result;
  }

  const ruleIndex = getRuleIndex(pkg);
  let nextState: EngineState = { ...state, tick: state.tick + 1 };
  let initialQueue: QueuedItem[] = [];
  let initialEvents: EngineEvent[] = [];
  let actorId: string | null = getActivePlayerId(state);

  if (action.type === 'start_game') {
    if (state.status !== 'idle') {
      return { state, events: [], error: 'Game already started' };
    }
    const firstPlayer = getActivePlayerId(nextState);
    nextState = { ...nextState, status: 'playing' };
    initialEvents = [
      { type: 'game_start', actorId: firstPlayer },
      ...(firstPlayer ? [{ type: 'turn_start' as const, actorId: firstPlayer }] : []),
      { type: 'phase_enter', actorId: firstPlayer, entityId: nextState.turn.phase },
    ];
  } else if (action.type === 'press_button') {
    actorId = action.playerId;
    const phaseDef = pkg.turnConfig.phases.find((p) => p.id === state.turn.phase);
    if (
      phaseDef?.allowedButtons &&
      phaseDef.allowedButtons.length > 0 &&
      !phaseDef.allowedButtons.includes(action.buttonId)
    ) {
      return {
        state,
        events: [],
        error: `Button "${action.buttonId}" is not allowed in phase "${state.turn.phase}"`,
      };
    }
    initialEvents = [
      {
        type: 'button_pressed',
        actorId: action.playerId,
        entityId: action.buttonId,
      },
    ];
  } else if (action.type === 'exec') {
    actorId = action.playerId ?? actorId;
    initialQueue = [
      {
        kind: 'action',
        spec: action.spec,
        eventContext: { type: 'rule_fired', actorId },
        depth: 0,
      },
    ];
  }

  const result = runQueue(nextState, initialQueue, pkg, ruleIndex, initialEvents);
  if (!result.error) {
    return finalizeLoggedState(result, actorId, action, skipChecksum);
  }

  return result;
}
