import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ArrowRight, Smartphone, Battery, Phone, CheckCircle2, Sparkles, Wrench, MapPin, Loader2, HelpCircle, Moon, Sun, Calendar, Clock, Gift, Shield, Tag, Camera, X, Image, Accessibility } from 'lucide-react';
import { useRepairStore } from '@/store/repairStore';
import { useTheme } from '@/components/ThemeProvider';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import logo from '@/assets/logo.png';
import { trackPurchase, trackAddToCart } from '@/lib/fbPixel';
import OrderPrivacyConsent from '@/components/OrderPrivacyConsent';
import SmartRepairInput from '@/components/SmartRepairInput';

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
interface Promotion {
  id: string;
  title: string;
  description: string;
  badge_text: string | null;
  icon: string | null;
  value: number | null;
}
interface RepairBundle {
  id: string;
  name: string;
  primary_repair_type: string;
  addon_repair_type: string;
  discount_percent: number;
}
type Step = 'model' | 'repair' | 'bundle' | 'price' | 'schedule' | 'details' | 'success';
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
  const [activePromotion, setActivePromotion] = useState<Promotion | null>(null);
  const [repairBundles, setRepairBundles] = useState<RepairBundle[]>([]);
  const [selectedBundleAddon, setSelectedBundleAddon] = useState<boolean>(false);
  const [currentBundle, setCurrentBundle] = useState<RepairBundle | null>(null);
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
  const [acceptPrivacy, setAcceptPrivacy] = useState(false);
  const [acceptContact, setAcceptContact] = useState(false);

  // Coupon fields
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discount_type: 'fixed' | 'percentage';
    discount_value: number;
  } | null>(null);
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);

  // Image upload
  const [deviceImages, setDeviceImages] = useState<string[]>([]);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [showImageUploadOption, setShowImageUploadOption] = useState(false);
  const [pendingRepair, setPendingRepair] = useState<RepairType | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Privacy consent
  const [showPrivacyConsent, setShowPrivacyConsent] = useState(false);

  // Check privacy consent on mount
  useEffect(() => {
    const hasAcceptedPrivacy = localStorage.getItem('order_privacy_consent') === 'true';
    if (!hasAcceptedPrivacy) {
      setShowPrivacyConsent(true);
    }
  }, []);

  // Helper to get promotion icon
  const getPromotionIcon = (icon: string | null) => {
    switch (icon) {
      case 'gift':
        return '🎁';
      case 'tag':
        return '🏷️';
      case 'sparkles':
        return '✨';
      case 'percent':
        return '💯';
      case 'fire':
        return '🔥';
      case 'star':
        return '⭐';
      default:
        return '🎁';
    }
  };

  // Load data from database
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [modelsRes, repairsRes, blockedRes, bundlesRes] = await Promise.all([supabase.from('iphone_models').select('*').eq('is_active', true).order('sort_order'), supabase.from('repair_types').select('*').eq('is_active', true).order('sort_order'), supabase.from('blocked_dates').select('date'), supabase.from('repair_bundles').select('*').eq('is_active', true)]);
        if (modelsRes.data) setModels(modelsRes.data);
        if (repairsRes.data) setRepairTypes(repairsRes.data);
        if (blockedRes.data) setBlockedDates(blockedRes.data.map(d => d.date));
        if (bundlesRes.data) setRepairBundles(bundlesRes.data);

        // Load promotion separately to avoid error if none exists
        const {
          data: promotionData
        } = await supabase.from('promotions').select('*').eq('is_active', true).limit(1).maybeSingle();
        if (promotionData) {
          setActivePromotion(promotionData);
        }
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
  const getBundleAddonPrice = () => {
    if (!selectedModel || !selectedBundleAddon || !currentBundle) return 0;
    const basePrice = selectedModel.battery_price;
    const discountedPrice = Math.round(basePrice * (1 - currentBundle.discount_percent / 100));
    return discountedPrice;
  };
  const getTotalPrice = () => {
    return getPrice() + getBundleAddonPrice();
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
      // Scroll to top when changing steps
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }, 200);
  };
  const handleModelSelect = (model: IphoneModel) => {
    setSelectedModel(model);
    goToStep('repair');
  };

  // Smart search handlers
  const handleSmartModelAndRepair = (modelName: string, repairName: string) => {
    const model = models.find(m => m.name === modelName);
    const repair = repairTypes.find(r => r.name === repairName);
    if (model && repair) {
      setSelectedModel(model);
      setSelectedRepair(repair);
      // Skip straight to image upload option like normal flow
      setPendingRepair(repair);
      setShowImageUploadOption(true);
    }
  };
  const handleSmartModelOnly = (modelName: string) => {
    const model = models.find(m => m.name === modelName);
    if (model) {
      handleModelSelect(model);
    }
  };
  const handleRepairSelect = (repair: RepairType) => {
    if (repair.is_phone_only) {
      window.location.href = 'tel:0528692886';
      return;
    }
    // Show image upload option first
    setPendingRepair(repair);
    setShowImageUploadOption(true);
  };
  const continueAfterImageOption = (wantsToUpload: boolean) => {
    setShowImageUploadOption(false);
    if (wantsToUpload && fileInputRef.current) {
      fileInputRef.current.click();
    }
    if (pendingRepair) {
      setSelectedRepair(pendingRepair);

      // Track AddToCart event for Facebook Pixel
      if (selectedModel) {
        const isOriginalScreen = pendingRepair.name.includes('מסך מקורי');
        const isCompatibleScreen = pendingRepair.name.includes('מסך תואם');
        const isBattery = pendingRepair.name.includes('סוללה');
        let repairPrice = 0;
        if (isOriginalScreen) repairPrice = selectedModel.original_screen_price;else if (isCompatibleScreen) repairPrice = selectedModel.compatible_screen_price;else if (isBattery) repairPrice = selectedModel.battery_price;
        trackAddToCart(pendingRepair.name, repairPrice);
      }
      // Check if there's a bundle offer for this repair type
      const isScreenRepair = pendingRepair.name.includes('מסך');
      const bundle = repairBundles.find(b => pendingRepair.name.includes(b.primary_repair_type));
      if (bundle && isScreenRepair) {
        setCurrentBundle(bundle);
        setSelectedBundleAddon(false);
        goToStep('bundle');
      } else {
        // Show gift animation only if there's no bundle step
        if (activePromotion) {
          setShowGiftAnimation(true);
          setTimeout(() => {
            setShowGiftAnimation(false);
            goToStep('price');
          }, 2500);
        } else {
          goToStep('price');
        }
      }
    }
  };
  const handleBundleDecision = (acceptBundle: boolean) => {
    setSelectedBundleAddon(acceptBundle);
    if (activePromotion) {
      setShowGiftAnimation(true);
      setTimeout(() => {
        setShowGiftAnimation(false);
        goToStep('price');
      }, 2500);
    } else {
      goToStep('price');
    }
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

  // Coupon validation
  const validateCoupon = async () => {
    if (!couponCode.trim()) return;
    setIsValidatingCoupon(true);
    try {
      const {
        data,
        error
      } = await supabase.from('coupons').select('*').eq('code', couponCode.toUpperCase().trim()).eq('is_active', true).single();
      if (error || !data) {
        toast.error('קוד הקופון לא נמצא או לא תקף');
        setAppliedCoupon(null);
        return;
      }

      // Check if coupon is within date range
      const now = new Date();
      if (data.start_date && new Date(data.start_date) > now) {
        toast.error('הקופון עדיין לא פעיל');
        setAppliedCoupon(null);
        return;
      }
      if (data.end_date && new Date(data.end_date) < now) {
        toast.error('הקופון פג תוקף');
        setAppliedCoupon(null);
        return;
      }

      // Check usage limit
      if (data.max_uses && data.current_uses >= data.max_uses) {
        toast.error('הקופון מוצה');
        setAppliedCoupon(null);
        return;
      }

      // Check minimum order amount
      if (data.min_order_amount && getPrice() < data.min_order_amount) {
        toast.error(`הקופון דורש הזמנה מינימלית של ₪${data.min_order_amount}`);
        setAppliedCoupon(null);
        return;
      }
      setAppliedCoupon({
        code: data.code,
        discount_type: data.discount_type as 'fixed' | 'percentage',
        discount_value: data.discount_value
      });
      toast.success('הקופון הופעל בהצלחה!');
    } catch (err) {
      toast.error('שגיאה באימות הקופון');
    } finally {
      setIsValidatingCoupon(false);
    }
  };
  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
  };
  const getDiscount = () => {
    if (!appliedCoupon) return 0;
    if (appliedCoupon.discount_type === 'percentage') {
      return Math.round(getTotalPrice() * (appliedCoupon.discount_value / 100));
    }
    return appliedCoupon.discount_value;
  };
  const getFinalPrice = () => {
    return Math.max(0, getTotalPrice() - getDiscount());
  };

  // Image upload
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    if (deviceImages.length >= 3) {
      toast.error('ניתן להעלות עד 3 תמונות');
      return;
    }
    setIsUploadingImage(true);
    try {
      for (const file of Array.from(files)) {
        if (deviceImages.length >= 3) break;
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const {
          data,
          error
        } = await supabase.storage.from('device-images').upload(fileName, file);
        if (error) throw error;
        const {
          data: urlData
        } = supabase.storage.from('device-images').getPublicUrl(fileName);
        setDeviceImages(prev => [...prev, urlData.publicUrl]);
      }
      toast.success('התמונה הועלתה בהצלחה');
    } catch (err) {
      console.error('Error uploading image:', err);
      toast.error('שגיאה בהעלאת התמונה');
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };
  const removeImage = (index: number) => {
    setDeviceImages(prev => prev.filter((_, i) => i !== index));
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
      const repairDescription = selectedBundleAddon && currentBundle ? `${getRepairTypeName()} + החלפת סוללה (חבילה)` : getRepairTypeName();
      const notes = [`הזמנה מהאתר - ${repairDescription}`, `מועד מבוקש: ${scheduleNote}`];
      if (selectedBundleAddon && currentBundle && selectedModel) {
        notes.push(`חבילת תיקון: ${currentBundle.name} - סוללה ב-${currentBundle.discount_percent}% הנחה (₪${getBundleAddonPrice()} במקום ₪${selectedModel.battery_price})`);
      }
      if (customerNotes.trim()) {
        notes.push(`הערות לקוח: ${customerNotes.trim()}`);
      }
      if (appliedCoupon) {
        notes.push(`קופון: ${appliedCoupon.code} - הנחה של ${appliedCoupon.discount_type === 'percentage' ? `${appliedCoupon.discount_value}%` : `₪${appliedCoupon.discount_value}`}`);
        // Update coupon usage - fetch current and increment
        const {
          data: couponData
        } = await supabase.from('coupons').select('current_uses').eq('code', appliedCoupon.code).single();
        if (couponData) {
          await supabase.from('coupons').update({
            current_uses: couponData.current_uses + 1
          }).eq('code', appliedCoupon.code);
        }
      }
      if (deviceImages.length > 0) {
        notes.push(`תמונות מכשיר: ${deviceImages.length} תמונות צורפו`);
      }
      await addOrder({
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerAddress: customerAddress.trim(),
        deviceType: selectedModel?.name || '',
        issueDescription: repairDescription,
        repairPrice: getFinalPrice(),
        status: 'pending',
        accessories: [],
        notes,
        wantsPromotions: false
      });

      // Send notifications (email + WhatsApp)
      try {
        const repairTypeForNotification = selectedBundleAddon && currentBundle ? `${getRepairTypeName()} + החלפת סוללה (חבילה -${currentBundle.discount_percent}%)` : getRepairTypeName();
        await supabase.functions.invoke('send-order-notifications', {
          body: {
            customerName: customerName.trim(),
            customerPhone: customerPhone.trim(),
            customerAddress: customerAddress.trim(),
            deviceType: selectedModel?.name || '',
            repairType: repairTypeForNotification,
            repairPrice: getFinalPrice(),
            scheduledTime: scheduleNote,
            notes: customerNotes.trim(),
            promotionTitle: activePromotion ? `${activePromotion.title} - ${activePromotion.description}` : undefined
          }
        });
        console.log('Notifications sent successfully');
      } catch (notificationError) {
        console.error('Error sending notifications:', notificationError);
        // Don't fail the order if notifications fail
      }

      // Track Facebook Pixel Purchase event
      trackPurchase(getFinalPrice());
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
            if (step === 'model') navigate('/');else if (step === 'repair') goToStep('model');else if (step === 'bundle') goToStep('repair');else if (step === 'price') {
              if (currentBundle) goToStep('bundle');else goToStep('repair');
            } else if (step === 'schedule') goToStep('price');else if (step === 'details') goToStep('schedule');else navigate('/');
          }} className="rounded-full h-9 w-9">
              <ArrowRight className="w-4 h-4" />
            </Button>
            <img src={logo} alt="Logo" className="h-7 w-auto" />
            <h1 className="text-base font-semibold">הזמנת תיקון</h1>
          </div>
          <div className="flex items-center gap-1">
            <a href="tel:033106020" className="h-9 w-9 rounded-full bg-green-500 hover:bg-green-600 text-white flex items-center justify-center transition-colors" aria-label="התקשר 033106020">
              <Phone className="w-4 h-4" />
            </a>
            <Button variant="ghost" size="icon" onClick={() => {
            const event = new CustomEvent('open-accessibility-widget');
            window.dispatchEvent(event);
          }} className="h-9 w-9 rounded-full bg-blue-500 text-white hover:bg-blue-600 hover:text-white">
              <Accessibility className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={toggleTheme} className="h-9 w-9 rounded-full">
              {resolvedTheme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
          </div>
        </div>
        
        {/* Progress bar */}
        {step !== 'success' && <div className="px-3 pb-2">
            <div className="flex gap-1.5">
              {['model', 'repair', 'price', 'schedule', 'details'].map((s, i) => {
            const allSteps = ['model', 'repair', 'bundle', 'price', 'schedule', 'details'];
            const displaySteps = ['model', 'repair', 'price', 'schedule', 'details'];
            const currentIdx = allSteps.indexOf(step);
            const displayIdx = displaySteps.indexOf(s);
            // Map bundle to be between repair (1) and price (2)
            const adjustedCurrentIdx = currentIdx >= 3 ? currentIdx - 1 : currentIdx === 2 ? 1.5 : currentIdx;
            return <div key={s} className={`h-1 flex-1 rounded-full transition-all duration-500 ${adjustedCurrentIdx >= displayIdx ? 'bg-primary' : 'bg-muted'}`} />;
          })}
            </div>
          </div>}
      </div>

      {/* Gift Animation Overlay - Dynamic from DB */}
      {showGiftAnimation && activePromotion && <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-sm animate-fade-in">
          <div className="text-center space-y-4">
            <div className="relative animate-bounce">
              <div className="w-24 h-24 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-2xl mx-auto">
                <Gift className="w-12 h-12 text-white animate-pulse" />
              </div>
              <div className="absolute -top-2 -right-2 text-3xl animate-spin-slow">✨</div>
              <div className="absolute -bottom-2 -left-2 text-3xl animate-spin-slow" style={{
            animationDelay: '200ms'
          }}>{getPromotionIcon(activePromotion.icon)}</div>
            </div>
            <div className="space-y-2 animate-scale-in" style={{
          animationDelay: '300ms'
        }}>
              <h3 className="text-xl font-bold text-foreground">{getPromotionIcon(activePromotion.icon)} {activePromotion.title}</h3>
              <div className="bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-amber-500/20 rounded-xl p-4 border border-amber-500/30">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Shield className="w-6 h-6 text-amber-500" />
                  <span className="text-lg font-bold bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
                    {activePromotion.description}
                  </span>
                </div>
                {activePromotion.value && activePromotion.value > 0 && <div className="flex items-center justify-center gap-2 mt-1">
                    <span className="text-sm text-muted-foreground">שווי:</span>
                    <span className="line-through text-sm text-muted-foreground">₪{activePromotion.value}</span>
                    <span className="text-sm font-bold text-success">חינם! 🎉</span>
                  </div>}
                <p className="text-sm text-muted-foreground mt-1">על כל תיקון</p>
              </div>
            </div>
          </div>
        </div>}

      {/* Image Upload Option Dialog */}
      {showImageUploadOption && <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-sm animate-fade-in p-4">
          <Card className="w-full max-w-sm p-6 space-y-5 animate-scale-in">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Camera className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-bold mb-2">רוצה להעלות תמונה?</h3>
              <p className="text-muted-foreground text-sm">
                אפשר להעלות תמונה של מצב המכשיר<br />
                <span className="text-xs">(לא חובה)</span>
              </p>
            </div>
            
            {/* Uploaded images preview */}
            {deviceImages.length > 0 && <div className="flex gap-2 justify-center flex-wrap">
                {deviceImages.map((img, idx) => <div key={idx} className="relative w-16 h-16 rounded-lg overflow-hidden border border-border">
                    <img src={img} alt={`תמונה ${idx + 1}`} className="w-full h-full object-cover" />
                    <button onClick={() => removeImage(idx)} className="absolute top-0 right-0 w-5 h-5 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center">
                      <X className="w-3 h-3" />
                    </button>
                  </div>)}
              </div>}
            
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => continueAfterImageOption(false)}>
                דלג
              </Button>
              <Button className="flex-1 gap-2" onClick={() => {
            if (fileInputRef.current) {
              fileInputRef.current.click();
            }
          }} disabled={isUploadingImage || deviceImages.length >= 3}>
                {isUploadingImage ? <Loader2 className="w-4 h-4 animate-spin" /> : <>
                    <Image className="w-4 h-4" />
                    העלה תמונה
                  </>}
              </Button>
            </div>
            
            {deviceImages.length > 0 && <Button className="w-full" onClick={() => continueAfterImageOption(false)}>
                המשך להזמנה
              </Button>}
            
            <p className="text-center text-xs text-muted-foreground">
              ניתן להעלות עד 3 תמונות
            </p>
          </Card>
          
          {/* Hidden file input */}
          <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
        </div>}

      {/* Content */}
      <div className={`flex-1 p-4 pb-24 overflow-y-auto transition-all duration-200 ${isAnimating ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}>
        
        {/* Privacy Consent Modal */}
        <OrderPrivacyConsent open={showPrivacyConsent} onAccept={() => setShowPrivacyConsent(false)} />

        {/* Promotion Banner - Dynamic from DB */}
        {step === 'model' && activePromotion && <div className="mb-4 animate-fade-in">
            <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/15 to-amber-500/10 rounded-xl p-3 border border-amber-500/20 flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                <Gift className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-amber-600 dark:text-amber-400 text-lg text-center">{activePromotion.title}</p>
                <p className="text-xs font-medium text-secondary-foreground text-center">{activePromotion.description}</p>
                {activePromotion.value && activePromotion.value > 0 && <div className="flex items-center gap-2 mt-1">
                    <span className="text-muted-foreground text-base text-center">שווי:</span>
                    <span className="line-through text-base text-primary text-center">₪{activePromotion.value}</span>
                    <span className="font-bold text-success text-base text-center">חינם! 🎉</span>
                  </div>}
              </div>
            </div>
          </div>}

        {/* Step 1: Select Model - Enhanced Welcome */}
        {step === 'model' && <div className="space-y-8 animate-fade-in">
            {/* Hero Welcome Section - Apple style */}
            <div className="text-center py-8">
              <h1 className="text-5xl font-bold mb-4 tracking-tight">
                הזמנת תיקון
              </h1>
              <p className="text-2xl text-muted-foreground">
                בחרו את הדגם שלכם
              </p>
            </div>

            {/* Smart AI Search */}
            <SmartRepairInput models={models} repairTypes={repairTypes} onModelAndRepairFound={handleSmartModelAndRepair} onModelFound={handleSmartModelOnly} />

            <div className="grid grid-cols-2 gap-4">
              {filteredModels.map((model, index) => {
            const isPro = model.name.includes('Pro');
            return <Card key={model.id} onClick={() => handleModelSelect(model)} className="p-6 cursor-pointer hover:bg-muted/50 border border-border hover:border-primary/40 transition-all duration-300 active:scale-[0.98] rounded-2xl" style={{
              animationDelay: `${index * 40}ms`
            }}>
                    <div className="flex flex-col items-center text-center gap-3">
                      {/* Simple iPhone icon */}
                      <div className="w-12 h-20 bg-muted rounded-xl flex items-center justify-center">
                        <Smartphone className="w-8 h-8 text-muted-foreground" />
                      </div>
                      
                      {/* Model name */}
                      <div>
                        <span className="font-semibold text-lg block">{model.name}</span>
                        {isPro && <span className="text-sm text-muted-foreground">Pro</span>}
                      </div>
                    </div>
                  </Card>;
          })}
            </div>
          </div>}

        {/* Step 2: Select Repair Type */}
        {step === 'repair' && <div className="space-y-6 animate-fade-in">
            <div className="text-center mb-6">
              <p className="text-muted-foreground text-xl mb-2">{selectedModel?.name}</p>
              <h2 className="text-4xl font-bold">מה צריך לתקן?</h2>
            </div>

            <div className="space-y-3">
              {repairTypes.map((repair, index) => {
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
            const getIcon = () => {
              if (isOriginalScreen || isCompatibleScreen) return Smartphone;
              if (isBattery) return Battery;
              return Phone;
            };
            const IconComponent = getIcon();
            return <Card key={repair.id} onClick={() => handleRepairSelect(repair)} className={`p-5 cursor-pointer transition-all duration-200 active:scale-[0.98] rounded-2xl border ${isPhoneOnly ? 'border-dashed border-muted-foreground/30' : 'border-border hover:border-primary/40 hover:bg-muted/30'}`}>
                    <div className="flex items-center gap-4">
                      {/* Simple Icon */}
                      <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center">
                        <IconComponent className="w-7 h-7 text-foreground/70" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-xl">{repair.name}</h3>
                          {!isPhoneOnly && info && <Dialog>
                              <DialogTrigger asChild>
                                <button type="button" onClick={e => e.stopPropagation()} className="text-muted-foreground hover:text-primary transition-colors p-1">
                                  <HelpCircle className="w-5 h-5" />
                                </button>
                              </DialogTrigger>
                              <DialogContent className="max-w-sm" onClick={e => e.stopPropagation()}>
                                <DialogHeader>
                                  <DialogTitle className="text-right">{info.title}</DialogTitle>
                                </DialogHeader>
                                <p className="text-base text-muted-foreground text-right leading-relaxed">
                                  {info.description}
                                </p>
                              </DialogContent>
                            </Dialog>}
                        </div>
                        {repair.description && <p className="text-muted-foreground text-base mt-1">{repair.description}</p>}
                        {!isPhoneOnly && selectedModel && <p className="text-2xl font-bold text-primary mt-2">₪{price}</p>}
                      </div>
                      
                      {!isPhoneOnly && <ArrowRight className="w-5 h-5 text-muted-foreground rotate-180" />}
                    </div>
                  </Card>;
          })}
            </div>
          </div>}

        {/* Step 2.5: Bundle Offer */}
        {step === 'bundle' && currentBundle && selectedModel && <div className="space-y-5 animate-fade-in">
            <div className="text-center mb-6">
              <div className="flex justify-center mb-4">
                <div className="relative">
                  <div className="w-20 h-20 bg-gradient-to-br from-amber-500/20 to-orange-500/10 rounded-full flex items-center justify-center">
                    <Gift className="w-10 h-10 text-amber-500 animate-bounce-slow" />
                  </div>
                  <div className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs px-2 py-1 rounded-full font-bold shadow-lg animate-pulse">
                    -{currentBundle.discount_percent}%
                  </div>
                </div>
              </div>
              <h2 className="font-bold mb-2 text-xl">הצעה מיוחדת! 🎉</h2>
              <p className="text-muted-foreground text-sm">מצאנו לך מבצע משתלם</p>
            </div>

            <Card className="p-5 bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-card border-2 border-amber-500/30">
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <Smartphone className="w-6 h-6 text-primary" />
                    </div>
                    <span className="text-xs text-muted-foreground mt-1">{selectedRepair?.name}</span>
                  </div>
                  <span className="text-2xl">+</span>
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 bg-amber-500/20 rounded-full flex items-center justify-center">
                      <Battery className="w-6 h-6 text-amber-500" />
                    </div>
                    <span className="text-xs text-muted-foreground mt-1">החלפת סוללה</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-lg font-bold">
                    הוסף החלפת סוללה ב-
                    <span className="text-amber-500">{currentBundle.discount_percent}% הנחה!</span>
                  </p>
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-muted-foreground line-through text-sm">₪{selectedModel.battery_price}</span>
                    <span className="text-2xl font-bold text-success">₪{Math.round(selectedModel.battery_price * (1 - currentBundle.discount_percent / 100))}</span>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground">
                  💡 רוב הלקוחות שמחליפים מסך מוסיפים גם סוללה חדשה
                </p>
              </div>
            </Card>

            <div className="space-y-3">
              <Button onClick={() => handleBundleDecision(true)} className="w-full h-14 text-base font-bold rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg">
                <Battery className="w-5 h-5 ml-2" />
                כן, תוסיפו סוללה בהנחה!
              </Button>
              
              <Button variant="outline" onClick={() => handleBundleDecision(false)} className="w-full h-12 text-sm rounded-xl">
                לא תודה, רק {selectedRepair?.name}
              </Button>
            </div>

            <p className="text-center text-xs text-muted-foreground">
              🔋 סוללה מקורית עם 100% בריאות
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
                    ₪{getTotalPrice()}
                  </div>
                </div>
              </div>
              <h2 className="font-bold mb-2 text-3xl">סיכום הזמנה</h2>
              <p className="text-muted-foreground text-lg">אישור מחיר התיקון</p>
            </div>

            <Card className="p-4 bg-gradient-to-br from-card to-muted/30">
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">דגם</span>
                  <span className="font-semibold">{selectedModel?.name}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">סוג תיקון</span>
                  <div className="text-left">
                    <span className="font-semibold">{getRepairTypeName()}</span>
                    <span className="text-muted-foreground mr-2">₪{getPrice()}</span>
                  </div>
                </div>
                
                {/* Bundle Addon */}
                {selectedBundleAddon && currentBundle && selectedModel && <div className="flex justify-between items-center text-sm bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-lg p-2 -mx-1">
                    <span className="text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1.5">
                      <Battery className="w-4 h-4" /> החלפת סוללה
                      <span className="text-[10px] bg-amber-500 text-white px-1.5 py-0.5 rounded-full">-{currentBundle.discount_percent}%</span>
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs line-through text-muted-foreground">₪{selectedModel.battery_price}</span>
                      <span className="font-semibold text-success">₪{getBundleAddonPrice()}</span>
                    </div>
                  </div>}
                
                {/* Active Promotion - Dynamic */}
                {activePromotion && <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-lg p-3 -mx-1 space-y-1">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1.5">
                        {getPromotionIcon(activePromotion.icon)} {activePromotion.title}
                      </span>
                      <span className="font-semibold text-success">{activePromotion.description}</span>
                    </div>
                    {activePromotion.value && activePromotion.value > 0 && <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground text-xs">שווי הטבה</span>
                        <div className="flex items-center gap-2">
                          <span className="line-through text-xs text-muted-foreground">₪{activePromotion.value}</span>
                          <span className="font-bold text-success">חינם! 🎉</span>
                        </div>
                      </div>}
                  </div>}

                {/* Static Benefits - Website Order Perks */}
                <div className="border-t border-border pt-3 mt-2 space-y-2.5">
                  <p className="text-xs font-semibold text-muted-foreground mb-2">🎁 הטבות למזמינים דרך האתר</p>
                  
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-foreground flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-primary" />
                      הגעה ותיקון במקום — ללא עלות נוספת
                    </span>
                    <span className="font-semibold text-success">₪0</span>
                  </div>

                  <div className="flex justify-between items-center text-sm">
                    <span className="text-foreground flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5 text-primary" />
                      אחריות מורחבת למסכים — 4 חודשים
                    </span>
                    <span className="font-semibold text-success">₪0</span>
                  </div>

                  <div className="flex justify-between items-center text-sm">
                    <span className="text-foreground flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5 text-primary" />
                      אחריות מורחבת לסוללות — 13 חודשים
                    </span>
                    <span className="font-semibold text-success">₪0</span>
                  </div>

                  <p className="text-[10px] text-muted-foreground mt-1">
                    * במקום 3 חודשי אחריות למסכים ו-12 חודשים לסוללות בהזמנה רגילה
                  </p>
                </div>
                
                {/* Coupon Section */}
                <div className="border-t border-border pt-3">
                  <label className="block text-xs font-medium mb-2 text-muted-foreground">
                    יש לך קוד קופון?
                  </label>
                  {appliedCoupon ? <div className="flex items-center gap-2 bg-success/10 border border-success/30 rounded-xl px-3 py-2">
                      <Tag className="w-4 h-4 text-success" />
                      <span className="flex-1 font-mono font-medium text-success">{appliedCoupon.code}</span>
                      <span className="text-sm text-success font-bold">
                        -{appliedCoupon.discount_type === 'percentage' ? `${appliedCoupon.discount_value}%` : `₪${appliedCoupon.discount_value}`}
                      </span>
                      <button onClick={removeCoupon} className="text-muted-foreground hover:text-foreground">
                        <X className="w-4 h-4" />
                      </button>
                    </div> : <div className="flex gap-2">
                      <Input placeholder="הכנס קוד קופון" value={couponCode} onChange={e => setCouponCode(e.target.value.toUpperCase())} className="h-9 text-sm rounded-lg font-mono flex-1" />
                      <Button variant="outline" onClick={validateCoupon} disabled={!couponCode.trim() || isValidatingCoupon} className="h-9 rounded-lg text-xs">
                        {isValidatingCoupon ? <Loader2 className="w-4 h-4 animate-spin" /> : 'הפעל'}
                      </Button>
                    </div>}
                </div>

                <div className="border-t border-border pt-3 mt-3">
                  <div className="flex justify-between items-center">
                    <span className="font-bold">סה"כ</span>
                    <div className="text-right">
                      {appliedCoupon && <span className="text-muted-foreground line-through text-sm mr-2">₪{getTotalPrice()}</span>}
                      <span className="text-xl font-bold text-primary">₪{getFinalPrice()}</span>
                    </div>
                  </div>
                  {appliedCoupon && <div className="text-xs text-success mt-1 text-left">
                      🎉 חיסכת ₪{getDiscount()} עם קופון {appliedCoupon.code}!
                    </div>}
                  {selectedBundleAddon && currentBundle && <div className="text-xs text-amber-500 mt-1 text-left">
                      🔋 כולל סוללה בהנחה של {currentBundle.discount_percent}%
                    </div>}
                </div>
              </div>
            </Card>

            {/* Payment Info with Icons */}
            <div className="bg-muted/50 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">תשלום בסיום התיקון בלבד</p>
                    <p className="text-muted-foreground text-xs mt-0.5">
                      מזומן, אשראי או ביט
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Payment Method Icons */}
              <div className="flex items-center justify-center gap-4 mt-4 pt-3 border-t border-border">
                {/* Apple Pay */}
                <div className="flex flex-col items-center gap-1">
                  <div className="w-12 h-8 bg-foreground rounded-md flex items-center justify-center">
                    <svg viewBox="0 0 24 24" className="w-6 h-4 text-background" fill="currentColor">
                      <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.07-.5-2.04-.48-3.16 0-1.4.62-2.14.44-2.98-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                    </svg>
                  </div>
                  <span className="text-[10px] text-muted-foreground">Apple Pay</span>
                </div>
                
                {/* Google Pay */}
                <div className="flex flex-col items-center gap-1">
                  <div className="w-12 h-8 bg-card border border-border rounded-md flex items-center justify-center">
                    <svg viewBox="0 0 24 24" className="w-6 h-4" fill="none">
                      <path d="M12.24 10.285V14.4h6.806c-.275 1.765-2.056 5.174-6.806 5.174-4.095 0-7.439-3.389-7.439-7.574s3.345-7.574 7.439-7.574c2.33 0 3.891.989 4.785 1.849l3.254-3.138C18.189 1.186 15.479 0 12.24 0c-6.635 0-12 5.365-12 12s5.365 12 12 12c6.926 0 11.52-4.869 11.52-11.726 0-.788-.085-1.39-.189-1.989H12.24z" fill="#4285F4" />
                    </svg>
                  </div>
                  <span className="text-[10px] text-muted-foreground">Google Pay</span>
                </div>
                
                {/* Credit Card */}
                <div className="flex flex-col items-center gap-1">
                  <div className="w-12 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-md flex items-center justify-center">
                    <svg viewBox="0 0 24 24" className="w-5 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                      <line x1="1" y1="10" x2="23" y2="10" />
                    </svg>
                  </div>
                  <span className="text-[10px] text-muted-foreground">אשראי</span>
                </div>
                
                {/* Cash */}
                <div className="flex flex-col items-center gap-1">
                  <div className="w-12 h-8 bg-gradient-to-br from-success to-green-600 rounded-md flex items-center justify-center">
                    <span className="text-white text-sm font-bold">₪</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground">מזומן</span>
                </div>
              </div>
            </div>
          </div>}

        {/* Step 4: Schedule */}
        {step === 'schedule' && <div className="space-y-4 animate-fade-in">
            <div className="text-center mb-4">
              <div className="flex justify-center mb-3">
                <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-primary/5 rounded-full flex items-center justify-center">
                  <Calendar className="w-10 h-10 text-primary" />
                </div>
              </div>
              <h2 className="text-3xl font-bold mb-2">קביעת מועד</h2>
              <p className="text-muted-foreground text-lg">מתי נוח שהטכנאי יגיע?</p>
            </div>

            {/* Date selection */}
            <div>
              <label className="block text-base font-medium mb-3 text-muted-foreground">בחר יום</label>
              <div className="grid grid-cols-4 gap-3">
                {getAvailableDates().map((date, index) => {
              const dayName = hebrewDays[date.getDay()];
              const isToday = index === 0;
              const isSelected = selectedDate?.toDateString() === date.toDateString();
              const hasAvailableSlots = getTimeSlotsForDate(date).some(slot => isSlotAvailable(date, slot));
              return <button key={index} onClick={() => {
                setSelectedDate(date);
                setSelectedTimeSlot('');
              }} disabled={!hasAvailableSlots} className={`p-3 rounded-xl border text-center transition-all ${isSelected ? 'border-primary bg-primary/10 text-primary' : hasAvailableSlots ? 'border-border hover:border-primary/50' : 'border-border/50 opacity-50 cursor-not-allowed'}`}>
                      <div className="text-base font-semibold">{isToday ? 'היום' : dayName}</div>
                      <div className="text-base text-muted-foreground">{date.getDate()}/{date.getMonth() + 1}</div>
                    </button>;
            })}
              </div>
            </div>

            {/* Time slot selection */}
            {selectedDate && <div className="animate-fade-in">
                <label className="block text-base font-medium mb-3 text-muted-foreground">בחר שעה</label>
                <div className="grid grid-cols-2 gap-3">
                  {getTimeSlotsForDate(selectedDate).map(slot => {
              const isAvailable = isSlotAvailable(selectedDate, slot);
              const isSelected = selectedTimeSlot === slot;
              return <button key={slot} onClick={() => setSelectedTimeSlot(slot)} disabled={!isAvailable} className={`p-4 rounded-xl border text-center transition-all flex items-center justify-center gap-2 ${isSelected ? 'border-primary bg-primary/10 text-primary' : isAvailable ? 'border-border hover:border-primary/50' : 'border-border/50 opacity-50 cursor-not-allowed'}`}>
                        <Clock className="w-5 h-5" />
                        <span className="text-lg font-medium">{slot}</span>
                      </button>;
            })}
                </div>
              </div>}

            {selectedDate && selectedTimeSlot && <Card className="p-4 bg-primary/5 border-primary/20 animate-fade-in">
                <p className="text-lg text-center">
                  <span className="text-muted-foreground">מועד נבחר: </span>
                  <span className="font-semibold">{formatSelectedDateTime()}</span>
                </p>
              </Card>}
          </div>}

        {/* Step 5: Customer Details */}
        {step === 'details' && <div className="space-y-4 animate-fade-in">
            <div className="text-center mb-6">
              <div className="flex justify-center mb-3">
                <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-primary/5 rounded-full flex items-center justify-center">
                  <MapPin className="w-10 h-10 text-primary" />
                </div>
              </div>
              <h2 className="text-3xl font-bold mb-2">פרטי הזמנה</h2>
              <p className="text-muted-foreground text-lg">לאן לשלוח את הטכנאי?</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-base font-medium mb-2">שם מלא</label>
                <Input placeholder="הכנס שם מלא" value={customerName} onChange={e => setCustomerName(e.target.value)} className="h-14 text-lg rounded-xl" />
              </div>

              <div>
                <label className="block text-base font-medium mb-2">מספר טלפון</label>
                <Input placeholder="050-0000000" value={customerPhone} onChange={e => setCustomerPhone(formatPhone(e.target.value))} type="tel" className="h-14 text-lg rounded-xl text-left" dir="ltr" />
              </div>

              <div>
                <label className="block text-base font-medium mb-2">כתובת (עיר, רחוב, מספר בית/דירה)</label>
                <Input placeholder="למשל: הרצליה, סוקולוב 15, דירה 4" value={customerAddress} onChange={e => setCustomerAddress(e.target.value)} className="h-14 text-lg rounded-xl" />
                <div className="mt-2 p-3 bg-primary/10 border border-primary/20 rounded-lg flex items-center gap-2">
                  <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-4 h-4 text-primary" />
                  </div>
                  <p className="text-sm text-foreground">
                    <span className="font-medium">אזור השירות:</span> השרון, המרכז וגוש דן (ממודיעין ועד נתניה)
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-base font-medium mb-2">
                  הערות לטכנאי <span className="text-muted-foreground">(לא חובה)</span>
                </label>
                <Textarea placeholder="למשל: קומה 3, יש אינטרקום, לחייג בהגעה..." value={customerNotes} onChange={e => setCustomerNotes(e.target.value)} className="text-lg rounded-xl resize-none" rows={2} />
              </div>

              {/* Uploaded Images Display */}
              {deviceImages.length > 0 && <div>
                  <label className="block text-xs font-medium mb-1.5">
                    תמונות שהועלו
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    {deviceImages.map((url, index) => <div key={index} className="relative w-16 h-16 rounded-lg overflow-hidden border border-border">
                        <img src={url} alt={`תמונה ${index + 1}`} className="w-full h-full object-cover" />
                      </div>)}
                  </div>
                </div>}
            </div>

            {/* Consent Checkboxes */}
            <div className="space-y-4 mt-6 pt-6 border-t border-border">
              <label className="flex items-start gap-3 cursor-pointer">
                <Checkbox checked={acceptPrivacy} onCheckedChange={checked => setAcceptPrivacy(checked === true)} className="mt-1 w-5 h-5" />
                <span className="text-base text-muted-foreground leading-relaxed">
                  אני מאשר/ת שקראתי והסכמתי ל<span className="text-primary font-medium">מדיניות הפרטיות</span> ו<span className="text-primary font-medium">תנאי השימוש</span>
                </span>
              </label>
              
              <label className="flex items-start gap-3 cursor-pointer">
                <Checkbox checked={acceptContact} onCheckedChange={checked => setAcceptContact(checked === true)} className="mt-1 w-5 h-5" />
                <span className="text-base text-muted-foreground leading-relaxed">
                  אני מסכים/ה לקבל עדכונים בוואטסאפ או בשיחת טלפון לגבי התיקון ולאחריו
                </span>
              </label>
            </div>

            <Card className="p-4 bg-muted/30">
              <div className="flex justify-between items-center text-base">
                <span className="font-medium">{selectedModel?.name} • {getRepairTypeName()}</span>
                <div className="text-right">
                  {appliedCoupon && <span className="text-muted-foreground line-through mr-2 text-base">₪{getPrice()}</span>}
                  <span className="font-bold text-primary text-xl">₪{getFinalPrice()}</span>
                </div>
              </div>
              {appliedCoupon && <div className="text-base text-success mt-2">
                  קופון {appliedCoupon.code} - חיסכת ₪{getDiscount()}!
                </div>}
              <div className="text-base text-muted-foreground mt-2">
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
          
          {step === 'details' && <Button onClick={handleSubmit} disabled={isSubmitting || !acceptPrivacy || !acceptContact} className="w-full h-12 text-base rounded-xl">
              {isSubmitting ? <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  שולח...
                </div> : 'שלח הזמנה'}
            </Button>}
        </div>}
    </div>;
};
export default NewRepairOrder;