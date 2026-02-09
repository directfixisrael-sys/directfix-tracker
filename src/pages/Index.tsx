import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Smartphone, Wrench, ChevronLeft, Star, Shield, Clock, MapPin } from 'lucide-react';
import logo from '@/assets/directfix-logo.png';

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/30 flex flex-col">
      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="text-center max-w-sm w-full">
          
          {/* Logo */}
          <div className="mb-8 animate-fade-in">
            <img 
              src={logo} 
              alt="Direct Fix Logo" 
              className="h-28 w-auto mx-auto mb-6 drop-shadow-lg"
            />
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
          </div>

          {/* Features - Minimal */}
          <div className="mt-12 grid grid-cols-3 gap-4 animate-fade-in" style={{ animationDelay: '300ms' }}>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-2">
                <MapPin className="w-5 h-5 text-primary" />
              </div>
              <p className="text-xs font-medium">מגיעים אליך</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-success/10 rounded-2xl flex items-center justify-center mx-auto mb-2">
                <Clock className="w-5 h-5 text-success" />
              </div>
              <p className="text-xs font-medium">תיקון מהיר</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center mx-auto mb-2">
                <Shield className="w-5 h-5 text-amber-500" />
              </div>
              <p className="text-xs font-medium">אחריות מלאה</p>
            </div>
          </div>

          {/* Payment Methods - Compact */}
          <div className="mt-10 animate-fade-in" style={{ animationDelay: '400ms' }}>
            <p className="text-xs text-muted-foreground mb-3">אמצעי תשלום</p>
            <div className="flex items-center justify-center gap-2">
              <div className="h-7 px-3 bg-foreground rounded flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-5 h-3 text-background" fill="currentColor">
                  <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.07-.5-2.04-.48-3.16 0-1.4.62-2.14.44-2.98-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                </svg>
              </div>
              <div className="h-7 px-3 bg-card border border-border rounded flex items-center justify-center">
                <span className="text-xs font-bold text-[#4285F4]">G</span>
                <span className="text-xs font-bold ml-0.5">Pay</span>
              </div>
              <div className="h-7 px-3 bg-sky-500 rounded flex items-center justify-center">
                <span className="text-white text-xs font-bold">bit</span>
              </div>
              <div className="h-7 px-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded flex items-center justify-center">
                <span className="text-white text-[10px] font-medium">אשראי</span>
              </div>
              <div className="h-7 px-3 bg-success rounded flex items-center justify-center">
                <span className="text-success-foreground text-xs font-bold">₪</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer - Minimal */}
      <footer className="text-center py-4 text-xs text-muted-foreground/60">
        <p>© {new Date().getFullYear()} דיירקט פיקס</p>
      </footer>
    </div>
  );
};

export default Index;
