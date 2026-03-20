import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import StoreHeader from '@/components/store/StoreHeader';
import StoreLogin from '@/components/store/StoreLogin';
import { useCartStore } from '@/store/cartStore';

const StoreCartPage = () => {
  const navigate = useNavigate();
  const { items, removeItem, updateQuantity, getTotal, clearCart } = useCartStore();
  const [auth, setAuth] = useState<{ phone: string; name: string; points: number } | null>(null);

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

  const total = getTotal();

  return (
    <div className="min-h-screen bg-background">
      <StoreHeader customerName={auth.name} points={auth.points} onLogout={handleLogout} />

      <div className="max-w-4xl mx-auto px-4 py-8" dir="rtl">
        <h1 className="text-3xl font-extrabold text-foreground mb-8">סל קניות</h1>

        {items.length === 0 ? (
          <div className="text-center py-20 space-y-4">
            <ShoppingBag className="w-16 h-16 text-muted-foreground/30 mx-auto" />
            <p className="text-muted-foreground text-lg">הסל ריק</p>
            <Button onClick={() => navigate('/store')}>חזרה לחנות</Button>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-8">
            {/* Items */}
            <div className="md:col-span-2 space-y-4">
              {items.map(item => (
                <Card key={item.product.id} className="p-4 border-border/50">
                  <div className="flex gap-4">
                    <div className="w-24 h-24 bg-muted/30 rounded-xl flex-shrink-0 flex items-center justify-center cursor-pointer"
                      onClick={() => navigate(`/store/product/${item.product.id}`)}
                    >
                      <img src={item.product.image} alt={item.product.name} className="w-full h-full object-contain p-2" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-foreground truncate">{item.product.name}</h3>
                      {item.selectedColor && (
                        <p className="text-xs text-muted-foreground">צבע: {item.selectedColor}</p>
                      )}
                      <div className="flex items-center gap-2 mt-1">
                        <p className="font-bold text-foreground">₪{item.product.price.toLocaleString()}</p>
                        {item.product.pointsPrice && (
                          <span className="text-xs text-amber-600 flex items-center gap-0.5">
                            <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                            {item.product.pointsPrice}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-2 bg-muted/50 rounded-full">
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full"
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}>
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="text-sm font-bold w-6 text-center">{item.quantity}</span>
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full"
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}>
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                        <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10 h-8 w-8"
                          onClick={() => removeItem(item.product.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Summary */}
            <Card className="p-6 border-border/50 h-fit sticky top-24 space-y-4">
              <h2 className="font-bold text-foreground text-lg">סיכום הזמנה</h2>
              <Separator />
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">סה״כ מוצרים</span>
                  <span className="font-medium">{items.reduce((s, i) => s + i.quantity, 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">משלוח</span>
                  <span className="font-medium text-primary">חינם</span>
                </div>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span className="font-bold text-foreground">סה״כ לתשלום</span>
                <span className="text-2xl font-extrabold text-foreground">₪{total.toLocaleString()}</span>
              </div>

              {auth.points > 0 && (
                <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-3 text-center">
                  <p className="text-sm text-amber-700 dark:text-amber-400 font-medium flex items-center justify-center gap-1">
                    <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                    יש לך {auth.points.toLocaleString()} נקודות לניצול
                  </p>
                </div>
              )}

              <Button
                size="lg"
                className="w-full h-14 text-lg font-bold rounded-2xl shadow-lg shadow-primary/20"
                onClick={() => navigate('/store/checkout')}
              >
                לקופה
                <ArrowRight className="w-5 h-5 mr-2 rotate-180" />
              </Button>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default StoreCartPage;
