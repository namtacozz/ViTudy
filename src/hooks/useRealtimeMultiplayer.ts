'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { getSupabase, getSupabaseConfig } from '@/lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

export type BoardGameEventType =
  | 'ROLL'
  | 'MOVE'
  | 'BUY'
  | 'PAY'
  | 'UPGRADE'
  | 'MORTGAGE'
  | 'END_TURN'
  | 'BANKRUPT'
  | 'UNDO'
  | 'REDO'
  | 'STATE_SYNC';

export interface BoardGameRealtimeEvent {
  gameId: string;
  eventType: BoardGameEventType;
  kind?: 'intent' | 'authoritative_state';
  actorPawnId: string;
  activeTurnPawnId: string;
  payload?: Record<string, unknown>;
  senderId?: string;
  timestamp: number;
}

export function canEmitGameEvent(params: {
  isViewer: boolean;
  actorPawnId: string;
  activeTurnPawnId: string | null;
}): boolean {
  if (params.isViewer) return false;
  if (!params.activeTurnPawnId) return true;
  return params.actorPawnId === params.activeTurnPawnId;
}

export type RoomActionResolution =
  | 'reject'
  | 'execute_local'
  | 'execute_and_broadcast_state'
  | 'send_intent';

/**
 * Kiến trúc Host-Authoritative:
 * - Viewer: từ chối mọi thao tác.
 * - Chơi local (offline): chạy trực tiếp trên máy.
 * - Phòng online & là Host: chạy engine và phát STATE_SYNC authoritative.
 * - Phòng online & không phải Host: chỉ gửi intent (kể cả UNDO/REDO) cho Host duyệt.
 */
export function resolveRoomGameAction(params: {
  isOnline: boolean;
  isHost: boolean;
  isViewer: boolean;
  actorPawnId: string;
  activeTurnPawnId: string | null;
}): RoomActionResolution {
  if (params.isViewer) return 'reject';
  if (!params.isOnline) return 'execute_local';
  if (params.isHost) return 'execute_and_broadcast_state';
  if (params.activeTurnPawnId && params.actorPawnId !== params.activeTurnPawnId) {
    return 'reject';
  }
  return 'send_intent';
}

export interface PeerUser {
  id: string;
  name: string;
  avatarColor: string;
  status: string;
  role: 'owner' | 'editor' | 'viewer';
  cursor?: { x: number; y: number };
  camera?: { x: number; y: number; scale: number; rotation: number };
  isPresenter?: boolean;
  lastActive?: number;
}

const DEFAULT_MOCK_PEERS: PeerUser[] = [
  { id: 'mock-1', name: 'Lê Hoàng (Khoa CNTT)', avatarColor: '#334155', status: 'Đang thuyết trình', role: 'editor', isPresenter: true },
  { id: 'mock-2', name: 'Minh Thư (Toán Tin)', avatarColor: '#64748b', status: 'Đang làm bài', role: 'viewer' }
];

