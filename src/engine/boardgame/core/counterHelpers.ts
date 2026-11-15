import { CounterScope, EngineState, EntityId } from '../schema/types';

export function makeCounterKey(
  counterId: EntityId,
  scope: CounterScope,
  ownerId?: EntityId | null
): string {
  if (scope === 'global') return `global:${counterId}`;
  return `${scope}:${ownerId || 'none'}:${counterId}`;
}

export function resolveCounterKey(
  state: EngineState,
  counterId: EntityId,
  targetId?: EntityId | null
): string {
  const def = state.counterDefs[counterId];
  const scope: CounterScope = def?.scope ?? (targetId ? 'player' : 'global');
  return makeCounterKey(counterId, scope, targetId);
}

export function getCounterValue(
  state: EngineState,
  counterId: EntityId,
  targetId?: EntityId | null
): number {
  const key = resolveCounterKey(state, counterId, targetId);
  if (key in state.counters) return state.counters[key];
  return state.counterDefs[counterId]?.initial ?? 0;
}

export function clampCounterValue(
  state: EngineState,
  counterId: EntityId,
  value: number
): number {
  const def = state.counterDefs[counterId];
  let v = value;
  if (def?.min !== undefined && v < def.min) v = def.min;
  if (def?.max !== undefined && v > def.max) v = def.max;
  return v;
}

export function getActivePlayerId(state: EngineState): EntityId | null {
  const { order, currentIndex } = state.turn;
  if (order.length === 0) return null;
  return order[currentIndex] ?? null;
}

export function findEntity(
  state: EngineState,
  entityId: EntityId
): { fields: Record<string, unknown>; tags: string[]; ownerId?: EntityId | null } | null {
  return (
    state.pieces[entityId] ||
    state.zones[entityId] ||
    state.players[entityId] ||
    state.counterDefs[entityId] ||
    state.randomizers[entityId] ||
    null
  );
}
