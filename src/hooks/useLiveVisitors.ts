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

export const useLiveVisitors = () => {
  const [state, setState] = useState<LiveVisitorsState>({
    totalVisitors: 0,
    visitorsByPage: {},
    visitorsBySource: {},
    visitors: [],
  });
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    const visitorId = getVisitorId();
    const channel = getOrCreateChannel(visitorId);
    channelRef.current = channel;

    channel.on('presence', { event: 'sync' }, () => {
      const presenceState = channel.presenceState();
      
      const visitors: Visitor[] = [];
      const visitorsByPage: Record<string, number> = {};
      const visitorsBySource: Record<string, number> = {};

      Object.values(presenceState).forEach((presences: any[]) => {
        presences.forEach((presence) => {
          visitors.push({
            visitorId: presence.visitorId,
            page: presence.page,
            step: presence.step || null,
            enteredAt: presence.enteredAt,
            userAgent: presence.userAgent,
            leadSource: presence.leadSource,
            language: presence.language,
          });
          
          visitorsByPage[presence.page] = (visitorsByPage[presence.page] || 0) + 1;
          
          const src = presence.leadSource || 'ישיר';
          visitorsBySource[src] = (visitorsBySource[src] || 0) + 1;
        });
      });
      
      setState({
        totalVisitors: visitors.length,
        visitorsByPage,
        visitorsBySource,
        visitors,
      });
    });

    channel.on('presence', { event: 'join' }, () => {});
    channel.on('presence', { event: 'leave' }, () => {});

    channel.subscribe();

    return () => {
      releaseChannel();
    };
  }, []);

  return state;
};
