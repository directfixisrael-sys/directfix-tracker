import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const MAX_DAILY_SLOTS = 8;

const DailySlotsBar = () => {
  const [ordersToday, setOrdersToday] = useState(0);

  useEffect(() => {
    const load = async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const { count } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', today.toISOString());
      setOrdersToday(count || 0);
    };
    load();
  }, []);

  const remaining = Math.max(0, MAX_DAILY_SLOTS - ordersToday);
  const fillPercent = Math.min(100, (ordersToday / MAX_DAILY_SLOTS) * 100);

  if (remaining > 5) return null; // Only show when slots are getting low

  return (
    <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-2xl p-3 animate-fade-in">
      <div className="flex items-center gap-2 mb-2">
        <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
        <span className="text-sm font-bold text-amber-800 dark:text-amber-300">
          {remaining === 0 ? 'כל התורים להיום תפוסים!' : `נשארו ${remaining} תורים מתוך ${MAX_DAILY_SLOTS} להיום`}
        </span>
      </div>
      <div className="w-full bg-amber-200 dark:bg-amber-900 rounded-full h-2.5 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-amber-500 to-red-500 rounded-full transition-all duration-1000"
          style={{ width: `${fillPercent}%` }}
        />
      </div>
    </div>
  );
};

export default DailySlotsBar;
