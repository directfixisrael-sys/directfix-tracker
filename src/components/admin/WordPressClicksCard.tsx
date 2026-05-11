import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { MousePointerClick, Smartphone, Monitor, Tablet } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

interface ClickRow {
  id: string;
  referrer: string | null;
  page_url: string | null;
  user_agent: string | null;
  device_type: string | null;
  created_at: string;
}

const deviceIcon = (d: string | null) => {
  if (d === 'mobile') return <Smartphone className="w-3.5 h-3.5" />;
  if (d === 'tablet') return <Tablet className="w-3.5 h-3.5" />;
  return <Monitor className="w-3.5 h-3.5" />;
};

const deviceLabel = (d: string | null) =>
  d === 'mobile' ? 'נייד' : d === 'tablet' ? 'טאבלט' : 'מחשב';

const WordPressClicksCard = () => {
  const [clicks, setClicks] = useState<ClickRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const { data } = await supabase
      .from('wp_button_clicks' as any)
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);
    setClicks((data as any) || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
    const channel = supabase
      .channel('wp-clicks')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'wp_button_clicks' },
        () => load()
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const now = Date.now();
  const today = clicks.filter(
    c => new Date(c.created_at).toDateString() === new Date().toDateString()
  ).length;
  const last7d = clicks.filter(
    c => now - new Date(c.created_at).getTime() < 7 * 24 * 60 * 60 * 1000
  ).length;

  return (
    <Card className="p-5 border-primary/30">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
            <MousePointerClick className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-bold text-lg">קליקים מאתר וורדפרס</h3>
            <p className="text-xs text-muted-foreground">
              לחיצות על כפתור התיקון הצף שמשובץ באתר הראשי
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-muted/50 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-primary">{today}</p>
          <p className="text-xs text-muted-foreground">היום</p>
        </div>
        <div className="bg-muted/50 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-accent">{last7d}</p>
          <p className="text-xs text-muted-foreground">7 ימים</p>
        </div>
        <div className="bg-muted/50 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold">{clicks.length}</p>
          <p className="text-xs text-muted-foreground">אחרונים</p>
        </div>
      </div>

      {loading ? (
        <p className="text-muted-foreground text-sm text-center py-4">טוען...</p>
      ) : clicks.length === 0 ? (
        <p className="text-muted-foreground text-sm text-center py-4">
          עדיין אין קליקים. וודא שהקוד הוטמע באתר הוורדפרס.
        </p>
      ) : (
        <div className="border border-border rounded-xl overflow-hidden">
          <div className="divide-y divide-border max-h-72 overflow-y-auto">
            {clicks.slice(0, 50).map((c) => (
              <div key={c.id} className="px-3 py-2 text-sm flex items-center gap-3">
                <span className="flex items-center gap-1 text-xs text-muted-foreground shrink-0 w-20">
                  {deviceIcon(c.device_type)}
                  {deviceLabel(c.device_type)}
                </span>
                <span
                  className="flex-1 truncate text-xs text-primary"
                  title={c.referrer || c.page_url || ''}
                >
                  {c.referrer || c.page_url || 'ישיר'}
                </span>
                <span className="text-xs text-muted-foreground shrink-0">
                  {format(new Date(c.created_at), 'dd/MM HH:mm')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
};

export default WordPressClicksCard;
