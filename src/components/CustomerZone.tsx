import { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { User, Award, History, ArrowLeft, Phone, Wrench, ChevronDown, ChevronUp, HelpCircle, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { getCustomerPoints, calculateDiscountFromPoints } from '@/components/LoyaltyPointsDisplay';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';

const POINT_VALUE = 0.5;

interface OrderSummary {
  id: string;
  order_number: number;
  device_type: string;
  issue_description: string;
  status: string;
  repair_price: number;
  created_at: string;
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
  completed: 'bg-success/10 text-success',
  cancelled: 'bg-muted text-muted-foreground',
};

const CustomerZone = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [phone, setPhone] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [points, setPoints] = useState(0);
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showPointsGuide, setShowPointsGuide] = useState(false);

  // Try to load saved phone from sessionStorage
  useEffect(() => {
    const saved = sessionStorage.getItem('customer_zone_phone');
    if (saved) {
      setPhone(saved);
      loadCustomerData(saved);
    }
  }, []);

  const loadCustomerData = async (phoneNum: string) => {
    const normalized = phoneNum.replace(/\D/g, '');
    if (normalized.length < 9) return;
    
    setIsLoading(true);
    
    const [pts, ordersRes] = await Promise.all([
      getCustomerPoints(normalized),
      supabase
        .from('orders')
        .select('id, order_number, device_type, issue_description, status, repair_price, created_at, customer_name')
        .eq('customer_phone', normalized)
        .order('created_at', { ascending: false })
        .limit(20),
    ]);

    setPoints(pts);
    
    if (ordersRes.data && ordersRes.data.length > 0) {
      setOrders(ordersRes.data);
      setCustomerName(ordersRes.data[0].customer_name || '');
      setIsLoaded(true);
      sessionStorage.setItem('customer_zone_phone', normalized);
    } else {
      setOrders([]);
      setCustomerName('');
      setIsLoaded(true);
    }
    
    setIsLoading(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadCustomerData(phone);
  };

  const handleOrderClick = (order: OrderSummary) => {
    setOpen(false);
    navigate(`/track?phone=${phone.replace(/\D/g, '')}`);
  };

  const handleNewOrder = () => {
    setOpen(false);
    navigate('/order');
  };

  const discount = calculateDiscountFromPoints(points);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 sm:h-9 sm:w-9 rounded-xl border-2 border-foreground/10"
          aria-label="האיזור האישי שלי"
        >
          <User className="w-5 h-5 sm:w-4 sm:h-4" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col">
        <SheetHeader className="p-5 pb-3 border-b border-border">
          <SheetTitle className="text-right text-lg font-bold">האיזור האישי שלי</SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Phone input */}
          {!isLoaded ? (
            <div className="space-y-4 animate-slide-up">
              <div className="text-center py-6">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="w-10 h-10 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-1">ברוכים הבאים!</h3>
                <p className="text-sm text-muted-foreground">הזינו את מספר הטלפון שלכם כדי לצפות בהיסטוריית התיקונים ובנקודות הנאמנות</p>
              </div>
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="relative">
                  <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="tel"
                    placeholder="מספר טלפון"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="h-14 text-lg pr-11 rounded-xl"
                    dir="ltr"
                    autoFocus
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full h-12 rounded-xl text-base font-bold gap-2"
                  disabled={phone.replace(/\D/g, '').length < 9 || isLoading}
                >
                  {isLoading ? 'טוען...' : 'כניסה'}
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </form>
            </div>
          ) : (
            <div className="space-y-5 animate-slide-up">
              {/* Welcome */}
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <User className="w-8 h-8 text-primary" />
                </div>
                {customerName && (
                  <h3 className="text-xl font-bold text-foreground">שלום, {customerName}!</h3>
                )}
                <p className="text-sm text-muted-foreground" dir="ltr">{phone}</p>
              </div>

              {/* Loyalty Points Card */}
              <Card className="p-5 bg-gradient-to-br from-primary/5 via-background to-primary/10 border-2 border-primary/20">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-primary" />
                    <span className="font-bold text-foreground">נקודות נאמנות</span>
                  </div>
                  <div className="text-left">
                    <span className="text-3xl font-extrabold text-primary">{points}</span>
                  </div>
                </div>
                {points > 0 && (
                  <div className="bg-success/10 border border-success/20 rounded-lg px-3 py-2 text-center mb-3">
                    <p className="text-sm font-semibold text-success">
                      שווי ₪{discount.toFixed(0)} הנחה בהזמנה הבאה!
                    </p>
                  </div>
                )}
                
                {/* How it works - collapsible */}
                <button
                  type="button"
                  onClick={() => setShowPointsGuide(!showPointsGuide)}
                  className="w-full flex items-center justify-between bg-primary/5 hover:bg-primary/10 rounded-lg px-3 py-2 transition-colors"
                >
                  <span className="text-xs font-semibold text-primary flex items-center gap-1.5">
                    <HelpCircle className="w-3.5 h-3.5" />
                    איך זה עובד?
                  </span>
                  {showPointsGuide 
                    ? <ChevronUp className="w-4 h-4 text-primary" /> 
                    : <ChevronDown className="w-4 h-4 text-primary" />
                  }
                </button>
                {showPointsGuide && (
                  <div className="mt-2 bg-card/80 rounded-lg p-3 border border-border/50 space-y-2 animate-slide-up">
                    <div className="flex items-start gap-2.5">
                      <div className="w-5 h-5 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-[10px] font-bold text-primary">1</span>
                      </div>
                      <p className="text-xs text-foreground/80">כל <strong className="text-foreground">100 ש"ח</strong> בתיקון = <strong className="text-primary">10 נקודות</strong></p>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <div className="w-5 h-5 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-[10px] font-bold text-primary">2</span>
                      </div>
                      <p className="text-xs text-foreground/80">כל נקודה שווה <strong className="text-primary">{POINT_VALUE} ש"ח</strong></p>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <div className="w-5 h-5 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-[10px] font-bold text-primary">3</span>
                      </div>
                      <p className="text-xs text-foreground/80">ההנחה מופיעה <strong className="text-foreground">אוטומטית</strong> בהזמנה הבאה!</p>
                    </div>
                  </div>
                )}
              </Card>

              {/* Repair History */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <History className="w-5 h-5 text-primary" />
                  <h4 className="font-bold text-foreground">היסטוריית תיקונים</h4>
                  <span className="text-xs text-muted-foreground">({orders.length})</span>
                </div>
                
                {orders.length === 0 ? (
                  <Card className="p-6 text-center">
                    <Wrench className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">אין עדיין תיקונים</p>
                  </Card>
                ) : (
                  <div className="space-y-2">
                    {orders.map((order) => (
                      <button
                        key={order.id}
                        onClick={() => handleOrderClick(order)}
                        className="w-full text-right"
                      >
                        <Card className="p-3 hover:bg-accent/50 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-0.5">
                                <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${statusColors[order.status] || 'bg-muted text-muted-foreground'}`}>
                                  {statusLabels[order.status] || order.status}
                                </span>
                                <span className="text-[10px] text-muted-foreground">#{order.order_number}</span>
                              </div>
                              <p className="font-semibold text-foreground text-sm truncate">{order.device_type}</p>
                              <p className="text-xs text-muted-foreground truncate">{order.issue_description}</p>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {format(new Date(order.created_at), 'dd/MM/yyyy', { locale: he })}
                                {' · '}
                                ₪{order.repair_price}
                              </p>
                            </div>
                            <ArrowLeft className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                          </div>
                        </Card>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Change phone */}
              <button
                onClick={() => {
                  setIsLoaded(false);
                  setPhone('');
                  setPoints(0);
                  setOrders([]);
                  setCustomerName('');
                  sessionStorage.removeItem('customer_zone_phone');
                }}
                className="w-full text-center text-xs text-muted-foreground underline"
              >
                החלף מספר טלפון
              </button>
            </div>
          )}
        </div>

        {/* Bottom CTA */}
        <div className="p-5 pt-3 border-t border-border">
          <Button
            onClick={handleNewOrder}
            className="w-full h-14 rounded-2xl text-lg font-bold gap-2 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg"
          >
            <Sparkles className="w-5 h-5" />
            הזמן תיקון חדש
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default CustomerZone;
