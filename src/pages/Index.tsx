import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Smartphone, Wrench, Star, Shield, Clock, MapPin, ChevronLeft } from 'lucide-react';
import Logo from '@/components/Logo';
import paymentBit from '@/assets/payment-bit.png';
import paymentPaybox from '@/assets/payment-paybox.png';
import paymentVisa from '@/assets/payment-visa.png';

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-2xl mx-auto" lang="he">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:right-2 focus:z-50 focus:bg-primary focus:text-primary-foreground focus:px-4 focus:py-2 focus:rounded-lg">
        דלג לתוכן הראשי
      </a>

      <main id="main-content" className="flex-1 flex flex-col items-center justify-center px-5 py-10" role="main" aria-label="דף הבית - דיירקט פיקס">
        <div className="text-center max-w-sm w-full">
          
          {/* Logo */}
          <div className="mb-6 animate-fade-in flex flex-col items-center">
            <Logo size="lg" clickable={false} className="mb-4" />
            <h1 className="text-2xl font-bold text-foreground">דיירקט פיקס</h1>
            <p className="text-muted-foreground text-sm mt-1">תיקוני סלולר מקצועיים עד הבית</p>
          </div>

          {/* Trust Indicators */}
          <div className="flex items-center justify-center gap-4 mb-8 text-xs text-muted-foreground animate-fade-in" style={{ animationDelay: '100ms' }}>
            <div className="flex items-center gap-1">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="w-3 h-3 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span className="font-semibold text-foreground">5.0</span>
            </div>
            <div className="w-px h-3 bg-border" />
            <span>15+ שנות ניסיון</span>
          </div>

          {/* Main CTAs */}
          <div className="space-y-3 animate-fade-in" style={{ animationDelay: '200ms' }}>
            <Button 
              size="lg" 
              className="w-full h-14 text-base font-bold rounded-xl gap-2 shadow-wolt-lg hover:shadow-wolt-xl active:scale-[0.98] transition-all duration-200"
              onClick={() => navigate('/order')}
            >
              <Wrench className="w-5 h-5" />
              הזמן תיקון
            </Button>

            <Button 
              variant="outline"
              size="lg" 
              className="w-full h-12 text-sm font-semibold rounded-xl gap-2 transition-all duration-200 hover:bg-muted"
              onClick={() => navigate('/track')}
            >
              <Smartphone className="w-4 h-4" />
              עקוב אחר התיקון שלך
            </Button>
          </div>

          {/* Features */}
          <section aria-label="יתרונות השירות" className="mt-10 grid grid-cols-3 gap-3 animate-fade-in" style={{ animationDelay: '300ms' }}>
            {[
              { icon: MapPin, label: 'מגיעים אליך', color: 'text-primary', bg: 'bg-primary/8' },
              { icon: Clock, label: 'תיקון מהיר', color: 'text-success', bg: 'bg-success/8' },
              { icon: Shield, label: 'אחריות מלאה', color: 'text-amber-500', bg: 'bg-amber-500/8' },
            ].map(({ icon: Icon, label, color, bg }) => (
              <div key={label} className="text-center p-3 rounded-xl bg-card shadow-wolt transition-shadow hover:shadow-wolt-lg">
                <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center mx-auto mb-2`}>
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <p className="text-xs font-medium">{label}</p>
              </div>
            ))}
          </section>

          {/* Payment Methods */}
          <div className="mt-8 animate-fade-in" style={{ animationDelay: '400ms' }}>
            <p className="text-xs text-muted-foreground mb-2">אמצעי תשלום</p>
            <div className="flex items-center justify-center gap-2">
              {[
                { src: paymentVisa, alt: 'Visa' },
                { src: paymentBit, alt: 'bit' },
                { src: paymentPaybox, alt: 'PayBox' },
              ].map(({ src, alt }) => (
                <div key={alt} className="h-8 w-12 bg-card rounded-lg flex items-center justify-center overflow-hidden p-1 shadow-wolt">
                  <img src={src} alt={alt} className="h-full w-full object-contain" />
                </div>
              ))}
              <div className="h-8 w-12 bg-foreground rounded-lg flex items-center justify-center gap-0.5">
                <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-background" fill="currentColor"><path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.07-.5-2.04-.48-3.16 0-1.4.62-2.14.44-2.98-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/></svg>
                <span className="text-[8px] font-semibold text-background">Pay</span>
              </div>
              <div className="h-8 w-12 bg-success rounded-lg flex items-center justify-center">
                <span className="text-success-foreground text-xs font-bold">₪</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="text-center py-4 text-xs text-muted-foreground/60" role="contentinfo">
        <p>© {new Date().getFullYear()} דיירקט פיקס</p>
      </footer>
    </div>
  );
};

export default Index;
