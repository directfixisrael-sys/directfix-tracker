import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  Eye, 
  TrendingUp, 
  Clock,
  Smartphone,
  Globe,
  Activity,
  RefreshCw,
  DollarSign,
  BarChart3,
  Target
} from 'lucide-react';
import { RepairOrder } from '@/types/repair';
import { cn } from '@/lib/utils';
import DateRangePicker, { DateRange } from './DateRangePicker';
import { subDays, startOfDay, endOfDay, isWithinInterval, format, eachDayOfInterval, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { he } from 'date-fns/locale';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend } from 'recharts';
import { useLiveVisitors } from '@/hooks/useLiveVisitors';

interface AnalyticsDashboardProps {
  orders: RepairOrder[];
}

interface DailyMetric {
  date: string;
  value: number;
}

interface AnalyticsData {
  visitors: { total: number; data: DailyMetric[] };
  pageviews: { total: number; data: DailyMetric[] };
  pageviewsPerVisit: { average: number; data: DailyMetric[] };
  sessionDuration: { average: number; data: DailyMetric[] };
  bounceRate: { average: number; data: DailyMetric[] };
  topPages: { path: string; count: number }[];
  topSources: { source: string; count: number }[];
  devices: { device: string; count: number }[];
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--accent))', 'hsl(var(--warning))', 'hsl(var(--success))', 'hsl(var(--destructive))'];

// Page name translations
const PAGE_NAMES: Record<string, string> = {
  '/': 'דף הבית',
  '/order': 'הזמנה חדשה',
  '/track': 'מעקב הזמנה',
  '/admin': 'פאנל ניהול',
  '/purchase': 'רכישת מכשיר',
};

