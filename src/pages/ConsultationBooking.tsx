import { useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Phone, Clock, Star, Shield, CheckCircle2, ArrowRight, CreditCard, Crown, Calendar, Loader2, ChevronDown, Camera } from 'lucide-react';
import { useRepairStore } from '@/store/repairStore';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import Logo from '@/components/Logo';
import { cn } from '@/lib/utils';

import testimonial1 from '@/assets/testimonial-1.png';
import testimonial2 from '@/assets/testimonial-2.jpg';
import testimonial3 from '@/assets/testimonial-3.jpg';
import testimonial4 from '@/assets/testimonial-4.jpg';
import testimonial5 from '@/assets/testimonial-5.jpg';
import testimonial6 from '@/assets/testimonial-6.jpg';
import testimonial7 from '@/assets/testimonial-7.jpg';

const customerPhotos = [
  testimonial1, testimonial2, testimonial3, testimonial4,
  testimonial5, testimonial6, testimonial7,
];

type ConsultationType = 'free' | 'paid' | null;

const FREE_SLOTS = ['08:30', '09:00', '09:30', '10:00'];
const PAID_SLOTS = [
  '08:30', '09:30', '10:30', '11:30', '12:30',
  '13:30', '14:30', '15:30', '16:30', '17:30', '18:30', '19:30', '20:00',
];
const PAID_PRICE = 149;

const hebrewDays = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];

const consultationReviews = [
  { name: 'אורית כ.', text: 'התקשרתי בקשר לאייפון שנתקע, הטכנאי הדריך אותי בטלפון ופתר את הבעיה תוך דקות!', date: 'ינואר 2026', source: 'google' as const },
  { name: 'יוסי ד.', text: 'שיחת ייעוץ מדהימה. חסכו לי נסיעה למעבדה — הבעיה נפתרה מרחוק.', date: 'דצמבר 2025', source: 'google' as const },
  { name: 'מיכל ר.', text: 'הטכנאי הבכיר ידע בדיוק מה הבעיה וניתב אותי לפתרון מהיר. שווה כל שקל!', date: 'נובמבר 2025', source: 'midrag' as const },
  { name: 'עמית ש.', text: 'חשבתי שאצטרך להחליף מכשיר, אחרי שיחה של 10 דקות הכל עובד מעולה.', date: 'אוקטובר 2025', source: 'easy' as const },
  { name: 'רונית ל.', text: 'פתרו לי בעיה שאפל עצמם לא הצליחו. מומחים אמיתיים!', date: 'ינואר 2026', source: 'midrag' as const },
];

