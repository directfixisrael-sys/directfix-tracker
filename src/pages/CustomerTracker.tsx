import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import PhoneInput from '@/components/PhoneInput';
import StatusTimeline from '@/components/StatusTimeline';
import TechnicianTracker from '@/components/TechnicianTracker';
import AccessoriesUpsell from '@/components/AccessoriesUpsell';
import LiveChat from '@/components/LiveChat';
import RatingPrompt from '@/components/RatingPrompt';
import PromotionsOptIn from '@/components/PromotionsOptIn';
import OrderSummary from '@/components/OrderSummary';
import OrderSummarySheet from '@/components/OrderSummarySheet';
import StickyHeader from '@/components/StickyHeader';
import PrivacyConsentModal from '@/components/PrivacyConsentModal';
import { useRepairStore } from '@/store/repairStore';
import logo from '@/assets/logo.png';
import { FileText, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

const CustomerTracker = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [showStickyHeader, setShowStickyHeader] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [hasAcceptedPrivacy, setHasAcceptedPrivacy] = useState(() => {
    return localStorage.getItem('privacy_consent_accepted') === 'true';
  });

  const {
    orders,
    currentOrder,
    setCurrentOrder,
    findOrderByPhone,
    toggleAccessory,
    setWantsPromotions,
    setRating,
    addCustomerMessage,
    setViewingStatus,
    messages,
    loadOrders,
    loadMessages,
    subscribeToRealtime,
  } = useRepairStore();

  // Track viewing status with heartbeat
  useEffect(() => {
    if (currentOrder) {
      // Set viewing status immediately
      setViewingStatus(currentOrder.id, true);
      
      // Send heartbeat every 30 seconds to keep "viewing" status accurate
      const heartbeatInterval = setInterval(() => {
        setViewingStatus(currentOrder.id, true);
      }, 30000);
      
      // Handle page visibility changes
      const handleVisibilityChange = () => {
        if (document.hidden) {
          setViewingStatus(currentOrder.id, false);
        } else {
          setViewingStatus(currentOrder.id, true);
        }
      };
      
      // Handle before unload (when closing tab/browser)
      const handleBeforeUnload = () => {
        setViewingStatus(currentOrder.id, false);
      };
      
      document.addEventListener('visibilitychange', handleVisibilityChange);
      window.addEventListener('beforeunload', handleBeforeUnload);
      
      // Cleanup when leaving page
      return () => {
        clearInterval(heartbeatInterval);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        window.removeEventListener('beforeunload', handleBeforeUnload);
        setViewingStatus(currentOrder.id, false);
      };
    }
  }, [currentOrder?.id, setViewingStatus]);

  // Keep currentOrder in sync with orders from store
  useEffect(() => {
    if (currentOrder) {
      const updatedOrder = orders.find(o => o.id === currentOrder.id);
      if (updatedOrder && JSON.stringify(updatedOrder) !== JSON.stringify(currentOrder)) {
        console.log('Order updated, syncing...', updatedOrder.status);
        setCurrentOrder(updatedOrder);
      }
    }
  }, [orders, currentOrder, setCurrentOrder]);

  // Load data and subscribe to realtime on mount
  useEffect(() => {
    loadOrders();
    loadMessages();
    const unsubscribe = subscribeToRealtime();
    return () => unsubscribe();
  }, []);

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

    await new Promise(resolve => setTimeout(resolve, 600));

    const order = findOrderByPhone(phone);
    if (order) {
      setCurrentOrder(order);
      setError('');
      // Show privacy modal if not accepted yet
      if (!hasAcceptedPrivacy) {
        setShowPrivacyModal(true);
      }
    } else {
      setError('לא נמצאה הזמנה עם מספר הטלפון הזה. וודאו שהמספר נכון או צרו קשר עם התמיכה.');
      setCurrentOrder(null);
    }
    
    setIsSearching(false);
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
    setCurrentOrder(null);
    navigate('/track');
  };

  const orderMessages = currentOrder 
    ? messages.filter(m => m.orderId === currentOrder.id)
    : [];

  // Phone input screen
  if (!currentOrder) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-8 px-4">
          <div className="max-w-sm mx-auto text-center mb-8 animate-slide-down">
            <img src={logo} alt="Direct Fix" className="h-14 mx-auto mb-4" />
            <p className="text-muted-foreground text-sm">מעקב אחר התיקון שלכם בזמן אמת</p>
          </div>
          <PhoneInput 
            onSubmit={handleSearch}
            isLoading={isSearching}
            error={error}
          />
        </main>
      </div>
    );
  }

  const showTechnicianTracker = currentOrder.status === 'on_the_way' && currentOrder.technicianName;
  const showAccessories = ['confirmed', 'technician_assigned', 'on_the_way'].includes(currentOrder.status);
  const showRating = currentOrder.status === 'completed';

  return (
    <div className="min-h-screen bg-background pb-28">
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
          technicianName={currentOrder.technicianName!}
          estimatedArrival={currentOrder.estimatedArrival}
          isVisible={showStickyHeader}
        />
      )}

      {/* Receipt icon sheet */}
      <OrderSummarySheet order={currentOrder} />
      
      <main className="container py-5 px-4 space-y-5 max-w-lg mx-auto">
        {/* Welcome */}
        <div className="animate-slide-down text-center pt-2 pb-3">
          <p className="text-muted-foreground text-sm">שלום,</p>
          <h1 className="text-2xl font-bold text-foreground">{currentOrder.customerName} 👋</h1>
        </div>

        {/* Rating prompt - show at top when completed */}
        {showRating && (
          <RatingPrompt 
            onRate={(rating, feedback) => setRating(currentOrder.id, rating, feedback)}
            currentRating={currentOrder.rating}
            currentFeedback={currentOrder.feedback}
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

        {/* Technician tracker */}
        {showTechnicianTracker && (
          <TechnicianTracker
            technicianName={currentOrder.technicianName!}
            estimatedArrival={currentOrder.estimatedArrival}
            customerAddress={currentOrder.customerAddress}
            wazeLink={currentOrder.wazeLink}
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
