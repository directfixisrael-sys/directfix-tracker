import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import Logo from '@/components/Logo';
import { cn } from '@/lib/utils';
import AddressAutocomplete from '@/components/AddressAutocomplete';
import {
  ArrowRight, Tablet, CheckCircle2, Calendar, Clock, Loader2, Phone,
  ChevronDown, ChevronUp, Eye, EyeOff, HelpCircle, Truck, Package, Info
} from 'lucide-react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger
} from '@/components/ui/dialog';
import {
import SEO from "@/components/SEO";
import { seo } from "@/lib/seoData";
  Collapsible, CollapsibleContent, CollapsibleTrigger
} from '@/components/ui/collapsible';

interface IPadModel {
  id: string;
  name: string;
  screen_price: number;
  series: string;
  has_display_option: boolean;
}

const TIME_SLOTS = [
  { label: '09:00 - 11:00', value: '09:00-11:00' },
  { label: '11:00 - 13:00', value: '11:00-13:00' },
  { label: '13:00 - 17:00', value: '13:00-17:00' },
  { label: '17:00 - 21:00', value: '17:00-21:00' },
];

const hebrewDays = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];

const iPadRepair = () => {
  const [step, setStep] = useState<'intro' | 'model' | 'issue' | 'schedule' | 'details' | 'processing' | 'done'>('intro');
  const [models, setModels] = useState<IPadModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedModel, setSelectedModel] = useState<IPadModel | null>(null);
  const [displayWorking, setDisplayWorking] = useState<boolean | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState('');
  const [blockedDates, setBlockedDates] = useState<any[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [orderNumber, setOrderNumber] = useState<number | null>(null);
  const [identifyOpen, setIdentifyOpen] = useState(false);
  const [currentLeadId, setCurrentLeadId] = useState<string | null>(null);
  const topRef = useRef<HTMLDivElement>(null);
  const timePickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      const [modelsRes, blockedRes] = await Promise.all([
        supabase.from('ipad_models').select('*').eq('is_active', true).order('sort_order'),
        supabase.from('blocked_dates').select('*'),
      ]);
      if (modelsRes.data) setModels(modelsRes.data);
      if (blockedRes.data) setBlockedDates(blockedRes.data);
      setLoading(false);
    };
    fetchData();
  }, []);

  useEffect(() => {
    topRef.current?.scrollIntoView({ behavior: 'instant', block: 'start' });
  }, [step]);

  const groupedModels = models.reduce<Record<string, IPadModel[]>>((acc, m) => {
    const key = m.series || 'Other';
    if (!acc[key]) acc[key] = [];
    acc[key].push(m);
    return acc;
  }, {});

  const getAvailableDates = () => {
    const dates: Date[] = [];
    const today = new Date();
    for (let i = 1; i <= 21; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const day = d.getDay();
      // Skip Friday (5) and Saturday (6)
      if (day === 5 || day === 6) continue;
      // Check blocked
      const dateStr = d.toISOString().split('T')[0];
      const isBlocked = blockedDates.some(b => b.date === dateStr && !b.start_time);
      if (!isBlocked) dates.push(d);
    }
    return dates;
  };

  // Lead tracking
  const createiPadLead = async (modelName: string) => {
    try {
      const { data } = await supabase.from('leads').insert({
        customer_name: 'iPad Lead',
        customer_phone: '',
        device_type: modelName,
        last_step: 'בחירת דגם iPad',
        repair_type: 'תיקון מסך iPad',
      }).select('id').single();
      if (data) setCurrentLeadId(data.id);
    } catch (e) {
      console.error('Error creating iPad lead:', e);
    }
  };

  const updateiPadLeadStep = async (stepName: string, extra?: Record<string, string>) => {
    if (!currentLeadId) return;
    try {
      await supabase.from('leads').update({ last_step: stepName, ...extra }).eq('id', currentLeadId);
    } catch (e) {
      console.error('Error updating iPad lead:', e);
    }
  };

  const handleSubmit = async () => {
    if (!selectedModel || !selectedDate || !selectedTime || !customerName || !customerPhone || !customerAddress || !privacyAccepted) {
      toast.error('נא למלא את כל השדות');
      return;
    }
    setStep('processing');
    setSubmitting(true);

    // Update lead with customer info
    if (currentLeadId) {
      try {
        await supabase.from('leads').update({
          customer_name: customerName.trim(),
          customer_phone: customerPhone.trim().replace(/\D/g, ''),
          customer_email: customerEmail?.trim() || null,
          last_step: 'שליחת הזמנה iPad',
        }).eq('id', currentLeadId);
      } catch (e) {
        console.error('Error updating iPad lead details:', e);
      }
    }

    try {
      const dateStr = selectedDate.toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'long' });
      const displayStatus = displayWorking ? 'תצוגה תקינה' : 'תצוגה לא עובדת';
      const issueDesc = selectedModel.has_display_option 
        ? `תיקון מסך iPad - ${displayStatus}` 
        : `תיקון מסך iPad`;
      const notes = [`שירות איסוף והחזרה - iPad`, `טווח איסוף: ${selectedTime}`];
      if (selectedModel.has_display_option) notes.splice(1, 0, `תצוגה: ${displayStatus}`);
      
      const { data, error } = await supabase.from('orders').insert({
        customer_name: customerName,
        customer_phone: customerPhone,
        customer_address: customerAddress,
        customer_email: customerEmail || null,
        device_type: selectedModel.name,
        issue_description: issueDesc,
        repair_price: selectedModel.screen_price,
        status: 'pending',
        estimated_arrival: `${dateStr}, ${selectedTime}`,
        notes,
      }).select('order_number').single();

      if (error) throw error;
      setOrderNumber(data.order_number);

      // Mark lead as converted
      if (currentLeadId) {
        try {
          await supabase.from('leads').update({ converted: true, last_step: 'הזמנה הושלמה iPad' }).eq('id', currentLeadId);
        } catch (e) { console.error('Error marking iPad lead converted:', e); }
      }

      // Send email/WhatsApp notifications
      try {
        const dateStr2 = selectedDate.toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'long' });
        await supabase.functions.invoke('send-order-notifications', {
          body: {
            customerName: customerName.trim(),
            customerPhone: customerPhone.trim(),
            customerAddress: customerAddress.trim(),
            deviceType: selectedModel.name,
            repairType: issueDesc,
            repairPrice: selectedModel.screen_price,
            scheduledTime: `${dateStr2}, ${selectedTime}`,
            customerEmail: customerEmail?.trim() || undefined,
            orderNumber: data.order_number,
            notes: '',
          }
        });
      } catch (notifErr) {
        console.error('Error sending notifications:', notifErr);
      }

      setStep('done');
    } catch (err) {
      console.error(err);
      toast.error('אירעה שגיאה, אנא נסו שנית');
      setStep('details');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <SEO {...seo.ipad} />
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div ref={topRef} className="min-h-screen bg-background pb-8" dir="rtl">
      <div className="max-w-2xl mx-auto px-4 pt-6">
        {/* Header */}
        <div className="text-center mb-6">
          <Logo />
          <h1 className="text-2xl font-bold mt-4">תיקון מסך iPad</h1>
          <p className="text-muted-foreground mt-1">שירות איסוף והחזרה עד הבית</p>
        </div>

        {/* Service Explanation Banner */}
        <Card className="p-4 mb-6 bg-primary/5 border-primary/20">
          <div className="flex items-start gap-3">
            <div className="shrink-0">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Truck className="w-7 h-7 text-primary" />
              </div>
            </div>
            <div className="flex-1 text-right">
              <h3 className="font-bold text-base mb-2">איך זה עובד?</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shrink-0">1</div>
                  <span className="text-sm">אנחנו אוספים את ה-iPad מהבית שלכם</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shrink-0">2</div>
                  <span className="text-sm">מבצעים את התיקון במעבדה שלנו</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shrink-0">3</div>
                  <span className="text-sm">מחזירים את המכשיר מתוקן ביום למחרת</span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Progress Steps */}
        {step !== 'done' && step !== 'processing' && (
          <div className="flex items-center justify-center gap-1 mb-6">
            {['intro', 'model', 'issue', 'schedule', 'details'].map((s, i) => (
              <div key={s} className={cn(
                "h-1.5 rounded-full transition-all",
                s === step ? "w-8 bg-primary" : 
                ['intro', 'model', 'issue', 'schedule', 'details'].indexOf(step) > i ? "w-6 bg-primary/40" : "w-6 bg-muted"
              )} />
            ))}
          </div>
        )}

        {/* Step: Intro - Name & Phone */}
        {step === 'intro' && (
          <Card className="p-5 space-y-4 animate-fade-in">
            <h2 className="text-lg font-bold text-center">פרטים ראשוניים</h2>
            <div className="space-y-3">
              <Input
                placeholder="שם מלא"
                value={customerName}
                onChange={e => setCustomerName(e.target.value)}
                className="text-right h-12 text-base rounded-xl"
                dir="rtl"
              />
              <Input
                placeholder="מספר טלפון"
                type="tel"
                value={customerPhone}
                onChange={e => setCustomerPhone(e.target.value)}
                className="text-right h-12 text-base rounded-xl"
                dir="rtl"
              />
            </div>
            <div className="flex items-start gap-2 flex-row-reverse">
              <Checkbox
                id="privacy-intro-ipad"
                checked={privacyAccepted}
                onCheckedChange={(v) => setPrivacyAccepted(v === true)}
              />
              <label htmlFor="privacy-intro-ipad" className="text-xs text-muted-foreground text-right leading-relaxed cursor-pointer">
                אני מאשר/ת את{' '}
                <a
                  href="https://directfix.co.il/privacy-policy/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline text-primary hover:text-primary/80"
                >
                  מדיניות הפרטיות
                </a>{' '}
                ומסכים/ה לתיאום השירות באמצעות WhatsApp או טלפון
              </label>
            </div>
            <Button
              className="w-full h-12 text-base rounded-xl"
              disabled={!customerName.trim() || customerPhone.length < 9 || !privacyAccepted}
              onClick={() => setStep('model')}
            >
              המשך
            </Button>
          </Card>
        )}

        {/* Step: Model Selection */}
        {step === 'model' && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <button onClick={() => setStep('intro')} className="text-primary flex items-center gap-1 text-sm">
                <ArrowRight className="w-4 h-4" /> חזרה
              </button>
              <h2 className="text-lg font-bold">בחרו את דגם ה-iPad</h2>
            </div>

            {/* How to identify model */}
            <Collapsible open={identifyOpen} onOpenChange={setIdentifyOpen}>
              <CollapsibleTrigger asChild>
                <button className="w-full flex items-center justify-between p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
                  <span className="flex items-center gap-2 flex-row-reverse text-sm font-medium">
                    <HelpCircle className="w-4 h-4 text-primary" />
                    איך מזהים את דגם ה-iPad?
                  </span>
                  {identifyOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-2">
                <Card className="p-4 text-sm space-y-2 text-right">
                  <p className="font-medium">ניתן למצוא את מספר הדגם בגב המכשיר:</p>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>פתחו את <strong>הגדרות</strong> &gt; <strong>כללי</strong> &gt; <strong>אודות</strong></li>
                    <li>חפשו את שם הדגם המופיע בראש העמוד</li>
                    <li>לחילופין, בגב המכשיר מופיע מספר דגם (A....)</li>
                  </ul>
                  <p className="text-primary font-medium">לא בטוחים? התקשרו אלינו ונעזור!</p>
                </Card>
              </CollapsibleContent>
            </Collapsible>

            {/* Model Groups */}
            {Object.entries(groupedModels).map(([series, seriesModels]) => (
              <div key={series} className="space-y-2">
                <h3 className="text-sm font-semibold text-muted-foreground text-right">{series}</h3>
                <div className="space-y-1.5">
                  {seriesModels.map(model => (
                    <button
                      key={model.id}
                      onClick={() => {
                        setSelectedModel(model);
                        setStep('issue');
                        createiPadLead(model.name);
                      }}
                      className={cn(
                        "w-full flex items-center justify-between px-5 py-4 rounded-2xl transition-all active:scale-[0.98]",
                        "bg-card border border-border hover:border-primary/40 hover:bg-primary/5"
                      )}
                    >
                      <span className="font-semibold text-sm flex items-center gap-2 flex-row-reverse">
                        <Tablet className="w-4 h-4 text-primary" />
                        {model.name}
                      </span>
                      <ArrowRight className="w-4 h-4 text-muted-foreground rotate-180" />
                    </button>
                  ))}
                </div>
              </div>
            ))}

            {/* Model not listed */}
            <Collapsible>
              <CollapsibleTrigger asChild>
                <button className="w-full flex items-center justify-center gap-2 p-3 rounded-xl text-sm text-muted-foreground hover:text-foreground transition-colors">
                  <HelpCircle className="w-4 h-4" />
                  הדגם שלכם לא מופיע ברשימה?
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-2">
                <Card className="p-5 text-center space-y-3 animate-fade-in">
                  <Phone className="w-8 h-8 text-primary mx-auto" />
                  <p className="font-bold text-base">דברו עם נציג שלנו ונשמח לעזור</p>
                  <a
                    href="tel:033106020"
                    className="inline-flex items-center justify-center gap-2 flex-row-reverse w-full h-12 rounded-xl bg-primary text-primary-foreground font-bold text-base hover:bg-primary/90 transition-colors"
                  >
                    <Phone className="w-5 h-5" />
                    התקשרו עכשיו - 03-3106020
                  </a>
                </Card>
              </CollapsibleContent>
            </Collapsible>
          </div>
        )}

        {/* Step: Issue - Display Status */}
        {step === 'issue' && selectedModel && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <button onClick={() => setStep('model')} className="text-primary flex items-center gap-1 text-sm">
                <ArrowRight className="w-4 h-4" /> חזרה
              </button>
              <h2 className="text-lg font-bold">{selectedModel.has_display_option ? 'מצב המסך' : 'תיקון מסך'}</h2>
            </div>

            <Card className="p-4 text-center">
              <p className="text-sm text-muted-foreground mb-1">דגם נבחר</p>
              <p className="font-bold text-lg">{selectedModel.name}</p>
              <p className="text-primary font-bold text-xl mt-1">{selectedModel.screen_price} ש"ח</p>
            </Card>

            {!selectedModel.has_display_option && (
              <Button 
                onClick={() => { setDisplayWorking(true); setStep('schedule'); updateiPadLeadStep('תיקון מסך - ללא שאלת תצוגה'); }}
                className="w-full h-14 text-base font-bold rounded-xl"
              >
                המשך לקביעת תור
              </Button>
            )}

            {selectedModel.has_display_option && <>
            <p className="text-sm text-muted-foreground text-center">זה עוזר לנו להתכונן עם החלקים הנכונים</p>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => { setDisplayWorking(true); setStep('schedule'); updateiPadLeadStep('מצב תצוגה - תקינה'); }}
                className={cn(
                  "flex flex-col items-center gap-3 p-5 rounded-2xl border-2 transition-all active:scale-[0.97] relative",
                  displayWorking === true
                    ? "border-primary bg-primary/10"
                    : "border-border bg-card hover:border-primary/40 animate-[pulse-border_2s_ease-in-out_infinite]"
                )}
              >
                <div className="w-14 h-14 rounded-2xl bg-green-500/10 flex items-center justify-center">
                  <Eye className="w-7 h-7 text-green-500" />
                </div>
                <div className="text-center">
                  <p className="font-bold text-sm">כן, רואים תצוגה</p>
                  <p className="text-xs text-muted-foreground mt-0.5">המסך שבור אבל אפשר לראות</p>
                </div>
              </button>

              <button
                onClick={() => { setDisplayWorking(false); updateiPadLeadStep('מצב תצוגה - לא עובדת (התקשר)'); }}
                className={cn(
                  "flex flex-col items-center gap-3 p-5 rounded-2xl border-2 transition-all active:scale-[0.97] relative",
                  displayWorking === false
                    ? "border-primary bg-primary/10"
                    : "border-border bg-card hover:border-primary/40 animate-[pulse-border_2s_ease-in-out_infinite_0.5s]"
                )}
              >
                <div className="w-14 h-14 rounded-2xl bg-red-500/10 flex items-center justify-center">
                  <EyeOff className="w-7 h-7 text-red-500" />
                </div>
                <div className="text-center">
                  <p className="font-bold text-sm">לא, מסך שחור</p>
                  <p className="text-xs text-muted-foreground mt-0.5">התצוגה לא עובדת כלל</p>
                </div>
              </button>
            </div>

            {/* Show call prompt when display is not working */}
            {displayWorking === false && (
              <Card className="p-5 border-primary/30 bg-primary/5 animate-fade-in space-y-3 text-center">
                <Phone className="w-8 h-8 text-primary mx-auto" />
                <p className="font-bold text-base">להמשך טיפול בתקלה אנא התקשרו לנציג</p>
                <p className="text-sm text-muted-foreground">הצוות שלנו יוכל לסייע ולהתאים את הפתרון המדויק עבורכם</p>
                <a
                  href="tel:033106020"
                  className="inline-flex items-center justify-center gap-2 flex-row-reverse w-full h-12 rounded-xl bg-primary text-primary-foreground font-bold text-base hover:bg-primary/90 transition-colors"
                >
                  <Phone className="w-5 h-5" />
                  התקשרו עכשיו - 03-3106020
                </a>
              </Card>
            )}
            </>}
          </div>
        )}

        {/* Step: Schedule */}
        {step === 'schedule' && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <button onClick={() => setStep('issue')} className="text-primary flex items-center gap-1 text-sm">
                <ArrowRight className="w-4 h-4" /> חזרה
              </button>
              <h2 className="text-lg font-bold">תאריך איסוף</h2>
            </div>

            <Card className="p-4 bg-accent/10 border-accent/20">
              <div className="flex items-center gap-2 flex-row-reverse">
                <Info className="w-5 h-5 text-accent shrink-0" />
                <p className="text-sm text-right">
                  אנו אוספים את המכשיר בתאריך שתבחרו ומחזירים אותו מתוקן <strong>ביום שלמחרת</strong> באותו טווח שעות.
                </p>
              </div>
            </Card>

            <h3 className="text-base font-semibold text-right">בחרו יום איסוף</h3>
            
            <div className="grid grid-cols-3 gap-2">
              {getAvailableDates().slice(0, 9).map(date => {
                const dayName = hebrewDays[date.getDay()];
                const dayNum = date.getDate();
                const monthName = date.toLocaleDateString('he-IL', { month: 'short' });
                const isSelected = selectedDate?.toDateString() === date.toDateString();
                return (
                  <button
                    key={date.toISOString()}
                    onClick={() => { setSelectedDate(date); setSelectedTime(''); setTimeout(() => timePickerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100); }}
                    className={cn(
                      "flex flex-col items-center p-3 rounded-xl border-2 transition-all",
                      isSelected
                        ? "border-primary bg-primary/10 shadow-md"
                        : "border-border bg-card hover:border-primary/40"
                    )}
                  >
                    <span className="text-xs text-muted-foreground">{dayName}</span>
                    <span className="text-lg font-bold">{dayNum}</span>
                    <span className="text-xs text-muted-foreground">{monthName}</span>
                  </button>
                );
              })}
            </div>

            {selectedDate && (
              <div ref={timePickerRef} className="space-y-2 animate-fade-in">
                <h3 className="text-base font-semibold text-right">בחרו טווח שעות לאיסוף</h3>
                <div className="grid grid-cols-2 gap-2">
                  {TIME_SLOTS.map(slot => (
                    <button
                      key={slot.value}
                      onClick={() => setSelectedTime(slot.value)}
                      className={cn(
                        "flex items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all",
                        selectedTime === slot.value
                          ? "border-primary bg-primary/10 shadow-md"
                          : "border-border bg-card hover:border-primary/40"
                      )}
                    >
                      <Clock className="w-4 h-4 text-primary" />
                      <span className="font-semibold text-sm">{slot.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {selectedDate && selectedTime && (
              <Button
                className="w-full h-12 text-base rounded-xl animate-fade-in"
                onClick={() => { setStep('details'); updateiPadLeadStep('פרטי איסוף iPad'); }}
              >
                המשך לפרטי איסוף
              </Button>
            )}
          </div>
        )}

        {/* Step: Details */}
        {step === 'details' && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <button onClick={() => setStep('schedule')} className="text-primary flex items-center gap-1 text-sm">
                <ArrowRight className="w-4 h-4" /> חזרה
              </button>
              <h2 className="text-lg font-bold">פרטי איסוף</h2>
            </div>

            {/* Order Summary */}
            <Card className="p-4 space-y-2">
              <h3 className="font-bold text-base text-right">סיכום הזמנה</h3>
              <div className="flex justify-between text-sm">
                <span className="font-bold text-primary">{selectedModel?.screen_price} ש"ח</span>
                <span>תיקון מסך {selectedModel?.name}</span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{selectedTime}</span>
                <span>
                  {selectedDate?.toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'long' })}
                </span>
              </div>
              {selectedModel?.has_display_option && (
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>{displayWorking ? 'תצוגה תקינה' : 'תצוגה לא עובדת'}</span>
                  <span>מצב תצוגה</span>
                </div>
              )}
              <div className="border-t border-border pt-2 mt-2">
                <div className="flex items-center gap-2 flex-row-reverse text-xs text-muted-foreground">
                  <Package className="w-4 h-4" />
                  <span>החזרת המכשיר מתוקן ביום שלמחרת</span>
                </div>
              </div>
            </Card>

            <div className="space-y-3">
              <AddressAutocomplete
                value={customerAddress}
                onChange={setCustomerAddress}
                placeholder="כתובת לאיסוף המכשיר"
                className="h-12 text-base rounded-xl"
              />
              <Input
                placeholder="אימייל (לא חובה)"
                type="email"
                value={customerEmail}
                onChange={e => setCustomerEmail(e.target.value)}
                className="text-right h-12 text-base rounded-xl"
                dir="rtl"
              />
            </div>

            <div className="flex items-start gap-2 flex-row-reverse">
              <Checkbox
                id="privacy-ipad"
                checked={privacyAccepted}
                onCheckedChange={(v) => setPrivacyAccepted(v === true)}
              />
              <label htmlFor="privacy-ipad" className="text-xs text-muted-foreground text-right leading-relaxed cursor-pointer">
                אני מאשר/ת תיאום שירות באמצעות WhatsApp או טלפון בהתאם ל
                <a href="/terms" target="_blank" className="text-primary underline mx-1">מדיניות הפרטיות</a>
              </label>
            </div>

            <Button
              className="w-full h-12 text-base rounded-xl"
              disabled={!customerAddress.trim() || !privacyAccepted || submitting}
              onClick={handleSubmit}
            >
              {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'אישור הזמנה'}
            </Button>
          </div>
        )}

        {/* Processing */}
        {step === 'processing' && (
          <div className="text-center py-16 animate-fade-in">
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-lg font-semibold">שולח את ההזמנה...</p>
          </div>
        )}

        {/* Done */}
        {step === 'done' && (
          <Card className="p-6 text-center space-y-4 animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            </div>
            <h2 className="text-xl font-bold">ההזמנה התקבלה בהצלחה!</h2>
            {orderNumber && (
              <p className="text-muted-foreground">
                מספר הזמנה: <strong className="text-foreground">{orderNumber}</strong>
              </p>
            )}
            <div className="bg-muted/50 rounded-xl p-4 space-y-2 text-right">
              <p className="text-sm font-medium">מה קורה עכשיו?</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>ניצור איתכם קשר לאישור האיסוף</li>
                <li>שליח יגיע לכתובת שציינתם בטווח השעות שנבחר</li>
                <li>המכשיר יוחזר מתוקן ביום שלמחרת</li>
              </ul>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1 h-11 rounded-xl" asChild>
                <a href="tel:033106020">התקשרו אלינו</a>
              </Button>
              <Button className="flex-1 h-11 rounded-xl" onClick={() => window.location.href = '/'}>
                חזרה לדף הבית
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default iPadRepair;
