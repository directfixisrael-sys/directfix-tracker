import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

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

  useEffect(() => {
    const visitorId = getVisitorId();
    const currentPage = location.pathname;

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
  }, [location.pathname]);

  return null;
};
