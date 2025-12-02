import { RepairOrder } from '@/types/repair';
import { Smartphone, Wrench } from 'lucide-react';

interface OrderSummaryProps {
  order: RepairOrder;
}

const OrderSummary = ({ order }: OrderSummaryProps) => {
  const accessoriesTotal = order.accessories
    .filter(a => a.selected)
    .reduce((sum, a) => sum + a.price, 0);
  
  const totalPrice = order.repairPrice + accessoriesTotal;

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

        <div className="flex justify-between pt-3 border-t border-border">
          <span className="font-bold text-foreground">סה״כ לתשלום</span>
          <span className="font-bold text-primary text-xl">₪{totalPrice}</span>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;
