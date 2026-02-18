import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Smartphone, Wrench, ChevronLeft, Star, Shield, Clock, MapPin } from 'lucide-react';
import Logo from '@/components/Logo';
import paymentBit from '@/assets/payment-bit.png';
import paymentPaybox from '@/assets/payment-paybox.png';
import paymentVisa from '@/assets/payment-visa.png';

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/30 flex flex-col max-w-2xl mx-auto" lang="he">
      {/* Skip to content */}
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:right-2 focus:z-50 focus:bg-primary focus:text-primary-foreground focus:px-4 focus:py-2 focus:rounded-lg">
        דלג לתוכן הראשי
      </a>
      {/* Main Content */}
      <main id="main-content" className="flex-1 flex flex-col items-center justify-center px-6 py-12" role="main" aria-label="דף הבית - דיירקט פיקס">
        <div className="text-center max-w-sm w-full">
          
          {/* Logo */}
          <div className="mb-8 animate-fade-in flex flex-col items-center">
            <Logo size="lg" clickable={false} className="mb-6" />
            <h1 className="text-3xl font-bold text-foreground tracking-tight">דיירקט פיקס</h1>
            <p className="text-muted-foreground mt-2">תיקוני סלולר מקצועיים עד הבית</p>
          </div>

          {/* Trust Indicators - Compact */}
          <div className="flex items-center justify-center gap-6 mb-10 text-sm text-muted-foreground animate-fade-in" style={{ animationDelay: '100ms' }}>
            <div className="flex items-center gap-1.5">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span className="font-medium">מידרג</span>
            </div>
            <div className="w-px h-4 bg-border" />
            <span className="font-medium">15+ שנות ניסיון</span>
          </div>

          {/* Main CTAs */}
          <div className="space-y-4 animate-fade-in" style={{ animationDelay: '200ms' }}>
            <Button 
              size="lg" 
              className="w-full h-16 text-lg font-bold rounded-2xl gap-3 shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 group bg-gradient-to-r from-primary to-primary/85"
              onClick={() => navigate('/order')}
            >
              <div className="w-10 h-10 bg-primary-foreground/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Wrench className="w-5 h-5" />
              </div>
              <span>הזמן תיקון חדש</span>
              <ChevronLeft className="w-5 h-5 opacity-60 group-hover:translate-x-[-4px] transition-transform" />
            </Button>

            <Button 
              variant="outline"
              size="lg" 
              className="w-full h-14 text-base font-semibold rounded-2xl gap-3 border-2 hover:bg-muted/50 transition-all duration-300"
              onClick={() => navigate('/track')}
            >
              <Smartphone className="w-5 h-5" />
              <span>עקוב אחר התיקון שלך</span>
            </Button>

            <Button 
              size="lg" 
              className="w-full h-14 text-base font-semibold rounded-2xl gap-3 border-2 border-primary/30 bg-primary/10 hover:bg-primary/20 text-foreground transition-all duration-300 group"
              onClick={() => navigate('/devices')}
            >
              <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <span className="text-lg">📱</span>
              </div>
              <span>קנה מכשיר חדש</span>
              <ChevronLeft className="w-4 h-4 opacity-60 group-hover:translate-x-[-4px] transition-transform" />
            </Button>
          </div>

          {/* Features - Minimal */}
          <section aria-label="יתרונות השירות" className="mt-12 grid grid-cols-3 gap-4 animate-fade-in" style={{ animationDelay: '300ms' }}>
            <div className="text-center" role="img" aria-label="מגיעים אליך - שירות עד הבית">
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-2">
                <MapPin className="w-5 h-5 text-primary" aria-hidden="true" />
              </div>
              <p className="text-xs font-medium">מגיעים אליך</p>
            </div>
            <div className="text-center" role="img" aria-label="תיקון מהיר - תוך דקות">
              <div className="w-12 h-12 bg-success/10 rounded-2xl flex items-center justify-center mx-auto mb-2">
                <Clock className="w-5 h-5 text-success" aria-hidden="true" />
              </div>
              <p className="text-xs font-medium">תיקון מהיר</p>
            </div>
            <div className="text-center" role="img" aria-label="אחריות מלאה על כל תיקון">
              <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center mx-auto mb-2">
                <Shield className="w-5 h-5 text-amber-500" aria-hidden="true" />
              </div>
              <p className="text-xs font-medium">אחריות מלאה</p>
            </div>
          </section>

          {/* Payment Methods */}
          <div className="mt-10 animate-fade-in" style={{ animationDelay: '400ms' }}>
            <p className="text-xs text-muted-foreground mb-3">אמצעי תשלום</p>
            <div className="flex items-center justify-center gap-3">
              <div className="h-10 w-14 bg-card border border-border rounded-lg flex items-center justify-center overflow-hidden p-1.5">
                <img src={paymentVisa} alt="Visa" className="h-full w-full object-contain" />
              </div>
              <div className="h-10 w-14 bg-card border border-border rounded-lg flex items-center justify-center overflow-hidden p-1.5">
                <img src={paymentBit} alt="bit" className="h-full w-full object-contain" />
              </div>
              <div className="h-10 w-14 bg-card border border-border rounded-lg flex items-center justify-center overflow-hidden p-1.5">
                <img src={paymentPaybox} alt="PayBox" className="h-full w-full object-contain rounded-md" />
              </div>
              <div className="h-10 w-14 bg-foreground rounded-lg flex items-center justify-center gap-0.5">
                <svg viewBox="0 0 24 24" className="w-4 h-4 text-background" fill="currentColor"><path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.07-.5-2.04-.48-3.16 0-1.4.62-2.14.44-2.98-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/></svg>
                <span className="text-[9px] font-semibold text-background">Pay</span>
              </div>
              <div className="h-10 w-14 bg-success rounded-lg flex items-center justify-center">
                <span className="text-success-foreground text-sm font-bold">₪</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer - Minimal */}
      <footer className="text-center py-4 text-xs text-muted-foreground/60" role="contentinfo">
        <p>© {new Date().getFullYear()} דיירקט פיקס</p>
      </footer>
    </div>
  );
};

export default Index;
