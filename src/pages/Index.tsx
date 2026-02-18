import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Smartphone, Wrench, ChevronLeft, Star, Shield, Clock, MapPin } from 'lucide-react';
import Logo from '@/components/Logo';

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

          {/* Payment Methods - Compact */}
          <div className="mt-10 animate-fade-in" style={{ animationDelay: '400ms' }}>
            <p className="text-xs text-muted-foreground mb-3">אמצעי תשלום</p>
            <div className="flex items-center justify-center gap-3">
              {/* Apple Pay */}
              <div className="h-8 px-3 bg-foreground rounded-md flex items-center justify-center gap-1">
                <svg viewBox="0 0 24 24" className="w-4 h-4 text-background" fill="currentColor"><path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.07-.5-2.04-.48-3.16 0-1.4.62-2.14.44-2.98-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/></svg>
                <span className="text-[10px] font-semibold text-background">Pay</span>
              </div>
              {/* Google Pay */}
              <div className="h-8 px-3 bg-card border border-border rounded-md flex items-center justify-center gap-0.5">
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                <span className="text-xs font-semibold text-foreground">Pay</span>
              </div>
              {/* Bit */}
              <div className="h-8 px-3 bg-[hsl(199,90%,48%)] rounded-md flex items-center justify-center">
                <span className="text-white text-xs font-bold tracking-wide">bit</span>
              </div>
              {/* Visa */}
              <div className="h-8 px-3 bg-card border border-border rounded-md flex items-center justify-center">
                <svg viewBox="0 0 48 16" className="w-8 h-4"><path d="M19.4 1l-5.8 14h-3.8L6.2 4.2C6 3.4 5.8 3.1 5.1 2.7 4 2.1 2.2 1.6.8 1.3l.1-.3h6.1c.8 0 1.5.5 1.7 1.4l1.5 8 3.7-9.4h3.5zm13.8 9.4c0-3.7-5.1-3.9-5.1-5.5 0-.5.5-1 1.5-1.2.5-.1 1.9-.1 3.5.7l.6-2.9A9.5 9.5 0 0 0 30.5.8c-3.3 0-5.6 1.7-5.6 4.2 0 1.8 1.6 2.9 2.9 3.5 1.3.6 1.7 1 1.7 1.6 0 .8-1 1.2-2 1.2-1.7 0-2.6-.5-3.4-.8l-.6 2.9c.8.4 2.2.7 3.7.7 3.5 0 5.8-1.7 5.8-4.3h.2zm8.7 4.6h3.3L42.3 1h-3.1c-.7 0-1.3.4-1.5 1l-5.4 13h3.7l.7-2h4.5l.4 2h.3zm-3.9-4.8l1.9-5.1 1.1 5.1h-3zM22 1l-2.9 14h-3.5L18.5 1H22z" fill="hsl(var(--foreground))"/></svg>
              </div>
              {/* Cash */}
              <div className="h-8 px-3 bg-success rounded-md flex items-center justify-center">
                <span className="text-success-foreground text-xs font-bold">₪</span>
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
