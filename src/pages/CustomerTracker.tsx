import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import PhoneInput from '@/components/PhoneInput';
import StatusTimeline from '@/components/StatusTimeline';
import TechnicianTracker from '@/components/TechnicianTracker';
import RepairInProgress from '@/components/RepairInProgress';
import AccessoriesUpsell from '@/components/AccessoriesUpsell';
import LiveChat from '@/components/LiveChat';
import RatingPrompt from '@/components/RatingPrompt';
import PromotionsOptIn from '@/components/PromotionsOptIn';
import OrderSummary from '@/components/OrderSummary';
import OrderSummarySheet from '@/components/OrderSummarySheet';
import StickyHeader from '@/components/StickyHeader';
import PrivacyConsentModal from '@/components/PrivacyConsentModal';
import RepairHistoryList from '@/components/RepairHistoryList';
import WarrantyCertificate from '@/components/WarrantyCertificate';
import LoyaltyPointsDisplay from '@/components/LoyaltyPointsDisplay';
import { useRepairStore } from '@/store/repairStore';
import { supabase } from '@/integrations/supabase/client';
import Logo from '@/components/Logo';
import { FileText, Download, CreditCard, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RepairOrder, ChatMessage, RepairStatus, PaymentStatus, Accessory } from '@/types/repair';
import SEO from "@/components/SEO";
import { seo } from "@/lib/seoData";

const defaultAccessories: Accessory[] = [
  { id: '1', name: 'מגן מסך רגיל', price: 50, originalPrice: 79, selected: false },
  { id: '2', name: 'מגן מסך פרימיום', price: 100, originalPrice: 149, selected: false },
  { id: '3', name: 'מטען מהיר + כבל', price: 70, originalPrice: 119, selected: false },
  { id: '4', name: 'כיסוי שקוף פרימיום', price: 50, originalPrice: 89, selected: false },
];

const dbToOrder = (row: any): RepairOrder => ({
  id: row.id,
  orderNumber: row.order_number,
  customerPhone: row.customer_phone,
  customerName: row.customer_name,
  customerEmail: row.customer_email || undefined,
  customerAddress: row.customer_address || '',
  deviceType: row.device_type || '',
  issueDescription: row.issue_description || '',
  status: row.status as RepairStatus,
  estimatedArrival: row.estimated_arrival,
  technicianName: row.technician_name,
  repairPrice: Number(row.repair_price) || 0,
  accessories: row.accessories || defaultAccessories,
  notes: row.notes || [],
  createdAt: new Date(row.created_at),
  updatedAt: new Date(row.updated_at),
  completedAt: row.completed_at ? new Date(row.completed_at) : undefined,
  wantsPromotions: row.wants_promotions || false,
  rating: row.rating,
  feedback: row.feedback,
  lastViewedAt: row.last_viewed_at ? new Date(row.last_viewed_at) : undefined,
  isViewing: row.is_viewing || false,
  wazeLink: row.waze_link,
  invoiceLink: row.invoice_link,
  paymentLink: row.payment_link,
  paymentStatus: (row.payment_status as PaymentStatus) || 'none',
  leadSource: row.lead_source || undefined,
  deviceImages: row.device_images || [],
  isClubMember: row.is_club_member || false,
  warrantyMonths: row.warranty_months || undefined,
});

const dbToMessage = (row: any): ChatMessage => ({
  id: row.id,
  orderId: row.order_id,
  sender: row.sender as 'customer' | 'support',
  senderName: row.sender_name,
  message: row.message,
  timestamp: new Date(row.timestamp),
  read: row.read,
});


