import { RepairOrder } from '@/types/repair';
import { Smartphone, Wrench, CreditCard, Package } from 'lucide-react';

interface OrderSummaryProps {
  order: RepairOrder;
}

const OrderSummary = ({ order }: OrderSummaryProps) => {
  const accessoriesTotal = order.accessories
    .filter(a => a.selected)
    .reduce((sum, a) => sum + a.price, 0);
  
  const totalPrice = order.repairPrice + accessoriesTotal;

  return (
    <div className="glass-card rounded-2xl p-6 animate-slide-up">
      <h3 className="text-lg font-semibold text-foreground mb-4">פרטי ההזמנה</h3>
      
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
            <Smartphone className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">מכשיר</p>
            <p className="font-medium text-foreground">{order.deviceType}</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
            <Wrench className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">תקלה</p>
            <p className="font-medium text-foreground">{order.issueDescription}</p>
          </div>
        </div>

        {order.notes.length > 0 && (
          <div className="bg-muted/50 rounded-lg p-3">
            <p className="text-sm text-muted-foreground mb-1">הערות</p>
            {order.notes.map((note, i) => (
              <p key={i} className="text-sm text-foreground">{note}</p>
            ))}
          </div>
        )}

        <div className="border-t border-border pt-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <CreditCard className="w-5 h-5 text-accent" />
            </div>
            <p className="font-medium text-foreground">סיכום מחיר</p>
          </div>

          <div className="space-y-2 pr-13">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">תיקון</span>
              <span className="text-foreground">₪{order.repairPrice}</span>
            </div>
            
            {order.accessories.filter(a => a.selected).map(acc => (
              <div key={acc.id} className="flex justify-between text-sm">
                <span className="text-muted-foreground">{acc.name}</span>
                <span className="text-foreground">₪{acc.price}</span>
              </div>
            ))}

            <div className="flex justify-between pt-2 border-t border-border">
              <span className="font-semibold text-foreground">סה״כ</span>
              <span className="font-bold text-primary text-lg">₪{totalPrice}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;
