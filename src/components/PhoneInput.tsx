import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Smartphone } from 'lucide-react';

interface PhoneInputProps {
  onSubmit: (phone: string) => void;
  isLoading?: boolean;
  error?: string;
}

const PhoneInput = ({ onSubmit, isLoading, error }: PhoneInputProps) => {
  const [phone, setPhone] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.trim()) {
      onSubmit(phone.trim());
    }
  };

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, '');
    return digits.slice(0, 10);
  };

  return (
    <div className="w-full max-w-sm mx-auto animate-slide-up">
      <div className="wolt-card-elevated p-8">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-5">
            <Smartphone className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">עקוב אחר התיקון</h2>
          <p className="text-muted-foreground text-sm">הכניסו את מספר הטלפון שלכם</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="relative">
            <Input
              type="tel"
              placeholder="05X-XXXXXXX"
              value={phone}
              onChange={(e) => setPhone(formatPhone(e.target.value))}
              className="h-14 text-lg text-center font-medium tracking-widest rounded-xl border-2 border-border focus:border-primary transition-colors"
              dir="ltr"
            />
          </div>

          {error && (
            <div className="bg-destructive/10 text-destructive text-sm text-center py-3 px-4 rounded-xl animate-fade-in">
              {error}
            </div>
          )}

          <Button 
            type="submit" 
            size="lg" 
            className="w-full h-14 text-base font-semibold rounded-xl"
            disabled={phone.length < 9 || isLoading}
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
            ) : (
              <>
                <Search className="w-5 h-5 ml-2" />
                מצא את ההזמנה שלי
              </>
            )}
          </Button>
        </form>

        <p className="text-center text-xs text-muted-foreground mt-6">
          הזינו את המספר שהזנתם בעת ההזמנה
        </p>
      </div>
    </div>
  );
};

export default PhoneInput;
