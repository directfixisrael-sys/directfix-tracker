import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Gift, Check, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import StoreHeader from '@/components/store/StoreHeader';
import StoreLogin from '@/components/store/StoreLogin';
import { useCartStore } from '@/store/cartStore';
import { toast } from 'sonner';

const StoreCheckoutPage = () => {
  const navigate = useNavigate();
  const { items, getTotal, clearCart } = useCartStore();
  const [auth, setAuth] = useState<{ phone: string; name: string; points: number } | null>(null);
  const [usePoints, setUsePoints] = useState(false);
  const [pointsToUse, setPointsToUse] = useState(0);
  const [orderPlaced, setOrderPlaced] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('store_auth');
    if (saved) setAuth(JSON.parse(saved));
  }, []);

  const handleLogin = (phone: string, name: string, points: number) => {
    const data = { phone, name, points };
    setAuth(data);
    localStorage.setItem('store_auth', JSON.stringify(data));
  };

  const handleLogout = () => {
    setAuth(null);
    localStorage.removeItem('store_auth');
  };

  if (!auth) return <StoreLogin onLogin={handleLogin} />;

  if (items.length === 0 && !orderPlaced) {
    navigate('/store/cart');
    return null;
  }

  const total = getTotal();
  // 10 points = ₪1
  const maxPointsDiscount = Math.min(auth.points, total * 10);
  const pointsDiscount = usePoints ? Math.floor(pointsToUse / 10) : 0;
  const finalTotal = Math.max(0, total - pointsDiscount);

  const handlePlaceOrder = () => {
    setOrderPlaced(true);
    clearCart();
    toast.success('ההזמנה התקבלה בהצלחה!');
  };

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-background">
        <StoreHeader customerName={auth.name} points={auth.points} onLogout={handleLogout} />
        <div className="max-w-md mx-auto px-4 py-20 text-center space-y-6" dir="rtl">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
            <Check className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-3xl font-extrabold text-foreground">ההזמנה התקבלה!</h1>
          <p className="text-muted-foreground">
            תודה על ההזמנה. ניצור איתך קשר בהקדם לתיאום המשלוח.
          </p>
          {pointsDiscount > 0 && (
            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
              <p className="text-sm text-amber-700 dark:text-amber-400 font-medium">
                <Star className="w-4 h-4 fill-amber-500 text-amber-500 inline ml-1" />
                נוצלו {pointsToUse} נקודות (הנחה של ₪{pointsDiscount})
              </p>
            </div>
          )}
          <Button onClick={() => navigate('/store')} className="mt-4">
            <ShoppingBag className="w-4 h-4 ml-2" />
            חזרה לחנות
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <StoreHeader customerName={auth.name} points={auth.points} onLogout={handleLogout} />

      <div className="max-w-4xl mx-auto px-4 py-8" dir="rtl">
        <h1 className="text-3xl font-extrabold text-foreground mb-8">קופה</h1>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Order Info */}
          <div className="md:col-span-2 space-y-6">
            {/* Points Redemption */}
            {auth.points > 0 && (
              <Card className="p-6 border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/50 rounded-full flex items-center justify-center">
                      <Gift className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground">מימוש נקודות</h3>
                      <p className="text-xs text-muted-foreground">
                        יש לך {auth.points.toLocaleString()} נקודות (שווי ₪{Math.floor(auth.points / 10).toLocaleString()})
                      </p>
                    </div>
                  </div>
                  <Switch checked={usePoints} onCheckedChange={setUsePoints} />
                </div>

                {usePoints && (
                  <div className="space-y-3 mt-4">
                    <div className="flex items-center gap-3">
                      <Input
                        type="number"
                        min={0}
                        max={maxPointsDiscount}
                        value={pointsToUse}
                        onChange={e => setPointsToUse(Math.min(Number(e.target.value), maxPointsDiscount))}
                        className="w-32"
                        dir="ltr"
                      />
                      <span className="text-sm text-muted-foreground">נקודות</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPointsToUse(maxPointsDiscount)}
                      >
                        מקסימום
                      </Button>
                    </div>
                    <p className="text-sm text-amber-700 dark:text-amber-400">
                      הנחה: ₪{Math.floor(pointsToUse / 10).toLocaleString()} (כל 10 נקודות = ₪1)
                    </p>
                  </div>
                )}
              </Card>
            )}

            {/* Payment placeholder */}
            <Card className="p-6 border-border/50">
              <h3 className="font-bold text-foreground mb-4">אמצעי תשלום</h3>
              <div className="bg-muted/50 rounded-xl p-8 text-center">
                <p className="text-muted-foreground">אמצעי התשלום יתווסף בקרוב</p>
                <p className="text-xs text-muted-foreground mt-1">לאחר ההזמנה ניצור קשר לתיאום תשלום</p>
              </div>
            </Card>
          </div>

          {/* Summary */}
          <Card className="p-6 border-border/50 h-fit sticky top-24 space-y-4">
            <h2 className="font-bold text-foreground text-lg">סיכום</h2>
            <Separator />

            <div className="space-y-2">
              {items.map(item => (
                <div key={item.product.id} className="flex justify-between text-sm">
                  <span className="text-muted-foreground truncate flex-1 ml-2">
                    {item.product.name} x{item.quantity}
                  </span>
                  <span className="font-medium">₪{(item.product.price * item.quantity).toLocaleString()}</span>
                </div>
              ))}
            </div>

            <Separator />

            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">סכום ביניים</span>
              <span className="font-medium">₪{total.toLocaleString()}</span>
            </div>

            {pointsDiscount > 0 && (
              <div className="flex justify-between text-sm text-amber-600">
                <span className="flex items-center gap-1">
                  <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                  הנחת נקודות
                </span>
                <span className="font-medium">-₪{pointsDiscount.toLocaleString()}</span>
              </div>
            )}

            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">משלוח</span>
              <span className="font-medium text-primary">חינם</span>
            </div>

            <Separator />

            <div className="flex justify-between items-center">
              <span className="font-bold text-foreground">סה״כ</span>
              <span className="text-2xl font-extrabold text-foreground">₪{finalTotal.toLocaleString()}</span>
            </div>

            <Button
              size="lg"
              className="w-full h-14 text-lg font-bold rounded-2xl shadow-lg shadow-primary/20"
              onClick={handlePlaceOrder}
            >
              ביצוע הזמנה
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StoreCheckoutPage;
