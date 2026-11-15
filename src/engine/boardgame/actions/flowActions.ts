import { PendingOption } from '../schema/types';
import { getActivePlayerId } from '../core/counterHelpers';
import { evaluateExpr, resolveParam } from '../core/expressions';
import { ActionHandler } from './types';

export const promptChoiceAction: ActionHandler = (state, params, ctx) => {
  const playerId = String(
    resolveParam(params.playerId, state, ctx) ?? getActivePlayerId(state) ?? ''
  );
  const prompt = String(resolveParam(params.prompt, state, ctx) ?? 'Choose an option');
  const targetKey = String(resolveParam(params.targetKey, state, ctx) ?? 'choice');
  const rawOptions = Array.isArray(params.options) ? params.options : [];
  const options: PendingOption[] = rawOptions.map((opt, idx) => {
    if (typeof opt === 'object' && opt !== null && 'id' in opt) {
      const o = opt as PendingOption;
      return { id: String(o.id), label: String(o.label ?? o.id), value: o.value ?? o.id };
    }
    return { id: String(opt ?? idx), label: String(opt ?? idx), value: opt };
  });

  return {
    state,
    events: [],
    pauseForInput: {
      id: `pending-${state.tick}`,
      playerId,
      kind: 'choice',
      prompt,
      options,
      targetKey,
    },
  };
};

export const promptPickAction: ActionHandler = (state, params, ctx) => {
  const playerId = String(
    resolveParam(params.playerId, state, ctx) ?? getActivePlayerId(state) ?? ''
  );
  const prompt = String(resolveParam(params.prompt, state, ctx) ?? 'Pick a target');
  const targetKey = String(resolveParam(params.targetKey, state, ctx) ?? 'picked');
  const candidates = resolveParam(params.candidates, state, ctx);
  const list = Array.isArray(candidates) ? candidates : [];

  const options: PendingOption[] = list.map((id) => ({
    id: String(id),
    label: state.zones[String(id)]?.name || state.pieces[String(id)]?.name || String(id),
    value: id,
  }));

  return {
    state,
    events: [],
    pauseForInput: {
      id: `pending-${state.tick}`,
      playerId,
      kind: 'pick',
      prompt,
      options,
      targetKey,
    },
  };
};

export const showPanelAction: ActionHandler = (state, params, ctx) => {
  const id = String(resolveParam(params.id, state, ctx) ?? `panel-${state.tick}`);
  const title = String(resolveParam(params.title, state, ctx) ?? '');
  const body = String(resolveParam(params.body, state, ctx) ?? '');
  const targetPlayerId = (resolveParam(params.targetPlayerId, state, ctx) as string | null) ?? null;

  const filtered = state.panels.filter((p) => p.id !== id);
  return {
    state: {
      ...state,
      panels: [...filtered, { id, title, body, targetPlayerId }],
    },
    events: [],
  };
};

export const endGameAction: ActionHandler = (state, params, ctx) => {
  const rawWinners = resolveParam(params.winnerIds, state, ctx);
  const singleWinner = resolveParam(params.winnerId, state, ctx);
  const winnerIds: string[] = Array.isArray(rawWinners)
    ? rawWinners.map(String)
    : singleWinner
    ? [String(singleWinner)]
    : [];

  return {
    state: {
      ...state,
      status: 'ended',
      winnerIds,
    },
    events: [],
  };
};

export const runRuleAction: ActionHandler = (state, params, ctx, pkg) => {
  const ruleId = String(resolveParam(params.ruleId, state, ctx) ?? '');
  const rule = pkg.rules.find((r) => r.id === ruleId);
  if (!rule || rule.enabled === false) return { state, events: [] };
  if (rule.condition !== undefined && !evaluateExpr(rule.condition, state, ctx)) {
    return { state, events: [] };
  }

  return {
    state,
    events: [{ type: 'rule_fired', actorId: ctx.playerId ?? null, entityId: ruleId }],
    enqueue: rule.actions,
  };
};

export const logAction: ActionHandler = (state, params, ctx) => {
  const message = String(resolveParam(params.message, state, ctx) ?? '');
  if (!message) return { state, events: [] };
  return {
    state: {
      ...state,
      messages: [...state.messages, message],
    },
    events: [],
  };
};
