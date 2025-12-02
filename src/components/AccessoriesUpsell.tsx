import { Accessory } from '@/types/repair';
import { cn } from '@/lib/utils';
import { Check, Shield, Battery, Smartphone } from 'lucide-react';

interface AccessoriesUpsellProps {
  accessories: Accessory[];
  onToggle: (accessoryId: string) => void;
  disabled?: boolean;
}

const accessoryIcons: Record<string, React.ReactNode> = {
  '1': <Shield className="w-5 h-5" />,
  '2': <Shield className="w-5 h-5" />,
  '3': <Battery className="w-5 h-5" />,
  '4': <Smartphone className="w-5 h-5" />,
};

const AccessoriesUpsell = ({ accessories, onToggle, disabled }: AccessoriesUpsellProps) => {
  const selectedTotal = accessories
    .filter(a => a.selected)
    .reduce((sum, a) => sum + a.price, 0);

  return (
    <div className="glass-card rounded-2xl p-6 animate-slide-up">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground">להוסיף אביזרים?</h3>
          <p className="text-sm text-muted-foreground">הטכנאי יביא איתו</p>
        </div>
        {selectedTotal > 0 && (
          <div className="bg-accent/10 text-accent px-3 py-1.5 rounded-full animate-scale-in">
            <span className="font-bold">+₪{selectedTotal}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {accessories.map((accessory) => (
          <button
            key={accessory.id}
            onClick={() => !disabled && onToggle(accessory.id)}
            disabled={disabled}
            className={cn(
              "relative p-4 rounded-xl border-2 transition-all duration-200 text-right",
              accessory.selected 
                ? "border-primary bg-primary/5" 
                : "border-border hover:border-primary/50 bg-card",
              disabled && "opacity-50 cursor-not-allowed"
            )}
          >
            {accessory.selected && (
              <div className="absolute top-2 left-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center animate-scale-in">
                <Check className="w-3 h-3 text-primary-foreground" />
              </div>
            )}
            
            <div className={cn(
              "w-10 h-10 rounded-lg flex items-center justify-center mb-2 transition-colors",
              accessory.selected ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
            )}>
              {accessoryIcons[accessory.id]}
            </div>
            
            <p className="font-medium text-foreground text-sm mb-1">{accessory.name}</p>
            <p className={cn(
              "font-bold",
              accessory.selected ? "text-primary" : "text-muted-foreground"
            )}>
              ₪{accessory.price}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
};

export default AccessoriesUpsell;
