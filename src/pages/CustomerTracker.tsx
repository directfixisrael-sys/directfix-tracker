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
import { useRepairStore } from '@/store/repairStore';

const CustomerTracker = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const {
    currentOrder,
    setCurrentOrder,
    findOrderByPhone,
    toggleAccessory,
    setWantsPromotions,
    setRating,
    addCustomerMessage,
    messages,
  } = useRepairStore();

  // Check for phone in URL params
  useEffect(() => {
    const phone = searchParams.get('phone');
    if (phone) {
      handleSearch(phone);
    }
  }, [searchParams]);

  const handleSearch = async (phone: string) => {
    setIsSearching(true);
    setError('');

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));

    const order = findOrderByPhone(phone);
    if (order) {
      setCurrentOrder(order);
      setError('');
    } else {
      setError('לא נמצאה הזמנה עם מספר הטלפון הזה');
      setCurrentOrder(null);
    }
    
    setIsSearching(false);
  };

  const handleBack = () => {
    setCurrentOrder(null);
    navigate('/');
  };

  const orderMessages = currentOrder 
    ? messages.filter(m => m.orderId === currentOrder.id)
    : [];

  // Show phone input if no order is found
  if (!currentOrder) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-12 px-4">
          <div className="max-w-md mx-auto text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">דיירקט פיקס</h1>
            <p className="text-muted-foreground">שירות תיקון מכשירים סלולריים עד הבית</p>
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
    <div className="min-h-screen bg-background pb-24">
      <Header showBackButton onBack={handleBack} />
      
      <main className="container py-6 px-4 space-y-6">
        {/* Welcome message */}
        <div className="animate-slide-down">
          <p className="text-muted-foreground">שלום,</p>
          <h1 className="text-2xl font-bold text-foreground">{currentOrder.customerName}</h1>
        </div>

        {/* Technician tracker (when on the way) */}
        {showTechnicianTracker && (
          <TechnicianTracker
            technicianName={currentOrder.technicianName!}
            estimatedArrival={currentOrder.estimatedArrival}
            customerAddress={currentOrder.customerAddress}
          />
        )}

        {/* Status timeline */}
        <StatusTimeline 
          currentStatus={currentOrder.status}
          estimatedArrival={currentOrder.estimatedArrival}
        />

        {/* Rating prompt (when completed) */}
        {showRating && (
          <RatingPrompt 
            onRate={(rating) => setRating(currentOrder.id, rating)}
            currentRating={currentOrder.rating}
          />
        )}

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

        {/* Promotions opt-in */}
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
