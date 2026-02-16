import { useState, useEffect, useRef } from 'react';
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
  lastSeenAt?: number; // timestamp for 30-min retention
}

interface LiveVisitorsState {
  totalVisitors: number;
  visitorsByPage: Record<string, number>;
  visitorsBySource: Record<string, number>;
  visitors: Visitor[];
}

const getVisitorId = () => {
  let visitorId = sessionStorage.getItem('visitor_id');
  if (!visitorId) {
    visitorId = `visitor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('visitor_id', visitorId);
  }
  return visitorId;
};

let sharedChannel: RealtimeChannel | null = null;
let channelRefCount = 0;

const getOrCreateChannel = (visitorId: string): RealtimeChannel => {
  if (!sharedChannel) {
    sharedChannel = supabase.channel('live-visitors-presence', {
      config: {
        presence: {
          key: visitorId,
        },
      },
    });
  }
  channelRefCount++;
  return sharedChannel;
};

const releaseChannel = () => {
  channelRefCount--;
  if (channelRefCount <= 0 && sharedChannel) {
    supabase.removeChannel(sharedChannel);
    sharedChannel = null;
    channelRefCount = 0;
  }
};

const THIRTY_MINUTES = 30 * 60 * 1000;

export const useLiveVisitors = () => {
  const [state, setState] = useState<LiveVisitorsState>({
    totalVisitors: 0,
    visitorsByPage: {},
    visitorsBySource: {},
    visitors: [],
  });
  const channelRef = useRef<RealtimeChannel | null>(null);
  const recentVisitorsRef = useRef<Map<string, Visitor>>(new Map());

  useEffect(() => {
    const visitorId = getVisitorId();
    const channel = getOrCreateChannel(visitorId);
    channelRef.current = channel;

    const computeState = () => {
      const now = Date.now();
      const visitors: Visitor[] = [];
      const visitorsByPage: Record<string, number> = {};
      const visitorsBySource: Record<string, number> = {};

      // Clean up visitors older than 30 minutes
      recentVisitorsRef.current.forEach((v, key) => {
        if (now - (v.lastSeenAt || 0) > THIRTY_MINUTES) {
          recentVisitorsRef.current.delete(key);
        }
      });

      recentVisitorsRef.current.forEach((v) => {
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
    };

    channel.on('presence', { event: 'sync' }, () => {
      const presenceState = channel.presenceState();
      const now = Date.now();

      // Mark all current presence visitors as active
      const activeIds = new Set<string>();
      Object.values(presenceState).forEach((presences: any[]) => {
        presences.forEach((presence) => {
          activeIds.add(presence.visitorId);
          recentVisitorsRef.current.set(presence.visitorId, {
            visitorId: presence.visitorId,
            page: presence.page,
            step: presence.step || null,
            enteredAt: presence.enteredAt,
            userAgent: presence.userAgent,
            leadSource: presence.leadSource,
            language: presence.language,
            lastSeenAt: now,
          });
        });
      });

      computeState();
    });

    channel.on('presence', { event: 'join' }, () => {});
    channel.on('presence', { event: 'leave' }, () => {});

    channel.subscribe();

    // Periodic cleanup every 60 seconds
    const cleanupInterval = setInterval(computeState, 60000);

    return () => {
      clearInterval(cleanupInterval);
      releaseChannel();
    };
  }, []);

  return state;
};
