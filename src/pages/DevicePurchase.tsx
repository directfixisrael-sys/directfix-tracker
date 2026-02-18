import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Smartphone, Shield, Battery, Zap, Package, Truck, Check, Gift, Star,
  Phone, User, MapPin, ArrowLeft, ArrowRight, Calendar, Clock, Heart,
  CreditCard, ChevronDown, Sparkles, RefreshCw, Send, CheckCircle2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import AddressAutocomplete from '@/components/AddressAutocomplete';
import GiftOrderToggle from '@/components/GiftOrderToggle';

import iphone17ProMaxImg from '@/assets/iphone-17-pro-max.png';
import iphone17ProMaxOrange from '@/assets/iphone-17-pro-max-orange.png';
import iphone17ProMaxBlue from '@/assets/iphone-17-pro-max-blue.png';
import iphone17ProMaxSilver from '@/assets/iphone-17-pro-max-silver.png';
import iphone17ProImg from '@/assets/iphone-17-pro.png';
import iphone17Img from '@/assets/iphone-17.png';
import iphone17AirImg from '@/assets/iphone-17-air.png';

// ─── Data ──────────────────────────────────────────────

interface PhoneColor {
  name: string;
  hex: string;
  image?: string;
}

interface PhoneModel {
  id: string;
  name: string;
  subtitle: string;
  image: string;
  storage: { size: string; price: number }[];
  colors: PhoneColor[];
  isNew?: boolean;
  isPro?: boolean;
  badge?: string;
}

const phoneModels: PhoneModel[] = [
  {
    id: 'iphone-17-pro-max',
    name: 'iPhone 17 Pro Max',
    subtitle: 'הכי חזק. הכי גדול.',
    image: iphone17ProMaxOrange,
    isPro: true,
    isNew: true,
    badge: 'הפופולרי ביותר',
    colors: [
      { name: 'כסוף', hex: '#E5E5E0', image: iphone17ProMaxSilver },
      { name: 'כתום קוסמי', hex: '#D4723C', image: iphone17ProMaxOrange },
      { name: 'כחול עמוק', hex: '#2C4A6E', image: iphone17ProMaxBlue },
    ],
    storage: [
      { size: '256GB', price: 5299 },
      { size: '512GB', price: 6149 },
      { size: '1TB', price: 7099 },
    ],
  },
  {
    id: 'iphone-17-pro',
    name: 'iPhone 17 Pro',
    subtitle: 'ביצועי Pro. גודל קומפקטי.',
    image: iphone17ProImg,
    isPro: true,
    colors: [
      { name: 'כסוף', hex: '#E5E5E0' },
      { name: 'כתום קוסמי', hex: '#D4723C' },
      { name: 'כחול עמוק', hex: '#2C4A6E' },
      { name: 'שחור', hex: '#2C2C2C' },
      { name: 'אפור', hex: '#8E8E93' },
    ],
    storage: [
      { size: '256GB', price: 5299 },
      { size: '512GB', price: 6149 },
      { size: '1TB', price: 7099 },
    ],
  },
  {
    id: 'iphone-17-air',
    name: 'iPhone 17 Air',
    subtitle: 'הדק ביותר אי פעם.',
    image: iphone17AirImg,
    isNew: true,
    badge: 'חדש!',
    colors: [
      { name: 'זהב בהיר', hex: '#E8D5B0' },
      { name: 'כחול שמיים', hex: '#A8C8E8' },
      { name: 'לבן', hex: '#F5F5F0' },
      { name: 'שחור חלל', hex: '#2C2C2C' },
    ],
    storage: [
      { size: '256GB', price: 3899 },
      { size: '512GB', price: 4799 },
    ],
  },
  {
    id: 'iphone-17',
    name: 'iPhone 17',
    subtitle: 'הכל שצריך. במחיר חכם.',
    image: iphone17Img,
    colors: [
      { name: 'סגול', hex: '#9B7DB8' },
      { name: 'ירוק', hex: '#6BAF7A' },
      { name: 'כחול', hex: '#5B7FAE' },
      { name: 'שחור', hex: '#2C2C2C' },
      { name: 'לבן', hex: '#F5F5F0' },
    ],
    storage: [
      { size: '256GB', price: 3899 },
      { size: '512GB', price: 4699 },
    ],
  },
];

