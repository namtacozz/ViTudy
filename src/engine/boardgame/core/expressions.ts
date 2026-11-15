import { EngineEvent, EngineState, EntityId, Expr, isRef } from '../schema/types';
import { findEntity, getActivePlayerId, getCounterValue } from './counterHelpers';
import { getDistance, getLineOf, getNeighbors } from './spatial';

export interface EvalContext {
  event?: EngineEvent;
  playerId?: EntityId | null;
  tileId?: EntityId | null;
  pieceId?: EntityId | null;
  targetId?: EntityId | null;
}

export function isExprObject(val: unknown): val is Expr {
  if (val === null || typeof val !== 'object') return false;
  return 'ref' in val || 'var' in val || 'op' in val || 'fn' in val;
}

export function resolveParam(
  val: unknown,
  state: EngineState,
  ctx: EvalContext
): unknown {
  if (isExprObject(val)) {
    return evaluateExpr(val, state, ctx);
  }
  if (isRef(val)) {
    return val.$ref;
  }
  return val;
}

export function evaluateExpr(
  expr: Expr,
  state: EngineState,
  ctx: EvalContext
): unknown {
  if (
    expr === null ||
    typeof expr === 'number' ||
    typeof expr === 'string' ||
    typeof expr === 'boolean'
  ) {
    return expr;
  }

  if ('ref' in expr) {
    switch (expr.ref) {
      case '$player':
        return ctx.playerId ?? ctx.event?.actorId ?? getActivePlayerId(state);
      case '$tile':
      case '$zone':
        return ctx.tileId ?? ctx.event?.targetId ?? ctx.event?.entityId ?? null;
      case '$piece':
        return ctx.pieceId ?? ctx.event?.entityId ?? null;
      case '$target':
        return ctx.targetId ?? ctx.event?.targetId ?? null;
      case '$roll':
        return state.lastRoll?.total ?? null;
      case '$roll_values':
        return state.lastRoll?.values ?? [];
      case '$phase':
        return state.turn.phase;
      case '$event':
        return ctx.event ?? null;
      default:
        return expr.ref;
    }
  }

  if ('var' in expr) {
    if (ctx.event?.data && expr.var in ctx.event.data) {
      return ctx.event.data[expr.var];
    }
    return state.vars[expr.var] ?? null;
  }

  if ('op' in expr) {
    const args = expr.args || [];
    switch (expr.op) {
      case 'and':
        return args.every((a) => Boolean(evaluateExpr(a, state, ctx)));
      case 'or':
        return args.some((a) => Boolean(evaluateExpr(a, state, ctx)));
      case 'not':
        return !evaluateExpr(args[0], state, ctx);
      case '+':
        return Number(evaluateExpr(args[0], state, ctx)) + Number(evaluateExpr(args[1], state, ctx));
      case '-':
        return Number(evaluateExpr(args[0], state, ctx)) - Number(evaluateExpr(args[1], state, ctx));
      case '*':
        return Number(evaluateExpr(args[0], state, ctx)) * Number(evaluateExpr(args[1], state, ctx));
      case '/': {
        const denom = Number(evaluateExpr(args[1], state, ctx));
        return denom === 0 ? 0 : Number(evaluateExpr(args[0], state, ctx)) / denom;
      }
      case '%': {
        const denom = Number(evaluateExpr(args[1], state, ctx));
        return denom === 0 ? 0 : Number(evaluateExpr(args[0], state, ctx)) % denom;
      }
      case '==':
        return evaluateExpr(args[0], state, ctx) === evaluateExpr(args[1], state, ctx);
      case '!=':
        return evaluateExpr(args[0], state, ctx) !== evaluateExpr(args[1], state, ctx);
      case '<':
        return Number(evaluateExpr(args[0], state, ctx)) < Number(evaluateExpr(args[1], state, ctx));
      case '<=':
        return Number(evaluateExpr(args[0], state, ctx)) <= Number(evaluateExpr(args[1], state, ctx));
      case '>':
        return Number(evaluateExpr(args[0], state, ctx)) > Number(evaluateExpr(args[1], state, ctx));
      case '>=':
        return Number(evaluateExpr(args[0], state, ctx)) >= Number(evaluateExpr(args[1], state, ctx));
      case 'in': {
        const needle = evaluateExpr(args[0], state, ctx);
        const haystack = evaluateExpr(args[1], state, ctx);
        if (Array.isArray(haystack)) return haystack.includes(needle);
        if (typeof haystack === 'string') return haystack.includes(String(needle));
        return false;
      }
    }
  }

  if ('fn' in expr) {
    const rawArgs = expr.args || [];
    const evalArg = (i: number) => evaluateExpr(rawArgs[i], state, ctx);

    switch (expr.fn) {
      case 'counter': {
        const counterId = String(evalArg(0));
        const targetId = rawArgs[1] !== undefined ? (evalArg(1) as string | null) : getActivePlayerId(state);
        return getCounterValue(state, counterId, targetId);
      }
      case 'field': {
        const entityId = String(evalArg(0));
        const key = String(evalArg(1));
        const ent = findEntity(state, entityId);
        if (!ent) return null;
        const v = ent.fields[key];
        return isRef(v) ? v.$ref : (v ?? null);
      }
      case 'tag_has': {
        const entityId = String(evalArg(0));
        const tag = String(evalArg(1));
        const ent = findEntity(state, entityId);
        return ent ? ent.tags.includes(tag) : false;
      }
      case 'zone_pieces': {
        const zoneId = String(evalArg(0));
        return state.zonePieces[zoneId] || [];
      }
      case 'zone_of': {
        const pieceId = String(evalArg(0));
        return state.pieces[pieceId]?.zoneId ?? null;
      }
      case 'owner_of': {
        const entityId = String(evalArg(0));
        return state.zones[entityId]?.ownerId ?? state.pieces[entityId]?.ownerId ?? null;
      }
      case 'piece_of': {
        const playerId = String(evalArg(0));
        const tag = rawArgs[1] !== undefined ? String(evalArg(1)) : null;
        const found = Object.values(state.pieces).find(
          (p) => p.ownerId === playerId && (!tag || p.tags.includes(tag))
        );
        return found?.id ?? null;
      }
      case 'track_step': {
        let curId = String(evalArg(0));
        const steps = Math.max(0, Number(evalArg(1) ?? 0));
        const fieldKey = rawArgs[2] !== undefined ? String(evalArg(2)) : 'nextTileId';
        for (let i = 0; i < steps; i++) {
          const z = state.zones[curId];
          const nextRef = z?.fields[fieldKey];
          const nextId = isRef(nextRef) ? nextRef.$ref : typeof nextRef === 'string' ? nextRef : null;
          if (!nextId || !state.zones[nextId]) break;
          curId = nextId;
        }
        return curId;
      }
      case 'track_passed': {
        let curId = String(evalArg(0));
        const steps = Math.max(0, Number(evalArg(1) ?? 0));
        const tag = String(evalArg(2));
        const fieldKey = rawArgs[3] !== undefined ? String(evalArg(3)) : 'nextTileId';
        for (let i = 0; i < steps; i++) {
          const z = state.zones[curId];
          const nextRef = z?.fields[fieldKey];
          const nextId = isRef(nextRef) ? nextRef.$ref : typeof nextRef === 'string' ? nextRef : null;
          if (!nextId || !state.zones[nextId]) break;
          curId = nextId;
          if (state.zones[curId].tags.includes(tag)) return true;
        }
        return false;
      }
      case 'dice_is_double': {
        const vals = state.lastRoll?.values || [];
        return vals.length >= 2 && new Set(vals).size === 1;
      }
      case 'active_players': {
        return state.turn.order.filter((pid) => state.players[pid] && !state.players[pid].eliminated);
      }
      case 'in_zone': {
        const pieceId = String(evalArg(0));
        const zoneId = String(evalArg(1));
        return state.pieces[pieceId]?.zoneId === zoneId;
      }
      case 'neighbors': {
        const zoneId = String(evalArg(0));
        return getNeighbors(state, zoneId);
      }
      case 'line_of': {
        const tag = String(evalArg(0));
        const length = Number(evalArg(1));
        const startZone =
          rawArgs[2] !== undefined ? (evalArg(2) as string | null) : (ctx.tileId ?? null);
        return getLineOf(state, startZone, tag, length);
      }
      case 'distance': {
        const a = String(evalArg(0));
        const b = String(evalArg(1));
        return getDistance(state, a, b);
      }
      case 'len':
      case 'count': {
        const list = evalArg(0);
        if (Array.isArray(list)) return list.length;
        return 0;
      }
      case 'sum': {
        const list = evalArg(0);
        if (!Array.isArray(list)) return 0;
        return list.reduce((acc, item) => acc + Number(item || 0), 0);
      }
      case 'any': {
        const list = evalArg(0);
        if (!Array.isArray(list)) return false;
        return list.some(Boolean);
      }
      case 'all': {
        const list = evalArg(0);
        if (!Array.isArray(list)) return false;
        return list.length > 0 && list.every(Boolean);
      }
      case 'get': {
        const obj = evalArg(0) as Record<string, unknown> | unknown[] | null;
        const key = evalArg(1);
        if (Array.isArray(obj) && typeof key === 'number') return obj[key] ?? null;
        if (obj && typeof obj === 'object') return (obj as Record<string, unknown>)[String(key)] ?? null;
        return null;
      }
    }
  }

  return null;
}
