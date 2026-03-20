import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import Logo from '@/components/Logo';
import clubCardImg from '@/assets/club-card.png';
import { Crown, Gift, Star, Sparkles, Phone, Mail, User, Cake, ChevronLeft, Shield, CheckCircle2, PartyPopper, Percent, HeartHandshake } from 'lucide-react';
import { Link } from 'react-router-dom';

const BENEFITS = [
  { icon: Gift, title: '50 נקודות במתנה', desc: 'מיד עם ההרשמה', highlight: true },
  { icon: Star, title: 'הנחות בלעדיות', desc: 'מבצעים לחברי מועדון' },
  { icon: Cake, title: 'מתנת יום הולדת', desc: 'הפתעה מיוחדת' },
  { icon: Sparkles, title: 'צבירת נקודות', desc: 'כל תיקון = נקודות' },
  { icon: Phone, title: 'ייעוץ חינם', desc: 'שיחה מקצועית' },
  { icon: Shield, title: 'אחריות מורחבת', desc: 'על כל תיקון' },
];

const ClubSignup = () => {
  const [form, setForm] = useState({ name: '', email: '', phone: '', birthday: '' });
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim()) {
      toast({ title: 'נא למלא שם מלא וטלפון', variant: 'destructive' });
      return;
    }
    if (!agreed) {
      toast({ title: 'נא לאשר את תקנון המועדון', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      const normalizedPhone = form.phone.replace(/\D/g, '');

      const { data: existing } = await supabase
        .from('club_members')
        .select('phone')
        .eq('phone', normalizedPhone)
        .maybeSingle();

      if (existing) {
        toast({ title: 'מספר זה כבר רשום במועדון', description: 'אתה כבר חבר מועדון פעיל' });
        setLoading(false);
        return;
      }

      const { error: clubError } = await supabase.from('club_members').insert({
        phone: normalizedPhone,
        name: form.name.trim(),
        email: form.email.trim() || null,
        is_active: true,
        wants_promotions: true,
      });
      if (clubError) throw clubError;

      if (form.birthday) {
        const { data: profile } = await supabase
          .from('customer_profiles')
          .select('id')
          .eq('phone', normalizedPhone)
          .maybeSingle();

        if (profile) {
          await supabase.functions.invoke('customer-auth', {
            body: { action: 'update-profile', phone: normalizedPhone, birthday: form.birthday }
          });
        }
      }

      await supabase.from('loyalty_points').insert({
        customer_phone: normalizedPhone,
        points: 50,
        type: 'earned',
        description: 'בונוס הצטרפות למועדון — מבצע מרץ 2026'
      });

      setSuccess(true);
    } catch (err) {
      console.error(err);
      toast({ title: 'שגיאה בהרשמה, נסה שוב', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4" dir="rtl">
        <div className="text-center max-w-sm mx-auto animate-fade-in">
          <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <PartyPopper className="w-8 h-8 text-success" />
          </div>
          <h1 className="text-2xl font-extrabold mb-2">ברוכים הבאים למועדון</h1>
          <p className="text-muted-foreground mb-1">50 נקודות כבר מחכות לך</p>
          <p className="text-muted-foreground mb-6 text-sm">תוכל לנצל אותן בחנות ההטבות</p>
          <img src={clubCardImg} alt="כרטיס מועדון" className="w-56 mx-auto mb-6 drop-shadow-lg" />
          <div className="space-y-2">
            <Button asChild size="lg" className="w-full h-12 font-bold rounded-2xl">
              <Link to="/store">לחנות ההטבות</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="w-full h-12 font-bold rounded-2xl">
              <Link to="/">חזרה לדף הבית</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" dir="rtl" lang="he">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b border-foreground/5">
        <nav className="max-w-2xl mx-auto flex items-center justify-between px-4 h-14">
          <Link to="/" className="h-9 w-9 rounded-xl bg-muted flex items-center justify-center transition-transform hover:scale-105 active:scale-95">
            <ChevronLeft className="w-4 h-4" />
          </Link>
          <Logo size="sm" />
        </nav>
      </header>

      <main className="max-w-lg mx-auto px-5">
        {/* Hero */}
        <section className="pt-8 pb-5 text-center">
          <div className="inline-flex items-center gap-1.5 bg-primary/8 text-primary px-3 py-1 rounded-full text-sm font-bold mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            מבצע מרץ — 50 נקודות במתנה
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight leading-tight mb-2">
            מועדון החברים של <span className="text-primary">דיירקט פיקס</span>
          </h1>
          <p className="text-muted-foreground text-sm">
            הצטרפו בחינם וקבלו הטבות בלעדיות
          </p>
        </section>

        {/* Card */}
        <section className="pb-5">
          <img
            src={clubCardImg}
            alt="כרטיס מועדון"
            className="w-full max-w-[280px] mx-auto drop-shadow-lg"
          />
        </section>

        {/* Benefits Grid */}
        <section className="pb-5">
          <div className="grid grid-cols-3 gap-2">
            {BENEFITS.map((b, i) => (
              <div
                key={i}
                className={`rounded-2xl p-3 text-center border transition-all ${
                  b.highlight
                    ? 'bg-primary/5 border-primary/20'
                    : 'bg-card border-foreground/5'
                }`}
              >
                <b.icon className={`w-5 h-5 mx-auto mb-1.5 ${b.highlight ? 'text-primary' : 'text-muted-foreground'}`} />
                <p className="text-xs font-bold leading-tight">{b.title}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{b.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Form */}
        <section className="pb-6">
          <div className="bg-card rounded-2xl p-5 border border-foreground/5">
            <h2 className="text-lg font-extrabold mb-0.5 text-center">הרשמה למועדון</h2>
            <p className="text-muted-foreground text-xs text-center mb-5">חינם לגמרי, בלי התחייבות</p>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <Label htmlFor="name" className="flex items-center gap-1.5 text-xs font-bold mb-1.5">
                  <User className="w-3.5 h-3.5" /> שם מלא *
                </Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  placeholder="ישראל ישראלי"
                  required
                  className="h-11 rounded-xl"
                />
              </div>

              <div>
                <Label htmlFor="phone" className="flex items-center gap-1.5 text-xs font-bold mb-1.5">
                  <Phone className="w-3.5 h-3.5" /> טלפון *
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={form.phone}
                  onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                  placeholder="050-1234567"
                  required
                  dir="ltr"
                  className="h-11 rounded-xl text-right"
                />
              </div>

              <div>
                <Label htmlFor="email" className="flex items-center gap-1.5 text-xs font-bold mb-1.5">
                  <Mail className="w-3.5 h-3.5" /> אימייל
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                  placeholder="example@email.com"
                  dir="ltr"
                  className="h-11 rounded-xl text-right"
                />
              </div>

              <div>
                <Label htmlFor="birthday" className="flex items-center gap-1.5 text-xs font-bold mb-1.5">
                  <Cake className="w-3.5 h-3.5" /> תאריך יום הולדת
                </Label>
                <Input
                  id="birthday"
                  type="date"
                  value={form.birthday}
                  onChange={e => setForm(p => ({ ...p, birthday: e.target.value }))}
                  className="h-11 rounded-xl"
                />
              </div>

              <div className="flex items-start gap-2.5 pt-1">
                <Checkbox
                  id="terms"
                  checked={agreed}
                  onCheckedChange={v => setAgreed(v === true)}
                  className="mt-0.5"
                />
                <Label htmlFor="terms" className="text-xs leading-relaxed cursor-pointer">
                  אני מאשר/ת את{' '}
                  <Link to="/club-terms" className="text-primary underline" target="_blank">תקנון המועדון</Link>
                  {' '}ומסכים/ה לקבל עדכונים
                </Label>
              </div>

              <Button
                type="submit"
                size="lg"
                disabled={loading}
                className="w-full h-12 text-base font-extrabold rounded-2xl gap-2 transition-all duration-200 active:scale-[0.97]"
              >
                {loading ? (
                  <span className="animate-pulse">רושם אותך...</span>
                ) : (
                  <>
                    <Crown className="w-5 h-5" />
                    הצטרפו למועדון בחינם
                  </>
                )}
              </Button>
            </form>
          </div>
        </section>

        {/* Terms */}
        <section className="pb-8">
          <div className="rounded-2xl p-4 border border-foreground/5 bg-muted/30">
            <h3 className="text-xs font-bold mb-2.5 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" /> תקנון ותנאים
            </h3>
            <ul className="space-y-1.5">
              {[
                'ההצטרפות למועדון הינה בחינם ואינה מחייבת רכישה.',
                'נקודות ניתנות למימוש בחנות ההטבות בלבד.',
                '50 נקודות ההצטרפות תקפות במסגרת מבצע מרץ 2026.',
                <>ההטבות כפופות ל<Link to="/club-terms" className="text-primary underline">תקנון המלא</Link>.</>,
                'ניתן לבטל חברות בכל עת.',
                <>המידע נשמר בהתאם ל<Link to="/terms" className="text-primary underline">מדיניות הפרטיות</Link>.</>,
              ].map((text, i) => (
                <li key={i} className="flex gap-1.5 text-[11px] text-muted-foreground leading-relaxed">
                  <CheckCircle2 className="w-3 h-3 mt-0.5 flex-shrink-0 text-success" />
                  <span>{text}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>

      <footer className="border-t border-foreground/5 text-center py-4 text-xs text-muted-foreground bg-card">
        <p>© {new Date().getFullYear()} דיירקט פיקס — מועדון החברים</p>
      </footer>
    </div>
  );
};

export default ClubSignup;
