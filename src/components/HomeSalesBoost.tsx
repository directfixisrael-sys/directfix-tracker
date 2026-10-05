import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Star, Flame, TrendingUp } from 'lucide-react';

type Stats = { week_orders: number; today_orders: number; avg_rating: number | null; rating_count: number; min_price: number | null };

const DAILY_CAPACITY = 8;

export const useHomeStats = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  useEffect(() => {
    Promise.all([
      (supabase.rpc as any)('get_home_stats').then(({ data }: any) => data),
      supabase.functions.invoke('google-reviews').then(({ data }) => data).catch(() => null),
    ]).then(([base, g]: any) => {
      if (!base) return;
      const s = { ...base } as Stats;
      if (g?.rating) { s.avg_rating = g.rating; s.rating_count = g.count; }
      setStats(s);
    });
  }, []);
  return stats;
};


export const HeroLiveProof = ({ stats }: { stats: Stats | null }) => {
  if (!stats) return null;
  const left = Math.max(1, DAILY_CAPACITY - stats.today_orders);
  const hour = Number(new Intl.DateTimeFormat('en-GB', { hour: 'numeric', hour12: false, timeZone: 'Asia/Jerusalem' }).format(new Date()));
  const isOpen = hour >= 8 && hour < 19;
  return (
    <div className="flex flex-col gap-2 mb-6 max-w-xl mx-auto md:mx-0">
      {stats.week_orders > 0 && (
        <div className="flex flex-row-reverse items-center justify-end gap-2 text-sm sm:text-base text-foreground/85">
          <span className="relative flex h-2.5 w-2.5"><span className="absolute inline-flex h-full w-full rounded-full bg-primary opacity-60 animate-ping" /><span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-primary" /></span>
          <TrendingUp className="w-4 h-4 text-primary" />
          <span>הוזמנו <b>{stats.week_orders}</b> תיקונים השבוע באזורך</span>
        </div>
      )}
      {isOpen && left <= 4 && (
        <div className="flex flex-row-reverse items-center justify-end gap-2 text-sm sm:text-base font-semibold text-destructive">
          <Flame className="w-4 h-4" />
          <span>נותרו {left === 1 ? 'תור אחרון' : `${left} תורים`} להיום באזורך</span>
        </div>
      )}
      {stats.avg_rating && stats.rating_count >= 3 && (
        <div className="flex flex-row-reverse items-center justify-end gap-2 text-sm sm:text-base text-foreground/85">
          <span className="flex">{[0, 1, 2, 3, 4].map((i) => <Star key={i} className="w-4 h-4 fill-primary text-primary" />)}</span>
          <span><b>{stats.avg_rating}</b> מתוך 5 · {stats.rating_count} ביקורות לקוחות מאומתות</span>
        </div>
      )}
    </div>
  );
};
