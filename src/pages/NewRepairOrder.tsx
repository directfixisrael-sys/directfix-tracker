import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ArrowRight, Smartphone, Battery, Phone, CheckCircle2, Sparkles, Wrench, MapPin, Loader2, HelpCircle, Moon, Sun, Calendar, Clock, Gift, Shield, Tag, Camera, X, Image, Accessibility, Check, FlipVertical } from 'lucide-react';
import { useRepairStore } from '@/store/repairStore';
import { useTheme } from '@/components/ThemeProvider';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import Logo from '@/components/Logo';
import midragLogo from '@/assets/midrag-logo.png';
import easyLogo from '@/assets/easy-logo.png';
import { trackPurchase, trackAddToCart } from '@/lib/fbPixel';
import { gaSelectModel, gaSelectRepair, gaBundleDecision, gaConfirmPrice, gaSelectSchedule, gaFillDetails, gaConversion, gaCouponApplied, gaStartOrder } from '@/lib/gtag';
import OrderPrivacyConsent from '@/components/OrderPrivacyConsent';
import SmartRepairInput from '@/components/SmartRepairInput';
import TestimonialsSlider from '@/components/TestimonialsSlider';
import ModelPicker from '@/components/ModelPicker';
import GiftPromoPopup from '@/components/GiftPromoPopup';
import AddressAutocomplete from '@/components/AddressAutocomplete';
import { getLeadSource } from '@/lib/leadSource';