// Shopify-style Live Visitors Card
const LiveVisitorsCard = ({ activeViewers }: { activeViewers: any[] }) => {
  const { totalVisitors, visitorsByPage, visitorsBySource, visitors } = useLiveVisitors();
  
  // Determine device type from userAgent
  const getDevice = (ua?: string) => {
    if (!ua) return 'לא ידוע';
    if (/mobile|android|iphone/i.test(ua)) return '📱 נייד';
    if (/tablet|ipad/i.test(ua)) return '📱 טאבלט';
    return '🖥️ מחשב';
  };
  
  return (
    <Card className="p-5 border-success/30 bg-card">
      {/* Header - big green number */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-4 h-4 bg-success rounded-full animate-pulse" />
            <div className="absolute inset-0 w-4 h-4 bg-success rounded-full animate-ping opacity-30" />
          </div>
          <div>
            <span className="text-4xl font-bold text-success">{totalVisitors}</span>
            <p className="text-muted-foreground">גולשים כרגע באתר</p>
          </div>
        </div>
      </div>

      {/* Visitor list - Shopify style */}
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
          <div className="divide-y divide-border max-h-48 overflow-y-auto">
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

      {/* Sources breakdown */}
      {Object.keys(visitorsBySource).length > 0 && (
        <div className="grid grid-cols-2 gap-3 mb-4">
          {Object.entries(visitorsBySource).map(([source, count]) => (
            <div key={source} className="flex items-center justify-between bg-muted/50 px-3 py-2 rounded-lg">
              <span className="text-sm truncate">{source}</span>
              <span className="font-bold text-primary">{count}</span>
            </div>
          ))}
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
      
      {/* Order viewers */}
      {activeViewers.length > 0 && (
        <div className="mt-4 pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground mb-2">👁️ לקוחות צופים בהזמנות:</p>
          <div className="flex flex-wrap gap-2">
            {activeViewers.map(viewer => (
              <span 
                key={viewer.id} 
                className="text-xs bg-primary/10 text-primary px-3 py-1.5 rounded-full font-medium"
              >
                {viewer.customerName}
              </span>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
};

const AnalyticsDashboard = ({ orders }: AnalyticsDashboardProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [dateRange, setDateRange] = useState<DateRange>({
    from: startOfMonth(new Date()),
    to: endOfDay(new Date()),
    label: 'החודש הנוכחי',
  });
  
  // Filter orders by date range
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const orderDate = new Date(order.createdAt);
      return isWithinInterval(orderDate, { start: dateRange.from, end: dateRange.to });
    });
  }, [orders, dateRange]);

  // Calculate revenue data
  const revenueData = useMemo(() => {
    const calculateOrderTotal = (order: RepairOrder) => {
      const accessoriesTotal = Array.isArray(order.accessories) 
        ? order.accessories.reduce((sum: number, acc: any) => sum + (acc.selected ? (acc.price || 0) : 0), 0)
        : 0;
      return (order.repairPrice || 0) + accessoriesTotal;
    };

    // Total revenue
    const totalRevenue = filteredOrders.reduce((sum, order) => sum + calculateOrderTotal(order), 0);
    
    // Completed orders revenue
    const completedRevenue = filteredOrders
      .filter(o => o.status === 'completed')
      .reduce((sum, order) => sum + calculateOrderTotal(order), 0);

    // Daily revenue for chart
    const days = eachDayOfInterval({ start: dateRange.from, end: dateRange.to });
    const dailyRevenue = days.map(day => {
      const dayOrders = filteredOrders.filter(order => {
        const orderDate = new Date(order.createdAt);
        return orderDate.toDateString() === day.toDateString();
      });
      const revenue = dayOrders.reduce((sum, order) => sum + calculateOrderTotal(order), 0);
      return {
        date: format(day, 'dd/MM', { locale: he }),
        revenue,
        orders: dayOrders.length,
      };
    });

    // Revenue by device type
    const deviceRevenue: Record<string, number> = {};
    filteredOrders.forEach(order => {
      const device = order.deviceType || 'אחר';
      deviceRevenue[device] = (deviceRevenue[device] || 0) + calculateOrderTotal(order);
    });
    const revenueByDevice = Object.entries(deviceRevenue)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    // Average order value
    const avgOrderValue = filteredOrders.length > 0 
      ? totalRevenue / filteredOrders.length 
      : 0;

    // Compare to previous period
    const periodDays = Math.ceil((dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24));
    const previousFrom = subDays(dateRange.from, periodDays);
    const previousTo = subDays(dateRange.to, periodDays);
    const previousOrders = orders.filter(order => {
      const orderDate = new Date(order.createdAt);
      return isWithinInterval(orderDate, { start: previousFrom, end: previousTo });
    });
    const previousRevenue = previousOrders.reduce((sum, order) => sum + calculateOrderTotal(order), 0);
    const revenueChange = previousRevenue > 0 
      ? ((totalRevenue - previousRevenue) / previousRevenue) * 100 
      : 0;

    return {
      totalRevenue,
      completedRevenue,
      dailyRevenue,
      revenueByDevice,
      avgOrderValue,
      revenueChange,
      previousRevenue,
    };
  }, [filteredOrders, dateRange, orders]);

  // Calculate real-time viewers (orders being viewed within last 2 minutes)
  const activeViewers = orders.filter(o => {
    if (!o.isViewing || !o.lastViewedAt) return false;
    const lastViewed = new Date(o.lastViewedAt);
    const diffMs = new Date().getTime() - lastViewed.getTime();
    return diffMs < 2 * 60 * 1000;
  });

  // Calculate orders stats using filtered orders
  const todayOrders = filteredOrders.filter(o => {
    const created = new Date(o.createdAt);
    const today = new Date();
    return created.toDateString() === today.toDateString();
  });

  const periodOrders = filteredOrders;

  const completedOrders = filteredOrders.filter(o => o.status === 'completed');
  const pendingOrders = filteredOrders.filter(o => o.status === 'pending');
  
  // Calculate funnel
  const startedRepairProcess = filteredOrders.length;
  const confirmedOrders = filteredOrders.filter(o => 
    !['pending'].includes(o.status)
  ).length;

  // Calculate average rating
  const ratedOrders = filteredOrders.filter(o => o.rating);
  const avgRating = ratedOrders.length > 0 
    ? (ratedOrders.reduce((sum, o) => sum + (o.rating || 0), 0) / ratedOrders.length).toFixed(1)
    : '--';

  // Mock analytics data (in real app, this would come from an analytics API)
  const analyticsData: AnalyticsData = {
    visitors: { total: 25, data: [] },
    pageviews: { total: 61, data: [] },
    pageviewsPerVisit: { average: 2.44, data: [] },
    sessionDuration: { average: 95, data: [] },
    bounceRate: { average: 56, data: [] },
    topPages: [
      { path: '/track', count: 16 },
      { path: '/order', count: 13 },
      { path: '/', count: 10 },
      { path: '/admin', count: 1 },
    ],
    topSources: (() => {
      const sources: Record<string, number> = {};
      filteredOrders.forEach(o => {
        const src = o.leadSource || 'ישיר';
        sources[src] = (sources[src] || 0) + 1;
      });
      return Object.entries(sources)
        .map(([source, count]) => ({ source, count }))
        .sort((a, b) => b.count - a.count);
    })(),
    devices: [
      { device: 'mobile', count: 17 },
      { device: 'desktop', count: 7 },
      { device: 'tablet', count: 1 },
    ],
  };

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${Math.round(seconds)} שניות`;
    const minutes = Math.floor(seconds / 60);
    const secs = Math.round(seconds % 60);
    return `${minutes}:${secs.toString().padStart(2, '0')} דקות`;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS', maximumFractionDigits: 0 }).format(amount);
  };

  const getDeviceIcon = (device: string) => {
    switch (device) {
      case 'mobile': return '📱';
      case 'desktop': return '🖥️';
      case 'tablet': return '📱';
      default: return '📱';
    }
  };

  return (
    <div className="flex-1 p-4 md:p-6 overflow-y-auto pb-24 md:pb-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-foreground">אנליטיקס</h2>
          <p className="text-sm text-muted-foreground">
            עודכן לאחרונה: {lastUpdated.toLocaleTimeString('he-IL')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <DateRangePicker value={dateRange} onChange={setDateRange} />
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setLastUpdated(new Date())}
            className="gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            רענן
          </Button>
        </div>
      </div>

      {/* Real-time Visitors Section */}
      <LiveVisitorsCard activeViewers={activeViewers} />

      {/* Lead Source Stats */}
      {filteredOrders.some(o => o.leadSource) && (
        <Card className="p-4">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            מקורות לידים ({dateRange.label})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={(() => {
                      const sources: Record<string, number> = {};
                      filteredOrders.forEach(o => {
                        const src = o.leadSource || 'לא ידוע';
                        sources[src] = (sources[src] || 0) + 1;
                      });
                      return Object.entries(sources)
                        .map(([name, value]) => ({ name, value }))
                        .sort((a, b) => b.value - a.value);
                    })()}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={75}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    labelLine={false}
                  >
                    {(() => {
                      const sources: Record<string, number> = {};
                      filteredOrders.forEach(o => {
                        const src = o.leadSource || 'לא ידוע';
                        sources[src] = (sources[src] || 0) + 1;
                      });
                      return Object.keys(sources).map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ));
                    })()}
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
            <div className="space-y-3">
              {(() => {
                const sources: Record<string, number> = {};
                filteredOrders.forEach(o => {
                  const src = o.leadSource || 'לא ידוע';
                  sources[src] = (sources[src] || 0) + 1;
                });
                return Object.entries(sources)
                  .sort(([, a], [, b]) => b - a)
                  .map(([source, count], index) => (
                    <div key={source} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="text-sm">{source}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold">{count}</span>
                        <span className="text-xs text-muted-foreground">
                          ({((count / filteredOrders.length) * 100).toFixed(0)}%)
                        </span>
                      </div>
                    </div>
                  ));
              })()}
            </div>
          </div>
        </Card>
      )}

      {/* Revenue Report Section */}
      <Card className="p-4 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-primary" />
          דוח הכנסות ({dateRange.label})
        </h3>
        
        {/* Revenue Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-card p-4 rounded-lg border">
            <p className="text-xs text-muted-foreground mb-1">סה״כ הכנסות</p>
            <p className="text-2xl font-bold text-primary">{formatCurrency(revenueData.totalRevenue)}</p>
            {revenueData.revenueChange !== 0 && (
              <p className={cn(
                "text-xs mt-1 flex items-center gap-1",
                revenueData.revenueChange > 0 ? "text-success" : "text-destructive"
              )}>
                {revenueData.revenueChange > 0 ? '↑' : '↓'}
                {Math.abs(revenueData.revenueChange).toFixed(1)}% מהתקופה הקודמת
              </p>
            )}
          </div>
          <div className="bg-card p-4 rounded-lg border">
            <p className="text-xs text-muted-foreground mb-1">הכנסות שהושלמו</p>
            <p className="text-2xl font-bold text-success">{formatCurrency(revenueData.completedRevenue)}</p>
          </div>
          <div className="bg-card p-4 rounded-lg border">
            <p className="text-xs text-muted-foreground mb-1">ממוצע להזמנה</p>
            <p className="text-2xl font-bold text-accent">{formatCurrency(revenueData.avgOrderValue)}</p>
          </div>
          <div className="bg-card p-4 rounded-lg border">
            <p className="text-xs text-muted-foreground mb-1">הזמנות בתקופה</p>
            <p className="text-2xl font-bold">{filteredOrders.length}</p>
          </div>
        </div>

        {/* Revenue Chart */}
        <div className="bg-card p-4 rounded-lg border mb-6">
          <h4 className="font-semibold mb-4 flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            הכנסות לפי יום
          </h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData.dailyRevenue}>
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 10 }}
                  interval="preserveStartEnd"
                />
                <YAxis 
                  tick={{ fontSize: 10 }}
                  tickFormatter={(value) => `₪${value}`}
                />
                <Tooltip 
                  formatter={(value: number) => [formatCurrency(value), 'הכנסות']}
                  labelFormatter={(label) => `תאריך: ${label}`}
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    direction: 'rtl'
                  }}
                />
                <Bar 
                  dataKey="revenue" 
                  fill="hsl(var(--primary))" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue by Device Type */}
        {revenueData.revenueByDevice.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-card p-4 rounded-lg border">
              <h4 className="font-semibold mb-4">הכנסות לפי סוג מכשיר</h4>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={revenueData.revenueByDevice}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={70}
                      paddingAngle={2}
                      dataKey="value"
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      labelLine={false}
                    >
                      {revenueData.revenueByDevice.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number) => formatCurrency(value)}
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="bg-card p-4 rounded-lg border">
              <h4 className="font-semibold mb-4">פירוט לפי מכשיר</h4>
              <div className="space-y-3">
                {revenueData.revenueByDevice.map((device, index) => (
                  <div key={device.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="text-sm">{device.name}</span>
                    </div>
                    <span className="font-medium">{formatCurrency(device.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">מבקרים (7 ימים)</p>
              <p className="text-2xl font-bold">{analyticsData.visitors.total}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
              <Eye className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">צפיות בדף</p>
              <p className="text-2xl font-bold">{analyticsData.pageviews.total}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-warning" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">זמן ממוצע</p>
              <p className="text-2xl font-bold">{formatDuration(analyticsData.sessionDuration.average)}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-destructive/10 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-destructive" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Bounce Rate</p>
              <p className="text-2xl font-bold">{analyticsData.bounceRate.average}%</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Orders Stats */}
      <Card className="p-4">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Smartphone className="w-5 h-5 text-primary" />
          סטטיסטיקות הזמנות ({dateRange.label})
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <p className="text-3xl font-bold text-primary">{todayOrders.length}</p>
            <p className="text-xs text-muted-foreground">הזמנות היום</p>
          </div>
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <p className="text-3xl font-bold text-accent">{periodOrders.length}</p>
            <p className="text-xs text-muted-foreground">בתקופה</p>
          </div>
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <p className="text-3xl font-bold text-success">{completedOrders.length}</p>
            <p className="text-xs text-muted-foreground">הושלמו</p>
          </div>
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <p className="text-3xl font-bold text-warning">{pendingOrders.length}</p>
            <p className="text-xs text-muted-foreground">ממתינים</p>
          </div>
        </div>
      </Card>

      {/* Conversion Funnel */}
      <Card className="p-4">
        <h3 className="font-semibold mb-4">משפך המרה</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <div className="flex justify-between text-sm mb-1">
                <span>התחילו תהליך תיקון</span>
                <span className="font-medium">{startedRepairProcess}</span>
              </div>
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full" style={{ width: '100%' }} />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <div className="flex justify-between text-sm mb-1">
                <span>אושרו</span>
                <span className="font-medium">{confirmedOrders}</span>
              </div>
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-accent rounded-full" 
                  style={{ width: `${startedRepairProcess > 0 ? (confirmedOrders / startedRepairProcess) * 100 : 0}%` }} 
                />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <div className="flex justify-between text-sm mb-1">
                <span>הושלמו</span>
                <span className="font-medium">{completedOrders.length}</span>
              </div>
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-success rounded-full" 
                  style={{ width: `${startedRepairProcess > 0 ? (completedOrders.length / startedRepairProcess) * 100 : 0}%` }} 
                />
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Top Pages */}
        <Card className="p-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Globe className="w-4 h-4 text-primary" />
            עמודים פופולריים
          </h3>
          <div className="space-y-2">
            {analyticsData.topPages.map((page, i) => (
              <div key={page.path} className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{page.path}</span>
                <span className="text-sm font-medium">{page.count}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Traffic Sources */}
        <Card className="p-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            מקורות תעבורה
          </h3>
          <div className="space-y-2">
            {analyticsData.topSources.map((source, i) => (
              <div key={source.source} className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{source.source}</span>
                <span className="text-sm font-medium">{source.count}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Devices */}
        <Card className="p-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-primary" />
            מכשירים
          </h3>
          <div className="space-y-2">
            {analyticsData.devices.map((device, i) => (
              <div key={device.device} className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground flex items-center gap-2">
                  <span>{getDeviceIcon(device.device)}</span>
                  {device.device === 'mobile' ? 'נייד' : device.device === 'desktop' ? 'מחשב' : 'טאבלט'}
                </span>
                <span className="text-sm font-medium">{device.count}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Rating Stats */}
      <Card className="p-4">
        <h3 className="font-semibold mb-4">דירוג ממוצע</h3>
        <div className="flex items-center gap-4">
          <div className="text-4xl font-bold text-warning">{avgRating}</div>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map(star => (
              <span 
                key={star} 
                className={cn(
                  "text-xl",
                  Number(avgRating) >= star ? "text-warning" : "text-muted"
                )}
              >
                ⭐
              </span>
            ))}
          </div>
          <span className="text-sm text-muted-foreground">
            ({ratedOrders.length} דירוגים)
          </span>
        </div>
      </Card>
    </div>
  );
};

export default AnalyticsDashboard;