const ConsultationBooking = () => {
  const [searchParams] = useSearchParams();
  const paymentSuccess = searchParams.get('payment') === 'success';
  const returnedOrderNumber = searchParams.get('order');

  const [step, setStep] = useState<'choose' | 'schedule' | 'details' | 'processing' | 'done'>(() => {
    if (paymentSuccess && returnedOrderNumber) return 'done';
    return 'choose';
  });
  const [consultationType, setConsultationType] = useState<ConsultationType>(() => {
    if (paymentSuccess) return 'paid';
    return null;
  });
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [deviceModel, setDeviceModel] = useState('');
  const [issueDescription, setIssueDescription] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedOrderNumber, setCompletedOrderNumber] = useState<number | null>(() => {
    if (returnedOrderNumber) return parseInt(returnedOrderNumber);
    return null;
  });
  const { addOrder } = useRepairStore();

  // Get available dates: tomorrow to +14 days, skip Friday (5) and Saturday (6)
  const getAvailableDates = () => {
    const dates: Date[] = [];
    const today = new Date();
    let added = 0;
    let i = 1;
    while (added < 7) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const day = date.getDay();
      if (day !== 5 && day !== 6) {
        dates.push(date);
        added++;
      }
      i++;
    }
    return dates;
  };

  const slots = consultationType === 'free' ? FREE_SLOTS : PAID_SLOTS;

  const getAvailableSlots = () => {
    if (!selectedDate) return [];
    const now = new Date();
    const isTomorrow = (() => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      return selectedDate.toDateString() === tomorrow.toDateString();
    })();
    const isToday = selectedDate.toDateString() === now.toDateString();

    return slots.filter(time => {
      if (isToday || isTomorrow) {
        const [hours, minutes] = time.split(':').map(Number);
        const slotDate = new Date(selectedDate);
        slotDate.setHours(hours, minutes, 0, 0);
        return slotDate.getTime() > now.getTime() + 30 * 60 * 1000;
      }
      return true;
    });
  };

  const handleChoose = (type: ConsultationType) => {
    setConsultationType(type);
    setStep('schedule');
    setSelectedDate(null);
    setSelectedTime('');
  };

  const handleScheduleNext = () => {
    if (selectedDate && selectedTime) setStep('details');
  };

  const formatSelectedDate = () => {
    if (!selectedDate) return '';
    const dayName = hebrewDays[selectedDate.getDay()];
    return `יום ${dayName}, ${selectedDate.getDate()}/${selectedDate.getMonth() + 1}`;
  };

  const isDetailsValid = customerName.trim() && customerPhone.trim() && customerEmail.trim() && deviceModel.trim() && issueDescription.trim();

  const handleSubmit = async () => {
    if (!isDetailsValid) {
      toast.error('נא למלא את כל שדות החובה');
      return;
    }
    setIsSubmitting(true);
    try {
      const dateStr = selectedDate ? `${selectedDate.getDate()}/${selectedDate.getMonth() + 1}` : '';
      const label = consultationType === 'free' ? 'שיחת ייעוץ חינם (עד 5 דק׳)' : `שיחת ייעוץ בתשלום (עד 30 דק׳) - ₪${PAID_PRICE}`;
      const notes = [
        `סוג: ${label}`,
        `מועד: ${dateStr} בשעה ${selectedTime}`,
        `דגם: ${deviceModel}`,
        `תיאור: ${issueDescription}`,
        additionalNotes ? `הערות: ${additionalNotes}` : '',
      ].filter(Boolean);

      if (consultationType === 'paid') {
        notes.push('ממתין לתשלום');
      }

      const orderData = await addOrder({
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
        leadSource: 'consultation',
      } as any);

      if (!orderData) {
        throw new Error('Failed to create order');
      }

      const orderNumber = orderData.order_number;

      // Send notifications
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
            scheduledTime: `${dateStr} בשעה ${selectedTime}`,
            notes: issueDescription + (additionalNotes ? `\n${additionalNotes}` : ''),
            leadSource: 'consultation',
          },
        });
      } catch (e) { console.error('Notification error:', e); }

      // For paid consultations: generate PayPlus link and redirect
      if (consultationType === 'paid') {
        setStep('processing');
        try {
          const currentUrl = window.location.origin + window.location.pathname;
          const successUrl = `${currentUrl}?payment=success&order=${orderNumber}`;

          const { data, error } = await supabase.functions.invoke('payplus-create-payment', {
            body: {
              amount: PAID_PRICE,
              description: `שיחת ייעוץ מקצועי - הזמנה #${orderNumber}`,
              customerName,
              customerPhone,
              customerEmail,
              orderId: orderData.id,
              moreInfo: `consultation-${orderNumber}`,
              successUrl,
            },
          });

          if (error) throw error;

          if (data?.paymentLink) {
            // Save payment link to the order
            await supabase
              .from('orders')
              .update({ payment_link: data.paymentLink, payment_status: 'pending' })
              .eq('id', orderData.id);

            // Redirect to PayPlus payment page
            window.location.href = data.paymentLink;
            return;
          } else {
            throw new Error(data?.error || 'Failed to generate payment link');
          }
        } catch (err: any) {
          console.error('Payment link error:', err);
          toast.error('שגיאה ביצירת לינק תשלום. ניצור קשר בהקדם.');
          setCompletedOrderNumber(orderNumber);
          setStep('done');
        }
      } else {
        // Free consultation - go straight to done
        setCompletedOrderNumber(orderNumber);
        setStep('done');
      }
    } catch (e) {
      console.error('Submit error:', e);
      toast.error('שגיאה בשליחה, נסו שנית');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Done screen
  if (step === 'done') {
    const dateStr = selectedDate ? `${selectedDate.getDate()}/${selectedDate.getMonth() + 1}` : '';
    const isPaid = consultationType === 'paid';
    const orderNum = completedOrderNumber || returnedOrderNumber;
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 flex items-center justify-center p-6" dir="rtl">
        <div className="text-center max-w-sm animate-scale-in">
          <div className="text-6xl mb-4">{isPaid && paymentSuccess ? '!' : '✓'}</div>
          <h1 className="text-2xl font-extrabold mb-2">
            {isPaid && paymentSuccess ? 'התשלום בוצע בהצלחה!' : 'הבקשה התקבלה!'}
          </h1>
          {orderNum && (
            <div className="bg-primary/10 rounded-2xl px-4 py-3 mb-4 inline-block">
              <p className="text-sm text-muted-foreground">מספר הזמנה</p>
              <p className="text-3xl font-extrabold text-primary">#{orderNum}</p>
            </div>
          )}
          <p className="text-muted-foreground mb-1">
            {isPaid ? 'שיחת הייעוץ המקצועי נקבעה' : 'שיחת הייעוץ החינמית נקבעה'}
            {dateStr ? ` ל-${dateStr} בשעה ${selectedTime}` : ''}
          </p>
          {isPaid && paymentSuccess && (
            <p className="text-sm text-success font-medium mt-2 flex items-center justify-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              התשלום התקבל — ₪{PAID_PRICE}
            </p>
          )}
          <p className="text-sm text-muted-foreground mt-4">ניצור אתכם קשר בהקדם!</p>
        </div>
      </div>
    );
  }

  // Processing payment screen
  if (step === 'processing') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 flex items-center justify-center p-6" dir="rtl">
        <div className="text-center max-w-sm animate-fade-in">
          <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">מעבירים לדף התשלום...</h2>
          <p className="text-muted-foreground text-sm">תועברו בשניות לדף התשלום המאובטח</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/30 max-w-lg mx-auto px-5 py-8" dir="rtl">
      <div className="text-center mb-8 animate-fade-in">
        <Logo size="md" className="mx-auto mb-4" />
        <h1 className="text-3xl font-extrabold tracking-tight">שיחת ייעוץ למכשירי Apple</h1>
        <p className="text-muted-foreground text-sm mt-2">דברו עם מומחי האייפון שלנו — בטלפון</p>
      </div>

      {/* Step: Choose type */}
      {step === 'choose' && (
        <div className="space-y-4 animate-fade-in">
          {/* Duration circles */}
          <div className="flex justify-center gap-6 mb-6">
            <button
              onClick={() => handleChoose('free')}
              className="flex flex-col items-center gap-2 group"
            >
              <div className="w-20 h-20 rounded-full border-3 border-success bg-success/10 flex items-center justify-center transition-all group-hover:scale-105 group-hover:shadow-lg group-active:scale-95">
                <span className="text-lg font-extrabold text-success">5 דק׳</span>
              </div>
              <span className="text-sm font-bold text-foreground">ייעוץ חינם</span>
              <span className="text-[11px] text-success font-semibold">חינם!</span>
            </button>
            <button
              onClick={() => handleChoose('paid')}
              className="flex flex-col items-center gap-2 group"
            >
              <div className="w-20 h-20 rounded-full border-3 border-amber-400 bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/30 dark:to-amber-800/20 flex items-center justify-center transition-all group-hover:scale-105 group-hover:shadow-lg group-active:scale-95">
                <span className="text-lg font-extrabold text-amber-600 dark:text-amber-400">30 דק׳</span>
              </div>
              <span className="text-sm font-bold text-foreground">ייעוץ מומחה</span>
              <span className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold">₪{PAID_PRICE}</span>
            </button>
          </div>

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
            <h3 className="text-sm font-bold text-center mb-3 text-muted-foreground">תקלות שנפתרו בשיחות ייעוץ</h3>
            <ConsultationReviews />
          </div>
        </div>
      )}

      {/* Step: Schedule */}
      {step === 'schedule' && (
        <div className="space-y-6 animate-fade-in">
          <button onClick={() => { setStep('choose'); setConsultationType(null); }} className="flex items-center gap-1 text-sm text-primary font-medium">
            <ArrowRight className="w-4 h-4" /> חזרה
          </button>

          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-1.5 text-sm font-semibold mb-3">
              <Calendar className="w-4 h-4" />
              קביעת מועד
            </div>
            <h2 className="text-2xl font-extrabold mb-1">מתי נתקשר?</h2>
            <p className="text-sm text-muted-foreground">
              {consultationType === 'free' ? 'שיחת ייעוץ חינם (עד 5 דק׳)' : `שיחת ייעוץ מקצועי (₪${PAID_PRICE})`}
            </p>
          </div>

          {/* Date selection - card style like repairs */}
          <div>
            <label className="block text-sm font-bold mb-3">בחרו יום</label>
            <div className="grid grid-cols-4 gap-3">
              {getAvailableDates().map((date, index) => {
                const dayName = hebrewDays[date.getDay()];
                const isSelected = selectedDate?.toDateString() === date.toDateString();
                return (
                  <button
                    key={index}
                    onClick={() => { setSelectedDate(date); setSelectedTime(''); }}
                    className={cn(
                      "p-3 rounded-2xl border-2 text-center transition-all",
                      isSelected
                        ? "border-primary bg-primary/10 text-primary shadow-sm"
                        : "border-border hover:border-primary/40 hover:bg-muted/30"
                    )}
                  >
                    <div className="text-sm font-bold">{dayName}</div>
                    <div className="text-sm text-muted-foreground">{date.getDate()}/{date.getMonth() + 1}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Time slot selection - circle style */}
          {selectedDate && (
            <div className="animate-fade-in">
              <label className="block text-sm font-bold mb-3">בחרו שעה</label>
              <div className="flex flex-wrap gap-3 justify-center">
                {getAvailableSlots().length > 0 ? getAvailableSlots().map(time => {
                  const isSelected = selectedTime === time;
                  return (
                    <button
                      key={time}
                      onClick={() => setSelectedTime(time)}
                      className={cn(
                        "w-16 h-16 rounded-full flex items-center justify-center text-sm font-bold transition-all",
                        isSelected
                          ? "bg-primary text-primary-foreground shadow-md scale-105"
                          : "bg-muted hover:bg-muted/80 text-foreground hover:scale-105"
                      )}
                    >
                      {time}
                    </button>
                  );
                }) : (
                  <p className="text-sm text-muted-foreground text-center py-4">אין זמנים זמינים ביום זה, נסו יום אחר</p>
                )}
              </div>
            </div>
          )}

          {/* Selected summary */}
          {selectedDate && selectedTime && (
            <Card className="p-4 bg-primary/5 border-primary/20 animate-fade-in">
              <p className="text-lg text-center">
                <span className="text-muted-foreground">מועד נבחר: </span>
                <span className="font-semibold">{formatSelectedDate()} בשעה {selectedTime}</span>
              </p>
            </Card>
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
            <h2 className="text-xl font-bold mb-1">שיחת ייעוץ תיקונים</h2>
            {consultationType === 'paid' && (
              <p className="text-sm font-semibold text-amber-600 dark:text-amber-400 mt-1">מחיר שיחת יעוץ: ₪{PAID_PRICE}</p>
            )}
            <p className="text-sm text-muted-foreground mt-1">{formatSelectedDate()} בשעה {selectedTime}</p>
          </div>

          <div className="space-y-3 text-right">
            <h3 className="font-bold text-base">פרטים ליצירת קשר</h3>
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
                placeholder="050-0000000"
                type="tel"
                value={customerPhone}
                onChange={e => setCustomerPhone(e.target.value)}
                className="h-12 rounded-xl text-right"
                dir="ltr"
                style={{ textAlign: 'right' }}
              />
            </div>
            <div>
              <label className="text-sm font-semibold mb-1.5 block">אימייל *</label>
              <Input
                placeholder="כתובת אימייל"
                type="email"
                value={customerEmail}
                onChange={e => setCustomerEmail(e.target.value)}
                className="h-12 rounded-xl text-right"
                dir="ltr"
                style={{ textAlign: 'right' }}
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
                לאחר לחיצה תועברו לדף תשלום מאובטח (₪{PAID_PRICE})
              </p>
            </div>
          )}

          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !isDetailsValid}
            className={cn(
              "w-full h-12 rounded-2xl font-bold text-base",
              consultationType === 'paid' && "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white"
            )}
          >
            {isSubmitting ? 'שולח...' : consultationType === 'paid' ? `עברו לתשלום — ₪${PAID_PRICE}` : 'קבעו שיחה'}
          </Button>
        </div>
      )}
      {/* Testimonial Photos Gallery - on choose step */}
      {step === 'choose' && <TestimonialPhotoGallery />}
    </div>
  );
};

