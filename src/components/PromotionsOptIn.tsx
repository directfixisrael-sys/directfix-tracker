import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Gift } from 'lucide-react';

interface PromotionsOptInProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

const PromotionsOptIn = ({ checked, onCheckedChange }: PromotionsOptInProps) => {
  return (
    <div className="glass-card rounded-2xl p-4 animate-slide-up">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center flex-shrink-0">
          <Gift className="w-5 h-5 text-accent" />
        </div>
        <div className="flex-1">
          <Label htmlFor="promotions" className="font-medium text-foreground cursor-pointer">
            קבלו מבצעים והנחות
          </Label>
          <p className="text-sm text-muted-foreground">נשלח לכם הצעות מיוחדות ב-SMS</p>
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
