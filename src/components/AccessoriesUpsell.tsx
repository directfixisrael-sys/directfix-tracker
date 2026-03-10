import { Accessory } from '@/types/repair';
import { cn } from '@/lib/utils';
import { Check, ShieldCheck, Zap, Smartphone, Sparkles, Gift, TrendingDown } from 'lucide-react';

interface AccessoriesUpsellProps {
  accessories: Accessory[];
  onToggle: (accessoryId: string) => void;
  disabled?: boolean;
}

const accessoryIcons: Record<string, React.ReactNode> = {
  '1': <ShieldCheck className="w-6 h-6" />,
  '2': <Sparkles className="w-6 h-6" />,
  '3': <Zap className="w-6 h-6" />,
  '4': <Smartphone className="w-6 h-6" />,
};

const accessoryDescriptions: Record<string, string> = {
  '1': 'הגנה בסיסית על המסך',
  '2': 'עמידות מקסימלית + ציפוי אנטי בקטריאלי',
  '3': 'טעינה מהירה 20W + כבל',
  '4': 'מגן מפני נפילות + עיצוב מינימליסטי',
};

const AccessoriesUpsell = ({ accessories, onToggle, disabled }: AccessoriesUpsellProps) => {
  const selectedTotal = accessories
    .filter(a => a.selected)
    .reduce((sum, a) => sum + a.price, 0);
  
  const selectedOriginalTotal = accessories
    .filter(a => a.selected)
    .reduce((sum, a) => sum + (a.originalPrice || Math.round(a.price * 1.5)), 0);

  const totalSaved = selectedOriginalTotal - selectedTotal;

  return (
    <div className="wolt-card overflow-hidden animate-slide-up" style={{ animationDelay: '0.2s' }}>
      {/* Header with gradient */}
      <div className="bg-gradient-to-l from-warning/20 via-warning/10 to-transparent p-5 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-warning/20 rounded-full flex items-center justify-center">
              <Gift className="w-5 h-5 text-warning" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-foreground">מבצע מיוחד!</h3>
                <span className="bg-warning text-warning-foreground text-xs font-bold px-2 py-0.5 rounded-full animate-pulse">
                  חסכו עד 40%
                </span>
              </div>
              <p className="text-sm text-muted-foreground">הטכנאי יביא איתו - ללא עלות משלוח</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-5">
        {/* Savings indicator */}
        {selectedTotal > 0 && (
          <div className="mb-4 p-3 bg-success/10 border border-success/20 rounded-xl flex items-center justify-between animate-scale-in">
            <div className="flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-success" />
              <span className="text-sm font-medium text-success">חסכתם ₪{totalSaved}!</span>
            </div>
            <div className="text-left">
              <span className="text-xs text-muted-foreground line-through">₪{selectedOriginalTotal}</span>
              <span className="text-lg font-bold text-success mr-2">₪{selectedTotal}</span>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {accessories.map((accessory) => {
            const originalPrice = accessory.originalPrice || Math.round(accessory.price * 1.5);
            const discount = Math.round((1 - accessory.price / originalPrice) * 100);
            
            return (
              <button
                key={accessory.id}
                onClick={() => !disabled && onToggle(accessory.id)}
                disabled={disabled}
                className={cn(
                  "w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-200 relative overflow-hidden",
                  accessory.selected 
                    ? "border-primary bg-primary/5 shadow-[0_0_20px_rgba(0,180,180,0.15)]" 
                    : "border-border bg-card hover:border-primary/50 hover:bg-primary/5",
                  disabled && "opacity-50 cursor-not-allowed"
                )}
              >
                {/* Discount badge */}
                <div className="absolute top-0 left-0 bg-warning text-warning-foreground text-xs font-bold px-2 py-1 rounded-br-lg">
                  -{discount}%
                </div>

                <div className={cn(
                  "w-14 h-14 rounded-xl flex items-center justify-center transition-all",
                  accessory.selected 
                    ? "bg-primary text-primary-foreground shadow-lg" 
                    : "bg-muted text-muted-foreground"
                )}>
                  {accessoryIcons[accessory.id]}
                </div>
                
                <div className="flex-1 text-right">
                  <p className="font-bold text-foreground">{accessory.name}</p>
                  <p className="text-xs text-muted-foreground mb-1">
                    {accessoryDescriptions[accessory.id] || accessory.description}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground line-through">₪{originalPrice}</span>
                    <span className={cn(
                      "text-lg font-bold",
                      accessory.selected ? "text-primary" : "text-foreground"
                    )}>
                      ₪{accessory.price}
                    </span>
                  </div>
                </div>

                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center transition-all border-2",
                  accessory.selected 
                    ? "bg-primary border-primary" 
                    : "border-border bg-background"
                )}>
                  {accessory.selected && (
                    <Check className="w-5 h-5 text-primary-foreground" />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Urgency message */}
        <div className="mt-4 text-center">
          <p className="text-xs text-muted-foreground">
            המחירים המיוחדים תקפים רק להזמנה הנוכחית
          </p>
        </div>
      </div>
    </div>
  );
};

export default AccessoriesUpsell;
