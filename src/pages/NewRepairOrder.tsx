import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ArrowRight, Smartphone, Battery, Phone, CheckCircle2, Sparkles, Wrench, MapPin, Loader2, HelpCircle, Moon, Sun, Calendar, Clock, Gift, Shield } from 'lucide-react';
import { useRepairStore } from '@/store/repairStore';
import { useTheme } from '@/components/ThemeProvider';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import logo from '@/assets/logo.png';

// Info descriptions for repair types (more professional)
const repairInfoDescriptions: Record<string, {
  title: string;
  description: string;
}> = {
  'מסך מקורי': {
    title: 'מסך מקורי Apple',
    description: 'מסך מקורי מבית Apple עם איכות תצוגה מעולה, צבעים מדויקים כמו מהמפעל, תמיכה מלאה ב-True Tone וכיול אוטומטי. כולל אחריות יצרן מלאה.'
  },
  'מסך תואם': {
    title: 'מסך תואם איכותי',
    description: 'מסך איכותי מתוצרת צד שלישי במחיר משתלם. איכות תצוגה טובה מאוד המתאימה לשימוש יומיומי. פתרון חסכוני עם יחס מחיר-ביצועים מצוין.'
  },
  'סוללה מקורית': {
    title: 'סוללה מקורית Apple',
    description: 'סוללה מקורית עם 100% בריאות סוללה. ללא התראות "חלק לא מקורי" במערכת. ביצועים מקסימליים וחיי סוללה ארוכים כמו מכשיר חדש.'
  }
};

