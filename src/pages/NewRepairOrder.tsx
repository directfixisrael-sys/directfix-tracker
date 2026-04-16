import { useState, useEffect, useRef } from 'react';
import OrderPageSkeleton from '@/components/OrderPageSkeleton';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ArrowRight, Smartphone, Battery, Phone, CheckCircle2, Sparkles, Wrench, MapPin, Loader2, HelpCircle, Moon, Sun, Calendar, Clock, Gift, Shield, Tag, Camera, X, Image, Accessibility, Check, FlipVertical, Heart, CreditCard, Send, Zap, Award, ChevronDown, Crown, Menu, BadgePercent } from 'lucide-react';
import { getRepairIconComponent } from '@/lib/repairIcons';
import { useRepairStore } from '@/store/repairStore';
import { useTheme } from '@/components/ThemeProvider';
import { supabase } from '@/integrations/supabase/client';
import CustomerZone from '@/components/CustomerZone';
import { toast } from 'sonner';
import Logo from '@/components/Logo';
import VideoPlayer from '@/components/VideoPlayer';
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
import GiftOrderToggle from '@/components/GiftOrderToggle';
import LoyaltyPointsDisplay, { getCustomerPoints, calculatePointsFromPrice, calculateDiscountFromPoints } from '@/components/LoyaltyPointsDisplay';
import PointsEarnedAnimation from '@/components/PointsEarnedAnimation';

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

// Info descriptions are now loaded from the database (repair_types.info_title / info_description)

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
  charging_price?: number;
  min_lead_hours?: number;
}
interface RepairType {
  id: string;
  name: string;
  description: string | null;
  icon: string;
  is_phone_only: boolean;
  info_title?: string;
  info_description?: string;
}

