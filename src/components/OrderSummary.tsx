import { RepairOrder } from '@/types/repair';
import { Smartphone, Wrench, Gift, Shield } from 'lucide-react';

interface OrderSummaryProps {
  order: RepairOrder;
}

const OrderSummary = ({ order }: OrderSummaryProps) => {
  const accessoriesTotal = order.accessories
    .filter(a => a.selected)
    .reduce((sum, a) => sum + a.price, 0);
  
  const totalPrice = order.repairPrice + accessoriesTotal;

  // Check if this is a December order (for promotion)
  const isDecemberPromotion = true; // Active promotion

  return (
    <div className="wolt-card p-5 animate-slide-up" style={{ animationDelay: '0.3s' }}>
      <h3 className="text-lg font-bold text-foreground mb-5">פרטי התיקון</h3>
      
      <div className="space-y-4 mb-6">
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

        {/* Promotion Banner */}
        {isDecemberPromotion && (
          <div className="flex items-center gap-4 bg-gradient-to-r from-amber-500/10 via-orange-500/15 to-amber-500/10 rounded-xl p-3 border border-amber-500/20">
            <div className="w-11 h-11 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
              <Gift className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">🎉 מבצע דצמבר!</p>
              <div className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-amber-500" />
                <p className="font-semibold text-foreground">מגן מסך במתנה</p>
              </div>
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

        {isDecemberPromotion && (
          <div className="flex justify-between text-sm">
            <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1">
              <Gift className="w-3 h-3" />
              מגן מסך (מבצע)
            </span>
            <span className="font-medium text-success">חינם!</span>
          </div>
        )}

        <div className="flex justify-between pt-3 border-t border-border">
          <span className="font-bold text-foreground">סה״כ לתשלום</span>
          <span className="font-bold text-primary text-xl">₪{totalPrice}</span>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;
