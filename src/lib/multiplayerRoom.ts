const UUID_PREFIX_REGEX = /^([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})(?:-[a-z0-9]+)?$/i;

/**
 * Extracts the base StudySpace ID from a `?room=` query parameter.
 * Handles both raw UUIDs and salted room IDs (`<uuid>-<salt>` or `<legacyId>-<salt>`).
 */
export function extractSpaceIdFromRoomParam(roomParam: string): string {
  const trimmed = (roomParam || '').trim();
  if (!trimmed) return '';

  const uuidMatch = trimmed.match(UUID_PREFIX_REGEX);
  if (uuidMatch) {
    return uuidMatch[1];
  }

  // Legacy non-UUID IDs like `space-173...-<6charSalt>`
  const legacySaltMatch = trimmed.match(/^(space-(?:default|\d+))-[a-z0-9]{4,8}$/i);
  if (legacySaltMatch) {
    return legacySaltMatch[1];
  }

  return trimmed;
}

/**
 * Activates a multiplayer room on the host browser by updating the URL `?room=`
 * parameter (without reloading) and notifying `useRealtimeMultiplayer`.
 */
export function activateHostRoom(roomId: string): void {
  if (typeof window === 'undefined' || !roomId) return;

  try {
    const url = new URL(window.location.href);
    if (url.searchParams.get('room') !== roomId) {
      url.searchParams.set('room', roomId);
      window.history.replaceState({}, '', url.toString());
    }
  } catch {
    // ignore URL errors in non-standard environments
  }

  window.dispatchEvent(
    new CustomEvent('vitudy:activate-room', { detail: { roomId } })
  );
}
