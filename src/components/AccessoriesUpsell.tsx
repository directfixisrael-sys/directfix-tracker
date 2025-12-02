import { Accessory } from '@/types/repair';
import { cn } from '@/lib/utils';
import { Check, ShieldCheck, Zap, Smartphone } from 'lucide-react';

interface AccessoriesUpsellProps {
  accessories: Accessory[];
  onToggle: (accessoryId: string) => void;
  disabled?: boolean;
}

const accessoryIcons: Record<string, React.ReactNode> = {
  '1': <ShieldCheck className="w-5 h-5" />,
  '2': <ShieldCheck className="w-5 h-5" />,
  '3': <Zap className="w-5 h-5" />,
  '4': <Smartphone className="w-5 h-5" />,
};

const AccessoriesUpsell = ({ accessories, onToggle, disabled }: AccessoriesUpsellProps) => {
  const selectedTotal = accessories
    .filter(a => a.selected)
    .reduce((sum, a) => sum + a.price, 0);

  return (
    <div className="wolt-card p-5 animate-slide-up" style={{ animationDelay: '0.2s' }}>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-lg font-bold text-foreground">הוסיפו אביזרים</h3>
          <p className="text-sm text-muted-foreground">הטכנאי יביא איתו</p>
        </div>
        {selectedTotal > 0 && (
          <div className="bg-primary text-primary-foreground px-4 py-2 rounded-full animate-scale-in">
            <span className="font-bold">+₪{selectedTotal}</span>
          </div>
        )}
      </div>

      <div className="space-y-3">
        {accessories.map((accessory) => (
          <button
            key={accessory.id}
            onClick={() => !disabled && onToggle(accessory.id)}
            disabled={disabled}
            className={cn(
              "w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-200",
              accessory.selected 
                ? "border-primary bg-primary/5" 
                : "border-transparent bg-muted/50 hover:bg-muted",
              disabled && "opacity-50 cursor-not-allowed"
            )}
          >
            <div className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center transition-colors",
              accessory.selected ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground"
            )}>
              {accessoryIcons[accessory.id]}
            </div>
            
            <div className="flex-1 text-right">
              <p className="font-semibold text-foreground">{accessory.name}</p>
              <p className={cn(
                "text-lg font-bold",
                accessory.selected ? "text-primary" : "text-muted-foreground"
              )}>
                ₪{accessory.price}
              </p>
            </div>

            <div className={cn(
              "w-7 h-7 rounded-full flex items-center justify-center transition-all",
              accessory.selected 
                ? "bg-primary" 
                : "border-2 border-border"
            )}>
              {accessory.selected && (
                <Check className="w-4 h-4 text-primary-foreground" />
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default AccessoriesUpsell;
