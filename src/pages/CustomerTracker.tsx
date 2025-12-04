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
import { useRepairStore } from '@/store/repairStore';
import logo from '@/assets/logo.png';

const CustomerTracker = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [showStickyHeader, setShowStickyHeader] = useState(false);

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

  // Track viewing status
  useEffect(() => {
    if (currentOrder) {
      setViewingStatus(currentOrder.id, true);
      
      // Set to not viewing when leaving page
      return () => {
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
    } else {
      setError('לא נמצאה הזמנה עם מספר הטלפון הזה. וודאו שהמספר נכון או צרו קשר עם התמיכה.');
      setCurrentOrder(null);
    }
    
    setIsSearching(false);
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

        {/* Technician tracker */}
        {showTechnicianTracker && (
          <TechnicianTracker
            technicianName={currentOrder.technicianName!}
            estimatedArrival={currentOrder.estimatedArrival}
            customerAddress={currentOrder.customerAddress}
            wazeLink={currentOrder.wazeLink}
          />
        )}

        {/* Rating prompt - show at top when completed */}
        {showRating && (
          <RatingPrompt 
            onRate={(rating, feedback) => setRating(currentOrder.id, rating, feedback)}
            currentRating={currentOrder.rating}
            currentFeedback={currentOrder.feedback}
          />
        )}

        {/* Status timeline */}
        <StatusTimeline 
          currentStatus={currentOrder.status}
          estimatedArrival={currentOrder.estimatedArrival}
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
