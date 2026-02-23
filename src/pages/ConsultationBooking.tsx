import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Phone, Clock, Star, Shield, CheckCircle2, ArrowRight, CreditCard, Crown } from 'lucide-react';
import { useRepairStore } from '@/store/repairStore';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import Logo from '@/components/Logo';
import { cn } from '@/lib/utils';
import TestimonialsSlider from '@/components/TestimonialsSlider';

type ConsultationType = 'free' | 'paid' | null;

const FREE_SLOTS = ['08:30', '09:00', '09:30', '10:00'];
const PAID_SLOTS = [
  '08:30', '09:30', '10:30', '11:30', '12:30',
  '13:30', '14:30', '15:30', '16:30', '17:30', '18:30', '19:30', '20:00',
];
const PAID_PRICE = 149;

const consultationReviews = [
  { name: 'אורית כ.', text: 'התקשרתי בקשר לאייפון שנתקע, הטכנאי הדריך אותי בטלפון ופתר את הבעיה תוך דקות!', date: 'ינואר 2026', source: 'google' as const },
  { name: 'יוסי ד.', text: 'שיחת ייעוץ מדהימה. חסכו לי נסיעה למעבדה — הבעיה נפתרה מרחוק.', date: 'דצמבר 2025', source: 'google' as const },
  { name: 'מיכל ר.', text: 'הטכנאי הבכיר ידע בדיוק מה הבעיה וניתב אותי לפתרון מהיר. שווה כל שקל!', date: 'נובמבר 2025', source: 'midrag' as const },
  { name: 'עמית ש.', text: 'חשבתי שאצטרך להחליף מכשיר, אחרי שיחה של 10 דקות הכל עובד מעולה.', date: 'אוקטובר 2025', source: 'easy' as const },
  { name: 'רונית ל.', text: 'פתרו לי בעיה שאפל עצמם לא הצליחו. מומחים אמיתיים!', date: 'ינואר 2026', source: 'midrag' as const },
];