export function useRealtimeMultiplayer(spaceId: string, currentUserName = 'Bạn (Chủ bàn)', isHost = true) {
  const [peers, setPeers] = useState<PeerUser[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isConfigured, setIsConfigured] = useState(false);
  const [isFollowPresenter, setIsFollowPresenter] = useState(false);
  const [hasPeers, setHasPeers] = useState(false);
  const channelRef = useRef<RealtimeChannel | null>(null);

  // Check Supabase config on mount
  useEffect(() => {
    const config = getSupabaseConfig();
    setIsConfigured(config.isConfigured);
  }, []);

  const userId = useRef<string>(`user-${Math.random().toString(36).substring(2, 9)}`).current;

  // Initialize Realtime Channel only when room query param is present or explicitly active
  useEffect(() => {
    const hasRoomQuery = typeof window !== 'undefined' && window.location.search.includes('room=');
    if (!hasRoomQuery && !hasPeers) {
      // User is in solo mode, do not join room or track presence
      setIsConnected(false);
      setPeers([]);
      return;
    }

    const supabase = getSupabase();
    if (!supabase) {
      setIsConnected(false);
      return;
    }

    const searchRoom = typeof window !== 'undefined' 
      ? new URLSearchParams(window.location.search).get('room') 
      : null;
    const effectiveSpaceId = searchRoom || spaceId || 'default';
    const roomId = `room-${effectiveSpaceId}`;
    const channel = supabase.channel(roomId, {
      config: {
        presence: { key: userId },
        broadcast: { ack: false }
      }
    });

    channelRef.current = channel;

    // 1. Presence Sync
    channel.on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState<{
        name: string;
        avatarColor: string;
        status: string;
        role: 'owner' | 'editor' | 'viewer';
        cursor?: { x: number; y: number };
        camera?: { x: number; y: number; scale: number; rotation: number };
        isPresenter?: boolean;
      }>();

      const peerList: PeerUser[] = [];
      Object.keys(state).forEach((key) => {
        if (key !== userId) {
          const userState = state[key]?.[0];
          if (userState) {
            peerList.push({
              id: key,
              name: userState.name || 'Người học',
              avatarColor: userState.avatarColor || '#3b82f6',
              status: userState.status || 'Đang trực tuyến',
              role: userState.role || 'viewer',
              cursor: userState.cursor,
              camera: userState.camera,
              isPresenter: userState.isPresenter
            });
          }
        }
      });

      setPeers(peerList);
      if (peerList.length > 0) {
        setHasPeers(true);
      }
    });

    // 2. Cursor Broadcast
    channel.on('broadcast', { event: 'cursor' }, (payload) => {
      const { id, x, y } = payload.payload;
      if (id !== userId) {
        setPeers(prev => prev.map(p => p.id === id ? { ...p, cursor: { x, y } } : p));
      }
    });

    // 3. Desk Objects Sync Broadcast (Tài liệu, ghi chú và nét vẽ)
    channel.on('broadcast', { event: 'desk_sync' }, (payload) => {
      const { senderId, type, data } = payload.payload;
      if (senderId !== userId && typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('vitudy:multiplayer-sync', { detail: { type, data } }));
      }
    });

    // 4. Board Game Host-Authoritative Broadcast (intent -> Host; STATE_SYNC -> Clients)
    channel.on('broadcast', { event: 'game_event' }, (payload) => {
      const evt = payload.payload as BoardGameRealtimeEvent;
      if (!evt || evt.senderId === userId || typeof window === 'undefined') return;
      if (evt.kind === 'authoritative_state' || evt.eventType === 'STATE_SYNC') {
        window.dispatchEvent(new CustomEvent('vitudy:game-state-sync', { detail: evt }));
      } else if (evt.kind === 'intent' && isHost) {
        window.dispatchEvent(new CustomEvent('vitudy:game-intent', { detail: evt }));
      } else {
        window.dispatchEvent(new CustomEvent('vitudy:game-event', { detail: evt }));
      }
    });

    // Subscribe to channel and track local user presence
    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        setIsConnected(true);
        channel.track({
          name: currentUserName,
          avatarColor: isHost ? '#0f172a' : '#E0562D',
          status: 'Đang tương tác',
          role: isHost ? 'owner' : 'editor',
          isPresenter: isHost
        });
      } else {
        setIsConnected(false);
      }
    });

    return () => {
      channel.untrack();
      channel.unsubscribe();
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [spaceId, currentUserName, isHost, userId]);

  // Broadcast mouse cursor
  const broadcastCursor = useCallback((x: number, y: number) => {
    if (!channelRef.current || !isConnected) return;
    channelRef.current.send({
      type: 'broadcast',
      event: 'cursor',
      payload: { id: userId, x, y }
    });
  }, [isConnected, userId]);

  // Broadcast desk objects/strokes updates to peers
  const broadcastDeskUpdate = useCallback((type: 'items' | 'strokes', data: any) => {
    if (!channelRef.current || !isConnected) return;
    channelRef.current.send({
      type: 'broadcast',
      event: 'desk_sync',
      payload: { senderId: userId, type, data }
    });
  }, [isConnected, userId]);
  const broadcastCamera = useCallback((camera: { x: number; y: number; scale: number; rotation: number }) => {
    if (!channelRef.current || !isConnected) return;
    channelRef.current.send({
      type: 'broadcast',
      event: 'camera',
      payload: { id: userId, camera }
    });
  }, [isConnected, userId]);

  const broadcastGameEvent = useCallback((event: Omit<BoardGameRealtimeEvent, 'senderId'>) => {
    const isViewer =
      typeof window !== 'undefined' &&
      new URLSearchParams(window.location.search).get('mode') === 'view';
    if (event.kind !== 'authoritative_state' && event.eventType !== 'STATE_SYNC') {
      if (
        !canEmitGameEvent({
          isViewer,
          actorPawnId: event.actorPawnId,
          activeTurnPawnId: event.activeTurnPawnId,
        })
      ) {
        return false;
      }
    } else if (!isHost || isViewer) {
      return false;
    }
    if (!channelRef.current || !isConnected) return false;
    channelRef.current.send({
      type: 'broadcast',
      event: 'game_event',
      payload: { ...event, senderId: userId },
    });
    return true;
  }, [isConnected, isHost, userId]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as unknown as { __vitudyIsHost?: boolean }).__vitudyIsHost = isHost;
    }
  }, [isHost]);

  // Bridge cho các component (VD: BoardGameArena) phát sự kiện game lên Supabase Broadcast
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handler = (e: Event) => {
      const custom = e as CustomEvent<Omit<BoardGameRealtimeEvent, 'senderId'>>;
      if (custom.detail) {
        broadcastGameEvent(custom.detail);
      }
    };
    window.addEventListener('vitudy:emit-game-event', handler);
    return () => window.removeEventListener('vitudy:emit-game-event', handler);
  }, [broadcastGameEvent]);

  // Fallback simulation toggle when offline
  const toggleSimulation = useCallback(() => {
    setHasPeers(prev => {
      const next = !prev;
      if (next) {
        setPeers(DEFAULT_MOCK_PEERS);
      } else {
        setPeers([]);
      }
      return next;
    });
  }, []);

  // Explicitly leave the room and return to solo desk mode
  const leaveRoom = useCallback(() => {
    if (channelRef.current) {
      try {
        channelRef.current.untrack();
        channelRef.current.unsubscribe();
      } catch (e) {}
      channelRef.current = null;
    }
    setPeers([]);
    setHasPeers(false);
    setIsConnected(false);
    setIsFollowPresenter(false);

    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      if (url.searchParams.has('room')) {
        url.searchParams.delete('room');
        window.history.replaceState({}, '', url.toString());
      }
    }
  }, []);

  const activePeers = isConnected ? peers : (hasPeers ? DEFAULT_MOCK_PEERS : []);
  const isMultiplayerActive = activePeers.length > 0;

  return {
    peers: activePeers,
    isConnected,
    isConfigured,
    hasPeers: isMultiplayerActive,
    setHasPeers,
    isFollowPresenter,
    setIsFollowPresenter,
    broadcastCursor,
    broadcastCamera,
    broadcastDeskUpdate,
    broadcastGameEvent,
    toggleSimulation,
    leaveRoom
  };
}
