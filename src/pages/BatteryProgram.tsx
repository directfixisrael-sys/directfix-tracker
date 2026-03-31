import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Battery, Shield, Clock, Star, Phone, Zap, CheckCircle2, ArrowLeft, Sparkles, Truck, BadgeCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import heroImg from '@/assets/battery-hero.jpg';
import productImg from '@/assets/battery-product.jpg';
import serviceImg from '@/assets/battery-service.jpg';

interface ModelPrice {
  name: string;
  battery_price: number;
  series: string;
}

const DISCOUNT = 0.15; // 15%

const BatteryProgram = () => {
  const navigate = useNavigate();
  const [models, setModels] = useState<ModelPrice[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const getEndOfMonth = () => {
      const now = new Date();
      return new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    };
    const update = () => {
      const diff = getEndOfMonth().getTime() - Date.now();
      if (diff <= 0) return;
      setTimeLeft({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff / 3600000) % 24),
        minutes: Math.floor((diff / 60000) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from('iphone_models')
        .select('name, battery_price, series')
        .eq('is_active', true)
        .gt('battery_price', 0)
        .order('sort_order', { ascending: true });
      if (data) setModels(data);
    };
    load();
  }, []);

  const selectedModelData = models.find(m => m.name === selectedModel);
  const originalPrice = selectedModelData?.battery_price || 0;
  const discountedPrice = Math.round(originalPrice * (1 - DISCOUNT));
  const savedAmount = originalPrice - discountedPrice;

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
      device_type: selectedModel || 'iPhone',
      repair_type: 'סוללה',
      privacy_accepted: true,
    });
    setSubmitted(true);
    setIsSubmitting(false);
    toast.success('הפרטים נשלחו בהצלחה!');
  };

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroImg} alt="החלפת סוללה לאייפון" className="w-full h-full object-cover" width={1920} height={1080} />
          <div className="absolute inset-0 bg-gradient-to-l from-black/80 via-black/60 to-black/40" />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 py-16 md:py-28">
          <button onClick={() => navigate('/')} className="flex items-center gap-1 text-sm text-white/70 hover:text-white mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            חזרה לדף הראשי
          </button>

          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-red-500/20 backdrop-blur-sm border border-red-500/30 text-red-300 px-4 py-2 rounded-full text-sm font-semibold mb-6">
              <Zap className="w-4 h-4" />
              15% הנחה - מבצע לחודש זה בלבד
            </div>

            <h1 className="text-4xl md:text-6xl font-black text-white leading-tight mb-5">
              החלפת סוללה
              <br />
              <span className="text-blue-400">מקורית לאייפון</span>
            </h1>

            <p className="text-lg md:text-xl text-white/80 mb-8 leading-relaxed max-w-lg">
              סוללה מקורית Apple, שירות עד הבית תוך 30 דקות, עם אחריות מלאה. במחירים שלא יחזרו.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button size="lg" className="text-lg px-8 h-14 gap-2 bg-blue-600 hover:bg-blue-700 text-white" onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}>
                <Battery className="w-5 h-5" />
                בדוק מחיר לדגם שלך
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8 h-14 gap-2 border-white/30 text-white hover:bg-white/10" onClick={() => document.getElementById('form')?.scrollIntoView({ behavior: 'smooth' })}>
                <Phone className="w-5 h-5" />
                השאירו פרטים
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Countdown Bar */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-semibold text-lg">המבצע מסתיים בעוד:</p>
          <div className="flex gap-6">
            {[
              { value: timeLeft.days, label: 'ימים' },
              { value: timeLeft.hours, label: 'שעות' },
              { value: timeLeft.minutes, label: 'דקות' },
              { value: timeLeft.seconds, label: 'שניות' },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="text-2xl md:text-3xl font-black tabular-nums">{String(item.value).padStart(2, '0')}</div>
                <div className="text-xs text-blue-200">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 md:py-20">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl md:text-4xl font-bold text-center mb-4">למה דיירקט פיקס?</h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">אנחנו מספקים שירות החלפת סוללה ברמה הגבוהה ביותר, ישירות עד הבית שלכם</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: BadgeCheck, title: 'סוללה מקורית Apple', desc: 'רק חלקים מקוריים 100% שמבטיחים ביצועים מושלמים ואורך חיים מקסימלי למכשיר', img: productImg },
              { icon: Truck, title: 'שירות עד הבית', desc: 'טכנאי מוסמך מגיע אליכם לכל מקום. ההחלפה לוקחת 20-30 דקות בלבד', img: serviceImg },
              { icon: Shield, title: 'אחריות מלאה', desc: 'אחריות על החלק ועל העבודה. ראש שקט מלא שהמכשיר בידיים טובות' },
            ].map((item, i) => (
              <div key={i} className="group relative bg-card border border-border rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300">
                {item.img && (
                  <div className="h-48 overflow-hidden">
                    <img src={item.img} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                  </div>
                )}
                <div className="p-6">
                  <div className="w-12 h-12 bg-blue-50 dark:bg-blue-950 rounded-xl flex items-center justify-center mb-4">
                    <item.icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Pricing */}
      <section id="pricing" className="py-16 md:py-20 bg-muted/40">
        <div className="max-w-3xl mx-auto px-4">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-950 text-blue-600 px-4 py-2 rounded-full text-sm font-semibold mb-4">
              <Sparkles className="w-4 h-4" />
              15% הנחה על כל הדגמים
            </div>
            <h2 className="text-2xl md:text-4xl font-bold mb-3">בחרו את הדגם שלכם</h2>
            <p className="text-muted-foreground">בחרו את דגם האייפון וקבלו מחיר מיידי עם ההנחה</p>
          </div>

          <div className="bg-card border border-border rounded-3xl p-6 md:p-10 shadow-sm">
            <Select value={selectedModel} onValueChange={setSelectedModel}>
              <SelectTrigger className="h-14 text-lg rounded-xl border-2 focus:border-blue-500">
                <SelectValue placeholder="בחרו דגם iPhone..." />
              </SelectTrigger>
              <SelectContent>
                {models.map(m => (
                  <SelectItem key={m.name} value={m.name} className="text-base py-3">
                    {m.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedModel && selectedModelData && (
              <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/50 dark:to-blue-900/30 rounded-2xl p-6 md:p-8">
                  <div className="text-center mb-6">
                    <p className="text-sm text-muted-foreground mb-1">החלפת סוללה מקורית ל-</p>
                    <p className="text-2xl font-bold text-blue-600">{selectedModel}</p>
                  </div>

                  <div className="flex items-center justify-center gap-6 mb-6">
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground mb-1">מחיר רגיל</p>
                      <p className="text-2xl font-bold text-muted-foreground line-through">₪{originalPrice}</p>
                    </div>
                    <div className="w-px h-12 bg-border" />
                    <div className="text-center">
                      <p className="text-xs text-blue-600 font-semibold mb-1">אחרי 15% הנחה</p>
                      <p className="text-4xl font-black text-blue-600">₪{discountedPrice}</p>
                    </div>
                  </div>

                  <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-xl p-4 text-center mb-6">
                    <p className="text-green-700 dark:text-green-400 font-bold text-lg">
                      חוסכים ₪{savedAmount} על ההחלפה!
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-3 mb-6">
                    {[
                      { icon: Battery, text: 'סוללה מקורית' },
                      { icon: Clock, text: '30 דקות' },
                      { icon: Shield, text: 'אחריות מלאה' },
                    ].map((item, i) => (
                      <div key={i} className="flex flex-col items-center gap-1.5 text-center">
                        <item.icon className="w-5 h-5 text-blue-500" />
                        <span className="text-xs font-medium">{item.text}</span>
                      </div>
                    ))}
                  </div>

                  <Button 
                    size="lg" 
                    className="w-full h-14 text-lg gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
                    onClick={() => document.getElementById('form')?.scrollIntoView({ behavior: 'smooth' })}
                  >
                    <Phone className="w-5 h-5" />
                    הזמינו עכשיו
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Process Steps */}
      <section className="py-16 md:py-20">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl md:text-4xl font-bold text-center mb-12">איך זה עובד?</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-4">
            {[
              { step: '1', title: 'בחרו דגם', desc: 'בחרו את דגם האייפון וקבלו מחיר מיידי' },
              { step: '2', title: 'השאירו פרטים', desc: 'מלאו שם וטלפון ונחזור אליכם' },
              { step: '3', title: 'תיאום מועד', desc: 'נקבע מועד נוח לכם' },
              { step: '4', title: 'החלפה בבית', desc: 'הטכנאי מגיע ומחליף תוך 30 דקות' },
            ].map((item, i) => (
              <div key={i} className="text-center relative">
                <div className="w-14 h-14 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-black mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="font-bold text-lg mb-1">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 md:py-20 bg-muted/40">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-2xl md:text-4xl font-bold text-center mb-12">מה הלקוחות אומרים</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: 'דני מ.', device: 'iPhone 15 Pro', text: 'הטכנאי הגיע תוך שעה, החליף את הסוללה ב-20 דקות. האייפון שלי חי כמו חדש!' },
              { name: 'שירה ל.', device: 'iPhone 13', text: 'מחיר מצוין לסוללה מקורית. לא האמנתי שזה יהיה כל כך מהיר ומקצועי.' },
              { name: 'אבי כ.', device: 'iPhone 14 Pro Max', text: 'שירות ברמה הכי גבוהה. הסוללה מחזיקה עכשיו יום שלם בלי בעיה.' },
            ].map((review, i) => (
              <div key={i} className="bg-card border border-border rounded-2xl p-6">
                <div className="flex gap-0.5 mb-3">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-foreground mb-4 leading-relaxed">"{review.text}"</p>
                <div className="flex items-center justify-between">
                  <p className="font-semibold">{review.name}</p>
                  <p className="text-xs text-muted-foreground">{review.device}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Lead Form */}
      <section id="form" className="py-16 md:py-20">
        <div className="max-w-lg mx-auto px-4">
          <div className="bg-card border-2 border-blue-100 dark:border-blue-900 rounded-3xl p-6 md:p-10 shadow-lg shadow-blue-500/5">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-blue-50 dark:bg-blue-950 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Phone className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold mb-2">השאירו פרטים</h2>
              <p className="text-muted-foreground">נציג יחזור אליכם תוך דקות לתיאום</p>
            </div>

            {submitted ? (
              <div className="text-center py-6">
                <CheckCircle2 className="w-20 h-20 text-green-500 mx-auto mb-4" />
                <h3 className="text-2xl font-bold mb-2">הפרטים התקבלו!</h3>
                <p className="text-muted-foreground mb-6">ניצור איתך קשר בהקדם</p>
                <Button onClick={() => navigate('/order')} className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
                  להזמנה ישירה
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold mb-2">שם מלא</label>
                  <Input
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="הכנס שם מלא"
                    className="h-13 text-base rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">מספר טלפון</label>
                  <Input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="050-0000000"
                    className="h-13 text-base rounded-xl"
                    dir="ltr"
                  />
                </div>
                {models.length > 0 && (
                  <div>
                    <label className="block text-sm font-semibold mb-2">דגם האייפון (לא חובה)</label>
                    <Select value={selectedModel} onValueChange={setSelectedModel}>
                      <SelectTrigger className="h-13 text-base rounded-xl">
                        <SelectValue placeholder="בחרו דגם..." />
                      </SelectTrigger>
                      <SelectContent>
                        {models.map(m => (
                          <SelectItem key={m.name} value={m.name}>{m.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <Button
                  type="submit"
                  className="w-full h-14 text-lg gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'שולח...' : 'קבלו הצעת מחיר'}
                </Button>
                <p className="text-xs text-center text-muted-foreground">
                  בלחיצה על הכפתור אתם מאשרים יצירת קשר מנציג DirectFix
                </p>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-12 bg-blue-600 text-white">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-4xl font-bold mb-3">הסוללה לא מחזיקה? אל תחכו</h2>
          <p className="text-blue-100 mb-6 text-lg">15% הנחה על החלפת סוללה מקורית - לחודש זה בלבד</p>
          <Button
            size="lg"
            className="text-lg px-10 h-14 bg-white text-blue-600 hover:bg-blue-50"
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
