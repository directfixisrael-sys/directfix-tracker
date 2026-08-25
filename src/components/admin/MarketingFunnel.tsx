import { useEffect, useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Filter, TrendingUp, Users, ShoppingCart, CheckCircle2 } from 'lucide-react';

interface MarketingEvent {
  event_name: string;
  visitor_id: string | null;
  utm_source: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  placement: string | null;
  value: number | null;
  created_at: string;
}

interface Props {
  from: Date;
  to: Date;
  label: string;
}

const uniq = (rows: MarketingEvent[], name: string) =>
  new Set(rows.filter(r => r.event_name === name).map(r => r.visitor_id || Math.random().toString())).size;

const pct = (a: number, b: number) => (b > 0 ? Math.round((a / b) * 100) : 0);

const dimensions: { key: keyof MarketingEvent; title: string }[] = [
  { key: 'utm_source', title: 'מקור' },
  { key: 'utm_campaign', title: 'קמפיין' },
  { key: 'utm_content', title: 'מודעה' },
  { key: 'placement', title: 'מיקום מודעה' },
];

export const MarketingFunnel = ({ from, to, label }: Props) => {
  const [rows, setRows] = useState<MarketingEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      const { data } = await supabase
        .from('marketing_events' as any)
        .select('event_name, visitor_id, utm_source, utm_campaign, utm_content, placement, value, created_at')
        .gte('created_at', from.toISOString())
        .lte('created_at', to.toISOString())
        .order('created_at', { ascending: false })
        .limit(5000);
      if (!cancelled) {
        setRows((data as unknown as MarketingEvent[]) || []);
        setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [from, to]);

  const totals = useMemo(() => {
    const visits = uniq(rows, 'PageView');
    const views = uniq(rows, 'ViewContent');
    const starts = uniq(rows, 'InitiateCheckout');
    const completed = rows.filter(r => r.event_name === 'Lead').length;
    return { visits, views, starts, completed };
  }, [rows]);

  const breakdown = useMemo(() => {
    return dimensions.map(dim => {
      const map = new Map<string, { visits: number; starts: number; completed: number }>();
      rows.forEach(r => {
        const key = (r[dim.key] as string | null) || 'ישיר / לא ידוע';
        const entry = map.get(key) || { visits: 0, starts: 0, completed: 0 };
        if (r.event_name === 'PageView') entry.visits += 1;
        if (r.event_name === 'InitiateCheckout') entry.starts += 1;
        if (r.event_name === 'Lead') entry.completed += 1;
        map.set(key, entry);
      });
      const list = Array.from(map.entries())
        .map(([name, v]) => ({ name, ...v }))
        .filter(v => v.visits + v.starts + v.completed > 0)
        .sort((a, b) => b.completed - a.completed || b.starts - a.starts || b.visits - a.visits)
        .slice(0, 8);
      return { title: dim.title, list };
    });
  }, [rows]);

  const steps = [
    { title: 'כניסות למערכת', value: totals.visits, icon: Users, color: 'text-primary' },
    { title: 'צפיות במסלול הזמנה', value: totals.views, icon: TrendingUp, color: 'text-accent' },
    { title: 'התחלות הזמנה', value: totals.starts, icon: ShoppingCart, color: 'text-warning' },
    { title: 'הזמנות שהושלמו', value: totals.completed, icon: CheckCircle2, color: 'text-success' },
  ];

  return (
    <Card className="p-4 space-y-4">
      <h3 className="font-bold text-lg flex items-center gap-2">
        <Filter className="w-5 h-5 text-primary" />
        משפך שיווקי - Meta ({label})
      </h3>

      {loading ? (
        <p className="text-sm text-muted-foreground">טוען נתונים...</p>
      ) : rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">אין עדיין נתוני מעקב בטווח התאריכים הזה.</p>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {steps.map(step => (
              <div key={step.title} className="rounded-xl border border-border bg-muted/30 p-3">
                <div className="flex items-center gap-2 text-muted-foreground text-xs">
                  <step.icon className={`w-4 h-4 ${step.color}`} />
                  {step.title}
                </div>
                <div className="text-2xl font-bold mt-1">{step.value.toLocaleString('he-IL')}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="rounded-xl border border-primary/30 bg-primary/5 p-3">
              <div className="text-xs text-muted-foreground">מעבר מכניסה להתחלת הזמנה</div>
              <div className="text-2xl font-bold text-primary">{pct(totals.starts, totals.visits)}%</div>
            </div>
            <div className="rounded-xl border border-success/30 bg-success/5 p-3">
              <div className="text-xs text-muted-foreground">מעבר מהתחלה להשלמת הזמנה</div>
              <div className="text-2xl font-bold text-success">{pct(totals.completed, totals.starts)}%</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {breakdown.map(section => (
              <div key={section.title} className="rounded-xl border border-border p-3">
                <h4 className="font-semibold mb-2 text-sm">פילוח לפי {section.title}</h4>
                {section.list.length === 0 ? (
                  <p className="text-xs text-muted-foreground">אין נתונים</p>
                ) : (
                  <div className="space-y-2">
                    {section.list.map(item => (
                      <div key={item.name} className="flex items-center justify-between gap-2 text-sm">
                        <span className="truncate" title={item.name}>{item.name}</span>
                        <span className="shrink-0 text-xs text-muted-foreground">
                          {item.visits} כניסות · {item.starts} התחלות · <span className="text-success font-semibold">{item.completed} הזמנות</span>
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </Card>
  );
};

export default MarketingFunnel;
