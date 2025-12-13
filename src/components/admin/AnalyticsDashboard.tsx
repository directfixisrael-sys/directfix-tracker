import { useState, useEffect } from 'react';
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
  ArrowUp,
  ArrowDown,
  Minus,
  RefreshCw,
  Calendar
} from 'lucide-react';
import { RepairOrder } from '@/types/repair';
import { cn } from '@/lib/utils';

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

const AnalyticsDashboard = ({ orders }: AnalyticsDashboardProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  
  // Calculate real-time viewers (orders being viewed within last 2 minutes)
  const activeViewers = orders.filter(o => {
    if (!o.isViewing || !o.lastViewedAt) return false;
    const lastViewed = new Date(o.lastViewedAt);
    const diffMs = new Date().getTime() - lastViewed.getTime();
    return diffMs < 2 * 60 * 1000;
  });

  // Calculate orders stats
  const todayOrders = orders.filter(o => {
    const created = new Date(o.createdAt);
    const today = new Date();
    return created.toDateString() === today.toDateString();
  });

  const weekOrders = orders.filter(o => {
    const created = new Date(o.createdAt);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return created > weekAgo;
  });

  const completedOrders = orders.filter(o => o.status === 'completed');
  const pendingOrders = orders.filter(o => o.status === 'pending');
  
  // Calculate funnel
  const startedRepairProcess = orders.length;
  const confirmedOrders = orders.filter(o => 
    !['pending'].includes(o.status)
  ).length;

  // Calculate average rating
  const ratedOrders = orders.filter(o => o.rating);
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
    topSources: [
      { source: 'Direct', count: 22 },
      { source: 'directfix.co.il', count: 5 },
    ],
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">אנליטיקס</h2>
          <p className="text-sm text-muted-foreground">
            עודכן לאחרונה: {lastUpdated.toLocaleTimeString('he-IL')}
          </p>
        </div>
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

      {/* Real-time Section */}
      <Card className="p-4 bg-gradient-to-br from-success/10 to-success/5 border-success/20">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-success/20 rounded-full flex items-center justify-center animate-pulse">
            <Activity className="w-6 h-6 text-success" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">צופים כרגע באתר</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-success">{activeViewers.length}</span>
              <span className="text-sm text-success">בזמן אמת</span>
            </div>
          </div>
        </div>
        {activeViewers.length > 0 && (
          <div className="mt-4 pt-4 border-t border-success/20">
            <p className="text-xs text-muted-foreground mb-2">לקוחות צופים:</p>
            <div className="flex flex-wrap gap-2">
              {activeViewers.map(viewer => (
                <span 
                  key={viewer.id} 
                  className="text-xs bg-success/20 text-success px-2 py-1 rounded-full"
                >
                  {viewer.customerName}
                </span>
              ))}
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
          סטטיסטיקות הזמנות
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <p className="text-3xl font-bold text-primary">{todayOrders.length}</p>
            <p className="text-xs text-muted-foreground">הזמנות היום</p>
          </div>
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <p className="text-3xl font-bold text-accent">{weekOrders.length}</p>
            <p className="text-xs text-muted-foreground">הזמנות השבוע</p>
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
