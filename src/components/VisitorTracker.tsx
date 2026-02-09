import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { gaPageView } from '@/lib/gtag';
import { getLeadSource } from '@/lib/leadSource';
import type { RealtimeChannel } from '@supabase/supabase-js';

// Generate a unique visitor ID for this session
const getVisitorId = () => {
  let visitorId = sessionStorage.getItem('visitor_id');
  if (!visitorId) {
    visitorId = `visitor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('visitor_id', visitorId);
  }
  return visitorId;
};

// Store visit timestamp for 30-min history
const recordVisitTimestamp = () => {
  const key = 'visit_timestamps';
  const now = Date.now();
  try {
    const stored = JSON.parse(localStorage.getItem(key) || '[]') as number[];
    // Keep only last 30 minutes
    const thirtyMinAgo = now - 30 * 60 * 1000;
    const filtered = stored.filter(t => t > thirtyMinAgo);
    filtered.push(now);
    localStorage.setItem(key, JSON.stringify(filtered));
  } catch { /* ignore */ }
};

export const VisitorTracker = () => {
  const location = useLocation();
  const channelRef = useRef<RealtimeChannel | null>(null);
  const isSubscribedRef = useRef(false);

  useEffect(() => {
    const visitorId = getVisitorId();
    const leadSource = getLeadSource();
    
    recordVisitTimestamp();

    const channel = supabase.channel('live-visitors-presence', {
      config: {
        presence: {
          key: visitorId,
        },
      },
    });
    
    channelRef.current = channel;

    channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        isSubscribedRef.current = true;
        
        await channel.track({
          visitorId,
          page: location.pathname,
          enteredAt: new Date().toISOString(),
          userAgent: navigator.userAgent,
          leadSource: leadSource.source,
          language: navigator.language,
        });
      }
    });

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, []);

  // Update presence when route changes + broadcast activity
  useEffect(() => {
    const updatePresence = async () => {
      if (channelRef.current && isSubscribedRef.current) {
        const visitorId = getVisitorId();
        const leadSource = getLeadSource();
        
        await channelRef.current.track({
          visitorId,
          page: location.pathname,
          enteredAt: new Date().toISOString(),
          userAgent: navigator.userAgent,
          leadSource: leadSource.source,
          language: navigator.language,
        });

        // Broadcast activity event for live feed
        const activityChannel = supabase.channel('live-activity-events');
        activityChannel.subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            activityChannel.send({
              type: 'broadcast',
              event: 'activity',
              payload: {
                type: location.pathname === '/order' ? 'order_started' : 'page_view',
                visitorId,
                page: location.pathname,
              },
            });
            // Cleanup after send
            setTimeout(() => supabase.removeChannel(activityChannel), 2000);
          }
        });
      }
    };

    updatePresence();
    gaPageView(location.pathname);
  }, [location.pathname]);

  return null;
};
