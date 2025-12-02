import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Phone, Search } from 'lucide-react';

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
    // Remove non-digits
    const digits = value.replace(/\D/g, '');
    return digits.slice(0, 10);
  };

  return (
    <div className="w-full max-w-md mx-auto animate-slide-up">
      <div className="glass-card rounded-2xl p-8 shadow-card">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Phone className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">מעקב אחר התיקון</h2>
          <p className="text-muted-foreground">הזן את מספר הטלפון שלך כדי לעקוב אחר סטטוס התיקון</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Input
              type="tel"
              placeholder="050-1234567"
              value={phone}
              onChange={(e) => setPhone(formatPhone(e.target.value))}
              className="h-14 text-lg text-center pr-12 font-medium tracking-wider"
              dir="ltr"
            />
            <Phone className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          </div>

          {error && (
            <p className="text-destructive text-sm text-center animate-fade-in">{error}</p>
          )}

          <Button 
            type="submit" 
            size="xl" 
            className="w-full"
            disabled={phone.length < 9 || isLoading}
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
            ) : (
              <>
                <Search className="w-5 h-5" />
                חפש הזמנה
              </>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default PhoneInput;
