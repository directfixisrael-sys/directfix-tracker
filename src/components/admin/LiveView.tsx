import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { 
  Eye, 
  ShoppingBag, 
  MousePointerClick,
  Globe,
  Smartphone,
  Monitor,
  Tablet,
  TrendingUp,
  Users,
  Clock,
  Zap
} from 'lucide-react';
import { useLiveVisitors, Visitor } from '@/hooks/useLiveVisitors';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';

// ── Activity feed types ────────────────────────────────────
interface ActivityEvent {
  id: string;
  type: 'page_view' | 'order_started' | 'model_selected' | 'order_completed' | 'visitor_joined' | 'visitor_left';
  visitorId: string;
  page?: string;
  detail?: string;
  timestamp: Date;
}

const PAGE_NAMES: Record<string, string> = {
  '/': 'דף הבית',
  '/order': 'הזמנת תיקון',
  '/track': 'מעקב הזמנה',
  '/admin': 'פאנל ניהול',
  '/devices': 'רכישת מכשיר',
};

const STEP_NAMES: Record<string, string> = {
  model: '📱 בחירת דגם',
  repair: '🔧 בחירת תיקון',
  bundle: '📦 חבילת תיקון',
  price: '💰 אישור מחיר',
  schedule: '📅 קביעת תור',
  details: '📝 פרטי לקוח',
  success: '✅ הזמנה הושלמה!',
};

const FUNNEL_STEPS = ['model', 'repair', 'bundle', 'price', 'schedule', 'details', 'success'] as const;
const FUNNEL_LABELS: Record<string, string> = {
  model: 'בחירת דגם',
  repair: 'בחירת תיקון',
  bundle: 'חבילת תיקון',
  price: 'אישור מחיר',
  schedule: 'קביעת תור',
  details: 'פרטי לקוח',
  success: 'הזמנה הושלמה',
};

const getDeviceIcon = (ua?: string) => {
  if (!ua) return <Smartphone className="w-4 h-4" />;
  if (/tablet|ipad/i.test(ua)) return <Tablet className="w-4 h-4" />;
  if (/mobile|android|iphone/i.test(ua)) return <Smartphone className="w-4 h-4" />;
  return <Monitor className="w-4 h-4" />;
};

const getDeviceName = (ua?: string) => {
  if (!ua) return 'נייד';
  if (/tablet|ipad/i.test(ua)) return 'טאבלט';
  if (/mobile|android|iphone/i.test(ua)) return 'נייד';
  return 'מחשב';
};

const EVENT_ICONS: Record<string, React.ReactNode> = {
  page_view: <Eye className="w-4 h-4" />,
  order_started: <ShoppingBag className="w-4 h-4" />,
  model_selected: <MousePointerClick className="w-4 h-4" />,
  order_completed: <Zap className="w-4 h-4" />,
  visitor_joined: <TrendingUp className="w-4 h-4" />,
  visitor_left: <Clock className="w-4 h-4" />,
};

const EVENT_COLORS: Record<string, string> = {
  page_view: 'bg-primary/10 text-primary',
  order_started: 'bg-success/10 text-success',
  model_selected: 'bg-accent/10 text-accent',
  order_completed: 'bg-success/10 text-success',
  visitor_joined: 'bg-primary/10 text-primary',
  visitor_left: 'bg-muted text-muted-foreground',
};

const EVENT_TEXT: Record<string, string> = {
  page_view: 'צפה בעמוד',
  order_started: 'התחיל הזמנה',
  model_selected: 'בחר דגם',
  order_completed: 'סיים הזמנה! 🎉',
  visitor_joined: 'נכנס לאתר',
  visitor_left: 'עזב את האתר',
};

