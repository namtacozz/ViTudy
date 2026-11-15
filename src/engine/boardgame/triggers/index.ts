import { EngineEvent, EngineState, Rule, TriggerType } from '../schema/types';
import { findEntity, getActivePlayerId } from '../core/counterHelpers';
import { EvalContext, evaluateExpr } from '../core/expressions';

export type RuleIndex = Record<TriggerType, Rule[]>;

const ALL_TRIGGERS: TriggerType[] = [
  'game_start',
  'turn_start',
  'turn_end',
  'phase_enter',
  'piece_enter',
  'piece_leave',
  'dice_rolled',
  'card_played',
  'counter_changed',
  'button_pressed',
  'zone_empty',
  'rule_fired',
];

export function buildRuleIndex(rules: readonly Rule[]): RuleIndex {
  const index = {} as RuleIndex;
  for (const t of ALL_TRIGGERS) {
    index[t] = [];
  }
  for (const rule of rules) {
    if (rule.enabled === false) continue;
    index[rule.trigger]?.push(rule);
  }
  for (const t of ALL_TRIGGERS) {
    index[t].sort((a, b) => b.priority - a.priority);
  }
  return index;
}

function matchesScope(rule: Rule, event: EngineEvent, state: EngineState): boolean {
  if (!rule.scope) return true;
  const { entityId, tag } = rule.scope;

  const candidateIds = [event.entityId, event.targetId, event.actorId].filter(
    (x): x is string => typeof x === 'string' && x.length > 0
  );

  if (entityId && !candidateIds.includes(entityId)) {
    return false;
  }

  if (tag) {
    const anyTagged = candidateIds.some((id) => {
      const ent = findEntity(state, id);
      return ent ? ent.tags.includes(tag) : false;
    });
    if (!anyTagged) return false;
  }

  return true;
}

export function matchRules(
  index: RuleIndex,
  event: EngineEvent,
  state: EngineState
): Rule[] {
  const candidates = index[event.type] || [];
  if (candidates.length === 0) return [];

  const ctx: EvalContext = {
    event,
    playerId: event.actorId ?? getActivePlayerId(state),
    tileId: event.targetId ?? event.entityId ?? null,
    pieceId: event.entityId ?? null,
    targetId: event.targetId ?? null,
  };

  return candidates.filter((rule) => {
    if (!matchesScope(rule, event, state)) return false;
    if (rule.condition !== undefined) {
      return Boolean(evaluateExpr(rule.condition, state, ctx));
    }
    return true;
  });
}
