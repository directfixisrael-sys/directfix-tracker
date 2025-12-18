import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

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

export const useLiveVisitors = (trackPresence: boolean = false) => {
  const [state, setState] = useState<LiveVisitorsState>({
    totalVisitors: 0,
    visitorsByPage: {},
    visitors: [],
  });

  useEffect(() => {
    const visitorId = getVisitorId();
    const currentPage = window.location.pathname;

    const channel = supabase.channel('live-visitors', {
      config: {
        presence: {
          key: visitorId,
        },
      },
    });

    // Handle presence sync events
    channel.on('presence', { event: 'sync' }, () => {
      const presenceState = channel.presenceState();
      
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

      setState({
        totalVisitors: visitors.length,
        visitorsByPage,
        visitors,
      });
    });

    // Subscribe and track this user's presence if enabled
    channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED' && trackPresence) {
        await channel.track({
          visitorId,
          page: currentPage,
          enteredAt: new Date().toISOString(),
          userAgent: navigator.userAgent,
        });
      }
    });

    // Update page when route changes
    const handleRouteChange = async () => {
      if (trackPresence) {
        await channel.track({
          visitorId,
          page: window.location.pathname,
          enteredAt: new Date().toISOString(),
          userAgent: navigator.userAgent,
        });
      }
    };

    // Listen for route changes
    window.addEventListener('popstate', handleRouteChange);

    return () => {
      window.removeEventListener('popstate', handleRouteChange);
      supabase.removeChannel(channel);
    };
  }, [trackPresence]);

  return state;
};

// Hook for tracking visitor on current page
export const useTrackVisitor = () => {
  useEffect(() => {
    const visitorId = getVisitorId();
    const currentPage = window.location.pathname;

    const channel = supabase.channel('live-visitors', {
      config: {
        presence: {
          key: visitorId,
        },
      },
    });

    channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await channel.track({
          visitorId,
          page: currentPage,
          enteredAt: new Date().toISOString(),
          userAgent: navigator.userAgent,
        });
      }
    });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
};