const CustomerTracker = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [showStickyHeader, setShowStickyHeader] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [phoneOrders, setPhoneOrders] = useState<RepairOrder[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [hasAcceptedPrivacy, setHasAcceptedPrivacy] = useState(() => {
    return localStorage.getItem('privacy_consent_accepted') === 'true';
  });

  // Local state (replaces the store-loaded orders/messages for public tracker)
  const [currentOrder, setCurrentOrder] = useState<RepairOrder | null>(null);
  const [orderMessages, setOrderMessages] = useState<ChatMessage[]>([]);
  const [verifiedPhone, setVerifiedPhone] = useState<string>('');
  const pollingRef = useRef<number | null>(null);

  // Fetch via secure edge function (returns only this phone's data)
  const fetchForPhone = async (phone: string, orderId?: string) => {
    const { data, error: fnError } = await supabase.functions.invoke(
      'customer-tracker-lookup',
      { body: { phone, orderId } }
    );
    if (fnError) throw fnError;
    const orders: RepairOrder[] = ((data as any)?.orders || []).map(dbToOrder);
    const messages: ChatMessage[] = ((data as any)?.messages || []).map(dbToMessage);
    return { orders, messages };
  };

  // Poll current order every 15s (replaces realtime, which is blocked by RLS for anon)
  useEffect(() => {
    if (!currentOrder || !verifiedPhone) return;
    const tick = async () => {
      try {
        const { orders, messages } = await fetchForPhone(verifiedPhone, currentOrder.id);
        if (orders[0]) {
          setCurrentOrder(prev => {
            if (!prev) return orders[0];
            return JSON.stringify(prev) !== JSON.stringify(orders[0]) ? orders[0] : prev;
          });
        }
        setOrderMessages(messages);
      } catch (e) {
        console.error('polling error', e);
      }
    };
    pollingRef.current = window.setInterval(tick, 15000);
    return () => {
      if (pollingRef.current) window.clearInterval(pollingRef.current);
    };
  }, [currentOrder?.id, verifiedPhone]);

  // Auto-search when ?phone= is in URL
  useEffect(() => {
    const phone = searchParams.get('phone');
    if (phone) {
      handleSearch(phone);
    }
  }, [searchParams]);

  useEffect(() => {
    const handleScroll = () => {
      setShowStickyHeader(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = async (phone: string) => {
    setIsSearching(true);
    setError('');
    try {
      const { orders, messages } = await fetchForPhone(phone);
      if (orders.length > 1) {
        setPhoneOrders(orders);
        setShowHistory(true);
        setCurrentOrder(null);
        setVerifiedPhone(phone);
      } else if (orders.length === 1) {
        setCurrentOrder(orders[0]);
        setOrderMessages(messages);
        setPhoneOrders(orders);
        setVerifiedPhone(phone);
        setShowHistory(false);
        if (!hasAcceptedPrivacy) setShowPrivacyModal(true);
      } else {
        setError('לא נמצאה הזמנה עם מספר הטלפון הזה. וודאו שהמספר נכון או צרו קשר עם התמיכה.');
        setCurrentOrder(null);
        setPhoneOrders([]);
        setShowHistory(false);
      }
    } catch (e: any) {
      setError('שגיאה בטעינת ההזמנה. נסו שוב.');
    } finally {
      setIsSearching(false);
    }
  };

  // Send a customer chat message (INSERT still allowed for anon)
  const addCustomerMessage = async (orderId: string, message: string) => {
    const { error: insErr } = await supabase.from('messages').insert({
      order_id: orderId,
      sender: 'customer',
      sender_name: currentOrder?.customerName || 'לקוח',
      message,
      read: false,
    });
    if (insErr) {
      console.error('send message failed', insErr);
      return;
    }
    // Optimistic refresh
    if (verifiedPhone && currentOrder) {
      try {
        const { messages } = await fetchForPhone(verifiedPhone, currentOrder.id);
        setOrderMessages(messages);
      } catch {}
    }
    // Fire-and-forget notifications
    supabase.functions.invoke('send-push-notification', {
      body: {
        title: `הודעה חדשה מ-${currentOrder?.customerName || 'לקוח'}`,
        body: message.substring(0, 100),
        url: '/admin',
      },
    }).catch(() => {});
    supabase.functions.invoke('notify-customer-message', {
      body: {
        orderId,
        customerName: currentOrder?.customerName || 'לקוח',
        message,
        orderNumber: currentOrder?.orderNumber,
      },
    }).catch(() => {});
  };

  // Client-only versions of accessory/promo/rating updates: skipped for now
  // (they require admin path or an authenticated customer path — safe no-ops on the
  // public tracker after the RLS lockdown; the admin sees these fields).
  const toggleAccessory = async (_orderId: string, _accessoryId: string) => {};
  const setWantsPromotions = async (_orderId: string, _wants: boolean) => {};
  const setRating = async (_orderId: string, _rating: number, _feedback?: string) => {};
  const setViewingStatus = async (_orderId: string, _v: boolean) => {};


  const handleSelectOrder = (order: RepairOrder) => {
    setCurrentOrder(order);
    setShowHistory(false);
    if (!hasAcceptedPrivacy) {
      setShowPrivacyModal(true);
    }
  };

  const handlePrivacyAccept = () => {
    setHasAcceptedPrivacy(true);
    setShowPrivacyModal(false);
    // Sync with promotions opt-in if communication was accepted
    if (currentOrder && localStorage.getItem('privacy_consent_communication') === 'true') {
      setWantsPromotions(currentOrder.id, true);
    }
  };

  const handleBack = () => {
    if (showHistory || phoneOrders.length <= 1) {
      setCurrentOrder(null);
      setShowHistory(false);
      setPhoneOrders([]);
      navigate('/track');
    } else {
      // Go back to history list
      setCurrentOrder(null);
      setShowHistory(true);
    }
  };

  // orderMessages already maintained in state above


  // Phone input screen or history list
  if (!currentOrder) {
    return (
      <div className="min-h-screen bg-background" lang="he">
        <SEO {...seo.track} />
        <Header showBackButton={showHistory} onBack={() => { setShowHistory(false); setPhoneOrders([]); }} />
        <main className="container py-8 px-4" role="main" aria-label="מעקב הזמנות - חיפוש">
          {showHistory && phoneOrders.length > 0 ? (
            <RepairHistoryList 
              orders={phoneOrders} 
              onSelectOrder={handleSelectOrder} 
            />
          ) : (
            <>
              <div className="max-w-sm mx-auto text-center mb-8 animate-slide-down">
                <Logo size="md" clickable={false} className="justify-center mb-4" />
                <p className="text-muted-foreground text-sm">מעקב אחר התיקון שלכם בזמן אמת</p>
              </div>
              <PhoneInput 
                onSubmit={handleSearch}
                isLoading={isSearching}
                error={error}
              />
            </>
          )}
        </main>
      </div>
    );
  }

  const showTechnicianTracker = currentOrder.status === 'on_the_way';
  const showRepairInProgress = (currentOrder.status === 'in_progress' || currentOrder.status === 'arrived') && currentOrder.technicianName;
  const showAccessories = currentOrder.status !== 'completed';
  const showRating = currentOrder.status === 'completed';

  return (
    <div className="min-h-screen bg-background pb-28" lang="he">
      <Header showBackButton onBack={handleBack} />
      {/* Privacy Consent Modal */}
      <PrivacyConsentModal
        open={showPrivacyModal}
        onAccept={handlePrivacyAccept}
        customerName={currentOrder.customerName}
      />
      
      {/* Sticky header when scrolling */}
      {showTechnicianTracker && (
        <StickyHeader
          technicianName={currentOrder.technicianName || 'הטכנאי'}
          estimatedArrival={currentOrder.estimatedArrival}
          isVisible={showStickyHeader}
        />
      )}

      {/* Receipt icon sheet */}
      <OrderSummarySheet order={currentOrder} />
      
      <main className="container py-5 px-4 space-y-5 max-w-lg mx-auto" role="main" aria-label="מעקב הזמנת תיקון">
        {/* Welcome */}
        <div className="animate-slide-down text-center pt-2 pb-3">
          <p className="text-muted-foreground text-sm">שלום,</p>
          <h1 className="text-2xl font-bold text-foreground">{currentOrder.customerName}</h1>
        </div>

        {/* Payment pending notification */}
        {currentOrder.paymentLink && currentOrder.paymentStatus === 'pending' && (
          <div className="glass-card rounded-xl p-5 animate-fade-in border-2 border-warning/50 bg-warning/5">
            <div className="flex items-center gap-3 mb-3">
              <div className="relative">
                <div className="w-10 h-10 bg-warning/20 rounded-lg flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-warning" />
                </div>
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-success"></span>
                </span>
              </div>
              <div>
                <h3 className="font-semibold text-foreground">חשבונית ממתינה לתשלום</h3>
                <p className="text-sm text-muted-foreground">לחצו לתשלום מאובטח</p>
              </div>
            </div>
            <a 
              href={currentOrder.paymentLink} 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-full"
            >
              <Button className="w-full gap-2 bg-warning hover:bg-warning/90 text-warning-foreground">
                <ExternalLink className="w-4 h-4" />
                לתשלום
              </Button>
            </a>
          </div>
        )}

        {/* Rating prompt - show at top when completed */}
        {showRating && (
          <RatingPrompt 
            onRate={(rating, feedback) => setRating(currentOrder.id, rating, feedback)}
            currentRating={currentOrder.rating}
            currentFeedback={currentOrder.feedback}
          />
        )}

        {/* Warranty Certificate - show when completed */}
        {showRating && (
          <WarrantyCertificate order={currentOrder} />
        )}

        {/* Loyalty Points - show when completed */}
        {showRating && (
          <LoyaltyPointsDisplay
            customerPhone={currentOrder.customerPhone}
            mode="tracker"
            repairPrice={currentOrder.repairPrice}
            showTerms
          />
        )}

        {/* Invoice download - show below rating when completed */}
        {showRating && currentOrder.invoiceLink && (
          <div className="glass-card rounded-xl p-5 animate-fade-in">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">חשבונית זמינה</h3>
                <p className="text-sm text-muted-foreground">לחצו להורדת החשבונית</p>
              </div>
            </div>
            <a 
              href={currentOrder.invoiceLink} 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-full"
            >
              <Button className="w-full gap-2">
                <Download className="w-4 h-4" />
                הורד חשבונית
              </Button>
            </a>
          </div>
        )}

        {/* Technician tracker - on the way */}
        {showTechnicianTracker && (
          <TechnicianTracker
            technicianName={currentOrder.technicianName || 'הטכנאי'}
            estimatedArrival={currentOrder.estimatedArrival}
            customerAddress={currentOrder.customerAddress}
            wazeLink={currentOrder.wazeLink}
          />
        )}

        {/* Repair in progress */}
        {showRepairInProgress && (
          <RepairInProgress
            technicianName={currentOrder.technicianName}
            deviceType={currentOrder.deviceType}
          />
        )}

        {/* Status timeline */}
        <StatusTimeline 
          currentStatus={currentOrder.status}
          estimatedArrival={currentOrder.estimatedArrival}
          updatedAt={currentOrder.updatedAt}
        />

        {/* Accessories upsell */}
        {showAccessories && (
          <AccessoriesUpsell
            accessories={currentOrder.accessories}
            onToggle={(accessoryId) => toggleAccessory(currentOrder.id, accessoryId)}
            disabled={currentOrder.status === 'in_progress'}
          />
        )}

        {/* Order summary */}
        <OrderSummary order={currentOrder} />

        {/* Invoice download - also show when not completed but link exists */}
        {!showRating && currentOrder.invoiceLink && (
          <div className="glass-card rounded-xl p-5 animate-fade-in">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">חשבונית זמינה</h3>
                <p className="text-sm text-muted-foreground">לחצו להורדת החשבונית</p>
              </div>
            </div>
            <a 
              href={currentOrder.invoiceLink} 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-full"
            >
              <Button className="w-full gap-2">
                <Download className="w-4 h-4" />
                הורד חשבונית
              </Button>
            </a>
          </div>
        )}

        {/* Promotions */}
        <PromotionsOptIn
          checked={currentOrder.wantsPromotions}
          onCheckedChange={(checked) => setWantsPromotions(currentOrder.id, checked)}
        />
      </main>

      {/* Live chat */}
      <LiveChat
        messages={orderMessages}
        onSendMessage={(message) => addCustomerMessage(currentOrder.id, message)}
      />
    </div>
  );
};

export default CustomerTracker;
