import {
  BoardGamePackage,
  calculateBalanceTotal,
} from '@/types/boardgame';
import {
  CounterDef,
  EngineState,
  GamePackageV2,
  Piece,
  PlayerDef,
  Rule,
  Zone,
} from './types';
import { computeStateChecksum } from '../core/checksum';
import { makeCounterKey } from '../core/counterHelpers';
import { breakAmountIntoNotes, DEFAULT_VND_DENOMINATIONS } from '../core/denomination';
import { createInitialState } from '../core/reducer';

export function isPackageV2(input: unknown): input is GamePackageV2 {
  return (
    typeof input === 'object' &&
    input !== null &&
    (input as { schemaVersion?: unknown }).schemaVersion === 2
  );
}

export interface MigrationResult {
  pkg: GamePackageV2;
  state: EngineState;
  migratedFromV1: boolean;
}

/**
 * Idempotent v1 -> v2 migrator (Cluster C).
 * Preserves in-progress matchState (balances, pawn positions, hands, jail turns, bankruptcy, winner).
 */
export function migrateV1toV2(
  input: BoardGamePackage | GamePackageV2,
  seed = 1337
): MigrationResult {
  if (isPackageV2(input)) {
    return {
      pkg: input,
      state: createInitialState(input, seed),
      migratedFromV1: false,
    };
  }

  const v1 = input;
  const ms = v1.matchState || ({} as BoardGamePackage['matchState']);
  const bankruptSet = new Set(ms.bankruptPlayerIds || []);

  // 1. Players
  const playerIds: string[] =
    ms.turnOrder && ms.turnOrder.length > 0
      ? [...ms.turnOrder]
      : v1.pawns && v1.pawns.length > 0
      ? Array.from(new Set(v1.pawns.map((p) => p.controlledByUserId || p.id)))
      : ['p1', 'p2'];

  const players: PlayerDef[] = playerIds.map((pid, idx) => ({
    id: pid,
    name: ms.playerNames?.[pid] || `Người chơi ${idx + 1}`,
    seat: idx,
    handZoneId: `hand-${pid}`,
    eliminated: bankruptSet.has(pid),
    tags: ['player'],
    fields: {},
  }));

  // Build deed ownership map from v1 decks
  const deedOwnerByTileId = new Map<string, string>();
  for (const deck of v1.decks || []) {
    for (const card of deck.cards || []) {
      if (card.linkedTileId && card.ownerPlayerId) {
        deedOwnerByTileId.set(card.linkedTileId, card.ownerPlayerId);
      }
    }
  }

  // Compute perimeter_ring clockwise order if applicable
  const tileLayout =
    v1.mapConfig?.layoutMode === 'hex_grid'
      ? 'hex'
      : v1.mapConfig?.layoutMode === 'node_graph'
      ? 'graph'
      : v1.mapConfig?.layoutMode === 'freeform'
      ? 'free'
      : 'grid';

  const trackTiles = [...(v1.tiles || [])].filter(
    (t) => t.role !== 'external_info' && t.role !== 'bank_zone' && t.role !== 'dice_drop_zone'
  );
  const nextTileMap = new Map<string, string>();
  if (v1.mapConfig?.layoutMode === 'perimeter_ring' && trackTiles.length > 1) {
    const rows = v1.mapConfig.rows || 11;
    const cols = v1.mapConfig.cols || 11;
    const ordered = [...trackTiles].sort((a, b) => {
      const rank = (t: typeof a) => {
        const r = t.gridRow ?? 0;
        const c = t.gridCol ?? 0;
        if (r === 0) return c;
        if (c === cols - 1) return cols + r;
        if (r === rows - 1) return cols + rows + (cols - 1 - c);
        return cols * 2 + rows + (rows - 1 - r);
      };
      return rank(a) - rank(b);
    });
    for (let i = 0; i < ordered.length; i++) {
      nextTileMap.set(ordered[i].id, ordered[(i + 1) % ordered.length].id);
    }
  }

  // 2. Zones from tiles, decks, hands
  const zones: Zone[] = (v1.tiles || []).map((t) => {
    const tags: string[] = [t.role];
    if (t.role === 'start_tile') tags.push('start', 'track');
    else if (t.role === 'jail_tile') tags.push('jail', 'track');
    else if (t.role === 'penalty_tile') tags.push('penalty', 'track');
    else if (t.role === 'draw_card_tile') tags.push('draw_card', 'track');
    else if (t.propertyDetails || (t.price && t.price > 0)) tags.push('property', 'track');

    const fields: Zone['fields'] = {};
    if (t.price !== undefined) fields.price = t.price;
    if (t.penaltyAmount !== undefined) fields.penaltyAmount = t.penaltyAmount;
    if (t.jailTurns !== undefined) fields.jailTurns = t.jailTurns;
    if (t.imageUrl) fields.imageUrl = t.imageUrl;
    if (t.propertyDetails) {
      fields.baseRent = t.propertyDetails.baseRent;
      fields.houseCost = t.propertyDetails.houseCost;
      fields.resellValue = t.propertyDetails.resellValue;
      fields.houseCount = t.propertyDetails.currentHouses;
      fields.isMortgaged = Boolean(t.propertyDetails.isMortgaged);
      t.propertyDetails.rentsByLevel.forEach((rent, i) => {
        fields[`rent${i + 1}`] = rent;
      });
    }
    const nextId = t.nextTileIds?.[0] || nextTileMap.get(t.id);
    if (nextId) {
      fields.nextTileId = { $ref: nextId };
    }

    return {
      id: t.id,
      name: t.title || t.id,
      layout: tileLayout,
      coords:
        t.gridRow !== undefined && t.gridCol !== undefined
          ? { row: t.gridRow, col: t.gridCol, x: t.relX, y: t.relY }
          : undefined,
      neighbors: t.nextTileIds?.length ? [...t.nextTileIds] : undefined,
      visibility: 'public',
      ownerId: deedOwnerByTileId.get(t.id) ?? null,
      tags,
      fields,
    };
  });

  const zoneIdSet = new Set(zones.map((z) => z.id));

  for (const deck of v1.decks || []) {
    if (!zoneIdSet.has(deck.id)) {
      zones.push({
        id: deck.id,
        name: deck.name,
        layout: 'stack',
        visibility: deck.deckType === 'draw_deck' ? 'hidden' : 'public',
        tags: ['deck', deck.deckType],
        fields: {},
      });
      zoneIdSet.add(deck.id);
    }
  }

  for (const p of players) {
    if (p.handZoneId && !zoneIdSet.has(p.handZoneId)) {
      zones.push({
        id: p.handZoneId,
        name: `Tay bài ${p.name}`,
        layout: 'list',
        visibility: 'owner',
        ownerId: p.id,
        tags: ['hand'],
        fields: {},
      });
      zoneIdSet.add(p.handZoneId);
    }
  }

  // Apply links as Ref fields on source zones
  const zoneById = new Map(zones.map((z) => [z.id, z]));
  for (const link of v1.links || []) {
    const src = zoneById.get(link.sourceId);
    if (!src || !zoneIdSet.has(link.targetId)) continue;
    if (link.linkType === 'on_step_show_info') {
      src.fields.infoZoneId = { $ref: link.targetId };
    } else if (link.linkType === 'on_step_draw_deck') {
      src.fields.deckZoneId = { $ref: link.targetId };
    } else if (link.linkType === 'teleport_link') {
      src.fields.teleportTo = { $ref: link.targetId };
    } else if (link.linkType === 'graph_edge') {
      src.neighbors = Array.from(new Set([...(src.neighbors || []), link.targetId]));
    }
  }

  // 3. Pieces (pawns + deck cards + player hands + table cards)
  const pieces: Piece[] = [];
  const pieceIdSet = new Set<string>([...playerIds, ...zoneIdSet]);

  for (const pawn of v1.pawns || []) {
    const pid = pieceIdSet.has(pawn.id) ? `pawn-${pawn.id}` : pawn.id;
    pieceIdSet.add(pid);
    pieces.push({
      id: pid,
      name: pawn.name,
      faces: [{ label: pawn.name, imageUrl: pawn.imageUrl || undefined, color: pawn.color }],
      activeFace: pawn.faceUp === false ? 1 : 0,
      rotation: 0,
      zoneId: pawn.currentTileId && zoneIdSet.has(pawn.currentTileId) ? pawn.currentTileId : null,
      ownerId: pawn.controlledByUserId ?? null,
      tags: ['pawn', ...(pawn.isInfiniteSupply ? ['infinite_supply'] : [])],
      fields: {},
    });
  }

  for (const deck of v1.decks || []) {
    for (const card of deck.cards || []) {
      const cid = pieceIdSet.has(card.id) ? `${deck.id}-${card.id}` : card.id;
      pieceIdSet.add(cid);
      pieces.push({
        id: cid,
        name: card.title,
        faces: [{ label: card.title, color: card.color || deck.color }],
        activeFace: card.faceUp ? 0 : 0,
        rotation: card.tapped ? 90 : 0,
        zoneId: deck.id,
        ownerId: card.ownerPlayerId ?? null,
        tags: ['card'],
        fields: {
          description: card.description,
          ...(card.linkedTileId && zoneIdSet.has(card.linkedTileId)
            ? { linkedTileId: { $ref: card.linkedTileId } }
            : {}),
        },
      });
    }
  }

  for (const [pid, handCards] of Object.entries(ms.playerHands || {})) {
    const handZoneId = `hand-${pid}`;
    if (!zoneIdSet.has(handZoneId)) continue;
    for (const card of handCards || []) {
      const cid = pieceIdSet.has(card.id) ? `hand-${pid}-${card.id}` : card.id;
      pieceIdSet.add(cid);
      pieces.push({
        id: cid,
        name: card.title,
        faces: [{ label: card.title, color: card.color }],
        activeFace: 0,
        rotation: 0,
        zoneId: handZoneId,
        ownerId: pid,
        tags: ['card'],
        fields: { description: card.description },
      });
    }
  }

  // 4. Counters
  const counters: CounterDef[] = [
    {
      id: 'cash',
      name: 'Tiền mặt VNĐ',
      scope: 'player',
      kind: 'denominated',
      denominations: [...DEFAULT_VND_DENOMINATIONS],
      min: 0,
      initial: v1.startingCashPerPlayer ?? 1800000,
      tags: ['currency'],
      fields: {},
    },
    {
      id: 'jail_turns',
      name: 'Số lượt ở tù',
      scope: 'player',
      kind: 'scalar',
      min: 0,
      initial: 0,
      tags: [],
      fields: {},
    },
    ...(v1.resources || []).map((r) => ({
      id: r.id,
      name: r.name,
      scope: 'player' as const,
      kind: 'scalar' as const,
      initial: r.initialAmount,
      tags: [],
      fields: (r.unit ? { unit: r.unit, color: r.color } : { color: r.color }) as Record<string, string>,
    })),
  ];

  // 5. Rules from triggerRules
  const rules: Rule[] = (v1.triggerRules || []).map((tr, idx) => ({
    id: tr.id || `rule-v1-${idx}`,
    name: tr.label,
    trigger:
      tr.when === 'on_enter_tile'
        ? 'piece_enter'
        : tr.when === 'on_roll_value'
        ? 'dice_rolled'
        : 'card_played',
    scope: tr.sourceTileId && zoneIdSet.has(tr.sourceTileId) ? { entityId: tr.sourceTileId } : undefined,
    priority: 10,
    actions: [
      tr.action === 'teleport' && tr.targetTileId
        ? { type: 'move_piece', params: { pieceId: { ref: '$piece' }, toZoneId: tr.targetTileId } }
        : tr.action === 'skip_turn'
        ? { type: 'skip_turn', params: { playerId: { ref: '$player' }, count: 1 } }
        : tr.action === 'extra_turn'
        ? { type: 'extra_turn', params: { playerId: { ref: '$player' }, count: 1 } }
        : tr.action === 'reverse_turn'
        ? { type: 'reverse_order', params: {} }
        : tr.action === 'resource_delta' && tr.resourceId
        ? {
            type: 'set_counter',
            params: { counterId: tr.resourceId, targetId: { ref: '$player' }, delta: tr.amount ?? 0 },
          }
        : { type: 'log', params: { message: tr.label || 'Trigger rule' } },
    ],
  }));

  const pkg: GamePackageV2 = {
    schemaVersion: 2,
    id: v1.id,
    title: v1.title,
    description: v1.description,
    zones,
    pieces,
    counters,
    randomizers: [
      {
        id: 'd6',
        name: 'Xúc xắc',
        kind: 'dice',
        sides: [6, 6],
        tags: [],
        fields: {},
      },
    ],
    players,
    turnConfig: {
      initialPhase: ms.turnPhase === 'action' ? 'action' : 'roll',
      phases: [
        { id: 'roll', name: 'Đổ xúc xắc' },
        { id: 'action', name: 'Hành động' },
      ],
    },
    rules,
    ui: {
      panels: [],
      buttons: [],
    },
  };

  // 6. Hydrate in-progress matchState into EngineState
  let state = createInitialState(pkg, seed);
  const nextCounters = { ...state.counters };
  const nextDenom = { ...state.denominatedCounters };

  for (const pid of playerIds) {
    if (ms.playerBalances?.[pid]) {
      const total = calculateBalanceTotal(ms.playerBalances[pid]);
      const key = makeCounterKey('cash', 'player', pid);
      nextCounters[key] = total;
      nextDenom[key] = breakAmountIntoNotes(total, DEFAULT_VND_DENOMINATIONS);
    }
    if (ms.jailTurnsRemaining?.[pid] !== undefined) {
      const key = makeCounterKey('jail_turns', 'player', pid);
      nextCounters[key] = ms.jailTurnsRemaining[pid];
    }
    if (ms.playerResources?.[pid]) {
      for (const [resId, val] of Object.entries(ms.playerResources[pid])) {
        const key = makeCounterKey(resId, 'player', pid);
        nextCounters[key] = val;
      }
    }
  }

  state = {
    ...state,
    status: ms.winnerId ? 'ended' : ms.isPlaying ? 'playing' : 'idle',
    winnerIds: ms.winnerId ? [ms.winnerId] : [],
    turn: {
      ...state.turn,
      currentIndex: Math.max(0, Math.min(playerIds.length - 1, ms.currentTurnIndex ?? 0)),
      direction: ms.turnDirection ?? 1,
      phase: ms.turnPhase === 'action' ? 'action' : 'roll',
    },
    counters: nextCounters,
    denominatedCounters: nextDenom,
    lastRoll: ms.lastDiceRoll
      ? {
          randomizerId: 'd6',
          values: ms.lastDiceRoll.values,
          total: ms.lastDiceRoll.total,
        }
      : null,
  };

  state = { ...state, stateChecksum: computeStateChecksum(state) };

  return { pkg, state, migratedFromV1: true };
}
