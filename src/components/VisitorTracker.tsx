import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
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

export const VisitorTracker = () => {
  const location = useLocation();
  const channelRef = useRef<RealtimeChannel | null>(null);
  const isSubscribedRef = useRef(false);

  useEffect(() => {
    const visitorId = getVisitorId();
    
    console.log('[VisitorTracker] Initializing for visitor:', visitorId);

    // Create channel with visitor ID as the presence key
    const channel = supabase.channel('live-visitors-presence', {
      config: {
        presence: {
          key: visitorId,
        },
      },
    });
    
    channelRef.current = channel;

    channel.subscribe(async (status) => {
      console.log('[VisitorTracker] Subscription status:', status);
      
      if (status === 'SUBSCRIBED') {
        isSubscribedRef.current = true;
        
        // Track presence
        const trackResult = await channel.track({
          visitorId,
          page: location.pathname,
          enteredAt: new Date().toISOString(),
          userAgent: navigator.userAgent,
        });
        
        console.log('[VisitorTracker] Track result:', trackResult);
      }
    });

    return () => {
      console.log('[VisitorTracker] Cleaning up channel');
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, []); // Only run once on mount

  // Update presence when route changes
  useEffect(() => {
    const updatePresence = async () => {
      if (channelRef.current && isSubscribedRef.current) {
        const visitorId = getVisitorId();
        
        console.log('[VisitorTracker] Updating presence for page:', location.pathname);
        
        await channelRef.current.track({
          visitorId,
          page: location.pathname,
          enteredAt: new Date().toISOString(),
          userAgent: navigator.userAgent,
        });
      }
    };

    updatePresence();
  }, [location.pathname]);

  return null;
};
