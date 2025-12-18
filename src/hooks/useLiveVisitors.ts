import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { RealtimeChannel } from '@supabase/supabase-js';

interface Visitor {
  visitorId: string;
  page: string;
  enteredAt: string;
  userAgent?: string;
}

interface LiveVisitorsState {
  totalVisitors: number;
  visitorsByPage: Record<string, number>;
  visitors: Visitor[];
}

// Generate a unique visitor ID for this session
const getVisitorId = () => {
  let visitorId = sessionStorage.getItem('visitor_id');
  if (!visitorId) {
    visitorId = `visitor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('visitor_id', visitorId);
  }
  return visitorId;
};

// Shared channel reference
let sharedChannel: RealtimeChannel | null = null;
let channelRefCount = 0;

const getOrCreateChannel = (visitorId: string): RealtimeChannel => {
  if (!sharedChannel) {
    console.log('[LiveVisitors] Creating new shared channel');
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
    console.log('[LiveVisitors] Releasing shared channel');
    supabase.removeChannel(sharedChannel);
    sharedChannel = null;
    channelRefCount = 0;
  }
};

export const useLiveVisitors = () => {
  const [state, setState] = useState<LiveVisitorsState>({
    totalVisitors: 0,
    visitorsByPage: {},
    visitors: [],
  });
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    const visitorId = getVisitorId();
    const channel = getOrCreateChannel(visitorId);
    channelRef.current = channel;

    console.log('[LiveVisitors] Setting up presence listener');

    // Handle presence sync events
    channel.on('presence', { event: 'sync' }, () => {
      const presenceState = channel.presenceState();
      console.log('[LiveVisitors] Presence sync:', presenceState);
      
      const visitors: Visitor[] = [];
      const visitorsByPage: Record<string, number> = {};

      Object.values(presenceState).forEach((presences: any[]) => {
        presences.forEach((presence) => {
          visitors.push({
            visitorId: presence.visitorId,
            page: presence.page,
            enteredAt: presence.enteredAt,
            userAgent: presence.userAgent,
          });
          
          visitorsByPage[presence.page] = (visitorsByPage[presence.page] || 0) + 1;
        });
      });

      console.log('[LiveVisitors] Total visitors:', visitors.length, 'By page:', visitorsByPage);
      
      setState({
        totalVisitors: visitors.length,
        visitorsByPage,
        visitors,
      });
    });

    channel.on('presence', { event: 'join' }, ({ key, newPresences }) => {
      console.log('[LiveVisitors] User joined:', key, newPresences);
    });

    channel.on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
      console.log('[LiveVisitors] User left:', key, leftPresences);
    });

    // Subscribe to the channel
    channel.subscribe((status) => {
      console.log('[LiveVisitors] Subscription status:', status);
    });

    return () => {
      releaseChannel();
    };
  }, []);

  return state;
};