// Schedule configuration
const weekdaySlots = ['9:00-11:00', '11:00-13:00', '13:00-17:00', '17:00-20:00', '20:00-22:00'];
const fridaySlots = ['8:00-10:00', '10:00-13:00', '13:00-17:00'];
const saturdaySlots = ['17:00-19:00', '19:00-22:00'];
const hebrewDays = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
interface IphoneModel {
  id: string;
  name: string;
  original_screen_price: number;
  compatible_screen_price: number;
  battery_price: number;
}
interface RepairType {
  id: string;
  name: string;
  description: string | null;
  icon: string;
  is_phone_only: boolean;
}
type Step = 'model' | 'repair' | 'price' | 'schedule' | 'details' | 'success';
const NewRepairOrder = () => {
  const navigate = useNavigate();
  const {
    addOrder
  } = useRepairStore();
  const {
    resolvedTheme,
    setTheme
  } = useTheme();
  const [step, setStep] = useState<Step>('model');
  const [models, setModels] = useState<IphoneModel[]>([]);
  const [repairTypes, setRepairTypes] = useState<RepairType[]>([]);
  const [blockedDates, setBlockedDates] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedModel, setSelectedModel] = useState<IphoneModel | null>(null);
  const [selectedRepair, setSelectedRepair] = useState<RepairType | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Schedule fields
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');

  // Gift animation
  const [showGiftAnimation, setShowGiftAnimation] = useState(false);

  // Form fields
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerNotes, setCustomerNotes] = useState('');

  // Load data from database
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [modelsRes, repairsRes, blockedRes] = await Promise.all([supabase.from('iphone_models').select('*').eq('is_active', true).order('sort_order'), supabase.from('repair_types').select('*').eq('is_active', true).order('sort_order'), supabase.from('blocked_dates').select('date')]);
        if (modelsRes.data) setModels(modelsRes.data);
        if (repairsRes.data) setRepairTypes(repairsRes.data);
        if (blockedRes.data) setBlockedDates(blockedRes.data.map(d => d.date));
      } catch (error) {
        console.error('Error loading data:', error);
        toast.error('שגיאה בטעינת הנתונים');
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  // Get available dates (next 7 days, excluding blocked dates)
  const getAvailableDates = () => {
    const dates: Date[] = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      // Check if this date is blocked
      const dateStr = date.toISOString().split('T')[0];
      if (!blockedDates.includes(dateStr)) {
        dates.push(date);
      }
    }
    return dates;
  };

  // Get time slots for a specific date
  const getTimeSlotsForDate = (date: Date) => {
    const dayOfWeek = date.getDay();
    if (dayOfWeek === 5) return fridaySlots; // Friday
    if (dayOfWeek === 6) return saturdaySlots; // Saturday
    return weekdaySlots; // Sunday-Thursday
  };

  // Check if a time slot is available (at least 2 hours from now)
  const isSlotAvailable = (date: Date, slot: string) => {
    const now = new Date();
    const slotStartHour = parseInt(slot.split(':')[0]);

    // Create date with slot start time
    const slotDate = new Date(date);
    slotDate.setHours(slotStartHour, 0, 0, 0);

    // Must be at least 2 hours from now
    const twoHoursFromNow = new Date(now.getTime() + 2 * 60 * 60 * 1000);
    return slotDate > twoHoursFromNow;
  };
  const filteredModels = models.filter(model => model.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const getPrice = () => {
    if (!selectedModel || !selectedRepair) return 0;
    const isOriginalScreen = selectedRepair.name.includes('מסך מקורי');
    const isCompatibleScreen = selectedRepair.name.includes('מסך תואם');
    const isBattery = selectedRepair.name.includes('סוללה');
    if (isOriginalScreen) return selectedModel.original_screen_price;
    if (isCompatibleScreen) return selectedModel.compatible_screen_price;
    if (isBattery) return selectedModel.battery_price;
    return 0;
  };
  const getRepairTypeName = () => {
    if (!selectedRepair) return '';
    return selectedRepair.name;
  };
  const goToStep = (newStep: Step) => {
    setIsAnimating(true);
    setTimeout(() => {
      setStep(newStep);
      setIsAnimating(false);
    }, 200);
  };
  const handleModelSelect = (model: IphoneModel) => {
    setSelectedModel(model);
    goToStep('repair');
  };
  const handleRepairSelect = (repair: RepairType) => {
    if (repair.is_phone_only) {
      window.location.href = 'tel:0528692886';
      return;
    }
    setSelectedRepair(repair);
    // Show gift animation
    setShowGiftAnimation(true);
    setTimeout(() => {
      setShowGiftAnimation(false);
      goToStep('price');
    }, 2500);
  };
  const handlePriceConfirm = () => {
    goToStep('schedule');
  };
  const handleScheduleConfirm = () => {
    if (!selectedDate || !selectedTimeSlot) {
      toast.error('אנא בחר תאריך ושעה');
      return;
    }
    goToStep('details');
  };
  const formatPhone = (value: string) => {
    return value.replace(/\D/g, '').slice(0, 10);
  };
  const formatSelectedDateTime = () => {
    if (!selectedDate || !selectedTimeSlot) return '';
    const dayName = hebrewDays[selectedDate.getDay()];
    const dateStr = `${selectedDate.getDate()}/${selectedDate.getMonth() + 1}`;
    return `יום ${dayName} ${dateStr} בשעות ${selectedTimeSlot}`;
  };
  const handleSubmit = async () => {
    if (!customerName.trim() || !customerPhone.trim() || !customerAddress.trim()) {
      toast.error('אנא מלא את כל השדות');
      return;
    }
    if (customerPhone.length < 9) {
      toast.error('מספר טלפון לא תקין');
      return;
    }
    setIsSubmitting(true);
    try {
      const scheduleNote = formatSelectedDateTime();
      const notes = [`הזמנה מהאתר - ${getRepairTypeName()}`, `מועד מבוקש: ${scheduleNote}`];
      if (customerNotes.trim()) {
        notes.push(`הערות לקוח: ${customerNotes.trim()}`);
      }
      await addOrder({
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerAddress: customerAddress.trim(),
        deviceType: selectedModel?.name || '',
        issueDescription: getRepairTypeName(),
        repairPrice: getPrice(),
        status: 'pending',
        accessories: [],
        notes,
        wantsPromotions: false
      });
      goToStep('success');
    } catch (error) {
      toast.error('אירעה שגיאה, נסה שוב');
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleTrackOrder = () => {
    navigate('/track');
  };
  const getRepairIcon = (icon: string) => {
    switch (icon) {
      case 'battery':
        return Battery;
      case 'phone':
        return Phone;
      default:
        return Smartphone;
    }
  };
  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  // Floating phone illustration component
  const PhoneIllustration = ({
    animate = false
  }: {
    animate?: boolean;
  }) => <div className={`relative ${animate ? 'animate-bounce-slow' : ''}`}>
      <div className="w-16 h-28 bg-gradient-to-b from-muted to-muted/50 rounded-[1.2rem] border-4 border-foreground/20 relative overflow-hidden shadow-xl">
        <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-6 h-1 bg-foreground/20 rounded-full" />
        <div className="absolute inset-2 top-4 bg-primary/20 rounded-lg flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-primary animate-pulse" />
        </div>
      </div>
      {step === 'repair' && selectedRepair === null && <div className="absolute -top-1 -right-1 w-5 h-5 bg-destructive rounded-full flex items-center justify-center animate-pulse">
          <span className="text-destructive-foreground text-xs font-bold">!</span>
        </div>}
    </div>;

  // Loading state
  if (isLoading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">טוען...</p>
        </div>
      </div>;
  }
  return <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border z-10">
        <div className="flex items-center justify-between p-3">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => {
            if (step === 'model') navigate('/');else if (step === 'repair') goToStep('model');else if (step === 'price') goToStep('repair');else if (step === 'schedule') goToStep('price');else if (step === 'details') goToStep('schedule');else navigate('/');
          }} className="rounded-full h-9 w-9">
              <ArrowRight className="w-4 h-4" />
            </Button>
            <img src={logo} alt="Logo" className="h-7 w-auto" />
            <h1 className="text-base font-semibold">הזמנת תיקון</h1>
          </div>
          <Button variant="ghost" size="icon" onClick={toggleTheme} className="h-9 w-9 rounded-full">
            {resolvedTheme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>
        </div>
        
        {/* Progress bar */}
        {step !== 'success' && <div className="px-3 pb-2">
            <div className="flex gap-1.5">
              {['model', 'repair', 'price', 'schedule', 'details'].map((s, i) => <div key={s} className={`h-1 flex-1 rounded-full transition-all duration-500 ${['model', 'repair', 'price', 'schedule', 'details'].indexOf(step) >= i ? 'bg-primary' : 'bg-muted'}`} />)}
            </div>
          </div>}
      </div>

      {/* Gift Animation Overlay */}
      {showGiftAnimation && <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-sm animate-fade-in">
          <div className="text-center space-y-4">
            <div className="relative animate-bounce">
              <div className="w-24 h-24 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-2xl mx-auto">
                <Gift className="w-12 h-12 text-white animate-pulse" />
              </div>
              <div className="absolute -top-2 -right-2 text-3xl animate-spin-slow">✨</div>
              <div className="absolute -bottom-2 -left-2 text-3xl animate-spin-slow" style={{
            animationDelay: '200ms'
          }}>🎁</div>
            </div>
            <div className="space-y-2 animate-scale-in" style={{
          animationDelay: '300ms'
        }}>
              <h3 className="text-xl font-bold text-foreground">🎉 מבצע דצמבר!</h3>
              <div className="bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-amber-500/20 rounded-xl p-4 border border-amber-500/30">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Shield className="w-6 h-6 text-amber-500" />
                  <span className="text-lg font-bold bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
                    מגן מסך במתנה!
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">על כל תיקון - מגן מסך איכותי בחינם</p>
              </div>
            </div>
          </div>
        </div>}

      {/* Content */}
      <div className={`flex-1 p-4 pb-24 overflow-y-auto transition-all duration-200 ${isAnimating ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}>
        
        {/* December Promotion Banner */}
        {step === 'model' && <div className="mb-4 animate-fade-in">
            <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/15 to-amber-500/10 rounded-xl p-3 border border-amber-500/20 flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                <Gift className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-bold text-amber-600 dark:text-amber-400 text-base">מבצע דצמבר!</p>
                <p className="text-xs font-medium text-secondary-foreground">קבלו מגן מסך במתנה על כל תיקון!</p>
              </div>
            </div>
          </div>}

        {/* Step 1: Select Model */}
        {step === 'model' && <div className="space-y-3 animate-fade-in">
            <div className="text-center mb-4">
              
              <h2 className="font-bold mb-1 text-center text-xl">בחר דגם</h2>
              <p className="text-muted-foreground text-sm">איזה מכשיר צריך תיקון?</p>
            </div>

            

            <div className="grid grid-cols-2 gap-2 max-h-[55vh] overflow-y-auto">
              {filteredModels.map((model, index) => <Card key={model.id} onClick={() => handleModelSelect(model)} className="p-3 cursor-pointer hover:border-primary hover:shadow-lg transition-all duration-200 active:scale-95" style={{
            animationDelay: `${index * 30}ms`
          }}>
                  <div className="flex flex-col items-center text-center gap-1.5">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Smartphone className="w-5 h-5 text-primary" />
                    </div>
                    <span className="font-medium leading-tight text-sm">{model.name}</span>
                  </div>
                </Card>)}
            </div>
          </div>}

        {/* Step 2: Select Repair Type */}
        {step === 'repair' && <div className="space-y-4 animate-fade-in">
            <div className="text-center mb-4">
              <div className="flex justify-center mb-3">
                <div className="relative">
                  <PhoneIllustration />
                  <div className="absolute -bottom-1 -left-1 bg-primary text-primary-foreground text-[10px] px-1.5 py-0.5 rounded-full font-medium">
                    {selectedModel?.name}
                  </div>
                </div>
              </div>
              <h2 className="text-lg font-bold mb-1">מה הבעיה?</h2>
              <p className="text-muted-foreground text-sm">בחר את סוג התיקון</p>
            </div>

            <div className="space-y-2">
              {repairTypes.map((repair, index) => {
            const Icon = getRepairIcon(repair.icon);
            const isPhoneOnly = repair.is_phone_only;
            const isOriginalScreen = repair.name.includes('מסך מקורי');
            const isCompatibleScreen = repair.name.includes('מסך תואם');
            const isBattery = repair.name.includes('סוללה');
            let price = 0;
            if (selectedModel) {
              if (isOriginalScreen) price = selectedModel.original_screen_price;else if (isCompatibleScreen) price = selectedModel.compatible_screen_price;else if (isBattery) price = selectedModel.battery_price;
            }
            const infoKey = isOriginalScreen ? 'מסך מקורי' : isCompatibleScreen ? 'מסך תואם' : isBattery ? 'סוללה מקורית' : null;
            const info = infoKey ? repairInfoDescriptions[infoKey] : null;
            return <Card key={repair.id} onClick={() => handleRepairSelect(repair)} className={`p-4 cursor-pointer transition-all duration-200 active:scale-[0.98] ${isPhoneOnly ? 'border-dashed border-2 hover:border-warning hover:bg-warning/5' : 'hover:border-primary hover:shadow-lg'}`} style={{
              animationDelay: `${index * 100}ms`
            }}>
                    <div className="flex items-center gap-3">
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${isPhoneOnly ? 'bg-warning/10' : 'bg-primary/10'}`}>
                        <Icon className={`w-5 h-5 ${isPhoneOnly ? 'text-warning' : 'text-primary'}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-sm">{repair.name}</h3>
                          {!isPhoneOnly && info && <Dialog>
                              <DialogTrigger asChild>
                                <button type="button" onClick={e => e.stopPropagation()} className="text-muted-foreground hover:text-primary transition-colors p-1">
                                  <HelpCircle className="w-4 h-4" />
                                </button>
                              </DialogTrigger>
                              <DialogContent className="max-w-sm" onClick={e => e.stopPropagation()}>
                                <DialogHeader>
                                  <DialogTitle className="text-right">{info.title}</DialogTitle>
                                </DialogHeader>
                                <p className="text-sm text-muted-foreground text-right leading-relaxed">
                                  {info.description}
                                </p>
                              </DialogContent>
                            </Dialog>}
                        </div>
                        {repair.description && <p className="text-muted-foreground text-xs">{repair.description}</p>}
                        {!isPhoneOnly && selectedModel && <p className="text-primary font-bold text-sm mt-0.5">₪{price}</p>}
                      </div>
                      {isPhoneOnly && <Phone className="w-4 h-4 text-warning" />}
                    </div>
                  </Card>;
          })}
            </div>

            <p className="text-center text-xs text-muted-foreground mt-4">
              💡 תיקונים נוספים - יש להתקשר
            </p>
          </div>}

        {/* Step 3: Price Confirmation */}
        {step === 'price' && <div className="space-y-5 animate-fade-in">
            <div className="text-center mb-6">
              <div className="flex justify-center mb-4">
                <div className="relative">
                  <div className="w-20 h-20 bg-gradient-to-br from-success/20 to-success/5 rounded-full flex items-center justify-center animate-pulse-slow">
                    <div className="w-14 h-14 bg-success/20 rounded-full flex items-center justify-center">
                      <Wrench className="w-7 h-7 text-success" />
                    </div>
                  </div>
                  <div className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-base px-2 py-0.5 rounded-full font-bold shadow-lg">
                    ₪{getPrice()}
                  </div>
                </div>
              </div>
              <h2 className="font-bold mb-1 text-xl">סיכום הזמנה</h2>
              <p className="text-muted-foreground text-sm">אישור מחיר התיקון</p>
            </div>

            <Card className="p-4 bg-gradient-to-br from-card to-muted/30">
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">דגם</span>
                  <span className="font-semibold">{selectedModel?.name}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">סוג תיקון</span>
                  <span className="font-semibold">{getRepairTypeName()}</span>
                </div>
                <div className="border-t border-border pt-3">
                  <div className="flex justify-between items-center">
                    <span className="font-bold">סה"כ</span>
                    <span className="text-xl font-bold text-primary">₪{getPrice()}</span>
                  </div>
                </div>
              </div>
            </Card>

            <div className="bg-muted/50 rounded-xl p-3 flex items-start gap-2">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="font-medium text-xs">תשלום בסיום התיקון בלבד</p>
                <p className="text-muted-foreground text-xs mt-0.5">
                  מזומן, אשראי או ביט
                </p>
              </div>
            </div>
          </div>}

        {/* Step 4: Schedule */}
        {step === 'schedule' && <div className="space-y-4 animate-fade-in">
            <div className="text-center mb-4">
              <div className="flex justify-center mb-3">
                <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/5 rounded-full flex items-center justify-center">
                  <Calendar className="w-8 h-8 text-primary" />
                </div>
              </div>
              <h2 className="text-lg font-bold mb-1">קביעת מועד</h2>
              <p className="text-muted-foreground text-sm">מתי נוח שהטכנאי יגיע?</p>
            </div>

            {/* Date selection */}
            <div>
              <label className="block text-xs font-medium mb-2 text-muted-foreground">בחר יום</label>
              <div className="grid grid-cols-4 gap-2">
                {getAvailableDates().map((date, index) => {
              const dayName = hebrewDays[date.getDay()];
              const isToday = index === 0;
              const isSelected = selectedDate?.toDateString() === date.toDateString();
              const hasAvailableSlots = getTimeSlotsForDate(date).some(slot => isSlotAvailable(date, slot));
              return <button key={index} onClick={() => {
                setSelectedDate(date);
                setSelectedTimeSlot('');
              }} disabled={!hasAvailableSlots} className={`p-2 rounded-lg border text-center transition-all ${isSelected ? 'border-primary bg-primary/10 text-primary' : hasAvailableSlots ? 'border-border hover:border-primary/50' : 'border-border/50 opacity-50 cursor-not-allowed'}`}>
                      <div className="text-xs font-medium">{isToday ? 'היום' : dayName}</div>
                      <div className="text-xs text-muted-foreground">{date.getDate()}/{date.getMonth() + 1}</div>
                    </button>;
            })}
              </div>
            </div>

            {/* Time slot selection */}
            {selectedDate && <div className="animate-fade-in">
                <label className="block text-xs font-medium mb-2 text-muted-foreground">בחר שעה</label>
                <div className="grid grid-cols-2 gap-2">
                  {getTimeSlotsForDate(selectedDate).map(slot => {
              const isAvailable = isSlotAvailable(selectedDate, slot);
              const isSelected = selectedTimeSlot === slot;
              return <button key={slot} onClick={() => setSelectedTimeSlot(slot)} disabled={!isAvailable} className={`p-3 rounded-lg border text-center transition-all flex items-center justify-center gap-2 ${isSelected ? 'border-primary bg-primary/10 text-primary' : isAvailable ? 'border-border hover:border-primary/50' : 'border-border/50 opacity-50 cursor-not-allowed'}`}>
                        <Clock className="w-4 h-4" />
                        <span className="text-sm font-medium">{slot}</span>
                      </button>;
            })}
                </div>
              </div>}

            {selectedDate && selectedTimeSlot && <Card className="p-3 bg-primary/5 border-primary/20 animate-fade-in">
                <p className="text-sm text-center">
                  <span className="text-muted-foreground">מועד נבחר: </span>
                  <span className="font-semibold">{formatSelectedDateTime()}</span>
                </p>
              </Card>}
          </div>}

        {/* Step 5: Customer Details */}
        {step === 'details' && <div className="space-y-4 animate-fade-in">
            <div className="text-center mb-4">
              <div className="flex justify-center mb-3">
                <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/5 rounded-full flex items-center justify-center">
                  <MapPin className="w-8 h-8 text-primary" />
                </div>
              </div>
              <h2 className="text-lg font-bold mb-1">פרטי הזמנה</h2>
              <p className="text-muted-foreground text-sm">לאן לשלוח את הטכנאי?</p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium mb-1.5">שם מלא</label>
                <Input placeholder="הכנס שם מלא" value={customerName} onChange={e => setCustomerName(e.target.value)} className="h-10 text-sm rounded-xl" />
              </div>

              <div>
                <label className="block text-xs font-medium mb-1.5">מספר טלפון</label>
                <Input placeholder="050-0000000" value={customerPhone} onChange={e => setCustomerPhone(formatPhone(e.target.value))} type="tel" className="h-10 text-sm rounded-xl text-left" dir="ltr" />
              </div>

              <div>
                <label className="block text-xs font-medium mb-1.5">כתובת (עיר, רחוב, מספר בית/דירה)</label>
                <Input placeholder="למשל: הרצליה, סוקולוב 15, דירה 4" value={customerAddress} onChange={e => setCustomerAddress(e.target.value)} className="h-10 text-sm rounded-xl" />
              </div>

              <div>
                <label className="block text-xs font-medium mb-1.5">
                  הערות לטכנאי <span className="text-muted-foreground">(לא חובה)</span>
                </label>
                <Textarea placeholder="למשל: קומה 3, יש אינטרקום, לחייג בהגעה..." value={customerNotes} onChange={e => setCustomerNotes(e.target.value)} className="text-sm rounded-xl resize-none" rows={2} />
              </div>
            </div>

            <Card className="p-3 bg-muted/30">
              <div className="flex justify-between items-center text-xs">
                <span>{selectedModel?.name} • {getRepairTypeName()}</span>
                <span className="font-bold text-primary">₪{getPrice()}</span>
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {formatSelectedDateTime()}
              </div>
            </Card>
          </div>}

        {/* Step 6: Success */}
        {step === 'success' && <div className="text-center space-y-5 animate-fade-in py-6">
            <div className="flex justify-center">
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-to-br from-success/30 to-success/10 rounded-full flex items-center justify-center animate-scale-in">
                  <div className="w-16 h-16 bg-success rounded-full flex items-center justify-center shadow-lg">
                    <CheckCircle2 className="w-10 h-10 text-success-foreground" />
                  </div>
                </div>
                <div className="absolute -top-1 -right-1 text-3xl animate-bounce">🎉</div>
                <div className="absolute -bottom-1 -left-1 text-3xl animate-bounce" style={{
              animationDelay: '100ms'
            }}>✨</div>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-1 text-success">ההזמנה התקבלה!</h2>
              <p className="text-muted-foreground text-sm">ניצור איתך קשר לאישור</p>
            </div>

            <Card className="p-4 bg-gradient-to-br from-card to-success/5">
              <div className="space-y-2 text-right text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">דגם</span>
                  <span className="font-medium">{selectedModel?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">תיקון</span>
                  <span className="font-medium">{getRepairTypeName()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">מועד</span>
                  <span className="font-medium">{formatSelectedDateTime()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">מחיר</span>
                  <span className="font-bold text-primary">₪{getPrice()}</span>
                </div>
              </div>
            </Card>

            <div className="space-y-2 pt-2">
              <Button onClick={handleTrackOrder} className="w-full h-12 text-base rounded-xl">
                עקוב אחר ההזמנה
              </Button>
              <Button variant="outline" onClick={() => navigate('/')} className="w-full h-10 rounded-xl">
                חזרה לדף הבית
              </Button>
            </div>
          </div>}
      </div>

      {/* Sticky Footer with Action Buttons */}
      {step !== 'success' && step !== 'model' && step !== 'repair' && <div className="sticky bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-border p-4 safe-area-pb">
          {step === 'price' && <Button onClick={handlePriceConfirm} className="w-full h-12 text-base rounded-xl">
              אישור והמשך
            </Button>}
          
          {step === 'schedule' && <Button onClick={handleScheduleConfirm} disabled={!selectedDate || !selectedTimeSlot} className="w-full h-12 text-base rounded-xl">
              המשך לפרטים
            </Button>}
          
          {step === 'details' && <Button onClick={handleSubmit} disabled={isSubmitting} className="w-full h-12 text-base rounded-xl">
              {isSubmitting ? <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  שולח...
                </div> : 'שלח הזמנה'}
            </Button>}
        </div>}
    </div>;
};
export default NewRepairOrder;