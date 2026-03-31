import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Battery, Shield, Clock, Star, ChevronDown, Phone, Zap, CheckCircle2, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ModelPrice {
  name: string;
  battery_price: number;
  series: string;
}

const BatteryProgram = () => {
  const navigate = useNavigate();
  const [models, setModels] = useState<ModelPrice[]>([]);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  // Countdown - end of month
  useEffect(() => {
    const getEndOfMonth = () => {
      const now = new Date();
      return new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    };

    const update = () => {
      const now = new Date();
      const end = getEndOfMonth();
      const diff = end.getTime() - now.getTime();
      if (diff <= 0) return;
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const loadModels = async () => {
      const { data } = await supabase
        .from('iphone_models')
        .select('name, battery_price, series')
        .eq('is_active', true)
        .gt('battery_price', 0)
        .order('sort_order', { ascending: true });
      if (data) setModels(data);
    };
    loadModels();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || phone.replace(/\D/g, '').length < 9) {
      toast.error('יש למלא שם ומספר טלפון תקין');
      return;
    }
    setIsSubmitting(true);
    await supabase.from('leads').insert({
      customer_name: name.trim(),
      customer_phone: phone.trim().replace(/\D/g, ''),
      last_step: 'battery_landing',
      device_type: 'iPhone',
      repair_type: 'סוללה',
      privacy_accepted: true,
    });
    setSubmitted(true);
    setIsSubmitting(false);
    toast.success('הפרטים נשלחו בהצלחה! ניצור איתך קשר בהקדם');
  };

  const scrollToPrices = () => {
    document.getElementById('prices')?.scrollIntoView({ behavior: 'smooth' });
  };

  // Group models by series
  const grouped = models.reduce((acc, m) => {
    const key = m.series || 'אחר';
    if (!acc[key]) acc[key] = [];
    acc[key].push(m);
    return acc;
  }, {} as Record<string, ModelPrice[]>);

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 via-background to-background">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.08),transparent_60%)]" />
        
        <div className="relative max-w-5xl mx-auto px-4 pt-8 pb-12 md:pt-16 md:pb-20">
          <button onClick={() => navigate('/')} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            חזרה לדף הראשי
          </button>

          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-destructive/10 text-destructive px-4 py-2 rounded-full text-sm font-semibold mb-6">
              <Zap className="w-4 h-4" />
              מבצע חודשי - מחירים שלא יחזרו
            </div>

            <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-foreground leading-tight mb-4">
              תוכנית שנתית
              <br />
              <span className="text-primary">להחלפת סוללה מקורית</span>
              <br />
              לאייפון
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              החלפת סוללה מקורית של Apple עד הבית, עם אחריות מלאה ומחירים מיוחדים לחודש זה בלבד
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-10">
              <Button size="lg" className="text-lg px-8 h-14 gap-2" onClick={scrollToPrices}>
                <Battery className="w-5 h-5" />
                לצפייה במחירים
                <ChevronDown className="w-4 h-4" />
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8 h-14 gap-2" onClick={() => document.getElementById('form')?.scrollIntoView({ behavior: 'smooth' })}>
                <Phone className="w-5 h-5" />
                השאירו פרטים
              </Button>
            </div>

            {/* Countdown */}
            <div className="bg-card border border-border rounded-2xl p-6 max-w-lg mx-auto shadow-sm">
              <p className="text-sm font-medium text-muted-foreground mb-3">המבצע מסתיים בעוד</p>
              <div className="grid grid-cols-4 gap-3">
                {[
                  { value: timeLeft.days, label: 'ימים' },
                  { value: timeLeft.hours, label: 'שעות' },
                  { value: timeLeft.minutes, label: 'דקות' },
                  { value: timeLeft.seconds, label: 'שניות' },
                ].map((item, i) => (
                  <div key={i} className="text-center">
                    <div className="text-2xl md:text-3xl font-black text-primary tabular-nums">
                      {String(item.value).padStart(2, '0')}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">{item.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-12 md:py-16 bg-muted/30">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">למה להחליף סוללה אצלנו?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: Battery, title: 'סוללה מקורית Apple', desc: 'רק חלקים מקוריים שמבטיחים ביצועים מושלמים ואורך חיים מקסימלי' },
              { icon: Shield, title: 'אחריות מלאה', desc: 'אחריות על החלק והעבודה, ראש שקט מלא' },
              { icon: Clock, title: 'שירות עד הבית', desc: 'טכנאי מוסמך מגיע עד אליך, החלפה תוך 30 דקות' },
            ].map((item, i) => (
              <div key={i} className="bg-card border border-border rounded-2xl p-6 text-center">
                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <item.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-lg font-bold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Prices */}
      <section id="prices" className="py-12 md:py-16">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-3">מחירון החלפת סוללה</h2>
          <p className="text-center text-muted-foreground mb-10">מחירים מיוחדים לתוכנית השנתית - כולל שירות עד הבית</p>

          <div className="space-y-8">
            {Object.entries(grouped).map(([series, seriesModels]) => (
              <div key={series}>
                {series && series !== 'אחר' && (
                  <h3 className="text-lg font-bold mb-3 text-primary">{series}</h3>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {seriesModels.map((model) => (
                    <div
                      key={model.name}
                      className="flex items-center justify-between bg-card border border-border rounded-xl p-4 hover:border-primary/30 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Battery className="w-5 h-5 text-primary/60" />
                        <span className="font-medium">{model.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-primary">₪{model.battery_price}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-12 md:py-16 bg-muted/30">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">מה הלקוחות אומרים</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: 'דני מ.', text: 'הטכנאי הגיע תוך שעה, החליף את הסוללה ב-20 דקות. האייפון שלי חי כמו חדש!', stars: 5 },
              { name: 'שירה ל.', text: 'מחיר מצוין לסוללה מקורית. לא האמנתי שזה יהיה כל כך מהיר ומקצועי.', stars: 5 },
              { name: 'אבי כ.', text: 'שירות ברמה הכי גבוהה. הסוללה מחזיקה עכשיו יום שלם בלי בעיה.', stars: 5 },
            ].map((review, i) => (
              <div key={i} className="bg-card border border-border rounded-2xl p-6">
                <div className="flex gap-0.5 mb-3">
                  {Array.from({ length: review.stars }).map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-sm text-foreground mb-4 leading-relaxed">"{review.text}"</p>
                <p className="text-sm font-semibold text-muted-foreground">{review.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Lead Form */}
      <section id="form" className="py-12 md:py-16">
        <div className="max-w-lg mx-auto px-4">
          <div className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-center mb-2">השאירו פרטים ונחזור אליכם</h2>
            <p className="text-center text-muted-foreground mb-6">נציג יצור אתכם קשר תוך דקות</p>

            {submitted ? (
              <div className="text-center py-8">
                <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">הפרטים התקבלו!</h3>
                <p className="text-muted-foreground mb-6">ניצור איתך קשר בהקדם לתיאום החלפת הסוללה</p>
                <Button onClick={() => navigate('/order')} className="gap-2">
                  להזמנה ישירה
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">שם מלא</label>
                  <Input
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="הכנס שם מלא"
                    className="h-12 text-base"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">מספר טלפון</label>
                  <Input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="050-0000000"
                    className="h-12 text-base"
                    dir="ltr"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full h-12 text-base gap-2"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'שולח...' : 'שלחו לי הצעת מחיר'}
                </Button>
                <p className="text-xs text-center text-muted-foreground">
                  בלחיצה על הכפתור אתם מאשרים יצירת קשר מנציג DirectFix
                </p>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-10 bg-primary text-primary-foreground">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-3">אל תפספסו - המחירים לחודש זה בלבד</h2>
          <p className="text-primary-foreground/80 mb-6">החלפת סוללה מקורית עד הבית, במחירים שלא יחזרו</p>
          <Button
            size="lg"
            variant="secondary"
            className="text-lg px-8 h-14"
            onClick={() => document.getElementById('form')?.scrollIntoView({ behavior: 'smooth' })}
          >
            להשארת פרטים
          </Button>
        </div>
      </section>
    </div>
  );
};

export default BatteryProgram;
