import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AccessibilityWidget } from "@/components/AccessibilityWidget";
import Index from "./pages/Index";
import CustomerTracker from "./pages/CustomerTracker";
import AdminPanel from "./pages/AdminPanel";
import NewRepairOrder from "./pages/NewRepairOrder";
import DevicePurchase from "./pages/DevicePurchase";
import ConsultationBooking from "./pages/ConsultationBooking";
import DataTransfer from "./pages/DataTransfer";
import NotFound from "./pages/NotFound";
import ClubTerms from "./pages/ClubTerms";
import ClubSignup from "./pages/ClubSignup";
import Unsubscribe from "./pages/Unsubscribe";
import TermsOfService from "./pages/TermsOfService";
import StorePage from "./pages/StorePage";
import StoreCategoryPage from "./pages/StoreCategoryPage";
import StoreProductPage from "./pages/StoreProductPage";
import StoreCartPage from "./pages/StoreCartPage";
import StoreCheckoutPage from "./pages/StoreCheckoutPage";
import BatteryProgram from "./pages/BatteryProgram";
import IPadRepair from "./pages/iPadRepair";
import AIAgentPage from "./pages/AIAgentPage";
import MinimalFooter from "./components/MinimalFooter";
import ScrollToTop from "./components/ScrollToTop";
import { VisitorTracker } from "./components/VisitorTracker";
import AnnouncementBanner from "./components/AnnouncementBanner";
import { VoiceAgentButton } from "./components/VoiceAgentButton";

import { captureLeadSource } from "./lib/leadSource";

// Capture lead source (UTM, gclid, fbclid, referrer) on first visit
captureLeadSource();

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <VisitorTracker />
          <Routes>
            {/* Store routes - separate layout, no main site chrome */}
            <Route path="/store" element={<StorePage />} />
            <Route path="/store/category/:slug" element={<StoreCategoryPage />} />
            <Route path="/store/product/:id" element={<StoreProductPage />} />
            <Route path="/store/cart" element={<StoreCartPage />} />
            <Route path="/store/checkout" element={<StoreCheckoutPage />} />

            {/* AI Agent - standalone page for WhatsApp sharing */}
            <Route path="/ai-agent" element={<AIAgentPage />} />

            {/* Main site routes */}
            <Route path="/*" element={
              <>
                <AccessibilityWidget showFloatingButton={false} />
                <AnnouncementBanner />
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/track" element={<CustomerTracker />} />
                  <Route path="/order" element={<NewRepairOrder />} />
                  <Route path="/devices" element={<DevicePurchase />} />
                  <Route path="/admin" element={<AdminPanel />} />
                  <Route path="/consultation" element={<ConsultationBooking />} />
                  <Route path="/data-transfer" element={<DataTransfer />} />
                  <Route path="/club-terms" element={<ClubTerms />} />
                  <Route path="/club" element={<ClubSignup />} />
                  <Route path="/unsubscribe" element={<Unsubscribe />} />
                  <Route path="/terms" element={<TermsOfService />} />
                  <Route path="/battery" element={<BatteryProgram />} />
                  <Route path="/ipad" element={<IPadRepair />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
                <MinimalFooter />
                {/* <VoiceAgentButton /> - הוסתר זמנית, נחזור להציג בהמשך */}
              </>
            } />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