// Price lookup map: modelId -> repairTypeId -> price
type PriceMap = Record<string, Record<string, number>>;
interface Promotion {
  id: string;
  title: string;
  description: string;
  badge_text: string | null;
  icon: string | null;
  value: number | null;
  display_mode: string;
}
interface RepairBundle {
  id: string;
  name: string;
  primary_repair_type: string;
  addon_repair_type: string;
  discount_percent: number;
}
type Step = 'model' | 'repair' | 'bundle' | 'points' | 'price' | 'schedule' | 'details' | 'gift_payment' | 'success';
const NewRepairOrder = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const {
    addOrder
  } = useRepairStore();
  const {
    resolvedTheme,
    setTheme
  } = useTheme();
  const [step, setStep] = useState<Step>('model');
  const [orderMenuOpen, setOrderMenuOpen] = useState(false);
  const [showIntroCard, setShowIntroCard] = useState(true);
  const [introName, setIntroName] = useState('');
  const [introPhone, setIntroPhone] = useState('');
  const [introPrivacy, setIntroPrivacy] = useState(false);
  const [isReturningCustomer, setIsReturningCustomer] = useState(false);
  const [models, setModels] = useState<IphoneModel[]>([]);
  const [repairTypes, setRepairTypes] = useState<RepairType[]>([]);
  const [blockedDates, setBlockedDates] = useState<string[]>([]);
  const [hourlyBlocks, setHourlyBlocks] = useState<{ date: string; start_time: string; end_time: string }[]>([]);
  const [activePromotion, setActivePromotion] = useState<Promotion | null>(null);
  const [repairBundles, setRepairBundles] = useState<RepairBundle[]>([]);
  const [priceMap, setPriceMap] = useState<PriceMap>({});
  const [selectedBundleAddon, setSelectedBundleAddon] = useState<boolean>(false);
  const [currentBundle, setCurrentBundle] = useState<RepairBundle | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedModel, setSelectedModel] = useState<IphoneModel | null>(null);
  const [selectedRepair, setSelectedRepair] = useState<RepairType | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedOrderNumber, setCompletedOrderNumber] = useState<number | null>(null);

  // Schedule fields
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');

  // Form fields
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerNotes, setCustomerNotes] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');

  const [currentLeadId, setCurrentLeadId] = useState<string | null>(null);

  // Update lead step tracking
  const updateLeadStep = async (stepName: string, extra?: Record<string, string>) => {
    if (!currentLeadId) return;
    try {
      await supabase.from('leads').update({ last_step: stepName, ...extra }).eq('id', currentLeadId);
    } catch (e) {
      console.error('Error updating lead step:', e);
    }
  };

  // Sync intro fields to customer fields and save lead
  const handleIntroDismiss = async () => {
    if (introName.trim()) setCustomerName(introName.trim());
    if (introPhone.trim()) setCustomerPhone(introPhone.trim().replace(/\D/g, ''));
    setShowIntroCard(false);

    // Scroll to top after dismissing intro
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    if (contentRef.current) contentRef.current.scrollTop = 0;

    // Save lead to DB
    try {
      const { data: leadData } = await supabase.from('leads').insert({
        customer_name: introName.trim(),
        customer_phone: introPhone.trim().replace(/\D/g, ''),
        customer_email: '',
        privacy_accepted: introPrivacy,
        is_returning_customer: false,
        last_step: 'בחירת דגם',
      }).select('id').single();
      if (leadData) setCurrentLeadId(leadData.id);
    } catch (e) {
      console.error('Error saving lead:', e);
    }
  };
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
  const [otherRepairDescription, setOtherRepairDescription] = useState('');
  
  const [additionalRepairs, setAdditionalRepairs] = useState<{ repair: RepairType; price: number; backColor?: string; model: IphoneModel }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  // Privacy consent
  const [showPrivacyConsent, setShowPrivacyConsent] = useState(false);

  // Gift order mode
  const [isGiftOrder, setIsGiftOrder] = useState(false);
  const [giftSenderName, setGiftSenderName] = useState('');
  const [giftSenderPhone, setGiftSenderPhone] = useState('');
  const [giftMessage, setGiftMessage] = useState('');
  const [showGiftBurst, setShowGiftBurst] = useState(false);
  const [giftPaymentUrl, setGiftPaymentUrl] = useState<string | null>(null);
  const [giftOrderResult, setGiftOrderResult] = useState<any>(null);

  // Loyalty points
  const [customerLoyaltyPoints, setCustomerLoyaltyPoints] = useState(0);
  const [loyaltyDiscount, setLoyaltyDiscount] = useState(0);
  const [showPointsInfo, setShowPointsInfo] = useState(false);
  const [joinedClub, setJoinedClub] = useState(false);
  const [isExistingClubMember, setIsExistingClubMember] = useState(false);

  // Check if customer is already a club member and skip points step if so
  const checkClubMemberAndNavigate = async () => {
    const phone = (customerPhone || introPhone).replace(/\D/g, '');
    if (phone) {
      const { data } = await supabase
        .from('club_members')
        .select('phone')
        .eq('phone', phone)
        .eq('is_active', true)
        .limit(1);
      if (data && data.length > 0) {
        setIsExistingClubMember(true);
        setJoinedClub(true); // auto-mark as club member
        goToStep('price');
        return;
      }
    }
    goToStep('points');
  };

  const handleGiftToggle = () => {
    const newVal = !isGiftOrder;
    setIsGiftOrder(newVal);
    if (newVal) {
      setShowGiftBurst(true);
      setTimeout(() => setShowGiftBurst(false), 1200);
    }
  };

  // Gift promo popup
  const [showGiftPopup, setShowGiftPopup] = useState(false);

  // Apply/remove gift-mode class on html element
  useEffect(() => {
    if (isGiftOrder) {
      document.documentElement.classList.add('gift-mode');
    } else {
      document.documentElement.classList.remove('gift-mode');
    }
    return () => {
      document.documentElement.classList.remove('gift-mode');
    };
  }, [isGiftOrder]);
  const [giftClaimed, setGiftClaimed] = useState(false);

  // Force scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
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
        return '';
      case 'tag':
        return '';
      case 'sparkles':
        return '';
      case 'percent':
        return '';
      case 'fire':
        return '';
      case 'star':
        return '';
      default:
        return '';
    }
  };

  // Load data from database
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [modelsRes, repairsRes, blockedRes, bundlesRes, pricesRes] = await Promise.all([supabase.from('iphone_models').select('*').eq('is_active', true).order('sort_order'), supabase.from('repair_types').select('*').eq('is_active', true).order('sort_order'), supabase.from('blocked_dates').select('date, start_time, end_time'), supabase.from('repair_bundles').select('*').eq('is_active', true), supabase.from('model_repair_prices').select('*')]);
        if (modelsRes.data) setModels(modelsRes.data);
        if (repairsRes.data) setRepairTypes(repairsRes.data);
        if (pricesRes.data) {
          const map: PriceMap = {};
          pricesRes.data.forEach((p: any) => {
            if (!map[p.model_id]) map[p.model_id] = {};
            map[p.model_id][p.repair_type_id] = p.price;
          });
          setPriceMap(map);
        }
        if (blockedRes.data) {
          setBlockedDates(blockedRes.data.filter(d => !d.start_time).map(d => d.date));
          setHourlyBlocks(
            blockedRes.data
              .filter(d => d.start_time && d.end_time)
              .map(d => ({ date: d.date, start_time: d.start_time!, end_time: d.end_time! }))
          );
        }
        if (bundlesRes.data) setRepairBundles(bundlesRes.data);

        // Load promotion separately to avoid error if none exists
        const {
          data: promotionData
        } = await supabase.from('promotions').select('*').eq('is_active', true).limit(1).maybeSingle();
        if (promotionData) {
          setActivePromotion(promotionData);
          // Show gift popup if display mode includes popup
          const mode = promotionData.display_mode || 'both';
          if (mode === 'popup' || mode === 'both') {
            const alreadyClaimed = sessionStorage.getItem('gift_promo_claimed');
            if (!alreadyClaimed) {
              setTimeout(() => setShowGiftPopup(true), 800);
            } else {
              setGiftClaimed(true);
            }
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

  // Read URL params for lead recovery (step, coupon, name, email, device, repair)
  useEffect(() => {
    if (isLoading) return;
    const urlStep = searchParams.get('step') as Step | null;
    const urlCoupon = searchParams.get('coupon');
    const urlDiscount = searchParams.get('discount');
    const urlName = searchParams.get('name');
    const urlEmail = searchParams.get('email');
    const urlDevice = searchParams.get('device');
    const urlRepairType = searchParams.get('repair_type');

    if (urlName) {
      setIntroName(urlName);
      setCustomerName(urlName);
    }
    if (urlEmail) {
      setCustomerEmail(urlEmail);
    }

    // Auto-apply coupon from URL
    if (urlCoupon && urlDiscount) {
      setCouponCode(urlCoupon);
      setAppliedCoupon({
        code: urlCoupon,
        discount_type: 'fixed',
        discount_value: Number(urlDiscount),
      });
    }

    // Restore device selection
    if (urlDevice && models.length > 0) {
      const matchedModel = models.find(m => m.name === urlDevice);
      if (matchedModel) {
        setSelectedModel(matchedModel);
      }
    }

    // Restore repair type selection
    if (urlRepairType && repairTypes.length > 0) {
      const matchedRepair = repairTypes.find(r => r.name === urlRepairType);
      if (matchedRepair) {
        setSelectedRepair(matchedRepair);
      }
    }

    // Skip intro and jump to step
    if (urlStep && ['model', 'repair', 'bundle', 'points', 'price', 'schedule', 'details'].includes(urlStep)) {
      setShowIntroCard(false);
      setStep(urlStep);
    }
  }, [isLoading]);

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

  // Check if a time slot is available (respects model lead time and blocked slots)
  const isSlotAvailable = (date: Date, slot: string) => {
    const now = new Date();
    const [slotStart, slotEnd] = slot.split('-');
    const slotStartHour = parseInt(slotStart.split(':')[0]);
    const slotStartMin = parseInt(slotStart.split(':')[1] || '0');
    const slotEndHour = parseInt(slotEnd.split(':')[0]);
    const slotEndMin = parseInt(slotEnd.split(':')[1] || '0');

    // Create date with slot start time
    const slotDate = new Date(date);
    slotDate.setHours(slotStartHour, slotStartMin, 0, 0);

    // Use model-specific lead time or default 40 minutes
    const leadMinutes = selectedModel?.min_lead_hours ? selectedModel.min_lead_hours * 60 : 40;
    const minTimeFromNow = new Date(now.getTime() + leadMinutes * 60 * 1000);
    if (slotDate <= minTimeFromNow) return false;

    // Check hourly blocks for this date
    const dateStr = date.toISOString().split('T')[0];
    const blocksForDate = hourlyBlocks.filter(b => b.date === dateStr);
    for (const block of blocksForDate) {
      const blockStartMin = parseInt(block.start_time.split(':')[0]) * 60 + parseInt(block.start_time.split(':')[1]);
      const blockEndMin = parseInt(block.end_time.split(':')[0]) * 60 + parseInt(block.end_time.split(':')[1]);
      const slotStartTotalMin = slotStartHour * 60 + slotStartMin;
      const slotEndTotalMin = slotEndHour * 60 + slotEndMin;
      // Check overlap
      if (slotStartTotalMin < blockEndMin && slotEndTotalMin > blockStartMin) {
        return false;
      }
    }

    return true;
  };
  const filteredModels = models.filter(model => model.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const getRepairPrice = (repair: RepairType, model?: IphoneModel | null) => {
    const m = model || selectedModel;
    if (!m) return 0;
    return priceMap[m.id]?.[repair.id] || 0;
  };
  const getPrice = () => {
    if (!selectedModel || !selectedRepair) return 0;
    return getRepairPrice(selectedRepair);
  };
  };
  const getAdditionalRepairsTotal = () => {
    return additionalRepairs.reduce((sum, r) => sum + r.price, 0);
  };
  const getMultiRepairDiscount = () => {
    // 15% off the cheapest repair when there are 2+ repairs total
    const allPrices: number[] = [...additionalRepairs.map(r => r.price)];
    if (selectedRepair) allPrices.push(getRepairPrice(selectedRepair));
    if (allPrices.length < 2) return 0;
    const cheapest = Math.min(...allPrices);
    return Math.round(cheapest * 0.15);
  };
  const getBundleAddonPrice = () => {
    if (!selectedModel || !selectedBundleAddon || !currentBundle) return 0;
    const batteryRepair = repairTypes.find(r => r.name.includes('סוללה'));
    const basePrice = batteryRepair ? getRepairPrice(batteryRepair) : 0;
    const discountedPrice = Math.round(basePrice * (1 - currentBundle.discount_percent / 100));
    return discountedPrice;
  };
  const getBatteryBasePrice = () => {
    if (!selectedModel) return 0;
    const batteryRepair = repairTypes.find(r => r.name.includes('סוללה'));
    return batteryRepair ? getRepairPrice(batteryRepair) : 0;
  };
  const getTotalPrice = () => {
    return getPrice() + getBundleAddonPrice() + getAdditionalRepairsTotal() - getMultiRepairDiscount();
  };
  const getRepairTypeName = () => {
    if (!selectedRepair) return '';
    return selectedRepair.name;
  };
  const getAllRepairNames = () => {
    const names = additionalRepairs.map(r => r.repair.name);
    if (selectedRepair) names.push(selectedRepair.name);
    return names;
  };
  const stepLabels: Record<Step, string> = {
    model: 'בחירת דגם',
    repair: 'בחירת תיקון',
    bundle: 'חבילה',
    points: 'נקודות',
    price: 'אישור מחיר',
    schedule: 'תיאום מועד',
    details: 'מילוי פרטים',
    gift_payment: 'תשלום',
    success: 'הושלם',
  };

  const goToStep = (newStep: Step) => {
    setIsAnimating(true);
    updateLeadStep(stepLabels[newStep]);
    setTimeout(() => {
      setStep(newStep);
      setIsAnimating(false);
      window.dispatchEvent(new CustomEvent('repair-step-change', { detail: { step: newStep } }));
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
    updateLeadStep('בחירת תיקון', { device_type: model.name });
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
      const repairPrice = getRepairPrice(repair, model);
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
        checkClubMemberAndNavigate();
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
    
    // "תיקון אחר" - just select it, stay on same step to show text input
    if (repair.name.includes('תיקון אחר')) {
      setSelectedRepair(repair);
      setShowBackColorPicker(false);
      setOtherRepairDescription('');
      return; // Don't navigate - the inline form will appear
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
      const repairPrice = getRepairPrice(repair);
      trackAddToCart(repair.name, repairPrice);
      gaSelectRepair(repair.name, repairPrice);
    }

    // Check if there's a bundle offer for this repair type
    if (isScreenRepair) {
      const bundle = repairBundles.find(b => repair.name.includes(b.primary_repair_type));
      if (bundle) {
        setCurrentBundle(bundle);
        setSelectedBundleAddon(false);
        goToStep('bundle');
      } else {
        checkClubMemberAndNavigate();
      }
    } else {
      checkClubMemberAndNavigate();
    }
  };
  
  const handleOtherRepairSubmit = async () => {
    if (!customerName.trim() || !customerPhone.trim()) {
      toast.error('אנא מלאו שם וטלפון');
      return;
    }
    if (customerPhone.length < 9) {
      toast.error('מספר טלפון לא תקין');
      return;
    }
    setIsSubmitting(true);
    try {
      const notes = [
        `הזמנה מהאתר - תיקון אחר`,
        `תיאור התקלה: ${otherRepairDescription}`,
        `⚠️ נדרש חזרה ללקוח לתיאום`,
      ];
      const leadSource = getLeadSource();
      await addOrder({
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerAddress: '',
        deviceType: selectedModel?.name || '',
        issueDescription: `תיקון אחר: ${otherRepairDescription}`,
        repairPrice: 0,
        status: 'pending',
        accessories: [],
        notes,
        wantsPromotions: false,
        leadSource: leadSource.source,
        customerEmail: customerEmail.trim() || undefined,
      } as any);
      
      goToStep('success');
      setCompletedOrderNumber(null);
    } catch (error) {
      toast.error('אירעה שגיאה, נסה שוב');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleBackColorConfirm = () => {
    if (!selectedBackColor || !selectedRepair || !selectedModel) return;
    
    // Track
    const backPrice = getRepairPrice(selectedRepair);
    trackAddToCart(selectedRepair.name, backPrice);
    gaSelectRepair(selectedRepair.name, backPrice);
    
    setShowBackColorPicker(false);
    checkClubMemberAndNavigate();
  };
  const handleBundleDecision = (acceptBundle: boolean) => {
    setSelectedBundleAddon(acceptBundle);
    if (currentBundle) gaBundleDecision(acceptBundle, currentBundle.name);
    checkClubMemberAndNavigate();
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

  const getCalendarLink = () => {
    if (!selectedDate || !selectedTimeSlot || !selectedModel || !selectedRepair) return '';
    const [startTime, endTime] = selectedTimeSlot.split('-');
    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);
    const start = new Date(selectedDate);
    start.setHours(startH, startM, 0, 0);
    const end = new Date(selectedDate);
    end.setHours(endH, endM, 0, 0);
    const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    const title = encodeURIComponent(`תיקון ${selectedModel.name} - DirectFix`);
    const details = encodeURIComponent(`תיקון: ${getRepairTypeName()}\nדגם: ${selectedModel.name}\nהזמנה: #${completedOrderNumber || ''}`);
    const location = encodeURIComponent(customerAddress || '');
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${fmt(start)}/${fmt(end)}&details=${details}&location=${location}`;
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
    return Math.max(0, getTotalPrice() - getDiscount() - loyaltyDiscount);
  };
  const getPointsToEarn = () => calculatePointsFromPrice(getFinalPrice());

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
  const sendOrderNotifications = async (orderResult: any, repairDescription: string, scheduleNote: string) => {
    try {
      const allRepairNames = getAllRepairNames();
      const repairTypeForNotification = selectedBundleAddon && currentBundle ? `${allRepairNames.join(' + ')} + החלפת סוללה (חבילה -${currentBundle.discount_percent}%)` : allRepairNames.join(' + ');
      const colorNote = selectedBackColor ? ` (צבע: ${selectedBackColor})` : '';
      const leadSrc = getLeadSource();
      await supabase.functions.invoke('send-order-notifications', {
        body: {
          customerName: customerName.trim(),
          customerPhone: customerPhone.trim(),
          customerAddress: customerAddress.trim(),
          deviceType: selectedModel?.name || '',
          repairType: repairTypeForNotification + colorNote,
          repairPrice: getFinalPrice(),
          scheduledTime: scheduleNote,
          scheduledDateISO: selectedDate ? selectedDate.toISOString() : undefined,
          scheduledTimeSlot: selectedTimeSlot || undefined,
          notes: customerNotes.trim(),
          customerEmail: customerEmail.trim() || undefined,
          orderNumber: orderResult?.order_number || undefined,
          promotionTitle: activePromotion ? `${activePromotion.title} - ${activePromotion.description}` : undefined,
          leadSource: leadSrc.source,
          leadSourceDetails: leadSrc,
          isClubMember: joinedClub,
        }
      });
      console.log('Notifications sent successfully');
    } catch (notificationError) {
      console.error('Error sending notifications:', notificationError);
    }
  };

  const handleGiftPaymentSuccess = async () => {
    if (giftOrderResult?.id) {
      await supabase.from('orders').update({ payment_status: 'paid' }).eq('id', giftOrderResult.id);
    }
    const scheduleNote = formatSelectedDateTime();
    const allRepairNames = getAllRepairNames();
    const repairDescription = selectedBundleAddon && currentBundle 
      ? `${allRepairNames.join(' + ')} + החלפת סוללה (חבילה)` 
      : allRepairNames.join(' + ');
    await sendOrderNotifications(giftOrderResult, repairDescription, scheduleNote);
    goToStep('success');
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
    if (isGiftOrder && (!giftSenderName.trim() || !giftSenderPhone.trim())) {
      toast.error('אנא מלאו את פרטי השולח');
      return;
    }
    if (isGiftOrder && giftSenderPhone.length < 9) {
      toast.error('מספר טלפון של השולח לא תקין');
      return;
    }
    setIsSubmitting(true);
    try {
      const scheduleNote = formatSelectedDateTime();
      const allRepairNames = getAllRepairNames();
      const repairDescription = selectedBundleAddon && currentBundle 
        ? `${allRepairNames.join(' + ')} + החלפת סוללה (חבילה)` 
        : allRepairNames.join(' + ');
      const notes = [`הזמנה מהאתר - ${repairDescription}`, `מועד מבוקש: ${scheduleNote}`];
      if (isReturningCustomer) {
        notes.push('לקוח חוזר — מגן מסך פרימיום במתנה');
      }
      if (selectedBundleAddon && currentBundle && selectedModel) {
        notes.push(`חבילת תיקון: ${currentBundle.name} - סוללה ב-${currentBundle.discount_percent}% הנחה (₪${getBundleAddonPrice()} במקום ₪${getBatteryBasePrice()})`);
      }
      // Add back color notes for all repairs
      additionalRepairs.forEach(ar => {
        notes.push(`תיקון נוסף: ${ar.repair.name} ל-${ar.model.name} — ₪${ar.price}`);
        if (ar.backColor) notes.push(`צבע גב מכשיר (${ar.repair.name} - ${ar.model.name}): ${ar.backColor}`);
      });
      const multiDiscount = getMultiRepairDiscount();
      if (multiDiscount > 0) {
        notes.push(`הנחת תיקון נוסף (15% על הזול): -₪${multiDiscount}`);
      }
      if (selectedBackColor) {
        notes.push(`צבע גב מכשיר: ${selectedBackColor}`);
      }
      if (customerNotes.trim()) {
        notes.push(`הערות לקוח: ${customerNotes.trim()}`);
      }
      if (appliedCoupon) {
        notes.push(`קופון: ${appliedCoupon.code} - הנחה של ${appliedCoupon.discount_type === 'percentage' ? `${appliedCoupon.discount_value}%` : `₪${appliedCoupon.discount_value}`}`);
        // Update coupon usage
        const {
          data: couponData
        } = await supabase.from('coupons').select('current_uses').eq('code', appliedCoupon.code).single();
        if (couponData) {
          await supabase.from('coupons').update({
            current_uses: couponData.current_uses + 1
          }).eq('code', appliedCoupon.code);
        }
      }
      if (loyaltyDiscount > 0) {
        notes.push(`הנחת נקודות נאמנות: -₪${loyaltyDiscount} (${customerLoyaltyPoints} נקודות)`);
      }
      if (deviceImages.length > 0) {
        notes.push(`תמונות מכשיר: ${deviceImages.length} תמונות צורפו`);
      }
      if (isGiftOrder) {
        notes.push(`הזמנת מתנה — שולח: ${giftSenderName.trim()}, טלפון שולח: ${giftSenderPhone.trim()}`);
        if (giftMessage.trim()) {
          notes.push(`ברכה: ${giftMessage.trim()}`);
        }
        notes.push('⚠️ דורש תשלום מראש מהשולח לפני תיאום הגעה');
      }
      const leadSource = getLeadSource();
      const orderResult: any = await addOrder({
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
        deviceImages: deviceImages.length > 0 ? deviceImages : [],
      } as any);

      // For gift orders: create PayPlus payment link and go to payment step
      // For gift orders: create PayPlus payment link and go to payment step
      if (isGiftOrder) {
        try {
          const { data: payData, error: payError } = await supabase.functions.invoke('payplus-create-payment', {
            body: {
              amount: getFinalPrice(),
              description: `תיקון ${selectedModel?.name || ''} - ${repairDescription} (הזמנת מתנה)`,
              customerName: giftSenderName.trim(),
              customerPhone: giftSenderPhone.trim(),
              customerEmail: customerEmail.trim() || undefined,
              orderId: orderResult?.id || '',
              moreInfo: `הזמנה #${orderResult?.order_number || ''}`,
            }
          });
          if (payError || !payData?.paymentLink) {
            throw new Error(payData?.error || 'Failed to create payment link');
          }
          setGiftPaymentUrl(payData.paymentLink);
          setGiftOrderResult(orderResult);
          setCompletedOrderNumber(orderResult?.order_number || null);
          // Update order with payment link
          if (orderResult?.id) {
            await supabase.from('orders').update({ 
              payment_link: payData.paymentLink,
              payment_status: 'pending'
            }).eq('id', orderResult.id);
          }
          goToStep('gift_payment');
        } catch (payError) {
          console.error('Error creating payment:', payError);
          toast.error('שגיאה ביצירת קישור תשלום, ההזמנה נשמרה ונציג ייצור קשר');
          // Fallback: send notifications and go to success
          await sendOrderNotifications(orderResult, repairDescription, scheduleNote);
          setCompletedOrderNumber(orderResult?.order_number || null);
          goToStep('success');
        }
        // Track
        trackPurchase(getFinalPrice());
        gaConversion(getFinalPrice(), selectedModel?.name || '', getRepairTypeName());
      } else {
        // Regular flow: send notifications immediately
        await sendOrderNotifications(orderResult, repairDescription, scheduleNote);
        trackPurchase(getFinalPrice());
        gaConversion(getFinalPrice(), selectedModel?.name || '', getRepairTypeName());
        setCompletedOrderNumber(orderResult?.order_number || null);
        
        // Mark lead as converted
        const normalizedPhone = customerPhone.replace(/\D/g, '');
        await supabase.from('leads').update({ converted: true }).eq('customer_phone', normalizedPhone);
        
        // Redeem loyalty points if used
        if (loyaltyDiscount > 0 && customerLoyaltyPoints > 0) {
          await supabase.from('loyalty_points').insert({
            customer_phone: normalizedPhone,
            points: customerLoyaltyPoints,
            type: 'redeemed',
            description: `מימוש נקודות - הזמנה`,
            order_id: orderResult?.id || null,
          });
        }
        
        // Award new loyalty points and save club member only if joined club
        if (joinedClub) {
          // Save as club member (upsert)
          await supabase.from('club_members').upsert({
            phone: normalizedPhone,
            name: customerName,
            email: customerEmail || null,
            wants_promotions: true,
            is_active: true,
          }, { onConflict: 'phone' });

          // Also update the order as club member
          if (orderResult?.id) {
            await supabase.from('orders').update({ is_club_member: true }).eq('id', orderResult.id);
          }

          const pointsToEarn = calculatePointsFromPrice(getFinalPrice());
          if (pointsToEarn > 0) {
            await supabase.from('loyalty_points').insert({
              customer_phone: normalizedPhone,
              points: pointsToEarn,
              type: 'earned',
              description: `צבירה מתיקון - חבר מועדון`,
              order_id: orderResult?.id || null,
            });
          }
        }
        
        goToStep('success');
      }
    } catch (error) {
      toast.error('אירעה שגיאה, נסה שוב');
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleTrackOrder = () => {
    navigate('/track');
  };
  const getRepairIcon = getRepairIconComponent;
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

  // Shared cart display for additional repairs
  const renderRepairCart = () => (
    <div className="space-y-3">
      <p className="text-xs font-semibold text-muted-foreground">תיקונים שנבחרו:</p>
      {additionalRepairs.map((ar, idx) => (
        <Card key={idx} className="p-4 rounded-2xl border border-border/60">
          <div className="flex items-center justify-between gap-3">
            <div className="flex-1 text-right">
              <p className="font-bold text-base">
                {ar.model.name} · {ar.repair.name}{ar.backColor ? ` ${ar.backColor}` : ''}
              </p>
            </div>
            <span className="text-xl font-extrabold text-primary whitespace-nowrap">₪{ar.price}</span>
          </div>
        </Card>
      ))}
    </div>
  );


  if (isLoading) {
    return <OrderPageSkeleton />;
  }
  return <>
    {/* Quick Intro Card - Rendered at top level via fragment */}
    {showIntroCard && !showPrivacyConsent && (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-foreground/40 backdrop-blur-sm animate-fade-in" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }} onClick={(e) => { if (e.target === e.currentTarget && introName.trim() && introPhone.trim()) handleIntroDismiss(); }}>
        <div className="w-[calc(100%-2rem)] max-w-md bg-card rounded-2xl p-7 pb-8 shadow-2xl animate-scale-in border-2 border-primary/20">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-extrabold text-foreground">בואו נתחיל</h2>
            <p className="text-base text-muted-foreground mt-2">שם מלא ומספר טלפון — וישר לבחירת הדגם</p>
          </div>

          <div className="space-y-4">
            <Input
              placeholder="שם מלא *"
              value={introName}
              onChange={(e) => setIntroName(e.target.value)}
              className="h-16 text-lg rounded-xl px-5"
              autoFocus
            />
            <Input
              placeholder="מספר טלפון *"
              value={introPhone}
              onChange={(e) => setIntroPhone(e.target.value)}
              type="tel"
              dir="ltr"
              className="h-16 text-lg rounded-xl px-5 text-right"
            />
          </div>

          <label className="flex items-start gap-2.5 mt-3 cursor-pointer">
            <Checkbox checked={introPrivacy} onCheckedChange={checked => setIntroPrivacy(checked === true)} className="mt-0.5 w-4 h-4" />
            <span className="text-[11px] text-muted-foreground leading-relaxed">
              אני מאשר/ת שקראתי והסכמתי ל<span className="text-primary font-medium">מדיניות הפרטיות</span> ו<span className="text-primary font-medium">תנאי השימוש</span>, ומאשר/ת יצירת קשר לתיאום התיקון
            </span>
          </label>

          <Button
            onClick={handleIntroDismiss}
            disabled={!introName.trim() || introPhone.replace(/\D/g, '').length < 9 || !introPrivacy}
            className="w-full h-12 text-sm font-bold rounded-xl mt-4"
          >
            יאללה, בואו נתחיל!
          </Button>
        </div>
      </div>
    )}
    <div className="min-h-screen bg-background flex flex-col" lang="he">
      {/* Skip to content */}
      <a href="#order-content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:right-2 focus:z-50 focus:bg-primary focus:text-primary-foreground focus:px-4 focus:py-2 focus:rounded-lg">דלג לתוכן הראשי</a>
      {/* Promotion Strip */}
      {activePromotion && (activePromotion.display_mode === 'banner' || activePromotion.display_mode === 'both') && <div className="bg-foreground text-background text-center py-2.5 text-xs font-bold tracking-wide border-b-2 border-foreground/10">
          <span>{getPromotionIcon(activePromotion.icon)} {activePromotion.title} — {activePromotion.description}</span>
          {activePromotion.value && activePromotion.value > 0 && <span className="mr-1 font-bold"> | חינם!</span>}
        </div>}

      {/* Header - Clean & Minimal */}
      <header className="sticky top-0 bg-card/95 backdrop-blur-md border-b-2 border-foreground/10 z-10" role="banner">
        <nav className="flex items-center justify-between p-3 max-w-5xl mx-auto" aria-label="ניווט הזמנה">
          <div className="flex items-center gap-3">
            <button onClick={() => {
            if (step === 'model') {
              if (additionalRepairs.length > 0) goToStep('price');
              else navigate('/');
            } else if (step === 'repair') goToStep('model');else if (step === 'bundle') goToStep('repair');else if (step === 'points') {
              if (currentBundle) goToStep('bundle');else goToStep('repair');
            } else if (step === 'price') goToStep('points');else if (step === 'schedule') goToStep('price');else if (step === 'details') goToStep('schedule');else navigate('/');
          }} className="h-10 w-10 rounded-xl bg-muted/60 hover:bg-muted flex items-center justify-center transition-colors border-2 border-foreground/10" aria-label="חזור לשלב הקודם">
              <ArrowRight className="w-4 h-4" />
            </button>
            <Logo size="sm" />
          </div>

          <div className="flex items-center gap-1.5">
            <CustomerZone />
            {/* Mobile hamburger menu */}
            <Button variant="ghost" size="icon" onClick={() => setOrderMenuOpen(!orderMenuOpen)} className="h-10 w-10 rounded-xl bg-muted/80 border-2 border-foreground/10 sm:hidden" aria-label="תפריט">
              {orderMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
            {/* Desktop buttons */}
            <Button variant="ghost" size="icon" onClick={() => {
            const event = new CustomEvent('open-accessibility-widget');
            window.dispatchEvent(event);
          }} className="h-9 w-9 rounded-xl border-2 border-foreground/10 hidden sm:flex" aria-label="נגישות">
              <Accessibility className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={toggleTheme} className="h-9 w-9 rounded-xl border-2 border-foreground/10 hidden sm:flex" aria-label={resolvedTheme === 'dark' ? 'עבור למצב בהיר' : 'עבור למצב כהה'}>
              {resolvedTheme === 'dark' ? <Sun className="w-4 h-4" aria-hidden="true" /> : <Moon className="w-4 h-4" aria-hidden="true" />}
            </Button>
            <a href="tel:033106020" className="h-9 w-9 rounded-xl bg-primary text-primary-foreground items-center justify-center border-2 border-foreground/10 transition-transform hover:scale-105 hidden sm:flex" aria-label="התקשר 033106020">
              <Phone className="w-4 h-4" />
            </a>
          </div>
        </nav>

        {/* Mobile menu dropdown */}
        {orderMenuOpen && (
          <div className="sm:hidden bg-card border-t-2 border-foreground/10 animate-slide-down">
            <div className="flex items-center justify-center gap-4 py-3 px-4">
              <a
                href="tel:033106020"
                className="h-12 w-12 rounded-xl bg-primary text-primary-foreground flex items-center justify-center border-2 border-foreground/10 transition-transform hover:scale-105"
                aria-label="התקשר 033106020"
                onClick={() => setOrderMenuOpen(false)}
              >
                <Phone className="w-5 h-5" />
              </a>
              <Button
                variant="outline"
                size="icon"
                onClick={() => { toggleTheme(); setOrderMenuOpen(false); }}
                className="h-12 w-12 rounded-xl border-2 border-foreground/15"
              >
                {resolvedTheme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => { window.dispatchEvent(new CustomEvent('open-accessibility-widget')); setOrderMenuOpen(false); }}
                className="h-12 w-12 rounded-xl border-2 border-foreground/15"
                aria-label="נגישות"
              >
                <Accessibility className="w-5 h-5" />
              </Button>
            </div>
          </div>
        )}
        
        {/* Step Indicator - Pill style */}
        {step !== 'success' && <div className="px-4 pb-3 max-w-5xl mx-auto" role="navigation" aria-label="שלבי ההזמנה">
            <div className="flex gap-2 items-center" role="progressbar" aria-valuenow={['model','repair','bundle','price','schedule','details'].indexOf(step) + 1} aria-valuemin={1} aria-valuemax={5} aria-label={`שלב ${['model','repair','bundle','price','schedule','details'].indexOf(step) + 1} מתוך 5`}>
              {['model', 'repair', 'price', 'schedule', 'details'].map((s, i) => {
            const labels = ['דגם', 'תיקון', 'מחיר', 'מועד', 'פרטים'];
            const allSteps = ['model', 'repair', 'bundle', 'price', 'schedule', 'details'];
            const displaySteps = ['model', 'repair', 'price', 'schedule', 'details'];
            const currentIdx = allSteps.indexOf(step);
            const displayIdx = displaySteps.indexOf(s);
            const adjustedCurrentIdx = currentIdx >= 3 ? currentIdx - 1 : currentIdx === 2 ? 1.5 : currentIdx;
            const isActive = adjustedCurrentIdx >= displayIdx;
            const isCurrent = Math.floor(adjustedCurrentIdx) === displayIdx;
            return <div key={s} className={`flex-1 text-center py-1.5 rounded-full text-xs font-semibold transition-all duration-300 ${isCurrent ? 'bg-primary text-primary-foreground shadow-md' : isActive ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground'}`} aria-current={isCurrent ? 'step' : undefined}>
                  {labels[i]}
                </div>;
          })}
            </div>
          </div>}
      </header>

      {/* Hidden file input for image upload */}
      <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" aria-label="העלאת תמונות מכשיר" />


      {/* Content */}
      <main id="order-content" ref={contentRef} role="main" aria-label="טופס הזמנת תיקון" className={`flex-1 p-5 pb-28 overflow-y-auto transition-all duration-300 max-w-3xl mx-auto w-full ${isAnimating ? 'opacity-0 scale-[0.98]' : 'opacity-100 scale-100'}`}>
        
        {/* Privacy Consent Modal */}
        <OrderPrivacyConsent open={showPrivacyConsent} onAccept={() => setShowPrivacyConsent(false)} />

        {/* Gift Promo Popup */}
        {showGiftPopup && activePromotion && (activePromotion.display_mode === 'popup' || activePromotion.display_mode === 'both') && <GiftPromoPopup promotionTitle={activePromotion.title} promotionDescription={activePromotion.description} promotionIcon={activePromotion.icon || undefined} onClaimed={() => {
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


        {/* Fullscreen gift burst animation */}
        {showGiftBurst && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none animate-fade-in">
            <div className="absolute inset-0 bg-primary/10 backdrop-blur-sm animate-fade-in" />
            <div className="relative flex flex-col items-center gap-4 animate-scale-in">
              <Gift className="w-16 h-16 text-primary animate-bounce-slow" />
              <p className="text-2xl font-extrabold text-primary drop-shadow-lg">מצב מתנה!</p>
              {[...Array(12)].map((_, i) => (
                <Heart
                  key={i}
                  className="w-5 h-5 text-primary fill-primary absolute animate-heart-particle"
                  style={{
                    '--particle-angle': `${i * 30}deg`,
                    top: '40%',
                  } as React.CSSProperties}
                />
              ))}
            </div>
          </div>
        )}

        {/* Step 1: Select Model - Enhanced Welcome */}
        {step === 'model' && <div className="space-y-8 animate-fade-in py-0 relative">

            {/* Returning customer banner */}
            {isReturningCustomer && !showIntroCard && (
              <div className="bg-success/10 border border-success/30 rounded-2xl p-3 flex items-center gap-3 animate-fade-in">
                <Gift className="w-5 h-5 text-success flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-foreground">ברוכים השבים!</p>
                  <p className="text-xs text-muted-foreground">מגן מסך פרימיום במתנה על תיקון חוזר</p>
                </div>
              </div>
            )}

            {/* Show cart if adding more repairs */}
            {additionalRepairs.length > 0 && renderRepairCart()}

            {/* Hero Welcome Section */}
            <div className="text-center py-4">
              <h1 className="text-4xl font-extrabold mb-3 tracking-tight">
                {additionalRepairs.length > 0 ? 'בחרו דגם לתיקון הנוסף' : (() => {
                  const hour = new Date().getHours();
                  const greeting = hour >= 5 && hour < 12 ? 'בוקר טוב' : hour >= 12 && hour < 17 ? 'צהריים טובים' : hour >= 17 && hour < 21 ? 'ערב טוב' : 'לילה טוב';
                  return introName ? `${greeting} ${introName}, איך נוכל לעזור?` : 'מה נתקן היום?';
                })()}
              </h1>
              <p className="text-muted-foreground text-sm">בחרו את הדגם שלכם ונתחיל</p>
              <div className="flex items-center justify-center gap-4 mt-4">
                <Dialog>
                  <DialogTrigger asChild>
                    <button className="text-primary hover:text-primary/80 transition-colors flex items-center gap-1.5 text-sm font-medium">
                      <HelpCircle className="w-4 h-4" />
                      איך השירות עובד?
                    </button>
                  </DialogTrigger>
                  <DialogContent className="max-w-sm max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="text-right text-lg">איך זה עובד?</DialogTitle>
                    </DialogHeader>
                    
                    {/* Video */}
                    <div className="relative">
                      <div className="absolute -inset-3 bg-primary/15 blur-xl rounded-2xl" />
                      <VideoPlayer
                        src="https://directfix.co.il/wp-content/uploads/2026/03/directfixexplain2.mp4"
                        className="relative border border-border/50 shadow-wolt-lg"
                      />
                    </div>

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


            {/* Smart AI Search */}
            <SmartRepairInput models={models} repairTypes={repairTypes} priceMap={priceMap} onModelAndRepairFound={handleSmartModelAndRepair} onModelFound={handleSmartModelOnly} />

            <ModelPicker models={filteredModels} selectedModel={selectedModel} onSelect={model => setSelectedModel(model)} onConfirm={model => handleModelSelect(model)} />

            {/* Testimonials Slider */}
            <TestimonialsSlider />

            {/* Gift mode switcher */}
            <GiftOrderToggle
              isGift={isGiftOrder}
              onToggle={(checked) => {
                setIsGiftOrder(checked);
                if (checked) {
                  setShowGiftBurst(true);
                  setTimeout(() => setShowGiftBurst(false), 1200);
                }
              }}
              label="הזמנה במתנה"
            />

          </div>}

        {/* Step 2: Select Repair Type */}
        {step === 'repair' && <div className="space-y-5 animate-fade-in">
            <div className="text-center mb-4">
              <div className="inline-flex items-center gap-2 bg-accent/10 text-accent rounded-full px-4 py-1.5 text-sm font-semibold mb-3">
                <Smartphone className="w-4 h-4" />
                {selectedModel?.name}
              </div>
              <h2 className="text-3xl font-extrabold">{additionalRepairs.length > 0 ? 'הוסף תיקון נוסף' : 'מה צריך לתקן?'}</h2>
            </div>

            {/* April Sale Banner */}
            {additionalRepairs.length === 0 && (
              <div className="relative overflow-hidden rounded-2xl p-[2px] bg-gradient-to-r from-red-500 via-orange-400 to-red-500 animate-gradient-x shadow-lg shadow-red-500/20" style={{ backgroundSize: '200% 200%' }}>
                <div className="relative rounded-[14px] bg-gradient-to-r from-red-950 via-orange-950 to-red-950 p-5 overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(239,68,68,0.15),transparent_60%)]" />
                  <div className="absolute top-0 right-0 bg-gradient-to-l from-red-500 to-orange-500 text-white text-xs font-black px-5 py-1.5 rounded-bl-xl tracking-widest">
                    SALE
                  </div>
                  <div className="relative flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-red-500/30 to-orange-500/30 rounded-2xl flex items-center justify-center flex-shrink-0 border border-red-500/40">
                      <BadgePercent className="w-8 h-8 text-red-400 animate-bounce" style={{ animationDuration: '2s' }} />
                    </div>
                    <div>
                      <p className="font-black text-white text-base leading-tight">מבצעי אפריל - פעם בשנה!</p>
                      <p className="text-sm text-orange-300 font-bold mt-1">הנחות בלעדיות על כל התיקונים</p>
                      <p className="text-xs text-white/50 mt-0.5">המחירים כבר כוללים את ההנחה</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {additionalRepairs.length > 0 && renderRepairCart()}

            <div className="space-y-3">
              {repairTypes.filter(repair => {
                if (!selectedModel) return true;
                // Hide any repair type where price is 0
                const price = getRepairPrice(repair);
                if (price <= 0 && !repair.is_phone_only && !repair.name.includes('אחר')) return false;
                return true;
              }).map((repair, index) => {
            const isPhoneOnly = repair.is_phone_only;
            const isBackGlass = repair.name.includes('גב');
            const isCharging = repair.name.includes('טעינה');
            let price = 0;
            if (selectedModel) {
              price = getRepairPrice(repair);
            }
            // App-exclusive discount
            const isScreen = repair.name.includes('מסך');
            const isBattery = repair.name.includes('סוללה');
            const appDiscount = isScreen ? 35 : isBattery ? 30 : 0;
            const discountedPrice = price > 0 ? price - appDiscount : 0;

            const info = repair.info_title && repair.info_description ? { title: repair.info_title, description: repair.info_description } : null;
            const IconComponent = getRepairIconComponent(repair.icon);
            return <div key={repair.id}>
                    <Card onClick={() => handleRepairSelect(repair)} className={`p-5 cursor-pointer transition-all duration-200 active:scale-[0.98] rounded-2xl border-2 hover:-translate-y-0.5 ${
                      showBackColorPicker && isBackGlass 
                        ? 'border-primary bg-primary/5 shadow-[4px_4px_0_0_hsl(var(--primary)/0.15)]' 
                        : isPhoneOnly ? 'border-dashed border-muted-foreground/30' : 'border-foreground/15 hover:border-primary/40 hover:bg-primary/5 shadow-[3px_3px_0_0_hsl(var(--foreground)/0.06)] hover:shadow-[5px_5px_0_0_hsl(var(--foreground)/0.1)]'
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
                          {!isPhoneOnly && selectedModel && price > 0 && (
                            <div className="flex items-center gap-2 mt-2">
                              {appDiscount > 0 ? (
                                <>
                                  <span className="line-through text-muted-foreground text-lg">₪{price}</span>
                                  <span className="text-2xl font-bold text-primary">₪{discountedPrice}</span>
                                </>
                              ) : (
                                <span className="text-2xl font-bold text-primary">₪{price}</span>
                              )}
                            </div>
                          )}
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

                    {/* Inline Screen Type Picker - original vs compatible */}
                    {isScreen && showScreenTypePicker && selectedModel && selectedModel.compatible_screen_price > 0 && (() => {
                      const originalPrice = getRepairPrice(repair);
                      const compatiblePrice = selectedModel.compatible_screen_price;
                      const appDiscountOriginal = 35;
                      const appDiscountCompatible = 35;
                      return (
                        <div className="overflow-hidden animate-fade-in">
                          <div className="pt-3 pb-1 px-1 space-y-3">
                            <div className="text-center">
                              <h3 className="text-lg font-bold">בחרו סוג מסך</h3>
                              <p className="text-sm text-muted-foreground">שני המסכים מגיעים עם אחריות מלאה</p>
                            </div>
                            <div className="space-y-2">
                              {/* Original Screen */}
                              {originalPrice > 0 && (
                                <button
                                  onClick={() => {
                                    setSelectedScreenType('original');
                                    setShowScreenTypePicker(false);
                                    updateLeadStep('אישור מחיר', { repair_type: repair.name + ' (מקורי)' });
                                    trackAddToCart(repair.name + ' מקורי', originalPrice - appDiscountOriginal);
                                    gaSelectRepair(repair.name + ' מקורי', originalPrice - appDiscountOriginal);
                                    const bundle = repairBundles.find(b => repair.name.includes(b.primary_repair_type));
                                    if (bundle) {
                                      setCurrentBundle(bundle);
                                      setSelectedBundleAddon(false);
                                      goToStep('bundle');
                                    } else {
                                      checkClubMemberAndNavigate();
                                    }
                                  }}
                                  className={`w-full p-4 rounded-2xl border-2 transition-all text-right ${
                                    selectedScreenType === 'original'
                                      ? 'border-primary bg-primary/5 shadow-md'
                                      : 'border-border hover:border-primary/40'
                                  }`}
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <span className="line-through text-muted-foreground text-sm">{originalPrice} ש"ח</span>
                                      <span className="text-xl font-bold text-primary">{originalPrice - appDiscountOriginal} ש"ח</span>
                                    </div>
                                    <div>
                                      <p className="font-bold text-base">מסך מקורי</p>
                                      <p className="text-xs text-muted-foreground">מסך Apple מקורי - איכות מפעל</p>
                                    </div>
                                  </div>
                                </button>
                              )}
                              {/* Compatible Screen - Soft OLED */}
                              <button
                                onClick={() => {
                                  setSelectedScreenType('compatible');
                                  setShowScreenTypePicker(false);
                                  updateLeadStep('אישור מחיר', { repair_type: repair.name + ' (Soft OLED)' });
                                  trackAddToCart(repair.name + ' Soft OLED', compatiblePrice - appDiscountCompatible);
                                  gaSelectRepair(repair.name + ' Soft OLED', compatiblePrice - appDiscountCompatible);
                                  const bundle = repairBundles.find(b => repair.name.includes(b.primary_repair_type));
                                  if (bundle) {
                                    setCurrentBundle(bundle);
                                    setSelectedBundleAddon(false);
                                    goToStep('bundle');
                                  } else {
                                    checkClubMemberAndNavigate();
                                  }
                                }}
                                className={`w-full p-4 rounded-2xl border-2 transition-all text-right relative overflow-hidden ${
                                  selectedScreenType === 'compatible'
                                    ? 'border-primary bg-primary/5 shadow-md'
                                    : 'border-border hover:border-primary/40'
                                }`}
                              >
                                <div className="absolute top-0 left-0 bg-gradient-to-r from-red-500 to-orange-500 text-white text-[10px] font-black px-3 py-0.5 rounded-br-lg tracking-wider">
                                  מומלץ
                                </div>
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <span className="line-through text-muted-foreground text-sm">{compatiblePrice} ש"ח</span>
                                    <span className="text-xl font-bold text-primary">{compatiblePrice - appDiscountCompatible} ש"ח</span>
                                  </div>
                                  <div>
                                    <p className="font-bold text-base">Soft OLED</p>
                                    <p className="text-xs text-muted-foreground">איכות הכי קרובה למקורי - מחיר מבצע</p>
                                  </div>
                                </div>
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>;
            })}
            </div>

            {/* Other Repair Inline Form */}
            {selectedRepair?.name.includes('תיקון אחר') && (
              <div className="animate-fade-in space-y-4 mt-4">
                <Card className="p-5 border-2 border-primary/30 bg-primary/5 rounded-2xl">
                  <h3 className="font-bold text-lg mb-2">ספרו לנו מה צריך לתקן</h3>
                  <Textarea
                    placeholder="תארו את התקלה או סוג התיקון שאתם צריכים..."
                    value={otherRepairDescription}
                    onChange={(e) => setOtherRepairDescription(e.target.value)}
                    className="min-h-[100px] text-base"
                  />
                  
                  <div className="mt-4 space-y-3">
                    <Input
                      placeholder="שם מלא *"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                    />
                    <Input
                      placeholder="מספר טלפון *"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(formatPhone(e.target.value))}
                      type="tel"
                      dir="ltr"
                      className="text-right"
                    />
                    <Input
                      type="email"
                      placeholder="אימייל (לא חובה)"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      dir="ltr"
                      className="text-right"
                    />
                  </div>

                  <div className="mt-4 p-3 bg-muted/60 rounded-xl">
                    <p className="text-sm text-muted-foreground text-center">
                      נקבל את הפרטים ונחזור אליכם בהקדם לתיאום וסיכום מחיר
                    </p>
                  </div>

                  <Button
                    onClick={handleOtherRepairSubmit}
                    disabled={isSubmitting || !otherRepairDescription.trim() || !customerName.trim() || !customerPhone.trim()}
                    className="w-full h-14 text-base font-bold rounded-xl mt-4"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <Send className="w-5 h-5 ml-2" />
                        שלחו לנו ונחזור אליכם
                      </>
                    )}
                  </Button>
                </Card>
              </div>
            )}
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
              <h2 className="font-bold mb-2 text-xl">הצעה מיוחדת!</h2>
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
                    <span className="text-muted-foreground line-through text-sm">₪{getBatteryBasePrice()}</span>
                    <span className="text-2xl font-bold text-success">₪{Math.round(getBatteryBasePrice() * (1 - currentBundle.discount_percent / 100))}</span>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground">
                  רוב הלקוחות שמחליפים מסך מוסיפים גם סוללה חדשה
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
              סוללה מקורית עם 100% בריאות
            </p>
          </div>}

        {/* Step 2.7: Points Earned Animation */}
        {step === 'points' && (
          <PointsEarnedAnimation
            repairPrice={getTotalPrice()}
            onContinue={(joined) => {
              setJoinedClub(joined);
              goToStep('price');
            }}
          />
        )}

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
                {/* All repairs as line items */}
                {additionalRepairs.map((ar, idx) => (
                  <div key={idx} className="flex justify-between items-center text-sm py-1 border-b border-border/30 last:border-0">
                    <div className="flex-1">
                      <span className="font-semibold">{ar.model.name}</span>
                      <span className="text-muted-foreground"> · {ar.repair.name}{ar.backColor ? ` (${ar.backColor})` : ''}</span>
                    </div>
                    <span className="font-bold">₪{ar.price}</span>
                  </div>
                ))}
                {/* Current repair */}
                {selectedRepair && selectedModel && (
                  <div className="flex justify-between items-center text-sm py-1 border-b border-border/30 last:border-0">
                    <div className="flex-1">
                      <span className="font-semibold">{selectedModel.name}</span>
                      <span className="text-muted-foreground"> · {getRepairTypeName()}{selectedBackColor ? ` (${selectedBackColor})` : ''}</span>
                    </div>
                    <span className="font-bold">₪{getPrice()}</span>
                  </div>
                )}
                
                {/* Bundle Addon */}
                {selectedBundleAddon && currentBundle && selectedModel && <div className="flex justify-between items-center text-sm bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-lg p-2 -mx-1">
                    <span className="text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1.5">
                      <Battery className="w-4 h-4" /> החלפת סוללה
                      <span className="text-[10px] bg-amber-500 text-white px-1.5 py-0.5 rounded-full">-{currentBundle.discount_percent}%</span>
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs line-through text-muted-foreground">₪{getBatteryBasePrice()}</span>
                      <span className="font-semibold text-success">₪{getBundleAddonPrice()}</span>
                    </div>
                  </div>}

                {/* Multi-repair discount */}
                {getMultiRepairDiscount() > 0 && (
                  <div className="flex justify-between items-center text-sm bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-lg p-2 -mx-1">
                    <span className="text-success font-medium flex items-center gap-1.5">
                      15% הנחה על התיקון הזול
                    </span>
                    <span className="font-bold text-success">-₪{getMultiRepairDiscount()}</span>
                  </div>
                )}
                
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
                          <span className="font-bold text-success">חינם!</span>
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
                    רוצה לצרף תמונה של המכשיר? (לא חובה)
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

                {/* Loyalty discount */}
                {loyaltyDiscount > 0 && (
                  <div className="flex justify-between items-center text-sm bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-2 -mx-1">
                    <span className="text-primary font-medium flex items-center gap-1.5">
                      <Award className="w-4 h-4" />
                      הנחת נקודות נאמנות ({customerLoyaltyPoints} נק')
                    </span>
                    <span className="font-bold text-success">-₪{loyaltyDiscount}</span>
                  </div>
                )}

                {/* Points to earn */}
                {joinedClub && getPointsToEarn() > 0 && (
                  <div className="bg-gradient-to-r from-amber-500/5 to-primary/10 rounded-xl p-3 -mx-1 border border-amber-500/20 space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1.5">
                        <Crown className="w-4 h-4" />
                        נקודות מועדון שתצברו
                      </span>
                      <span className="font-bold text-primary text-lg">+{getPointsToEarn()}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowPointsInfo(!showPointsInfo)}
                      className="w-full flex items-center justify-between bg-primary/5 hover:bg-primary/10 rounded-lg px-3 py-2 transition-colors"
                    >
                      <span className="text-xs font-semibold text-primary flex items-center gap-1.5">
                        <HelpCircle className="w-3.5 h-3.5" />
                        איך זה עובד?
                      </span>
                      <ChevronDown className={`w-4 h-4 text-primary transition-transform duration-200 ${showPointsInfo ? 'rotate-180' : ''}`} />
                    </button>
                    {showPointsInfo && (
                      <div className="bg-card/80 rounded-lg p-3 border border-border/50 space-y-2.5 animate-slide-up">
                        <div className="flex items-start gap-2.5">
                          <div className="w-5 h-5 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-[10px] font-bold text-primary">1</span>
                          </div>
                          <p className="text-xs text-foreground/80">כל <strong className="text-foreground">100 ש"ח</strong> בתיקון = <strong className="text-primary">10 נקודות</strong></p>
                        </div>
                        <div className="flex items-start gap-2.5">
                          <div className="w-5 h-5 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-[10px] font-bold text-primary">2</span>
                          </div>
                          <p className="text-xs text-foreground/80">כל נקודה שווה <strong className="text-primary">0.50 ש"ח</strong> הנחה</p>
                        </div>
                        <div className="flex items-start gap-2.5">
                          <div className="w-5 h-5 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-[10px] font-bold text-primary">3</span>
                          </div>
                          <p className="text-xs text-foreground/80">בהזמנה הבאה הזינו את <strong className="text-foreground">מספר הטלפון</strong> — ההנחה תופיע אוטומטית!</p>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed pt-2 border-t border-border/30">
                          תנאי תוכנית הנאמנות: הנקודות תקפות ל-24 חודשים. החברה רשאית לשנות או לבטל את התוכנית בכל עת בכפוף לחוק. נקודות אינן ניתנות להמרה למזומן.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                <div className="border-t border-border pt-3 mt-3">
                  <div className="flex justify-between items-center">
                    <span className="font-bold">סה"כ</span>
                    <div className="text-right">
                      {(appliedCoupon || loyaltyDiscount > 0) && <span className="text-muted-foreground line-through text-sm mr-2">₪{getTotalPrice()}</span>}
                      <span className="text-xl font-bold text-primary">₪{getFinalPrice()}</span>
                    </div>
                  </div>
                  {appliedCoupon && <div className="text-xs text-success mt-1 text-left">
                      חיסכת ₪{getDiscount()} עם קופון {appliedCoupon.code}!
                    </div>}
                  {loyaltyDiscount > 0 && <div className="text-xs text-primary mt-1 text-left">
                      + ₪{loyaltyDiscount} הנחת נקודות נאמנות
                    </div>}
                  {selectedBundleAddon && currentBundle && <div className="text-xs text-amber-500 mt-1 text-left">
                      כולל סוללה בהנחה של {currentBundle.discount_percent}%
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
                    <p className="font-semibold text-sm">{isGiftOrder ? 'תשלום מאובטח באתר' : 'תשלום בסיום התיקון בלבד'}</p>
                    <p className="text-muted-foreground text-xs mt-0.5">
                      {isGiftOrder ? 'Apple Pay, Google Pay, אשראי או Bit — לפני הגעת הטכנאי' : 'מזומן, אשראי או ביט'}
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
              <div className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold mb-3 ${
                isGiftOrder ? 'bg-primary/10 text-primary' : 'bg-accent/10 text-accent'
              }`}>
                {isGiftOrder ? <Gift className="w-4 h-4" /> : <MapPin className="w-4 h-4" />}
                {isGiftOrder ? 'תיקון במתנה' : 'פרטים אחרונים'}
              </div>
              <h2 className="text-3xl font-extrabold mb-1">{isGiftOrder ? 'פרטי המתנה' : 'לאן נגיע?'}</h2>
              <p className="text-muted-foreground">{isGiftOrder ? 'מלאו את פרטי השולח ומקבל המתנה' : 'מלאו את הפרטים ואנחנו בדרך'}</p>
            </div>

            {/* Gift sender details */}
            {isGiftOrder && (
              <div className="space-y-4 bg-gradient-to-br from-primary/5 to-primary/10 rounded-3xl p-5 border border-primary/20 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Heart className="w-5 h-5 text-primary fill-primary" />
                  <h3 className="font-bold text-lg">פרטי השולח (שלכם)</h3>
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1.5">שם השולח</label>
                  <Input placeholder="השם שלכם" value={giftSenderName} onChange={e => setGiftSenderName(e.target.value)} className="h-13 text-base rounded-2xl bg-card border-border/50 focus:bg-card" />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1.5">טלפון השולח</label>
                  <Input placeholder="050-0000000" value={giftSenderPhone} onChange={e => setGiftSenderPhone(formatPhone(e.target.value))} type="tel" className="h-13 text-base rounded-2xl text-right bg-card border-border/50 focus:bg-card" dir="ltr" />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1.5">
                    ברכה למקבל המתנה <span className="text-muted-foreground font-normal">(לא חובה)</span>
                  </label>
                  <Textarea placeholder="כמה מילים חמות למקבל המתנה..." value={giftMessage} onChange={e => setGiftMessage(e.target.value)} className="text-base rounded-2xl resize-none bg-card border-border/50 focus:bg-card" rows={2} />
                </div>
                
                <div className="bg-card/80 rounded-xl p-3 border border-border/50">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-primary flex-shrink-0" />
                    <p className="text-xs text-muted-foreground">
                      <span className="font-semibold text-foreground">שימו לב:</span> בשלב הבא תשלמו באופן מאובטח באתר, לפני הגעת הטכנאי
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-4 bg-card rounded-3xl p-5 border border-border/50 shadow-sm">
              {isGiftOrder && (
                <div className="flex items-center gap-2 mb-2">
                  <Gift className="w-5 h-5 text-primary" />
                  <h3 className="font-bold text-lg">פרטי מקבל המתנה</h3>
                </div>
              )}
              <div>
                <label className="block text-sm font-bold mb-1.5">{isGiftOrder ? 'שם מקבל המתנה' : 'שם מלא'}</label>
                <Input placeholder={isGiftOrder ? 'שם מקבל המתנה' : 'הכנס שם מלא'} value={customerName} onChange={e => setCustomerName(e.target.value)} className="h-13 text-base rounded-2xl bg-muted/40 border-border/50 focus:bg-card" />
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
                  כתובת אימייל
                </label>
                <Input placeholder="example@email.com" value={customerEmail} onChange={e => setCustomerEmail(e.target.value)} type="email" className="h-13 text-base rounded-2xl bg-muted/40 border-border/50 focus:bg-card text-right" dir="rtl" />
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

            <Card className="p-4 bg-muted/30 space-y-2">
              {additionalRepairs.map((ar, idx) => (
                <div key={idx} className="flex justify-between items-center text-base border-b border-border/30 pb-2">
                  <span className="font-medium">{ar.model.name} • {ar.repair.name}{ar.backColor ? ` (${ar.backColor})` : ''}</span>
                  <span className="font-bold text-primary text-lg whitespace-nowrap">₪{ar.price}</span>
                </div>
              ))}
              <div className="flex justify-between items-center text-base">
                <span className="font-medium">{selectedModel?.name} • {getRepairTypeName()}</span>
                <div className="text-right">
                  {appliedCoupon && <span className="text-muted-foreground line-through mr-2 text-base">₪{getPrice()}</span>}
                  <span className="font-bold text-primary text-xl">₪{getPrice()}</span>
                </div>
              </div>
              {getMultiRepairDiscount() > 0 && (
                <div className="flex justify-between items-center text-base bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-lg p-2">
                  <span className="text-success font-medium">15% הנחה על התיקון הזול</span>
                  <span className="font-bold text-success">-₪{getMultiRepairDiscount()}</span>
                </div>
              )}
              {(additionalRepairs.length > 0 || appliedCoupon) && (
                <div className="flex justify-between items-center text-base border-t border-border pt-2 mt-1">
                  <span className="font-bold">סה״כ</span>
                  <div className="text-right">
                    {appliedCoupon && <span className="text-muted-foreground line-through mr-2 text-base">₪{getTotalPrice()}</span>}
                    <span className="font-extrabold text-primary text-xl">₪{getFinalPrice()}</span>
                  </div>
                </div>
              )}
              {appliedCoupon && <div className="text-base text-success">
                  קופון {appliedCoupon.code} - חיסכת ₪{getDiscount()}!
                </div>}
              <div className="text-base text-muted-foreground">
                {formatSelectedDateTime()}
              </div>
            </Card>
          </div>}

        {/* Step 5.5: Gift Payment */}
        {step === 'gift_payment' && <div className="space-y-5 animate-fade-in">
            <div className="text-center mb-4">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-1.5 text-sm font-semibold mb-3">
                <CreditCard className="w-4 h-4" />
                תשלום מאובטח
              </div>
              <h2 className="text-3xl font-extrabold mb-1">תשלום להזמנת המתנה</h2>
              <p className="text-muted-foreground">השלימו את התשלום כדי לאשר את ההזמנה</p>
              {completedOrderNumber && <p className="text-sm font-semibold text-foreground mt-1">הזמנה #{completedOrderNumber}</p>}
            </div>

            <Card className="p-4 bg-muted/30 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">דגם</span>
                <span className="font-medium">{selectedModel?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">תיקון</span>
                <span className="font-medium">{getRepairTypeName()}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-border">
                <span className="font-bold">סה״כ לתשלום</span>
                <span className="font-bold text-primary text-lg">₪{getFinalPrice()}</span>
              </div>
            </Card>

            {giftPaymentUrl && (
              <div className="rounded-2xl overflow-hidden border-2 border-primary/20 shadow-lg">
                <iframe
                  src={giftPaymentUrl}
                  className="w-full border-0"
                  style={{ height: '500px' }}
                  title="תשלום מאובטח"
                  allow="payment"
                />
              </div>
            )}

            <div className="bg-muted/50 rounded-xl p-4 space-y-3">
              <p className="text-sm text-muted-foreground text-center">
                התשלום מתבצע בסביבה מאובטחת ומוצפנת
              </p>
              <Button onClick={handleGiftPaymentSuccess} className="w-full h-14 text-base rounded-2xl font-bold shadow-lg">
                <CheckCircle2 className="w-5 h-5 ml-2" />
                שילמתי - המשך לאישור
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                לאחר לחיצה נשלח אישור הזמנה למייל שלכם ולמקבל המתנה
              </p>
            </div>
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
                <Sparkles className="absolute -top-1 -right-1 w-7 h-7 text-primary animate-bounce" />
                <Sparkles className="absolute -bottom-1 -left-1 w-7 h-7 text-primary animate-bounce" style={{
              animationDelay: '100ms'
            }} />
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-1 text-success">
                {isGiftOrder ? 'הזמנת המתנה התקבלה!' : 'ההזמנה התקבלה!'}
              </h2>
              {completedOrderNumber && <p className="text-sm font-semibold text-foreground mb-1">הזמנה #{completedOrderNumber}</p>}
              <p className="text-muted-foreground text-sm">
                {isGiftOrder 
                  ? 'התשלום התקבל! נתאם הגעה למקבל המתנה ונשלח אישור במייל'
                  : 'ניצור איתך קשר לאישור המועד'}
              </p>
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
                    <span className="font-bold text-success text-xs">חינם!</span>
                  </div>}
                <div className="flex justify-between pt-2 border-t border-border">
                  <span className="font-bold">סה״כ</span>
                  <span className="font-bold text-primary text-lg">₪{getFinalPrice()}</span>
                </div>
              </div>
            </Card>

            {/* Add to calendar */}
            {getCalendarLink() && (
              <a href={getCalendarLink()} target="_blank" rel="noopener noreferrer" className="block">
                <Button variant="outline" className="w-full h-12 text-base rounded-xl gap-2 border-primary/30 text-primary hover:bg-primary/5">
                  <Calendar className="w-5 h-5" />
                  הוסף ליומן שלי
                </Button>
              </a>
            )}

            <div className="bg-muted/50 rounded-xl p-4">
              <p className="text-sm text-muted-foreground mb-3">תוכלו לעקוב אחרי סטטוס התיקון בזמן אמת</p>
              <Button onClick={handleTrackOrder} className="w-full h-12 text-base rounded-xl">
                מעקב אחר ההזמנה שלי
              </Button>
            </div>

            {customerEmail && <div className="bg-primary/5 border border-primary/20 rounded-xl p-3">
              <p className="text-sm text-foreground">פרטי ההזמנה נשלחו לאימייל <span className="font-semibold" dir="ltr">{customerEmail}</span></p>
              <p className="text-xs text-muted-foreground mt-1">מומלץ לבדוק גם בתיבת הספאם</p>
            </div>}
            
            <Button variant="outline" onClick={() => navigate('/')} className="w-full h-10 rounded-xl">
              חזרה לדף הבית
            </Button>
          </div>}
      </main>

      {/* Disclaimer */}
      {step === 'model' && <div className="text-center px-6 py-3">
          <p className="text-[11px] text-muted-foreground/60 leading-relaxed">
            * זמני ההגעה עשויים להשתנות בהתאם לזמינות הטכנאים ולמיקום הלקוח.
          </p>
        </div>}

      {/* Sticky Footer with Action Buttons */}
      {step !== 'success' && step !== 'model' && step !== 'repair' && step !== 'gift_payment' && <div className="sticky bottom-0 left-0 right-0 bg-card/95 backdrop-blur-md border-t-2 border-foreground/10 p-4 safe-area-pb shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
          {step === 'price' && <div className="space-y-2">
              <Button onClick={handlePriceConfirm} className="w-full h-14 text-base rounded-2xl font-bold shadow-lg hover:shadow-xl">
                אישור ובחירת מועד לטכנאי
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  // Save current repair before going back to model selection
                  if (selectedRepair && selectedModel) {
                    setAdditionalRepairs(prev => [...prev, { 
                      repair: selectedRepair, 
                      price: getRepairPrice(selectedRepair),
                      backColor: selectedBackColor || undefined,
                      model: selectedModel
                    }]);
                  }
                  if (selectedBundleAddon && currentBundle && selectedModel) {
                    const batteryRepair = repairTypes.find(r => r.name.includes('סוללה'));
                    if (batteryRepair) {
                      setAdditionalRepairs(prev => [...prev, { 
                        repair: batteryRepair, 
                        price: getBundleAddonPrice(),
                        model: selectedModel
                      }]);
                    }
                    setSelectedBundleAddon(false);
                    setCurrentBundle(null);
                  }
                  setSelectedRepair(null);
                  setSelectedModel(null);
                  setSelectedBackColor('');
                  goToStep('model');
                }}
                className="w-full h-12 text-sm rounded-2xl gap-2"
              >
                <Wrench className="w-4 h-4" />
                + תיקון נוסף (15% הנחה!)
              </Button>
            </div>}
          
          {step === 'schedule' && <Button onClick={handleScheduleConfirm} disabled={!selectedDate || !selectedTimeSlot} className="w-full h-14 text-base rounded-2xl font-bold shadow-lg hover:shadow-xl">
              המשך לפרטים
            </Button>}
          
          {step === 'details' && <Button onClick={handleSubmit} disabled={isSubmitting || !acceptPrivacy || !acceptContact} className="w-full h-14 text-base rounded-2xl font-bold shadow-lg hover:shadow-xl">
              {isSubmitting ? <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  שולח...
                </div> : isGiftOrder ? 'המשך לתשלום' : 'שלח הזמנה'}
            </Button>}
        </div>}
    </div>
  </>;
};
export default NewRepairOrder;