const ConsultationBooking = () => {
  const [step, setStep] = useState<'choose' | 'schedule' | 'details' | 'done'>('choose');
  const [consultationType, setConsultationType] = useState<ConsultationType>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [deviceModel, setDeviceModel] = useState('');
  const [issueDescription, setIssueDescription] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addOrder } = useRepairStore();

  const getTomorrowDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  };

  const getMaxDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().split('T')[0];
  };

  const slots = consultationType === 'free' ? FREE_SLOTS : PAID_SLOTS;

  const handleChoose = (type: ConsultationType) => {
    setConsultationType(type);
    setStep('schedule');
  };

  const handleScheduleNext = () => {
    if (selectedDate && selectedTime) setStep('details');
  };

  const isDetailsValid = customerName.trim() && customerPhone.trim() && customerEmail.trim() && deviceModel.trim() && issueDescription.trim();

  const handleSubmit = async () => {
    if (!isDetailsValid) {
      toast.error('נא למלא את כל שדות החובה');
      return;
    }
    setIsSubmitting(true);
    try {
      const label = consultationType === 'free' ? 'שיחת ייעוץ חינם (עד 5 דק׳)' : `שיחת ייעוץ בתשלום (עד 30 דק׳) - ₪${PAID_PRICE}`;
      const notes = [
        `סוג: ${label}`,
        `מועד: ${selectedDate} בשעה ${selectedTime}`,
        `דגם: ${deviceModel}`,
        `תיאור: ${issueDescription}`,
        additionalNotes ? `הערות: ${additionalNotes}` : '',
      ].filter(Boolean);

      if (consultationType === 'paid') {
        notes.push('⚠️ התשלום ייגבה לפני השיחה');
      }

      await addOrder({
        customerPhone,
        customerName,
        customerAddress: '',
        customerEmail,
        deviceType: `שיחת ייעוץ - ${deviceModel}`,
        issueDescription: label,
        status: 'pending',
        repairPrice: consultationType === 'paid' ? PAID_PRICE : 0,
        accessories: [],
        notes,
        wantsPromotions: false,
      } as any);

      try {
        await supabase.functions.invoke('send-order-notifications', {
          body: {
            customerName,
            customerPhone,
            customerEmail,
            customerAddress: '',
            deviceType: `שיחת ייעוץ - ${deviceModel}`,
            repairType: label,
            repairPrice: consultationType === 'paid' ? PAID_PRICE : 0,
            scheduledTime: `${selectedDate} בשעה ${selectedTime}`,
            notes: issueDescription + (additionalNotes ? `\n${additionalNotes}` : ''),
            leadSource: 'consultation',
          },
        });
      } catch (e) { console.error('Notification error:', e); }

      setStep('done');
    } catch (e) {
      toast.error('שגיאה בשליחה, נסו שנית');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (step === 'done') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 flex items-center justify-center p-6">
        <div className="text-center max-w-sm animate-scale-in">
          <div className="text-6xl mb-4">✅</div>
          <h1 className="text-2xl font-extrabold mb-2">הבקשה התקבלה!</h1>
          <p className="text-muted-foreground mb-1">
            {consultationType === 'free' ? 'שיחת הייעוץ החינמית' : 'שיחת הייעוץ'} נקבעה ל-{selectedDate} בשעה {selectedTime}
          </p>
          {consultationType === 'paid' && (
            <p className="text-sm text-warning font-medium mt-2">
              <CreditCard className="w-4 h-4 inline ml-1" />
              ניצור קשר לגביית התשלום לפני השיחה
            </p>
          )}
          <p className="text-sm text-muted-foreground mt-2">פרטי הבקשה נשלחו ל-{customerEmail}</p>
          <p className="text-sm text-muted-foreground mt-4">ניצור אתכם קשר בהקדם!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/30 max-w-lg mx-auto px-5 py-8" dir="rtl">
      <div className="text-center mb-8 animate-fade-in">
        <Logo size="md" className="mx-auto mb-4" />
        <h1 className="text-3xl font-extrabold tracking-tight">שיחת ייעוץ תיקונים</h1>
        <p className="text-muted-foreground text-sm mt-2">דברו עם מומחי האייפון שלנו — בטלפון</p>
      </div>

      {/* Step: Choose type */}
      {step === 'choose' && (
        <div className="space-y-4 animate-fade-in">
          {/* Free */}
          <Card
            className="p-5 cursor-pointer border-2 hover:border-primary/50 transition-all active:scale-[0.98]"
            onClick={() => handleChoose('free')}
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-success/10 rounded-2xl flex items-center justify-center flex-shrink-0">
                <Phone className="w-6 h-6 text-success" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-lg">ייעוץ חינם</h3>
                  <span className="bg-success/10 text-success text-xs font-bold px-2 py-0.5 rounded-full">חינם!</span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  שיחה קצרה עד 5 דקות — התייעצו על כל תקלה, בעיה או שאלה בנושא האייפון שלכם. ללא עלות, ללא התחייבות.
                </p>
                <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> עד 5 דק׳</span>
                  <span className="flex items-center gap-1"><Shield className="w-3.5 h-3.5" /> 08:30–10:00</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Paid - Golden premium */}
          <Card
            className="p-5 cursor-pointer border-2 border-amber-300/50 hover:border-amber-400 transition-all active:scale-[0.98] relative overflow-hidden bg-gradient-to-br from-amber-50/80 via-card to-amber-50/30 dark:from-amber-950/20 dark:via-card dark:to-amber-900/10"
            onClick={() => handleChoose('paid')}
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500" />
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-900/40 dark:to-amber-800/30 rounded-2xl flex items-center justify-center flex-shrink-0">
                <Crown className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-lg text-amber-900 dark:text-amber-200">ייעוץ מקצועי מעמיק</h3>
                  <span className="bg-gradient-to-r from-amber-400 to-yellow-400 text-amber-900 text-xs font-bold px-2.5 py-0.5 rounded-full shadow-sm">₪{PAID_PRICE}</span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  שיחה מעמיקה עד 30 דקות עם הטכנאים הבכירים ביותר שלנו — מומחים עם ניסיון של שנים שפותרים מקרים שאפילו מומחי Apple העולמיים לא מצליחים.
                </p>
                <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> עד 30 דק׳</span>
                  <span className="flex items-center gap-1"><Shield className="w-3.5 h-3.5" /> 08:30–21:00</span>
                </div>
                <p className="text-xs text-amber-700 dark:text-amber-400 mt-2 font-medium flex items-center gap-1">
                  <CreditCard className="w-3.5 h-3.5" />
                  התשלום ייגבה לפני השיחה
                </p>
              </div>
            </div>
          </Card>

          {/* Consultation testimonials */}
          <div className="pt-4">
            <h3 className="text-sm font-bold text-center mb-3 text-muted-foreground">💬 תקלות שנפתרו בשיחות ייעוץ</h3>
            <ConsultationReviews />
          </div>
        </div>
      )}

      {/* Step: Schedule */}
      {step === 'schedule' && (
        <div className="space-y-6 animate-fade-in">
          <button onClick={() => setStep('choose')} className="flex items-center gap-1 text-sm text-primary font-medium">
            <ArrowRight className="w-4 h-4" /> חזרה
          </button>

          <div className="text-center">
            <h2 className="text-xl font-bold mb-1">בחרו מועד</h2>
            <p className="text-sm text-muted-foreground">
              {consultationType === 'free' ? 'שיחת ייעוץ חינם (עד 5 דק׳)' : `שיחת ייעוץ מקצועי (₪${PAID_PRICE})`}
            </p>
          </div>

          <div>
            <label className="text-sm font-semibold mb-2 block text-right">תאריך</label>
            <Input
              type="date"
              min={getTomorrowDate()}
              max={getMaxDate()}
              value={selectedDate}
              onChange={e => { setSelectedDate(e.target.value); setSelectedTime(''); }}
              className="text-center"
            />
          </div>

          {selectedDate && (
            <div>
              <label className="text-sm font-semibold mb-2 block text-right">שעה</label>
              <div className="grid grid-cols-3 gap-2">
                {slots.map(time => (
                  <button
                    key={time}
                    onClick={() => setSelectedTime(time)}
                    className={cn(
                      "py-3 rounded-xl text-sm font-semibold transition-all",
                      selectedTime === time
                        ? "bg-primary text-primary-foreground shadow-md"
                        : "bg-muted hover:bg-muted/80 text-foreground"
                    )}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>
          )}

          {selectedDate && selectedTime && (
            <Button onClick={handleScheduleNext} className="w-full h-12 rounded-2xl font-bold text-base">
              המשך
            </Button>
          )}
        </div>
      )}

      {/* Step: Details */}
      {step === 'details' && (
        <div className="space-y-5 animate-fade-in">
          <button onClick={() => setStep('schedule')} className="flex items-center gap-1 text-sm text-primary font-medium">
            <ArrowRight className="w-4 h-4" /> חזרה
          </button>

          <div className="text-center">
            <h2 className="text-xl font-bold mb-1">פרטים ליצירת קשר</h2>
            <p className="text-sm text-muted-foreground">{selectedDate} בשעה {selectedTime}</p>
            {consultationType === 'paid' && (
              <p className="text-sm font-semibold text-amber-600 dark:text-amber-400 mt-1">מחיר שיחת יעוץ: ₪{PAID_PRICE}</p>
            )}
          </div>

          <div className="space-y-3 text-right">
            <div>
              <label className="text-sm font-semibold mb-1.5 block">שם מלא *</label>
              <Input
                placeholder="שם מלא"
                value={customerName}
                onChange={e => setCustomerName(e.target.value)}
                className="h-12 rounded-xl text-right"
              />
            </div>
            <div>
              <label className="text-sm font-semibold mb-1.5 block">טלפון *</label>
              <Input
                placeholder="טלפון"
                type="tel"
                value={customerPhone}
                onChange={e => setCustomerPhone(e.target.value)}
                className="h-12 rounded-xl"
                dir="ltr"
              />
            </div>
            <div>
              <label className="text-sm font-semibold mb-1.5 block">אימייל *</label>
              <Input
                placeholder="כתובת אימייל"
                type="email"
                value={customerEmail}
                onChange={e => setCustomerEmail(e.target.value)}
                className="h-12 rounded-xl"
                dir="ltr"
              />
              <p className="text-[11px] text-muted-foreground mt-1">פרטי הבקשה ישלחו לכתובת זו</p>
            </div>
            <div>
              <label className="text-sm font-semibold mb-1.5 block">דגם האייפון *</label>
              <Input
                placeholder="לדוגמה: iPhone 15 Pro Max"
                value={deviceModel}
                onChange={e => setDeviceModel(e.target.value)}
                className="h-12 rounded-xl text-right"
              />
            </div>
            <div>
              <label className="text-sm font-semibold mb-1.5 block">תיאור התקלה או הנושא שתרצו להתייעץ עליו *</label>
              <Textarea
                placeholder="תארו בקצרה את הבעיה, התקלה או השאלה..."
                value={issueDescription}
                onChange={e => setIssueDescription(e.target.value)}
                className="rounded-xl text-right min-h-[80px]"
              />
            </div>
            <div>
              <label className="text-sm font-semibold mb-1.5 block">הערות נוספות (אופציונלי)</label>
              <Input
                placeholder="מידע נוסף שיכול לעזור..."
                value={additionalNotes}
                onChange={e => setAdditionalNotes(e.target.value)}
                className="h-12 rounded-xl text-right"
              />
            </div>
          </div>

          {consultationType === 'paid' && (
            <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-300/50 rounded-xl p-3 text-center">
              <p className="text-sm font-medium text-amber-700 dark:text-amber-400 flex items-center justify-center gap-1.5">
                <CreditCard className="w-4 h-4" />
                התשלום (₪{PAID_PRICE}) ייגבה לפני השיחה
              </p>
            </div>
          )}

          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !isDetailsValid}
            className="w-full h-12 rounded-2xl font-bold text-base"
          >
            {isSubmitting ? 'שולח...' : 'קבעו שיחה'}
          </Button>
        </div>
      )}
    </div>
  );
};

/* Mini testimonials for consultation page */
const ConsultationReviews = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    const timer = setInterval(() => {
      const nextIdx = (activeIdx + 1) % consultationReviews.length;
      const card = container.children[nextIdx] as HTMLElement;
      if (card) {
        container.scrollTo({ left: card.offsetLeft - 12, behavior: 'smooth' });
      }
      setActiveIdx(nextIdx);
    }, 4000);
    return () => clearInterval(timer);
  }, [activeIdx]);

  const handleScroll = () => {
    const container = scrollRef.current;
    if (!container) return;
    const cardWidth = (container.children[0] as HTMLElement)?.offsetWidth || 200;
    const idx = Math.round(container.scrollLeft / (cardWidth + 8));
    setActiveIdx(Math.min(idx, consultationReviews.length - 1));
  };

  return (
    <div>
      <div ref={scrollRef} onScroll={handleScroll} className="flex gap-2 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {consultationReviews.map((t, i) => (
          <div key={i} className="snap-start flex-shrink-0 w-[75%] bg-card border border-border rounded-xl px-3 py-2.5">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Star key={j} className="w-3 h-3 fill-warning text-warning" />
                ))}
              </div>
            </div>
            <p className="text-foreground leading-relaxed mb-1.5 text-sm font-medium">"{t.text}"</p>
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-semibold text-foreground">{t.name}</span>
              <CheckCircle2 className="w-3 h-3 text-success" />
              <span className="text-[10px] text-success font-medium">מאומת</span>
              <span className="text-[10px] text-muted-foreground">· {t.date}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-center gap-1.5 mt-1">
        {consultationReviews.map((_, i) => (
          <div key={i} className={`h-1 rounded-full transition-all ${i === activeIdx ? 'bg-primary w-3' : 'bg-muted-foreground/20 w-1.5'}`} />
        ))}
      </div>
    </div>
  );
};



export default ConsultationBooking;
