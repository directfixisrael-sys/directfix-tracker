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
import MinimalFooter from "./components/MinimalFooter";
import ScrollToTop from "./components/ScrollToTop";
import { VisitorTracker } from "./components/VisitorTracker";
import AnnouncementBanner from "./components/AnnouncementBanner";

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
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <MinimalFooter />
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
