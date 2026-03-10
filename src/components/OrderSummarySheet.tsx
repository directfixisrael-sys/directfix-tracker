import { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { RepairOrder } from '@/types/repair';
import { Receipt, Smartphone, Wrench, Gift, Shield, MapPin } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Promotion {
  id: string;
  title: string;
  description: string;
  badge_text: string | null;
  icon: string | null;
  value: number | null;
}

interface OrderSummarySheetProps {
  order: RepairOrder;
}

const OrderSummarySheet = ({ order }: OrderSummarySheetProps) => {
  const [activePromotion, setActivePromotion] = useState<Promotion | null>(null);

  useEffect(() => {
    const loadPromotion = async () => {
      const { data } = await supabase
        .from('promotions')
        .select('*')
        .eq('is_active', true)
        .limit(1)
        .maybeSingle();
      if (data) setActivePromotion(data);
    };
    loadPromotion();
  }, []);

  const accessoriesTotal = order.accessories
    .filter(a => a.selected)
    .reduce((sum, a) => sum + a.price, 0);
  
  const totalPrice = order.repairPrice + accessoriesTotal;

  const getPromotionIcon = (icon: string | null) => {
    switch (icon) {
      case 'gift': return '';
      case 'tag': return '';
      case 'sparkles': return '';
      case 'percent': return '';
      case 'fire': return '';
      case 'star': return '';
      default: return '';
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <button className="fixed left-4 top-1/2 -translate-y-1/2 z-40 w-12 h-12 bg-card rounded-full shadow-lg border-2 border-primary/30 dark:border-primary/50 flex items-center justify-center hover:scale-105 hover:border-primary/50 dark:hover:border-primary/70 transition-all">
          <Receipt className="w-5 h-5 text-primary" />
        </button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[320px] sm:w-[380px]">
        <SheetHeader>
          <SheetTitle className="text-right">פרטי ההזמנה</SheetTitle>
        </SheetHeader>
        
        <div className="mt-6 space-y-6">
          {/* Device info */}
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <Smartphone className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">מכשיר</p>
                <p className="font-semibold text-foreground">{order.deviceType}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-11 h-11 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <Wrench className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">תקלה</p>
                <p className="font-semibold text-foreground">{order.issueDescription}</p>
              </div>
            </div>
          </div>

          {/* Active Promotion */}
          {activePromotion && (
            <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/15 to-amber-500/10 rounded-xl p-3 border border-amber-500/20">
              <div className="flex items-center gap-3 mb-1">
                <div className="w-9 h-9 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center flex-shrink-0 shadow">
                  <Gift className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                    {getPromotionIcon(activePromotion.icon)} {activePromotion.title}
                  </p>
                  <div className="flex items-center gap-1.5">
                    <Shield className="w-3 h-3 text-amber-500" />
                    <p className="font-semibold text-foreground text-sm">{activePromotion.description}</p>
                  </div>
                </div>
              </div>
              {activePromotion.value && activePromotion.value > 0 && (
                <div className="flex items-center gap-2 mt-1 mr-12">
                  <span className="text-xs text-muted-foreground">שווי:</span>
                  <span className="line-through text-xs text-muted-foreground">₪{activePromotion.value}</span>
                  <span className="text-xs font-bold text-success">חינם!</span>
                </div>
              )}
            </div>
          )}

          {/* Notes */}
          {order.notes.length > 0 && (
            <div className="bg-muted/50 rounded-xl p-4">
              <p className="text-xs text-muted-foreground mb-2">הערות</p>
              {order.notes.map((note, i) => (
                <p key={i} className="text-sm text-foreground">{note}</p>
              ))}
            </div>
          )}

          {/* Price breakdown */}
          <div className="border-t border-border pt-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">עלות תיקון</span>
              <span className="font-medium text-foreground">₪{order.repairPrice}</span>
            </div>
            
            {order.accessories.filter(a => a.selected).map(acc => (
              <div key={acc.id} className="flex justify-between text-sm">
                <span className="text-muted-foreground">{acc.name}</span>
                <span className="font-medium text-foreground">₪{acc.price}</span>
              </div>
            ))}

            {activePromotion && (
              <div className="flex justify-between text-sm">
                <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1">
                  <Gift className="w-3.5 h-3.5" />
                  {activePromotion.description}
                </span>
                <div className="flex items-center gap-2">
                  {activePromotion.value && activePromotion.value > 0 && (
                    <span className="line-through text-muted-foreground text-xs">₪{activePromotion.value}</span>
                  )}
                  <span className="font-bold text-success">חינם! 🎉</span>
                </div>
              </div>
            )}

            {/* Free Home Visit */}
            <div className="flex justify-between text-sm border-t border-border pt-3 mt-1">
              <span className="text-foreground flex items-center gap-1">
                <MapPin className="w-3 h-3 text-primary" />
                הגעה עד הבית ותיקון במקום
              </span>
              <span className="font-semibold text-success">חינם</span>
            </div>


            <div className="flex justify-between pt-3 border-t border-border">
              <span className="font-bold text-foreground">סה״כ לתשלום</span>
              <span className="font-bold text-primary text-xl">₪{totalPrice}</span>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default OrderSummarySheet;
