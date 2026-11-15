import { EngineState, EntityId, Piece } from '../schema/types';

/**
 * Projects EngineState for a specific player, redacting hidden zones and
 * private zones owned by other players so secret cards/info never leak.
 */
export function viewFor(state: EngineState, viewerPlayerId: EntityId | null): EngineState {
  const redactedPieces: Record<EntityId, Piece> = {};

  for (const [pid, piece] of Object.entries(state.pieces)) {
    const zone = piece.zoneId ? state.zones[piece.zoneId] : null;
    const isHidden =
      zone &&
      (zone.visibility === 'hidden' ||
        (zone.visibility === 'owner' && zone.ownerId !== viewerPlayerId));

    if (isHidden) {
      redactedPieces[pid] = {
        id: piece.id,
        name: 'Hidden',
        faces: [{ label: '?' }],
        activeFace: 0,
        rotation: 0,
        zoneId: piece.zoneId,
        slot: piece.slot,
        ownerId: piece.ownerId,
        hidden: true,
        tags: [],
        fields: {},
      };
    } else {
      redactedPieces[pid] = piece;
    }
  }

  const visiblePanels = state.panels.filter(
    (p) => !p.targetPlayerId || p.targetPlayerId === viewerPlayerId
  );

  return {
    ...state,
    pieces: redactedPieces,
    panels: visiblePanels,
  };
}
