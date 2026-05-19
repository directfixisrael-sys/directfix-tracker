import { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { 
  DollarSign, 
  ShoppingBag, 
  TrendingUp, 
  Clock,
  Eye,
  CheckCircle,
  AlertCircle,
  Target
} from 'lucide-react';
import { RepairOrder } from '@/types/repair';
import { useLiveVisitors, Visitor } from '@/hooks/useLiveVisitors';
import { cn } from '@/lib/utils';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { subDays } from 'date-fns';
import WordPressClicksCard from './WordPressClicksCard';

interface AdminDashboardProps {
  orders: RepairOrder[];
}

const PAGE_NAMES: Record<string, string> = {
  '/': 'דף הבית',
  '/order': 'הזמנה חדשה',
  '/track': 'מעקב הזמנה',
  '/admin': 'פאנל ניהול',
  '/devices': 'רכישת מכשיר',
};

const COLORS = ['hsl(var(--primary))', 'hsl(var(--accent))', 'hsl(var(--warning))', 'hsl(var(--success))', 'hsl(var(--destructive))', '#8b5cf6', '#ec4899'];

const getDevice = (ua?: string) => {
  if (!ua) return 'נייד';
  if (/mobile|android|iphone/i.test(ua)) return 'נייד';
  if (/tablet|ipad/i.test(ua)) return 'טאבלט';
  return 'מחשב';
};

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS', maximumFractionDigits: 0 }).format(amount);

const AdminDashboard = ({ orders }: AdminDashboardProps) => {
  const { totalVisitors, visitorsByPage, visitorsBySource, visitors } = useLiveVisitors();

  // Today's stats
  const todayStart = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const todayOrders = useMemo(() => 
    orders.filter(o => new Date(o.createdAt) >= todayStart), [orders, todayStart]);
  
  const weekOrders = useMemo(() => 
    orders.filter(o => new Date(o.createdAt) >= subDays(new Date(), 7)), [orders]);
  
  const monthOrders = useMemo(() => 
    orders.filter(o => new Date(o.createdAt) >= subDays(new Date(), 30)), [orders]);

  const calcRevenue = (list: RepairOrder[]) => 
    list.filter(o => o.status !== 'cancelled').reduce((sum, o) => sum + (o.repairPrice || 0), 0);

  const todayRevenue = calcRevenue(todayOrders);
  const weekRevenue = calcRevenue(weekOrders);
  const monthRevenue = calcRevenue(monthOrders);

  const pendingOrders = orders.filter(o => o.status === 'pending');
  const inProgressOrders = orders.filter(o => ['confirmed', 'technician_assigned', 'on_the_way', 'arrived', 'in_progress'].includes(o.status));
  const completedOrders = orders.filter(o => o.status === 'completed');

  // Lead source data
  const leadSourceData = useMemo(() => {
    const sources: Record<string, number> = {};
    orders.forEach(o => {
      const src = o.leadSource || 'לא ידוע';
      sources[src] = (sources[src] || 0) + 1;
    });
    return Object.entries(sources)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [orders]);

  // Average rating
  const ratedOrders = orders.filter(o => o.rating);
  const avgRating = ratedOrders.length > 0 
    ? (ratedOrders.reduce((sum, o) => sum + (o.rating || 0), 0) / ratedOrders.length).toFixed(1)
    : '--';

  return (
    <div className="flex-1 p-4 md:p-6 overflow-y-auto pb-24 md:pb-6 space-y-5">
      
      {/* ===== LIVE VISITORS - Shopify Style ===== */}
      <Card className="p-5 border-success/30">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-4 h-4 bg-success rounded-full animate-pulse" />
              <div className="absolute inset-0 w-4 h-4 bg-success rounded-full animate-ping opacity-30" />
            </div>
            <div>
            <span className="text-4xl font-bold text-success">{totalVisitors}</span>
            <p className="text-muted-foreground">מבקרים ב-30 דקות אחרונות</p>
            </div>
          </div>
        </div>

        {/* Visitor table */}
        {visitors.length > 0 && (
          <div className="border border-border rounded-xl overflow-hidden mb-4">
            <div className="bg-muted/50 px-4 py-2 border-b border-border">
              <div className="grid grid-cols-4 text-xs font-medium text-muted-foreground">
                <span>מבקר</span>
                <span>עמוד</span>
                <span>מקור</span>
                <span>מכשיר</span>
              </div>
            </div>
            <div className="divide-y divide-border max-h-52 overflow-y-auto">
              {visitors.map((v, i) => (
                <div key={v.visitorId} className="px-4 py-3 grid grid-cols-4 items-center text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-success" />
                    <span className="text-muted-foreground">מבקר {i + 1}</span>
                  </div>
                  <span className="truncate">{PAGE_NAMES[v.page] || v.page}</span>
                  <span className="text-xs truncate text-primary font-medium">{v.leadSource || 'ישיר'}</span>
                  <span className="text-xs text-muted-foreground">{getDevice(v.userAgent)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pages breakdown */}
        {Object.keys(visitorsByPage).length > 0 && (
          <div className="flex flex-wrap gap-2">
            {Object.entries(visitorsByPage).map(([page, count]) => (
              <span 
                key={page} 
                className="text-xs bg-success/10 text-success px-3 py-1.5 rounded-full flex items-center gap-1.5 font-medium"
              >
                <Eye className="w-3 h-3" />
                {PAGE_NAMES[page] || page}: {count}
              </span>
            ))}
          </div>
        )}

        {visitors.length === 0 && (
          <p className="text-muted-foreground text-sm">אין גולשים כרגע באתר</p>
        )}
      </Card>

      {/* ===== WORDPRESS BUTTON CLICKS ===== */}
      <WordPressClicksCard />

      {/* ===== KEY METRICS ===== */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-primary" />
            </div>
            <p className="text-muted-foreground text-sm">הכנסות היום</p>
          </div>
          <p className="text-2xl font-bold text-primary">{formatCurrency(todayRevenue)}</p>
          <p className="text-xs text-muted-foreground mt-1">{todayOrders.length} הזמנות</p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-accent" />
            </div>
            <p className="text-muted-foreground text-sm">השבוע</p>
          </div>
          <p className="text-2xl font-bold text-accent">{formatCurrency(weekRevenue)}</p>
          <p className="text-xs text-muted-foreground mt-1">{weekOrders.length} הזמנות</p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-success/10 rounded-xl flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-success" />
            </div>
            <p className="text-muted-foreground text-sm">החודש</p>
          </div>
          <p className="text-2xl font-bold text-success">{formatCurrency(monthRevenue)}</p>
          <p className="text-xs text-muted-foreground mt-1">{monthOrders.length} הזמנות</p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-warning/10 rounded-xl flex items-center justify-center">
              <Clock className="w-5 h-5 text-warning" />
            </div>
            <p className="text-muted-foreground text-sm">ממוצע להזמנה</p>
          </div>
          <p className="text-2xl font-bold">
            {orders.length > 0 ? formatCurrency(calcRevenue(orders) / orders.length) : '₪0'}
          </p>
        </Card>
      </div>

      {/* ===== ORDER STATUS OVERVIEW ===== */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-warning/10 rounded-xl flex items-center justify-center">
            <AlertCircle className="w-5 h-5 text-warning" />
          </div>
          <div>
            <p className="text-2xl font-bold text-warning">{pendingOrders.length}</p>
            <p className="text-xs text-muted-foreground">ממתינות לאישור</p>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
            <Clock className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-2xl font-bold text-primary">{inProgressOrders.length}</p>
            <p className="text-xs text-muted-foreground">בתהליך</p>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-success/10 rounded-xl flex items-center justify-center">
            <CheckCircle className="w-5 h-5 text-success" />
          </div>
          <div>
            <p className="text-2xl font-bold text-success">{completedOrders.length}</p>
            <p className="text-xs text-muted-foreground">הושלמו</p>
          </div>
        </Card>
      </div>

      {/* ===== LEAD SOURCES + RATING ===== */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Lead Sources */}
        {leadSourceData.length > 0 && (
          <Card className="p-4">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              מקורות לידים
            </h3>
            <div className="flex gap-4">
              <div className="w-40 h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={leadSourceData}
                      cx="50%"
                      cy="50%"
                      innerRadius={30}
                      outerRadius={60}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {leadSourceData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 space-y-2">
                {leadSourceData.map((src, index) => (
                  <div key={src.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                      <span className="text-sm truncate">{src.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold">{src.value}</span>
                      <span className="text-xs text-muted-foreground">
                        ({((src.value / orders.length) * 100).toFixed(0)}%)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        )}

        {/* Rating + Quick Stats */}
        <Card className="p-4">
          <h3 className="font-bold text-lg mb-4">סיכום מהיר</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-xl">
              <span className="text-muted-foreground">דירוג ממוצע</span>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-warning">{avgRating}</span>
                <span className="text-warning">⭐</span>
                <span className="text-xs text-muted-foreground">({ratedOrders.length})</span>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-xl">
              <span className="text-muted-foreground">סה"כ הזמנות</span>
              <span className="text-2xl font-bold">{orders.length}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-xl">
              <span className="text-muted-foreground">סה"כ הכנסות</span>
              <span className="text-2xl font-bold text-primary">{formatCurrency(calcRevenue(orders))}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-xl">
              <span className="text-muted-foreground">גולשים כרגע</span>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                <span className="text-2xl font-bold text-success">{totalVisitors}</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* ===== RECENT ORDERS ===== */}
      <Card className="p-4">
        <h3 className="font-bold text-lg mb-4">הזמנות אחרונות</h3>
        <div className="space-y-3">
          {orders.slice(0, 10).map((order) => (
            <div key={order.id} className="p-3 bg-muted/30 rounded-xl space-y-1">
              <div className="flex items-center justify-between">
                <span className={cn(
                  "text-xs px-2 py-1 rounded-full font-medium",
                  order.status === 'pending' && "bg-warning/10 text-warning",
                  order.status === 'completed' && "bg-success/10 text-success",
                  !['pending', 'completed'].includes(order.status) && "bg-primary/10 text-primary",
                )}>
                  {order.status === 'pending' ? 'ממתין' : 
                   order.status === 'completed' ? 'הושלם' : 'בתהליך'}
                </span>
                <span className="font-medium text-foreground">{order.customerName}</span>
              </div>
              <p className="text-sm text-muted-foreground">{order.deviceType}</p>
              <p className="text-sm text-muted-foreground break-words">{order.issueDescription}</p>
              <div className="flex items-center justify-between">
                <span className="font-bold text-primary text-sm">₪{order.repairPrice}</span>
                <span className="text-xs text-muted-foreground">#{(order as any).orderNumber || ''}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default AdminDashboard;