// iPhone back glass colors per model family
const iphoneBackColors: Record<string, { name: string; hex: string }[]> = {
  'iPhone 16 Pro Max': [
    { name: 'טיטניום מדברי', hex: '#C4A882' },
    { name: 'טיטניום טבעי', hex: '#D4CFC7' },
    { name: 'טיטניום שחור', hex: '#3C3C3C' },
    { name: 'טיטניום לבן', hex: '#F0EDE8' },
  ],
  'iPhone 16 Pro': [
    { name: 'טיטניום מדברי', hex: '#C4A882' },
    { name: 'טיטניום טבעי', hex: '#D4CFC7' },
    { name: 'טיטניום שחור', hex: '#3C3C3C' },
    { name: 'טיטניום לבן', hex: '#F0EDE8' },
  ],
  'iPhone 16 Plus': [
    { name: 'כחול אולטרמרין', hex: '#5B6FAE' },
    { name: 'טיל', hex: '#4B8C8C' },
    { name: 'ורוד', hex: '#F2C6CF' },
    { name: 'לבן', hex: '#F5F5F0' },
    { name: 'שחור', hex: '#2C2C2C' },
  ],
  'iPhone 16': [
    { name: 'כחול אולטרמרין', hex: '#5B6FAE' },
    { name: 'טיל', hex: '#4B8C8C' },
    { name: 'ורוד', hex: '#F2C6CF' },
    { name: 'לבן', hex: '#F5F5F0' },
    { name: 'שחור', hex: '#2C2C2C' },
  ],
  'iPhone 15 Pro Max': [
    { name: 'טיטניום טבעי', hex: '#C2BEB6' },
    { name: 'טיטניום כחול', hex: '#3E4F5E' },
    { name: 'טיטניום לבן', hex: '#E8E4DF' },
    { name: 'טיטניום שחור', hex: '#3A3A3C' },
  ],
  'iPhone 15 Pro': [
    { name: 'טיטניום טבעי', hex: '#C2BEB6' },
    { name: 'טיטניום כחול', hex: '#3E4F5E' },
    { name: 'טיטניום לבן', hex: '#E8E4DF' },
    { name: 'טיטניום שחור', hex: '#3A3A3C' },
  ],
  'iPhone 15 Plus': [
    { name: 'שחור', hex: '#3A3A3C' },
    { name: 'כחול', hex: '#7C96AB' },
    { name: 'ירוק', hex: '#CAD5B2' },
    { name: 'צהוב', hex: '#F3E5B0' },
    { name: 'ורוד', hex: '#F2C6CF' },
  ],
  'iPhone 15': [
    { name: 'שחור', hex: '#3A3A3C' },
    { name: 'כחול', hex: '#7C96AB' },
    { name: 'ירוק', hex: '#CAD5B2' },
    { name: 'צהוב', hex: '#F3E5B0' },
    { name: 'ורוד', hex: '#F2C6CF' },
  ],
  'iPhone 14 Pro Max': [
    { name: 'סגול עמוק', hex: '#5B4A6E' },
    { name: 'זהב', hex: '#F4E8CE' },
    { name: 'כסוף', hex: '#E5E5E0' },
    { name: 'שחור חלל', hex: '#3A3A3C' },
  ],
  'iPhone 14 Pro': [
    { name: 'סגול עמוק', hex: '#5B4A6E' },
    { name: 'זהב', hex: '#F4E8CE' },
    { name: 'כסוף', hex: '#E5E5E0' },
    { name: 'שחור חלל', hex: '#3A3A3C' },
  ],
  'iPhone 14 Plus': [
    { name: 'כחול', hex: '#A0B4C8' },
    { name: 'סגול', hex: '#C7B8D6' },
    { name: 'חצות', hex: '#2C3E50' },
    { name: 'אור כוכבים', hex: '#FAF6F2' },
    { name: 'אדום', hex: '#C0392B' },
    { name: 'צהוב', hex: '#F7E96E' },
  ],
  'iPhone 14': [
    { name: 'כחול', hex: '#A0B4C8' },
    { name: 'סגול', hex: '#C7B8D6' },
    { name: 'חצות', hex: '#2C3E50' },
    { name: 'אור כוכבים', hex: '#FAF6F2' },
    { name: 'אדום', hex: '#C0392B' },
    { name: 'צהוב', hex: '#F7E96E' },
  ],
  'iPhone 13 Pro Max': [
    { name: 'ירוק אלפיני', hex: '#505F4E' },
    { name: 'כסוף', hex: '#E5E5E0' },
    { name: 'זהב', hex: '#FAE7CF' },
    { name: 'גרפיט', hex: '#54524F' },
    { name: 'כחול סיירה', hex: '#9BB5CE' },
  ],
  'iPhone 13 Pro': [
    { name: 'ירוק אלפיני', hex: '#505F4E' },
    { name: 'כסוף', hex: '#E5E5E0' },
    { name: 'זהב', hex: '#FAE7CF' },
    { name: 'גרפיט', hex: '#54524F' },
    { name: 'כחול סיירה', hex: '#9BB5CE' },
  ],
  'iPhone 13': [
    { name: 'ירוק', hex: '#394C38' },
    { name: 'ורוד', hex: '#FADDD7' },
    { name: 'כחול', hex: '#276787' },
    { name: 'חצות', hex: '#232A31' },
    { name: 'אור כוכבים', hex: '#FAF6F2' },
    { name: 'אדום', hex: '#C0392B' },
  ],
  'iPhone 13 Mini': [
    { name: 'ירוק', hex: '#394C38' },
    { name: 'ורוד', hex: '#FADDD7' },
    { name: 'כחול', hex: '#276787' },
    { name: 'חצות', hex: '#232A31' },
    { name: 'אור כוכבים', hex: '#FAF6F2' },
    { name: 'אדום', hex: '#C0392B' },
  ],
  'iPhone 12 Pro Max': [
    { name: 'כחול פסיפי', hex: '#2D4E6F' },
    { name: 'זהב', hex: '#FAE7CF' },
    { name: 'גרפיט', hex: '#54524F' },
    { name: 'כסוף', hex: '#E5E5E0' },
  ],
  'iPhone 12 Pro': [
    { name: 'כחול פסיפי', hex: '#2D4E6F' },
    { name: 'זהב', hex: '#FAE7CF' },
    { name: 'גרפיט', hex: '#54524F' },
    { name: 'כסוף', hex: '#E5E5E0' },
  ],
  'iPhone 12': [
    { name: 'שחור', hex: '#2C2C2C' },
    { name: 'לבן', hex: '#F5F5F0' },
    { name: 'כחול', hex: '#023C69' },
    { name: 'ירוק', hex: '#D8E8D2' },
    { name: 'אדום', hex: '#C0392B' },
    { name: 'סגול', hex: '#B6A5C9' },
  ],
  'iPhone 12 Mini': [
    { name: 'שחור', hex: '#2C2C2C' },
    { name: 'לבן', hex: '#F5F5F0' },
    { name: 'כחול', hex: '#023C69' },
    { name: 'ירוק', hex: '#D8E8D2' },
    { name: 'אדום', hex: '#C0392B' },
    { name: 'סגול', hex: '#B6A5C9' },
  ],
  'iPhone 11 Pro Max': [
    { name: 'ירוק חצות', hex: '#4E5851' },
    { name: 'כסוף', hex: '#EBEBE3' },
    { name: 'אפור חלל', hex: '#535150' },
    { name: 'זהב', hex: '#FAD7BD' },
  ],
  'iPhone 11 Pro': [
    { name: 'ירוק חצות', hex: '#4E5851' },
    { name: 'כסוף', hex: '#EBEBE3' },
    { name: 'אפור חלל', hex: '#535150' },
    { name: 'זהב', hex: '#FAD7BD' },
  ],
  'iPhone 11': [
    { name: 'שחור', hex: '#2C2C2C' },
    { name: 'ירוק', hex: '#AED1A0' },
    { name: 'צהוב', hex: '#FFE681' },
    { name: 'סגול', hex: '#D1CDDA' },
    { name: 'אדום', hex: '#C0392B' },
    { name: 'לבן', hex: '#F5F5F0' },
  ],
  'iPhone XR': [
    { name: 'שחור', hex: '#2C2C2C' },
    { name: 'לבן', hex: '#F5F5F0' },
    { name: 'כחול', hex: '#5EB0E5' },
    { name: 'צהוב', hex: '#F9D045' },
    { name: 'קורל', hex: '#FF6E54' },
    { name: 'אדום', hex: '#C0392B' },
  ],
  'iPhone XS Max': [
    { name: 'זהב', hex: '#F4E8CE' },
    { name: 'כסוף', hex: '#E5E5E0' },
    { name: 'אפור חלל', hex: '#535150' },
  ],
  'iPhone XS': [
    { name: 'זהב', hex: '#F4E8CE' },
    { name: 'כסוף', hex: '#E5E5E0' },
    { name: 'אפור חלל', hex: '#535150' },
  ],
  'iPhone X': [
    { name: 'כסוף', hex: '#E5E5E0' },
    { name: 'אפור חלל', hex: '#535150' },
  ],
  'iPhone 8': [
    { name: 'זהב', hex: '#F4E8CE' },
    { name: 'כסוף', hex: '#E5E5E0' },
    { name: 'אפור חלל', hex: '#535150' },
    { name: 'אדום', hex: '#C0392B' },
  ],
};

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
  back_glass_price: number;
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

  // Form fields
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerNotes, setCustomerNotes] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
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
  const [selectedBackColor, setSelectedBackColor] = useState<string>('');
  const [showBackColorPicker, setShowBackColorPicker] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  // Privacy consent
  const [showPrivacyConsent, setShowPrivacyConsent] = useState(false);

  // Gift promo popup
  const [showGiftPopup, setShowGiftPopup] = useState(false);
  const [giftClaimed, setGiftClaimed] = useState(false);

  // Broadcast initial step on mount
  useEffect(() => {
    window.dispatchEvent(new CustomEvent('repair-step-change', { detail: { step: 'model' } }));
  }, []);

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
          // Show gift popup if not already claimed this session
          const alreadyClaimed = sessionStorage.getItem('gift_promo_claimed');
          if (!alreadyClaimed) {
            setTimeout(() => setShowGiftPopup(true), 800);
          } else {
            setGiftClaimed(true);
          }
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

  // Check if a time slot is available (at least 40 minutes from now)
  const isSlotAvailable = (date: Date, slot: string) => {
    const now = new Date();
    const slotStartHour = parseInt(slot.split(':')[0]);

    // Create date with slot start time
    const slotDate = new Date(date);
    slotDate.setHours(slotStartHour, 0, 0, 0);

    // Must be at least 40 minutes from now
    const minTimeFromNow = new Date(now.getTime() + 40 * 60 * 1000);
    return slotDate > minTimeFromNow;
  };
  const filteredModels = models.filter(model => model.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const getPrice = () => {
    if (!selectedModel || !selectedRepair) return 0;
    const isOriginalScreen = selectedRepair.name.includes('מסך מקורי');
    const isCompatibleScreen = selectedRepair.name.includes('מסך תואם');
    const isBattery = selectedRepair.name.includes('סוללה');
    const isBackGlass = selectedRepair.name.includes('גב');
    if (isOriginalScreen) return selectedModel.original_screen_price;
    if (isCompatibleScreen) return selectedModel.compatible_screen_price;
    if (isBattery) return selectedModel.battery_price;
    if (isBackGlass) return selectedModel.back_glass_price;
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
      // Broadcast step change for live tracking
      window.dispatchEvent(new CustomEvent('repair-step-change', { detail: { step: newStep } }));
      // Scroll to top using ref
      if (contentRef.current) {
        contentRef.current.scrollTop = 0;
      }
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'instant'
      });
    }, 200);
  };
  const handleModelSelect = (model: IphoneModel) => {
    setSelectedModel(model);
    gaSelectModel(model.name);
    goToStep('repair');
  };

  // Smart search handlers
  const handleSmartModelAndRepair = (modelName: string, repairName: string) => {
    const model = models.find(m => m.name === modelName);
    const repair = repairTypes.find(r => r.name === repairName);
    if (model && repair) {
      setSelectedModel(model);
      setSelectedRepair(repair);

      // Track AddToCart
      const isOriginalScreen = repair.name.includes('מסך מקורי');
      const isCompatibleScreen = repair.name.includes('מסך תואם');
      const isBattery = repair.name.includes('סוללה');
      const isBackGlass = repair.name.includes('גב');
      let repairPrice = 0;
      if (isOriginalScreen) repairPrice = model.original_screen_price;else if (isCompatibleScreen) repairPrice = model.compatible_screen_price;else if (isBattery) repairPrice = model.battery_price;else if (isBackGlass) repairPrice = model.back_glass_price;
      trackAddToCart(repair.name, repairPrice);
      gaSelectRepair(repair.name, repairPrice);
      // Check bundle
      const isScreenRepair = repair.name.includes('מסך');
      const bundle = repairBundles.find(b => repair.name.includes(b.primary_repair_type));
      if (bundle && isScreenRepair) {
        setCurrentBundle(bundle);
        setSelectedBundleAddon(false);
        goToStep('bundle');
      } else {
        goToStep('price');
      }
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
    
    const isBackGlass = repair.name.includes('גב');
    
    // If back glass, show color picker instead of proceeding
    if (isBackGlass && selectedModel) {
      setSelectedRepair(repair);
      setSelectedBackColor('');
      setShowBackColorPicker(true);
      return;
    }
    
    setSelectedRepair(repair);
    setShowBackColorPicker(false);

    // Track AddToCart event for Facebook Pixel
    if (selectedModel) {
      const isOriginalScreen = repair.name.includes('מסך מקורי');
      const isCompatibleScreen = repair.name.includes('מסך תואם');
      const isBattery = repair.name.includes('סוללה');
      let repairPrice = 0;
      if (isOriginalScreen) repairPrice = selectedModel.original_screen_price;else if (isCompatibleScreen) repairPrice = selectedModel.compatible_screen_price;else if (isBattery) repairPrice = selectedModel.battery_price;
      trackAddToCart(repair.name, repairPrice);
      gaSelectRepair(repair.name, repairPrice);
    }

    // Check if there's a bundle offer for this repair type
    const isScreenRepair = repair.name.includes('מסך');
    const bundle = repairBundles.find(b => repair.name.includes(b.primary_repair_type));
    if (bundle && isScreenRepair) {
      setCurrentBundle(bundle);
      setSelectedBundleAddon(false);
      goToStep('bundle');
    } else {
      goToStep('price');
    }
  };
  
  const handleBackColorConfirm = () => {
    if (!selectedBackColor || !selectedRepair || !selectedModel) return;
    
    // Track
    trackAddToCart(selectedRepair.name, selectedModel.back_glass_price);
    gaSelectRepair(selectedRepair.name, selectedModel.back_glass_price);
    
    setShowBackColorPicker(false);
    goToStep('price');
  };
  const handleBundleDecision = (acceptBundle: boolean) => {
    setSelectedBundleAddon(acceptBundle);
    if (currentBundle) gaBundleDecision(acceptBundle, currentBundle.name);
    goToStep('price');
  };
  const handlePriceConfirm = () => {
    gaConfirmPrice(getTotalPrice());
    goToStep('schedule');
  };
  const handleScheduleConfirm = () => {
    if (!selectedDate || !selectedTimeSlot) {
      toast.error('אנא בחר תאריך ושעה');
      return;
    }
    gaSelectSchedule(selectedDate.toISOString().split('T')[0], selectedTimeSlot);
    gaFillDetails();
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
      gaCouponApplied(data.code, data.discount_value);
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
      if (selectedBackColor) {
        notes.push(`צבע גב מכשיר: ${selectedBackColor}`);
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
      const leadSource = getLeadSource();
      const orderResult = await addOrder({
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerAddress: customerAddress.trim(),
        deviceType: selectedModel?.name || '',
        issueDescription: repairDescription,
        repairPrice: getFinalPrice(),
        status: 'pending',
        accessories: [],
        notes,
        wantsPromotions: false,
        leadSource: leadSource.source,
        customerEmail: customerEmail.trim() || undefined,
      } as any);

      // Send notifications (email + WhatsApp)
      try {
        const repairTypeForNotification = selectedBundleAddon && currentBundle ? `${getRepairTypeName()} + החלפת סוללה (חבילה -${currentBundle.discount_percent}%)` : getRepairTypeName();
        const colorNote = selectedBackColor ? ` (צבע: ${selectedBackColor})` : '';
        const leadSource = getLeadSource();
        await supabase.functions.invoke('send-order-notifications', {
          body: {
            customerName: customerName.trim(),
            customerPhone: customerPhone.trim(),
            customerAddress: customerAddress.trim(),
            deviceType: selectedModel?.name || '',
            repairType: repairTypeForNotification + colorNote,
            repairPrice: getFinalPrice(),
            scheduledTime: scheduleNote,
            notes: customerNotes.trim(),
            customerEmail: customerEmail.trim() || undefined,
            orderNumber: orderResult?.order_number || undefined,
            promotionTitle: activePromotion ? `${activePromotion.title} - ${activePromotion.description}` : undefined,
            leadSource: leadSource.source,
            leadSourceDetails: leadSource,
          }
        });
        console.log('Notifications sent successfully');
      } catch (notificationError) {
        console.error('Error sending notifications:', notificationError);
        // Don't fail the order if notifications fail
      }

      // Track Facebook Pixel Purchase event
      trackPurchase(getFinalPrice());
      // Track Google Analytics conversion
      gaConversion(getFinalPrice(), selectedModel?.name || '', getRepairTypeName());
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
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto animate-pulse">
            <Wrench className="w-8 h-8 text-primary" />
          </div>
          <p className="text-muted-foreground text-sm font-medium">טוען...</p>
        </div>
      </div>;
  }
  return <div className="min-h-screen bg-background flex flex-col">
      {/* Promotion Strip */}
      {activePromotion && <div className="bg-foreground text-background text-center py-2.5 text-xs font-semibold tracking-wide">
          <span>{getPromotionIcon(activePromotion.icon)} {activePromotion.title} — {activePromotion.description}</span>
          {activePromotion.value && activePromotion.value > 0 && <span className="mr-1 font-bold"> | חינם! 🎉</span>}
        </div>}

      {/* Header - Clean & Minimal */}
      <div className="sticky top-0 bg-background/80 backdrop-blur-xl border-b border-border/40 z-10">
        <div className="flex items-center justify-between p-3 max-w-5xl mx-auto">
          <div className="flex items-center gap-3">
            <button onClick={() => {
            if (step === 'model') navigate('/');else if (step === 'repair') goToStep('model');else if (step === 'bundle') goToStep('repair');else if (step === 'price') {
              if (currentBundle) goToStep('bundle');else goToStep('repair');
            } else if (step === 'schedule') goToStep('price');else if (step === 'details') goToStep('schedule');else navigate('/');
          }} className="h-10 w-10 rounded-2xl bg-muted/60 hover:bg-muted flex items-center justify-center transition-colors">
              <ArrowRight className="w-4 h-4" />
            </button>
            <Logo size="sm" />
          </div>

          <div className="flex items-center gap-1.5">
            <a href="tel:033106020" className="h-9 w-9 rounded-2xl bg-accent text-accent-foreground flex items-center justify-center transition-colors" aria-label="התקשר 033106020">
              <Phone className="w-4 h-4" />
            </a>
            <Button variant="ghost" size="icon" onClick={() => {
            const event = new CustomEvent('open-accessibility-widget');
            window.dispatchEvent(event);
          }} className="h-9 w-9 rounded-2xl" aria-label="נגישות">
              <Accessibility className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={toggleTheme} className="h-9 w-9 rounded-2xl">
              {resolvedTheme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
          </div>
        </div>
        
        {/* Step Indicator - Pill style */}
        {step !== 'success' && <div className="px-4 pb-3 max-w-5xl mx-auto">
            <div className="flex gap-2 items-center">
              {['model', 'repair', 'price', 'schedule', 'details'].map((s, i) => {
            const labels = ['דגם', 'תיקון', 'מחיר', 'מועד', 'פרטים'];
            const allSteps = ['model', 'repair', 'bundle', 'price', 'schedule', 'details'];
            const displaySteps = ['model', 'repair', 'price', 'schedule', 'details'];
            const currentIdx = allSteps.indexOf(step);
            const displayIdx = displaySteps.indexOf(s);
            const adjustedCurrentIdx = currentIdx >= 3 ? currentIdx - 1 : currentIdx === 2 ? 1.5 : currentIdx;
            const isActive = adjustedCurrentIdx >= displayIdx;
            const isCurrent = Math.floor(adjustedCurrentIdx) === displayIdx;
            return <div key={s} className={`flex-1 text-center py-1.5 rounded-full text-xs font-semibold transition-all duration-300 ${isCurrent ? 'bg-primary text-primary-foreground shadow-md' : isActive ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground'}`}>
                  {labels[i]}
                </div>;
          })}
            </div>
          </div>}
      </div>

      {/* Hidden file input for image upload */}
      <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />

      {/* Content */}
      <div ref={contentRef} className={`flex-1 p-5 pb-28 overflow-y-auto transition-all duration-300 max-w-2xl mx-auto w-full ${isAnimating ? 'opacity-0 scale-[0.98]' : 'opacity-100 scale-100'}`}>
        
        {/* Privacy Consent Modal */}
        <OrderPrivacyConsent open={showPrivacyConsent} onAccept={() => setShowPrivacyConsent(false)} />

        {/* Gift Promo Popup */}
        {showGiftPopup && activePromotion && <GiftPromoPopup promotionTitle={activePromotion.title} promotionDescription={activePromotion.description} promotionIcon={activePromotion.icon || undefined} onClaimed={() => {
        setShowGiftPopup(false);
        setGiftClaimed(true);
        sessionStorage.setItem('gift_promo_claimed', 'true');
      }} />}

        {/* Trust Badges */}
        {step === 'model' && <div className="flex items-center justify-center gap-3 mb-6 animate-fade-in">
            <div className="flex items-center gap-1.5 bg-card border border-border/60 rounded-2xl px-3 py-2 shadow-sm">
              <svg viewBox="0 0 24 24" className="w-4 h-4 flex-shrink-0" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              <span className="text-xs font-bold">5.0</span>
            </div>

            <div className="flex items-center gap-1.5 bg-card border border-border/60 rounded-2xl px-3 py-2 shadow-sm">
              <img src={midragLogo} alt="מידרג" className="h-5 w-5 rounded-full object-cover" />
              <span className="text-xs font-bold">9.92</span>
            </div>

            <div className="flex items-center gap-1.5 bg-card border border-border/60 rounded-2xl px-3 py-2 shadow-sm">
              <svg viewBox="0 0 24 24" className="w-4 h-4 flex-shrink-0" fill="#1877F2">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              <span className="text-xs font-bold">5.0</span>
            </div>

            <div className="flex items-center gap-1.5 bg-card border border-border/60 rounded-2xl px-3 py-2 shadow-sm">
              <img src={easyLogo} alt="Easy" className="h-5 w-5 rounded-full object-cover" />
              <span className="text-xs font-bold">9.94</span>
            </div>
          </div>}


        {/* Step 1: Select Model - Enhanced Welcome */}
        {step === 'model' && <div className="space-y-8 animate-fade-in py-0">
            {/* Hero Welcome Section */}
            <div className="text-center py-4">
              <h1 className="text-4xl font-extrabold mb-3 tracking-tight">
                מה נתקן היום?
              </h1>
              <p className="text-muted-foreground text-sm">בחרו דגם ונגיע אליכם תוך שעה*</p>
              <div className="flex items-center justify-center gap-4 mt-4">
                <Dialog>
                  <DialogTrigger asChild>
                    <button className="text-primary hover:text-primary/80 transition-colors flex items-center gap-1.5 text-sm font-medium">
                      <HelpCircle className="w-4 h-4" />
                      איך השירות עובד?
                    </button>
                  </DialogTrigger>
                  <DialogContent className="max-w-sm">
                    <DialogHeader>
                      <DialogTitle className="text-right text-lg">איך זה עובד?</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 text-right">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-bold text-primary">1</span>
                        </div>
                        <p className="text-sm">בוחרים דגם וסוג תיקון וקובעים מועד שנוח לכם</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-bold text-primary">2</span>
                        </div>
                        <p className="text-sm">טכנאי מוסמך מגיע אליכם עד הבית במועד שנקבע</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-bold text-primary">3</span>
                        </div>
                        <p className="text-sm">התיקון מתבצע במקום תוך דקות — עם אחריות מלאה</p>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                <span className="text-muted-foreground/40">|</span>

                <Dialog>
                  <DialogTrigger asChild>
                    <button className="text-primary hover:text-primary/80 transition-colors flex items-center gap-1.5 text-sm font-medium">
                      <HelpCircle className="w-4 h-4" />
                      מי אנחנו?
                    </button>
                  </DialogTrigger>
                  <DialogContent className="max-w-sm">
                    <DialogHeader>
                      <DialogTitle className="text-right text-lg">מי אנחנו?</DialogTitle>
                    </DialogHeader>
                    <div className="text-right space-y-3">
                      <p className="text-sm leading-relaxed">
                        דיירקט פיקס הינה חברה שמציעה שירותי תיקון מכשירי אייפון עד הבית. חברתינו מתמחה בתיקוני מסכים וסוללות, ופעילה כבר מעל 13 שנים.
                      </p>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>


            {/* Scroll hint */}
            <div className="flex flex-col items-center gap-1 animate-fade-in py-0">
              <span className="text-xs text-muted-foreground font-medium">בחרו דגם ↓</span>
              <div className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex items-start justify-center p-1.5">
                <div className="w-1.5 h-2.5 bg-muted-foreground/50 rounded-full animate-[bounce_1.5s_infinite]" />
              </div>
            </div>

            {/* Testimonials Slider */}
            <TestimonialsSlider />

            {/* Smart AI Search */}
            <SmartRepairInput models={models} repairTypes={repairTypes} onModelAndRepairFound={handleSmartModelAndRepair} onModelFound={handleSmartModelOnly} />

            <ModelPicker models={filteredModels} selectedModel={selectedModel} onSelect={model => setSelectedModel(model)} onConfirm={model => handleModelSelect(model)} />
          </div>}

        {/* Step 2: Select Repair Type */}
        {step === 'repair' && <div className="space-y-5 animate-fade-in">
            <div className="text-center mb-4">
              <div className="inline-flex items-center gap-2 bg-accent/10 text-accent rounded-full px-4 py-1.5 text-sm font-semibold mb-3">
                <Smartphone className="w-4 h-4" />
                {selectedModel?.name}
              </div>
              <h2 className="text-3xl font-extrabold">מה צריך לתקן?</h2>
            </div>

            <div className="space-y-3">
              {repairTypes.filter(repair => {
                // Hide back glass repair for models with no back glass price
                if (repair.name.includes('גב') && selectedModel && selectedModel.back_glass_price <= 0) return false;
                return true;
              }).map((repair, index) => {
            const isPhoneOnly = repair.is_phone_only;
            const isOriginalScreen = repair.name.includes('מסך מקורי');
            const isCompatibleScreen = repair.name.includes('מסך תואם');
            const isBattery = repair.name.includes('סוללה');
            const isBackGlass = repair.name.includes('גב');
            let price = 0;
            if (selectedModel) {
              if (isOriginalScreen) price = selectedModel.original_screen_price;else if (isCompatibleScreen) price = selectedModel.compatible_screen_price;else if (isBattery) price = selectedModel.battery_price;else if (isBackGlass) price = selectedModel.back_glass_price;
            }
            const infoKey = isOriginalScreen ? 'מסך מקורי' : isCompatibleScreen ? 'מסך תואם' : isBattery ? 'סוללה מקורית' : null;
            const info = infoKey ? repairInfoDescriptions[infoKey] : null;
            const getIcon = () => {
              if (isOriginalScreen || isCompatibleScreen) return Smartphone;
              if (isBattery) return Battery;
              if (isBackGlass) return FlipVertical;
              return Phone;
            };
            const IconComponent = getIcon();
            return <div key={repair.id}>
                    <Card onClick={() => handleRepairSelect(repair)} className={`p-5 cursor-pointer transition-all duration-200 active:scale-[0.98] rounded-2xl border-2 shadow-sm hover:shadow-md ${
                      showBackColorPicker && isBackGlass 
                        ? 'border-primary bg-primary/5' 
                        : isPhoneOnly ? 'border-dashed border-muted-foreground/30' : 'border-border hover:border-primary/40 hover:bg-primary/5'
                    }`}>
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
                    </Card>

                    {/* Inline Color Picker - slides open under the back glass card */}
                    {isBackGlass && showBackColorPicker && selectedModel && (() => {
                      const colors = iphoneBackColors[selectedModel.name] || [];
                      return colors.length > 0 ? (
                        <div className="overflow-hidden animate-fade-in">
                          <div className="pt-3 pb-1 px-1 space-y-4">
                            <div className="text-center">
                              <h3 className="text-lg font-bold">באיזה צבע הגב של המכשיר?</h3>
                              <p className="text-sm text-muted-foreground">בחרו את הצבע כדי שנביא את החלק המתאים</p>
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                              {colors.map((color) => (
                                <button
                                  key={color.name}
                                  onClick={() => setSelectedBackColor(color.name)}
                                  className={`flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all duration-200 ${
                                    selectedBackColor === color.name
                                      ? 'border-primary bg-primary/5 shadow-md'
                                      : 'border-border hover:border-primary/40'
                                  }`}
                                >
                                  <div
                                    className={`w-10 h-10 rounded-full border-2 shadow-inner ${
                                      selectedBackColor === color.name ? 'border-primary ring-2 ring-primary/30' : 'border-border'
                                    }`}
                                    style={{ backgroundColor: color.hex }}
                                  />
                                  <span className="text-xs font-medium text-center leading-tight">{color.name}</span>
                                  {selectedBackColor === color.name && (
                                    <Check className="w-4 h-4 text-primary" />
                                  )}
                                </button>
                              ))}
                            </div>
                            <Button
                              onClick={handleBackColorConfirm}
                              disabled={!selectedBackColor}
                              className="w-full h-12 text-base font-bold rounded-xl"
                            >
                              המשך עם {selectedBackColor || '...'}
                            </Button>
                          </div>
                        </div>
                      ) : null;
                    })()}
                  </div>;
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
            <div className="text-center mb-5">
              <div className="inline-flex items-center gap-2 bg-success/10 text-success rounded-full px-4 py-1.5 text-sm font-semibold mb-3">
                <CheckCircle2 className="w-4 h-4" />
                סיכום
              </div>
              <h2 className="font-extrabold mb-1 text-3xl">סיכום הזמנה</h2>
              <p className="text-muted-foreground">אישור מחיר התיקון</p>
              <div className="mt-3 inline-flex items-center bg-primary text-primary-foreground text-xl font-bold px-5 py-2 rounded-2xl shadow-md">
                ₪{getTotalPrice()}
              </div>
            </div>

            <Card className="p-5 bg-gradient-to-br from-card via-card to-primary/5 border-2 border-primary/20 shadow-lg">
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

                {/* Free Home Visit - General */}
                <div className="flex justify-between items-center text-sm border-t border-border pt-3 mt-2">
                  <span className="text-foreground flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-primary" />
                    הגעה עד הבית ותיקון במקום
                  </span>
                  <span className="font-semibold text-success">חינם</span>
                </div>

                {/* Image Upload - Inline */}
                <div className="border-t border-border pt-3">
                  <label className="block text-xs font-medium mb-2 text-muted-foreground">
                    📸 רוצה לצרף תמונה של המכשיר? (לא חובה)
                  </label>
                  {deviceImages.length > 0 && <div className="flex gap-2 mb-2 flex-wrap">
                      {deviceImages.map((img, idx) => <div key={idx} className="relative w-14 h-14 rounded-lg overflow-hidden border border-border">
                          <img src={img} alt={`תמונה ${idx + 1}`} className="w-full h-full object-cover" />
                          <button onClick={() => removeImage(idx)} className="absolute top-0 right-0 w-4 h-4 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center">
                            <X className="w-2.5 h-2.5" />
                          </button>
                        </div>)}
                    </div>}
                  <Button variant="outline" size="sm" className="gap-2" onClick={() => fileInputRef.current?.click()} disabled={isUploadingImage || deviceImages.length >= 3}>
                    {isUploadingImage ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
                    {deviceImages.length > 0 ? 'הוסף תמונה' : 'העלה תמונה'}
                  </Button>
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
            <div className="bg-gradient-to-br from-muted/60 to-accent/5 rounded-2xl p-4 border border-border/50">
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
        {step === 'schedule' && <div className="space-y-5 animate-fade-in">
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
                {getAvailableDates().map((date, index) => {
              const dayName = hebrewDays[date.getDay()];
              const isToday = index === 0;
              const isSelected = selectedDate?.toDateString() === date.toDateString();
              const hasAvailableSlots = getTimeSlotsForDate(date).some(slot => isSlotAvailable(date, slot));
              return <button key={index} onClick={() => {
                setSelectedDate(date);
                setSelectedTimeSlot('');
              }} disabled={!hasAvailableSlots} className={`p-3 rounded-2xl border-2 text-center transition-all ${isSelected ? 'border-primary bg-primary/10 text-primary shadow-sm' : hasAvailableSlots ? 'border-border hover:border-primary/40 hover:bg-muted/30' : 'border-border/50 opacity-40 cursor-not-allowed'}`}>
                      <div className="text-sm font-bold">{isToday ? 'היום' : dayName}</div>
                      <div className="text-sm text-muted-foreground">{date.getDate()}/{date.getMonth() + 1}</div>
                    </button>;
            })}
              </div>
            </div>

            {/* Time slot selection */}
            {selectedDate && <div className="animate-fade-in">
                <label className="block text-sm font-bold mb-3">בחר שעה</label>
                <div className="grid grid-cols-2 gap-3">
                  {getTimeSlotsForDate(selectedDate).map(slot => {
              const isAvailable = isSlotAvailable(selectedDate, slot);
              const isSelected = selectedTimeSlot === slot;
              return <button key={slot} onClick={() => setSelectedTimeSlot(slot)} disabled={!isAvailable} className={`p-4 rounded-2xl border-2 text-center transition-all flex items-center justify-center gap-2 ${isSelected ? 'border-primary bg-primary/10 text-primary shadow-sm' : isAvailable ? 'border-border hover:border-primary/40 hover:bg-muted/30' : 'border-border/50 opacity-40 cursor-not-allowed'}`}>
                        <Clock className="w-4 h-4" />
                        <span className="text-base font-semibold">{slot}</span>
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
        {step === 'details' && <div className="space-y-5 animate-fade-in">
            <div className="text-center mb-4">
              <div className="inline-flex items-center gap-2 bg-accent/10 text-accent rounded-full px-4 py-1.5 text-sm font-semibold mb-3">
                <MapPin className="w-4 h-4" />
                פרטים אחרונים
              </div>
              <h2 className="text-3xl font-extrabold mb-1">לאן נגיע?</h2>
              <p className="text-muted-foreground">מלאו את הפרטים ואנחנו בדרך</p>
            </div>

            <div className="space-y-4 bg-card rounded-3xl p-5 border border-border/50 shadow-sm">
              <div>
                <label className="block text-sm font-bold mb-1.5">שם מלא</label>
                <Input placeholder="הכנס שם מלא" value={customerName} onChange={e => setCustomerName(e.target.value)} className="h-13 text-base rounded-2xl bg-muted/40 border-border/50 focus:bg-card" />
              </div>

              <div>
                <label className="block text-sm font-bold mb-1.5">מספר טלפון</label>
                <Input placeholder="050-0000000" value={customerPhone} onChange={e => setCustomerPhone(formatPhone(e.target.value))} type="tel" className="h-13 text-base rounded-2xl text-right bg-muted/40 border-border/50 focus:bg-card" dir="ltr" />
              </div>

              <div>
                <label className="block text-sm font-bold mb-1.5">כתובת</label>
                <AddressAutocomplete value={customerAddress} onChange={setCustomerAddress} className="h-13 text-base rounded-2xl bg-muted/40 border-border/50 focus:bg-card" />
                <div className="mt-2 p-3 bg-accent/8 border border-accent/15 rounded-2xl flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-accent flex-shrink-0" />
                  <p className="text-xs text-muted-foreground">
                    <span className="font-bold text-foreground">אזור שירות:</span> השרון, המרכז וגוש דן
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold mb-1.5">
                  אימייל <span className="text-muted-foreground font-normal">(לא חובה - לקבלת אישור הזמנה)</span>
                </label>
                <Input placeholder="example@email.com" value={customerEmail} onChange={e => setCustomerEmail(e.target.value)} type="email" className="h-13 text-base rounded-2xl bg-muted/40 border-border/50 focus:bg-card" dir="ltr" />
              </div>

              <div>
                <label className="block text-sm font-bold mb-1.5">
                  הערות <span className="text-muted-foreground font-normal">(לא חובה)</span>
                </label>
                <Textarea placeholder="קומה, אינטרקום, הערות..." value={customerNotes} onChange={e => setCustomerNotes(e.target.value)} className="text-base rounded-2xl resize-none bg-muted/40 border-border/50 focus:bg-card" rows={2} />
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
                  אני מאשר/ת יצירת קשר בוואטסאפ או בטלפון לתיאום ועדכונים בנוגע לתיקון בלבד
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
              <p className="text-muted-foreground text-sm">ניצור איתך קשר לאישור המועד</p>
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
                {selectedBundleAddon && currentBundle && <div className="flex justify-between">
                    <span className="text-muted-foreground">החלפת סוללה (חבילה)</span>
                    <span className="font-medium text-amber-500">₪{getBundleAddonPrice()}</span>
                  </div>}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">מועד</span>
                  <span className="font-medium">{formatSelectedDateTime()}</span>
                </div>
                {activePromotion && <div className="flex justify-between items-center bg-amber-500/10 rounded-lg p-2 -mx-1">
                    <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1 text-xs">
                      <Gift className="w-3.5 h-3.5" />
                      {activePromotion.description}
                    </span>
                    <span className="font-bold text-success text-xs">חינם! 🎉</span>
                  </div>}
                <div className="flex justify-between pt-2 border-t border-border">
                  <span className="font-bold">סה״כ</span>
                  <span className="font-bold text-primary text-lg">₪{getFinalPrice()}</span>
                </div>
              </div>
            </Card>

            <div className="bg-muted/50 rounded-xl p-4">
              <p className="text-sm text-muted-foreground mb-3">תוכלו לעקוב אחרי סטטוס התיקון בזמן אמת</p>
              <Button onClick={handleTrackOrder} className="w-full h-12 text-base rounded-xl">
                📍 מעקב אחר ההזמנה שלי
              </Button>
            </div>
            
            <Button variant="outline" onClick={() => navigate('/')} className="w-full h-10 rounded-xl">
              חזרה לדף הבית
            </Button>
          </div>}
      </div>

      {/* Disclaimer */}
      {step === 'model' && <div className="text-center px-6 py-3">
          <p className="text-[11px] text-muted-foreground/60 leading-relaxed">
            * זמני ההגעה עשויים להשתנות בהתאם לזמינות הטכנאים ולמיקום הלקוח.
          </p>
        </div>}

      {/* Sticky Footer with Action Buttons */}
      {step !== 'success' && step !== 'model' && step !== 'repair' && <div className="sticky bottom-0 left-0 right-0 bg-card/95 backdrop-blur-lg border-t border-border/50 p-4 safe-area-pb shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
          {step === 'price' && <Button onClick={handlePriceConfirm} className="w-full h-14 text-base rounded-2xl font-bold shadow-lg hover:shadow-xl">
              אישור ובחירת מועד לטכנאי
            </Button>}
          
          {step === 'schedule' && <Button onClick={handleScheduleConfirm} disabled={!selectedDate || !selectedTimeSlot} className="w-full h-14 text-base rounded-2xl font-bold shadow-lg hover:shadow-xl">
              המשך לפרטים
            </Button>}
          
          {step === 'details' && <Button onClick={handleSubmit} disabled={isSubmitting || !acceptPrivacy || !acceptContact} className="w-full h-14 text-base rounded-2xl font-bold shadow-lg hover:shadow-xl">
              {isSubmitting ? <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  שולח...
                </div> : 'שלח הזמנה'}
            </Button>}
        </div>}
    </div>;
};
export default NewRepairOrder;