const LiveView = () => {
  const { totalVisitors, visitorsByPage, visitorsBySource, visitors } = useLiveVisitors();
  const [activityFeed, setActivityFeed] = useState<ActivityEvent[]>([]);
  const [liveGraphData, setLiveGraphData] = useState<{ time: string; visitors: number }[]>([]);
  const prevVisitorsRef = useRef<Visitor[]>([]);

  // Generate graph data points every 10 seconds
  useEffect(() => {
    const addDataPoint = () => {
      const now = new Date();
      const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
      setLiveGraphData(prev => {
        const newData = [...prev, { time: timeStr, visitors: totalVisitors }];
        return newData.slice(-30); // Keep last 30 data points (5 minutes)
        });
    };

    // Initial point
    addDataPoint();

    const interval = setInterval(addDataPoint, 10000);
    return () => clearInterval(interval);
  }, [totalVisitors]);

  // Detect presence changes and generate activity events
  useEffect(() => {
    const prevIds = new Set(prevVisitorsRef.current.map(v => v.visitorId));
    const currentIds = new Set(visitors.map(v => v.visitorId));

    // New visitors
    visitors.forEach(v => {
      if (!prevIds.has(v.visitorId)) {
        addEvent({ type: 'visitor_joined', visitorId: v.visitorId, page: v.page });
      }
    });

    // Left visitors
    prevVisitorsRef.current.forEach(v => {
      if (!currentIds.has(v.visitorId)) {
        addEvent({ type: 'visitor_left', visitorId: v.visitorId });
      }
    });

    // Page changes
    visitors.forEach(v => {
      const prev = prevVisitorsRef.current.find(p => p.visitorId === v.visitorId);
      if (prev && prev.page !== v.page) {
        addEvent({ type: 'page_view', visitorId: v.visitorId, page: v.page });
        if (v.page === '/order') {
          addEvent({ type: 'order_started', visitorId: v.visitorId });
        }
      }
    });

    prevVisitorsRef.current = [...visitors];
  }, [visitors]);

  // Listen for custom activity events from the site
  useEffect(() => {
    const channel = supabase.channel('live-activity-events');
    
    channel.on('broadcast', { event: 'activity' }, (payload) => {
      const data = payload.payload;
      addEvent({
        type: data.type,
        visitorId: data.visitorId,
        detail: data.detail,
        page: data.page,
      });
    });

    channel.subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const addEvent = useCallback((event: Omit<ActivityEvent, 'id' | 'timestamp'>) => {
    const newEvent: ActivityEvent = {
      ...event,
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      timestamp: new Date(),
    };
    setActivityFeed(prev => [newEvent, ...prev].slice(0, 50));
  }, []);

  const timeAgo = (date: Date) => {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 5) return 'עכשיו';
    if (seconds < 60) return `לפני ${seconds} שניות`;
    if (seconds < 3600) return `לפני ${Math.floor(seconds / 60)} דקות`;
    return `לפני ${Math.floor(seconds / 3600)} שעות`;
  };

  // Re-render for time-ago updates
  const [, setTick] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex-1 p-4 md:p-6 overflow-y-auto pb-24 md:pb-6 space-y-5">
      
      {/* ===== HERO: Live Counter ===== */}
      <Card className="p-6 border-success/30 bg-gradient-to-br from-card to-success/5">
        <div className="flex items-center gap-6">
          <div className="relative">
            <div className="w-20 h-20 bg-success/10 rounded-2xl flex items-center justify-center">
              <span className="text-4xl font-black text-success">{totalVisitors}</span>
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-success rounded-full animate-pulse" />
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-success rounded-full animate-ping opacity-30" />
          </div>
          <div>
            <h2 className="text-xl font-bold">גולשים כרגע באתר</h2>
            <p className="text-muted-foreground text-sm">נתונים בזמן אמת</p>
          </div>
        </div>
      </Card>

      {/* ===== LIVE GRAPH - Shopify Style ===== */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            גולשים פעילים - לייב
          </h3>
          <span className="text-xs text-muted-foreground">5 דקות אחרונות</span>
        </div>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={liveGraphData}>
              <defs>
                <linearGradient id="liveGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--success))" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="hsl(var(--success))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="time" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                interval="preserveStartEnd"
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                allowDecimals={false}
                domain={[0, 'auto']}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '12px',
                  fontSize: '12px',
                }}
                labelStyle={{ color: 'hsl(var(--muted-foreground))' }}
              />
              <Area
                type="monotone"
                dataKey="visitors"
                stroke="hsl(var(--success))"
                strokeWidth={2.5}
                fill="url(#liveGradient)"
                dot={false}
                animationDuration={500}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* ===== LIVE VISITOR LIST ===== */}
        <Card className="p-5">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            מבקרים פעילים
          </h3>
          
          {visitors.length > 0 ? (
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {visitors.map((v, i) => (
                <div 
                  key={v.visitorId} 
                  className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl animate-fade-in"
                >
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    {getDeviceIcon(v.userAgent)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                      <span className="font-medium text-sm">מבקר #{i + 1}</span>
                      <span className="text-xs text-muted-foreground">{getDeviceName(v.userAgent)}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <span className="text-xs text-primary font-medium">
                        {v.page === '/order' && v.step 
                          ? STEP_NAMES[v.step] || PAGE_NAMES[v.page] 
                          : PAGE_NAMES[v.page] || v.page}
                      </span>
                      {v.leadSource && v.leadSource !== 'direct' && (
                        <>
                          <span className="text-muted-foreground">·</span>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Globe className="w-3 h-3" />
                            {v.leadSource}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Eye className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>אין גולשים כרגע באתר</p>
              <p className="text-xs mt-1">ברגע שמישהו ייכנס, הוא יופיע כאן</p>
            </div>
          )}
        </Card>

        {/* ===== LIVE ACTIVITY FEED - Shopify Style ===== */}
        <Card className="p-5">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-warning" />
            פעילות בזמן אמת
          </h3>
          
          {activityFeed.length > 0 ? (
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {activityFeed.map((event) => (
                <div 
                  key={event.id} 
                  className="flex items-start gap-3 p-3 rounded-xl border border-border/50 animate-fade-in hover:bg-muted/30 transition-colors"
                >
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5",
                    EVENT_COLORS[event.type]
                  )}>
                    {EVENT_ICONS[event.type]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">
                      {EVENT_TEXT[event.type]}
                      {event.page && (
                        <span className="text-primary font-bold"> {PAGE_NAMES[event.page] || event.page}</span>
                      )}
                    </p>
                    {event.detail && (
                      <p className="text-xs text-muted-foreground mt-0.5">{event.detail}</p>
                    )}
                    <p className="text-[10px] text-muted-foreground mt-1">{timeAgo(event.timestamp)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Zap className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>מחכה לפעילות...</p>
              <p className="text-xs mt-1">ברגע שגולש יעשה פעולה, היא תופיע כאן</p>
            </div>
          )}
        </Card>
      </div>

      {/* ===== BREAKDOWN CARDS ===== */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* By Page */}
        {Object.entries(visitorsByPage).map(([page, count]) => (
          <Card key={page} className="p-4 text-center">
            <p className="text-2xl font-bold text-primary">{count}</p>
            <p className="text-xs text-muted-foreground mt-1">{PAGE_NAMES[page] || page}</p>
          </Card>
        ))}
        {Object.keys(visitorsByPage).length === 0 && (
          <Card className="p-4 text-center col-span-full">
            <p className="text-muted-foreground text-sm">אין נתוני עמודים כרגע</p>
          </Card>
        )}
      </div>

      {/* ===== ORDER FUNNEL - Live ===== */}
      <Card className="p-5">
        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
          <ShoppingBag className="w-5 h-5 text-success" />
          משפך הזמנות - כרגע באתר
        </h3>
        <div className="space-y-3">
          {FUNNEL_STEPS.map((step, idx) => {
            const count = visitors.filter(v => v.page === '/order' && v.step === step).length;
            const maxCount = Math.max(1, visitors.filter(v => v.page === '/order').length);
            const pct = maxCount > 0 ? Math.round((count / maxCount) * 100) : 0;
            return (
              <div key={step} className="flex items-center gap-3">
                <span className="text-xs w-6 text-muted-foreground">{idx + 1}</span>
                <span className="text-sm font-medium w-28 truncate">{FUNNEL_LABELS[step]}</span>
                <div className="flex-1 bg-muted rounded-full h-4 overflow-hidden">
                  <div 
                    className={cn(
                      "h-full rounded-full transition-all duration-500",
                      step === 'success' 
                        ? "bg-gradient-to-r from-success to-success/60" 
                        : "bg-gradient-to-r from-primary to-primary/60"
                    )}
                    style={{ width: `${Math.max(count > 0 ? 8 : 0, pct)}%` }}
                  />
                </div>
                <span className={cn(
                  "text-sm font-bold w-6 text-left",
                  count > 0 ? "text-primary" : "text-muted-foreground"
                )}>
                  {count}
                </span>
              </div>
            );
          })}
        </div>
        {visitors.filter(v => v.page === '/order').length === 0 && (
          <p className="text-muted-foreground text-sm text-center mt-4">אין גולשים כרגע בתהליך ההזמנה</p>
        )}
      </Card>

      {/* ===== SOURCE BREAKDOWN ===== */}
      {Object.keys(visitorsBySource).length > 0 && (
        <Card className="p-5">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <Globe className="w-5 h-5 text-accent" />
            מקורות תנועה - כרגע
          </h3>
          <div className="space-y-3">
            {Object.entries(visitorsBySource)
              .sort(([, a], [, b]) => b - a)
              .map(([source, count]) => {
                const pct = totalVisitors > 0 ? Math.round((count / totalVisitors) * 100) : 0;
                return (
                  <div key={source} className="flex items-center gap-3">
                    <span className="text-sm font-medium w-24 truncate">{source}</span>
                    <div className="flex-1 bg-muted rounded-full h-3 overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-primary to-primary/60 rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-sm font-bold w-8 text-left">{count}</span>
                    <span className="text-xs text-muted-foreground w-10">{pct}%</span>
                  </div>
                );
              })}
          </div>
        </Card>
      )}
    </div>
  );
};

export default LiveView;
