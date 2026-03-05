import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { gaPageView } from '@/lib/gtag';
import { getLeadSource } from '@/lib/leadSource';
import type { RealtimeChannel } from '@supabase/supabase-js';

const getDeviceType = (ua: string): string => {
  if (/tablet|ipad/i.test(ua)) return 'tablet';
  if (/mobile|android|iphone/i.test(ua)) return 'mobile';
  return 'desktop';
};

// Persist visit to DB (fire-and-forget)
const persistVisit = (visitorId: string, page: string, step: string | null) => {
  const leadSource = getLeadSource();
  supabase.from('site_visits').insert({
    visitor_id: visitorId,
    page,
    step,
    lead_source: leadSource.source || null,
    referrer: document.referrer || null,
    user_agent: navigator.userAgent,
    language: navigator.language,
    device_type: getDeviceType(navigator.userAgent),
  } as any).then(() => {});
};

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
  const stepRef = useRef<string | null>(null);
  const pathnameRef = useRef(location.pathname);

  // Keep pathname ref in sync
  useEffect(() => {
    pathnameRef.current = location.pathname;
  }, [location.pathname]);

  // Listen for step changes from NewRepairOrder
  useEffect(() => {
    const handleStepChange = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      stepRef.current = detail?.step || null;
      // Update presence with new step
      if (channelRef.current && isSubscribedRef.current) {
        const visitorId = getVisitorId();
        const leadSource = getLeadSource();
        channelRef.current.track({
          visitorId,
          page: pathnameRef.current,
          step: stepRef.current,
          enteredAt: new Date().toISOString(),
          userAgent: navigator.userAgent,
          leadSource: leadSource.source,
          language: navigator.language,
        });

        // Also broadcast step activity
        const activityChannel = supabase.channel(`step-activity-${Date.now()}`);
        activityChannel.subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            activityChannel.send({
              type: 'broadcast',
              event: 'activity',
              payload: {
                type: stepRef.current === 'success' ? 'order_completed' : 'model_selected',
                visitorId,
                page: pathnameRef.current,
                detail: stepRef.current,
              },
            });
            setTimeout(() => supabase.removeChannel(activityChannel), 2000);
          }
        });
      }
    };

    window.addEventListener('repair-step-change', handleStepChange);
    return () => window.removeEventListener('repair-step-change', handleStepChange);
  }, []);

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
          step: null,
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
    stepRef.current = null; // Reset step on page change
    const updatePresence = async () => {
      if (channelRef.current && isSubscribedRef.current) {
        const visitorId = getVisitorId();
        const leadSource = getLeadSource();
        
        await channelRef.current.track({
          visitorId,
          page: location.pathname,
          step: null,
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