const packageFeatures = [
  { icon: Shield, title: 'מגן מסך פרימיום' },
  { icon: Package, title: 'כיסוי איכותי' },
  { icon: Zap, title: 'מטען מהיר 20W' },
  { icon: RefreshCw, title: 'העברת נתונים' },
  { icon: Truck, title: 'משלוח חינם עד הבית' },
];

const heroTestimonials = [
  { name: 'דניאל כ.', text: 'הזמנתי iPhone 17 Pro Max - הגיעו הביתה, העבירו נתונים, שמו כיסוי ומגן. שירות מדהים!' },
  { name: 'מיכל ש.', text: 'קניתי מכשיר חדש ותוך שעתיים כבר היה אצלי בבית עם הכל מותקן. מושלם!' },
  { name: 'אור ל.', text: 'מחיר הוגן, שירות עד הבית, הכל כלול. לא הייתי מאמין שזה יהיה כל כך פשוט' },
  { name: 'נועה ר.', text: 'העבירו לי את הכל מהאייפון הישן, כולל תמונות ואפליקציות. חוויה מעולה!' },
];

const cyclingMessages = [
  'חוויית רכישה שלמה',
  'הכל כלול במחיר אחד',
  'שירות VIP עד הבית',
  'מכשיר חדש + אביזרים',
];

// Schedule
const weekdaySlots = ['9:00-11:00', '11:00-13:00', '13:00-17:00', '17:00-20:00', '20:00-22:00'];
const fridaySlots = ['8:00-10:00', '10:00-13:00', '13:00-17:00'];
const saturdaySlots = ['17:00-19:00', '19:00-22:00'];
const hebrewDays = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];

type Step = 'hero' | 'model' | 'storage' | 'color' | 'schedule' | 'details' | 'payment';

// ─── Component ─────────────────────────────────────────

