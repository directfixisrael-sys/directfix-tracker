import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { RepairOrder } from '@/types/repair';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import {
  User, Phone, Mail, MapPin, Calendar, Award, History, Shield,
  Crown, ArrowRight, Package, DollarSign, Gift, Clock, CheckCircle2, XCircle
} from 'lucide-react';

interface CustomerProfileViewProps {
  phone: string;
  name: string;
  orders: RepairOrder[];
  onClose: () => void;
}

const statusLabels: Record<string, string> = {
  pending: 'ממתין',
  approved: 'אושר',
  in_progress: 'בתיקון',
  completed: 'הושלם',
  cancelled: 'בוטל',
};

const statusColors: Record<string, string> = {
  pending: 'bg-warning/10 text-warning',
  approved: 'bg-primary/10 text-primary',
  in_progress: 'bg-primary/10 text-primary',
  completed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  cancelled: 'bg-muted text-muted-foreground',
};

const POINT_VALUE = 0.5;

const CustomerProfileView = ({ phone, name, orders, onClose }: CustomerProfileViewProps) => {
  const [profileData, setProfileData] = useState<any>(null);
  const [clubData, setClubData] = useState<any>(null);
  const [points, setPoints] = useState(0);
  const [loading, setLoading] = useState(true);

  const customerOrders = orders
    .filter(o => o.customerPhone === phone)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const totalSpent = customerOrders.reduce((sum, o) => sum + o.repairPrice, 0);
  const completedOrders = customerOrders.filter(o => o.status === 'completed');

  useEffect(() => {
    loadCustomerData();
  }, [phone]);

  const loadCustomerData = async () => {
    setLoading(true);
    const normalized = phone.replace(/\D/g, '');

    const [profileRes, clubRes, pointsRes] = await Promise.all([
      supabase.functions.invoke('customer-auth', {
        body: { action: 'get_profile', phone: normalized },
      }).catch(() => ({ data: null })),
      supabase.from('club_members').select('*').eq('phone', normalized).maybeSingle(),
      supabase.from('loyalty_points').select('points, type').eq('customer_phone', normalized),
    ]);

    if (profileRes.data && !profileRes.data?.error) {
      setProfileData(profileRes.data);
    }
    if (clubRes.data) {
      setClubData(clubRes.data);
    }
    if (pointsRes.data) {
      const total = pointsRes.data.reduce((sum: number, p: any) => {
        return sum + (p.type === 'earned' ? p.points : -p.points);
      }, 0);
      setPoints(Math.max(0, total));
    }
    setLoading(false);
  };

  const latestAddress = customerOrders[0]?.customerAddress || '';
  const latestEmail = customerOrders[0]?.customerEmail || profileData?.email || '';

  return (
    <div className="flex-1 p-4 md:p-6 pb-24 md:pb-6 overflow-y-auto">
      {/* Back button */}
      <button onClick={onClose} className="flex items-center gap-2 text-primary hover:underline mb-4 text-sm font-medium">
        <ArrowRight className="w-4 h-4" />
        חזרה לרשימת לקוחות
      </button>

      {/* Profile Header */}
      <Card className="p-6 mb-4 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
            <span className="text-primary font-bold text-2xl">{name.charAt(0)}</span>
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold text-foreground">{name}</h2>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> <span dir="ltr">{phone}</span></span>
              {latestEmail && <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> {latestEmail}</span>}
              {latestAddress && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {latestAddress}</span>}
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              {profileData && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                  <User className="w-3 h-3" /> פרופיל רשום
                </span>
              )}
              {clubData?.is_active && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 text-xs font-medium">
                  <Crown className="w-3 h-3" /> חבר מועדון
                </span>
              )}
              {profileData?.birthday && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400 text-xs font-medium">
                  <Gift className="w-3 h-3" /> יום הולדת: {format(new Date(profileData.birthday), 'dd/MM', { locale: he })}
                </span>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <Card className="p-4 text-center">
          <Package className="w-5 h-5 text-primary mx-auto mb-1" />
          <p className="text-2xl font-bold text-foreground">{customerOrders.length}</p>
          <p className="text-xs text-muted-foreground">הזמנות</p>
        </Card>
        <Card className="p-4 text-center">
          <DollarSign className="w-5 h-5 text-green-600 mx-auto mb-1" />
          <p className="text-2xl font-bold text-foreground">₪{totalSpent.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">סה"כ הוצאות</p>
        </Card>
        <Card className="p-4 text-center">
          <Award className="w-5 h-5 text-amber-600 mx-auto mb-1" />
          <p className="text-2xl font-bold text-foreground">{points}</p>
          <p className="text-xs text-muted-foreground">נקודות (₪{(points * POINT_VALUE).toFixed(0)})</p>
        </Card>
        <Card className="p-4 text-center">
          <CheckCircle2 className="w-5 h-5 text-green-600 mx-auto mb-1" />
          <p className="text-2xl font-bold text-foreground">{completedOrders.length}</p>
          <p className="text-xs text-muted-foreground">תיקונים שהושלמו</p>
        </Card>
      </div>

      {/* Profile Details */}
      {profileData && (
        <Card className="p-4 mb-4">
          <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
            <User className="w-4 h-4 text-primary" /> פרטי פרופיל
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">מייל:</span>
              <span className="font-medium text-foreground">{profileData.email || 'לא הוזן'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">תאריך לידה:</span>
              <span className="font-medium text-foreground">
                {profileData.birthday ? format(new Date(profileData.birthday), 'dd/MM/yyyy', { locale: he }) : 'לא הוזן'}
              </span>
            </div>
          </div>
        </Card>
      )}

      {/* Club Membership */}
      {clubData && (
        <Card className="p-4 mb-4">
          <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
            <Crown className="w-4 h-4 text-amber-600" /> חברות במועדון
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
            <div>
              <span className="text-muted-foreground">סטטוס:</span>{' '}
              <span className={`font-medium ${clubData.is_active ? 'text-green-600' : 'text-red-500'}`}>
                {clubData.is_active ? 'פעיל' : 'לא פעיל'}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">הצטרף:</span>{' '}
              <span className="font-medium text-foreground">
                {format(new Date(clubData.joined_at), 'dd/MM/yyyy', { locale: he })}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">דיוור:</span>{' '}
              <span className="font-medium">
                {clubData.wants_promotions ? (
                  <span className="text-green-600">מאושר</span>
                ) : (
                  <span className="text-red-500 flex items-center gap-1"><XCircle className="w-3 h-3" /> הסיר פרסומות</span>
                )}
              </span>
            </div>
          </div>
        </Card>
      )}

      {/* Orders History */}
      <Card className="p-4">
        <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
          <History className="w-4 h-4 text-primary" /> היסטוריית הזמנות ({customerOrders.length})
        </h3>
        {customerOrders.length === 0 ? (
          <p className="text-center text-muted-foreground py-6">אין הזמנות</p>
        ) : (
          <div className="space-y-2">
            {customerOrders.map((order) => (
              <div key={order.id} className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${statusColors[order.status] || 'bg-muted text-muted-foreground'}`}>
                      {statusLabels[order.status] || order.status}
                    </span>
                    <span className="text-[10px] text-muted-foreground">#{order.orderNumber}</span>
                  </div>
                  <p className="font-semibold text-foreground text-sm">{order.deviceType}</p>
                  <p className="text-xs text-muted-foreground truncate">{order.issueDescription}</p>
                </div>
                <div className="text-left flex-shrink-0">
                  <p className="text-sm font-bold text-foreground">₪{order.repairPrice}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {format(new Date(order.createdAt), 'dd/MM/yy', { locale: he })}
                  </p>
                </div>
                {order.warrantyMonths && order.status === 'completed' && (
                  <div className="flex-shrink-0">
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 text-[10px] font-medium">
                      <Shield className="w-3 h-3" /> {order.warrantyMonths} חודשים
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default CustomerProfileView;
