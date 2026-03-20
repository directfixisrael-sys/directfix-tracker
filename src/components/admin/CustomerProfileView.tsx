import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { RepairOrder } from '@/types/repair';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import {
  User, Phone, Mail, MapPin, Calendar, Award, History, Shield,
  Crown, ArrowRight, Package, DollarSign, Gift, CheckCircle2, XCircle,
  BellOff, Star, CreditCard, Coins, Clock, FileText, Wrench, ExternalLink, Loader2
} from 'lucide-react';

interface CustomerProfileViewProps {
  phone: string;
  name: string;
  orders: RepairOrder[];
  onClose: () => void;
}

const statusLabels: Record<string, string> = {
  pending: 'ממתין', approved: 'אושר', in_progress: 'בתיקון', completed: 'הושלם', cancelled: 'בוטל',
};
const statusColors: Record<string, string> = {
  pending: 'bg-warning/10 text-warning', approved: 'bg-primary/10 text-primary',
  in_progress: 'bg-primary/10 text-primary',
  completed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  cancelled: 'bg-muted text-muted-foreground',
};

const POINT_VALUE = 0.5;

const CustomerProfileView = ({ phone, name, orders, onClose }: CustomerProfileViewProps) => {
  const [profileData, setProfileData] = useState<any>(null);
  const [clubData, setClubData] = useState<any>(null);
  const [points, setPoints] = useState(0);
  const [pointsHistory, setPointsHistory] = useState<any[]>([]);
  const [referrals, setReferrals] = useState<any[]>([]);
  const [leadData, setLeadData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const normalized = phone.replace(/\D/g, '');
  const customerOrders = orders
    .filter(o => o.customerPhone === normalized || o.customerPhone === phone)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const totalSpent = customerOrders.reduce((sum, o) => sum + o.repairPrice, 0);
  const completedOrders = customerOrders.filter(o => o.status === 'completed');
  const avgOrderValue = customerOrders.length > 0 ? totalSpent / customerOrders.length : 0;
  const firstOrderDate = customerOrders.length > 0 ? customerOrders[customerOrders.length - 1].createdAt : null;

  // Collect all unique addresses & emails
  const allAddresses = [...new Set(customerOrders.map(o => o.customerAddress).filter(Boolean))];
  const allEmails = [...new Set([
    ...(profileData?.email ? [profileData.email] : []),
    ...customerOrders.map(o => o.customerEmail).filter(Boolean),
  ])];

  // Coupons used
  const couponsUsed = customerOrders
    .filter(o => o.couponCode)
    .map(o => ({ code: o.couponCode, discount: o.couponDiscount, orderId: o.orderNumber }));

  useEffect(() => {
    loadCustomerData();
  }, [phone]);

  const loadCustomerData = async () => {
    setLoading(true);

    const [profileRes, clubRes, pointsRes, referralsRes, leadRes] = await Promise.all([
      supabase.functions.invoke('customer-auth', {
        body: { action: 'get_profile', phone: normalized },
      }).catch(() => ({ data: null })),
      supabase.from('club_members').select('*').eq('phone', normalized).maybeSingle(),
      supabase.from('loyalty_points').select('*').eq('customer_phone', normalized).order('created_at', { ascending: false }),
      supabase.from('referrals').select('*').or(`referrer_phone.eq.${normalized},referred_phone.eq.${normalized}`),
      supabase.from('leads').select('*').eq('customer_phone', normalized).order('created_at', { ascending: false }).limit(1).maybeSingle(),
    ]);

    if (profileRes.data && !profileRes.data?.error) setProfileData(profileRes.data);
    if (clubRes.data) setClubData(clubRes.data);
    if (pointsRes.data) {
      setPointsHistory(pointsRes.data);
      const total = pointsRes.data.reduce((sum: number, p: any) => {
        return sum + (p.type === 'earned' ? p.points : -p.points);
      }, 0);
      setPoints(Math.max(0, total));
    }
    if (referralsRes.data) setReferrals(referralsRes.data);
    if (leadRes.data) setLeadData(leadRes.data);

    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 md:p-6 pb-24 md:pb-6 overflow-y-auto">
      {/* Back */}
      <button onClick={onClose} className="flex items-center gap-2 text-primary hover:underline mb-4 text-sm font-medium">
        <ArrowRight className="w-4 h-4" /> חזרה לרשימת לקוחות
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
              {allEmails[0] && <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> {allEmails[0]}</span>}
              {allAddresses[0] && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {allAddresses[0]}</span>}
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-2 mt-3">
              {profileData && (
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 gap-1">
                  <User className="w-3 h-3" /> פרופיל רשום
                </Badge>
              )}
              {clubData?.is_active && (
                <Badge variant="outline" className="bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 gap-1">
                  <Crown className="w-3 h-3" /> חבר מועדון
                </Badge>
              )}
              {clubData && !clubData.is_active && (
                <Badge variant="outline" className="bg-muted text-muted-foreground gap-1">
                  <Crown className="w-3 h-3" /> עזב מועדון
                </Badge>
              )}
              {clubData && !clubData.wants_promotions && (
                <Badge variant="destructive" className="gap-1">
                  <BellOff className="w-3 h-3" /> הסיר תפוצה
                </Badge>
              )}
              {profileData?.birthday && (
                <Badge variant="outline" className="bg-pink-100 text-pink-700 border-pink-200 dark:bg-pink-900/30 dark:text-pink-400 gap-1">
                  <Gift className="w-3 h-3" /> {format(new Date(profileData.birthday), 'dd/MM', { locale: he })}
                </Badge>
              )}
              {customerOrders.length > 1 && (
                <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 gap-1">
                  <Star className="w-3 h-3" /> לקוח חוזר
                </Badge>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
        <Card className="p-3 text-center">
          <Package className="w-5 h-5 text-primary mx-auto mb-1" />
          <p className="text-xl font-bold text-foreground">{customerOrders.length}</p>
          <p className="text-[11px] text-muted-foreground">הזמנות</p>
        </Card>
        <Card className="p-3 text-center">
          <DollarSign className="w-5 h-5 text-green-600 mx-auto mb-1" />
          <p className="text-xl font-bold text-foreground">₪{totalSpent.toLocaleString()}</p>
          <p className="text-[11px] text-muted-foreground">סה"כ הוצאות</p>
        </Card>
        <Card className="p-3 text-center">
          <Award className="w-5 h-5 text-amber-600 mx-auto mb-1" />
          <p className="text-xl font-bold text-foreground">{points}</p>
          <p className="text-[11px] text-muted-foreground">נקודות (₪{(points * POINT_VALUE).toFixed(0)})</p>
        </Card>
        <Card className="p-3 text-center">
          <CheckCircle2 className="w-5 h-5 text-green-600 mx-auto mb-1" />
          <p className="text-xl font-bold text-foreground">{completedOrders.length}</p>
          <p className="text-[11px] text-muted-foreground">הושלמו</p>
        </Card>
        <Card className="p-3 text-center">
          <CreditCard className="w-5 h-5 text-primary mx-auto mb-1" />
          <p className="text-xl font-bold text-foreground">₪{avgOrderValue.toFixed(0)}</p>
          <p className="text-[11px] text-muted-foreground">ממוצע להזמנה</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Profile Details */}
        <Card className="p-4">
          <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
            <User className="w-4 h-4 text-primary" /> פרטי לקוח
          </h3>
          <div className="space-y-2.5 text-sm">
            <div className="flex items-start gap-2">
              <Phone className="w-4 h-4 text-muted-foreground mt-0.5" />
              <div>
                <span className="text-muted-foreground">טלפון: </span>
                <span className="font-medium text-foreground" dir="ltr">{phone}</span>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Mail className="w-4 h-4 text-muted-foreground mt-0.5" />
              <div>
                <span className="text-muted-foreground">מיילים: </span>
                {allEmails.length > 0
                  ? allEmails.map((e, i) => <span key={i} className="font-medium text-foreground block">{e}</span>)
                  : <span className="text-muted-foreground/60">לא הוזן</span>
                }
              </div>
            </div>
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
              <div>
                <span className="text-muted-foreground">כתובות: </span>
                {allAddresses.length > 0
                  ? allAddresses.map((a, i) => <span key={i} className="font-medium text-foreground block">{a}</span>)
                  : <span className="text-muted-foreground/60">לא הוזנה</span>
                }
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground mt-0.5" />
              <div>
                <span className="text-muted-foreground">יום הולדת: </span>
                <span className="font-medium text-foreground">
                  {profileData?.birthday ? format(new Date(profileData.birthday), 'dd/MM/yyyy', { locale: he }) : 'לא הוזן'}
                </span>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Clock className="w-4 h-4 text-muted-foreground mt-0.5" />
              <div>
                <span className="text-muted-foreground">לקוח מאז: </span>
                <span className="font-medium text-foreground">
                  {firstOrderDate ? format(new Date(firstOrderDate), 'dd/MM/yyyy', { locale: he }) : '-'}
                </span>
              </div>
            </div>
            {customerOrders[0]?.rating && (
              <div className="flex items-start gap-2">
                <Star className="w-4 h-4 text-amber-500 mt-0.5" />
                <div>
                  <span className="text-muted-foreground">דירוג אחרון: </span>
                  <span className="font-medium text-foreground">{'★'.repeat(customerOrders[0].rating)}{'☆'.repeat(5 - customerOrders[0].rating)}</span>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Club & Subscription Status */}
        <Card className="p-4">
          <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
            <Crown className="w-4 h-4 text-amber-600" /> מועדון ודיוור
          </h3>
          {clubData ? (
            <div className="space-y-2.5 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">חברות במועדון:</span>
                <Badge variant={clubData.is_active ? 'default' : 'secondary'} className={clubData.is_active ? 'bg-green-600' : ''}>
                  {clubData.is_active ? 'פעיל' : 'לא פעיל'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">תאריך הצטרפות:</span>
                <span className="font-medium text-foreground">{format(new Date(clubData.joined_at), 'dd/MM/yyyy', { locale: he })}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">קבלת מבצעים:</span>
                {clubData.wants_promotions ? (
                  <Badge className="bg-green-600 gap-1"><CheckCircle2 className="w-3 h-3" /> מאושר</Badge>
                ) : (
                  <Badge variant="destructive" className="gap-1"><BellOff className="w-3 h-3" /> הסיר תפוצה</Badge>
                )}
              </div>
              {clubData.email && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">מייל מועדון:</span>
                  <span className="font-medium text-foreground text-xs">{clubData.email}</span>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-4">
              <Crown className="w-8 h-8 text-muted-foreground/20 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">לא חבר מועדון</p>
            </div>
          )}

          {/* Referrals */}
          {referrals.length > 0 && (
            <div className="mt-4 pt-4 border-t border-border">
              <h4 className="text-sm font-bold text-foreground mb-2 flex items-center gap-1">
                <Gift className="w-3.5 h-3.5 text-primary" /> הפניות ({referrals.length})
              </h4>
              <div className="space-y-1.5">
                {referrals.map((r) => (
                  <div key={r.id} className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">
                      {r.referrer_phone === normalized ? `הפנה → ${r.referred_phone}` : `הופנה ע"י ${r.referrer_phone}`}
                    </span>
                    <Badge variant="outline" className="text-[10px]">{r.status}</Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Coupons Used */}
          {couponsUsed.length > 0 && (
            <div className="mt-4 pt-4 border-t border-border">
              <h4 className="text-sm font-bold text-foreground mb-2 flex items-center gap-1">
                <CreditCard className="w-3.5 h-3.5 text-primary" /> קופונים שהשתמש ({couponsUsed.length})
              </h4>
              <div className="space-y-1.5">
                {couponsUsed.map((c, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <span className="font-mono font-medium text-foreground">{c.code}</span>
                    <span className="text-muted-foreground">₪{c.discount} הנחה (הזמנה #{c.orderId})</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Points History */}
      {pointsHistory.length > 0 && (
        <Card className="p-4 mb-4">
          <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
            <Coins className="w-4 h-4 text-amber-600" /> היסטוריית נקודות ({pointsHistory.length})
          </h3>
          <div className="space-y-1.5 max-h-48 overflow-y-auto">
            {pointsHistory.map((p) => (
              <div key={p.id} className="flex items-center justify-between text-sm py-1.5 border-b border-border/50 last:border-0">
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${p.type === 'earned' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                    {p.type === 'earned' ? `+${p.points}` : `-${p.points}`}
                  </span>
                  <span className="text-muted-foreground text-xs">{p.description}</span>
                </div>
                <span className="text-[10px] text-muted-foreground">{format(new Date(p.created_at), 'dd/MM/yy', { locale: he })}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Lead Info */}
      {leadData && (
        <Card className="p-4 mb-4">
          <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary" /> מידע ליד
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <div>
              <span className="text-muted-foreground">שלב אחרון:</span>{' '}
              <span className="font-medium text-foreground">{leadData.last_step}</span>
            </div>
            <div>
              <span className="text-muted-foreground">דגם:</span>{' '}
              <span className="font-medium text-foreground">{leadData.device_type || '-'}</span>
            </div>
            <div>
              <span className="text-muted-foreground">תיקון:</span>{' '}
              <span className="font-medium text-foreground">{leadData.repair_type || '-'}</span>
            </div>
            <div>
              <span className="text-muted-foreground">המרה:</span>{' '}
              <Badge variant={leadData.converted ? 'default' : 'secondary'} className={leadData.converted ? 'bg-green-600' : ''}>
                {leadData.converted ? 'הומר' : 'לא הומר'}
              </Badge>
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
              <div key={order.id} className="p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${statusColors[order.status] || 'bg-muted text-muted-foreground'}`}>
                        {statusLabels[order.status] || order.status}
                      </span>
                      <span className="text-[10px] text-muted-foreground">#{order.orderNumber}</span>
                      {order.paymentStatus === 'paid' && (
                        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">שולם</span>
                      )}
                      {order.couponCode && (
                        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">קופון: {order.couponCode}</span>
                      )}
                    </div>
                    <p className="font-semibold text-foreground text-sm">{order.deviceType}</p>
                    <p className="text-xs text-muted-foreground">{order.issueDescription}</p>
                    {order.technicianName && (
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        <Wrench className="w-3 h-3 inline ml-0.5" /> טכנאי: {order.technicianName}
                      </p>
                    )}
                    {order.notes && order.notes.length > 0 && (
                      <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
                        הערות: {order.notes[order.notes.length - 1]}
                      </p>
                    )}
                  </div>
                  <div className="text-left flex-shrink-0 space-y-0.5">
                    <p className="text-sm font-bold text-foreground">₪{order.repairPrice}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {format(new Date(order.createdAt), 'dd/MM/yy', { locale: he })}
                    </p>
                    {order.warrantyMonths && order.status === 'completed' && (
                      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 text-[10px] font-medium">
                        <Shield className="w-3 h-3" /> {order.warrantyMonths}ח'
                      </span>
                    )}
                    {order.rating && (
                      <p className="text-[10px] text-amber-500">{'★'.repeat(order.rating)}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default CustomerProfileView;