const DevicePurchase = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const contentRef = useRef<HTMLDivElement>(null);

  const [step, setStep] = useState<Step>('hero');
  const [selectedModel, setSelectedModel] = useState<PhoneModel | null>(null);
  const [selectedStorage, setSelectedStorage] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<PhoneColor | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  // Hero cycling message
  const [cycleIdx, setCycleIdx] = useState(0);
  const [testimonialIdx, setTestimonialIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setCycleIdx(i => (i + 1) % cyclingMessages.length), 3000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setTestimonialIdx(i => (i + 1) % heroTestimonials.length), 4000);
    return () => clearInterval(timer);
  }, []);

  // Schedule
  const [blockedDates, setBlockedDates] = useState<string[]>([]);
  const [hourlyBlocks, setHourlyBlocks] = useState<{ date: string; start_time: string; end_time: string }[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');

  // Details
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [isGiftOrder, setIsGiftOrder] = useState(false);
  const [giftSenderName, setGiftSenderName] = useState('');
  const [giftSenderPhone, setGiftSenderPhone] = useState('');
  const [giftMessage, setGiftMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load blocked dates
  useEffect(() => {
    supabase.from('blocked_dates').select('date, start_time, end_time').then(({ data }) => {
      if (data) {
        setBlockedDates(data.filter(d => !d.start_time).map(d => d.date));
        setHourlyBlocks(data.filter(d => d.start_time && d.end_time).map(d => ({ date: d.date, start_time: d.start_time!, end_time: d.end_time! })));
      }
    });
  }, []);

  const goToStep = (newStep: Step) => {
    setIsAnimating(true);
    setTimeout(() => {
      setStep(newStep);
      setIsAnimating(false);
      contentRef.current?.scrollIntoView({ behavior: 'instant', block: 'start' });
      window.scrollTo({ top: 0, behavior: 'instant' });
    }, 200);
  };

  // Schedule helpers
  const getAvailableDates = () => {
    const dates: Date[] = [];
    const today = new Date();
    for (let i = 1; i <= 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      if (!blockedDates.includes(dateStr)) dates.push(date);
    }
    return dates;
  };

  const getTimeSlotsForDate = (date: Date) => {
    const day = date.getDay();
    if (day === 5) return fridaySlots;
    if (day === 6) return saturdaySlots;
    return weekdaySlots;
  };

  const isSlotAvailable = (date: Date, slot: string) => {
    const [slotStart, slotEnd] = slot.split('-');
    const sh = parseInt(slotStart.split(':')[0]), sm = parseInt(slotStart.split(':')[1] || '0');
    const eh = parseInt(slotEnd.split(':')[0]), em = parseInt(slotEnd.split(':')[1] || '0');
    const dateStr = date.toISOString().split('T')[0];
    for (const block of hourlyBlocks.filter(b => b.date === dateStr)) {
      const bs = parseInt(block.start_time.split(':')[0]) * 60 + parseInt(block.start_time.split(':')[1]);
      const be = parseInt(block.end_time.split(':')[0]) * 60 + parseInt(block.end_time.split(':')[1]);
      if (sh * 60 + sm < be && eh * 60 + em > bs) return false;
    }
    return true;
  };

  const formatPhone = (val: string) => {
    const digits = val.replace(/\D/g, '');
    if (digits.length <= 3) return digits;
    return digits.slice(0, 3) + '-' + digits.slice(3, 10);
  };

  const getPrice = () => selectedModel?.storage.find(s => s.size === selectedStorage)?.price || 0;

  const getColorImage = () => {
    if (selectedColor?.image) return selectedColor.image;
    return selectedModel?.image || '';
  };

  const formatSelectedDateTime = () => {
    if (!selectedDate || !selectedTimeSlot) return '';
    const dayName = hebrewDays[selectedDate.getDay()];
    return `יום ${dayName}, ${selectedDate.getDate()}/${selectedDate.getMonth() + 1} בשעות ${selectedTimeSlot}`;
  };

  const handleSubmitOrder = async () => {
    if (!customerName || !customerPhone || !customerAddress) {
      toast({ title: 'נא למלא את כל השדות', variant: 'destructive' });
      return;
    }
    setIsSubmitting(true);
    try {
      const notes: string[] = [
        `רכישת מכשיר: ${selectedModel?.name}`,
        `נפח: ${selectedStorage}`,
        `צבע: ${selectedColor?.name}`,
        `מועד מבוקש: ${selectedDate?.toISOString().split('T')[0]} ${selectedTimeSlot}`,
        'כולל חבילת אביזרים + העברת נתונים + משלוח',
        'מקדמה: ₪500',
      ];
      if (isGiftOrder) {
        notes.push(`🎁 הזמנת מתנה מ: ${giftSenderName} (${giftSenderPhone})`);
        if (giftMessage) notes.push(`ברכה: ${giftMessage}`);
      }

      const { error } = await supabase.from('orders').insert({
        customer_name: customerName,
        customer_phone: customerPhone,
        customer_address: customerAddress,
        customer_email: customerEmail || null,
        device_type: `${selectedModel?.name} ${selectedStorage} ${selectedColor?.name}`,
        issue_description: `רכישת מכשיר חדש - ${selectedModel?.name}`,
        repair_price: getPrice(),
        notes,
        status: 'pending',
        lead_source: 'device-purchase',
      });

      if (error) throw error;

      toast({ title: 'ההזמנה התקבלה בהצלחה! 🎉', description: 'ניצור איתך קשר בקרוב' });
      goToStep('hero');
    } catch (err) {
      console.error(err);
      toast({ title: 'שגיאה בשליחת ההזמנה', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Progress bar
  const steps: Step[] = ['hero', 'model', 'storage', 'color', 'schedule', 'details', 'payment'];
  const currentStepIndex = steps.indexOf(step);
  const progressPercent = step === 'hero' ? 0 : ((currentStepIndex) / (steps.length - 1)) * 100;

  return (
    <div className="min-h-screen bg-background" ref={contentRef}>
      <Header showBackButton onBack={() => step === 'hero' ? navigate('/') : goToStep(steps[currentStepIndex - 1])} />

      {/* Progress bar + scrolling marquee */}
      {step !== 'hero' && (
        <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border/50">
          <div className="h-1 bg-muted">
            <div className="h-full bg-primary transition-all duration-500 ease-out" style={{ width: `${progressPercent}%` }} />
          </div>
          {/* Scrolling marquee */}
          <div className="overflow-hidden py-2">
            <div className="flex animate-marquee gap-8 whitespace-nowrap">
              {[...packageFeatures, ...packageFeatures].map((f, i) => (
                <div key={i} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <f.icon className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                  <span>{f.title}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <main className={cn("container max-w-lg mx-auto px-4 py-6 pb-24 transition-opacity duration-200", isAnimating && "opacity-0")}>

        {/* ═══ STEP: Hero ═══ */}
        {step === 'hero' && (
          <div className="space-y-8 animate-fade-in">
            {/* Hero */}
            <div className="text-center pt-8 pb-4">
              {/* Cycling badge */}
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-1.5 text-sm font-semibold mb-6 h-8 overflow-hidden relative">
                <Sparkles className="w-4 h-4 flex-shrink-0" />
                <span key={cycleIdx} className="animate-fade-in">
                  {cyclingMessages[cycleIdx]}
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black mb-4 leading-tight">
                מכשיר חדש?
                <br />
                <span className="bg-gradient-to-l from-primary via-primary to-accent bg-clip-text text-transparent">
                  אנחנו מסדרים הכל.
                </span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-sm mx-auto leading-relaxed">
                הכל בשירות אחד.
              </p>
            </div>

            {/* Running testimonials */}
            <div className="relative h-20 overflow-hidden rounded-2xl bg-primary/5 border border-primary/15">
              {heroTestimonials.map((t, i) => (
                <div
                  key={i}
                  className={cn(
                    "absolute inset-0 flex items-center px-5 gap-3 transition-all duration-700 ease-in-out",
                    i === testimonialIdx ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                  )}
                >
                  <div className="flex-shrink-0 flex gap-0.5">
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} className="w-3 h-3 text-warning fill-warning" />
                    ))}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-foreground font-medium truncate">"{t.text}"</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className="text-[11px] font-semibold text-foreground">{t.name}</span>
                      <CheckCircle2 className="w-3 h-3 text-primary" />
                      <span className="text-[10px] text-muted-foreground">מאומת</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Value cards */}
            <div className="space-y-3">
              <p className="text-sm font-bold text-center text-muted-foreground mb-1">מכשיר חדש באריזה + הכל כלול:</p>
              {[
                { icon: Smartphone, title: 'מכשיר חדש באריזה', desc: 'iPhone 17 כל הדגמים זמינים', gradient: 'from-blue-500/10 to-indigo-500/10', iconColor: 'text-blue-500' },
                { icon: Package, title: 'חבילת אביזרים מלאה', desc: 'כיסוי + מגן מסך + מטען מהיר', gradient: 'from-purple-500/10 to-pink-500/10', iconColor: 'text-purple-500' },
                { icon: RefreshCw, title: 'העברת נתונים מלאה', desc: 'אנשי קשר, תמונות, אפליקציות - הכל', gradient: 'from-green-500/10 to-emerald-500/10', iconColor: 'text-green-500' },
                { icon: Truck, title: 'שירות עד הבית - חינם!', desc: 'מגיעים אליך, מתקינים ומעבירים', gradient: 'from-orange-500/10 to-amber-500/10', iconColor: 'text-orange-500' },
                { icon: Shield, title: 'אחריות יבואן רשמי', desc: 'ביטחון מלא על הרכישה', gradient: 'from-cyan-500/10 to-sky-500/10', iconColor: 'text-cyan-500' },
              ].map((item, i) => (
                <div
                  key={i}
                  className={cn(
                    "flex items-center gap-4 p-4 rounded-2xl border border-border/50 bg-gradient-to-l transition-transform hover:scale-[1.02] cursor-default",
                    item.gradient
                  )}
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <div className="w-12 h-12 rounded-xl bg-background/80 flex items-center justify-center flex-shrink-0 shadow-sm">
                    <item.icon className={cn("w-6 h-6", item.iconColor)} />
                  </div>
                  <div>
                    <p className="font-bold text-sm">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                  <Check className="w-5 h-5 text-primary mr-auto flex-shrink-0" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ═══ STEP: Model Selection ═══ */}
        {step === 'model' && (
          <div className="space-y-5 animate-fade-in">
            <div className="text-center mb-6">
              <h2 className="text-3xl font-extrabold mb-1">בחרו דגם</h2>
              <p className="text-muted-foreground">סדרת iPhone 17 החדשה</p>
            </div>

            <div className="space-y-4">
              {phoneModels.map((model) => (
                <button
                  key={model.id}
                  onClick={() => {
                    setSelectedModel(model);
                    setSelectedStorage('');
                    setSelectedColor(null);
                    goToStep('storage');
                  }}
                  className={cn(
                    "w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all active:scale-[0.98] text-right",
                    "border-border hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10 bg-card"
                  )}
                >
                  <img src={model.image} alt={model.name} className="w-20 h-20 object-contain flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="text-lg font-bold">{model.name}</h3>
                      {model.badge && (
                        <Badge className="bg-success/15 text-success border-success/30 text-[10px] px-1.5 py-0">
                          {model.badge}
                        </Badge>
                      )}
                      {model.isPro && !model.badge && (
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0">Pro</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mb-1.5">{model.subtitle}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-primary">החל מ-₪{model.storage[0].price.toLocaleString()}</span>
                      <div className="flex gap-1 mr-auto">
                        {model.colors.slice(0, 4).map((c, i) => (
                          <div key={i} className="w-3.5 h-3.5 rounded-full border border-border" style={{ backgroundColor: c.hex }} />
                        ))}
                      </div>
                    </div>
                  </div>
                  <ArrowLeft className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ═══ STEP: Storage ═══ */}
        {step === 'storage' && selectedModel && (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center">
              <img src={selectedModel.image} alt={selectedModel.name} className="w-32 h-32 object-contain mx-auto mb-4" />
              <h2 className="text-3xl font-extrabold mb-1">{selectedModel.name}</h2>
              <p className="text-muted-foreground">בחרו נפח אחסון</p>
            </div>

            <div className="space-y-3">
              {selectedModel.storage.map((s) => (
                <button
                  key={s.size}
                  onClick={() => {
                    setSelectedStorage(s.size);
                    goToStep('color');
                  }}
                  className={cn(
                    "w-full flex items-center justify-between p-5 rounded-2xl border-2 transition-all active:scale-[0.98]",
                    selectedStorage === s.size
                      ? "border-primary bg-primary/5 shadow-md"
                      : "border-border hover:border-primary/40 bg-card"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
                      <Battery className="w-6 h-6 text-primary" />
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">{s.size}</p>
                      <p className="text-xs text-muted-foreground">
                        {s.size === '256GB' ? 'הפופולרי ביותר' :
                         s.size === '512GB' ? 'לצלמים ויוצרי תוכן' :
                         s.size === '1TB' ? 'נפח מקסימלי לכל דבר' :
                         'מתאים לשימוש בסיסי'}
                      </p>
                    </div>
                  </div>
                  <span className="text-lg font-bold text-primary">₪{s.price.toLocaleString()}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ═══ STEP: Color ═══ */}
        {step === 'color' && selectedModel && (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center">
              <img 
                src={selectedColor?.image || selectedModel.image} 
                alt={selectedModel.name} 
                className="w-36 h-36 object-contain mx-auto mb-4 transition-all duration-300" 
              />
              <h2 className="text-3xl font-extrabold mb-1">בחרו צבע</h2>
              <p className="text-muted-foreground">{selectedModel.name} · {selectedStorage}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {selectedModel.colors.map((color) => (
                <button
                  key={color.name}
                  onClick={() => {
                    setSelectedColor(color);
                  }}
                  className={cn(
                    "flex flex-col items-center gap-3 p-5 rounded-2xl border-2 transition-all active:scale-[0.98]",
                    selectedColor?.name === color.name
                      ? "border-primary bg-primary/5 shadow-md"
                      : "border-border hover:border-primary/40 bg-card"
                  )}
                >
                  {color.image ? (
                    <img src={color.image} alt={color.name} className="w-16 h-16 object-contain" />
                  ) : (
                    <div
                      className="w-16 h-16 rounded-full border-4 border-background shadow-lg"
                      style={{ backgroundColor: color.hex }}
                    />
                  )}
                  <span className="text-sm font-semibold">{color.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ═══ STEP: Schedule ═══ */}
        {step === 'schedule' && (
          <div className="space-y-5 animate-fade-in">
            <div className="text-center mb-4">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-1.5 text-sm font-semibold mb-3">
                <Calendar className="w-4 h-4" />
                קביעת מועד
              </div>
              <h2 className="text-3xl font-extrabold mb-1">מתי נגיע?</h2>
              <p className="text-muted-foreground">בחרו יום ושעה שנוחים לכם</p>
            </div>

            {/* Date selection */}
            <div>
              <label className="block text-sm font-bold mb-3">בחר יום</label>
              <div className="grid grid-cols-4 gap-3">
                {getAvailableDates().slice(0, 8).map((date, index) => {
                  const dayName = hebrewDays[date.getDay()];
                  const isSelected = selectedDate?.toDateString() === date.toDateString();
                  const hasSlots = getTimeSlotsForDate(date).some(s => isSlotAvailable(date, s));
                  return (
                    <button
                      key={index}
                      onClick={() => { setSelectedDate(date); setSelectedTimeSlot(''); }}
                      disabled={!hasSlots}
                      className={cn(
                        "p-3 rounded-2xl border-2 text-center transition-all",
                        isSelected ? "border-primary bg-primary/10 text-primary shadow-sm"
                          : hasSlots ? "border-border hover:border-primary/40 hover:bg-muted/30"
                          : "border-border/50 opacity-40 cursor-not-allowed"
                      )}
                    >
                      <div className="text-sm font-bold">{dayName}</div>
                      <div className="text-sm text-muted-foreground">{date.getDate()}/{date.getMonth() + 1}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Time slot */}
            {selectedDate && (
              <div className="animate-fade-in">
                <label className="block text-sm font-bold mb-3">בחר שעה</label>
                <div className="grid grid-cols-2 gap-3">
                  {getTimeSlotsForDate(selectedDate).map(slot => {
                    const available = isSlotAvailable(selectedDate, slot);
                    const isSelected = selectedTimeSlot === slot;
                    return (
                      <button
                        key={slot}
                        onClick={() => setSelectedTimeSlot(slot)}
                        disabled={!available}
                        className={cn(
                          "p-4 rounded-2xl border-2 text-center transition-all flex items-center justify-center gap-2",
                          isSelected ? "border-primary bg-primary/10 text-primary shadow-sm"
                            : available ? "border-border hover:border-primary/40"
                            : "border-border/50 opacity-40 cursor-not-allowed"
                        )}
                      >
                        <Clock className="w-4 h-4" />
                        <span className="text-base font-semibold">{slot}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {selectedDate && selectedTimeSlot && (
              <div className="space-y-4 animate-fade-in">
                <Card className="p-4 bg-primary/5 border-primary/20">
                  <p className="text-lg text-center">
                    <span className="text-muted-foreground">מועד נבחר: </span>
                    <span className="font-semibold">{formatSelectedDateTime()}</span>
                  </p>
                </Card>
              </div>
            )}
          </div>
        )}

        {/* ═══ STEP: Details ═══ */}
        {step === 'details' && (
          <div className="space-y-5 animate-fade-in">
            <div className="text-center mb-4">
              <h2 className="text-3xl font-extrabold mb-1">
                {isGiftOrder ? 'פרטי המתנה' : 'לאן נגיע?'}
              </h2>
              <p className="text-muted-foreground">
                {isGiftOrder ? 'מלאו את פרטי השולח ומקבל המתנה' : 'מלאו את הפרטים ואנחנו בדרך'}
              </p>
            </div>

            {/* Gift toggle */}
            <GiftOrderToggle isGift={isGiftOrder} onToggle={setIsGiftOrder} label="שליחת מכשיר במתנה" />

            {/* Gift sender */}
            {isGiftOrder && (
              <div className="space-y-4 bg-gradient-to-br from-primary/5 to-primary/10 rounded-3xl p-5 border border-primary/20 animate-fade-in">
                <div className="flex items-center gap-2 mb-2">
                  <Heart className="w-5 h-5 text-primary fill-primary" />
                  <h3 className="font-bold text-lg">פרטי השולח (שלכם)</h3>
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1.5">שם השולח</label>
                  <Input placeholder="השם שלכם" value={giftSenderName} onChange={e => setGiftSenderName(e.target.value)} className="h-13 text-base rounded-2xl" />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1.5">טלפון השולח</label>
                  <Input placeholder="050-0000000" value={giftSenderPhone} onChange={e => setGiftSenderPhone(formatPhone(e.target.value))} type="tel" className="h-13 text-base rounded-2xl text-right" dir="ltr" />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1.5">ברכה למקבל המתנה <span className="text-muted-foreground font-normal">(לא חובה)</span></label>
                  <Textarea placeholder="כמה מילים חמות..." value={giftMessage} onChange={e => setGiftMessage(e.target.value)} className="text-base rounded-2xl resize-none" rows={2} />
                </div>
              </div>
            )}

            <div className="space-y-4 bg-card rounded-3xl p-5 border border-border/50">
              {isGiftOrder && (
                <div className="flex items-center gap-2 mb-2">
                  <Gift className="w-5 h-5 text-primary" />
                  <h3 className="font-bold text-lg">פרטי מקבל המתנה</h3>
                </div>
              )}
              <div>
                <label className="block text-sm font-bold mb-1.5">{isGiftOrder ? 'שם מקבל המתנה' : 'שם מלא'}</label>
                <Input placeholder={isGiftOrder ? 'שם מקבל המתנה' : 'הכנס שם מלא'} value={customerName} onChange={e => setCustomerName(e.target.value)} className="h-13 text-base rounded-2xl" />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1.5">מספר טלפון</label>
                <Input placeholder="050-0000000" value={customerPhone} onChange={e => setCustomerPhone(formatPhone(e.target.value))} type="tel" className="h-13 text-base rounded-2xl text-right" dir="ltr" />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1.5">כתובת</label>
                <AddressAutocomplete value={customerAddress} onChange={setCustomerAddress} className="h-13 text-base rounded-2xl" />
                <div className="mt-2 p-3 bg-accent/8 border border-accent/15 rounded-2xl flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-accent flex-shrink-0" />
                  <p className="text-xs text-muted-foreground">
                    <span className="font-bold text-foreground">אזור שירות:</span> השרון, המרכז וגוש דן
                  </p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold mb-1.5">כתובת אימייל <span className="text-muted-foreground font-normal">(לא חובה)</span></label>
                <Input placeholder="email@example.com" value={customerEmail} onChange={e => setCustomerEmail(e.target.value)} type="email" className="h-13 text-base rounded-2xl" dir="ltr" />
              </div>
            </div>
          </div>
        )}

        {/* ═══ STEP: Payment / Summary ═══ */}
        {step === 'payment' && selectedModel && (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center">
              <h2 className="text-3xl font-extrabold mb-1">סיכום הזמנה</h2>
              <p className="text-muted-foreground">אישור ותשלום מקדמה</p>
            </div>

            {/* Order summary */}
            <Card className="p-5 space-y-4">
              <div className="flex items-center gap-4">
                <img src={getColorImage()} alt={selectedModel.name} className="w-16 h-16 object-contain" />
                <div>
                  <h3 className="font-bold text-lg">{selectedModel.name}</h3>
                  <p className="text-sm text-muted-foreground">{selectedStorage} · {selectedColor?.name}</p>
                </div>
              </div>
              <div className="border-t border-border pt-3 space-y-2 text-sm">
                <div className="flex justify-between"><span>מכשיר</span><span className="font-medium">₪{getPrice().toLocaleString()}</span></div>
                <div className="flex justify-between text-primary"><span>חבילת אביזרים</span><span className="font-medium">כלול ✓</span></div>
                <div className="flex justify-between text-primary"><span>העברת נתונים</span><span className="font-medium">כלול ✓</span></div>
                <div className="flex justify-between text-primary"><span>משלוח עד הבית</span><span className="font-medium">חינם ✓</span></div>
              </div>
              <div className="border-t border-border pt-3 flex justify-between items-center">
                <span className="font-bold text-lg">סה״כ</span>
                <span className="text-2xl font-black text-primary">₪{getPrice().toLocaleString()}</span>
              </div>
            </Card>

            {/* Schedule summary */}
            <Card className="p-4 bg-muted/50 flex items-center gap-3">
              <Calendar className="w-5 h-5 text-primary flex-shrink-0" />
              <div>
                <p className="text-sm font-medium">{formatSelectedDateTime()}</p>
                <p className="text-xs text-muted-foreground">נגיע עד אליך עם המכשיר</p>
              </div>
            </Card>

            {/* Deposit explanation */}
            <Card className="p-5 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20 space-y-3">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-primary" />
                <h3 className="font-bold">מקדמה ₪500</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                המקדמה מבטיחה את המכשיר עבורכם ומאפשרת לנו להזמין אותו מיידית. 
                יתרת התשלום תשולם בעת קבלת המכשיר – במזומן, בכרטיס אשראי, או בביט.
              </p>
              <div className="flex items-center gap-2 pt-1">
                <Shield className="w-4 h-4 text-success" />
                <p className="text-xs text-success font-medium">המקדמה מוחזרת במלואה אם לא נוכל לספק את המכשיר</p>
              </div>
            </Card>

            <p className="text-center text-xs text-muted-foreground">
              🔒 תשלום מאובטח · נציג ייצור איתכם קשר תוך שעה
            </p>
          </div>
        )}
      </main>

      {/* ═══ Sticky Bottom CTA ═══ */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-lg border-t border-border/50 px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
        <div className="max-w-lg mx-auto">
          {step === 'hero' && (
            <div className="space-y-1">
              <Button size="lg" className="w-full h-14 text-lg font-bold rounded-2xl gap-2 shadow-lg shadow-primary/25" onClick={() => goToStep('model')}>
                בואו נתחיל
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <p className="text-center text-xs text-muted-foreground">החל מ-₪3,899 · תשלום מקדמה בלבד</p>
            </div>
          )}

          {step === 'color' && selectedColor && (
            <Button className="w-full h-14 text-lg font-bold rounded-2xl gap-2 shadow-lg shadow-primary/25" onClick={() => goToStep('schedule')}>
              המשך
              <ArrowLeft className="w-5 h-5" />
            </Button>
          )}

          {step === 'schedule' && selectedDate && selectedTimeSlot && (
            <Button className="w-full h-14 text-lg font-bold rounded-2xl gap-2 shadow-lg shadow-primary/25" onClick={() => goToStep('details')}>
              המשך לפרטים
              <ArrowLeft className="w-5 h-5" />
            </Button>
          )}

          {step === 'details' && (
            <Button className="w-full h-14 text-lg font-bold rounded-2xl gap-2 shadow-lg shadow-primary/25" onClick={() => goToStep('payment')} disabled={!customerName || !customerPhone || !customerAddress}>
              לסיכום ותשלום
              <ArrowLeft className="w-5 h-5" />
            </Button>
          )}

          {step === 'payment' && (
            <Button size="lg" className="w-full h-14 text-lg font-bold rounded-2xl gap-2 shadow-lg shadow-primary/25" onClick={handleSubmitOrder} disabled={isSubmitting}>
              {isSubmitting ? (
                <><span className="animate-spin">⏳</span> שולח הזמנה...</>
              ) : (
                <>שלם מקדמה ₪500 <ArrowLeft className="w-5 h-5" /></>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DevicePurchase;
