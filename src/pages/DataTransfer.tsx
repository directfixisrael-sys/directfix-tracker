import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ArrowRight, Smartphone, Phone, CheckCircle2, Moon, Sun, Calendar, Clock, Accessibility, ArrowLeftRight, AlertTriangle, MapPin } from 'lucide-react';
import { useRepairStore } from '@/store/repairStore';
import { useTheme } from '@/components/ThemeProvider';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import Logo from '@/components/Logo';
import AddressAutocomplete from '@/components/AddressAutocomplete';
import { getLeadSource } from '@/lib/leadSource';

// Schedule configuration - next day only
const weekdaySlots = ['9:00-11:00', '11:00-13:00', '13:00-17:00', '17:00-20:00', '20:00-22:00'];
const fridaySlots = ['8:00-10:00', '10:00-13:00', '13:00-17:00'];
const saturdaySlots = ['17:00-19:00', '19:00-22:00'];
const hebrewDays = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];

type DeviceType = 'iphone' | 'android';
type Step = 'source' | 'target' | 'schedule' | 'details' | 'success';

const DATA_TRANSFER_PRICE = 350;

const DataTransfer = () => {
  const navigate = useNavigate();
  const { addOrder } = useRepairStore();
  const { resolvedTheme, setTheme } = useTheme();

  const [step, setStep] = useState<Step>('source');
  const [sourceDevice, setSourceDevice] = useState<DeviceType | null>(null);
  const [targetDevice, setTargetDevice] = useState<DeviceType | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedOrderNumber, setCompletedOrderNumber] = useState<number | null>(null);

  // Blocked dates
  const [blockedDates, setBlockedDates] = useState<string[]>([]);
  const [hourlyBlocks, setHourlyBlocks] = useState<{ date: string; start_time: string; end_time: string }[]>([]);

  // Schedule
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');

  // Form
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerNotes, setCustomerNotes] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');

  const contentRef = useRef<HTMLDivElement>(null);

  // Load blocked dates
  useEffect(() => {
    const loadData = async () => {
      const { data } = await supabase.from('blocked_dates').select('date, start_time, end_time');
      if (data) {
        setBlockedDates(data.filter(d => !d.start_time).map(d => d.date));
        setHourlyBlocks(
          data.filter(d => d.start_time && d.end_time)
            .map(d => ({ date: d.date, start_time: d.start_time!, end_time: d.end_time! }))
        );
      }
    };
    loadData();
  }, []);

  const isCrossTransfer = sourceDevice === 'android' && targetDevice === 'iphone';

  // Available dates: starting from tomorrow, next 7 days
  const getAvailableDates = () => {
    const dates: Date[] = [];
    const today = new Date();
    for (let i = 1; i <= 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      if (!blockedDates.includes(dateStr)) {
        dates.push(date);
      }
    }
    return dates;
  };

  const getTimeSlotsForDate = (date: Date) => {
    const dayOfWeek = date.getDay();
    if (dayOfWeek === 5) return fridaySlots;
    if (dayOfWeek === 6) return saturdaySlots;
    return weekdaySlots;
  };

  const isSlotAvailable = (date: Date, slot: string) => {
    const [slotStart, slotEnd] = slot.split('-');
    const slotStartHour = parseInt(slotStart.split(':')[0]);
    const slotStartMin = parseInt(slotStart.split(':')[1] || '0');
    const slotEndHour = parseInt(slotEnd.split(':')[0]);
    const slotEndMin = parseInt(slotEnd.split(':')[1] || '0');

    const dateStr = date.toISOString().split('T')[0];
    const blocksForDate = hourlyBlocks.filter(b => b.date === dateStr);
    for (const block of blocksForDate) {
      const blockStartMin = parseInt(block.start_time.split(':')[0]) * 60 + parseInt(block.start_time.split(':')[1]);
      const blockEndMin = parseInt(block.end_time.split(':')[0]) * 60 + parseInt(block.end_time.split(':')[1]);
      const slotStartTotalMin = slotStartHour * 60 + slotStartMin;
      const slotEndTotalMin = slotEndHour * 60 + slotEndMin;
      if (slotStartTotalMin < blockEndMin && slotEndTotalMin > blockStartMin) {
        return false;
      }
    }
    return true;
  };

  const goToStep = (newStep: Step) => {
    setIsAnimating(true);
    setTimeout(() => {
      setStep(newStep);
      setIsAnimating(false);
      if (contentRef.current) contentRef.current.scrollTop = 0;
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }, 200);
  };

  const formatPhone = (value: string) => value.replace(/\D/g, '').slice(0, 10);

  const formatSelectedDateTime = () => {
    if (!selectedDate || !selectedTimeSlot) return '';
    const dayName = hebrewDays[selectedDate.getDay()];
    const dateStr = `${selectedDate.getDate()}/${selectedDate.getMonth() + 1}`;
    return `יום ${dayName} ${dateStr} בשעות ${selectedTimeSlot}`;
  };

  const handleSubmit = async () => {
    if (!customerName.trim() || !customerPhone.trim() || !customerAddress.trim()) {
      toast.error('אנא מלאו את כל השדות');
      return;
    }
    if (customerPhone.length < 9) {
      toast.error('מספר טלפון לא תקין');
      return;
    }
    setIsSubmitting(true);
    try {
      const scheduleNote = formatSelectedDateTime();
      const sourceLabel = sourceDevice === 'iphone' ? 'אייפון' : 'אנדרואיד';
      const targetLabel = targetDevice === 'iphone' ? 'אייפון' : 'אנדרואיד';
      const description = `העברת נתונים מ${sourceLabel} ל${targetLabel}`;

      const notes = [
        `הזמנה מהאתר - שירות העברת נתונים`,
        `מועד מבוקש: ${scheduleNote}`,
        `מ: ${sourceLabel} → אל: ${targetLabel}`,
      ];
      if (isCrossTransfer) {
        notes.push('⚠️ העברה בין אנדרואיד לאייפון - וואטסאפ עלול לא לעבור בדרך הרגילה');
      }
      if (customerNotes.trim()) {
        notes.push(`הערות לקוח: ${customerNotes.trim()}`);
      }

      const leadSource = getLeadSource();
      const orderResult: any = await addOrder({
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerAddress: customerAddress.trim(),
        deviceType: `${sourceLabel} → ${targetLabel}`,
        issueDescription: description,
        repairPrice: DATA_TRANSFER_PRICE,
        status: 'pending',
        accessories: [],
        notes,
        wantsPromotions: false,
        leadSource: leadSource.source || 'data-transfer',
        customerEmail: customerEmail.trim() || undefined,
      } as any);

      // Send notifications
      try {
        await supabase.functions.invoke('send-order-notifications', {
          body: {
            customerName: customerName.trim(),
            customerPhone: customerPhone.trim(),
            customerAddress: customerAddress.trim(),
            deviceType: `${sourceLabel} → ${targetLabel}`,
            repairType: description,
            repairPrice: DATA_TRANSFER_PRICE,
            scheduledTime: scheduleNote,
            notes: customerNotes.trim(),
            customerEmail: customerEmail.trim() || undefined,
            orderNumber: orderResult?.order_number || undefined,
            leadSource: 'data-transfer',
          }
        });
      } catch (e) {
        console.error('Notification error:', e);
      }

      setCompletedOrderNumber(orderResult?.order_number || null);
      goToStep('success');
    } catch (error) {
      toast.error('אירעה שגיאה, נסו שוב');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleTheme = () => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');

  const stepLabels: Record<Step, string> = {
    source: 'מקור',
    target: 'יעד',
    schedule: 'מועד',
    details: 'פרטים',
    success: '',
  };

  const displaySteps: Step[] = ['source', 'target', 'schedule', 'details'];
  const currentStepIdx = displaySteps.indexOf(step);

  return (
    <div className="min-h-screen bg-background flex flex-col" lang="he">
      {/* Header */}
      <header className="sticky top-0 bg-background/80 backdrop-blur-xl border-b border-border/40 z-10">
        <nav className="flex items-center justify-between p-3 max-w-5xl mx-auto">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (step === 'source') navigate('/');
                else if (step === 'target') goToStep('source');
                else if (step === 'schedule') goToStep('target');
                else if (step === 'details') goToStep('schedule');
                else navigate('/');
              }}
              className="h-10 w-10 rounded-2xl bg-muted/60 hover:bg-muted flex items-center justify-center transition-colors"
              aria-label="חזור"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
            <Logo size="sm" />
          </div>
          <div className="flex items-center gap-1.5">
            <a href="tel:033106020" className="h-9 w-9 rounded-2xl bg-accent text-accent-foreground flex items-center justify-center transition-colors" aria-label="התקשר">
              <Phone className="w-4 h-4" />
            </a>
            <Button variant="ghost" size="icon" onClick={() => window.dispatchEvent(new CustomEvent('open-accessibility-widget'))} className="h-9 w-9 rounded-2xl" aria-label="נגישות">
              <Accessibility className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={toggleTheme} className="h-9 w-9 rounded-2xl" aria-label="מצב תצוגה">
              {resolvedTheme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
          </div>
        </nav>

        {/* Step indicator */}
        {step !== 'success' && (
          <div className="px-4 pb-3 max-w-5xl mx-auto">
            <div className="flex gap-2 items-center">
              {displaySteps.map((s, i) => (
                <div
                  key={s}
                  className={`flex-1 text-center py-1.5 rounded-full text-xs font-semibold transition-all duration-300 ${
                    i === currentStepIdx
                      ? 'bg-primary text-primary-foreground shadow-md'
                      : i < currentStepIdx
                      ? 'bg-primary/15 text-primary'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {stepLabels[s]}
                </div>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* Content */}
      <main
        ref={contentRef}
        className={`flex-1 p-5 pb-28 overflow-y-auto transition-all duration-300 max-w-2xl mx-auto w-full ${
          isAnimating ? 'opacity-0 scale-[0.98]' : 'opacity-100 scale-100'
        }`}
      >
        {/* Step 1: Source device */}
        {step === 'source' && (
          <div className="space-y-8 animate-fade-in">
            <div className="text-center py-4">
              <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-4">
                <ArrowLeftRight className="w-10 h-10 text-primary" />
              </div>
              <h1 className="text-3xl font-extrabold mb-2">שירות העברת נתונים</h1>
              <p className="text-muted-foreground text-sm">טכנאי מגיע עד אליכם ומעביר את כל המידע למכשיר החדש</p>
              <p className="text-xl font-bold text-primary mt-3">₪{DATA_TRANSFER_PRICE}</p>
            </div>

            <div className="text-center">
              <h2 className="text-xl font-bold mb-4">מאיזה מכשיר אתם מעבירים?</h2>
              <div className="grid grid-cols-2 gap-4">
                <Card
                  onClick={() => { setSourceDevice('iphone'); goToStep('target'); }}
                  className="p-6 cursor-pointer transition-all duration-200 active:scale-[0.98] rounded-2xl border-2 border-border hover:border-primary/40 hover:bg-primary/5 text-center"
                >
                  <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <Smartphone className="w-8 h-8 text-foreground/70" />
                  </div>
                  <p className="font-bold text-lg">אייפון</p>
                  <p className="text-sm text-muted-foreground">iPhone</p>
                </Card>
                <Card
                  onClick={() => { setSourceDevice('android'); goToStep('target'); }}
                  className="p-6 cursor-pointer transition-all duration-200 active:scale-[0.98] rounded-2xl border-2 border-border hover:border-primary/40 hover:bg-primary/5 text-center"
                >
                  <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <Smartphone className="w-8 h-8 text-foreground/70" />
                  </div>
                  <p className="font-bold text-lg">אנדרואיד</p>
                  <p className="text-sm text-muted-foreground">Android</p>
                </Card>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Target device */}
        {step === 'target' && (
          <div className="space-y-8 animate-fade-in">
            <div className="text-center py-4">
              <div className="inline-flex items-center gap-2 bg-accent/10 text-accent rounded-full px-4 py-1.5 text-sm font-semibold mb-3">
                <Smartphone className="w-4 h-4" />
                מ{sourceDevice === 'iphone' ? 'אייפון' : 'אנדרואיד'}
              </div>
              <h2 className="text-2xl font-extrabold">לאיזה מכשיר אתם עוברים?</h2>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Card
                onClick={() => { setTargetDevice('iphone'); goToStep('schedule'); }}
                className="p-6 cursor-pointer transition-all duration-200 active:scale-[0.98] rounded-2xl border-2 border-border hover:border-primary/40 hover:bg-primary/5 text-center"
              >
                <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <Smartphone className="w-8 h-8 text-foreground/70" />
                </div>
                <p className="font-bold text-lg">אייפון</p>
                <p className="text-sm text-muted-foreground">iPhone</p>
              </Card>
              <Card
                onClick={() => { setTargetDevice('android'); goToStep('schedule'); }}
                className="p-6 cursor-pointer transition-all duration-200 active:scale-[0.98] rounded-2xl border-2 border-border hover:border-primary/40 hover:bg-primary/5 text-center"
              >
                <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <Smartphone className="w-8 h-8 text-foreground/70" />
                </div>
                <p className="font-bold text-lg">אנדרואיד</p>
                <p className="text-sm text-muted-foreground">Android</p>
              </Card>
            </div>

            {/* Show warning for android → iphone after selection */}
            {sourceDevice === 'android' && (
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 text-right">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-sm text-amber-700 dark:text-amber-400 mb-1">שימו לב - העברה מאנדרואיד לאייפון</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      בהעברה בין אנדרואיד לאייפון, וואטסאפ לא תמיד ניתן להעברה בדרך הרגילה. במקרה כזה, אנו משתמשים בתוכנות מיוחדות — מה שעלול להוסיף משמעותית לעלות ההעברה.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Schedule - next day only */}
        {step === 'schedule' && (
          <div className="space-y-6 animate-fade-in">
            {/* Cross-transfer warning */}
            {isCrossTransfer && (
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 text-right">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    <span className="font-bold text-amber-700 dark:text-amber-400">שימו לב:</span> בהעברה מאנדרואיד לאייפון, וואטסאפ עלול לא לעבור בדרך הרגילה ועלול להוסיף לעלות ההעברה.
                  </p>
                </div>
              </div>
            )}

            <div className="text-center mb-2">
              <h2 className="text-2xl font-extrabold">מתי נוח לכם?</h2>
              <p className="text-sm text-muted-foreground mt-1">ניתן לקבוע את השירות מהיום הבא</p>
            </div>

            {/* Date selection */}
            <div className="space-y-3">
              <p className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                <Calendar className="w-4 h-4" /> בחרו תאריך
              </p>
              <div className="grid grid-cols-3 gap-2">
                {getAvailableDates().map((date, idx) => {
                  const dayName = hebrewDays[date.getDay()];
                  const dateStr = `${date.getDate()}/${date.getMonth() + 1}`;
                  const isSelected = selectedDate?.toDateString() === date.toDateString();
                  return (
                    <button
                      key={idx}
                      onClick={() => { setSelectedDate(date); setSelectedTimeSlot(''); }}
                      className={`p-3 rounded-2xl text-center transition-all border-2 ${
                        isSelected
                          ? 'border-primary bg-primary/10 shadow-md'
                          : 'border-border hover:border-primary/40'
                      }`}
                    >
                      <p className="text-xs text-muted-foreground">{dayName}</p>
                      <p className="font-bold text-base">{dateStr}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Time slots */}
            {selectedDate && (
              <div className="space-y-3 animate-fade-in">
                <p className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                  <Clock className="w-4 h-4" /> בחרו שעה
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {getTimeSlotsForDate(selectedDate).map((slot) => {
                    const available = isSlotAvailable(selectedDate, slot);
                    const isSelected = selectedTimeSlot === slot;
                    return (
                      <button
                        key={slot}
                        disabled={!available}
                        onClick={() => setSelectedTimeSlot(slot)}
                        className={`p-3 rounded-2xl text-center text-base font-semibold transition-all border-2 ${
                          !available
                            ? 'opacity-30 cursor-not-allowed border-border'
                            : isSelected
                            ? 'border-primary bg-primary/10 shadow-md'
                            : 'border-border hover:border-primary/40'
                        }`}
                      >
                        {slot}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Continue button */}
            {selectedDate && selectedTimeSlot && (
              <Button
                onClick={() => goToStep('details')}
                className="w-full h-14 text-lg font-bold rounded-2xl animate-fade-in"
              >
                המשך לפרטים
              </Button>
            )}
          </div>
        )}

        {/* Step 4: Details */}
        {step === 'details' && (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center mb-2">
              <h2 className="text-2xl font-extrabold">פרטים אחרונים</h2>
              <p className="text-sm text-muted-foreground mt-1">{formatSelectedDateTime()}</p>
            </div>

            {/* Summary card */}
            <Card className="p-4 rounded-2xl border-2 border-primary/20 bg-primary/5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <ArrowLeftRight className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-bold text-sm">העברת נתונים</p>
                    <p className="text-xs text-muted-foreground">
                      מ{sourceDevice === 'iphone' ? 'אייפון' : 'אנדרואיד'} ל{targetDevice === 'iphone' ? 'אייפון' : 'אנדרואיד'}
                    </p>
                  </div>
                </div>
                <span className="text-xl font-extrabold text-primary">₪{DATA_TRANSFER_PRICE}</span>
              </div>
              {isCrossTransfer && (
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-2 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  וואטסאפ עלול להוסיף לעלות
                </p>
              )}
            </Card>

            {/* Free home visit */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4 text-primary" />
              <span>הגעה עד הבית — <span className="text-success font-bold">חינם</span></span>
            </div>

            {/* Form */}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">שם מלא *</label>
                <Input
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                  placeholder="ישראל ישראלי"
                  className="h-12 text-base rounded-xl"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">טלפון *</label>
                <Input
                  type="tel"
                  value={customerPhone}
                  onChange={e => setCustomerPhone(formatPhone(e.target.value))}
                  placeholder="050-0000000"
                  className="h-12 text-base rounded-xl text-left"
                  dir="ltr"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">כתובת מלאה *</label>
                <AddressAutocomplete
                  value={customerAddress}
                  onChange={setCustomerAddress}
                  placeholder="רחוב, עיר"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">מייל (אופציונלי)</label>
                <Input
                  type="email"
                  value={customerEmail}
                  onChange={e => setCustomerEmail(e.target.value)}
                  placeholder="email@example.com"
                  className="h-12 text-base rounded-xl text-left"
                  dir="ltr"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">הערות (אופציונלי)</label>
                <Input
                  value={customerNotes}
                  onChange={e => setCustomerNotes(e.target.value)}
                  placeholder="מידע נוסף שחשוב לנו לדעת"
                  className="h-12 text-base rounded-xl"
                />
              </div>
            </div>

            {/* Total */}
            <div className="flex justify-between items-center pt-4 border-t border-border">
              <span className="font-bold text-foreground text-lg">סה״כ לתשלום</span>
              <span className="font-bold text-primary text-2xl">₪{DATA_TRANSFER_PRICE}</span>
            </div>

            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !customerName.trim() || !customerPhone.trim() || !customerAddress.trim()}
              className="w-full h-14 text-lg font-bold rounded-2xl"
            >
              {isSubmitting ? 'שולח...' : 'אישור הזמנה'}
            </Button>
          </div>
        )}

        {/* Success */}
        {step === 'success' && (
          <div className="text-center py-12 space-y-6 animate-fade-in">
            <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-14 h-14 text-green-500" />
            </div>
            <div>
              <h2 className="text-3xl font-extrabold mb-2">ההזמנה התקבלה! 🎉</h2>
              {completedOrderNumber && (
                <p className="text-muted-foreground">מספר הזמנה: <span className="font-bold text-foreground">#{completedOrderNumber}</span></p>
              )}
            </div>
            <p className="text-muted-foreground leading-relaxed max-w-sm mx-auto">
              ניצור איתכם קשר בהקדם לאישור המועד. הטכנאי יגיע אליכם עם כל הציוד הנדרש להעברת הנתונים.
            </p>
            <div className="space-y-3 pt-4">
              <Button onClick={() => navigate('/track')} className="w-full h-12 text-base font-bold rounded-2xl">
                מעקב הזמנה
              </Button>
              <Button onClick={() => navigate('/')} variant="outline" className="w-full h-12 text-base font-bold rounded-2xl">
                חזרה לדף הבית
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default DataTransfer;
