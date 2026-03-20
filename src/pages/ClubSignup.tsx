import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import Logo from '@/components/Logo';
import clubCardImg from '@/assets/club-card.png';
import { Crown, Gift, Star, Sparkles, Phone, Mail, User, Cake, ChevronLeft, Shield, CheckCircle2, PartyPopper } from 'lucide-react';
import { Link } from 'react-router-dom';

const BENEFITS = [
  { icon: Gift, title: '50 נקודות במתנה', desc: 'מיד עם ההרשמה — לניצול בחנות ההטבות', highlight: true },
  { icon: Star, title: 'הנחות בלעדיות', desc: 'מבצעים והטבות מיוחדות לחברי מועדון בלבד' },
  { icon: Cake, title: 'מתנת יום הולדת', desc: 'הפתעה מיוחדת ביום ההולדת שלך' },
  { icon: Sparkles, title: 'צבירת נקודות', desc: 'כל תיקון = נקודות. כל נקודה = כסף אמיתי' },
  { icon: Phone, title: 'שיחת ייעוץ חינם', desc: 'ייעוץ מקצועי טלפוני ללא עלות לחברי מועדון' },
  { icon: Shield, title: 'אחריות מורחבת', desc: 'הטבות אחריות מורחבת על תיקונים' },
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

      // Check if already a member
      const { data: existing } = await supabase
        .from('club_members')
        .select('phone')
        .eq('phone', normalizedPhone)
        .maybeSingle();

      if (existing) {
        toast({ title: 'מספר זה כבר רשום במועדון! 🎉', description: 'אתה כבר חבר מועדון פעיל' });
        setLoading(false);
        return;
      }

      // Add to club_members
      const { error: clubError } = await supabase.from('club_members').insert({
        phone: normalizedPhone,
        name: form.name.trim(),
        email: form.email.trim() || null,
        is_active: true,
        wants_promotions: true,
      });
      if (clubError) throw clubError;

      // Update or create customer profile with birthday if provided
      if (form.birthday) {
        const { data: profile } = await supabase
          .from('customer_profiles')
          .select('id')
          .eq('phone', normalizedPhone)
          .maybeSingle();

        if (profile) {
          // Update via edge function since RLS blocks direct update
          await supabase.functions.invoke('customer-auth', {
            body: { action: 'update-profile', phone: normalizedPhone, birthday: form.birthday }
          });
        }
      }

      // Give 50 welcome points
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
          <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <PartyPopper className="w-10 h-10 text-success" />
          </div>
          <h1 className="text-3xl font-extrabold mb-3">ברוכים הבאים למועדון! 🎉</h1>
          <p className="text-muted-foreground mb-2 text-lg">50 נקודות כבר מחכות לך</p>
          <p className="text-muted-foreground mb-8 text-sm">תוכל לנצל אותן בחנות ההטבות שלנו</p>
          <img src={clubCardImg} alt="כרטיס מועדון" className="w-64 mx-auto mb-8 drop-shadow-xl" />
          <div className="space-y-3">
            <Button asChild size="lg" className="w-full h-12 text-base font-bold rounded-2xl">
              <Link to="/store">כנס לחנות ההטבות</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="w-full h-12 text-base font-bold rounded-2xl">
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
      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b-2 border-foreground/10">
        <nav className="max-w-2xl mx-auto flex items-center justify-between px-4 h-14">
          <Link to="/" className="h-9 w-9 rounded-xl bg-muted flex items-center justify-center border-2 border-foreground/10 transition-transform hover:scale-105">
            <ChevronLeft className="w-4 h-4" />
          </Link>
          <Logo size="sm" />
        </nav>
      </header>

      <main className="max-w-2xl mx-auto">
        {/* Hero */}
        <section className="px-6 pt-10 pb-8 text-center">
          <div className="animate-fade-in">
            <div className="inline-flex items-center gap-2 bg-warning/15 text-warning-foreground px-4 py-1.5 rounded-full text-sm font-bold mb-5 border border-warning/30" style={{ color: 'hsl(40 90% 42%)' }}>
              <Sparkles className="w-4 h-4" />
              <span>מבצע מרץ — 50 נקודות במתנה!</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight leading-tight mb-3">
              מועדון החברים של
              <br />
              <span className="text-primary">דיירקט פיקס</span>
            </h1>
            <p className="text-muted-foreground max-w-xs mx-auto leading-relaxed text-base">
              הצטרף בחינם וקבל הטבות, הנחות ומתנות בלעדיות
            </p>
          </div>
        </section>

        {/* Club Card */}
        <section className="px-6 pb-8">
          <div className="relative max-w-xs mx-auto animate-fade-in" style={{ animationDelay: '100ms' }}>
            <div className="absolute -inset-6 bg-primary/8 rounded-3xl blur-2xl" />
            <img
              src={clubCardImg}
              alt="כרטיס מועדון דיירקט פיקס"
              className="relative w-full drop-shadow-2xl hover:scale-[1.02] transition-transform duration-500"
            />
          </div>
        </section>

        {/* Promo Banner */}
        <section className="px-6 pb-6">
          <div className="bg-gradient-to-l from-primary/10 via-primary/5 to-transparent rounded-2xl p-5 border-2 border-primary/15 animate-fade-in" style={{ animationDelay: '150ms' }}>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-primary/15 flex items-center justify-center flex-shrink-0">
                <Gift className="w-7 h-7 text-primary" />
              </div>
              <div>
                <p className="font-extrabold text-lg">50 נקודות במתנה</p>
                <p className="text-muted-foreground text-sm">נרשמים עד סוף מרץ ומקבלים 50 נקודות לניצול מיידי בחנות ההטבות</p>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="px-6 pb-8">
          <h2 className="text-xl font-extrabold mb-5 text-center">למה כדאי להצטרף?</h2>
          <div className="grid grid-cols-2 gap-3 animate-fade-in" style={{ animationDelay: '200ms' }}>
            {BENEFITS.map((b, i) => (
              <div
                key={i}
                className={`strategly-card p-4 text-center ${b.highlight ? 'ring-2 ring-primary/30 bg-primary/5' : ''}`}
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3 border-2 border-foreground/10 ${b.highlight ? 'bg-primary/15' : 'bg-section-cream'}`}>
                  <b.icon className={`w-5 h-5 ${b.highlight ? 'text-primary' : 'text-foreground/70'}`} />
                </div>
                <p className="text-sm font-bold mb-1">{b.title}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Signup Form */}
        <section className="px-6 pb-10" id="signup-form">
          <div className="strategly-card p-6 animate-fade-in" style={{ animationDelay: '250ms' }}>
            <h2 className="text-xl font-extrabold mb-1 text-center">הרשמה למועדון</h2>
            <p className="text-muted-foreground text-sm text-center mb-6">חינם לגמרי, בלי התחייבות</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-2 text-sm font-bold">
                  <User className="w-4 h-4" /> שם מלא *
                </Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  placeholder="ישראל ישראלי"
                  required
                  className="h-12 text-base rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2 text-sm font-bold">
                  <Phone className="w-4 h-4" /> טלפון *
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={form.phone}
                  onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                  placeholder="050-1234567"
                  required
                  dir="ltr"
                  className="h-12 text-base rounded-xl text-right"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2 text-sm font-bold">
                  <Mail className="w-4 h-4" /> אימייל
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                  placeholder="example@email.com"
                  dir="ltr"
                  className="h-12 text-base rounded-xl text-right"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="birthday" className="flex items-center gap-2 text-sm font-bold">
                  <Cake className="w-4 h-4" /> תאריך יום הולדת
                </Label>
                <Input
                  id="birthday"
                  type="date"
                  value={form.birthday}
                  onChange={e => setForm(p => ({ ...p, birthday: e.target.value }))}
                  className="h-12 text-base rounded-xl"
                />
                <p className="text-xs text-muted-foreground">כדי שנוכל לשלוח לך מתנה ביום הולדת 🎂</p>
              </div>

              <div className="flex items-start gap-3 pt-2">
                <Checkbox
                  id="terms"
                  checked={agreed}
                  onCheckedChange={v => setAgreed(v === true)}
                  className="mt-0.5"
                />
                <Label htmlFor="terms" className="text-sm leading-relaxed cursor-pointer">
                  אני מאשר/ת את{' '}
                  <Link to="/club-terms" className="text-primary underline" target="_blank">
                    תקנון המועדון
                  </Link>{' '}
                  ומסכים/ה לקבל עדכונים והטבות
                </Label>
              </div>

              <Button
                type="submit"
                size="lg"
                disabled={loading}
                className="w-full h-14 text-lg font-extrabold rounded-2xl gap-2 border-2 border-foreground/10 shadow-[4px_4px_0_0_hsl(var(--foreground)/0.1)] hover:shadow-[6px_6px_0_0_hsl(var(--foreground)/0.12)] hover:-translate-y-0.5 transition-all duration-200"
              >
                {loading ? (
                  <span className="animate-pulse">רושם אותך...</span>
                ) : (
                  <>
                    <Crown className="w-5 h-5" />
                    <span>הצטרף למועדון בחינם</span>
                  </>
                )}
              </Button>
            </form>
          </div>
        </section>

        {/* Terms / Regulations Footer */}
        <section className="px-6 pb-10">
          <div className="bg-muted/50 rounded-2xl p-5 border border-foreground/5">
            <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
              <Shield className="w-4 h-4" /> תקנון ותנאי המועדון
            </h3>
            <ul className="space-y-2 text-xs text-muted-foreground leading-relaxed">
              <li className="flex gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-success" />
                <span>ההצטרפות למועדון הינה <strong>בחינם</strong> ואינה מחייבת רכישה.</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-success" />
                <span>נקודות ניתנות למימוש בחנות ההטבות של דיירקט פיקס בלבד.</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-success" />
                <span>50 נקודות ההצטרפות תקפות במסגרת מבצע מרץ 2026 בלבד.</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-success" />
                <span>ההטבות כפופות ל<Link to="/club-terms" className="text-primary underline">תקנון המועדון המלא</Link>.</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-success" />
                <span>ניתן לבטל חברות בכל עת באמצעות פנייה לשירות הלקוחות.</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-success" />
                <span>דיירקט פיקס שומרת על הזכות לשנות את תנאי המועדון בהתאם לשיקול דעתה.</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-success" />
                <span>המידע האישי נשמר בהתאם ל<Link to="/terms" className="text-primary underline">מדיניות הפרטיות</Link> של החברה.</span>
              </li>
            </ul>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t-2 border-foreground/10 text-center py-5 text-sm text-muted-foreground bg-card">
        <p className="font-medium">© {new Date().getFullYear()} דיירקט פיקס — מועדון החברים</p>
      </footer>
    </div>
  );
};

export default ClubSignup;
