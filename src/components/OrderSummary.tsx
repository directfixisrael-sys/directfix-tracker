import { useState, useEffect } from 'react';
import { RepairOrder } from '@/types/repair';
import { Smartphone, Wrench, Gift, Shield } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Promotion {
  id: string;
  title: string;
  description: string;
  badge_text: string | null;
  icon: string | null;
  value: number | null;
}

interface OrderSummaryProps {
  order: RepairOrder;
}

const OrderSummary = ({ order }: OrderSummaryProps) => {
  const [activePromotion, setActivePromotion] = useState<Promotion | null>(null);

  useEffect(() => {
    const loadPromotion = async () => {
      const { data } = await supabase
        .from('promotions')
        .select('*')
        .eq('is_active', true)
        .limit(1)
        .maybeSingle();
      
      if (data) {
        setActivePromotion(data);
      }
    };
    loadPromotion();
  }, []);

  const accessoriesTotal = order.accessories
    .filter(a => a.selected)
    .reduce((sum, a) => sum + a.price, 0);
  
  const totalPrice = order.repairPrice + accessoriesTotal;

  const getPromotionIcon = (icon: string | null) => {
    switch (icon) {
      case 'gift': return '🎁';
      case 'tag': return '🏷️';
      case 'sparkles': return '✨';
      case 'percent': return '💯';
      case 'fire': return '🔥';
      case 'star': return '⭐';
      default: return '🎁';
    }
  };

  return (
    <div className="wolt-card p-6 animate-slide-up" style={{ animationDelay: '0.3s' }}>
      <h3 className="text-2xl font-bold text-foreground mb-6">פרטי התיקון</h3>
      
      <div className="space-y-5 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
            <Smartphone className="w-7 h-7 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">מכשיר</p>
            <p className="font-semibold text-foreground text-xl">{order.deviceType}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
            <Wrench className="w-7 h-7 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">תקלה</p>
            <p className="font-semibold text-foreground text-xl">{order.issueDescription}</p>
          </div>
        </div>

        {/* Active Promotion Banner - Dynamic from DB */}
        {activePromotion && (
          <div className="flex items-center gap-4 bg-gradient-to-r from-amber-500/10 via-orange-500/15 to-amber-500/10 rounded-xl p-3 border border-amber-500/20">
            <div className="w-11 h-11 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
              <Gift className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                {getPromotionIcon(activePromotion.icon)} {activePromotion.title}
              </p>
              <div className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-amber-500" />
                <p className="font-semibold text-foreground">{activePromotion.description}</p>
              </div>
              {activePromotion.value && activePromotion.value > 0 && (
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-muted-foreground">שווי:</span>
                  <span className="line-through text-sm text-muted-foreground">₪{activePromotion.value}</span>
                  <span className="text-sm font-bold text-success">חינם! 🎉</span>
                </div>
              )}
            </div>
          </div>
        )}

        {order.notes.length > 0 && (
          <div className="bg-muted/50 rounded-xl p-4">
            <p className="text-xs text-muted-foreground mb-2">הערות</p>
            {order.notes.map((note, i) => (
              <p key={i} className="text-sm text-foreground">{note}</p>
            ))}
          </div>
        )}
      </div>

      {/* Price breakdown */}
      <div className="border-t border-border pt-5 space-y-4">
        <div className="flex justify-between text-base">
          <span className="text-muted-foreground">עלות תיקון</span>
          <span className="font-medium text-foreground text-lg">₪{order.repairPrice}</span>
        </div>
        
        {order.accessories.filter(a => a.selected).map(acc => (
          <div key={acc.id} className="flex justify-between text-base">
            <span className="text-muted-foreground">{acc.name}</span>
            <span className="font-medium text-foreground text-lg">₪{acc.price}</span>
          </div>
        ))}

        {activePromotion && (
          <div className="flex justify-between text-base">
            <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1">
              <Gift className="w-4 h-4" />
              {activePromotion.description} (מבצע)
            </span>
            <div className="flex items-center gap-2">
              {activePromotion.value && activePromotion.value > 0 && (
                <span className="line-through text-muted-foreground text-sm">₪{activePromotion.value}</span>
              )}
              <span className="font-bold text-success text-lg">חינם! 🎉</span>
            </div>
          </div>
        )}

        <div className="flex justify-between pt-4 border-t border-border">
          <span className="font-bold text-foreground text-xl">סה״כ לתשלום</span>
          <span className="font-bold text-primary text-2xl">₪{totalPrice}</span>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;
