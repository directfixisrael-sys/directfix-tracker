import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { MousePointerClick, Smartphone, Monitor, Tablet, Wrench, MessageCircle, Phone } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

interface ClickRow {
  id: string;
  referrer: string | null;
  page_url: string | null;
  user_agent: string | null;
  device_type: string | null;
  button_type: string | null;
  created_at: string;
}

const deviceIcon = (d: string | null) => {
  if (d === 'mobile') return <Smartphone className="w-3.5 h-3.5" />;
  if (d === 'tablet') return <Tablet className="w-3.5 h-3.5" />;
  return <Monitor className="w-3.5 h-3.5" />;
};

const deviceLabel = (d: string | null) =>
  d === 'mobile' ? 'נייד' : d === 'tablet' ? 'טאבלט' : 'מחשב';

const BUTTONS: { type: string; label: string; icon: any; color: string }[] = [
  { type: 'main', label: 'הזמן תיקון', icon: Wrench, color: 'text-primary bg-primary/10' },
  { type: 'whatsapp', label: 'וואטסאפ', icon: MessageCircle, color: 'text-green-600 bg-green-500/10' },
  { type: 'call', label: 'התקשר', icon: Phone, color: 'text-blue-600 bg-blue-500/10' },
];

const buttonMeta = (t: string | null) =>
  BUTTONS.find((b) => b.type === t) || BUTTONS[0];

const WordPressClicksCard = () => {
  const [clicks, setClicks] = useState<ClickRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  const load = async () => {
    const { data } = await supabase
      .from('wp_button_clicks' as any)
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200);
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
  const inRange = (c: ClickRow, ms: number) => now - new Date(c.created_at).getTime() < ms;
  const isToday = (c: ClickRow) =>
    new Date(c.created_at).toDateString() === new Date().toDateString();

  const countByBtn = (type: string) =>
    clicks.filter((c) => (c.button_type || 'main') === type).length;
  const todayByBtn = (type: string) =>
    clicks.filter((c) => (c.button_type || 'main') === type && isToday(c)).length;

  const filtered = filter === 'all'
    ? clicks
    : clicks.filter((c) => (c.button_type || 'main') === filter);

  const today = clicks.filter(isToday).length;
  const last7d = clicks.filter((c) => inRange(c, 7 * 24 * 60 * 60 * 1000)).length;

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
              לחיצות על הכפתורים הצפים שמשובצים באתר הראשי
            </p>
          </div>
        </div>
      </div>

      {/* Per-button stats */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {BUTTONS.map((b) => {
          const Icon = b.icon;
          const isActive = filter === b.type;
          return (
            <button
              key={b.type}
              onClick={() => setFilter(isActive ? 'all' : b.type)}
              className={`rounded-xl p-3 text-center border-2 transition-all ${
                isActive ? 'border-primary' : 'border-transparent hover:border-border'
              } ${b.color}`}
            >
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <Icon className="w-4 h-4" />
                <span className="text-xs font-bold">{b.label}</span>
              </div>
              <p className="text-2xl font-bold">{countByBtn(b.type)}</p>
              <p className="text-[10px] opacity-70">היום: {todayByBtn(b.type)}</p>
            </button>
          );
        })}
      </div>

      {/* Totals */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-muted/50 rounded-xl p-2 text-center">
          <p className="text-lg font-bold text-primary">{today}</p>
          <p className="text-[10px] text-muted-foreground">סה״כ היום</p>
        </div>
        <div className="bg-muted/50 rounded-xl p-2 text-center">
          <p className="text-lg font-bold text-accent">{last7d}</p>
          <p className="text-[10px] text-muted-foreground">7 ימים</p>
        </div>
        <div className="bg-muted/50 rounded-xl p-2 text-center">
          <p className="text-lg font-bold">{clicks.length}</p>
          <p className="text-[10px] text-muted-foreground">אחרונים</p>
        </div>
      </div>

      {loading ? (
        <p className="text-muted-foreground text-sm text-center py-4">טוען...</p>
      ) : filtered.length === 0 ? (
        <p className="text-muted-foreground text-sm text-center py-4">
          {filter === 'all'
            ? 'עדיין אין קליקים. וודא שהקוד הוטמע באתר הוורדפרס.'
            : 'אין קליקים לכפתור הזה.'}
        </p>
      ) : (
        <div className="border border-border rounded-xl overflow-hidden">
          <div className="divide-y divide-border max-h-72 overflow-y-auto">
            {filtered.slice(0, 50).map((c) => {
              const meta = buttonMeta(c.button_type);
              const Icon = meta.icon;
              return (
                <div key={c.id} className="px-3 py-2 text-sm flex items-center gap-3">
                  <span className={`flex items-center gap-1 text-xs shrink-0 px-2 py-1 rounded-md ${meta.color}`}>
                    <Icon className="w-3 h-3" />
                    {meta.label}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
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
              );
            })}
          </div>
        </div>
      )}
    </Card>
  );
};

export default WordPressClicksCard;
