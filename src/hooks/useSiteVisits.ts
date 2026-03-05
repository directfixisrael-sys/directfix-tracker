import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface SiteVisit {
  id: string;
  visitor_id: string;
  page: string;
  step: string | null;
  lead_source: string | null;
  referrer: string | null;
  user_agent: string | null;
  language: string | null;
  device_type: string | null;
  created_at: string;
}

export const useSiteVisits = (hoursBack: number = 12) => {
  const [visits, setVisits] = useState<SiteVisit[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchVisits = useCallback(async () => {
    const since = new Date(Date.now() - hoursBack * 60 * 60 * 1000).toISOString();
    const { data, error } = await supabase
      .from('site_visits')
      .select('*')
      .gte('created_at', since)
      .order('created_at', { ascending: false })
      .limit(500);

    if (!error && data) {
      setVisits(data as SiteVisit[]);
    }
    setLoading(false);
  }, [hoursBack]);

  useEffect(() => {
    fetchVisits();
    const interval = setInterval(fetchVisits, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, [fetchVisits]);

  return { visits, loading, refetch: fetchVisits };
};
