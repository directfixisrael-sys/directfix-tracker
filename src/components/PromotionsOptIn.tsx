import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Gift } from 'lucide-react';

interface PromotionsOptInProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

const PromotionsOptIn = ({ checked, onCheckedChange }: PromotionsOptInProps) => {
  return (
    <div className="wolt-card p-4 animate-slide-up" style={{ animationDelay: '0.4s' }}>
      <div className="flex items-center gap-4">
        <div className="w-11 h-11 bg-warning/10 rounded-xl flex items-center justify-center flex-shrink-0">
          <Gift className="w-5 h-5 text-warning" />
        </div>
        <div className="flex-1">
          <Label htmlFor="promotions" className="font-semibold text-foreground cursor-pointer">
            קבלו מבצעים והנחות
          </Label>
          <p className="text-xs text-muted-foreground">הצעות מיוחדות ישירות לנייד</p>
        </div>
        <Switch
          id="promotions"
          checked={checked}
          onCheckedChange={onCheckedChange}
        />
      </div>
    </div>
  );
};

export default PromotionsOptIn;
