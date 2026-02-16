import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { RealtimeChannel } from '@supabase/supabase-js';

export interface Visitor {
  visitorId: string;
  page: string;
  step?: string | null;
  enteredAt: string;
  userAgent?: string;
  leadSource?: string;
  language?: string;
  lastSeenAt: number;
  isOnline: boolean;
}

interface LiveVisitorsState {
  totalVisitors: number;
  visitorsByPage: Record<string, number>;
  visitorsBySource: Record<string, number>;
  visitors: Visitor[];
}

const THIRTY_MINUTES = 30 * 60 * 1000;

// Module-level map — survives component remounts within a single session
const recentVisitorsMap = new Map<string, Visitor>();

export const useLiveVisitors = () => {
  const [state, setState] = useState<LiveVisitorsState>({
    totalVisitors: 0,
    visitorsByPage: {},
    visitorsBySource: {},
    visitors: [],
  });

  const computeState = useCallback(() => {
    const now = Date.now();
    const visitors: Visitor[] = [];
    const visitorsByPage: Record<string, number> = {};
    const visitorsBySource: Record<string, number> = {};

    // Remove visitors older than 30 minutes
    recentVisitorsMap.forEach((v, key) => {
      if (now - v.lastSeenAt > THIRTY_MINUTES) {
        recentVisitorsMap.delete(key);
      }
    });

    recentVisitorsMap.forEach((v) => {
      visitors.push(v);
      visitorsByPage[v.page] = (visitorsByPage[v.page] || 0) + 1;
      const src = v.leadSource || 'ישיר';
      visitorsBySource[src] = (visitorsBySource[src] || 0) + 1;
    });

    setState({
      totalVisitors: visitors.length,
      visitorsByPage,
      visitorsBySource,
      visitors,
    });
  }, []);

  useEffect(() => {
    // Must use same channel name as VisitorTracker to share presence state
    const channel = supabase.channel('live-visitors-presence', {
      config: {
        presence: {
          key: `admin_listener_${Date.now()}`,
        },
      },
    });

    channel.on('presence', { event: 'sync' }, () => {
      const presenceState = channel.presenceState();
      const now = Date.now();

      // Update active visitors
      Object.values(presenceState).forEach((presences: any[]) => {
        presences.forEach((presence) => {
          recentVisitorsMap.set(presence.visitorId, {
            visitorId: presence.visitorId,
            page: presence.page,
            step: presence.step || null,
            enteredAt: presence.enteredAt,
            userAgent: presence.userAgent,
            leadSource: presence.leadSource,
            language: presence.language,
            lastSeenAt: now,
            isOnline: true,
          });
        });
      });

      // Mark visitors NOT in current presence as offline (but keep them in map)
      const activeIds = new Set<string>();
      Object.values(presenceState).forEach((presences: any[]) => {
        presences.forEach((p) => activeIds.add(p.visitorId));
      });
      recentVisitorsMap.forEach((v, key) => {
        if (!activeIds.has(key)) {
          v.isOnline = false;
        }
      });

      computeState();
    });

    channel.on('presence', { event: 'join' }, ({ newPresences }) => {
      const now = Date.now();
      newPresences.forEach((presence: any) => {
        recentVisitorsMap.set(presence.visitorId, {
          visitorId: presence.visitorId,
          page: presence.page,
          step: presence.step || null,
          enteredAt: presence.enteredAt,
          userAgent: presence.userAgent,
          leadSource: presence.leadSource,
          language: presence.language,
          lastSeenAt: now,
          isOnline: true,
        });
      });
      computeState();
    });

    channel.on('presence', { event: 'leave' }, ({ leftPresences }) => {
      // Mark as offline but DON'T remove — keep for 30 min
      leftPresences.forEach((presence: any) => {
        const existing = recentVisitorsMap.get(presence.visitorId);
        if (existing) {
          existing.isOnline = false;
          // lastSeenAt stays as-is so the 30-min countdown is from last activity
        }
      });
      computeState();
    });

    channel.subscribe();

    // Hydrate immediately from map (in case of remount)
    computeState();

    // Periodic cleanup every 30 seconds
    const cleanupInterval = setInterval(computeState, 30000);

    return () => {
      clearInterval(cleanupInterval);
      supabase.removeChannel(channel);
    };
  }, [computeState]);

  return state;
};
