import { useState } from 'react';
import { Lock, Mail, ArrowLeft, Gift, Star, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import Logo from '@/components/Logo';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import heroBanner from '@/assets/store-hero-banner.jpg';

interface StoreLoginProps {
  onLogin: (phone: string, name: string, points: number) => void;
}

const StoreLogin = ({ onLogin }: StoreLoginProps) => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!phone || !password) {
      toast.error('נא למלא את כל השדות');
      return;
    }
    setLoading(true);
    try {
      const normalizedPhone = phone.replace(/\D/g, '');

      // Check club membership first
      const { data: clubData } = await supabase
        .from('club_members')
        .select('*')
        .eq('phone', normalizedPhone)
        .eq('is_active', true)
        .maybeSingle();

      if (!clubData) {
        toast.error('החנות פתוחה לחברי מועדון בלבד');
        setLoading(false);
        return;
      }

      // Authenticate via edge function
      const { data, error } = await supabase.functions.invoke('customer-auth', {
        body: { action: 'login', phone: normalizedPhone, password },
      });

      if (error || data?.error) {
        toast.error('פרטי התחברות שגויים');
        setLoading(false);
        return;
      }

      // Get loyalty points
      const { data: pointsData } = await supabase
        .from('loyalty_points')
        .select('points, type')
        .eq('customer_phone', normalizedPhone);

      const totalPoints = (pointsData || []).reduce(
        (sum, p) => sum + (p.type === 'earned' ? p.points : -p.points), 0
      );

      onLogin(normalizedPhone, data.name || clubData.name, Math.max(0, totalPoints));
    } catch {
      toast.error('שגיאה בהתחברות');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <img src={heroBanner} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-black/30" />
      </div>

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-12">
        <div className="text-center mb-8 space-y-4">
          <div className="flex justify-center mb-6">
            <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20">
              <Logo size="lg" clickable={false} className="[&_span]:text-white [&_div]:border-white/20" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight" style={{ fontFamily: "'Rubik', sans-serif" }}>
            חנות ההטבות
          </h1>
          <p className="text-white/70 text-lg max-w-md mx-auto">
            הטבות בלעדיות לחברי המועדון. נצלו נקודות, קנו בהנחה
          </p>
        </div>

        {/* Features */}
        <div className="flex gap-6 mb-8 text-white/80">
          {[
            { icon: Star, text: 'מימוש נקודות' },
            { icon: Gift, text: 'הטבות בלעדיות' },
            { icon: ShoppingBag, text: 'מוצרי פרימיום' },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex flex-col items-center gap-2 text-xs">
              <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur flex items-center justify-center border border-white/20">
                <Icon className="w-5 h-5" />
              </div>
              <span>{text}</span>
            </div>
          ))}
        </div>

        <Card className="w-full max-w-sm p-6 bg-background/95 backdrop-blur-xl shadow-2xl border-border/50" dir="rtl">
          <h2 className="text-lg font-bold text-foreground mb-4 text-center">
            התחברות חברי מועדון
          </h2>
          <div className="space-y-3">
            <div className="relative">
              <Input
                type="tel"
                placeholder="מספר טלפון"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="pr-10 text-right"
                dir="ltr"
              />
              <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            </div>
            <div className="relative">
              <Input
                type="password"
                placeholder="סיסמא"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                className="pr-10 text-right"
              />
              <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            </div>
            <Button className="w-full" onClick={handleLogin} disabled={loading}>
              {loading ? 'מתחבר...' : 'כניסה לחנות'}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground text-center mt-4">
            לא חבר מועדון? <a href="/" className="text-primary hover:underline">הצטרפו עכשיו</a>
          </p>
        </Card>

        <Button
          variant="ghost"
          className="mt-6 text-white/60 hover:text-white"
          onClick={() => window.location.href = '/'}
        >
          <ArrowLeft className="w-4 h-4 ml-2" />
          חזרה לאתר הראשי
        </Button>
      </div>
    </div>
  );
};

export default StoreLogin;
