import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { RepairOrder } from '@/types/repair';
import { Receipt, Smartphone, Wrench } from 'lucide-react';

interface OrderSummarySheetProps {
  order: RepairOrder;
}

const OrderSummarySheet = ({ order }: OrderSummarySheetProps) => {
  const accessoriesTotal = order.accessories
    .filter(a => a.selected)
    .reduce((sum, a) => sum + a.price, 0);
  
  const totalPrice = order.repairPrice + accessoriesTotal;

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
