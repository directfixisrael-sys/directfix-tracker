import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import Logo from '@/components/Logo';
import clubCardImg from '@/assets/club-card.png';
import { Crown, Gift, Star, Sparkles, Phone, Mail, User, Cake, ChevronLeft, Shield, CheckCircle2, PartyPopper, Sun, Moon } from 'lucide-react';
import { Link } from 'react-router-dom';

const BENEFITS = [
  { icon: Gift, title: '50 נקודות במתנה', desc: 'מיד עם ההרשמה', highlight: true },
  { icon: Star, title: 'הנחות בלעדיות', desc: 'מבצעים לחברים' },
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
  const [isDark, setIsDark] = useState(false);

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

  const bg = isDark ? 'bg-[hsl(220,20%,8%)]' : 'bg-[hsl(40,60%,97%)]';
  const text = isDark ? 'text-white' : 'text-[hsl(220,25%,12%)]';
  const textMuted = isDark ? 'text-white/50' : 'text-[hsl(220,12%,44%)]';
  const cardBg = isDark ? 'bg-[hsl(220,18%,13%)]' : 'bg-white';
  const cardBorder = isDark ? 'border-white/8' : 'border-[hsl(220,15%,90%)]';
  const inputBg = isDark ? 'bg-[hsl(220,18%,16%)] border-white/10 text-white placeholder:text-white/30' : '';
  const headerBg = isDark ? 'bg-[hsl(220,20%,8%)]/95' : 'bg-[hsl(40,60%,97%)]/95';
  const accentBg = isDark ? 'bg-primary/15' : 'bg-primary/8';

  if (success) {
    return (
      <div className={`min-h-screen ${bg} flex items-center justify-center px-4`} dir="rtl">
        <div className={`text-center max-w-sm mx-auto animate-fade-in ${text}`}>
          <div className="w-14 h-14 bg-green-500/15 rounded-full flex items-center justify-center mx-auto mb-3">
            <PartyPopper className="w-7 h-7 text-green-500" />
          </div>
          <h1 className="text-2xl font-extrabold mb-1">ברוכים הבאים למועדון</h1>
          <p className={`${textMuted} mb-1`}>50 נקודות כבר מחכות לך</p>
          <p className={`${textMuted} text-sm mb-5`}>תוכל לנצל אותן בחנות ההטבות</p>
          <img src={clubCardImg} alt="כרטיס מועדון" className="w-48 mx-auto mb-5 drop-shadow-lg" />
          <div className="space-y-2">
            <Button asChild size="lg" className="w-full h-11 font-bold rounded-2xl">
              <Link to="/store">לחנות ההטבות</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="w-full h-11 font-bold rounded-2xl">
              <Link to="/">חזרה לדף הבית</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${bg} ${text} transition-colors duration-300`} dir="rtl" lang="he">
      {/* Header */}
      <header className={`sticky top-0 z-50 ${headerBg} backdrop-blur-md border-b ${cardBorder}`}>
        <nav className="max-w-lg mx-auto flex items-center justify-between px-4 h-12">
          <div className="flex items-center gap-2">
            <Link to="/" className={`h-8 w-8 rounded-lg ${isDark ? 'bg-white/10' : 'bg-black/5'} flex items-center justify-center transition-transform active:scale-95`}>
              <ChevronLeft className="w-4 h-4" />
            </Link>
            <button
              onClick={() => setIsDark(!isDark)}
              className={`h-8 w-8 rounded-lg ${isDark ? 'bg-white/10' : 'bg-black/5'} flex items-center justify-center transition-transform active:scale-95`}
              aria-label="החלף מצב תצוגה"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
          <Logo size="sm" />
        </nav>
      </header>

      <main className="max-w-lg mx-auto px-5">
        {/* Hero - compact like Isracard */}
        <section className="pt-6 pb-2 text-center">
          <div className={`inline-flex items-center gap-1.5 ${accentBg} text-primary px-3 py-1 rounded-full text-sm font-bold mb-3`}>
            <Sparkles className="w-3.5 h-3.5" />
            מבצע מרץ — 50 נקודות במתנה
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight leading-snug mb-1">
            מועדון החברים של <span className="text-primary">דיירקט פיקס</span>
          </h1>
          <p className={`${textMuted} text-sm`}>הצטרפו בחינם וקבלו הטבות בלעדיות</p>
        </section>

        {/* Card - tight */}
        <section className="py-3 flex justify-center">
          <img
            src={clubCardImg}
            alt="כרטיס מועדון"
            className="w-[220px] drop-shadow-lg"
          />
        </section>

        {/* Benefits - tight grid */}
        <section className="pb-3">
          <div className="grid grid-cols-3 gap-1.5">
            {BENEFITS.map((b, i) => (
              <div
                key={i}
                className={`rounded-xl p-2.5 text-center border transition-all ${
                  b.highlight
                    ? `${accentBg} border-primary/20`
                    : `${cardBg} ${cardBorder}`
                }`}
              >
                <b.icon className={`w-4 h-4 mx-auto mb-1 ${b.highlight ? 'text-primary' : textMuted}`} />
                <p className="text-[11px] font-bold leading-tight">{b.title}</p>
                <p className={`text-[10px] ${textMuted} mt-0.5`}>{b.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="pb-3">
          <Button
            onClick={() => document.getElementById('signup-form')?.scrollIntoView({ behavior: 'smooth' })}
            size="lg"
            className="w-full h-12 text-base font-extrabold rounded-2xl gap-2 transition-all active:scale-[0.97]"
          >
            <Crown className="w-5 h-5" />
            הצטרפו למועדון בחינם
          </Button>
        </section>

        {/* Form */}
        <section className="pb-4" id="signup-form">
          <div className={`${cardBg} rounded-2xl p-4 border ${cardBorder}`}>
            <h2 className="text-base font-extrabold mb-0.5 text-center">טופס הרשמה</h2>
            <p className={`${textMuted} text-[11px] text-center mb-3`}>חינם, בלי התחייבות</p>

            <form onSubmit={handleSubmit} className="space-y-2.5">
              <div>
                <Label htmlFor="name" className="flex items-center gap-1 text-[11px] font-bold mb-1">
                  <User className="w-3 h-3" /> שם מלא *
                </Label>
                <Input id="name" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="ישראל ישראלי" required className={`h-10 rounded-xl text-sm ${inputBg}`} />
              </div>

              <div>
                <Label htmlFor="phone" className="flex items-center gap-1 text-[11px] font-bold mb-1">
                  <Phone className="w-3 h-3" /> טלפון *
                </Label>
                <Input id="phone" type="tel" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="050-1234567" required dir="ltr" className={`h-10 rounded-xl text-sm text-right ${inputBg}`} />
              </div>

              <div>
                <Label htmlFor="email" className="flex items-center gap-1 text-[11px] font-bold mb-1">
                  <Mail className="w-3 h-3" /> אימייל
                </Label>
                <Input id="email" type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="example@email.com" dir="ltr" className={`h-10 rounded-xl text-sm text-right ${inputBg}`} />
              </div>

              <div>
                <Label htmlFor="birthday" className="flex items-center gap-1 text-[11px] font-bold mb-1">
                  <Cake className="w-3 h-3" /> תאריך יום הולדת
                </Label>
                <Input id="birthday" type="date" value={form.birthday} onChange={e => setForm(p => ({ ...p, birthday: e.target.value }))} className={`h-10 rounded-xl text-sm ${inputBg}`} />
              </div>

              <div className="flex items-start gap-2 pt-0.5">
                <Checkbox id="terms" checked={agreed} onCheckedChange={v => setAgreed(v === true)} className="mt-0.5" />
                <Label htmlFor="terms" className={`text-[11px] leading-relaxed cursor-pointer ${textMuted}`}>
                  אני מאשר/ת את{' '}
                  <Link to="/club-terms" className="text-primary underline" target="_blank">תקנון המועדון</Link>
                  {' '}ומסכים/ה לקבל עדכונים
                </Label>
              </div>

              <Button type="submit" size="lg" disabled={loading} className="w-full h-11 text-sm font-extrabold rounded-2xl gap-2 transition-all active:scale-[0.97]">
                {loading ? <span className="animate-pulse">רושם אותך...</span> : <><Crown className="w-4 h-4" /> הצטרף עכשיו</>}
              </Button>
            </form>
          </div>
        </section>

        {/* Terms */}
        <section className="pb-6">
          <div className={`rounded-xl p-3 border ${cardBorder} ${isDark ? 'bg-white/3' : 'bg-black/[0.015]'}`}>
            <h3 className={`text-[11px] font-bold mb-2 flex items-center gap-1 ${textMuted}`}>
              <Shield className="w-3 h-3" /> תקנון ותנאים
            </h3>
            <ul className="space-y-1">
              {[
                'ההצטרפות בחינם ואינה מחייבת רכישה.',
                'נקודות למימוש בחנות ההטבות בלבד.',
                '50 נקודות ההצטרפות — מבצע מרץ 2026.',
                <>ההטבות כפופות ל<Link to="/club-terms" className="text-primary underline">תקנון</Link>.</>,
                'ניתן לבטל חברות בכל עת.',
                <>המידע נשמר בהתאם ל<Link to="/terms" className="text-primary underline">מדיניות הפרטיות</Link>.</>,
              ].map((t, i) => (
                <li key={i} className={`flex gap-1.5 text-[10px] ${textMuted} leading-relaxed`}>
                  <CheckCircle2 className="w-2.5 h-2.5 mt-0.5 flex-shrink-0 text-green-500/70" />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>

      <footer className={`border-t ${cardBorder} text-center py-3 text-[10px] ${textMuted} ${cardBg}`}>
        <p>© {new Date().getFullYear()} דיירקט פיקס — מועדון החברים</p>
      </footer>
    </div>
  );
};

export default ClubSignup;
