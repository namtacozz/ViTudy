import { EngineState, EntityId, Zone, isRef } from '../schema/types';

function coordKey(row: number, col: number): string {
  return `${row}:${col}`;
}

function buildCoordMap(state: EngineState): Map<string, Zone> {
  const map = new Map<string, Zone>();
  for (const zone of Object.values(state.zones)) {
    if (zone.coords) {
      map.set(coordKey(zone.coords.row, zone.coords.col), zone);
    }
  }
  return map;
}

const GRID_CARDINAL_DIRS: [number, number][] = [
  [-1, 0],
  [1, 0],
  [0, -1],
  [0, 1],
];

const ALL_GRID_DIRS: [number, number][] = [
  [0, 1],   // horizontal
  [1, 0],   // vertical
  [1, 1],   // diag down-right
  [1, -1],  // diag down-left
];

// Even-r / odd-r offset hex neighbor deltas
function getHexNeighborDeltas(row: number): [number, number][] {
  const odd = Math.abs(row % 2) === 1;
  return odd
    ? [
        [0, -1],
        [0, 1],
        [-1, 0],
        [-1, 1],
        [1, 0],
        [1, 1],
      ]
    : [
        [0, -1],
        [0, 1],
        [-1, -1],
        [-1, 0],
        [1, -1],
        [1, 0],
      ];
}

export function getNeighbors(state: EngineState, zoneId: EntityId): EntityId[] {
  const zone = state.zones[zoneId];
  if (!zone) return [];

  const result = new Set<EntityId>();

  if (zone.neighbors) {
    for (const nid of zone.neighbors) {
      if (state.zones[nid]) result.add(nid);
    }
  }

  for (const val of Object.values(zone.fields || {})) {
    if (isRef(val) && state.zones[val.$ref]) {
      result.add(val.$ref);
    }
  }

  if ((zone.layout === 'grid' || zone.layout === 'hex') && zone.coords) {
    const coordMap = buildCoordMap(state);
    const deltas =
      zone.layout === 'hex'
        ? getHexNeighborDeltas(zone.coords.row)
        : GRID_CARDINAL_DIRS;
    for (const [dr, dc] of deltas) {
      const nb = coordMap.get(coordKey(zone.coords.row + dr, zone.coords.col + dc));
      if (nb) result.add(nb.id);
    }
  }

  return Array.from(result);
}

/**
 * Checks whether any line of length `length` passing through or starting from `startZoneId`
 * (or across the entire grid if `startZoneId` is null) has pieces matching `tag`.
 * Returns an array of matching lines (each line is an array of zoneIds).
 */
export function getLineOf(
  state: EngineState,
  startZoneId: EntityId | null,
  tag: string,
  length: number
): EntityId[][] {
  if (length <= 0) return [];
  const coordMap = buildCoordMap(state);

  const zoneHasPieceTag = (zId: EntityId): boolean => {
    const pIds = state.zonePieces[zId] || [];
    return pIds.some((pid) => {
      const p = state.pieces[pid];
      return p && (p.tags.includes(tag) || tag === '*');
    });
  };

  const candidates = startZoneId
    ? state.zones[startZoneId]
      ? [state.zones[startZoneId]]
      : []
    : Object.values(state.zones).filter((z) => z.coords);

  const matches: EntityId[][] = [];
  const seenKeys = new Set<string>();

  for (const origin of candidates) {
    if (!origin.coords || !zoneHasPieceTag(origin.id)) continue;

    for (const [dr, dc] of ALL_GRID_DIRS) {
      // Walk backward to find the start of contiguous matching pieces along this axis
      let startR = origin.coords.row;
      let startC = origin.coords.col;
      while (true) {
        const prev = coordMap.get(coordKey(startR - dr, startC - dc));
        if (prev && zoneHasPieceTag(prev.id)) {
          startR -= dr;
          startC -= dc;
        } else {
          break;
        }
      }

      const line: EntityId[] = [];
      let curR = startR;
      let curC = startC;
      while (true) {
        const cur = coordMap.get(coordKey(curR, curC));
        if (cur && zoneHasPieceTag(cur.id)) {
          line.push(cur.id);
          curR += dr;
          curC += dc;
        } else {
          break;
        }
      }

      if (line.length >= length) {
        const key = `${dr},${dc}:${line[0]}`;
        if (!seenKeys.has(key)) {
          seenKeys.add(key);
          matches.push(line);
        }
      }
    }
  }

  return matches;
}

export function getDistance(state: EngineState, zoneAId: EntityId, zoneBId: EntityId): number {
  if (zoneAId === zoneBId) return 0;
  const a = state.zones[zoneAId];
  const b = state.zones[zoneBId];
  if (!a || !b) return -1;

  if (a.layout === 'grid' && b.layout === 'grid' && a.coords && b.coords) {
    return Math.abs(a.coords.row - b.coords.row) + Math.abs(a.coords.col - b.coords.col);
  }

  // BFS on adjacency graph
  const visited = new Set<EntityId>([zoneAId]);
  const queue: [EntityId, number][] = [[zoneAId, 0]];
  while (queue.length > 0) {
    const [cur, dist] = queue.shift()!;
    for (const nb of getNeighbors(state, cur)) {
      if (nb === zoneBId) return dist + 1;
      if (!visited.has(nb)) {
        visited.add(nb);
        queue.push([nb, dist + 1]);
      }
    }
  }

  return -1;
}
