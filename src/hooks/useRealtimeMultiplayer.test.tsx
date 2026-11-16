import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useRealtimeMultiplayer } from './useRealtimeMultiplayer';
import { extractSpaceIdFromRoomParam, activateHostRoom } from '@/lib/multiplayerRoom';

// In-memory mock Realtime hub to simulate Host and Guest connecting to Supabase channels
const channelsByTopic = new Map<string, Set<MockChannel>>();

class MockChannel {
  topic: string;
  presenceKey: string;
  handlers: Array<{ type: string; filter: any; cb: (payload?: any) => void }> = [];
  localPresence: any = null;
  subscribed = false;

  constructor(topic: string, opts?: any) {
    this.topic = topic;
    this.presenceKey = opts?.config?.presence?.key || 'unknown';
  }

  on(type: string, filter: any, cb: (payload?: any) => void) {
    this.handlers.push({ type, filter, cb });
    return this;
  }

  subscribe(cb?: (status: string) => void) {
    this.subscribed = true;
    if (!channelsByTopic.has(this.topic)) {
      channelsByTopic.set(this.topic, new Set());
    }
    channelsByTopic.get(this.topic)!.add(this);
    cb?.('SUBSCRIBED');
    return this;
  }

  track(payload: any) {
    this.localPresence = payload;
    this.notifyPresenceSync();
  }

  untrack() {
    this.localPresence = null;
    this.notifyPresenceSync();
  }

  unsubscribe() {
    this.subscribed = false;
    channelsByTopic.get(this.topic)?.delete(this);
  }

  presenceState() {
    const state: Record<string, any[]> = {};
    const peers = channelsByTopic.get(this.topic);
    if (!peers) return state;
    for (const ch of peers) {
      if (ch.localPresence) {
        state[ch.presenceKey] = [ch.localPresence];
      }
    }
    return state;
  }

  send(msg: { type: string; event: string; payload: any }) {
    const peers = channelsByTopic.get(this.topic);
    if (!peers) return;
    for (const ch of peers) {
      for (const h of ch.handlers) {
        if (h.type === 'broadcast' && h.filter?.event === msg.event) {
          h.cb({ payload: msg.payload });
        }
      }
    }
  }

  private notifyPresenceSync() {
    const peers = channelsByTopic.get(this.topic);
    if (!peers) return;
    for (const ch of peers) {
      for (const h of ch.handlers) {
        if (h.type === 'presence' && h.filter?.event === 'sync') {
          h.cb();
        }
      }
    }
  }
}

const mockSupabase = {
  channel: vi.fn((topic: string, opts?: any) => new MockChannel(topic, opts)),
  removeChannel: vi.fn((ch: MockChannel) => {
    ch.unsubscribe();
  }),
};

vi.mock('@/lib/supabase', () => ({
  getSupabase: () => mockSupabase,
  getSupabaseConfig: () => ({ url: 'https://mock.supabase.co', anonKey: 'mock-key', isConfigured: true }),
}));

describe('Multiplayer Room Sharing & Presence Sync', () => {
  const spaceId = '11111111-1111-4111-8111-111111111111';

  beforeEach(() => {
    channelsByTopic.clear();
    vi.clearAllMocks();
    window.history.replaceState({}, '', '/?view=desk&space=' + spaceId);
  });

  afterEach(() => {
    channelsByTopic.clear();
  });

  it('host activates room when sharing link and sees guest who joins via ?room=', async () => {
    // Host is on /?view=desk&space=<spaceId> (no ?room= yet)
    const { result: host } = renderHook(() =>
      useRealtimeMultiplayer(spaceId, 'Chủ bàn', true)
    );

    // Host shares link -> activates room
    await act(async () => {
      window.dispatchEvent(
        new CustomEvent('vitudy:activate-room', { detail: { roomId: spaceId } })
      );
    });

    expect(host.current.isConnected).toBe(true);

    // Guest opens shared link /?room=<spaceId>&perm=view
    window.history.replaceState({}, '', `/?room=${spaceId}&perm=view`);
    const { result: guest } = renderHook(() =>
      useRealtimeMultiplayer(spaceId, 'Bạn học', false)
    );

    expect(guest.current.isConnected).toBe(true);
    // Both host and guest MUST see each other!
    expect(host.current.peers.length).toBe(1);
    expect(guest.current.peers.length).toBe(1);
  });

  it('host and guest join the SAME channel even when share link has a salt', async () => {
    const saltedRoom = `${spaceId}-abc123`;
    const { result: host } = renderHook(() =>
      useRealtimeMultiplayer(spaceId, 'Chủ bàn', true)
    );

    await act(async () => {
      window.dispatchEvent(
        new CustomEvent('vitudy:activate-room', { detail: { roomId: saltedRoom } })
      );
    });

    window.history.replaceState({}, '', `/?room=${saltedRoom}&perm=view`);
    const { result: guest } = renderHook(() =>
      useRealtimeMultiplayer(spaceId, 'Bạn học', false)
    );

    expect(host.current.peers.length).toBe(1);
    expect(guest.current.peers.length).toBe(1);
  });

  it('extracts base spaceId from raw and salted room params', () => {
    expect(extractSpaceIdFromRoomParam(spaceId)).toBe(spaceId);
    expect(extractSpaceIdFromRoomParam(`${spaceId}-abc123`)).toBe(spaceId);
    expect(extractSpaceIdFromRoomParam('space-1700000000000-xyz999')).toBe('space-1700000000000');
  });

  it('host broadcasts desk items to guest when guest joins and leaveRoom cleans URL', async () => {
    const syncEvents: any[] = [];
    const onSync = (e: Event) => syncEvents.push((e as CustomEvent).detail);
    window.addEventListener('vitudy:multiplayer-sync', onSync);

    const { result: host } = renderHook(() =>
      useRealtimeMultiplayer(spaceId, 'Chủ bàn', true)
    );

    await act(async () => {
      activateHostRoom(spaceId);
    });

    window.history.replaceState({}, '', `/?room=${spaceId}&perm=view`);
    const { result: guest } = renderHook(() =>
      useRealtimeMultiplayer(spaceId, 'Bạn học', false)
    );

    expect(guest.current.peers.length).toBe(1);

    await act(async () => {
      host.current.broadcastDeskUpdate('items', [{ id: 'doc-1', title: 'Giáo trình' }]);
    });

    expect(syncEvents).toEqual([
      { type: 'items', data: [{ id: 'doc-1', title: 'Giáo trình' }] },
    ]);

    await act(async () => {
      guest.current.leaveRoom();
    });
    expect(window.location.search).not.toContain('room=');
    expect(window.location.search).not.toContain('perm=');

    window.removeEventListener('vitudy:multiplayer-sync', onSync);
  });
});
