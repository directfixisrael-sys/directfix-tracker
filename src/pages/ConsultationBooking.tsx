import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Phone, Clock, Star, Shield, CheckCircle2, ArrowRight, CreditCard } from 'lucide-react';
import { useRepairStore } from '@/store/repairStore';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import Logo from '@/components/Logo';
import { cn } from '@/lib/utils';

type ConsultationType = 'free' | 'paid' | null;

const FREE_SLOTS = ['08:30', '09:00', '09:30', '10:00'];
const PAID_SLOTS = [
  '08:30', '09:30', '10:30', '11:30', '12:30',
  '13:30', '14:30', '15:30', '16:30', '17:30', '18:30', '19:30', '20:00',
];
const PAID_PRICE = 149;

const ConsultationBooking = () => {
  const [step, setStep] = useState<'choose' | 'schedule' | 'details' | 'done'>('choose');
  const [consultationType, setConsultationType] = useState<ConsultationType>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [issueDescription, setIssueDescription] = useState('');
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

  const handleSubmit = async () => {
    if (!customerName.trim() || !customerPhone.trim()) {
      toast.error('נא למלא שם וטלפון');
      return;
    }
    setIsSubmitting(true);
    try {
      const label = consultationType === 'free' ? 'שיחת ייעוץ חינם (עד 5 דק׳)' : `שיחת ייעוץ בתשלום (עד 30 דק׳) - ₪${PAID_PRICE}`;
      const notes = [
        `סוג: ${label}`,
        `מועד: ${selectedDate} בשעה ${selectedTime}`,
        issueDescription ? `תיאור: ${issueDescription}` : '',
      ].filter(Boolean);

      if (consultationType === 'paid') {
        notes.push('⚠️ התשלום ייגבה לפני השיחה');
      }

      await addOrder({
        customerPhone,
        customerName,
        customerAddress: '',
        deviceType: 'שיחת ייעוץ',
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
            customerAddress: '',
            deviceType: 'שיחת ייעוץ',
            repairType: label,
            repairPrice: consultationType === 'paid' ? PAID_PRICE : 0,
            scheduledTime: `${selectedDate} בשעה ${selectedTime}`,
            notes: issueDescription || '',
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
          <p className="text-sm text-muted-foreground mt-4">ניצור אתכם קשר בהקדם!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/30 max-w-lg mx-auto px-5 py-8" dir="rtl">
      <div className="text-center mb-8 animate-fade-in">
        <Logo size="md" className="mx-auto mb-4" />
        <h1 className="text-3xl font-extrabold tracking-tight">שיחת ייעוץ טכנית</h1>
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

          {/* Paid */}
          <Card
            className="p-5 cursor-pointer border-2 hover:border-primary/50 transition-all active:scale-[0.98] relative overflow-hidden"
            onClick={() => handleChoose('paid')}
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-primary/60" />
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center flex-shrink-0">
                <Star className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-lg">ייעוץ מקצועי מעמיק</h3>
                  <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-0.5 rounded-full">₪{PAID_PRICE}</span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  שיחה מעמיקה עד 30 דקות עם הטכנאים הבכירים ביותר שלנו — מומחים עם ניסיון של שנים שפותרים מקרים שאפילו מומחי Apple העולמיים לא מצליחים.
                </p>
                <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> עד 30 דק׳</span>
                  <span className="flex items-center gap-1"><Shield className="w-3.5 h-3.5" /> 08:30–21:00</span>
                </div>
                <p className="text-xs text-warning mt-2 font-medium flex items-center gap-1">
                  <CreditCard className="w-3.5 h-3.5" />
                  התשלום ייגבה לפני השיחה
                </p>
              </div>
            </div>
          </Card>
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
            <label className="text-sm font-semibold mb-2 block">תאריך</label>
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
              <label className="text-sm font-semibold mb-2 block">שעה</label>
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
          </div>

          <div className="space-y-3">
            <Input
              placeholder="שם מלא"
              value={customerName}
              onChange={e => setCustomerName(e.target.value)}
              className="h-12 rounded-xl"
            />
            <Input
              placeholder="טלפון"
              type="tel"
              value={customerPhone}
              onChange={e => setCustomerPhone(e.target.value)}
              className="h-12 rounded-xl"
              dir="ltr"
            />
            <Input
              placeholder="תארו בקצרה את הבעיה / השאלה (אופציונלי)"
              value={issueDescription}
              onChange={e => setIssueDescription(e.target.value)}
              className="h-12 rounded-xl"
            />
          </div>

          {consultationType === 'paid' && (
            <div className="bg-warning/10 border border-warning/30 rounded-xl p-3 text-center">
              <p className="text-sm font-medium text-warning flex items-center justify-center gap-1.5">
                <CreditCard className="w-4 h-4" />
                התשלום (₪{PAID_PRICE}) ייגבה לפני השיחה
              </p>
            </div>
          )}

          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !customerName.trim() || !customerPhone.trim()}
            className="w-full h-12 rounded-2xl font-bold text-base"
          >
            {isSubmitting ? 'שולח...' : 'קבעו שיחה'}
          </Button>
        </div>
      )}
    </div>
  );
};

export default ConsultationBooking;