/* Collapsible photo gallery */
const TestimonialPhotoGallery = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedImg, setSelectedImg] = useState<string | null>(null);

  return (
    <div className="mt-6 animate-fade-in">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl border-2 border-border bg-card hover:bg-muted/30 transition-all"
      >
        <Camera className="w-4 h-4 text-primary" />
        <span className="font-bold text-sm">לקוחות מרוצים — גלריית תודות</span>
        <ChevronDown className={cn("w-4 h-4 text-muted-foreground transition-transform duration-300", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <div className="mt-3 animate-fade-in">
          <p className="text-center text-xs text-muted-foreground mb-3">תודות אמיתיות מלקוחות שקיבלו שירות</p>
          <div className="grid grid-cols-3 gap-2">
            {customerPhotos.map((src, i) => (
              <button
                key={i}
                onClick={() => setSelectedImg(src)}
                className="aspect-square rounded-xl overflow-hidden border-2 border-border hover:border-primary/50 transition-all hover:scale-[1.03] active:scale-95"
              >
                <img src={src} alt={`תודה מלקוח ${i + 1}`} className="w-full h-full object-cover" loading="lazy" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Lightbox */}
      {selectedImg && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setSelectedImg(null)}
        >
          <button
            onClick={() => setSelectedImg(null)}
            className="absolute top-4 left-4 w-10 h-10 rounded-full bg-card/80 flex items-center justify-center text-foreground font-bold text-lg z-10"
          >
            X
          </button>
          <img
            src={selectedImg}
            alt="תודה מלקוח"
            className="max-w-full max-h-[85vh] rounded-2xl object-contain"
            onClick={e => e.stopPropagation()}
          />
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
